# smart_file_brain.py  (Version 0.4c)

# Robust file sorter: extension map + content heuristics + optional NLTK.

# Produziert file_index.json mit category, tags, confidence und heuristics.

  

import os

import shutil

import json

import re

from collections import Counter

  

# Optional: nltk nutzen, wenn installiert (aber nicht nötig)

USE_NLTK = False

try:

    import nltk

    from nltk.corpus import stopwords

    USE_NLTK = True

except Exception:

    USE_NLTK = False

  

# Pfade (anpassen falls nötig)

INPUT = r"C:\DevLab\Projects\SmartFileBrain\input_files"

OUTPUT = r"C:\DevLab\Projects\SmartFileBrain\sorted_files"

EXPORT_JSON = r"C:\DevLab\Projects\SmartFileBrain\file_index.json"

  

# Erstelle Zielordner, falls nötig

os.makedirs(OUTPUT, exist_ok=True)

  

# Erweiterte Keyword-Listen (können jederzeit ergänzt werden)

FINANCE_KW = {'invoice', 'bill', 'payment', 'receipt', 'salary', 'tax', 'total', 'amount', 'due'}

WORK_KW = {'project', 'report', 'meeting', 'task', 'deadline', 'plan', 'notes'}

COOKING_KW = {'recipe', 'cook', 'kitchen', 'ingredient', 'bake', 'dish', 'serve'}

CODE_KW = {'def', 'class', 'import', 'function', 'return', 'var', 'let', '#include', 'public', 'private'}

  

# Extension-based strong mapping (schnellste Heuristik)

EXT_MAP = {

    # Code

    **{ext: 'Code' for ext in ('py', 'js', 'java', 'c', 'cpp', 'cs', 'rb', 'go', 'ts', 'php')},

    # Documents / office

    **{ext: 'Document' for ext in ('doc', 'docx', 'odt')},

    'pdf': 'PDF',

    # Images

    **{ext: 'Image' for ext in ('jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp')},

    # Archives

    **{ext: 'Archive' for ext in ('zip', 'rar', '7z', 'tar', 'gz')},

    # Databases / data

    'accdb': 'Database',

    'csv': 'CSV',

    'xls': 'Spreadsheet',

    'xlsx': 'Spreadsheet',

    # Text-like

    **{ext: 'Text' for ext in ('txt', 'md', 'log')}

}

  

# Utility: read sample from file safely (handles binary)

def read_sample(file_path, max_bytes=8192):

    try:

        with open(file_path, 'rb') as f:

            data = f.read(max_bytes)

        # try decode utf-8 with ignore so we get whatever text present

        text = data.decode('utf-8', errors='ignore')

        return text

    except Exception:

        return ""

  

# Heuristics to compute category, tags, confidence, and reasoning

def analyze_file(file_path, extension):

    reasons = []

    tags = []

    score = 0.0

  

    ext = extension.lower()

  

    # 1) Strong extension map

    if ext in EXT_MAP:

        category = EXT_MAP[ext]

        reasons.append(f"ext_map:{ext}->{category}")

        # high confidence for clear mappings (images, pdfs, archives, known code exts)

        if category in ('Image', 'PDF', 'Archive', 'Database', 'CSV', 'Spreadsheet'):

            score = max(score, 0.9)

            tags.append(ext)

            return category, tags, score, reasons

  

    # 2) If extension is typical code, assign Code with high confidence

    if ext in {'py', 'js', 'java', 'c', 'cpp', 'cs', 'rb', 'go', 'ts', 'php'}:

        reasons.append("ext_is_code")

        tags.append('code')

        score = max(score, 0.8)

        return 'Code', tags, score, reasons

  

    # 3) Read a sample of the file and analyze content

    text = read_sample(file_path).lower()

    printable_ratio = 0.0

    if text:

        printable = sum(1 for ch in text if ch.isprintable())

        printable_ratio = printable / max(1, len(text))

        reasons.append(f"printable_ratio:{printable_ratio:.2f}")

  

    # 4) Quick currency/number check => Finance signal

    if re.search(r'\b(invoice|receipt|total|amount|due|payment|tax|€|\$|usd|eur)\b', text):

        reasons.append("keyword:finance")

        tags.append('finance')

        score = max(score, 0.85)

        return 'Finance', tags, score, reasons

  

    # 5) Code patterns anywhere (def, import, class, semicolons, braces)

    code_pattern_hits = 0

    if re.search(r'\b(def|class|import|return|function|var|let|const)\b', text):

        code_pattern_hits += 1

    if re.search(r'[{};()\[\]]', text):

        code_pattern_hits += 1

    if code_pattern_hits:

        reasons.append(f"code_patterns:{code_pattern_hits}")

        tags.append('code')

        score = max(score, 0.75)

        return 'Code', tags, score, reasons

  

    # 6) Work / project keywords

    if re.search(r'\b(project|report|meeting|task|deadline|plan|milestone)\b', text):

        reasons.append("keyword:work")

        tags.append('work')

        score = max(score, 0.7)

        return 'Work', tags, score, reasons

  

    # 7) Cooking keywords

    if re.search(r'\b(recipe|cook|kitchen|ingredient|bake|dish)\b', text):

        reasons.append("keyword:cooking")

        tags.append('cooking')

        score = max(score, 0.7)

        return 'Cooking', tags, score, reasons

  

    # 8) Text-like fallback: high printable ratio -> Text

    if printable_ratio > 0.7:

        reasons.append("fallback:text_by_printable")

        tags.append(ext or 'text')

        score = max(score, 0.5)

        return 'Text', tags, score, reasons

  

    # 9) If we reach here, mark by extension as fallback

    if ext:

        reasons.append("fallback:by_extension")

        tags.append(ext)

        score = max(score, 0.4)

        return ext, tags, score, reasons

  

    # 10) ultimate fallback

    reasons.append("fallback:unknown")

    tags.append('unknown')

    score = 0.2

    return 'Other', tags, score, reasons

  

# Build file index and move files

file_index = []

if not os.path.isdir(INPUT):

    print(f"ERROR: Input folder does not exist: {INPUT}")

else:

    for filename in os.listdir(INPUT):

        src = os.path.join(INPUT, filename)

        if not os.path.isfile(src):

            # skip subfolders for now

            continue

  

        ext = filename.split('.')[-1].lower() if '.' in filename else ''

        category, tags, confidence, heuristics = analyze_file(src, ext)

  

        # prepare destination folder

        dest_folder = os.path.join(OUTPUT, category)

        os.makedirs(dest_folder, exist_ok=True)

  

        # avoid collisions

        dest = os.path.join(dest_folder, filename)

        n = 1

        name, ext_with_dot = os.path.splitext(filename)

        while os.path.exists(dest):

            dest = os.path.join(dest_folder, f"{name}({n}){ext_with_dot}")

            n += 1

  

        # move safely

        try:

            shutil.move(src, dest)

            print(f"Moved: {filename} -> {category} (conf={confidence:.2f})")

        except Exception as e:

            print(f"⚠️ Fehler beim Verschieben von {filename}: {e}")

            continue

  

        file_index.append({

            "original_name": filename,

            "new_path": dest,

            "category": category,

            "extension": ext,

            "tags": tags,

            "confidence": round(confidence, 2),

            "why": heuristics

        })

  

# export JSON

with open(EXPORT_JSON, 'w', encoding='utf-8') as fh:

    json.dump(file_index, fh, indent=4, ensure_ascii=False)

  

print("✅ Dateien wurden sortiert! (Version 0.4c – robust & LLM-ready)")

import shutil

import json

from collections import Counter

  

# --- Optional: NLTK für Textanalyse ---

USE_NLTK = True

try:

    import nltk

    from nltk.corpus import stopwords

    USE_NLTK = True

except Exception:

    USE_NLTK = False

  

# --- Pfade ---

input_folder = r"C:\DevLab\Projects\SmartFileBrain\input_files"

output_folder = r"C:\DevLab\Projects\SmartFileBrain\sorted_files"

export_json = r"C:\DevLab\Projects\SmartFileBrain\file_index.json"

  

# Ordner erstellen, falls nötig

if not os.path.exists(output_folder):

    os.makedirs(output_folder)

  

# NLTK Ressourcen sicherstellen

if USE_NLTK:

    try:

        stopwords.words('english')

    except Exception:

        try:

            nltk.download('punkt', quiet=True)

            nltk.download('stopwords', quiet=True)

        except Exception:

            USE_NLTK = False

  

# --- Hilfsfunktion: LLM-Simulation ---

def ask_llm(text, filename, extension):

    """

    Simuliert LLM-Ausgabe.

    Später hier echtes LLM ansprechen (lokal oder API).

    """

    text_lower = text.lower()

    # Kategorie-Erkennung nach Keywords

    finance_kw = ['invoice','bill','payment','receipt','salary','tax']

    work_kw = ['project','report','meeting','task','deadline','plan']

    cooking_kw = ['recipe','cook','kitchen','ingredient','bake','dish']

    code_kw = ['code','function','class','import','def','variable','loop','py']

  

    category = "Other"

    tags = []

    confidence = 0.7

    why = []

  

    # Finance

    if any(w in text_lower for w in finance_kw):

        category = "Finance"

        tags.append("finance")

        confidence = 0.85

        why.append("keyword:finance")

    # Work

    elif any(w in text_lower for w in work_kw):

        category = "Work"

        tags.append("work")

        confidence = 0.85

        why.append("keyword:work")

    # Cooking

    elif any(w in text_lower for w in cooking_kw):

        category = "Cooking"

        tags.append("cooking")

        confidence = 0.85

        why.append("keyword:cooking")

    # Code

    elif any(w in text_lower for w in code_kw):

        category = "Code"

        tags.append("code")

        confidence = 0.8

        why.append("keyword:code")

    else:

        category = "Other"

        tags.append("other")

        confidence = 0.7

        why.append("no strong keywords")

  

    # Erweiterung: Extension als Hinweis

    if extension in ('py','js','java','cpp'):

        category = "Code"

        if "code" not in tags:

            tags.append("code")

        why.append(f"ext_map:{extension}->Code")

  

    return {

        "category": category,

        "tags": tags,

        "confidence": confidence,

        "why": why

    }

  

# --- JSON laden oder leeren Index erstellen ---

if os.path.exists(export_json):

    with open(export_json, 'r', encoding='utf-8') as f:

        file_index = json.load(f)

else:

    file_index = []

  

# --- Hauptschleife: Dateien verschieben + LLM-Tags ---

for filename in os.listdir(input_folder):

    file_path = os.path.join(input_folder, filename)

    if not os.path.isfile(file_path):

        continue

  

    extension = filename.split('.')[-1].lower() if '.' in filename else 'noext'

  

    # Zielordner standardmäßig nach Extension

    category = extension if extension not in ('txt','md','py','csv','log') else 'Other'

    ext_folder = os.path.join(output_folder, category)

    if not os.path.exists(ext_folder):

        os.makedirs(ext_folder)

  

    # Zielpfad + doppelte Dateien

    dest_path = os.path.join(ext_folder, filename)

    counter = 1

    name, ext = os.path.splitext(filename)

    while os.path.exists(dest_path):

        dest_path = os.path.join(ext_folder, f"{name}({counter}){ext}")

        counter += 1

  

    # Verschieben

    try:

        shutil.move(file_path, dest_path)

    except Exception as e:

        print(f"⚠️ Fehler beim Verschieben von {filename}: {e}")

        continue

  

    # --- Text aus Datei auslesen ---

    text_content = ""

    if extension in ('txt','md','py','csv','log'):

        try:

            with open(dest_path, 'r', encoding='utf-8', errors='ignore') as f:

                text_content = f.read()

        except Exception:

            pass

  

    # --- LLM fragen ---

    llm_result = ask_llm(text_content, filename, extension)

  

    # --- JSON aktualisieren ---

    file_index.append({

        'original_name': filename,

        'new_path': dest_path,

        'category': llm_result['category'],

        'extension': extension,

        'tags': llm_result['tags'],

        'confidence': llm_result['confidence'],

        'why': llm_result['why']

    })

  

    print(f"Moved: {filename} -> {llm_result['category']} (conf={llm_result['confidence']})")

  

# --- JSON speichern ---

with open(export_json, 'w', encoding='utf-8') as f:

    json.dump(file_index, f, indent=4)

  

print("✅ Dateien wurden sortiert! (Version 0.5 – LLM-Kategorien & Tags)")