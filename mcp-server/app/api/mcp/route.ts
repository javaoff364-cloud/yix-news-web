import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const API_BASE = process.env.YIXNEWS_API_URL || "https://yix-news.onrender.com";
const categories = [
  "uzbekistan", "world", "technology", "economy", "science",
  "sport", "gaming", "cinema"
] as const;
const countries = [
  "uzbekistan", "usa", "uk", "russia", "turkey", "india", "international"
] as const;
const languages = ["uz", "ru", "en", "tr", "hi"] as const;

async function fetchNews(params: URLSearchParams) {
  const response = await fetch(`${API_BASE}/api/site-news?${params.toString()}`, {
    headers: { "User-Agent": "YIXNews-MCP/1.0" },
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`YIX News API returned HTTP ${response.status}`);
  return response.json() as Promise<{ success: boolean; count: number; news: Array<Record<string, unknown>> }>;
}

const handler = createMcpHandler((server) => {
  server.registerTool(
    "get_news",
    {
      description: "YIX News oqimidan yangiliklarni kategoriya, mamlakat va til bo‘yicha olish.",
      inputSchema: z.object({
        category: z.enum(categories).optional(),
        country: z.enum(countries).optional(),
        language: z.enum(languages).optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }),
    },
    async ({ category, country, language, limit, offset }) => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (category) params.set("category", category);
      if (country) params.set("country", country);
      if (language) params.set("language", language);
      try {
        const data = await fetchNews(params);
        return {
          content: [{ type: "text", text: JSON.stringify({ count: data.count, news: data.news }, null, 2) }],
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: error instanceof Error ? error.message : "YIX News API error" }],
        };
      }
    },
  );

  server.registerTool(
    "list_categories",
    {
      description: "YIX News saytida mavjud yangilik kategoriyalarini ko‘rsatish.",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [{ type: "text", text: JSON.stringify(categories) }],
    }),
  );

  server.registerTool(
    "list_sources",
    {
      description: "YIX News oqimida hozir uchrayotgan yangilik manbalari ro‘yxatini olish.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(100),
      }),
    },
    async ({ limit }) => {
      try {
        const data = await fetchNews(new URLSearchParams({ limit: String(limit), offset: "0" }));
        const sources = [...new Set(data.news.map((item) => String(item.source || "")).filter(Boolean))].sort();
        return { content: [{ type: "text", text: JSON.stringify(sources, null, 2) }] };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: error instanceof Error ? error.message : "YIX News API error" }],
        };
      }
    },
  );
});

export { handler as GET, handler as POST, handler as DELETE };
