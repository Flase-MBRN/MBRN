import logging
import sys
from pathlib import Path

# Setup logging to see the guard in action
logging.basicConfig(level=logging.INFO)

# Bootstrap paths
project_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(project_root / "scripts" / "pipelines"))

from autonomous_dev_agent import check_sandbox_safety

test_codes = [
    "import os\nprint(os.listdir('.'))", # Safe
    "import subprocess\nsubprocess.run(['ls'])", # Unsafe (import)
    "import os\nos.system('rm -rf /')", # Unsafe (pattern)
    "def x():\n    eval('1+1')", # Unsafe (pattern)
    "import urllib.request\nresp = urllib.request.urlopen('http://google.com')", # Unsafe (pattern)
    "print('git push origin main')", # Unsafe (pattern 'git ')
]

for code in test_codes:
    error = check_sandbox_safety(code)
    print(f"Code:\n{code}\nResult: {'SAFE' if not error else 'BLOCKED: ' + error}\n{'-'*30}")
