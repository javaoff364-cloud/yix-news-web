import json
import unittest
from unittest.mock import patch

from yixnews import YIXNews, YIXNewsError


class FakeResponse:
    status = 200
    def __enter__(self): return self
    def __exit__(self, *args): return False
    def read(self): return json.dumps({
        "success": True,
        "news": [
            {"category": "Tech", "source": "B"},
            {"category": "World", "source": "A"},
            {"category": "Tech", "source": "A"},
        ],
    }).encode()


class ClientTests(unittest.TestCase):
    @patch("yixnews.client.urlopen", return_value=FakeResponse())
    def test_categories_and_sources(self, mocked):
        client = YIXNews()
        self.assertEqual(client.get_categories(), ["Tech", "World"])
        self.assertEqual(client.get_sources(), ["A", "B"])
        self.assertEqual(mocked.call_count, 2)

    @patch("yixnews.client.urlopen", return_value=FakeResponse())
    def test_news_url_has_filters(self, mocked):
        YIXNews().get_news(country="uzbekistan", limit=5)
        request = mocked.call_args.args[0]
        self.assertIn("country=uzbekistan", request.full_url)
        self.assertIn("limit=5", request.full_url)


if __name__ == "__main__":
    unittest.main()