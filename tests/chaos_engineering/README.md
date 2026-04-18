# MBRN Chaos Engineering Test Suite

> **Purpose:** Verify system resilience against real-world failure modes.
> **Anti-Pattern Addressed:** Kill Vector 4 — The Synergy Trap (testing only happy paths)

## Architecture Test Philosophy

```
Traditional Testing:       Chaos Engineering:
┌─────────────┐           ┌─────────────┐
│ Setup       │           │ Production  │
│ ↓           │           │ (or near)   │
│ Test        │           │ ↓           │
│ ↓           │           │ Inject      │
│ Teardown    │           │ Failures    │
└─────────────┘           │ ↓           │
                          │ Measure     │
                          │ Recovery    │
                          └─────────────┘
```

**Core Principle:** Test the system's ability to handle failure, not just its ability to avoid it.

---

## Test Inventory

### 1. `kill_vector_4_test.py` — System Resilience
**Failure Modes Tested:**
- ☠️ Ollama death mid-pipeline
- 🌐 Network partition (Yahoo Finance)
- 🚦 Rate limiting (429 responses)
- 📋 JSON schema drift (P3/P2 mismatch)
- ⚔️ Concurrent access conflicts

**Usage:**
```bash
# Run all tests
python kill_vector_4_test.py --mode=all

# Run specific test
python kill_vector_4_test.py --mode=ollama_death
python kill_vector_4_test.py --mode=network_partition
python kill_vector_4_test.py --mode=rate_limit
python kill_vector_4_test.py --mode=schema_drift
python kill_vector_4_test.py --mode=concurrent
```

**Expected Behavior:**
- Pipeline continues with degraded mode
- Partial results preserved
- Clear error messages
- Automatic retry on recovery

---

## Kill Vector 4: The Synergy Trap — Explained

### The Problem

The Synergy App (numerology matching) tests:
- ✅ Deterministic logic
- ✅ Stateless computation
- ✅ Instant response
- ✅ No external dependencies

**But real pipelines need:**
- 🔄 External API resilience
- 💾 State management
- ⏱️ Rate limiting
- 🛡️ Failure recovery

### The Test Gap

| Component | Synergy Tests | Real Pipeline Needs |
|-----------|--------------|-------------------|
| **State** | Stateless | Stateful (cache, retry) |
| **Network** | None | Circuit breaker required |
| **Rate Limits** | None | Queue + backoff essential |
| **Schema** | Fixed | Evolution + validation |
| **Concurrency** | Single user | Multi-thread safe |

### The Solution

Chaos engineering bridges this gap by:
1. **Intentionally causing failures**
2. **Measuring recovery time**
3. **Verifying graceful degradation**
4. **Ensuring no data loss**

---

## Integration with Queue-First Pipeline

The chaos tests validate the `queue_system.py` infrastructure:

```python
from queue_system import CircuitBreaker, PipelineQueue, WorkerPool

# Circuit breaker opens on Ollama death → Test: ollama_death
# Queue persists on crash → Test: network_partition  
# Workers respect GPU quota → Test: concurrent_access
# Retry with backoff → Test: rate_limiting
```

---

## CI/CD Integration

**Recommended:** Run chaos tests before every deployment.

```yaml
# .github/workflows/chaos.yml
name: Chaos Engineering
on: [push, pull_request]
jobs:
  chaos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Chaos Tests
        run: |
          python tests/chaos_engineering/kill_vector_4_test.py
        continue-on-error: false  # Block deployment on failure
```

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Recovery time after Ollama death | <30s | TBD |
| Data loss during network partition | 0% | TBD |
| Successful retry rate | >95% | TBD |
| Schema drift detection | 100% | TBD |
| Concurrent corruption | 0 incidents | TBD |

---

## Running the Full Anti-Kill-Vector Suite

```bash
# 1. Queue system test
cd scripts/pipelines
python queue_system.py

# 2. Chaos engineering
cd ../../tests/chaos_engineering
python kill_vector_4_test.py --mode=all

# 3. Queued pipeline (production)
cd ../../scripts/pipelines
python market_sentiment_queued.py --tickers SPY QQQ --workers 2
```

---

**Status:** CHAOS_ENGINEERING_v1.0_ACTIVE  
**Next Steps:** Add more failure modes as system evolves.
