export interface YIXNewsOptions {
  /** API origin, without the /api path. */
  baseUrl?: string;
  /** Optional YIX API key for protected endpoints (Bearer auth). */
  apiKey?: string;
  /** Request timeout in milliseconds. */
  timeout?: number;
  /** Fetch-compatible implementation. Defaults to globalThis.fetch. */
  fetchImpl?: typeof fetch;
}
export interface NewsQuery {
  category?: string;
  country?: "uzbekistan" | "usa" | "uk" | "russia" | "turkey" | "india" | "international";
  language?: "uz" | "ru" | "en" | "tr" | "hi";
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}
export interface NewsItem {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  source?: string;
  category?: string;
  published_at?: string;
  [key: string]: unknown;
}
export interface NewsResponse {
  success: boolean;
  count: number;
  news: NewsItem[];
  [key: string]: unknown;
}
export class YIXNewsError extends Error {
  status: number;
  payload: unknown;
  url: string;
}
export class YIXNews {
  constructor(options?: YIXNewsOptions);
  getNews(options?: NewsQuery): Promise<NewsResponse>;
  getCategories(options?: Omit<NewsQuery, "limit" | "offset">): Promise<string[]>;
  getSources(options?: Omit<NewsQuery, "limit" | "offset">): Promise<string[]>;
  getApiStatus(options?: { signal?: AbortSignal }): Promise<Record<string, unknown>>;
}
export default YIXNews;