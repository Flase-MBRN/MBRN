#!/usr/bin/env python3
"""
mbrn_factory_memory.py
Pure Python (100% Package-Free) Local Memory Engine.
Uses TF-IDF logic from standard library to index and retrieve code snippets.
"""

import json
import math
import os
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Tuple

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
MEMORY_PATH = _PROJECT_ROOT / "shared" / "data" / "mbrn_factory_memory.json"
_SAFE_IMPORT_ROOTS = set(getattr(sys, "stdlib_module_names", ())) | {
    "collections",
    "dataclasses",
    "datetime",
    "functools",
    "itertools",
    "math",
    "pathlib",
    "re",
    "typing",
}

def _tokenize(text: str) -> List[str]:
    """Simple alphanumeric tokenizer."""
    text = text.lower()
    return re.findall(r'\w+', text)

def _load_memory() -> Dict[str, Any]:
    if not MEMORY_PATH.exists():
        return {"documents": []}
    try:
        with open(MEMORY_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"documents": []}

def _is_stdlib_import(line: str) -> bool:
    from_match = re.match(r"\s*from\s+([A-Za-z_][\w.]*)\s+import\b", line)
    import_match = re.match(r"\s*import\s+(.+)", line)
    if from_match:
        roots = [from_match.group(1).split(".", 1)[0]]
    elif import_match:
        imports = import_match.group(1).split("#", 1)[0]
        roots = [
            part.strip().split(" ", 1)[0].split(".", 1)[0]
            for part in imports.split(",")
            if part.strip()
        ]
    else:
        return True
    return bool(roots) and all(root in _SAFE_IMPORT_ROOTS for root in roots)

def sanitize_code_snippet(code_snippet: str) -> str:
    """Return a Factory Memory snippet with external imports and install commands removed."""
    sanitized: List[str] = []
    removed = 0
    skip_import_block = False

    for line in str(code_snippet or "").splitlines():
        stripped = line.strip()
        if skip_import_block:
            removed += 1
            if ")" in stripped:
                skip_import_block = False
            continue

        if re.search(r"\b(pip|poetry|uv)\s+install\b", stripped):
            removed += 1
            continue

        is_import = bool(re.match(r"\s*(from\s+\S+\s+import\b|import\s+)", line))
        if is_import and not _is_stdlib_import(line):
            removed += 1
            if stripped.endswith("("):
                skip_import_block = True
            continue

        sanitized.append(line)

    if removed:
        sanitized.insert(0, f"# Factory Memory sanitized: removed {removed} external import/install line(s).")
    return "\n".join(sanitized).strip()

def _save_memory(data: Dict[str, Any]) -> None:
    MEMORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MEMORY_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def store_alpha(name: str, code_snippet: str, metadata: Dict[str, Any]) -> None:
    """Stores a new snippet in the factory memory."""
    memory = _load_memory()
    
    # Check if already exists to update
    for doc in memory["documents"]:
        if doc["name"] == name:
            doc["code"] = code_snippet
            doc["metadata"] = metadata
            _save_memory(memory)
            return
            
    memory["documents"].append({
        "name": name,
        "code": code_snippet,
        "metadata": metadata
    })
    _save_memory(memory)

def _calculate_tf_idf(query_tokens: List[str], documents: List[Dict[str, Any]]) -> List[Tuple[float, Dict[str, Any]]]:
    """Pure Python TF-IDF scorer."""
    if not documents or not query_tokens:
        return []
        
    N = len(documents)
    df = Counter()
    doc_tokens_list = []
    
    for doc in documents:
        # Combine name, metadata, and code into a single searchable string
        content = f"{doc['name']} {doc.get('metadata', {}).get('category', '')} {doc.get('metadata', {}).get('concrete_benefit', '')} {doc['code']}"
        tokens = _tokenize(content)
        doc_tokens_list.append(tokens)
        unique_tokens = set(tokens)
        for t in unique_tokens:
            df[t] += 1
            
    idf = {}
    for t in query_tokens:
        # +1 smoothing
        idf[t] = math.log((N + 1) / (df.get(t, 0) + 1)) + 1
        
    results = []
    for i, doc in enumerate(documents):
        doc_tokens = doc_tokens_list[i]
        tf = Counter(doc_tokens)
        doc_len = len(doc_tokens) if doc_tokens else 1
        
        score = 0.0
        for q_token in query_tokens:
            # Normalized term frequency
            term_freq = tf.get(q_token, 0) / doc_len
            score += term_freq * idf.get(q_token, 0)
            
        if score > 0:
            results.append((score, doc))
            
    return sorted(results, key=lambda x: x[0], reverse=True)

def retrieve_similar_code(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """Retrieves top_k relevant snippets based on a query."""
    memory = _load_memory()
    query_tokens = _tokenize(query)
    
    scored_docs = _calculate_tf_idf(query_tokens, memory["documents"])
    results: List[Dict[str, Any]] = []
    for _score, doc in scored_docs[:top_k]:
        sanitized = dict(doc)
        sanitized["code"] = sanitize_code_snippet(str(doc.get("code", "")))
        metadata = dict(sanitized.get("metadata", {}))
        metadata["stdlib_sanitized"] = True
        sanitized["metadata"] = metadata
        results.append(sanitized)
    return results

def init_memory_from_alphas() -> int:
    """One-time run to load existing alphas into memory."""
    alpha_vault = _PROJECT_ROOT / "shared" / "alphas"
    if not alpha_vault.exists():
        return 0
        
    count = 0
    for category_dir in alpha_vault.iterdir():
        if not category_dir.is_dir():
            continue
        for alpha_dir in category_dir.iterdir():
            if not alpha_dir.is_dir():
                continue
            
            snippet_file = None
            for f in alpha_dir.iterdir():
                if f.name.startswith("ready_snippet"):
                    snippet_file = f
                    break
                    
            if snippet_file:
                code = snippet_file.read_text(encoding="utf-8")
                
                # Try to extract summary from integration_guide.md
                benefit = ""
                guide_file = alpha_dir / "integration_guide.md"
                if guide_file.exists():
                    try:
                        content = guide_file.read_text(encoding="utf-8")
                        lines = content.splitlines()
                        for i, line in enumerate(lines):
                            if "## Why It Matters" in line and i + 1 < len(lines):
                                benefit = lines[i + 1].strip()
                                break
                    except Exception:
                        pass
                
                store_alpha(
                    name=alpha_dir.name,
                    code_snippet=code,
                    metadata={"category": category_dir.name, "concrete_benefit": benefit}
                )
                count += 1
    return count

if __name__ == "__main__":
    print("Populating Factory Memory from existing Alpha Vault...")
    added = init_memory_from_alphas()
    print(f"Added {added} code snippets to memory.")
    print("Testing retrieval with 'agent':")
    for doc in retrieve_similar_code("agent", top_k=2):
        print(f"- {doc['name']}")
