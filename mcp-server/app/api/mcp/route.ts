import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const API_BASE = (process.env.YIXNEWS_API_URL || "https://yixnews-api.vercel.app").replace(/\/$/, "");
const categories = ["uzbekistan", "world", "technology", "economy", "science", "sport", "gaming", "cinema"] as const;
const countries = ["uzbekistan", "usa", "uk", "russia", "turkey", "india", "international"] as const;
const languages = ["uz", "ru", "en", "tr", "hi"] as const;

// Some MCP clients serialize numeric form fields as strings. Accept both
// representations but normalize them to numbers before calling the API.
const intParam = (min: number, max?: number) => z.union([
  z.number().int().min(min).max(max ?? Number.MAX_SAFE_INTEGER),
  z.string().regex(/^\d+$/, "Faqat butun son kiriting").transform(Number).pipe(
    z.number().int().min(min).max(max ?? Number.MAX_SAFE_INTEGER)
  ),
]);

async function apiFetch(path: string) {
  const response = await fetch(API_BASE + path, {
    headers: { "User-Agent": "YIXNews-MCP/1.1", "Accept": "application/json" },
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("YIX News API HTTP " + response.status);
  return response.json() as Promise<Record<string, any>>;
}

const handler = createMcpHandler((server) => {
  server.registerTool("get_news", {
    description: "YIX News yangiliklarini kategoriya, mamlakat va til bo‘yicha olish. limit 1–100, offset 0 yoki katta.",
    inputSchema: z.object({
      category: z.enum(categories).optional().describe("Yangilik kategoriyasi"),
      country: z.enum(countries).optional().describe("Mamlakat filtri"),
      language: z.enum(languages).optional().describe("Yangilik tili"),
      limit: intParam(1, 100).default(20).describe("Qaytariladigan yangiliklar soni (1–100)"),
      offset: intParam(0).default(0).describe("Sahifalash boshlanish indeksi (0 dan)"),
    }),
  }, async ({ category, country, language, limit, offset }) => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (category) params.set("category", category);
    if (country) params.set("country", country);
    if (language) params.set("language", language);
    try {
      const data = await apiFetch("/api/site-news?" + params.toString());
      return { content: [{ type: "text", text: JSON.stringify({
        success: data.success, count: data.count, limit, offset, news: data.news ?? []
      }, null, 2) }] };
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : "YIX News API error" }] };
    }
  });

  server.registerTool("list_categories", {
    description: "YIX News’da mavjud yangilik kategoriyalarini ko‘rsatish.",
    inputSchema: z.object({}),
  }, async () => ({ content: [{ type: "text", text: JSON.stringify(categories, null, 2) }] }));

  server.registerTool("list_sources", {
    description: "YIX News oqimining birinchi sahifasida uchrayotgan manbalarni ko‘rsatish.",
    inputSchema: z.object({ limit: intParam(1, 100).default(100).describe("Tekshiriladigan yangiliklar soni (1–100)") }),
  }, async ({ limit }) => {
    try {
      const data = await apiFetch("/api/site-news?limit=" + limit + "&offset=0");
      const sources = [...new Set((data.news ?? []).map((item: Record<string, unknown>) => String(item.source || "")).filter(Boolean))].sort();
      return { content: [{ type: "text", text: JSON.stringify({ count: sources.length, sources }, null, 2) }] };
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : "YIX News API error" }] };
    }
  });

  server.registerTool("get_api_status", {
    description: "YIX News API gateway holatini tekshirish.",
    inputSchema: z.object({}),
  }, async () => {
    try {
      const status = await apiFetch("/api/health");
      return { content: [{ type: "text", text: JSON.stringify(status, null, 2) }] };
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : "YIX News API unavailable" }] };
    }
  });
});

export { handler as GET, handler as POST, handler as DELETE };
