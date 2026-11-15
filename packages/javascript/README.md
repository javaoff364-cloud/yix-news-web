# yixnews

Official JavaScript / TypeScript SDK and command-line tool for the [YIX News API](https://yixnews-api.vercel.app).

## Requirements

- Node.js 18 or newer
- Uses the built-in Fetch API; no runtime dependencies

## Install the SDK

\`\`\`bash
npm install yixnews
\`\`\`

## JavaScript quick start

\`\`\`js
import { YIXNews } from "yixnews";

const yix = new YIXNews();
const result = await yix.getNews({
  country: "uzbekistan",
  language: "uz",
  limit: 10
});

for (const article of result.news) {
  console.log(article.title, article.link);
}
\`\`\`

The normalized article fields are \`id\`, \`title\`, \`link\`, \`summary\`, \`image\`,
\`video_url\`, \`source\`, \`category\`, \`country\`, \`language\`, and \`published_at\`.
Use \`link\` for the article URL and \`summary\` for its description.

## TypeScript

Type declarations are included:

\`\`\`ts
import {
  YIXNews,
  type NewsItem,
  type NewsQuery,
  type NewsResponse
} from "yixnews";

const client = new YIXNews({ timeout: 15000 });
const query: NewsQuery = {
  country: "uzbekistan",
  language: "uz",
  limit: 20
};

const response: NewsResponse = await client.getNews(query);
const firstArticle: NewsItem | undefined = response.news[0];

console.log(firstArticle?.title, firstArticle?.link);
\`\`\`

## Methods

- \`getNews({ category, country, language, limit, offset, signal })\` — fetch public news.
- \`getCategories(options?)\` — derive available categories from recent news.
- \`getSources(options?)\` — derive available sources from recent news.
- \`getApiStatus({ signal? })\` — check the API gateway health endpoint.

Supported countries: \`uzbekistan\`, \`usa\`, \`uk\`, \`russia\`, \`turkey\`, \`india\`, \`international\`.

Supported languages: \`uz\`, \`ru\`, \`en\`, \`tr\`, \`hi\`.

## Options and errors

\`\`\`js
const yix = new YIXNews({
  baseUrl: "https://yixnews-api.vercel.app",
  timeout: 10000
});
\`\`\`

Pass an \`AbortSignal\` in request options to cancel a request:

\`\`\`js
const controller = new AbortController();
const pending = yix.getNews({ country: "uzbekistan", signal: controller.signal });
controller.abort();
await pending;
\`\`\`

Requests throw \`YIXNewsError\`, which includes \`status\`, \`payload\`, and \`url\`.
Timeout errors and user-cancelled requests have distinct messages.

## Command-line interface

Run without installing globally:

\`\`\`bash
npx yixnews --help
npx yixnews status
npx yixnews news --country uzbekistan --language uz --limit 10
npx yixnews categories --country uzbekistan --language uz
npx yixnews sources --country uzbekistan --language uz
\`\`\`

Available commands:

| Command | Description |
| --- | --- |
| \`status\` | Show API and backend health |
| \`news\` | List recent news |
| \`categories\` | List categories found in recent news |
| \`sources\` | List sources found in recent news |
| \`--version\` | Show installed CLI version |
| \`--help\` | Show usage information |

The \`news\`, \`categories\`, and \`sources\` commands accept \`--country\`,
\`--language\`, and \`--category\`. The \`news\` command also accepts
\`--limit\` and \`--offset\`. Add \`--json\` to print raw JSON.

For a custom API origin, set \`YIXNEWS_API_URL\`:

\`\`\`bash
YIXNEWS_API_URL=https://yixnews-api.vercel.app npx yixnews status
\`\`\`

## Termux / Android

See [TERMUX.md](./TERMUX.md) for installation and troubleshooting instructions.

## Links

- Docs: https://yixnews.vercel.app/docs.html
- API: https://yixnews-api.vercel.app
- MCP: https://yixnews-mcp.vercel.app
- Source: https://github.com/javaoff364-cloud/yix-news-web

MIT License.
