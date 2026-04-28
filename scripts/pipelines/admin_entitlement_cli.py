#!/usr/bin/env python3
"""Local admin CLI for internal entitlement changes via Supabase service role."""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

import requests

SCRIPT_ROOT = Path(__file__).resolve().parent
ENV_PATH = SCRIPT_ROOT / ".env"

EXIT_OK = 0
EXIT_NOT_FOUND = 2
EXIT_MISSING_CREDENTIALS = 3
EXIT_INVALID_ARGS = 4

PLAN_DEFINITIONS = {
    "free": {"plan_id": "free", "access_level": 0},
    "chronos": {"plan_id": "chronos", "access_level": 5},
    "pro": {"plan_id": "pro", "access_level": 10},
    "business": {"plan_id": "business", "access_level": 20},
}


class CliError(Exception):
    """Base class for controlled CLI errors."""

    exit_code = EXIT_INVALID_ARGS

    def __init__(self, message: str, exit_code: int | None = None):
        super().__init__(message)
        self.message = message
        if exit_code is not None:
            self.exit_code = exit_code


class MissingCredentialsError(CliError):
    exit_code = EXIT_MISSING_CREDENTIALS


class UserNotFoundError(CliError):
    exit_code = EXIT_NOT_FOUND


class ApiError(CliError):
    exit_code = EXIT_INVALID_ARGS


@dataclass
class RuntimeContext:
    supabase_url: str
    service_role_key: str


def load_local_env(env_path: Path = ENV_PATH) -> None:
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Internal entitlement admin CLI for MBRN profiles."
    )
    parser.add_argument("--user-id", dest="user_id")
    parser.add_argument("--email")
    parser.add_argument("--plan-id", dest="plan_id")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--json", action="store_true", dest="json_output")
    return parser


def validate_args(args: argparse.Namespace) -> None:
    if bool(args.user_id) == bool(args.email):
        raise CliError("Provide exactly one of --user-id or --email.", EXIT_INVALID_ARGS)

    if args.plan_id not in PLAN_DEFINITIONS:
        raise CliError(
            "Invalid --plan-id. Allowed values: free, chronos, pro, business.",
            EXIT_INVALID_ARGS,
        )


def resolve_runtime_context() -> RuntimeContext:
    load_local_env()

    supabase_url = os.getenv("SUPABASE_URL", "").strip()
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

    if not supabase_url or not service_role_key:
        raise MissingCredentialsError(
            "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. "
            "Load .env file first."
        )

    return RuntimeContext(supabase_url=supabase_url.rstrip("/"), service_role_key=service_role_key)


def build_headers(service_role_key: str, prefer: str | None = None) -> dict[str, str]:
    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


def request_json(
    method: str,
    url: str,
    *,
    headers: dict[str, str],
    request_fn: Callable[..., requests.Response],
    params: dict[str, Any] | None = None,
    json_body: dict[str, Any] | None = None,
) -> Any:
    try:
        response = request_fn(method, url, headers=headers, params=params, json=json_body, timeout=20)
    except requests.RequestException as exc:
        raise ApiError(f"Supabase request failed before response: {exc}") from exc
    if response.status_code >= 400:
        try:
            payload = response.json()
        except ValueError:
            payload = response.text.strip() or response.reason
        raise ApiError(f"Supabase request failed ({response.status_code}): {payload}")

    if not response.text:
        return None

    try:
        return response.json()
    except ValueError:
        return None


def fetch_user_by_email(
    runtime: RuntimeContext,
    email: str,
    *,
    request_fn: Callable[..., requests.Response],
) -> dict[str, Any]:
    normalized_email = email.strip().lower()
    page = 1
    per_page = 200
    headers = build_headers(runtime.service_role_key)

    while True:
        payload = request_json(
            "GET",
            f"{runtime.supabase_url}/auth/v1/admin/users",
            headers=headers,
            request_fn=request_fn,
            params={"page": page, "per_page": per_page},
        )

        users = payload.get("users") if isinstance(payload, dict) else None
        if users is None and isinstance(payload, dict):
            users = payload.get("data", {}).get("users", [])
        users = users or []

        for user in users:
            if str(user.get("email") or "").lower() == normalized_email:
                return user

        if len(users) < per_page:
            break
        page += 1

    raise UserNotFoundError(f"User with email '{email}' was not found.")


def fetch_profile(
    runtime: RuntimeContext,
    user_id: str,
    *,
    request_fn: Callable[..., requests.Response],
) -> dict[str, Any] | None:
    payload = request_json(
        "GET",
        f"{runtime.supabase_url}/rest/v1/profiles",
        headers=build_headers(runtime.service_role_key),
        request_fn=request_fn,
        params={"id": f"eq.{user_id}", "select": "*"},
    )

    if not payload:
        return None

    if isinstance(payload, list):
        return payload[0] if payload else None

    return payload


def persist_profile_plan(
    runtime: RuntimeContext,
    user_id: str,
    target_plan: dict[str, Any],
    current_profile: dict[str, Any] | None,
    *,
    request_fn: Callable[..., requests.Response],
) -> dict[str, Any]:
    timestamp = datetime.now(timezone.utc).isoformat()
    payload = {
        "id": user_id,
        "plan_id": target_plan["plan_id"],
        "access_level": target_plan["access_level"],
        "last_sync": timestamp,
    }

    if current_profile:
        return request_json(
            "PATCH",
            f"{runtime.supabase_url}/rest/v1/profiles",
            headers=build_headers(runtime.service_role_key, prefer="return=representation"),
            request_fn=request_fn,
            params={"id": f"eq.{user_id}"},
            json_body=payload,
        )[0]

    return request_json(
        "POST",
        f"{runtime.supabase_url}/rest/v1/profiles",
        headers=build_headers(runtime.service_role_key, prefer="return=representation,resolution=merge-duplicates"),
        request_fn=request_fn,
        json_body=payload,
    )[0]


def build_result(
    *,
    args: argparse.Namespace,
    target_user: dict[str, Any],
    current_profile: dict[str, Any] | None,
    target_plan: dict[str, Any],
    updated_profile: dict[str, Any] | None,
) -> dict[str, Any]:
    return {
        "success": True,
        "dry_run": bool(args.dry_run),
        "target": {
            "user_id": target_user.get("id"),
            "email": target_user.get("email"),
            "lookup": "email" if args.email else "user_id",
        },
        "before": current_profile,
        "after": updated_profile
        or {
            **(current_profile or {"id": target_user.get("id")}),
            "plan_id": target_plan["plan_id"],
            "access_level": target_plan["access_level"],
        },
    }


def resolve_target_user(
    runtime: RuntimeContext,
    args: argparse.Namespace,
    *,
    request_fn: Callable[..., requests.Response],
) -> tuple[dict[str, Any], dict[str, Any] | None]:
    if args.email:
        user = fetch_user_by_email(runtime, args.email, request_fn=request_fn)
        profile = fetch_profile(runtime, user["id"], request_fn=request_fn)
        return user, profile

    profile = fetch_profile(runtime, args.user_id, request_fn=request_fn)
    if not profile:
        raise UserNotFoundError(f"Profile with user id '{args.user_id}' was not found.")

    user = {"id": args.user_id, "email": profile.get("email")}
    return user, profile


def execute(
    args: argparse.Namespace,
    *,
    request_fn: Callable[..., requests.Response] = requests.request,
) -> dict[str, Any]:
    runtime = resolve_runtime_context()
    target_plan = PLAN_DEFINITIONS[args.plan_id]
    target_user, current_profile = resolve_target_user(runtime, args, request_fn=request_fn)

    updated_profile = None
    if not args.dry_run:
        updated_profile = persist_profile_plan(
            runtime,
            target_user["id"],
            target_plan,
            current_profile,
            request_fn=request_fn,
        )

    return build_result(
        args=args,
        target_user=target_user,
        current_profile=current_profile,
        target_plan=target_plan,
        updated_profile=updated_profile,
    )


def print_result(result: dict[str, Any], json_output: bool) -> None:
    if json_output:
        print(json.dumps(result, indent=2, ensure_ascii=True))
        return

    target = result["target"]
    after = result["after"] or {}
    mode_label = "DRY-RUN" if result["dry_run"] else "UPDATED"
    print(f"[{mode_label}] user_id={target.get('user_id')} email={target.get('email') or '-'}")
    print(f"plan_id={after.get('plan_id')} access_level={after.get('access_level')}")


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        code = exc.code if isinstance(exc.code, int) else EXIT_INVALID_ARGS
        return code

    try:
        validate_args(args)
        result = execute(args, request_fn=requests.request)
        print_result(result, args.json_output)
        return EXIT_OK
    except CliError as exc:
        if args.json_output:
            print(json.dumps({"success": False, "error": exc.message, "exit_code": exc.exit_code}, indent=2))
        else:
            print(f"[ERROR] {exc.message}", file=sys.stderr)
        return exc.exit_code


if __name__ == "__main__":
    # P1 SECURITY GUARDRAIL: Service-Role Warning
    print("\n" + "=" * 60)
    print("⚠️  WARNING: SERVICE ROLE ACTIVE - GOD MODE")
    print("    This tool uses Supabase service-role privileges.")
    print("    DO NOT SHARE LOGS OR SCREENSHOTS!")
    print("    Operator-only tool on trusted machine.")
    print("=" * 60 + "\n")
    raise SystemExit(main())
