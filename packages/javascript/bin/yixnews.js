#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { YIXNews } from "../src/index.js";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
);

const HELP = `YIX News CLI v${packageJson.version}

Usage:
  npx yixnews <command> [options]

Commands:
  status       Check API and backend health
  news         List recent news
  categories   List categories found in recent news
  sources      List sources found in recent news
  --version    Print CLI version
  --help       Show this help

Options:
  --country <name>    Country filter (example: uzbekistan)
  --language <code>   Language filter (example: uz)
  --category <name>   Category filter
  --limit <number>    Number of articles (default: 10)
  --offset <number>   Pagination offset (default: 0)
  --json              Print raw JSON output

Examples:
  npx yixnews status
  npx yixnews news --country uzbekistan --language uz --limit 5
  npx yixnews categories --country uzbekistan
  npx yixnews sources --language uz
`;

function parseOptions(args) {
  const options = {};
  const valueFlags = new Set([
    "--country",
    "--language",
    "--category",
    "--limit",
    "--offset"
  ]);

  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];

    if (flag === "--json") {
      options.json = true;
      continue;
    }

    if (!valueFlags.has(flag)) {
      throw new Error(`Unknown option: ${flag}`);
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${flag}`);
    }

    options[flag.slice(2)] = value;
    index += 1;
  }

  for (const key of ["limit", "offset"]) {
    if (options[key] !== undefined) {
      const number = Number(options[key]);
      if (!Number.isInteger(number) || number < (key === "limit" ? 1 : 0)) {
        throw new Error(`--${key} must be a valid integer.`);
      }
      options[key] = number;
    }
  }

  return options;
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function printNews(items) {
  if (!items.length) {
    console.log("No news found.");
    return;
  }

  items.forEach((article, index) => {
    console.log(`\n${index + 1}. ${article.title || "Untitled"}`);
    if (article.summary) console.log(`   ${article.summary}`);
    if (article.source) console.log(`   Source: ${article.source}`);
    if (article.published_at) console.log(`   Published: ${article.published_at}`);
    if (article.link) console.log(`   Link: ${article.link}`);
  });
}

async function main() {
  const [command = "help", ...args] = process.argv.slice(2);

  if (command === "--help" || command === "help" || command === "-h") {
    console.log(HELP);
    return;
  }

  if (command === "--version" || command === "version" || command === "-v") {
    console.log(packageJson.version);
    return;
  }

  const supported = new Set(["status", "news", "categories", "sources"]);
  if (!supported.has(command)) {
    throw new Error(`Unknown command: ${command}. Run "npx yixnews --help".`);
  }

  const options = parseOptions(args);
  const client = new YIXNews({
    baseUrl: process.env.YIXNEWS_API_URL || undefined,
    timeout: Number(process.env.YIXNEWS_TIMEOUT || 10000)
  });

  if (command === "status") {
    const result = await client.getApiStatus();
    if (options.json) printJson(result);
    else {
      console.log(`Service: ${result.service || "YIX News API"}`);
      console.log(`Status: ${result.status || "unknown"}`);
      if (result.backend) {
        console.log(`Backend: ${result.backend.status || "unknown"}`);
        if (result.backend.http_status !== undefined) {
          console.log(`HTTP: ${result.backend.http_status}`);
        }
      }
      if (result.checked_at) console.log(`Checked: ${result.checked_at}`);
    }
    return;
  }

  const filters = {
    country: options.country,
    language: options.language,
    category: options.category
  };

  if (command === "news") {
    const result = await client.getNews({
      ...filters,
      limit: options.limit ?? 10,
      offset: options.offset ?? 0
    });
    if (options.json) printJson(result);
    else printNews(Array.isArray(result.news) ? result.news : []);
    return;
  }

  if (command === "categories") {
    const result = await client.getCategories(filters);
    if (options.json) printJson(result);
    else result.forEach((item) => console.log(item));
    return;
  }

  const result = await client.getSources(filters);
  if (options.json) printJson(result);
  else result.forEach((item) => console.log(item));
}

main().catch((error) => {
  console.error(`yixnews: ${error.message}`);
  process.exitCode = 1;
});
