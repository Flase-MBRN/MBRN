import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('MBRN Alpha Flood & Money Mode Logic (v5.7.0)', () => {
    const pythonPath = 'python'; // Assumes python is in PATH

    test('App Routing: discipline/habit/focus should map to chronos', () => {
        const testScript = `
import sys
import json
import os
from pathlib import Path
# Fix: Ensure we can import from the root
root = Path('.').resolve()
sys.path.insert(0, str(root))
from scripts.pipelines.mbrn_horizon_scout import route_candidate_to_app

tests = [
    {"name": "discipline-tracker", "description": "A tool for focus and discipline"},
    {"name": "habit-app", "description": "Track your daily habits"},
    {"name": "focus-timer", "description": "Pomodoro focus timer"}
]

results = [route_candidate_to_app(t) for t in tests]
print(json.dumps(results))
        `;
        const scriptPath = path.join('tests', 'tmp_test_routing.py');
        fs.writeFileSync(scriptPath, testScript);
        try {
            const result = execSync(`${pythonPath} ${scriptPath}`).toString();
            const lines = result.trim().split('\n');
            const lastLine = lines[lines.length - 1];
            const routes = JSON.parse(lastLine);
            expect(routes).toEqual(['chronos', 'chronos', 'chronos']);
        } finally {
            if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
        }
    });

    test('Money Score: Local AI and PDF/OCR tools should get high scores', () => {
        const testScript = `
import sys
import json
import os
from pathlib import Path
root = Path('.').resolve()
sys.path.insert(0, str(root))
from scripts.pipelines.mbrn_horizon_scout import calculate_money_score

tests = [
    {
        "name": "Local AI Automator", 
        "description": "A local AI tool for workflow automation and SaaS efficiency. Built for local-first productivity.",
        "stargazers_count": 100
    },
    {
        "name": "PDF OCR Pro", 
        "description": "High-performance invoice parser and OCR assistant tool for personal finance budget tracking.",
        "stargazers_count": 50
    }
]

results = [calculate_money_score(t) for t in tests]
print(json.dumps(results))
        `;
        const scriptPath = path.join('tests', 'tmp_test_money.py');
        fs.writeFileSync(scriptPath, testScript);
        try {
            const result = execSync(`${pythonPath} ${scriptPath}`).toString();
            const lines = result.trim().split('\n');
            const lastLine = lines[lines.length - 1];
            const scores = JSON.parse(lastLine);
            expect(scores[0]).toBeGreaterThanOrEqual(60);
            expect(scores[1]).toBeGreaterThanOrEqual(60);
        } finally {
            if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
        }
    });

    test('Combined Score Scenarios: Business vs Low-Value (v5.7.3)', () => {
        const testScript = `
import sys
import json
from pathlib import Path
root = Path('.').resolve()
sys.path.insert(0, str(root))
from scripts.pipelines.mbrn_horizon_scout import calculate_money_score

tests = [
    {"name": "Invoice Parser AI", "description": "Extracts data from PDF invoices using OCR automation.", "roi_score": 50},
    {"name": "Local LLM Assistant", "description": "Self-hosted Ollama assistant for desktop workflow.", "roi_score": 40},
    {"name": "Simple Budget Tool", "description": "Basic calculator for personal expenses.", "roi_score": 30},
    {"name": "Spam Tool", "description": "Experimental risky tool with no license.", "roi_score": 20}
]

def get_combined(money, roi):
    return (money * 0.6) + (roi * 0.3) + (50 * 0.1) # fit baseline 50

results = []
for t in tests:
    m = calculate_money_score(t)
    c = get_combined(m, t["roi_score"])
    results.append({"name": t["name"], "money": m, "combined": c})

print(json.dumps(results))
        `;
        const scriptPath = path.join('tests', 'tmp_test_scenarios.py');
        fs.writeFileSync(scriptPath, testScript);
        try {
            const result = execSync(`${pythonPath} ${scriptPath}`).toString();
            const lines = result.trim().split('\n');
            const scenarios = JSON.parse(lines[lines.length - 1]);
            
            // a) Invoice/Local-LLM should reach >= 60 (with baseline fit)
            const invoice = scenarios.find(s => s.name === "Invoice Parser AI");
            const localLLM = scenarios.find(s => s.name === "Local LLM Assistant");
            const simple = scenarios.find(s => s.name === "Simple Budget Tool");
            
            expect(invoice.combined).toBeGreaterThanOrEqual(60);
            expect(localLLM.combined).toBeGreaterThanOrEqual(60);
            
            // b) Simple low-value remains below prepare threshold (60)
            expect(simple.combined).toBeLessThan(60);
        } finally {
            if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
        }
    });

    test('Prime Director: Type Safety (Numeric Strings)', () => {
        const queueRoot = path.join('docs', 'S3_Data', 'outputs', 'integration_queue');
        const queueDir = path.join(queueRoot, 'automation');
        const decisionsFile = path.join('docs', 'S3_Data', 'outputs', 'prime_decisions.json');
        
        const stringCard = {
            module_name: "string_score_module",
            raw_data: {
                name: "string_score_module",
                combined_score: "85", // String!
                risk: "low"
            }
        };
        
        fs.writeFileSync(path.join(queueDir, 'string_score_module.json'), JSON.stringify(stringCard));
        fs.writeFileSync(path.join(queueDir, 'string_score_module.py'), '# Dummy');

        execSync(`${pythonPath} scripts/pipelines/mbrn_prime_director_v2.py --single`, { stdio: 'inherit' });
        
        const decisions = JSON.parse(fs.readFileSync(decisionsFile, 'utf-8'));
        const dec = decisions.find(d => d.module === "string_score_module");
        expect(dec.score).toBe(85.0);
        expect(dec.decision).toBe('prepare_integration');
        
        fs.unlinkSync(path.join(queueDir, 'string_score_module.json'));
        fs.unlinkSync(path.join(queueDir, 'string_score_module.py'));
    });
});
