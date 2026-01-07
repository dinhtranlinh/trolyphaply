import os
import sys
from urllib.parse import urlparse


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

dsn = os.environ.get("DATABASE_URL") or os.environ.get("DIRECT_URL")
if not dsn:
    print("FAIL: Missing DATABASE_URL or DIRECT_URL")
    sys.exit(1)

try:
    import psycopg  # type: ignore
except Exception:
    try:
        import psycopg2 as psycopg  # type: ignore
    except Exception:
        print("FAIL: psycopg/psycopg2 not installed. Install one to run this check.")
        sys.exit(2)

parsed = urlparse(dsn)
host = parsed.hostname or "unknown"
db = (parsed.path or "").lstrip("/") or "unknown"

try:
    conn = psycopg.connect(dsn)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT 1;")
    cur.fetchone()

    checks = [
        "admin_users",
        "customers",
        "customer_tags",
        "qa_session_contexts",
        "facebook_pages",
    ]
    missing = []
    for table in checks:
        cur.execute("SELECT to_regclass(%s);", (f"public.{table}",))
        exists = cur.fetchone()
        if not exists or exists[0] is None:
            missing.append(table)

    cur.close()
    conn.close()

    print(f"PASS: Connected to {host}/{db}")
    if missing:
        print("WARN: Missing tables:", ", ".join(missing))
    sys.exit(0)
except Exception as exc:
    print(f"FAIL: DB connection failed to {host}/{db}: {exc}")
    sys.exit(1)
