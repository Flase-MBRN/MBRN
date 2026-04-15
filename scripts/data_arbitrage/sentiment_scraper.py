#!/usr/bin/env python3
"""
MBRN Market Sentiment Scraper
Phase 5.2.1-B — Pillar 3: Data Arbitrage (Production-Ready)

Fetches DSGVO-compliant market sentiment data from:
- Fear & Greed Index (alternative.me)
- CoinGecko (trending coins, global metrics, market data)

Features: 5-min caching, retry logic, structured logging, Bearer auth
Output: raw_sentiment_data.json → ready for Ollama enrichment (Task 5.2.2)
"""

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional

import requests
from dotenv import load_dotenv

from sources.fear_greed import FearGreedClient
from sources.coingecko import CoinGeckoClient

# Load environment variables from .env file
load_dotenv()


class SentimentScraper:
    """Main orchestrator for market sentiment data collection (Production-Ready)"""
    
    VERSION = "1.1.0"
    OUTPUT_DIR = Path("AI/models/data")
    OUTPUT_FILE = "raw_sentiment_data.json"
    CACHE_TTL_SECONDS = 300  # 5 minutes
    MAX_RETRIES = 3
    RETRY_DELAY_SECONDS = 2
    
    def __init__(self):
        self.fear_greed = FearGreedClient()
        self.coingecko = CoinGeckoClient()
        
        # Ensure output directory exists
        self.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    def log(self, level: str, message: str):
        """Structured logging with ISO timestamp"""
        timestamp = datetime.now(timezone.utc).isoformat()
        print(f"[{timestamp}] [{level}] {message}")
    
    def _load_cached_data(self) -> Optional[Dict[str, Any]]:
        """Load data from cache if still valid (within TTL)"""
        cache_path = self.OUTPUT_DIR / self.OUTPUT_FILE
        
        if not cache_path.exists():
            return None
        
        try:
            file_age = time.time() - cache_path.stat().st_mtime
            if file_age < self.CACHE_TTL_SECONDS:
                with open(cache_path, 'r', encoding='utf-8') as f:
                    cached_data = json.load(f)
                age_seconds = int(file_age)
                self.log("CACHE", f"Using local data (age: {age_seconds}s)")
                return cached_data
        except (IOError, json.JSONDecodeError) as e:
            self.log("WARN", f"Cache read failed: {e}")
        
        return None
    
    def collect(self) -> Dict[str, Any]:
        """
        Collect all sentiment data from configured sources
        Uses cache if data is younger than CACHE_TTL_SECONDS
        
        Returns:
            Structured sentiment data package
        """
        # Check cache first
        cached = self._load_cached_data()
        if cached:
            return cached
        
        self.log("INFO", "Starting sentiment data collection...")
        self.log("INFO", "Sources: Fear & Greed Index, CoinGecko")
        print("-" * 50)
        
        # Fetch from all sources
        fear_greed_data = self.fear_greed.fetch_current()
        trending_coins = self.coingecko.fetch_trending()
        global_metrics = self.coingecko.fetch_global_metrics()
        market_data = self.coingecko.fetch_market_data()
        
        # Build comprehensive dataset
        sentiment_package = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "MBRN_Data_Arbitrage",
            "version": self.VERSION,
            "data": {
                "fear_greed": fear_greed_data,
                "trending_coins": trending_coins if trending_coins else [],
                "global_metrics": global_metrics,
                "market_data": market_data if market_data else []
            },
            "metadata": {
                "sources": ["alternative.me", "coingecko"],
                "compliance": "DSGVO-safe (no personal data)",
                "pillar": "Pillar 3 - Data Arbitrage",
                "cache_used": False,
                "next_step": "Task 5.2.2: Ollama enrichment"
            }
        }
        
        # Summary
        print("-" * 50)
        if fear_greed_data:
            self.log("OK", f"Fear & Greed: {fear_greed_data['score']} ({fear_greed_data['classification']})")
        else:
            self.log("ERROR", "Fear & Greed: Failed")
        
        if trending_coins:
            self.log("OK", f"Trending Coins: {len(trending_coins)} coins fetched")
        else:
            self.log("ERROR", "Trending Coins: Failed")
        
        if global_metrics:
            self.log("OK", f"Global Metrics: ${global_metrics['total_market_cap_usd']:,.0f} market cap")
        else:
            self.log("ERROR", "Global Metrics: Failed")
        
        if market_data:
            self.log("OK", f"Market Data: {len(market_data)} top coins")
        else:
            self.log("ERROR", "Market Data: Failed")
        
        return sentiment_package
    
    def save(self, data: Dict[str, Any]) -> bool:
        """
        Save sentiment data to JSON file
        
        Args:
            data: The sentiment data package to save
            
        Returns:
            True if saved successfully
        """
        output_path = self.OUTPUT_DIR / self.OUTPUT_FILE
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            self.log("OK", f"Data saved to: {output_path}")
            self.log("OK", f"File size: {output_path.stat().st_size:,} bytes")
            return True
            
        except IOError as e:
            self.log("ERROR", f"Failed to save data: {e}")
            return False
    
    def run(self) -> bool:
        """
        Execute full scraping pipeline with retry logic
        
        Returns:
            True if successful
        """
        print("=" * 60)
        print("MBRN DATA ARBITRAGE — SENTIMENT SCRAPER v1.1")
        print("Pillar 3: Raw Material Warehouse [PRODUCTION]")
        print("=" * 60)
        print()
        
        # Collect data
        data = self.collect()
        
        # Save to file
        success = self.save(data)
        
        # Dispatch to Supabase (Uplink) with retry logic
        if success:
            for attempt in range(1, self.MAX_RETRIES + 1):
                try:
                    self.log("INFO", f"Uplink attempt {attempt}/{self.MAX_RETRIES}")
                    dispatch_success = self.dispatch_data(data)
                    if dispatch_success:
                        break
                    elif attempt < self.MAX_RETRIES:
                        self.log("RETRY", f"Waiting {self.RETRY_DELAY_SECONDS}s before retry...")
                        time.sleep(self.RETRY_DELAY_SECONDS)
                except Exception as e:
                    self.log("ERROR", f"Uplink exception: {e}")
                    if attempt < self.MAX_RETRIES:
                        self.log("RETRY", f"Waiting {self.RETRY_DELAY_SECONDS}s before retry...")
                        time.sleep(self.RETRY_DELAY_SECONDS)
            else:
                self.log("WARN", "All uplink attempts failed - continuing with local data only")
        
        # Final status
        print()
        print("=" * 60)
        if success:
            print("STATUS: OK - COLLECTION SUCCESSFUL")
            print("Ready for: Task 5.2.2 (Ollama enrichment)")
        else:
            print("STATUS: FAIL - COLLECTION FAILED")
        print("=" * 60)
        
        return success
    
    def dispatch_data(self, data: Dict[str, Any]) -> bool:
        """
        Dispatch collected data to Supabase Edge Function (Uplink)
        Maps fear_greed data to Edge Function schema with Bearer token auth
        
        Args:
            data: The sentiment data package to dispatch
            
        Returns:
            True if dispatch successful
        """
        edge_function_url = os.getenv('SUPABASE_EDGE_FUNCTION_URL')
        api_key = os.getenv('DATA_ARB_API_KEY')
        
        if not edge_function_url:
            self.log("WARN", "Dispatch: SUPABASE_EDGE_FUNCTION_URL not set in .env")
            return False
        
        if not api_key:
            self.log("WARN", "Dispatch: DATA_ARB_API_KEY not set in .env")
            return False
        
        # Extract fear_greed data for mapping
        fear_greed = data.get('data', {}).get('fear_greed', {})
        if not fear_greed:
            self.log("ERROR", "Dispatch: No fear_greed data available for mapping")
            return False
        
        # Map to Edge Function expected schema
        payload = {
            "source": "fear_greed_index",
            "sentiment_score": fear_greed.get('score', 50),
            "verdict": fear_greed.get('classification', 'Neutral'),
            "raw_data": data  # Full package with CoinGecko data, global metrics, etc.
        }
        
        self.log("INFO", f"Dispatching payload: score={payload['sentiment_score']}, verdict={payload['verdict']}")
        
        try:
            # Bearer token authentication with DATA_ARB_API_KEY
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                edge_function_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                self.log("OK", f"Uplink successful! HTTP {response.status_code}")
                self.log("OK", f"Edge Function received: score={result.get('received_score')}, verdict={result.get('verdict')}")
                return True
            elif response.status_code == 401:
                self.log("ERROR", f"Authentication failed (HTTP 401) - check DATA_ARB_API_KEY")
                return False
            else:
                self.log("ERROR", f"Uplink failed: HTTP {response.status_code}")
                self.log("ERROR", f"Response: {response.text[:200]}")
                return False
                
        except requests.exceptions.Timeout:
            self.log("ERROR", "Uplink timeout after 30s")
            return False
        except requests.exceptions.RequestException as e:
            self.log("ERROR", f"Uplink error: {e}")
            return False


def main():
    """Entry point"""
    scraper = SentimentScraper()
    success = scraper.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
