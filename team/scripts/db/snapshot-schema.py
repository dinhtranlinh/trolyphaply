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

output_path = os.path.join("team", "scripts", "db", "schema_snapshot.sql")

if shutil.which("pg_dump"):
    result = subprocess.run(
        ["pg_dump", "--schema-only", "--no-owner", "--no-privileges", dsn],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print("FAIL: pg_dump failed:", result.stderr.strip())
        sys.exit(result.returncode)
    with open(output_path, "w", encoding="utf-8") as fh:
        fh.write(result.stdout)
    print(f"PASS: schema snapshot saved to {output_path}")
    sys.exit(0)

try:
    import psycopg  # type: ignore
except Exception:
    try:
        import psycopg2 as psycopg  # type: ignore
    except Exception:
        print("FAIL: Need pg_dump or psycopg to snapshot schema")
        sys.exit(2)

try:
    conn = psycopg.connect(dsn)
    cur = conn.cursor()
    cur.execute(
        """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
        """
    )
    tables = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()

    with open(output_path.replace(".sql", ".txt"), "w", encoding="utf-8") as fh:
        fh.write("public tables:\n")
        for table in tables:
            fh.write(f"- {table}\n")
    print(f"PASS: schema snapshot saved to {output_path.replace('.sql', '.txt')}")
    sys.exit(0)
except Exception as exc:
    print(f"FAIL: schema snapshot failed: {exc}")
    sys.exit(1)
