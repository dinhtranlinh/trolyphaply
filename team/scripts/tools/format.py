import json
import os
import subprocess
import sys


package_path = "package.json"
if not os.path.exists(package_path):
    print("FAIL: package.json not found")
    sys.exit(1)

with open(package_path, "r", encoding="utf-8") as fh:
    pkg = json.load(fh)

scripts = pkg.get("scripts", {})
if "format" not in scripts:
    print("WARN: No npm script named 'format'. Add one if needed.")
    sys.exit(2)

result = subprocess.run(["npm", "run", "format"])
sys.exit(result.returncode)
