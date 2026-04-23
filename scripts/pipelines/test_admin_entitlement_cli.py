import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import admin_entitlement_cli as cli


class MockResponse:
    def __init__(self, status_code=200, payload=None):
        self.status_code = status_code
        self._payload = payload
        self.reason = "OK"
        if payload is None:
            self.text = ""
        else:
            self.text = json.dumps(payload)

    def json(self):
        if self._payload is None:
            raise ValueError("No JSON payload")
        return self._payload


class FakeKeyManager:
    def get_key(self, key_name):
        if key_name == "SUPABASE_SERVICE_ROLE_KEY":
            return "service-role-key"
        return None


class AdminEntitlementCliTests(unittest.TestCase):
    def setUp(self):
        self.env_patch = patch.dict(cli.os.environ, {"SUPABASE_URL": "https://example.supabase.co"}, clear=False)
        self.env_patch.start()
        self.load_env_patch = patch.object(cli, "load_local_env", lambda env_path=cli.ENV_PATH: None)
        self.load_env_patch.start()
        self.key_manager_patch = patch.object(cli, "SecureKeyManager", FakeKeyManager)
        self.key_manager_patch.start()

    def tearDown(self):
        self.key_manager_patch.stop()
        self.load_env_patch.stop()
        self.env_patch.stop()

    def test_rejects_invalid_argument_combo(self):
        exit_code = cli.main(["--plan-id", "chronos"])
        self.assertEqual(exit_code, cli.EXIT_INVALID_ARGS)

    def test_dry_run_by_user_id(self):
        requests_made = []

        def request_fn(method, url, **kwargs):
            requests_made.append((method, url, kwargs))
            return MockResponse(payload=[{"id": "user-1", "plan_id": "free", "access_level": 0}])

        with patch.object(cli.requests, "request", side_effect=request_fn):
            args = cli.build_parser().parse_args(["--user-id", "user-1", "--plan-id", "chronos", "--dry-run"])
            result = cli.execute(args, request_fn=cli.requests.request, key_manager=FakeKeyManager())

        self.assertTrue(result["success"])
        self.assertTrue(result["dry_run"])
        self.assertEqual(result["after"]["plan_id"], "chronos")
        self.assertEqual(result["after"]["access_level"], 5)
        self.assertEqual(len(requests_made), 1)
        self.assertEqual(requests_made[0][0], "GET")

    def test_updates_by_email(self):
        calls = []

        def request_fn(method, url, **kwargs):
            calls.append((method, url, kwargs))
            if url.endswith("/auth/v1/admin/users"):
                return MockResponse(payload={"users": [{"id": "user-2", "email": "team@example.com"}]})
            if method == "GET" and url.endswith("/rest/v1/profiles"):
                return MockResponse(payload=[{"id": "user-2", "plan_id": "free", "access_level": 0}])
            if method == "PATCH" and url.endswith("/rest/v1/profiles"):
                return MockResponse(payload=[{"id": "user-2", "plan_id": "chronos", "access_level": 5}])
            raise AssertionError(f"Unexpected request: {method} {url}")

        with patch.object(cli.requests, "request", side_effect=request_fn):
            args = cli.build_parser().parse_args(["--email", "team@example.com", "--plan-id", "chronos"])
            result = cli.execute(args, request_fn=cli.requests.request, key_manager=FakeKeyManager())

        self.assertEqual(result["target"]["email"], "team@example.com")
        self.assertEqual(result["after"]["plan_id"], "chronos")
        self.assertEqual(result["after"]["access_level"], 5)
        self.assertEqual([call[0] for call in calls], ["GET", "GET", "PATCH"])

    def test_returns_not_found_for_missing_email(self):
        def request_fn(method, url, **kwargs):
            return MockResponse(payload={"users": []})

        with patch.object(cli.requests, "request", side_effect=request_fn):
            exit_code = cli.main(["--email", "missing@example.com", "--plan-id", "chronos", "--json"])

        self.assertEqual(exit_code, cli.EXIT_NOT_FOUND)


if __name__ == "__main__":
    unittest.main()
