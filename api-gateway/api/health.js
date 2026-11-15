export default function handler(_req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    service: "YIX News API Gateway",
    status: "ok",
    backend: process.env.YIXNEWS_BACKEND_URL || "https://yix-news.onrender.com",
    endpoints: ["/api/site-news", "/api/news", "/api/auth/start", "/api/session/me", "/api/media"],
  });
}
