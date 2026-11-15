const DEFAULT_BASE_URL = "https://yixnews-api.vercel.app";

export class YIXNewsError extends Error {
  constructor(message, { status = 0, payload = null, url = "" } = {}) {
    super(message);
    this.name = "YIXNewsError";
    this.status = status;
    this.payload = payload;
    this.url = url;
  }
}

export class YIXNews {
  constructor({ baseUrl = DEFAULT_BASE_URL, apiKey, timeout = 10000, fetchImpl = globalThis.fetch } = {}) {
    if (typeof fetchImpl !== "function") throw new TypeError("A Fetch-compatible implementation is required.");
    this.baseUrl = String(baseUrl).replace(/\/+$/, "");
    this.apiKey = apiKey;
    this.timeout = timeout;
    this.fetch = fetchImpl;
  }

  async request(path, { query, headers = {}, signal } = {}) {
    const url = new URL(`${this.baseUrl}/api/${String(path).replace(/^\/+/, "")}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    try {
      const response = await this.fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
          ...headers
        },
        signal: controller.signal
      });
      const contentType = response.headers?.get?.("content-type") || "";
      const payload = contentType.includes("json") ? await response.json() : await response.text();
      if (!response.ok || (payload && typeof payload === "object" && payload.success === false)) {
        const message = payload?.error || payload?.message || `YIX News API request failed (${response.status})`;
        throw new YIXNewsError(message, { status: response.status, payload, url: url.toString() });
      }
      return payload;
    } catch (error) {
      if (error instanceof YIXNewsError) throw error;
      throw new YIXNewsError(error.name === "AbortError" ? "YIX News API request timed out." : error.message, { url: url.toString() });
    } finally {
      clearTimeout(timer);
    }
  }

  getNews({ category, country, language, limit = 50, offset = 0, signal } = {}) {
    return this.request("site-news", { query: { category, country, language, limit, offset }, signal });
  }

  async getCategories(options = {}) {
    const result = await this.getNews({ limit: 100, ...options });
    const items = Array.isArray(result.news) ? result.news : [];
    return [...new Set(items.map(item => item.category).filter(Boolean))].sort();
  }

  async getSources(options = {}) {
    const result = await this.getNews({ limit: 100, ...options });
    const items = Array.isArray(result.news) ? result.news : [];
    return [...new Set(items.map(item => item.source).filter(Boolean))].sort();
  }

  getApiStatus({ signal } = {}) {
    return this.request("health", { signal });
  }
}

export default YIXNews;