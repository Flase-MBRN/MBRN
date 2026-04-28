import sys
from pathlib import Path

# Bootstrap paths
project_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(project_root / "scripts" / "pipelines"))

from autonomous_dev_agent import check_value_gate

test_codes = [
    {
        "name": "Shallow Wrapper (Reject)",
        "code": "def format_code(c): return c\ndef validate_code(c): return True\ndef process_code(c): return {}\ndef main():\n    print(process_code('test'))\nif __name__ == '__main__':\n    main()"
    },
    {
        "name": "Too few functions (Reject)",
        "code": "def analyze_vulnerability(data):\n    return {'score': 0.9, 'severity': 'high', 'findings': ['bug'], 'recommendations': ['fix']}\ndef main():\n    print(analyze_vulnerability('test'))\nif __name__ == '__main__':\n    main()"
    },
    {
        "name": "Missing keys (Reject)",
        "code": "def f1(): return 1\ndef f2(): return 2\ndef f3(): return 3\ndef f4(): return 4\ndef f5(): return 5\ndef main():\n    print(f1()+f2()+f3()+f4()+f5())\nif __name__ == '__main__':\n    main()"
    },
    {
        "name": "Valid v1.7 Engine (Pass)",
        "code": "class AnalysisEngine:\n    def parse(self, d): return d.split()\n    def calculate_score(self, items): return len(items) * 10\n    def find_issues(self, items): return [i for i in items if len(i) > 5]\n    def get_recommendations(self, issues): return [f'Fix {i}' for i in issues]\n    def run_audit(self, data):\n        items = self.parse(data)\n        score = self.calculate_score(items)\n        issues = self.find_issues(items)\n        return {\n            'score': score,\n            'severity': 'medium' if score < 50 else 'high',\n            'findings': issues,\n            'recommendations': self.get_recommendations(issues)\n        }\n\ndef main():\n    engine = AnalysisEngine()\n    result = engine.run_audit('hello world autonomous intelligence')\n    print(result)\n\nif __name__ == '__main__':\n    main()"
    }
]

for test in test_codes:
    code = test["code"].strip()
    error = check_value_gate(code)
    print(f"Test: {test['name']}")
    print(f"Result: {'PASSED' if not error else 'REJECTED: ' + error}")
    print("-" * 40)
