const UPSTREAM = process.env.YIXNEWS_BACKEND_URL || "https://yix-news.onrender.com";
const ALLOWED_ORIGINS = new Set([
  "https://yixnews.vercel.app",
  "https://yix-news-web.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Session-Token");
  res.setHeader("Access-Control-Max-Age", "86400");
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const incoming = new URL(req.url || "/", "https://yixnews-api.vercel.app");
    const route = incoming.pathname.replace(/^\/api(?=\/|$)/, "") || "/";
    const upstreamPath = route === "/health" ? "/health" : `/api${route}`;
    const target = new URL(upstreamPath + incoming.search, UPSTREAM);

    const headers = new Headers();
    for (const name of ["accept", "content-type", "authorization", "x-session-token"]) {
      const value = req.headers[name];
      if (typeof value === "string") headers.set(name, value);
    }
    headers.set("user-agent", "YIXNews-API-Gateway/1.0");

    const body = req.method === "POST" ? await readBody(req) : undefined;
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      signal: AbortSignal.timeout(25000),
    });

    const responseHeaders = [
      "content-type",
      "cache-control",
      "etag",
      "last-modified",
      "retry-after",
    ];
    for (const name of responseHeaders) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    res.statusCode = upstream.status;
    const payload = Buffer.from(await upstream.arrayBuffer());
    return res.end(payload);
  } catch (error) {
    console.error("YIX API proxy error:", error);
    return res.status(502).json({
      success: false,
      error: "News backend temporarily unavailable",
    });
  }
}
