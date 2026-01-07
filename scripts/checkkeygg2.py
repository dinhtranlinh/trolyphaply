import os
import time
import google.generativeai as genai
from google.api_core import exceptions

# NOTE: Do NOT hardcode API keys here. Load from ENV instead.

PRIORITY_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]


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


def collect_keys() -> list:
    keys = []
    for idx in range(0, 11):
        name = "GEMINI_API_KEY" if idx == 0 else f"GEMINI_API_KEY_{idx}"
        value = os.environ.get(name, "").strip()
        if value:
            keys.append(value)
    return keys


def analyze_key(api_key: str, index: int) -> dict:
    print(f"\n{'='*12} CHECK KEY #{index + 1} {'='*12}")
    genai.configure(api_key=api_key)
    report = {
        "key_index": index + 1,
        "working_models": [],
        "quota_status": "unknown",
        "billing_required": False,
    }

    try:
        available_models = []
        for model in genai.list_models():
            if "generateContent" in model.supported_generation_methods:
                name = model.name.replace("models/", "")
                available_models.append(name)
        print(f"Models found: {len(available_models)}")
    except exceptions.InvalidArgument:
        print("FAIL: Invalid key")
        report["quota_status"] = "invalid"
        return report
    except Exception as exc:
        print(f"FAIL: Unable to list models: {exc}")
        report["quota_status"] = "error"
        return report

    print("Testing priority models...")
    for model_name in PRIORITY_MODELS:
        note = ""
        try:
            model = genai.GenerativeModel(model_name)
            start = time.time()
            model.generate_content("Hi", generation_config={"max_output_tokens": 1})
            elapsed = time.time() - start
            note = f"OK ({elapsed:.2f}s)"
            report["working_models"].append(model_name)
            print(f"  OK  [{model_name}]: {note}")
        except exceptions.ResourceExhausted as exc:
            note = f"quota/rate limit: {str(exc)[:80]}"
            print(f"  WARN [{model_name}]: {note}")
        except exceptions.PermissionDenied:
            note = "permission denied / billing required"
            report["billing_required"] = True
            print(f"  FAIL [{model_name}]: {note}")
        except exceptions.NotFound:
            note = "model not found"
            print(f"  WARN [{model_name}]: {note}")
        except Exception as exc:
            note = f"error: {str(exc)[:80]}"
            print(f"  WARN [{model_name}]: {note}")

    if report["working_models"]:
        report["quota_status"] = "ok"
    elif report["billing_required"]:
        report["quota_status"] = "billing_required"
    else:
        report["quota_status"] = "quota_or_error"

    return report


def main() -> None:
    load_env_file(".env")
    load_env_file(".env.local")

    keys = collect_keys()
    if not keys:
        print("FAIL: Missing GEMINI_API_KEY or GEMINI_API_KEY_1..n")
        return

    summary = []
    print(f"Analyzing {len(keys)} keys...")
    for i, key in enumerate(keys):
        summary.append(analyze_key(key, i))
        time.sleep(1)

    print("\n" + "=" * 60)
    print(f"{'SUMMARY':^60}")
    print("=" * 60)
    print(f"{'Key':<8} | {'Status':<18} | {'Best Model':<20}")
    print("-" * 60)

    for item in summary:
        best = item["working_models"][0] if item["working_models"] else "none"
        status = item["quota_status"]
        idx = f"Key #{item['key_index']}"
        print(f"{idx:<8} | {status:<18} | {best:<20}")


if __name__ == "__main__":
    main()
