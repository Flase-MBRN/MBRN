# /bridges/local_llm/

**Status:** ACTIVE / PARTIAL

Diese Zone ist jetzt der formale Week-2-Bridge fuer lokale Ollama-/Llama-Veredelung.

Aktive Runtime-Inhalte:

- `bridge.py`
  - stabiler Prompt fuer strukturierte JSON-Analyse
  - Ollama-Request ueber lokalen Host/Port
  - Strict-JSON-Parse plus Reparatur-Fallback
  - normalisierte Ausgabe fuer die Gold-Schicht
- `__init__.py`
  - kanonischer Exportpunkt fuer Worker und spaetere Runtime-Konsumenten

Nicht behauptet wird:

- dass bereits eine Frontend-Surface auf dieser Bridge liegt
- dass Week 3 RLS-/Fetch-Pfade schon auf Gold-Daten umgestellt sind
- dass jede spaetere Modellvariante schon formalisiert ist
