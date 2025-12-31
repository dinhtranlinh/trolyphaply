#!/usr/bin/env python3
"""
Test Facebook Graph API permissions.

Usage:
  FB_TOKEN=... FB_PAGE_ID=... python scripts/test-fb-permissions.py
  (or set FACEBOOK_USER_ACCESS_TOKEN in .env)

Optional:
  FB_GRAPH_API_VERSION=v24.0
  FB_INSIGHTS_METRICS=page_engaged_users,page_post_engagements
  FB_MESSAGING_RECIPIENT_ID=... (optional, for send message test)

If FB_TOKEN/FB_PAGE_ID are not set, the script attempts to load the first
active page from Supabase and uses page_access_token + page_id.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

# Ensure UTF-8 output on Windows terminals
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

GRAPH_API_VERSION = os.environ.get("FB_GRAPH_API_VERSION", "v24.0")
BASE_URL = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

REQUIRED_PERMISSIONS = {
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "pages_messaging",
    "pages_manage_metadata",
}

ENCRYPTION_KEY = os.environ.get(
    "FACEBOOK_TOKEN_ENCRYPTION_KEY",
    "default-key-change-in-production-32bytes",
)

# Optional AES support if pycryptodome is installed
try:
    from Crypto.Cipher import AES  # type: ignore
except Exception:
    AES = None


class TestResult:
    def __init__(self, permission: str, endpoint: str, success: bool, details: str) -> None:
        self.permission = permission
        self.endpoint = endpoint
        self.success = success
        self.details = details


results: List[TestResult] = []
skipped: List[TestResult] = []


def load_env(path: str = ".env") -> None:
    if not os.path.exists(path):
        return
    try:
        with open(path, "r", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except Exception:
        return


def decrypt_token(encrypted_data: str) -> str:
    if ":" not in encrypted_data:
        return encrypted_data
    if AES is None:
        raise RuntimeError(
            "Encrypted token detected but pycryptodome is not installed. "
            "Set FB_TOKEN or install pycryptodome."
        )

    try:
        iv_hex, encrypted_hex = encrypted_data.split(":", 1)
        iv = bytes.fromhex(iv_hex)
        encrypted = bytes.fromhex(encrypted_hex)
        key = ENCRYPTION_KEY.ljust(32, "0")[:32].encode("utf-8")
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted = cipher.decrypt(encrypted)
        pad_len = decrypted[-1]
        if pad_len < 1 or pad_len > 16:
            return decrypted.decode("utf-8", errors="ignore")
        return decrypted[:-pad_len].decode("utf-8", errors="ignore")
    except Exception:
        return encrypted_data


def http_request(
    method: str,
    url: str,
    headers: Optional[Dict[str, str]] = None,
    body: Optional[Dict[str, Any]] = None,
) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    try:
        data_bytes = None
        final_headers = headers or {}
        if body is not None and method.upper() != "GET":
            data_bytes = json.dumps(body).encode("utf-8")
            final_headers.setdefault("Content-Type", "application/json")

        req = urllib.request.Request(url, data=data_bytes, method=method.upper())
        for key, value in final_headers.items():
            req.add_header(key, value)

        with urllib.request.urlopen(req) as response:
            raw = response.read().decode("utf-8")
            data = json.loads(raw) if raw else {}
            return data, None
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        parsed: Optional[Dict[str, Any]] = None
        try:
            parsed = json.loads(raw) if raw else None
        except json.JSONDecodeError:
            parsed = None

        if parsed:
            return parsed, f"HTTP {exc.code} {exc.reason} | Body: {raw}"
        return None, f"HTTP {exc.code} {exc.reason} | Body: {raw}"
    except Exception as exc:
        return None, str(exc)


def make_request(
    token: str,
    method: str,
    endpoint: str,
    params: Optional[Dict[str, Any]] = None,
    body: Optional[Dict[str, Any]] = None,
) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    url = f"{BASE_URL}/{endpoint}"
    query = {"access_token": token}
    if params:
        query.update(params)
    url = f"{url}?{urllib.parse.urlencode(query)}"

    data, error = http_request(method, url, body=body)
    if error:
        return None, error

    if data and isinstance(data, dict) and "error" in data:
        err = data.get("error", {})
        message = err.get("message", "Unknown error")
        code = err.get("code", "unknown")
        return None, f"{message} (code: {code})"

    return data, None


def log_result(permission: str, endpoint: str, success: bool, details: str) -> None:
    results.append(TestResult(permission, endpoint, success, details))
    status = "PASS" if success else "FAIL"
    print(f"{status} | {permission} | {endpoint}")
    if details:
        if success:
            print(f"       {details[:100]}")
        else:
            for line in details.splitlines():
                print(f"       {line}")


def log_skip(permission: str, endpoint: str, reason: str) -> None:
    skipped.append(TestResult(permission, endpoint, False, reason))
    print(f"SKIP | {permission} | {endpoint}")
    if reason:
        print(f"       {reason}")


# Tests

def test_pages_read_user_content(token: str, page_id: str) -> None:
    print("\n" + "=" * 60)
    print("Testing: pages_read_user_content")
    print("=" * 60)

    data, error = make_request(
        token,
        "GET",
        f"{page_id}/feed",
        {"fields": "id,message,from,created_time", "limit": 5},
    )

    if error:
        log_result("pages_read_user_content", f"{page_id}/feed", False, error)
    elif data and "data" in data:
        log_result(
            "pages_read_user_content",
            f"{page_id}/feed",
            True,
            f"Found {len(data.get('data', []))} posts",
        )
    else:
        log_result("pages_read_user_content", f"{page_id}/feed", False, "No data returned")


def test_pages_read_engagement(token: str, page_id: str) -> None:
    print("\n" + "=" * 60)
    print("Testing: pages_read_engagement")
    print("=" * 60)

    metrics = os.environ.get(
        "FB_INSIGHTS_METRICS",
        "page_engaged_users,page_post_engagements",
    )
    data, error = make_request(
        token,
        "GET",
        f"{page_id}/insights",
        {"metric": metrics, "period": "day"},
    )

    if error:
        log_result("pages_read_engagement", f"{page_id}/insights", False, error)
    elif data and "data" in data:
        log_result(
            "pages_read_engagement",
            f"{page_id}/insights",
            True,
            f"Got {len(data.get('data', []))} metrics",
        )
    else:
        log_result("pages_read_engagement", f"{page_id}/insights", False, "No data returned")

    posts_data, posts_error = make_request(
        token,
        "GET",
        f"{page_id}/posts",
        {"fields": "id,message,likes.summary(true),comments.summary(true),shares", "limit": 5},
    )

    if posts_error:
        log_result("pages_read_engagement", f"{page_id}/posts (engagement)", False, posts_error)
    elif posts_data and "data" in posts_data:
        log_result(
            "pages_read_engagement",
            f"{page_id}/posts (engagement)",
            True,
            f"Got engagement for {len(posts_data.get('data', []))} posts",
        )


def test_pages_messaging(token: str, page_id: str) -> None:
    print("\n" + "=" * 60)
    print("Testing: pages_messaging")
    print("=" * 60)

    recipient_id = os.environ.get("FB_MESSAGING_RECIPIENT_ID")
    if recipient_id:
        data, error = make_request(
            token,
            "POST",
            f"{page_id}/messages",
            {},
            {
                "recipient": {"id": recipient_id},
                "message": {"text": f"[API Test] Message sent at {datetime.utcnow().isoformat()}Z"},
            },
        )

        if error:
            log_result("pages_messaging", f"{page_id}/messages (SEND)", False, error)
        elif data and data.get("message_id"):
            log_result(
                "pages_messaging",
                f"{page_id}/messages (SEND)",
                True,
                f"Message ID: {data.get('message_id')}",
            )
        else:
            log_result("pages_messaging", f"{page_id}/messages (SEND)", False, "No message_id returned")
        return

    data, error = make_request(
        token,
        "GET",
        f"{page_id}/conversations",
        {"fields": "participants,updated_time", "limit": 1},
    )

    if error:
        log_result("pages_messaging", f"{page_id}/conversations", False, error)
    elif data and "data" in data:
        log_result(
            "pages_messaging",
            f"{page_id}/conversations",
            True,
            f"Found {len(data.get('data', []))} conversations",
        )
    else:
        log_result("pages_messaging", f"{page_id}/conversations", False, "No data returned")


def test_pages_manage_posts(token: str, page_id: str) -> None:
    print("\n" + "=" * 60)
    print("Testing: pages_manage_posts")
    print("=" * 60)

    data, error = make_request(
        token,
        "POST",
        f"{page_id}/feed",
        {},
        {"message": f"[API Test] Created at {datetime.utcnow().isoformat()}Z", "published": False},
    )

    if error:
        log_result("pages_manage_posts", f"{page_id}/feed (CREATE)", False, error)
        return

    post_id = data.get("id") if data else None
    if post_id:
        log_result("pages_manage_posts", f"{page_id}/feed (CREATE)", True, f"Created: {post_id}")
        del_data, del_error = make_request(token, "DELETE", post_id)
        if del_error:
            log_result("pages_manage_posts", f"{post_id} (DELETE)", False, del_error)
        elif del_data and del_data.get("success"):
            log_result("pages_manage_posts", f"{post_id} (DELETE)", True, "Deleted successfully")
    else:
        log_result("pages_manage_posts", f"{page_id}/feed (CREATE)", False, "No post ID returned")


def test_pages_manage_engagement(token: str, page_id: str) -> None:
    print("\n" + "=" * 60)
    print("Testing: pages_manage_engagement")
    print("=" * 60)

    posts_data, _ = make_request(
        token,
        "GET",
        f"{page_id}/posts",
        {"fields": "id,message", "limit": 1},
    )

    if not posts_data or not posts_data.get("data"):
        log_result("pages_manage_engagement", "GET posts", False, "No posts found")
        return

    post_id = posts_data["data"][0].get("id")
    if not post_id:
        log_result("pages_manage_engagement", "GET posts", False, "No post ID")
        return

    comments_data, error = make_request(
        token,
        "GET",
        f"{post_id}/comments",
        {"fields": "id,message,from,created_time", "limit": 5},
    )

    if error:
        log_result("pages_manage_engagement", f"{post_id}/comments (READ)", False, error)
    elif comments_data and "data" in comments_data:
        log_result(
            "pages_manage_engagement",
            f"{post_id}/comments (READ)",
            True,
            f"Got {len(comments_data.get('data', []))} comments",
        )

        if comments_data.get("data"):
            comment_id = comments_data["data"][0].get("id")
            if comment_id:
                reply_data, reply_error = make_request(
                    token,
                    "POST",
                    f"{comment_id}/comments",
                    {},
                    {"message": "[API Test Reply] Thank you!"},
                )

                if reply_error:
                    log_result("pages_manage_engagement", f"{comment_id}/comments (REPLY)", False, reply_error)
                elif reply_data and reply_data.get("id"):
                    log_result(
                        "pages_manage_engagement",
                        f"{comment_id}/comments (REPLY)",
                        True,
                        f"Created reply: {reply_data.get('id')}",
                    )
                    make_request(token, "DELETE", reply_data.get("id"))


def test_business_management(token: str) -> None:
    print("\n" + "=" * 60)
    print("Testing: business_management")
    print("=" * 60)

    data, error = make_request(token, "GET", "me/businesses", {"fields": "id,name,created_time"})
    if error:
        log_result("business_management", "me/businesses", False, error)
    elif data and "data" in data:
        log_result("business_management", "me/businesses", True, f"Found {len(data.get('data', []))} businesses")
        if data.get("data"):
            business_id = data["data"][0].get("id")
            if business_id:
                pages_data, pages_error = make_request(
                    token,
                    "GET",
                    f"{business_id}/owned_pages",
                    {"fields": "id,name"},
                )
                if pages_error:
                    log_result("business_management", f"{business_id}/owned_pages", False, pages_error)
                elif pages_data and "data" in pages_data:
                    log_result(
                        "business_management",
                        f"{business_id}/owned_pages",
                        True,
                        f"Found {len(pages_data.get('data', []))} pages",
                    )


def test_additional_permissions(
    user_token: Optional[str],
    page_token: str,
    page_id: str,
) -> None:
    print("\n" + "=" * 60)
    print("Testing: Additional permissions (verification)")
    print("=" * 60)

    if user_token:
        accounts_data, accounts_error = make_request(
            user_token,
            "GET",
            "me/accounts",
            {"fields": "id,name,category"},
        )

        if accounts_error:
            log_result("pages_show_list", "me/accounts", False, accounts_error)
        elif accounts_data and "data" in accounts_data:
            log_result(
                "pages_show_list",
                "me/accounts",
                True,
                f"Found {len(accounts_data.get('data', []))} pages",
            )
    else:
        log_skip("pages_show_list", "me/accounts", "Requires user access token")

    page_data, page_error = make_request(
        page_token,
        "GET",
        page_id,
        {"fields": "id,name,about,category,phone,website"},
    )

    if page_error:
        log_result("pages_manage_metadata", page_id, False, page_error)
    elif page_data and page_data.get("id"):
        log_result("pages_manage_metadata", page_id, True, f"Page: {page_data.get('name')}")


def print_summary() -> None:
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = len([r for r in results if r.success])
    failed = len([r for r in results if not r.success])
    skipped_count = len(skipped)

    print(f"\nTotal tests: {len(results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    if skipped_count:
        print(f"Skipped: {skipped_count}")

    if failed > 0:
        print("\nFailed tests:")
        for r in results:
            if not r.success:
                print(f"  - {r.permission}: {r.endpoint}")
                print(f"    {r.details[:80]}")
    if skipped_count:
        print("\nSkipped tests:")
        for r in skipped:
            print(f"  - {r.permission}: {r.endpoint}")
            print(f"    {r.details[:80]}")

    required_failed = sorted(
        {
            r.permission
            for r in results
            if (not r.success and r.permission in REQUIRED_PERMISSIONS)
        }
    )
    if required_failed:
        print("\nRequired permissions failing:")
        for perm in required_failed:
            print(f"  - {perm}")


def get_page_token_from_user_token(
    user_token: str,
    page_id: Optional[str],
) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    data, error = make_request(
        user_token,
        "GET",
        "me/accounts",
        {"fields": "id,name,access_token,category", "limit": 50},
    )

    if error or not data or "data" not in data:
        return None, None, None

    pages = data.get("data") or []
    if not pages:
        return None, None, None

    chosen = None
    if page_id:
        for page in pages:
            if page.get("id") == page_id:
                chosen = page
                break
    if chosen is None:
        chosen = pages[0]

    return chosen.get("id"), chosen.get("access_token"), chosen.get("name")


def fetch_from_supabase() -> Tuple[str, str, str]:
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not supabase_url or not service_key:
        raise RuntimeError("Missing Supabase URL or service role key")

    url = f"{supabase_url}/rest/v1/facebook_pages?select=*&status=eq.active&limit=1"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
    }

    data, error = http_request("GET", url, headers=headers)
    if error:
        raise RuntimeError(f"Supabase error: {error}")

    if not data or not isinstance(data, list) or not data:
        raise RuntimeError("No active pages found in database")

    page = data[0]
    page_id = page.get("page_id")
    page_name = page.get("page_name", "")
    page_access_token = page.get("page_access_token")

    if not page_id or not page_access_token:
        raise RuntimeError("Missing page_id or page_access_token in DB")

    token = decrypt_token(str(page_access_token))
    return str(page_id), token, page_name


def main() -> None:
    load_env()

    print("=" * 60)
    print("FACEBOOK GRAPH API PERMISSION TEST")
    print("=" * 60)

    token = (
        os.environ.get("FB_TOKEN")
        or os.environ.get("FACEBOOK_USER_ACCESS_TOKEN")
        or os.environ.get("FACEBOOK_PAGE_ACCESS_TOKEN")
    )
    page_id = os.environ.get("FB_PAGE_ID") or os.environ.get("FACEBOOK_PAGE_ID")

    user_token: Optional[str] = None
    page_token: Optional[str] = None
    page_name: Optional[str] = None

    if token:
        resolved_page_id, resolved_page_token, resolved_page_name = get_page_token_from_user_token(token, page_id)
        if resolved_page_id and resolved_page_token:
            user_token = token
            page_token = resolved_page_token
            page_id = resolved_page_id
            page_name = resolved_page_name
        elif page_id:
            page_token = token

    if not token or not page_id or not page_token:
        print("\nNo token in env, fetching from database...")
        try:
            page_id, page_token, page_name = fetch_from_supabase()
            token = page_token
            print(f"\nUsing page: {page_name} ({page_id})")
        except Exception as exc:
            print(f"ERROR: {exc}")
            print("\nUsage:")
            print("  FB_TOKEN=<token> FB_PAGE_ID=<page_id> python scripts/test-fb-permissions.py")
            sys.exit(1)

    if not token or not page_id or not page_token:
        print("ERROR: Missing token or page ID after lookup")
        sys.exit(1)

    print(f"\nAPI Version: {GRAPH_API_VERSION}")
    print(f"Page ID: {page_id}")
    print(f"Token: {page_token[:20]}...")

    test_pages_read_user_content(page_token, page_id)
    test_pages_read_engagement(page_token, page_id)
    test_pages_messaging(page_token, page_id)
    test_pages_manage_posts(page_token, page_id)
    test_pages_manage_engagement(page_token, page_id)

    if user_token:
        test_business_management(user_token)
    else:
        log_skip("business_management", "me/businesses", "Requires user access token")

    test_additional_permissions(user_token, page_token, page_id)

    print_summary()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}")
        sys.exit(1)
