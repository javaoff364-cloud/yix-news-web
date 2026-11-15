import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const cliPath = fileURLToPath(new URL("../bin/yixnews.js", import.meta.url));

function runCli(args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", (code) => resolve({ code, stdout, stderr }));
  });
}

async function withApi(handler, callback) {
  const server = createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

test("CLI help and version work without network access", async () => {
  const help = await runCli(["--help"]);
  assert.equal(help.code, 0);
  assert.match(help.stdout, /YIX News CLI/);
  assert.match(help.stdout, /status/);

  const version = await runCli(["--version"]);
  assert.equal(version.code, 0);
  assert.equal(version.stdout.trim(), "1.0.1");
});

test("CLI status command displays API health", async () => {
  await withApi((request, response) => {
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({
      service: "YIX News API Gateway",
      status: "ok",
      backend: { status: "ok", http_status: 200 }
    }));
  }, async (baseUrl) => {
    const result = await runCli(["status"], { YIXNEWS_API_URL: baseUrl });
    assert.equal(result.code, 0, result.stderr);
    assert.match(result.stdout, /Status: ok/);
    assert.match(result.stdout, /HTTP: 200/);
  });
});

test("CLI news command prints article title and link", async () => {
  await withApi((request, response) => {
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({
      news: [{
        id: 1,
        title: "CLI sample",
        link: "https://example.com/cli",
        summary: "CLI summary",
        source: "Test Source",
        published_at: "2026-11-15T08:00:00"
      }]
    }));
  }, async (baseUrl) => {
    const result = await runCli(
      ["news", "--country", "uzbekistan", "--language", "uz", "--limit", "1"],
      { YIXNEWS_API_URL: baseUrl }
    );
    assert.equal(result.code, 0, result.stderr);
    assert.match(result.stdout, /CLI sample/);
    assert.match(result.stdout, /https:\/\/example\.com\/cli/);
  });
});

test("CLI reports invalid commands and options", async () => {
  const command = await runCli(["not-a-command"]);
  assert.equal(command.code, 1);
  assert.match(command.stderr, /Unknown command/);

  const option = await runCli(["news", "--limit"]);
  assert.equal(option.code, 1);
  assert.match(option.stderr, /Missing value/);
});
