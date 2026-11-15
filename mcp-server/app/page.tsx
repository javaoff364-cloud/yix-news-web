export default function Home() {
  return <main className="wrap"><section className="glass">
    <p className="eyebrow">YIX NEWS · AI CONNECTORS</p>
    <h1>YIX News MCP</h1>
    <p>AI agentlar uchun yangiliklar vositalari. MCP Streamable HTTP orqali ishlaydi.</p>
    <div className="endpoint"><span>Endpoint</span><code>https://yixnews-mcp.vercel.app/api/mcp</code></div>
    <h2>Mavjud vositalar</h2>
    <ul><li><b>get_news</b> — mamlakat, til va kategoriya bo‘yicha yangiliklarni olish</li><li><b>list_categories</b> — mavjud kategoriyalar ro‘yxati</li><li><b>list_sources</b> — faol yangilik manbalarini ko‘rish</li></ul>
    <p className="muted">API: <a href="https://yixnews-api.vercel.app">yixnews-api.vercel.app</a></p>
  </section></main>;
}
