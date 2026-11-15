# yixnews

Official JavaScript / TypeScript SDK for the [YIX News API](https://yixnews-api.vercel.app).

## Install

```bash
npm install yixnews
```

Node.js 18+ is required (uses the built-in Fetch API).

## Quick start

```js
import { YIXNews } from "yixnews";

const yix = new YIXNews();
const result = await yix.getNews({ country: "uzbekistan", language: "uz", limit: 10 });

for (const article of result.news) {
  console.log(article.title, article.url);
}
```

## Methods

- `getNews({ category, country, language, limit, offset })` — fetch public news.
- `getCategories()` — derive available categories from the latest public news.
- `getSources()` — derive available sources from the latest public news.
- `getApiStatus()` — check the API gateway health endpoint.

Supported countries: `uzbekistan`, `usa`, `uk`, `russia`, `turkey`, `india`, `international`.
Supported languages: `uz`, `ru`, `en`, `tr`, `hi`.

## TypeScript

Type declarations are included:

```ts
import { YIXNews, type NewsQuery } from "yixnews";

const client = new YIXNews({ timeout: 15000 });
const query: NewsQuery = { category: "Technology", limit: 20 };
const response = await client.getNews(query);
```

## Options

```js
const yix = new YIXNews({
  baseUrl: "https://yixnews-api.vercel.app",
  timeout: 10000
});
```

If you need to cancel a request, pass an `AbortSignal` in the query options.

## Errors

Requests throw `YIXNewsError`, which includes `status`, `payload`, and `url` fields when available.

## Links

- Docs: https://yixnews.vercel.app/docs.html
- API: https://yixnews-api.vercel.app
- MCP: https://yixnews-mcp.vercel.app
- Source: https://github.com/javaoff364-cloud/yix-news-web

MIT License.