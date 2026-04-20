# /pillars/meta_generator/agent_adapters/ - NOT IMPLEMENTED

**Status:** RESERVED / NOT YET IMPLEMENTED

## Geplanter Zweck

Integration externer KI-Tools für Content und Code-Generierung.

- `claude_adapter/` - Claude API für Code-Generierung
- `dalle_adapter/` - DALL-E für Bildgenerierung
- `ollama_adapter/` - Lokale LLM (RX 7700 XT)
- `figma_adapter/` - Figma-Design-Export

## Warum leer?

YAGNI-Prinzip: Agent-Adapters werden erst relevant bei:
- Integrierter KI-Generierung im Workflow
- Automatisierter Code/Content-Erstellung
- Lokaler LLM (Ollama/RX 7700 XT) im Einsatz
- Multi-Agent-System

## Aktueller Zustand

Manuelle KI-Nutzung:
- Claude/Web-Interface für Code
- Manuelle Bildgenerierung
- Keine automatisierte Integration

## Wann implementiert?

Trigger-Bedingungen:
- Nach Ollama-Integration (bridges/local_llm/)
- Wenn KI-Generierung im Workflow etabliert ist
- Nach allen anderen Meta-Generator-Subsystemen
- ZULETZT im Meta Generator Rollout

## Verhindern von Verwechslung

**Dieser Ordner ist KEIN Versehen.**

Er ist reserviert für zukünftige KI-Tool-Integrationen. Nicht löschen, nicht mit Fake-Code füllen.

---

**Marker-Standard:** NOT_IMPLEMENTED.md = Bewusst reserviert, noch nicht umgesetzt.
