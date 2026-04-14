# Incubator Deep Dive: 04_SidekickAI

> **Scan Date:** 14.04.2026  
> **Source:** `C:\DevLab\Projects\04_SidekickAI`  
> **Status:** 🚧 **WIP PROTOTYPE** — Python AI Assistant  
> **Triage:** 🔍 **EXTRACT** — Relevance-Algorithmus wertvoll

---

## 1. System Core

### Was ist das?
Ein **KI-Assistent** mit FastAPI-Backend und einem ausgefeilten Relevance-Scoring-System für Sprachtranskriptionen.

### USP
- **Relevance Engine:** Pattern-basiertes Scoring für Benutzer-Intents
- **Multi-Sprache:** Deutsch + Englisch Support
- **Context-Aware:** Berücksichtigt vorherige Nachrichten
- **Modulare Patterns:** Unsicherheit, Fragen, Imperative, Small-Talk

### Funktionsumfang
| Feature | Details |
|---------|---------|
| **Relevance Score** | 0-100 Punkte basierend auf Intent-Patterns |
| **Audio-Input** | Whisper Integration (OpenAI) |
| **API** | FastAPI Endpoints |
| **Context Memory** | Sliding Window der letzten N Nachrichten |

---

## 2. Tech Stack & Zustand

| Aspekt | Befund |
|--------|--------|
| **Sprache** | Python 3 |
| **Framework** | FastAPI |
| **KI-Modelle** | Whisper (Audio) |
| **Architektur** | Modular: `relevance.py`, `main.py` |
| **Fortschritt** | 🚧 **~60%** — Core vorhanden, UI rudimentär |
| **Zustand** | Pausiert / Experiment |

---

## 3. Extractable Logic

### A) Relevance Scoring Algorithm
```python
def score_transcript(text: str, recent_context: Iterable[str]) -> tuple[int, list[str]]:
    normalized = text.strip().lower()
    score = 0
    reasons = []
    
    # Question Detection
    if "?" in text:
        score += 35
        reasons.append("+35 question detected")
    
    if matches_any(normalized, QUESTION_WORD_PATTERNS):
        score += 25
        reasons.append("+25 spoken question pattern")
    
    # Direct Request Detection
    if matches_any(normalized, DIRECT_REQUEST_PATTERNS):
        score += 25
        reasons.append("+25 direct request")
    
    # Task-Oriented
    if matches_any(normalized, TASK_PATTERNS):
        score += 20
        reasons.append("+20 task-oriented")
    
    # Social Intent
    if matches_any(normalized, SOCIAL_RESPONSE_PATTERNS):
        score += 30
        reasons.append("+30 social intent")
    
    # Context Continuity
    if has_context_overlap(normalized, recent_context):
        score += 15
        reasons.append("+15 topic continuity")
    
    # Penalties
    if matches_any(normalized, SMALL_TALK_PATTERNS) and not has_question:
        score -= 20
        reasons.append("-20 bare small talk")
    
    if len(tokenize(normalized)) <= 3 and not has_question:
        score -= 15
        reasons.append("-15 very short input")
    
    return max(0, min(100, score)), reasons
```

**MBRN-HUB-V1 Nutzung:** ⚠️ Könnte für KI-gestützte Numerologie-Interpretation adaptiert werden

### B) Tokenisierung & Context Overlap
```python
def tokenize(text: str) -> set[str]:
    return {
        token for token in re.findall(r"[a-zA-Z0-9']+", text.lower())
        if len(token) > 2 and token not in STOPWORDS
    }

def has_context_overlap(text: str, recent_context: Iterable[str]) -> bool:
    current_tokens = tokenize(text)
    for previous in recent_context:
        overlap = current_tokens & tokenize(previous)
        if len(overlap) >= 2:
            return True
    return False
```

**MBRN-HUB-V1 Nutzung:** ⚠️ Nützlich für Chat/Dialog-Features

### C) Pattern Matching System
```python
DIRECT_REQUEST_PATTERNS = (
    r"\bcan you\b", r"\bcould you\b", r"\bplease\b",
    r"\bcreate\b", r"\bgive me\b", r"\berstelle\b",
    r"\bmach mir\b", r"\bkannst du\b",
)

UNCERTAINTY_PATTERNS = (
    r"\bmaybe\b", r"\bnot sure\b", r"\bperhaps\b",
    r"\bvielleicht\b", r"\bnicht sicher\b",
)
```

**MBRN-HUB-V1 Nutzung:** ✅ Pattern-Matching könnte für Intent-Detection genutzt werden

---

## 4. MBRN Mapping

| Dimension | Relevanz |
|-----------|----------|
| **DIM 07 — MIND** | ✅ **Hoch** — KI-gestützte Features |
| **DIM 04 — CODE** | ⚠️ Mittel — Algorithmus |
| **DIM 03 — FREQUENZ** | ⚠️ Potenzial — Numerologie-Interpretation |

---

## 5. Triage-Empfehlung

### 🔍 **EXTRACT**

**Extrahierbar:**
1. **Relevance Scoring Algorithm** → Portierung zu JavaScript
2. **Pattern-Matching System** → Intent-Detection für MBRN
3. **Tokenisierung** → Text-Analyse Features

**Nicht übernommen:**
- FastAPI Backend (MBRN ist Frontend-only)
- Whisper Integration (zu schwer für Client-only)
- Python-Abhängigkeiten

**Potenzielle Integration:**
- Edge Functions für KI-Interpretation
- Numerologie-Report Generierung
- Chat-basierte Numerologie-Abfragen

---

**Analyst:** System Architect  
**Status:** 🔍 EXTRACTABLE — Relevance Engine hat Wert
