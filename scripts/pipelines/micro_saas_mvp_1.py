#!/usr/bin/env python3
"""
/scripts/pipelines/micro_saas_mvp_1.py
PROJECT ORACLE - Micro-SaaS MVP 1: Causal Financial Advisor

Extracted from Vegapunk-debug blueprint.
Provides causal analysis of market movements between VIX, QQQ, and BTC.
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# =============================================================================
# PATH HANDLING
# =============================================================================
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

PIPELINES_DIR = PROJECT_ROOT / "scripts" / "pipelines"
if str(PIPELINES_DIR) not in sys.path:
    sys.path.append(str(PIPELINES_DIR))

from bridges.local_llm.bridge import LocalLLMBridge, LocalLLMBridgeConfig
from pipeline_utils import (
    load_pipeline_env,
    log,
    save_json_atomic,
)

# =============================================================================
# CONFIGURATION
# =============================================================================
CONFIG = {
    "input_file": PROJECT_ROOT / "shared" / "data" / "market_sentiment.json",
    "output_dir": PROJECT_ROOT / "AI" / "models" / "reports",
    "model": "deepseek-coder-v2",
}

# =============================================================================
# CAUSAL ANALYSIS LOGIC
# =============================================================================

class OracleCausalEngine:
    """
    Core logic extracted from Vegapunk-debug.
    Performs causal reasoning over market indices.
    """
    
    def __init__(self, bridge: LocalLLMBridge):
        self.bridge = bridge

    def generate_report(self, market_snapshot: Dict[str, Any]) -> str:
        """Generate a causal analysis report based on market snapshot."""
        
        # Extract relevant data points
        market_data = market_snapshot.get("market_data", [])
        vix = next((item for item in market_data if item["ticker"] == "^VIX"), {})
        qqq = next((item for item in market_data if item["ticker"] == "QQQ"), {})
        btc = next((item for item in market_data if item["ticker"] == "BTC-USD"), {})
        news = market_snapshot.get("news_feed", [])
        
        # Construct context string
        context = f"""
        MARKET SNAPSHOT:
        - VIX (Volatility Index): {vix.get('price')} ({vix.get('change_percent')}% change)
        - QQQ (Nasdaq-100): {qqq.get('price')} ({qqq.get('change_percent')}% change)
        - BTC-USD: {btc.get('price')} ({btc.get('change_percent')}% change)
        
        LATEST HEADLINES:
        {chr(10).join([f"- {n.get('title')}" for n in news[:5]])}
        """

        prompt = f"""
        You are the 'Oracle Causal Engine', a Senior Financial Causal Analyst.
        Your task is to analyze the following market data and provide a professional CAUSALITY REPORT.
        
        {context}
        
        Your report must follow this EXACT structure:
        
        # PROJECT ORACLE: CAUSALITY REPORT
        
        ## 1. MARKET CONTEXT
        [Brief macro summary based on news and prices]
        
        ## 2. CAUSAL EVIDENCE (VIX -> QQQ -> BTC)
        [Explain the causal connection between Volatility (VIX), Tech Growth (QQQ), and Risk Assets (BTC). 
        How did the current VIX level influence the tech sell-off or rally, and how did that propagate to Crypto?]
        
        ## 3. RISK OUTLOOK
        [Identify the primary causal threat for the next 24-48 hours]
        
        ## 4. ACTIONABLE ADVICE
        [Concrete Buy/Sell/Hedge/Hold instructions with reasoning]
        
        Respond in professional Markdown format. Be precise, avoid generic filler.
        """

        log("INFO", "Initiating causal analysis via local LLM...")
        
        # Use internal _request_model to get raw text instead of JSON
        try:
            response = self.bridge._request_model(
                prompt=prompt,
                worker_name="oracle_causal_analysis"
            )
            return response
        except Exception as exc:
            log("ERROR", f"Causal analysis failed: {exc}")
            return f"Error: {exc}"

# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main():
    load_pipeline_env()
    
    log("INFO", "PROJECT ORACLE: Micro-SaaS MVP 1 - Initialization")
    
    # 1. Load Data
    if not CONFIG["input_file"].exists():
        log("ERROR", f"Input file not found: {CONFIG['input_file']}")
        sys.exit(1)
        
    with open(CONFIG["input_file"], "r", encoding="utf-8") as f:
        market_snapshot = json.load(f)
        
    # 2. Setup Bridge
    bridge_config = LocalLLMBridgeConfig(
        model=CONFIG["model"],
        timeout_seconds=300
    )
    bridge = LocalLLMBridge(bridge_config)
    
    if not bridge.is_available():
        log("ERROR", "Local LLM service (Ollama) is not available.")
        sys.exit(1)
        
    # 3. Execute Analysis
    engine = OracleCausalEngine(bridge)
    report = engine.generate_report(market_snapshot)
    
    # 4. Save Output
    CONFIG["output_dir"].mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    report_file = CONFIG["output_dir"] / f"causal_report_{timestamp}.md"
    
    with open(report_file, "w", encoding="utf-8") as f:
        f.write(report)
        
    # Also save as canonical 'latest' for the dashboard widget
    latest_file = CONFIG["output_dir"] / "latest_causal_report.md"
    with open(latest_file, "w", encoding="utf-8") as f:
        f.write(report)
        
    log("OK", f"Causal Report generated: {report_file}")
    log("INFO", f"Updated canonical report: {latest_file}")
    
    # Print report for the user
    print("\n" + "="*60)
    print("GENERATED CAUSALITY REPORT")
    print("="*60 + "\n")
    print(report)
    print("\n" + "="*60)

if __name__ == "__main__":
    main()
