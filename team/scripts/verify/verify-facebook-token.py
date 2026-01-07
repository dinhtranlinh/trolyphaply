import json
import os
import sys
import urllib.parse
import urllib.request


def load_env_file(filename: str) -> None:
    if not os.path.exists(filename):
        return
    with open(filename, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip("\"'")
            if key and key not in os.environ:
                os.environ[key] = value


load_env_file(".env")
load_env_file(".env.local")

app_id = os.environ.get("FACEBOOK_APP_ID", "").strip()
app_secret = os.environ.get("FACEBOOK_APP_SECRET", "").strip()

token = (
    os.environ.get("FACEBOOK_PAGE_ACCESS_TOKEN")
    or os.environ.get("FACEBOOK_USER_ACCESS_TOKEN")
    or os.environ.get("FB_TOKEN")
    or ""
).strip()

if not app_id or not app_secret:
    print("FAIL: Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET")
    sys.exit(1)

if not token:
    print("FAIL: Missing FACEBOOK_PAGE_ACCESS_TOKEN or FACEBOOK_USER_ACCESS_TOKEN")
    sys.exit(1)

app_token = f"{app_id}|{app_secret}"
params = urllib.parse.urlencode(
    {
        "input_token": token,
        "access_token": app_token,
    }
)

url = f"https://graph.facebook.com/v24.0/debug_token?{params}"

try:
    with urllib.request.urlopen(url, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        info = data.get("data", {})
        is_valid = info.get("is_valid")
        scopes = info.get("scopes", [])
        expires_at = info.get("expires_at")

        if is_valid:
            print("PASS: Facebook token valid")
            print(f"Scopes: {', '.join(scopes)}")
            print(f"Expires at: {expires_at}")
            sys.exit(0)

        print("FAIL: Facebook token invalid")
        sys.exit(1)
except Exception as exc:
    print(f"FAIL: Facebook verify failed: {exc}")
    sys.exit(1)
