const UPSTREAM = process.env.YIXNEWS_BACKEND_URL || "https://yix-news.onrender.com";

export default async function handler(_req, res) {
  res.setHeader("Cache-Control", "no-store");
  const checkedAt = new Date().toISOString();
  try {
    const upstream = await fetch(UPSTREAM + "/health", {
      headers: { "User-Agent": "YIXNews-Health/1.0" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    const payload = {
      service: "YIX News API Gateway",
      status: upstream.ok ? "ok" : "degraded",
      backend: { status: upstream.ok ? "ok" : "unhealthy", http_status: upstream.status },
      checked_at: checkedAt,
      endpoints: ["/api/site-news", "/api/news", "/api/auth/start", "/api/session/me", "/api/media"],
    };
    return res.status(upstream.ok ? 200 : 503).json(payload);
  } catch (error) {
    return res.status(503).json({
      service: "YIX News API Gateway",
      status: "degraded",
      backend: { status: "unreachable" },
      checked_at: checkedAt,
      error: error instanceof Error ? error.message : "Backend health check failed",
    });
  }
}
