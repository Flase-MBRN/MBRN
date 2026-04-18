# MBRN Data Arbitrage — Pillar 3 Pipelines

> **Location:** `/scripts/pipelines/`  
> **Purpose:** Automated data collection for all 4 Pillars  
> **Compliance:** DSGVO-safe — no personal data, only structural B2B data  

---

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Copy environment config
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Run a pipeline
python sentiment_scraper.py          # Crypto/Fear-Greed data
python market_sentiment_fetcher.py # Stock/Indices data
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PILLAR 3: DATA ARBITRAGE                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐     ┌──────────────────┐              │
│  │ sentiment_       │     │ market_sentiment │              │
│  │ _scraper.py      │     │ _fetcher.py      │              │
│  │                  │     │                  │              │
│  │ • Fear & Greed   │     │ • Yahoo Finance  │              │
│  │ • CoinGecko      │     │ • Ollama Enrich  │              │
│  │ • Crypto Trends  │     │ • Stock Indices  │              │
│  └────────┬─────────┘     └────────┬─────────┘              │
│           │                        │                         │
│           └────────┬───────────────┘                         │
│                    │                                         │
│           ┌────────▼─────────┐                               │
│           │ pipeline_utils   │                               │
│           │ .py              │                               │
│           │                  │                               │
│           │ • SupabaseUplink │                               │
│           │ • OllamaEnricher │                               │
│           │ • PipelineCache  │                               │
│           │ • RetryHandler   │                               │
│           └────────┬─────────┘                               │
│                    │                                         │
│           ┌────────▼─────────┐                               │
│           │     OUTPUT       │                               │
│           │ AI/models/data/  │                               │
│           └────────┬─────────┘                               │
│                    │                                         │
│                    ▼                                         │
│           ┌──────────────────┐                               │
│           │  SUPABASE      │  ◄──── Pillar 2 (API)         │
│           │  EDGE FUNCTION │                               │
│           └──────────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Pipelines

### `sentiment_scraper.py` — Crypto Sentiment

**Data Sources:**
- Fear & Greed Index (alternative.me)
- CoinGecko (trending coins, global metrics)

**Features:**
- 5-minute caching
- Structured logging
- Bearer auth Supabase uplink
- Retry logic with exponential backoff

**Output:**
```json
{
  "timestamp": "2026-04-16T10:30:00Z",
  "data": {
    "fear_greed": {"score": 75, "classification": "Greed"},
    "trending_coins": [...],
    "global_metrics": {...}
  }
}
```

---

### `market_sentiment_fetcher.py` — Stock Market Sentiment

**Data Sources:**
- Yahoo Finance (SPY, QQQ, DIA, IWM, VIX)

**Features:**
- Local Ollama LLM enrichment
- RX 7700 XT optimized inference
- Sentiment scoring (0-100)
- yfinance integration

**Output:**
```json
{
  "pipeline": "market_sentiment",
  "market_data": [...],
  "enrichment": {
    "sentiment_score": 65,
    "confidence": 0.85,
    "recommendation": "hold"
  }
}
```

---

## Shared Utils (`pipeline_utils.py`)

### SupabaseUplink
```python
from pipeline_utils import SupabaseUplink

uplink = SupabaseUplink()
success = uplink.dispatch({
    "sentiment_score": 75,
    "verdict": "bullish",
    "raw_data": {...}
})
```

### OllamaEnricher
```python
from pipeline_utils import OllamaEnricher

enricher = OllamaEnricher()
result = enricher.analyze_sentiment("SPY: $450 (+1.2%)")
# Returns: {"sentiment_score": 65, "confidence": 0.8, ...}
```

### PipelineCache
```python
from pipeline_utils import PipelineCache

cache = PipelineCache()
cache.set("market_data", data)
cached = cache.get("market_data")  # Returns None if expired (5min TTL)
```

---

## Automation (Cron/Task Scheduler)

### Linux/Mac (Cron)
```bash
# Edit crontab
crontab -e

# Run every 15 minutes
*/15 * * * * cd /path/to/MBRN-HUB-V1/scripts/pipelines && python sentiment_scraper.py >> /var/log/mbrn_sentiment.log 2>&1

# Run hourly for market data
0 * * * * cd /path/to/MBRN-HUB-V1/scripts/pipelines && python market_sentiment_fetcher.py >> /var/log/mbrn_market.log 2>&1
```

### Windows (Task Scheduler)

1. **Open Task Scheduler** (`taskschd.msc`)

2. **Create Basic Task:**
   - Name: `MBRN Sentiment Scraper`
   - Trigger: Daily, every 15 minutes
   - Action: Start a program
   - Program: `python`
   - Arguments: `sentiment_scraper.py`
   - Start in: `C:\DevLab\MBRN-HUB-V1\scripts\pipelines`

3. **Enable "Run whether user is logged on or not"**

4. **Repeat for** `market_sentiment_fetcher.py` (hourly)

---

## Environment Variables (.env)

```bash
# Supabase Edge Function Configuration
SUPABASE_EDGE_FUNCTION_URL=https://your-project.supabase.co/functions/v1/market_sentiment
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATA_ARB_API_KEY=your-data-arbitrage-api-key-here

# Optional
DEBUG=false
```

**Security Warning:**
- Never commit `.env` to version control
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — keep it secret!
- `DATA_ARB_API_KEY` must match the Edge Function environment

---

## 🤖 Automation Setup — Cronjob Configuration

### Windows (Task Scheduler)

1. **Open Task Scheduler:** `Win + R` → `taskschd.msc`

2. **Create Basic Task:**
   - Name: `MBRN Market Sentiment Pipeline`
   - Trigger: Daily at 06:00 AM
   - Action: Start a program
   - Program: `python` (or full path to python.exe)
   - Arguments: `scripts/pipelines/sentiment_scraper.py`
   - Start in: `C:\DevLab\MBRN-HUB-V1` (adjust to your project root)

3. **Advanced Settings:**
   - ✓ Run whether user is logged on or not
   - ✓ Run with highest privileges
   - Configure for: Windows 10/11

4. **Multiple Pipelines:** Create separate tasks for each pipeline:
   - `sentiment_scraper.py` → Every 4 hours (Crypto/Fear-Greed)
   - `market_sentiment_fetcher.py` → Daily 6 AM (Stock/Indices)

### Linux/macOS (Cron)

```bash
# Edit crontab
crontab -e

# Add entries (runs at specified times)
# Crypto/Fear-Greed: Every 4 hours
0 */4 * * * cd /path/to/MBRN-HUB-V1 && /usr/bin/python3 scripts/pipelines/sentiment_scraper.py >> logs/pipeline.log 2>&1

# Stock/Indices: Daily at 6 AM
0 6 * * * cd /path/to/MBRN-HUB-V1 && /usr/bin/python3 scripts/pipelines/market_sentiment_fetcher.py >> logs/pipeline.log 2>&1
```

### Recommended Schedule

| Pipeline | Frequency | Use Case | Cron Expression |
|----------|-----------|----------|-----------------|
| Crypto/Fear-Greed | Every 4 hours | High volatility market | `0 */4 * * *` |
| Stock/Indices | Daily 6 AM | Pre-market open data | `0 6 * * *` |

### Verification

Check if automation is working:

```bash
# Check last run timestamp
tail -1 AI/models/data/market_sentiment.json | python -m json.tool | grep timestamp

# Or on Windows PowerShell
Get-Content AI/models/data/market_sentiment.json -Tail 1 | ConvertFrom-Json | Select-Object timestamp
```

### Log Rotation

Prevent log files from growing indefinitely:

**Linux/macOS:**
```bash
# Add to crontab (weekly log rotation)
0 0 * * 0 cd /path/to/MBRN-HUB-V1 && mv logs/pipeline.log logs/pipeline-$(date +%Y%m%d).log
```

**Windows:** Use Task Scheduler to run monthly cleanup script.

---

## Compliance

- **DSGVO/GDPR Compliant:** No personal data collection
- **B2B Focus:** Structural data, company metrics, trends
- **Public Sources Only:** All data from public APIs

---

## Troubleshooting

### Ollama not available
```bash
# Start Ollama server
ollama serve

# Pull required model
ollama pull llama3.1:8b
```

### Supabase auth failed
- Check `DATA_ARB_API_KEY` in `.env`
- Verify Edge Function URL
- Check Supabase function logs

### Cache not working
- Ensure `AI/models/data/` directory exists and is writable
- Check file permissions

---

**Architect:** Flase | **Pillar:** 3 | **Status:** Production Ready
