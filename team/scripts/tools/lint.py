import subprocess
import sys


result = subprocess.run(["npm", "run", "lint"])
sys.exit(result.returncode)
