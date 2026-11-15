"""Small dependency-free client for the public YIX News API."""
from __future__ import annotations

import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class YIXNewsError(Exception):
    """Raised when the YIX News API returns an error."""

    def __init__(self, message: str, status: int = 0, payload=None, url: str = ""):
        super().__init__(message)
        self.status = status
        self.payload = payload
        self.url = url


class YIXNews:
    """YIX News API client.

    Args:
        base_url: API origin, without the /api path.
        api_key: Optional bearer API key.
        timeout: Request timeout in seconds.
    """

    def __init__(self, base_url: str = "https://yixnews-api.vercel.app",
                 api_key: str | None = None, timeout: float = 10.0):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout

    def _request(self, endpoint: str, params=None):
        query = urlencode({k: v for k, v in (params or {}).items() if v is not None})
        url = f"{self.base_url}/api/{endpoint.lstrip('/')}"
        if query:
            url += f"?{query}"
        headers = {"Accept": "application/json", "User-Agent": "yixnews-python/1.0.0"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        request = Request(url, headers=headers)
        try:
            with urlopen(request, timeout=self.timeout) as response:
                payload = json.loads(response.read().decode("utf-8"))
                if isinstance(payload, dict) and payload.get("success") is False:
                    raise YIXNewsError(payload.get("error", "YIX News API error"),
                                       response.status, payload, url)
                return payload
        except HTTPError as exc:
            try:
                payload = json.loads(exc.read().decode("utf-8"))
            except (ValueError, UnicodeDecodeError):
                payload = None
            message = payload.get("error", str(exc)) if isinstance(payload, dict) else str(exc)
            raise YIXNewsError(message, exc.code, payload, url) from exc
        except (URLError, TimeoutError, OSError) as exc:
            raise YIXNewsError(str(exc), url=url) from exc

    def get_news(self, category=None, country=None, language=None, limit=50, offset=0):
        """Fetch public news with optional filters and pagination."""
        return self._request("site-news", {
            "category": category, "country": country, "language": language,
            "limit": limit, "offset": offset
        })

    def get_categories(self, country=None, language=None):
        """Return unique categories represented in the latest public news."""
        result = self.get_news(country=country, language=language, limit=100)
        return sorted({item["category"] for item in result.get("news", [])
                       if item.get("category")})

    def get_sources(self, country=None, language=None):
        """Return unique sources represented in the latest public news."""
        result = self.get_news(country=country, language=language, limit=100)
        return sorted({item["source"] for item in result.get("news", [])
                       if item.get("source")})

    def get_api_status(self):
        """Check the API gateway health endpoint."""
        return self._request("health")