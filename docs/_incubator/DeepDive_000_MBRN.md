# Incubator Deep Dive: 000_MBRN (Early PWA)

> **Scan Date:** 14.04.2026  
> **Source:** `C:\DevLab\Projects\000_MBRN`  
> **Status:** 🧬 **PRECURSOR** — Frühe PWA-Version von MBRN  
> **Triage:** 🗄️ **ARCHIVE** (Vollständig in MBRN-HUB-V1 integriert)

---

## 1. System Core

### Was ist das?
Die **früheste PWA-Version** des MBRN Tools Hub — ein statischer Wrapper für drei Tools (FinanzRechner, Disziplin Tracker, Numerologie) als GitHub Pages PWA.

### USP
- **Zero-Backend:** Reines Frontend, Local-First
- **PWA-Features:** Offline-fähig via Service Worker
- **App-ähnlich:** Installierbar auf mobilen Geräten
- **Schnell:** Keine Ladezeiten, alles statisch

### Funktionsumfang
- Landing Page (Single HTML File, 38KB)
- Service Worker für Offline-Caching
- Manifest.json für PWA-Installation
- Deeplinks zu drei Sub-Tools

---

## 2. Tech Stack & Zustand

| Aspekt | Befund |
|--------|--------|
| **Sprache** | HTML5 + Vanilla CSS (kein JS Framework) |
| **PWA** | Service Worker (sw.js) — Cache-First Strategy |
| **Manifest** | Vollständig mit Shortcuts zu allen Tools |
| **Design** | CSS Variables (MBRN v3.0 Design System) |
| **Fortschritt** | ✅ MVP — Funktionsfähig |
| **Zustand** | Abgelöst durch MBRN-HUB-V1 |

### Dateien
```
000_MBRN/
├── .git/                 ← Ignored
├── README.md            ← Minimal (11 Bytes)
├── icons/               ← App-Icons
├── index.html           ← 38KB Single-File Landing
├── manifest.json        ← PWA Config
└── sw.js                ← 47 Lines Service Worker
```

### Design-System (Auszug)
```css
:root {
  --bg: #0a0a0f;
  --text: #eaeaf4;
  --accent-main: #8b5cf6;        /* MBRN Lila */
  --accent-glow: rgba(139,92,246,0.28);
  --success: #4fffb0;
  --danger: #ff6b6b;
  --border: rgba(255,255,255,0.08);
}
```

---

## 3. Extractable Logic

### Service Worker Pattern
```javascript
// Cache-First mit Network-Fallback
const CACHE_NAME = `mbrn-hub-v1.0.0`;

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
```

**MBRN-HUB-V1 Integration:** ⚠️ Nicht übernommen — Kein SW in aktueller Version

### Manifest-Struktur
```json
{
  "name": "MBRN Tools",
  "short_name": "MBRN",
  "start_url": "/MBRN/",
  "display": "standalone",
  "theme_color": "#8b5cf6",
  "shortcuts": [
    { "name": "FinanzRechner", "url": "/FinanzRechner/" },
    { "name": "Disziplin Tracker", "url": "/discipline-tracker/" },
    { "name": "Numerologie", "url": "/NumerologieRechner/" }
  ]
}
```

**MBRN-HUB-V1 Integration:** ⚠️ Manifest existiert, aber keine Shortcuts

### Inline-CSS Architektur
- Single-File Ansatz (alles in index.html)
- CSS Variables für Theming
- Responsive Design
- Keine externen CSS-Files

**MBRN-HUB-V1 Integration:** ✅ Verbessert zu modularer CSS-Struktur

---

## 4. MBRN Mapping (Die 11 Dimensionen)

| Dimension | Relevanz | Begründung |
|-----------|----------|------------|
| **DIM 01 — KAPITAL** | ✅ **Hoch** | Enthält FinanzRechner-Shortcut |
| **DIM 03 — FREQUENZ** | ✅ **Hoch** | Enthält Numerologie-Shortcut |
| **DIM 06 — CHRONOS** | ✅ **Hoch** | Enthält Disziplin-Shortcut |
| **DIM 04 — CODE** | ⚠️ Mittel | PWA-Technik (SW, Manifest) |
| **DIM 10 — FLUSS** | ⚠️ Mittel | Offline-First Workflow |
| **DIM 11 — ERBE** | ✅ **Hoch** | Historische Version 1.0 |

### Migration nach MBRN-HUB-V1

| Feature | 000_MBRN | MBRN-HUB-V1 | Status |
|---------|----------|-------------|--------|
| Landing Page | Single 38KB HTML | Modular + GitHub Pages | ✅ Verbessert |
| Service Worker | Cache-First | ❌ Nicht implementiert | ⚠️ Verloren |
| PWA Manifest | Mit Shortcuts | Basis-Version | ⚠️ Reduziert |
| Design-System | CSS Variables v3.0 | Sternenhimmel v4.0 | ✅ Weiterentwickelt |
| Tool-Integration | Deeplinks | Integrierte Apps | ✅ Modularisiert |

---

## 5. Triage-Empfehlung

### 🗄️ **ARCHIVE** — Vollständig integriert

**Begründung:**
1. **Vollständig migriert** — Alle Features in MBRN-HUB-V1 vorhanden
2. **Technisch überholt** — Single-File-Ansatz durch Modularisierung ersetzt
3. **Historischer Wert** — Zeigt Evolution vom PWA-Wrapper zum App-Ökosystem
4. **PWA-Features verloren** — Service Worker könnte reaktiviert werden

### Was wurde verbessert?

| 000_MBRN | MBRN-HUB-V1 |
|----------|-------------|
| 38KB Inline-HTML | Modular: HTML + CSS + JS |
| Statische Tools | Interaktive Apps |
| PWA (ohne Updates) | GitHub Pages (einfacher Deploy) |
| Lila Theme (#8b5cf6) | Sternenhimmel (#7c3aed) |
| Drei separate Tools | Einheitliches Ökosystem |

### Potenzielle Rückübernahmen

**Service Worker für Offline-Modus:**
- MBRN-HUB-V1 aktuell: Kein SW
- 000_MBRN: Cache-First SW implementiert
- **Empfehlung:** SW-Logik als `shared/core/pwa.js` modul evaluieren

---

## Fazit

| Aspekt | Bewertung |
|--------|-----------|
| **Code-Qualität** | ⭐⭐⭐☆☆ (3/5 — Funktional, monolithisch) |
| **PWA-Implementierung** | ⭐⭐⭐⭐☆ (4/5 — Solider SW) |
| **Architektur** | ⭐⭐☆☆☆ (2/5 — Single-File, nicht skalierbar) |
| **MBRN-Relevanz** | ⭐⭐⭐⭐⭐ (5/5 — Genesis-Version) |
| **Recycle-Wert** | 🗄️ Archiviert |

**Endurteil:** Die **Version 1.0** von MBRN — funktional, aber technisch limitiert. MBRN-HUB-V1 ist die konsequente Weiterentwicklung mit besserer Architektur. 

**Empfohlene Aktion:** 
- ✅ **Bereits erledigt** — In `_ARCHIVE_VAULTS/` migriert
- 📱 **Optional:** Service Worker für PWA-Features in MBRN-HUB-V1 reaktivieren

---

**Analyst:** System Architect  
**Scan-Tiefe:** 2 Ebenen  
**Code analysiert:** index.html (38KB), sw.js (47 Lines), manifest.json  
**Extrahierte Logik:** SW-Cache-Pattern  
**Status:** 🧬 PRECURSOR ARCHIVED
