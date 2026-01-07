import json
import os
import sys
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

base_url = os.environ.get("NEXT_PUBLIC_APP_URL", "http://localhost:3456").rstrip("/")
with_qa = "--with-qa" in sys.argv

endpoints = [
    ("GET", f"{base_url}/api/apps"),
    ("GET", f"{base_url}/api/law/documents"),
    ("GET", f"{base_url}/api/law/procedures"),
    ("GET", f"{base_url}/api/ai-prompts"),
    ("GET", f"{base_url}/api/style-guides"),
]

if with_qa:
    endpoints.append(("POST", f"{base_url}/api/qa"))

failures = []

for method, url in endpoints:
    try:
        if method == "POST":
            payload = json.dumps({"question": "Test cau hoi ngan gon"}).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
        else:
            req = urllib.request.Request(url, method="GET")

        with urllib.request.urlopen(req, timeout=20) as resp:
            status = resp.getcode()
            if status < 200 or status >= 300:
                failures.append(f"{method} {url} -> {status}")
    except Exception as exc:
        failures.append(f"{method} {url} -> FAIL ({exc})")

if failures:
    print("FAIL: Some endpoints failed")
    for item in failures:
        print("-", item)
    sys.exit(1)

print("PASS: API endpoints OK")
sys.exit(0)
