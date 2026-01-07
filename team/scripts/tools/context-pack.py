import os
import sys


FILES = [
    "team/docs/00-project-constitution.md",
    "team/docs/01-architecture-overview.md",
    "team/docs/02-repo-map.md",
    "team/docs/04-versions-lock.md",
    "team/docs/contracts/db-schema.md",
    "team/docs/contracts/api-contracts.md",
    "team/docs/changelog/changelog.md",
]


def read_file(path: str) -> str:
    if not os.path.exists(path):
        return f"\n# Missing: {path}\n"
    with open(path, "r", encoding="utf-8") as fh:
        return fh.read().strip()


content = []
for path in FILES:
    content.append(f"\n\n---\n# Source: {path}\n")
    content.append(read_file(path))

output = "\n".join(content).strip() + "\n"

if "--out" in sys.argv:
    idx = sys.argv.index("--out")
    if idx + 1 >= len(sys.argv):
        print("FAIL: --out requires a file path")
        sys.exit(1)
    out_path = sys.argv[idx + 1]
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(output)
    print(f"PASS: context pack saved to {out_path}")
    sys.exit(0)

print(output)
