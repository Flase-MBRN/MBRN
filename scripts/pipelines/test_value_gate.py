import sys
import ast
from pathlib import Path

# Bootstrap paths
project_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(project_root / "scripts" / "pipelines"))

from autonomous_dev_agent import check_value_gate

test_codes = [
    {
        "name": "Placeholder",
        "code": "def f1(): pass\ndef f2(): pass\ndef f3(): pass\ndef main(): pass"
    },
    {
        "name": "Too few functions",
        "code": "def process(x): return x*2\ndef main(): print(process(10))"
    },
    {
        "name": "Only prints",
        "code": "def f1(): print('hi')\ndef f2(): print('bye')\ndef f3(): print('test')\ndef main(): f1(); f2(); f3()"
    },
    {
        "name": "Valid Utility",
        "code": "def parse_data(raw):\n    return [int(x) for x in raw.split(',') if x.strip()]\n\ndef score_items(items):\n    return {i: i*1.5 for i in items}\n\ndef format_report(scores):\n    return f'Report: {scores}'\n\ndef main():\n    data = '1,2,3,4'\n    items = parse_data(data)\n    scores = score_items(items)\n    print(format_report(scores))\n\nif __name__ == '__main__':\n    main()"
    }
]

for test in test_codes:
    error = check_value_gate(test["code"])
    print(f"Test: {test['name']}")
    print(f"Result: {'PASSED' if not error else 'REJECTED: ' + error}")
    print("-" * 40)
