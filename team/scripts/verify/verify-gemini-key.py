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

def pick_key() -> str:
    candidates = ["GEMINI_API_KEY"] + [f"GEMINI_API_KEY_{i}" for i in range(1, 11)]
    for key in candidates:
        value = os.environ.get(key)
        if value and value.strip():
            return value.strip()
    return ""


api_key = pick_key()
if not api_key:
    print("FAIL: Missing GEMINI_API_KEY (or GEMINI_API_KEY_1..n)")
    sys.exit(1)

model = os.environ.get("MODEL_NAME") or os.environ.get("GEMINI_MODEL") or "gemini-2.5-flash"
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

payload = {
    "contents": [
        {"role": "user", "parts": [{"text": "Ping. Tra loi 1 cau ngan gon."}]}
    ]
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = resp.read().decode("utf-8")
        data = json.loads(body)
        if "candidates" in data:
            print(f"PASS: Gemini request OK (model={model})")
            sys.exit(0)
        print("FAIL: Unexpected Gemini response")
        sys.exit(1)
except Exception as exc:
    print(f"FAIL: Gemini request failed: {exc}")
    sys.exit(1)
