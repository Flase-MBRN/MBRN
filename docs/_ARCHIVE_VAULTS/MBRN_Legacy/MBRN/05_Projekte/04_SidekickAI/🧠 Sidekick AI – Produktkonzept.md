## 📌 Grundidee

Eine lokale KI-App, die Gespräche live versteht und **nur dann relevante Fakten oder Hinweise einbringt**, wenn es wirklich sinnvoll ist.

> Ziel: Ein unsichtbarer, intelligenter Gesprächs-Co-Pilot

---

## 🎯 Vision

- Natürlichere Gespräche durch intelligente Unterstützung
- Kein aktives “Fragen stellen” nötig
- KI agiert eigenständig, aber zurückhaltend
- Datenschutz durch lokale Verarbeitung

---

## 🎛️ Memory-System (Core Feature)

### 🟢 Private Mode (Zero Memory)

- Keine Speicherung
- Nur Live-Verarbeitung
- Maximale Privatsphäre

---

### 🔵 Profile Memory

- Manuell definierte Infos:
    - Personen
    - Interessen
    - Insider
- Wird als Kontext-Prompt genutzt

---

### 🟣 Smart Memory

- KI erkennt Muster selbst
- Speichert nur abstrakte Infos (keine Gespräche)
- Beispiel:
    - “Person interessiert sich für Fitness”

---

## 🎤 Kernfunktionen

### Live Listening

- Kontinuierlicher Mikrofonzugriff (optional)
- Alternative: Push-to-Talk

---

### Live Transkription

- Sprache → Text in Echtzeit

---

### Kontextverständnis

- Analyse von:
    - Themen
    - Fragen
    - falschen Aussagen
    - Diskussionen

---

### Relevanz-System (wichtigster Teil)

KI entscheidet:

- Ist ein Eingriff sinnvoll?
- Ist die Info hilfreich?
- Ist der Moment passend?

---

## 🔊 Output-Modi

### Silent Mode

- Nur Textanzeige

### Whisper Mode

- Ausgabe über Kopfhörer (nur für Nutzer hörbar)

### Speaker Mode

- KI spricht in die Gruppe

---

## 🎭 Persönlichkeitssystem

Einstellbare KI-Styles:

- Chill / Locker
- Smart / Faktenbasiert
- Humorvoll
- Minimalistisch

---

## ⚙️ Technische Architektur (High-Level)

### Input

- Mikrofon → Speech-to-Text

### Verarbeitung

- Transkription → Kontextanalyse
- Relevanz-Check
- Prompt + Memory Injection

### Output

- Text oder Sprache

---

## 🧠 Logik-Komponenten

### Session Memory

- Temporärer Kontext während Gespräch
- Wird nach Session gelöscht

---

### Prompt Injection

- Vor jedem KI-Aufruf:
    - Gruppeninfos
    - Persönlichkeitsregeln
    - Verhalten

---

### Relevanz-Score (Konzept)

Mögliche Kriterien:

- Frage erkannt
- Unsicherheit erkannt
- falsche Info erkannt
- Themenrelevanz

---

## 🧪 MVP-Plan

### Phase 1

- Button → Aufnahme
- Transkription
- KI-Antwort als Text

---

### Phase 2

- Automatische Frage-Erkennung
- Live Vorschläge

---

### Phase 3

- Whisper Mode
- einfache Relevanzlogik

---

### Phase 4

- Automatische Interaktion (optional)

---

## 💰 Monetarisierung

### Free

- Private Mode
- Basisfunktionen

---

### Premium

- Smart Memory
- bessere Modelle
- Persönlichkeiten
- Stimmen

---

## ⚠️ Risiken

### Datenschutz

- Mikrofon dauerhaft aktiv
- Zustimmung aller Beteiligten notwendig

---

### Nutzerakzeptanz

- Gefahr: wirkt überwachend
- Lösung:
    - klare Anzeige
    - Transparenz

---

### Qualität

- falsche oder unpassende Antworten zerstören Vertrauen

---

## 💡 Differenzierung

Nicht einfach Antworten geben, sondern:

- vorsichtig formulieren
- Unsicherheit zeigen
- optional reagieren

Beispiel:

- “Ich bin mir nicht ganz sicher, aber…”
- “Soll ich das kurz checken?”

---

## 🚀 Langfristige Vision

- “Ambient AI” für reale Gespräche
- Unsichtbare Unterstützung im Alltag
- Erweiterbar auf:
    - Meetings
    - Lernen
    - Content Creation

---

## 🧭 Nächste Schritte

- [ ]  Lokales Speech-to-Text Setup
- [ ]  LLM lokal testen
- [ ]  einfache UI bauen
- [ ]  erstes Relevanz-System entwickeln
- [ ]  Whisper Mode testen