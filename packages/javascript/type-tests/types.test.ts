import {
  YIXNews,
  type NewsItem,
  type NewsQuery,
  type NewsResponse,
  type YIXNewsApiStatus
} from "../src/index.js";

const client = new YIXNews({ timeout: 15000 });
const query: NewsQuery = {
  country: "uzbekistan",
  language: "uz",
  limit: 10,
  offset: 0,
  signal: new AbortController().signal
};

const responsePromise: Promise<NewsResponse> = client.getNews(query);
const categoriesPromise: Promise<string[]> = client.getCategories(query);
const sourcesPromise: Promise<string[]> = client.getSources(query);
const statusPromise: Promise<YIXNewsApiStatus> = client.getApiStatus();

const article: NewsItem = {
  id: 1,
  title: "Example",
  link: "https://example.com/news",
  summary: "Example summary",
  image: null,
  video_url: null,
  source: "Example Source",
  category: "technology",
  country: "uzbekistan",
  language: "uz",
  published_at: "2026-11-15T08:00:00"
};

console.log(
  responsePromise,
  categoriesPromise,
  sourcesPromise,
  statusPromise,
  article.link,
  article.summary
);

// The old, incorrect property names must not type-check.
// @ts-expect-error use link, not url
article.url;
// @ts-expect-error use summary, not description
article.description;

// @ts-expect-error country is a documented union
const invalidCountry: NewsQuery = { country: "mars" };

void invalidCountry;
