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