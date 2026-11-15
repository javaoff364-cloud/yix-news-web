export type NewsCountry =
  | "uzbekistan"
  | "usa"
  | "uk"
  | "russia"
  | "turkey"
  | "india"
  | "international";

export type NewsLanguage = "uz" | "ru" | "en" | "tr" | "hi";

export interface YIXNewsOptions {
  /** API origin, without the /api path. */
  baseUrl?: string;
  /** Optional API key sent as a Bearer token. */
  apiKey?: string;
  /** Request timeout in milliseconds. Defaults to 10000. */
  timeout?: number;
  /** Fetch-compatible implementation. Defaults to globalThis.fetch. */
  fetchImpl?: typeof fetch;
}

export interface NewsQuery {
  category?: string;
  country?: NewsCountry;
  language?: NewsLanguage;
  limit?: number;
  offset?: number;
  /** Cancel this request using an AbortController. */
  signal?: AbortSignal;
}

/** One normalized article returned by the YIX News API. */
export interface NewsItem {
  id: number;
  title: string;
  link: string;
  summary: string;
  image: string | null;
  video_url: string | null;
  source: string;
  category: string;
  country: string;
  language: string;
  published_at: string;
}

export interface NewsResponse {
  success?: boolean;
  count?: number;
  news: NewsItem[];
  [key: string]: unknown;
}

export interface YIXNewsApiStatus {
  service: string;
  status: string;
  backend?: {
    status?: string;
    http_status?: number;
  };
  checked_at?: string;
  endpoints?: string[];
  [key: string]: unknown;
}

export class YIXNewsError extends Error {
  /** HTTP status, or 0 when no HTTP response was received. */
  status: number;
  /** Parsed API response body, when available. */
  payload: unknown;
  /** Full request URL. */
  url: string;
}

export class YIXNews {
  constructor(options?: YIXNewsOptions);
  request(
    path: string,
    options?: {
      query?: Record<string, string | number | boolean | null | undefined>;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    }
  ): Promise<unknown>;
  getNews(options?: NewsQuery): Promise<NewsResponse>;
  getCategories(options?: Omit<NewsQuery, "limit" | "offset">): Promise<string[]>;
  getSources(options?: Omit<NewsQuery, "limit" | "offset">): Promise<string[]>;
  getApiStatus(options?: { signal?: AbortSignal }): Promise<YIXNewsApiStatus>;
}

export default YIXNews;
