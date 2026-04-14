# smart_file_brain.py — Version v6 final

# Sauber, robust, content-first for text files, extension-first for non-text.

# Produziert file_index.json mit category, tags, confidence, why.

  

import os

import shutil

import json

import re

import requests

from typing import Tuple, List, Dict, Any

  

# ---------------- CONFIG ----------------

INPUT_FOLDER = r"C:\DevLab\Projects\SmartFileBrain\input_files"

OUTPUT_FOLDER = r"C:\DevLab\Projects\SmartFileBrain\sorted_files"

EXPORT_JSON = r"C:\DevLab\Projects\SmartFileBrain\file_index.json"

  

# Toggle (optional)

USE_NLTK = False   # Wenn Du NLTK installiert hast, setze True (nicht nötig)

USE_LMSTUDIO_SDK = False  # Wenn lmstudio Python-SDK installiert und server läuft

LMSTUDIO_REST_URL = "http://localhost:11434/v1/responses"

LMSTUDIO_MODEL = None  # optional

  

# ---------------- SETUP ----------------

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

  

if USE_NLTK:

    try:

        import nltk  # type: ignore

        from nltk.corpus import stopwords  # type: ignore

    except Exception:

        USE_NLTK = False

  

# Try import lmstudio SDK if explicitly enabled

if USE_LMSTUDIO_SDK:

    try:

        import lmstudio as lms  # type: ignore

    except Exception:

        USE_LMSTUDIO_SDK = False

  

# ---------------- MAPS / REGEX ----------------

# Non-text strong map (images, pdf, archives, spreadsheets, databases, code exts)

NON_TEXT_EXT_MAP = {

    **{ext: 'Image' for ext in ('jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp')},

    'pdf': 'PDF',

    **{ext: 'Archive' for ext in ('zip', 'rar', '7z', 'tar', 'gz')},

    'accdb': 'Database',

    'csv': 'CSV',

    'xls': 'Spreadsheet',

    'xlsx': 'Spreadsheet',

    **{ext: 'Code' for ext in ('py', 'js', 'java', 'c', 'cpp', 'cs', 'rb', 'go', 'ts', 'php')},

    **{ext: 'Document' for ext in ('doc', 'docx', 'odt')},

}

  

# Text-like extensions (content-first)

TEXT_EXTENSIONS = {'txt', 'md', 'log'}

  

# Regexes for heuristics

FINANCE_RE = re.compile(r'\b(invoice|receipt|payment|total|amount|due|tax|balance|invoice#|bill)\b|[€$]', re.I)

COOKING_RE = re.compile(r'\b(recipe|cook|kitchen|ingredient|bake|oven|serves|directions|prep)\b', re.I)

CODE_RE = re.compile(r'\b(def|class|import|return|function|var|let|const|#include|public|private)\b', re.I)

  

# ---------------- HELPERS ----------------

def read_text_sample(path: str, max_bytes: int = 8192) -> str:

    """Read up to max_bytes from a file safely and return decoded text (utf-8 ignore)."""

    try:

        with open(path, 'rb') as f:

            raw = f.read(max_bytes)

        return raw.decode('utf-8', errors='ignore')

    except Exception:

        return ""

  

def parse_json_from_text(s: str):

    """Try to extract JSON substring from an LLM response."""

    m = re.search(r'(\{.*\}|\[.*\])', s, re.S)

    if not m:

        return None

    try:

        return json.loads(m.group(1))

    except Exception:

        return None

  

# ---------------- LLM INTERFACE (optional) ----------------

def ask_llm_real(text: str, filename: str = "", extension: str = "") -> Dict[str, Any]:

    """

    Tries SDK -> REST -> fallback heuristics.

    Returns dict with keys: category, tags, confidence, why.

    """

    # Prompt: force JSON-only output

    system = (

        "You are a concise file classifier. Return ONLY a JSON object with keys: "

        "\"category\" (Code/Finance/Work/Cooking/Text/Image/PDF/Document/Database/Archive/Other), "

        "\"tags\" (list of short tag strings), \"confidence\" (0..1), \"why\" (list of short strings)."

    )

    prompt = f"{system}\nFilename: {filename} Extension: {extension}\nFile content:\n{text[:6000]}\nReturn JSON only."

  

    # 1) SDK (if enabled)

    if USE_LMSTUDIO_SDK:

        try:

            model = lms.llm()  # type: ignore

            resp = model.complete(prompt)

            text_out = resp if isinstance(resp, str) else getattr(resp, "text", str(resp))

            parsed = parse_json_from_text(text_out)

            if parsed and 'category' in parsed:

                return parsed

        except Exception:

            pass

  

    # 2) REST fallback (LM Studio server must be running)

    try:

        payload = {"input": prompt}

        if LMSTUDIO_MODEL:

            payload["model"] = LMSTUDIO_MODEL

        r = requests.post(LMSTUDIO_REST_URL, json=payload, timeout=20)

        if r.status_code == 200:

            data = r.json()

            # extract probable text

            text_out = ""

            if isinstance(data, dict):

                choices = data.get("choices") or data.get("outputs")

                if choices and isinstance(choices, list) and choices:

                    # Try chat-style

                    first = choices[0]

                    if isinstance(first, dict):

                        text_out = first.get("message", {}).get("content", "") or first.get("text", "") or ""

            if not text_out:

                text_out = json.dumps(data)

            parsed = parse_json_from_text(text_out)

            if parsed and 'category' in parsed:

                return parsed

    except Exception:

        pass

  

    # 3) Heuristic fallback (safe, deterministic)

    lowered = (text or "").lower()

    if FINANCE_RE.search(lowered):

        return {"category": "Finance", "tags": ["finance"], "confidence": 0.85, "why": ["fallback:finance"]}

    if CODE_RE.search(lowered) or extension in {'py', 'js', 'java', 'c', 'cpp'}:

        return {"category": "Code", "tags": ["code"], "confidence": 0.75, "why": ["fallback:code"]}

    if COOKING_RE.search(lowered):

        return {"category": "Cooking", "tags": ["cooking"], "confidence": 0.75, "why": ["fallback:cooking"]}

    if len(lowered.strip()) > 50:

        return {"category": "Text", "tags": ["text"], "confidence": 0.55, "why": ["fallback:long-text"]}

    return {"category": "Other", "tags": [extension or "unknown"], "confidence": 0.3, "why": ["fallback:unknown"]}

  

# ---------------- CLASSIFICATION (clean rules) ----------------

def classify_file(path: str, filename: str) -> Tuple[str, List[str], float, List[str]]:

    """

    Decide category for a single file.

    - For TEXT_EXTENSIONS: content-first via LLM/heuristics.

    - For NON_TEXT_EXT_MAP exts: extension-first (strong mapping).

    - For other files: try content then extension fallback.

    """

    ext = filename.split('.')[-1].lower() if '.' in filename else ''

  

    # 1) For text-like files, try content-first

    if ext in TEXT_EXTENSIONS:

        sample = read_text_sample(path)

        result = ask_llm_real(sample, filename, ext)

        cat = result.get("category", "Text")

        tags = result.get("tags", [ext or "text"])

        conf = float(result.get("confidence", 0.5))

        why = result.get("why", ["llm-or-fallback"])

        return cat, tags, conf, why

  

    # 2) Strong non-text extension mapping (images, pdf, archives, spreadsheets, DB, code)

    if ext and ext in NON_TEXT_EXT_MAP:

        cat = NON_TEXT_EXT_MAP[ext]

        return cat, [ext], 0.95, [f"ext_map:{ext}->{cat}"]

  

    # 3) For other files (unknown ext or medium types), try to sample content and ask LLM/heuristics

    sample = read_text_sample(path)

    if sample:

        result = ask_llm_real(sample, filename, ext)

        cat = result.get("category")

        if cat:

            tags = result.get("tags", [ext or "unknown"])

            conf = float(result.get("confidence", 0.5))

            why = result.get("why", ["llm-or-fallback"])

            return cat, tags, conf, why

  

    # 4) fallback by extension if present

    if ext:

        return ext, [ext], 0.4, [f"fallback:by_extension:{ext}"]

  

    # 5) ultimate fallback

    return "Other", ["unknown"], 0.25, ["fallback:unknown"]

  

# ---------------- MAIN ----------------

def main():

    file_index: List[Dict[str, Any]] = []

  

    for fname in os.listdir(INPUT_FOLDER):

        src = os.path.join(INPUT_FOLDER, fname)

        if not os.path.isfile(src):

            continue

  

        category, tags, confidence, why = classify_file(src, fname)

  

        dest_folder = os.path.join(OUTPUT_FOLDER, category)

        os.makedirs(dest_folder, exist_ok=True)

  

        dest = os.path.join(dest_folder, fname)

        n = 1

        base, extdot = os.path.splitext(fname)

        while os.path.exists(dest):

            dest = os.path.join(dest_folder, f"{base}({n}){extdot}")

            n += 1

  

        try:

            shutil.move(src, dest)

            print(f"Moved: {fname} -> {category} (conf={confidence:.2f})")

        except Exception as e:

            print(f"⚠️ Fehler beim Verschieben von {fname}: {e}")

            continue

  

        file_index.append({

            "original_name": fname,

            "new_path": dest,

            "category": category,

            "extension": fname.split('.')[-1].lower() if '.' in fname else '',

            "tags": tags,

            "confidence": round(confidence, 2),

            "why": why

        })

  

    with open(EXPORT_JSON, 'w', encoding='utf-8') as f:

        json.dump(file_index, f, indent=4, ensure_ascii=False)

  

    print("✅ Dateien wurden sortiert! (Version 0.6 final)")

  

if __name__ == "__main__":

    main()