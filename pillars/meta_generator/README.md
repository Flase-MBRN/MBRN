# /pillars/meta_generator/ - Meta Generator (VISION)

**Status:** PLANNED (Vision dokumentiert, Implementierung später)

## Vision

Der Meta Generator ist das **Kreative Rückgrat** von MBRN. Er transformiert abstrakte Intention in konkrete Implementation.

> *"Von der Vision zum Code - strukturiert, wiederholbar, skalierbar"*

## Architektur-Konzept

```
┌─────────────────────────────────────────────────────────┐
│                   ARCHITECT INPUT                       │
│  - Neue Pillar-Definition                                │
│  - Neue Dimension                                        │
│  - Neue App                                              │
│  - Neue Bridge                                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              META GENERATOR ENGINE                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  blueprints/     → Struktur-Templates            │  │
│  │  content/        → Copy & Content-Templates      │  │
│  │  modules/        → Code-Module-Generator         │  │
│  │  assets/         → Asset-Pipeline                 │  │
│  │  agent_adapters/ → KI-Tool-Integrationen         │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────┬────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                   OUTPUT                                │
│  - Boilerplate-Code                                    │
│  - Dokumentation                                       │
│  - Tests                                               │
│  - Assets (Icons, Bilder)                              │
│  - CI/CD-Pipeline-Config                               │
└─────────────────────────────────────────────────────────┘
```

## Subsysteme

### 1. Blueprints (`blueprints/`)
**Zweck:** Wiederholbare Struktur-Templates

**Beispiele:**
- `new_pillar/` - Skeleton für neue Pillars
- `new_dimension/` - Dimension-Scaffold
- `new_app/` - App-Template mit Manifest-Eintrag
- `new_bridge/` - Bridge-Template mit Contract

**Input:** JSON-Definition  
**Output:** Ordnerstruktur + Boilerplate-Dateien

### 2. Content (`content/`)
**Zweck:** Content-Templates und Copy-Generierung

**Beispiele:**
- `NOT_IMPLEMENTED.md` - Generator für Reservierungs-Marker
- `README.md` - Projektdokumentation-Template
- `app_copy/` - App-spezifische Texte
- `marketing/` - Landing-Page-Copy

**Input:** Content-Brief  
**Output:** Markdown-Dateien, Copy-Assets

### 3. Modules (`modules/`)
**Zweck:** Code-Module-Generator für wiederkehrende Patterns

**Beispiele:**
- `registry_module/` - Registry-Scaffold mit CRUD
- `bridge_module/` - Bridge-Template mit Contract
- `read_model/` - Read-Model-Generator
- `test_suite/` - Test-Template-Generator

**Input:** Modul-Definition  
**Output:** `.js` Dateien mit Boilerplate

### 4. Assets (`assets/`)
**Zweck:** Asset-Pipeline für visuelle Komponenten

**Beispiele:**
- `icons/` - SVG-Icon-Generator
- `thumbnails/` - App-Preview-Bilder
- `logos/` - Dimension/Pillar-Logos
- `social/` - Social-Media-Assets

**Input:** Asset-Brief (Größe, Stil, Farbe)  
**Output:** Optimierte Bilddateien

### 5. Agent Adapters (`agent_adapters/`)
**Zweck:** Integration externer KI-Tools

**Beispiele:**
- `claude_adapter/` - Claude API für Code-Generierung
- `dalle_adapter/` - DALL-E für Bildgenerierung
- `ollama_adapter/` - Lokale LLM (RX 7700 XT)
- `figma_adapter/` - Figma-Design-Export

**Input:** Generierungs-Prompt  
**Output:** Generierte Assets/Code via externer KI

## Status & Priorisierung

| Subsystem | Status | Priorität |
|-----------|--------|-----------|
| blueprints | PLANNED | Hoch (nach Phase 5) |
| content | PLANNED | Mittel |
| modules | PLANNED | Hoch (nach Phase 5) |
| assets | PLANNED | Niedrig |
| agent_adapters | PLANNED | Niedrig (zuletzt) |

## Trigger für Implementation

Der Meta Generator wird aktiv wenn:
1. **Phase 5 abgeschlossen** - Stabile Basis
2. **Erste wiederholbare Patterns** identifiziert
3. **Content-Team** wächst (nicht nur Erik)
4. **KI-Integration** (Ollama/RX 7700 XT) stabil läuft

## Abhängigkeiten

- **pillars/frontend_os/** - Muss stabil sein (generiert Navigation, Dashboard)
- **bridges/python/local_llm/** - Ollama-Integration für Code-Generierung
- **shared/core/contracts/** - Muss final sein (generiert Bridges)

---

**Hinweis:** Dies ist eine VISION. Die Implementierung beginnt erst nach Phase 5.
Der Meta Generator wird das letzte große Subsystem vor dem v1.0 Launch.
