import test from "node:test";
import assert from "node:assert/strict";
import { YIXNews, YIXNewsError } from "../src/index.js";

const sampleNews = {
  success: true,
  count: 1,
  news: [{
    id: 101,
    title: "YIX test article",
    link: "https://example.com/article",
    summary: "Test summary",
    image: null,
    video_url: null,
    source: "Test Source",
    category: "technology",
    country: "uzbekistan",
    language: "uz",
    published_at: "2026-11-15T08:00:00"
  }]
};

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" }
  });
}

test("getNews returns normalized news fields and query parameters", async () => {
  let requestedUrl;
  const client = new YIXNews({
    fetchImpl: async (url) => {
      requestedUrl = new URL(url);
      return jsonResponse(sampleNews);
    }
  });

  const result = await client.getNews({
    country: "uzbekistan",
    language: "uz",
    limit: 5
  });

  assert.equal(result.news[0].link, "https://example.com/article");
  assert.equal(result.news[0].summary, "Test summary");
  assert.equal(requestedUrl.pathname, "/api/site-news");
  assert.equal(requestedUrl.searchParams.get("country"), "uzbekistan");
  assert.equal(requestedUrl.searchParams.get("limit"), "5");
});

test("getCategories and getSources derive unique sorted values", async () => {
  const payload = {
    news: [
      { category: "world", source: "Beta" },
      { category: "technology", source: "Alpha" },
      { category: "world", source: "Beta" }
    ]
  };
  const client = new YIXNews({
    fetchImpl: async () => jsonResponse(payload)
  });

  assert.deepEqual(await client.getCategories(), ["technology", "world"]);
  assert.deepEqual(await client.getSources(), ["Alpha", "Beta"]);
});

test("getApiStatus returns gateway health", async () => {
  const client = new YIXNews({
    fetchImpl: async (url) => {
      assert.equal(new URL(url).pathname, "/api/health");
      return jsonResponse({ status: "ok", backend: { http_status: 200 } });
    }
  });

  assert.equal((await client.getApiStatus()).status, "ok");
});

test("API errors expose status, payload and URL", async () => {
  const client = new YIXNews({
    fetchImpl: async () => jsonResponse({ error: "Unavailable" }, 503)
  });

  await assert.rejects(
    client.getNews(),
    (error) => {
      assert.ok(error instanceof YIXNewsError);
      assert.equal(error.status, 503);
      assert.equal(error.payload.error, "Unavailable");
      assert.match(error.url, /\/api\/site-news(?:\?|$)/);
      return true;
    }
  );
});

test("timeout errors are distinct from user cancellation", async () => {
  const client = new YIXNews({
    timeout: 10,
    fetchImpl: (_url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => {
        const error = new Error("Aborted");
        error.name = "AbortError";
        reject(error);
      }, { once: true });
    })
  });

  await assert.rejects(client.getNews(), /request timed out/i);
});

test("AbortSignal cancellation has a distinct error", async () => {
  const controller = new AbortController();
  const client = new YIXNews({
    timeout: 1000,
    fetchImpl: (_url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => {
        const error = new Error("Aborted");
        error.name = "AbortError";
        reject(error);
      }, { once: true });
    })
  });

  const pending = client.getNews({ signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, /request was aborted/i);
});

test("already-aborted signals do not start a request", async () => {
  const controller = new AbortController();
  controller.abort();
  let called = false;
  const client = new YIXNews({
    fetchImpl: async () => {
      called = true;
      return jsonResponse(sampleNews);
    }
  });

  await assert.rejects(
    client.getNews({ signal: controller.signal }),
    /request was aborted/i
  );
  assert.equal(called, false);
});

test("constructor rejects invalid timeout values", () => {
  assert.throws(() => new YIXNews({ timeout: 0 }), /positive finite number/);
  assert.throws(() => new YIXNews({ timeout: Number.NaN }), /positive finite number/);
});
