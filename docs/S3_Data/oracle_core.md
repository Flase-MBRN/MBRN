> **Interne Betriebsdoku:** Veraltete Sprache. Nicht für Architektur-Status-Checks durch Agenten verwenden.

# Oracle Core — MBRN System Brain v1.1

**Säule 4: Ecosystem — Oracle Module**

---

## Übersicht

Oracle Core verbindet numerologische Tageswerte mit Market-Sentiment, Krypto-Druck und News-Flow. Das Modul erzeugt eine Prognose für den nächsten Handelstag, spiegelt sie atomar in den Shared-Data-Bereich und führt fortlaufendes Backtesting gegen die nachgelagerte Marktbewegung aus.

---

## Architektur

```text
scripts/oracle/
├── oracle_core.py         # Orchestration, Prognose, Backtesting, Shared Mirror
├── numerology_engine.py   # Tageszahlen und historische Numerologie
├── data_bridge.py         # Daten-Brücke zwischen Numerologie und Market Sentiment
├── correlation_matrix.py  # Mustererkennung und gewichtete Korrelation
└── backfill_history.py    # Historischer Replay-/Trainingsaufbau
```

Oracle schreibt in zwei Zonen:

- `scripts/oracle/predictions/oracle_prediction_YYYYMMDD_HHMMSS.json`
- `shared/data/oracle_prediction.json`

Backtesting lebt in:

- `shared/data/oracle_backtest.json`

Alle JSON-Schreibvorgänge nutzen `save_json_atomic()` aus `scripts/pipelines/pipeline_utils.py`.

Die stündliche Ausführung ist für den bestehenden Sentinel-/Worker-Pfad vorgesehen:

- `scripts/pipelines/worker_registry.py` enthält den Oracle-Worker
- `scripts/pipelines/sentinel_daemon.py` stellt den Importpfad für `oracle.oracle_core` bereit

---

## Laufzeitdaten

### Eingänge

**Pillar 1**

- `shared/data/numerology_history.json`
- dynamische Tagesberechnung aus `numerology_engine.py`

**Pillar 3**

- `AI/models/data/market_sentiment_*.json`
- angereichert über `market_sentiment_fetcher.py`

### Abgeleitete Marktsignale

`data_bridge.py` erweitert die Sentiment-Daten für Oracle um:

- `crypto_snapshot`
- `crypto_sentiment`
- `news_signal`
- `news_impact`
- `headline_count`
- `news_items`

---

## Kernfunktionen

### `generate_prediction(target_date)`

Erzeugt die Oracle-Prognose für den nächsten Handelstag und kombiniert:

- Tageszahl und Tagesbeschreibung
- letzte Marktstimmung und Trendrichtung
- numerologische Muster aus der Korrelationsmatrix
- Krypto-Druck aus BTC/ETH
- News-Flow und News-Impact

### `generate_trading_recommendation(...)`

Leitet `Buy`, `Hold`, `Caution` oder `Sell` aus Alignment, Vertrauen, Prognosewert und Vorzustand ab.

### `update_backtesting(prediction)`

Persistiert die Vorhersagehistorie, bewertet reife Einträge gegen den nächsten realen Marktwert und berechnet die laufende Oracle-Accuracy.

### `summarize_backtest_history(history)`

Berechnet:

- `accuracy_pct`
- `total_predictions`
- `evaluated_predictions`
- `correct_predictions`
- `pending_predictions`
- `latest_result`

Wenn `accuracy_pct > 95`, wird intern diese Warnung geloggt:

```text
[WARN] High Accuracy detected - potential backfill bias
```

Die Warnung verändert nicht das persistierte Schema.

---

## Output-Schema

Beispielhafter Shared Mirror:

```json
{
  "timestamp_utc": "2026-04-19T18:23:09.777474+00:00",
  "target_date": "20.04.2026",
  "oracle_version": "1.1.0",
  "day_numerology": {
    "day_number": 7,
    "is_master": false,
    "description": "Analyse, Spiritualität, Intuition"
  },
  "market_context": {
    "previous_sentiment": 60,
    "previous_vix": 17.48,
    "sentiment_trend": "neutral",
    "sentiment_trend_value": 3.33,
    "crypto_snapshot": {},
    "crypto_sentiment": 50.0,
    "news_signal": "neutral",
    "news_impact": 0,
    "headline_count": 0,
    "news_items": []
  },
  "prediction": {
    "alignment_score": 61.02,
    "confidence": 0.61,
    "sentiment_prediction": 53.67,
    "trading_recommendation": "Hold",
    "reasoning": "Tag 7 ...",
    "alignment_breakdown": {
      "base_alignment_score": 61.02,
      "crypto_modifier": 0.0,
      "news_modifier": 0.0,
      "day_multiplier": 0.95,
      "total_modifier": 0.0,
      "final_alignment_score": 61.02
    },
    "oracle_accuracy": 98.61
  },
  "correlation_summary": {
    "analysis_period_days": 90,
    "strongest_correlation": {},
    "weakest_correlation": {},
    "overall_trend": "weak_or_no_correlation",
    "statistical_significance": "high"
  },
  "backtesting": {
    "accuracy_pct": 98.61,
    "total_predictions": 73,
    "evaluated_predictions": 72,
    "correct_predictions": 71,
    "pending_predictions": 1,
    "latest_result": {}
  }
}
```

---

## Nutzung

### Prognose erzeugen

```bash
cd C:\DevLab\MBRN-HUB-V1\scripts\oracle
python oracle_core.py
```

### Historie backfillen

```bash
python backfill_history.py
```

### Einzelmodule prüfen

```bash
python numerology_engine.py
python data_bridge.py
python correlation_matrix.py
```

---

## Konfiguration

Wichtige Oracle-Parameter in `oracle_core.py`:

```python
CONFIG = {
    "oracle": {
        "version": "1.1.0",
        "correlation_days": 90,
        "output_dir": PROJECT_ROOT / "scripts" / "oracle" / "predictions",
        "dashboard_path": PROJECT_ROOT / "shared" / "data" / "oracle_prediction.json",
        "backtest_path": PROJECT_ROOT / "shared" / "data" / "oracle_backtest.json",
    }
}
```

---

## Technische Notizen

- Shared Mirror wird atomar nach `shared/data/oracle_prediction.json` geschrieben.
- Backtesting bleibt schema-stabil und UI-kompatibel.
- Krypto- und News-Signale fließen in Alignment und Erklärungstext ein.
- Die hohe Accuracy nach Replay-/Backfill-Läufen ist als Funktionstest brauchbar, aber fachlich bias-verdächtig.

---

## Status

**Version:** `1.1.0`  
**Status:** `operativ`  
**Shared Mirror:** `aktiv`  
**Backtesting:** `aktiv`  
**Nächste offene Ebene:** Scheduler-/Worker-Orchestrierung im Stundenrhythmus klar dokumentieren

---

*Oracle Core — MBRN System Brain v1.1*  
*Updated: 2026-04-19*
