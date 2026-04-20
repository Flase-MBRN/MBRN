# /pillars/oracle/processing/ - NOT IMPLEMENTED

**Status:** RESERVED / NOT YET IMPLEMENTED

## Geplanter Zweck

Heavy-Processing-Layer für Kursdaten-Analyse und AI-basierte Vorhersagen.

- Historische Daten-Pipeline
- Muster-Erkennungs-Algorithmen
- AI-Modell-Inferenz (Lokale GPU)
- Daten-Normalisierung und -Vorverarbeitung

## Warum leer?

YAGNI-Prinzip: Heavy Processing läuft aktuell außerhalb des Frontend-Systems in der Python-Pipeline auf der RX 7700 XT (12GB VRAM).

Dieser Ordner wird erst relevant bei:
- In-Browser-Processing (WebAssembly, WebGPU)
- Real-Time-Stream-Processing
- Edge-Computing-Szenarien
- JavaScript-basierte Vorverarbeitung

## Aktuelle Implementation

**Extern:** `/scripts/pipelines/oracle_*.py`
- `oracle_training.py` - Modell-Training
- `oracle_prediction.py` - Kursvorhersagen
- `oracle_sentiment.py` - Sentiment-Analyse

## Wann implementiert?

Trigger-Bedingungen:
- Wenn In-Browser-Processing via WebGPU/WebAssembly nötig wird
- Wenn JavaScript-basierte Vorverarbeitung für Edge-Devices benötigt wird
- Wenn Real-Time-Processing im Browser erforderlich ist
- Nach Phase 5 wenn Python-Pipeline stabil läuft

## Verhindern von Verwechslung

**Dieser Ordner ist KEIN Versehen.**

Er ist reserviert für zukünftige In-Browser-Processing-Funktionalität. Nicht löschen, nicht mit Fake-Code füllen.

---

**Marker-Standard:** NOT_IMPLEMENTED.md = Bewusst reserviert, noch nicht umgesetzt.
