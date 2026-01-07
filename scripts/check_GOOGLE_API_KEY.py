import os
import google.generativeai as genai
from google.api_core import exceptions

# NOTE: Do NOT hardcode API keys here. Load from ENV instead.


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


def check_key_models(api_key: str, index: int) -> None:
    print(f"\n{'='*10} Checking Key #{index + 1} {'='*10}")
    genai.configure(api_key=api_key)

    try:
        models = genai.list_models()
        available_models = []
        for model in models:
            if "generateContent" in model.supported_generation_methods:
                name = model.name.replace("models/", "")
                available_models.append(name)

        if available_models:
            print("PASS: Key is valid")
            print(f"Models available: {len(available_models)}")
        else:
            print("WARN: Key valid but no generateContent model found")
    except exceptions.InvalidArgument:
        print("FAIL: Invalid key")
    except exceptions.PermissionDenied:
        print("FAIL: Permission denied (quota/billing)")
    except Exception as exc:
        print(f"FAIL: Error checking key: {exc}")


def main() -> None:
    load_env_file(".env")
    load_env_file(".env.local")

    api_keys = collect_keys()
    if not api_keys:
        print("FAIL: Missing GEMINI_API_KEY or GEMINI_API_KEY_1..n in env")
        return

    print(f"Starting check for {len(api_keys)} keys...")
    for i, key in enumerate(api_keys):
        check_key_models(key, i)

    print(f"\n{'='*10} DONE {'='*10}")


if __name__ == "__main__":
    main()
