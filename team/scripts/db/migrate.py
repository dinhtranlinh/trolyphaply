import glob
import os
import shutil
import subprocess
import sys


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

migrations = sorted(glob.glob("prisma/migrations/*/migration.sql"))
if not migrations:
    print("No migrations found in prisma/migrations")
    sys.exit(0)

try:
    import psycopg  # type: ignore
    driver = "psycopg"
except Exception:
    try:
        import psycopg2 as psycopg  # type: ignore
        driver = "psycopg2"
    except Exception:
        driver = None


def run_with_psql() -> int:
    if not shutil.which("psql"):
        print("FAIL: psql not found. Install Postgres client or psycopg.")
        return 2
    for path in migrations:
        print(f"Applying {path} via psql")
        result = subprocess.run(["psql", dsn, "-f", path], capture_output=True, text=True)
        if result.returncode != 0:
            print("FAIL:", result.stderr.strip())
            return result.returncode
    return 0


if driver is None:
    sys.exit(run_with_psql())

try:
    conn = psycopg.connect(dsn)
    conn.autocommit = True
    cursor = conn.cursor()
    for path in migrations:
        print(f"Applying {path} via {driver}")
        with open(path, "r", encoding="utf-8") as fh:
            sql = fh.read()
        cursor.execute(sql)
    cursor.close()
    conn.close()
    print("PASS: migrations applied")
    sys.exit(0)
except Exception as exc:
    print(f"FAIL: migration error: {exc}")
    sys.exit(1)
