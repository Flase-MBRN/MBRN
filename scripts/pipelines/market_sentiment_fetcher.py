#!/usr/bin/env python3
"""
/scripts/pipelines/market_sentiment_fetcher.py
PILLAR 3: DATA ARBITRAGE — Market Sentiment Data Pipeline

SÄULE 3 (Data Arbitrage) → SÄULE 2 (API) → SÄULE 4 (Ecosystem)

Responsibilities:
1. Fetch market data from Yahoo Finance (yfinance)
2. Enrich with local Ollama LLM sentiment analysis
3. Output structured JSON for Supabase ingestion

Hardware Optimized For: RX 7700 XT (local LLM inference)
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any
import urllib.request
import urllib.error

# =============================================================================
# CONFIGURATION
# =============================================================================

CONFIG = {
    "ollama": {
        "host": "localhost",
        "port": 11434,
        "model": "llama3.1:8b",  # oder "mistral", "gemma:2b"
        "temperature": 0.3,
    },
    "data": {
        "output_dir": "../../AI/models/data",
        "filename_template": "market_sentiment_{timestamp}.json",
        "tickers": ["SPY", "QQQ", "DIA", "IWM", "^VIX"],  # Major indices
        "lookback_days": 5,
    },
    "mbrn": {
        "sentiment_scale": 100,  # 0-100 MBRN Score
        "min_confidence": 0.6,
    }
}

# =============================================================================
# DATA FETCHING (Yahoo Finance via yfinance or fallback)
# =============================================================================

def fetch_market_data(ticker: str) -> Optional[Dict[str, Any]]:
    """
    Fetch market data for a given ticker symbol.
    
    Primary: yfinance (if available)
    Fallback: Manual Yahoo Finance API scraping
    
    Args:
        ticker: Stock symbol (e.g., "SPY", "QQQ")
        
    Returns:
        Dict with market data or None if failed
    """
    try:
        # Try yfinance first (pip install yfinance)
        import yfinance as yf
        
        stock = yf.Ticker(ticker)
        hist = stock.history(period="5d")
        info = stock.info
        
        if hist.empty:
            return None
            
        latest = hist.iloc[-1]
        prev = hist.iloc[-2] if len(hist) > 1 else latest
        
        change = latest['Close'] - prev['Close']
        change_pct = (change / prev['Close']) * 100 if prev['Close'] != 0 else 0
        
        return {
            "ticker": ticker,
            "price": round(latest['Close'], 2),
            "change": round(change, 2),
            "change_percent": round(change_pct, 2),
            "volume": int(latest['Volume']),
            "high": round(latest['High'], 2),
            "low": round(latest['Low'], 2),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "yfinance"
        }
        
    except ImportError:
        print(f"[WARN] yfinance not installed. Using fallback for {ticker}")
        return fetch_market_data_fallback(ticker)
        
    except Exception as e:
        print(f"[ERROR] Failed to fetch {ticker}: {e}")
        return None


def fetch_market_data_fallback(ticker: str) -> Optional[Dict[str, Any]]:
    """
    Fallback data fetcher using basic HTTP request.
    Returns mock data structure for development.
    """
    # In production, implement actual scraping here
    # For now, return structure for Ollama testing
    return {
        "ticker": ticker,
        "price": 0.0,
        "change": 0.0,
        "change_percent": 0.0,
        "volume": 0,
        "high": 0.0,
        "low": 0.0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "fallback_mock",
        "note": "Install yfinance: pip install yfinance"
    }


def fetch_batch_data(tickers: List[str]) -> List[Dict[str, Any]]:
    """Fetch data for multiple tickers."""
    results = []
    for ticker in tickers:
        data = fetch_market_data(ticker)
        if data:
            results.append(data)
    return results


# =============================================================================
# OLLAMA LOCAL LLM ENRICHMENT (RX 7700 XT Optimized)
# =============================================================================

def check_ollama_health() -> bool:
    """Check if Ollama is running locally."""
    try:
        url = f"http://{CONFIG['ollama']['host']}:{CONFIG['ollama']['port']}/api/tags"
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status == 200
    except Exception:
        return False


def enrich_with_ollama(market_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Enrich market data with local LLM sentiment analysis.
    
    Uses Ollama running on localhost:11434 with Llama 3.1 8B.
    The RX 7700 XT handles this efficiently for batch inference.
    
    Args:
        market_data: List of market data dicts
        
    Returns:
        Enriched data with MBRN sentiment scores
    """
    if not check_ollama_health():
        print("[WARN] Ollama not available. Skipping LLM enrichment.")
        return {
            "sentiment_score": 50,
            "confidence": 0.0,
            "analysis": "Ollama unavailable - default neutral score",
            "recommendation": "hold",
            "model": "none"
        }
    
    # Build prompt for sentiment analysis
    market_summary = "\n".join([
        f"{d['ticker']}: ${d['price']} ({d['change_percent']:+.2f}%)"
        for d in market_data
    ])
    
    prompt = f"""Analyze the following market data and provide a sentiment score from 0-100 
where 0 is extremely bearish and 100 is extremely bullish. Be concise.

Market Data:
{market_summary}

Respond in this exact JSON format:
{{
    "sentiment_score": <0-100>,
    "confidence": <0.0-1.0>,
    "analysis": "<one sentence summary>",
    "recommendation": "<buy/sell/hold>"
}}"""

    try:
        url = f"http://{CONFIG['ollama']['host']}:{CONFIG['ollama']['port']}/api/generate"
        
        payload = {
            "model": CONFIG['ollama']['model'],
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": CONFIG['ollama']['temperature']
            }
        }
        
        data = json.dumps(payload).encode('utf-8')
        headers = {'Content-Type': 'application/json'}
        
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            # Parse LLM response (expecting JSON in response)
            try:
                llm_output = result.get('response', '{}')
                # Extract JSON from potential markdown code blocks
                if '```json' in llm_output:
                    llm_output = llm_output.split('```json')[1].split('```')[0]
                elif '```' in llm_output:
                    llm_output = llm_output.split('```')[1].split('```')[0]
                    
                sentiment_data = json.loads(llm_output.strip())
                
                # Validate and normalize
                return {
                    "sentiment_score": max(0, min(100, int(sentiment_data.get('sentiment_score', 50)))),
                    "confidence": max(0.0, min(1.0, float(sentiment_data.get('confidence', 0.5)))),
                    "analysis": sentiment_data.get('analysis', 'No analysis provided'),
                    "recommendation": sentiment_data.get('recommendation', 'hold').lower(),
                    "model": CONFIG['ollama']['model'],
                    "processed_at": datetime.now(timezone.utc).isoformat()
                }
                
            except json.JSONDecodeError:
                # Fallback: extract sentiment from text
                return {
                    "sentiment_score": 50,
                    "confidence": 0.3,
                    "analysis": f"Failed to parse LLM output: {llm_output[:100]}...",
                    "recommendation": "hold",
                    "model": CONFIG['ollama']['model'],
                    "processed_at": datetime.now(timezone.utc).isoformat()
                }
                
    except Exception as e:
        print(f"[ERROR] Ollama enrichment failed: {e}")
        return {
            "sentiment_score": 50,
            "confidence": 0.0,
            "analysis": f"Error: {str(e)}",
            "recommendation": "hold",
            "model": CONFIG['ollama']['model'],
            "processed_at": datetime.now(timezone.utc).isoformat()
        }


# =============================================================================
# OUTPUT & STORAGE
# =============================================================================

def save_to_json(data: Dict[str, Any], output_dir: Optional[str] = None) -> str:
    """
    Save enriched data to JSON file.
    
    Args:
        data: Enriched market sentiment data
        output_dir: Custom output directory (default from CONFIG)
        
    Returns:
        Path to saved file
    """
    output_path = Path(output_dir or CONFIG['data']['output_dir'])
    output_path.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = CONFIG['data']['filename_template'].format(timestamp=timestamp)
    filepath = output_path / filename
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"[INFO] Data saved to: {filepath}")
    return str(filepath)


def save_for_dashboard(data: Dict[str, Any]) -> str:
    """
    Save data in format expected by dashboard widget.
    Writes to docs/S3_Data/market_sentiment.json
    """
    dashboard_path = Path("c:/DevLab/MBRN-HUB-V1/shared/data/market_sentiment.json")
    dashboard_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Format for dashboard consumption
    dashboard_data = {
        "timestamp_utc": data['fetched_at'],
        "source": "market_sentiment_pipeline",
        "sentiment_score": data['enrichment']['sentiment_score'],
        "sentiment_label": get_sentiment_label(data['enrichment']['sentiment_score']),
        "confidence": data['enrichment']['confidence'],
        "analysis": data['enrichment']['analysis'],
        "recommendation": data['enrichment']['recommendation'],
        "market_data": data['market_data'],
        "mbrn_enriched": data['enrichment']
    }
    
    with open(dashboard_path, 'w', encoding='utf-8') as f:
        json.dump(dashboard_data, f, indent=2, ensure_ascii=False)
    
    print(f"[INFO] Dashboard data saved to: {dashboard_path}")
    return str(dashboard_path)


def get_sentiment_label(score: int) -> str:
    """Convert numeric score to sentiment label."""
    if score <= 20:
        return "Extreme Fear"
    elif score <= 40:
        return "Fear"
    elif score <= 60:
        return "Neutral"
    elif score <= 80:
        return "Greed"
    else:
        return "Extreme Greed"


def prepare_for_supabase(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare data for Supabase ingestion.
    
    Returns:
        Dict formatted for Supabase edge function import
    """
    return {
        "id": f"mkt_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "market_sentiment_pipeline",
        "sentiment_score": data['enrichment']['sentiment_score'],
        "verdict": get_sentiment_label(data['enrichment']['sentiment_score']),
        "confidence": data['enrichment']['confidence'],
        "recommendation": data['enrichment']['recommendation'],
        "raw_data": data['market_data'],
        "mbrn_enriched": data['enrichment'],
        "metadata": {
            "pipeline_version": "1.0.0",
            "ollama_model": data['enrichment'].get('model', 'none'),
            "tickers_analyzed": len(data['market_data'])
        }
    }


# =============================================================================
# OUTPUT & STORAGE
# =============================================================================

def push_to_supabase(payload: Dict[str, Any]) -> bool:
    """Push data to Supabase Edge Function via HTTP POST."""
    from dotenv import load_dotenv
    load_dotenv(Path("c:/DevLab/MBRN-HUB-V1/scripts/pipelines/.env"))
    
    url = os.getenv("SUPABASE_EDGE_FUNCTION_URL", "http://127.0.0.1:54321/functions/v1/market_sentiment")
    api_key = os.getenv("DATA_ARB_API_KEY")
    
    if not api_key:
        print("[WARN] DATA_ARB_API_KEY not found in .env. Skipping Supabase push.")
        return False
        
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, method="POST")
        req.add_header('Content-Type', 'application/json')
        req.add_header('Authorization', f'Bearer {api_key}')
        
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status in (200, 201):
                print(f"[OK] Successfully pushed to Supabase: {response.read().decode()}")
                return True
            else:
                print(f"[ERROR] Supabase push failed with status {response.status}: {response.read().decode()}")
                return False
                
    except urllib.error.HTTPError as e:
        print(f"[ERROR] Supabase push failed with HTTP {e.code}: {e.read().decode()}")
        return False
    except Exception as e:
        print(f"[ERROR] Exception during Supabase push: {e}")
        return False


# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main():
    """
    Main execution: Full Pillar 3 Data Arbitrage Pipeline.
    
    Flow:
    1. Fetch market data (Yahoo Finance)
    2. Enrich with Ollama LLM (local)
    3. Save to JSON
    4. Output Supabase-ready format to stdout
    """
    print("=" * 60)
    print("MBRN PILLAR 3: Data Arbitrage Pipeline")
    print("Market Sentiment Fetcher v1.0")
    print("=" * 60)
    
    # Step 1: Fetch Data
    print("\n[1/4] Fetching market data...")
    tickers = CONFIG['data']['tickers']
    market_data = fetch_batch_data(tickers)
    
    if not market_data:
        print("[FATAL] No market data fetched. Exiting.")
        sys.exit(1)
    
    print(f"[OK] Fetched data for {len(market_data)} tickers")
    
    # Step 2: Enrich with Ollama
    print("\n[2/4] Enriching with Ollama LLM...")
    print(f"       Model: {CONFIG['ollama']['model']}")
    print(f"       Host: {CONFIG['ollama']['host']}:{CONFIG['ollama']['port']}")
    
    enrichment = enrich_with_ollama(market_data)
    
    print(f"[OK] Sentiment Score: {enrichment['sentiment_score']}/100")
    print(f"     Confidence: {enrichment['confidence']:.1%}")
    print(f"     Analysis: {enrichment['analysis']}")
    
    # Step 3: Combine data
    full_record = {
        "pipeline": "market_sentiment",
        "version": "1.0.0",
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "market_data": market_data,
        "enrichment": enrichment
    }
    
    # Step 4: Save locally
    print("\n[3/4] Saving to local storage...")
    saved_path = save_to_json(full_record)
    
    # Step 4b: Save for dashboard
    print("\n[3b/4] Saving dashboard data...")
    dashboard_path = save_for_dashboard(full_record)
    
    # Step 5: Output Supabase format
    print("\n[4/4] Preparing Supabase payload...")
    supabase_data = prepare_for_supabase(full_record)
    
    # Output to stdout for piping to edge function
    print("\n--- SUPABASE PAYLOAD ---")
    print(json.dumps(supabase_data, indent=2))
    
    print("\n[5/5] Pushing to Supabase Edge Function...")
    push_to_supabase(supabase_data)
    
    print("\n" + "=" * 60)
    print("Pipeline Complete. Next steps:")
    print(f"  1. Data saved: {saved_path}")
    print(f"  2. Dashboard data: {dashboard_path}")
    print("  3. Verify in Dashboard widget")
    print("=" * 60)
    
    return supabase_data

if __name__ == "__main__":
    result = main()
    sys.exit(0 if result else 1)
