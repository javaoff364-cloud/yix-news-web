"use client";

import { useState } from "react";

const endpoint = "https://yixnews-mcp.vercel.app/api/mcp";
const sample = JSON.stringify({ category: "technology", country: "uzbekistan", language: "uz", limit: 10, offset: 0 }, null, 2);

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }
  return <button className="copy" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button>;
}

export default function Home() {
  return (
    <main className="shell">
      <nav className="nav">
        <a className="brand" href="https://yixnews.vercel.app">YIX<span>NEWS</span></a>
        <div><a href="https://yixnews.vercel.app/docs.html">Docs</a><a href="https://yixnews-api.vercel.app">REST API</a></div>
      </nav>
      <section className="hero">
        <div className="eyebrow">MODEL CONTEXT PROTOCOL · STREAMABLE HTTP</div>
        <h1>News for your <em>AI.</em></h1>
        <p>YIX News MCP serveri AI yordamchilarga yangiliklarni qidirish, kategoriyalar va manbalarni ko‘rish imkonini beradi.</p>
        <div className="heroActions"><a className="primary" href="#connect">Ulashni boshlash ↓</a><a className="secondary" href="https://yixnews.vercel.app/docs.html#mcp">MCP qo‘llanmasi ↗</a></div>
        <div className="orb orbOne"/><div className="orb orbTwo"/>
      </section>
      <section className="glass" id="connect">
        <div className="sectionHead"><div><div className="eyebrow">REMOTE SERVER</div><h2>Server endpoint</h2></div><span className="badge">Streamable HTTP</span></div>
        <div className="endpoint"><code>{endpoint}</code><CopyButton value={endpoint}/></div>
        <p className="muted">MCP klientingizda remote server qo‘shing, transport sifatida <b>Streamable HTTP</b> tanlang va endpoint URL’ni kiriting. Bu server stdio transportidan foydalanmaydi.</p>
      </section>
      <section className="tools">
        <div className="eyebrow">AVAILABLE TOOLS</div><h2>YIX News tools</h2>
        <div className="toolGrid">
          <article className="tool"><span>01</span><h3>get_news</h3><p>Kategoriya, mamlakat, til va pagination orqali yangiliklarni oling.</p><small>category · country · language · limit · offset</small></article>
          <article className="tool"><span>02</span><h3>list_categories</h3><p>YIX News’da mavjud yangilik kategoriyalarini ko‘ring.</p><small>No arguments</small></article>
          <article className="tool"><span>03</span><h3>list_sources</h3><p>Yangiliklar oqimida uchrayotgan manbalar ro‘yxatini oling.</p><small>limit</small></article>
          <article className="tool"><span>04</span><h3>get_api_status</h3><p>API gateway holatini va xizmat javobini tekshiring.</p><small>No arguments</small></article>
        </div>
      </section>
      <section className="glass example">
        <div className="eyebrow">EXAMPLE · GET_NEWS</div><div className="sectionHead"><h2>Tool arguments</h2><CopyButton value={sample}/></div>
        <pre>{sample}</pre>
        <p className="muted">limit: 1–100 · offset: 0 yoki katta. Raqamlar JSON number sifatida yuboriladi; raqam ko‘rinishidagi stringlar ham qabul qilinadi.</p>
      </section>
      <section className="glass connectInfo">
        <div className="eyebrow">INTEGRATION</div><h2>Qanday ulash mumkin?</h2>
        <ol><li>MCP qo‘llaydigan AI klientni oching.</li><li>Remote MCP server yaratish yoki qo‘shishni tanlang.</li><li>Transport: Streamable HTTP.</li><li>Yuqoridagi URL’ni kiriting va tool’larni yuklang.</li></ol>
        <p className="muted">MCP Inspector orqali sinash: <code>npx @modelcontextprotocol/inspector</code> buyrug‘ini ishga tushiring va remote server URL’ni kiriting.</p>
        <div className="links"><a href="https://yixnews.vercel.app/docs.html">To‘liq dokumentatsiya ↗</a><a href="https://yixnews-api.vercel.app">REST API ↗</a><a href="https://github.com/javaoff364-cloud/yix-news-web">GitHub ↗</a></div>
      </section>
      <footer>© 2026 YIX News · Built for AI agents</footer>
    </main>
  );
}