import os
import re
import sys


EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    ".next",
    "supabase/.temp",
    "supabase/backups",
}

EXCLUDE_FILES = {
    ".env",
    ".env.local",
    ".env.example",
    "dev3456.log",
    "prod8686.log",
}

PATTERNS = {
    "google_api_key": re.compile(r"AIza[0-9A-Za-z\-_]{30,}"),
    "openai_key": re.compile(r"sk-[0-9A-Za-z]{20,}"),
    "facebook_token": re.compile(r"EAAB[0-9A-Za-z]{20,}"),
}


def is_excluded(path: str) -> bool:
    for part in path.split(os.sep):
        if part in EXCLUDE_DIRS:
            return True
    name = os.path.basename(path)
    return name in EXCLUDE_FILES


def redact(value: str) -> str:
    if len(value) <= 8:
        return "***"
    return f"{value[:4]}...{value[-4:]}"


def scan_file(path: str):
    issues = []
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as fh:
            for idx, line in enumerate(fh, start=1):
                for name, pattern in PATTERNS.items():
                    for match in pattern.findall(line):
                        issues.append((idx, name, redact(match)))
    except Exception:
        return []
    return issues


found = []
for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
    for file in files:
        path = os.path.join(root, file)
        if is_excluded(path):
            continue
        issues = scan_file(path)
        for (line_no, name, redacted) in issues:
            found.append((path, line_no, name, redacted))


if found:
    print("FAIL: Possible secrets found:")
    for path, line_no, name, redacted in found:
        print(f"- {path}:{line_no} [{name}] {redacted}")
    sys.exit(1)

print("PASS: No obvious secrets found")
sys.exit(0)
