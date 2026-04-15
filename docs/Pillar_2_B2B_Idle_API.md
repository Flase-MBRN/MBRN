# 🏛️ Pillar 2: B2B IDLE API — The Power Plant

> **Status:** 🚀 OPERATIONAL (Phase 5.3)  
> **Tech Stack:** Supabase Edge Functions (Deno)  
> **Pattern:** Singleton + Structured Returns + Rate Limiting  

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  PILLAR 2 — B2B IDLE API (The Power Plant)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │  Python Script  │───▶│  Edge Function  │───▶│  Postgres   │ │
│  │  (Pillar 3)     │    │  (Deno/TS)      │    │  (Storage)  │ │
│  │                 │    │                 │    │             │ │
│  │ • Bearer Auth   │    │ • Rate Limit    │    │ • RLS       │ │
│  │ • JSON Payload  │    │ • CORS Whitelist│    │ • Realtime  │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│           │                    │                              │
│           └────────────────────┘                              │
│                    ▼                                            │
│         ┌─────────────────┐                                    │
│         │  MBRN Dashboard │                                    │
│         │  (Real-time UI) │◄──── Supabase Realtime           │
│         └─────────────────┘                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Model

### Authentication
```typescript
// Bearer Token Verification
Authorization: Bearer <DATA_ARB_API_KEY>
```

| Layer | Implementation |
|-------|----------------|
| **Token Source** | `DATA_ARB_API_KEY` environment variable |
| **Validation** | Exact match against expected key |
| **Logging** | Truncated token only (security) |

### Rate Limiting
| Parameter | Value |
|-----------|-------|
| Max Requests | 10 per minute |
| Window | 60 seconds |
| Identifier | Client IP address |
| Response | `429 Too Many Requests` with `Retry-After` header |

### CORS Whitelist
```typescript
const ALLOWED_ORIGINS = [
  "https://flase-mbrn.github.io",  // Production
  "http://localhost:3000",         // Dev
  "http://localhost:8080",         // Dev
];
```

---

## Design Patterns

### Singleton Pattern
```typescript
// Module-scoped cache for Supabase client
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;  // Return cached instance
  // ... create new instance
}
```

**Benefits:**
- Eliminates connection overhead
- Reduces memory footprint
- Prevents auth token refresh storms

### Structured Returns (MBRN Law 4)
```typescript
// Success Response
{
  success: true,
  received_score: 65,
  source: "fear_greed_index",
  verdict: "Greed",
  timestamp: "2026-04-15T...",
  id: "uuid"
}

// Error Response
{
  success: false,
  error: "Invalid API key",
  code: "AUTH_INVALID"
}
```

### Error Logging
All operations logged with `[TAG]` prefixes:
- `[AUTH]` — Authentication events
- `[REQUEST]` — Request validation
- `[PAYLOAD]` — Payload processing
- `[DATABASE]` — Database operations
- `[SUCCESS]` — Successful inserts
- `[CRITICAL]` — Unhandled errors

---

## API Specification

### Endpoint
```
POST https://<project>.supabase.co/functions/v1/market_sentiment
```

### Request
```typescript
{
  source: string;           // "fear_greed_index" | "reddit_crypto" | ...
  sentiment_score: number; // 0-100
  verdict: string;          // "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed"
}
```

### Response Codes
| Code | Meaning |
|------|---------|
| 200 | Success — Record inserted |
| 401 | Unauthorized — Invalid Bearer token |
| 429 | Rate limited — Retry after X seconds |
| 400 | Bad Request — Invalid payload |
| 405 | Method Not Allowed — Only POST |
| 500 | Internal Error — Database or server |

---

## Environment Variables

| Variable | Purpose | Set By |
|----------|---------|--------|
| `SUPABASE_URL` | Project URL | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS bypass | Supabase |
| `DATA_ARB_API_KEY` | Bearer token validation | Manual |

---

## Database Schema

```sql
CREATE TABLE market_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  source TEXT NOT NULL,
  sentiment_score INTEGER CHECK (sentiment_score BETWEEN 0 AND 100),
  verdict TEXT NOT NULL,
  raw_data JSONB
);
```

### RLS Policies
```sql
-- Allow public read (for dashboard)
CREATE POLICY "Enable read access for all users" 
  ON market_sentiment FOR SELECT TO anon USING (true);

-- Allow authenticated read
CREATE POLICY "Enable read access for authenticated users" 
  ON market_sentiment FOR SELECT TO authenticated USING (true);

-- Allow service role full access (Edge Function)
CREATE POLICY "Service Role Full Access" 
  ON market_sentiment FOR ALL TO service_role USING (true);
```

---

## Usage Example

### Python Client (Pillar 3)
```python
import requests

response = requests.post(
    "https://project.supabase.co/functions/v1/market_sentiment",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    },
    json={
        "source": "fear_greed_index",
        "sentiment_score": 65,
        "verdict": "Greed"
    },
    timeout=30
)

# Response: {"success": true, "received_score": 65, ...}
```

---

## Monitoring

### Health Check
```bash
curl -X POST \
  -H "Authorization: Bearer $DATA_ARB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"source":"fear_greed_index","sentiment_score":50,"verdict":"Neutral"}' \
  https://project.supabase.co/functions/v1/market_sentiment
```

### Logs Location
Supabase Dashboard → Edge Functions → market_sentiment → Logs

---

## Related

- [[Pillar_3_Data_Arbitrage]] — Data source documentation
- [[Phase_5_UI_Tsunami]] — Phase 5 master document
- [[000_ARCHITECTURE]] — 15 Iron Laws

---

**System Architect:** Flase  
**Created:** April 15, 2026  
**Status:** 🟢 OPERATIONAL — Cloud Lockdown Complete
