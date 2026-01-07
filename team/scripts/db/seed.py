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

data_path = os.path.join("data", "legal-library.json")
if not os.path.exists(data_path):
    print("FAIL: data/legal-library.json not found")
    sys.exit(1)

with open(data_path, "r", encoding="utf-8") as fh:
    payload = json.load(fh)

base_url = os.environ.get("NEXT_PUBLIC_APP_URL", "http://localhost:3456").rstrip("/")
endpoint = f"{base_url}/api/admin/legal-library/import"

req = urllib.request.Request(
    endpoint,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = resp.read().decode("utf-8")
        print("PASS: seed import response:", body)
        sys.exit(0)
except Exception as exc:
    print(f"FAIL: seed import failed: {exc}")
    sys.exit(1)
