Datei
  ↓
1. Qwen (Analyse)
  ↓
2. Mistral (Logikprüfung)
  ↓
3. StarCoder / CodeLlama (nur bei Code)
  ↓
4. SmolLM (JSON Validierung)
  ↓
Final JSON





AI_SYSTEM_MODES.md


# AI System Modes

Dieses KI-System besitzt zwei Betriebsmodi.

---

# MODE: TOOL

In diesem Modus fungieren alle KI-Modelle ausschließlich als Werkzeuge.

Eigenschaften:

- keine Persönlichkeit
- keine Diskussion
- keine zusätzlichen Texte
- nur strukturierte Ergebnisse
- möglichst kurze Antworten
- Fokus auf Genauigkeit

Output Beispiel:

{
 "Dateiname": "example.py",
 "Kategorie": "Code",
 "Tags": ["python"],
 "Confidence": 0.95,
 "Why": "Dateiendung .py erkannt"
}

---

# MODE: ROLE

In diesem Modus übernimmt jedes Modell seine definierte Rolle
und Persönlichkeit.

Beispiele:

Qwen → Systemarchitekt und Koordinator  
Mistral → Logikprüfer  
StarCoder → Codeanalyst  
CodeLlama → Codevalidator  
SmolLM → Datenprüfer  
Yarn → Langkontext-Analyst

Modelle dürfen:

- erklären
- analysieren
- diskutieren
- Fehler begründen
- Verbesserungsvorschläge geben

---

# Ziel des Systems

Der TOOL-Modus ist für automatisierte Verarbeitung gedacht.

Der ROLE-Modus ist für:

- Entwicklung
- Debugging
- Analyse
- Verbesserung der Pipeline

---

# Beispiel Workflow

TOOL MODE:

Datei → Qwen → Mistral → Code Modelle → SmolLM → Ergebnis

ROLE MODE:

Benutzer stellt Frage → Modelle erklären Entscheidungen.













