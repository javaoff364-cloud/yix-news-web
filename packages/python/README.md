# yixnews

Official Python SDK for the [YIX News API](https://yixnews-api.vercel.app).

## Install

```bash
python -m pip install yixnews
```

Python 3.9+; no runtime dependencies.

## Quick start

```python
from yixnews import YIXNews

client = YIXNews()
response = client.get_news(country="uzbekistan", language="uz", limit=10)

for article in response["news"]:
    print(article.get("title"), article.get("url"))
```

## Methods

- `get_news(category=None, country=None, language=None, limit=50, offset=0)`
- `get_categories(country=None, language=None)`
- `get_sources(country=None, language=None)`
- `get_api_status()`

Supported countries: `uzbekistan`, `usa`, `uk`, `russia`, `turkey`, `india`, `international`.
Supported languages: `uz`, `ru`, `en`, `tr`, `hi`.

## Custom configuration

```python
client = YIXNews(
    base_url="https://yixnews-api.vercel.app",
    timeout=15.0,
)
```

Errors are raised as `YIXNewsError` and include `status`, `payload`, and `url` attributes.

## Links

- Docs: https://yixnews.vercel.app/docs.html
- API: https://yixnews-api.vercel.app
- MCP: https://yixnews-mcp.vercel.app
- Source: https://github.com/javaoff364-cloud/yix-news-web

MIT License.