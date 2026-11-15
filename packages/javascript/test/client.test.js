import test from "node:test";
import assert from "node:assert/strict";
import { YIXNews, YIXNewsError } from "../src/index.js";

test("getNews builds query parameters and parses JSON", async () => {
  let requested;
  const client = new YIXNews({
    fetchImpl: async (url) => {
      requested = new URL(url);
      return new Response(JSON.stringify({ success: true, count: 1, news: [{ title: "Test" }] }), {
        status: 200, headers: { "content-type": "application/json" }
      });
    }
  });
  const result = await client.getNews({ country: "uzbekistan", limit: 10 });
  assert.equal(requested.pathname, "/api/site-news");
  assert.equal(requested.searchParams.get("country"), "uzbekistan");
  assert.equal(result.news[0].title, "Test");
});

test("API errors are exposed as YIXNewsError", async () => {
  const client = new YIXNews({
    fetchImpl: async () => new Response(JSON.stringify({ success: false, error: "Bad query" }), {
      status: 400, headers: { "content-type": "application/json" }
    })
  });
  await assert.rejects(client.getNews(), error => error instanceof YIXNewsError && error.message === "Bad query");
});

test("getCategories and getSources return unique sorted values", async () => {
  const client = new YIXNews({ fetchImpl: async () => new Response(JSON.stringify({
    success: true, news: [
      { category: "Tech", source: "B" }, { category: "World", source: "A" }, { category: "Tech", source: "A" }
    ]
  }), { status: 200, headers: { "content-type": "application/json" } }) });
  assert.deepEqual(await client.getCategories(), ["Tech", "World"]);
  assert.deepEqual(await client.getSources(), ["A", "B"]);
});