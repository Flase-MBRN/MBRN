# 🏛️ Pillar 3: Data Arbitrage — The Raw Material Warehouse

> **Status:** 🚀 ACTIVE (Phase 5.2)  
> **Tech Stack:** Python → Supabase Edge Functions → PostgreSQL  
> **Compliance:** DSGVO-safe (no personal data)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  PILLAR 3 — DATA ARBITRAGE (The Raw Material Warehouse)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │  Data Sources   │───▶│  Python Scraper │───▶│  Supabase   │ │
│  │                 │    │  (Local/RX7700) │    │  Edge Func  │ │
│  │ • Fear & Greed  │    │                 │    │             │ │
│  │ • CoinGecko     │    │  Task 5.2.1     │    │  Task 5.3.1 │ │
│  │ • (Extensible)  │    │                 │    │             │ │
│  └─────────────────┘    └─────────────────┘    └──────┬──────┘ │
│                                                     │          │
│                                                     ▼          │
│                                              ┌─────────────┐ │
│                                              │  Postgres   │ │
│                                              │  market_    │ │
│                                              │  sentiment  │ │
│                                              └──────┬──────┘ │
│                                                     │          │
└─────────────────────────────────────────────────────┼──────────┘
                                                      │
                              ┌───────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │  Pillar 4       │
                    │  MBRN Dashboard │
                    │  (Real-time UI) │
                    └─────────────────┘
```

---

## Technology Stack

### Python Layer (Local Execution)

| Component | Purpose | File |
|-----------|---------|------|
| `requests` | HTTP API calls to data sources | `requirements.txt` |
| `python-dotenv` | Environment variable management | `requirements.txt` |
| `sentiment_scraper.py` | Main orchestrator | Root of Pillar 3 |
| `fear_greed.py` | Fear & Greed Index client | `sources/` |
| `coingecko.py` | CoinGecko API client | `sources/` |

### Edge Function Layer (Cloud)

| Component | Purpose | File |
|-----------|---------|------|
| `market_sentiment` | Receives & validates payload | `supabase/functions/` |
| Bearer Auth | Token verification | `index.ts` |
| Schema Validation | Payload structure check | `index.ts` |

### Storage Layer

| Component | Schema | Purpose |
|-----------|--------|---------|
| `market_sentiment` table | id, timestamp, source, sentiment_score, verdict, raw_data | Persistent storage |
| Realtime | Postgres Changes | Live UI updates |

---

## Data Flow (Vertical Slice)

```
1. Python Scraper (Local)
   └─▶ Collects from Fear & Greed API + CoinGecko
   
2. JSON Payload Construction
   └─▶ { source: "fear_greed_index", sentiment_score: 65, verdict: "Greed" }
   
3. Uplink to Edge Function
   └─▶ POST /functions/v1/market_sentiment
   └─▶ Authorization: Bearer <SERVICE_ROLE_KEY>
   
4. Validation & Insert
   └─▶ Schema check → Database insert
   
5. Realtime Propagation
   └─▶ Supabase Realtime → Dashboard Widget
```

---

## Security Model

### Authentication
- **Method:** Bearer Token
- **Token Location:** `.env` (never committed)
- **Validation:** Length + Format check (see API Compliance Report)

### Environment Variables

```bash
# Required in .env (not .env.example)
SUPABASE_EDGE_FUNCTION_URL=https://project.supabase.co/functions/v1/market_sentiment
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Rotated quarterly
```

### GDPR Compliance
- **NO personal data** (emails, names, social profiles)
- **ONLY structural data** (market metrics, public sentiment)
- **Data retention:** Per Supabase RLS policies

---

## Usage

### Local Development

```bash
cd scripts/data_arbitrage

# 1. Setup environment
cp .env.example .env
# Edit .env with your actual keys

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run scraper
python sentiment_scraper.py
```

### Output
```
[MBRN] Starting sentiment data collection...
[OK] Fear & Greed: 65 (Greed)
[OK] Trending Coins: 7 coins fetched
[OK] Uplink successful! HTTP 200
```

---

## Extension Points

### Adding New Data Sources

1. Create `sources/new_source.py`
2. Implement fetch method with error handling
3. Add to `SentimentScraper.collect()`
4. Update metadata.sources array

### Schema Evolution

Edge Function supports these sources (see `ALLOWED_SOURCES`):
- `reddit_crypto` (planned)
- `twitter_crypto` (planned)
- `fear_greed_index` (active)
- `custom_feed` (extensible)

---

## Related Documentation

- [[Phase_5_UI_Tsunami]] — Phase 5.0 Master Doc
- [[000_ARCHITECTURE]] — 15 Iron Laws
- [[000_plan]] — Task 5.2.1, 5.2.2, 5.3.1
- [[api-compliance-report-phase-5-3]] — Security audit

---

**System Architect:** Flase  
**Created:** April 15, 2026  
**Status:** 🟢 OPERATIONAL — Vertical Slice Active
