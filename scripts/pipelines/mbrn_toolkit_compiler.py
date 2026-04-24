import ast
import os
import re
import shutil
from pathlib import Path
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[2]
FACTORY_DIR = PROJECT_ROOT / "docs" / "S3_Data" / "outputs" / "factory_ready"
TOOLKIT_DIR = PROJECT_ROOT / "scripts" / "pipelines" / "mbrn_toolkit"
MODULES_DIR = TOOLKIT_DIR / "modules"
CATALOG_PATH = TOOLKIT_DIR / "TOOLKIT_CATALOG.md"

def sanitize_filename(name: str) -> str:
    """Removes the date prefix and _module suffix for a cleaner package name."""
    # Pattern to match: 20260424_185319_author_repo_name_module.py
    name = re.sub(r'^\d{8}_\d{6}_', '', name)
    name = name.replace('_module.py', '.py')
    return name.lower()

def extract_functions(file_path: Path) -> list:
    """Uses AST to extract all top-level functions and classes."""
    funcs = []
    try:
        content = file_path.read_text(encoding='utf-8')
        tree = ast.parse(content)
        # Only look at top-level nodes in the module body
        for node in tree.body:
            if isinstance(node, ast.FunctionDef) or isinstance(node, ast.ClassDef):
                if node.name.startswith('_'):
                    continue
                docstring = ast.get_docstring(node) or "No description provided."
                
                args = []
                if isinstance(node, ast.FunctionDef):
                    args = [arg.arg for arg in node.args.args]
                
                funcs.append({
                    "name": node.name,
                    "docstring": docstring,
                    "args": args,
                    "type": "class" if isinstance(node, ast.ClassDef) else "function"
                })
    except Exception as e:
        print(f"Error parsing {file_path.name}: {e}")
    return funcs

def compile_toolkit():
    print("==================================================")
    print(" MBRN TOOLKIT COMPILER - THE LEGO FACTORY")
    print("==================================================")

    if not FACTORY_DIR.exists():
        print(f"Directory not found: {FACTORY_DIR}")
        return

    # Prepare directories
    if TOOLKIT_DIR.exists():
        shutil.rmtree(TOOLKIT_DIR)
    
    TOOLKIT_DIR.mkdir(parents=True, exist_ok=True)
    MODULES_DIR.mkdir(parents=True, exist_ok=True)
    
    # Touch __init__.py for modules folder
    (MODULES_DIR / "__init__.py").touch()

    py_files = list(FACTORY_DIR.glob("*.py"))
    if not py_files:
        print("No modules found in factory_ready.")
        return

    print(f"Found {len(py_files)} validated modules. Compiling...")

    init_imports = []
    catalog_entries = []

    catalog_entries.append("# MBRN Agent Toolkit Catalog")
    catalog_entries.append("This is an auto-generated registry of all autonomous capabilities manufactured by the MBRN Dark Factory.\n")
    catalog_entries.append(f"**Last Compiled:** {datetime.now(timezone.utc).isoformat()}\n")
    catalog_entries.append("## Available Functions\n")

    for file_path in py_files:
        clean_name = sanitize_filename(file_path.name)
        module_name = clean_name[:-3]  # remove .py
        
        # Copy to toolkit
        target_path = MODULES_DIR / clean_name
        shutil.copy(file_path, target_path)

        # Extract intelligence
        functions = extract_functions(target_path)
        
        if functions:
            catalog_entries.append(f"### Module: `{module_name}`")
            catalog_entries.append(f"> Extracted from: `{file_path.name}`\n")
            
            for func in functions:
                func_name = func['name']
                is_class = func.get('type') == 'class'
                args_str = ", ".join(func['args']) if not is_class else ""
                
                # Add to catalog
                if is_class:
                    catalog_entries.append(f"#### `class {func_name}`")
                else:
                    catalog_entries.append(f"#### `{func_name}({args_str})`")
                    
                # Format docstring neatly
                clean_doc = "\n".join([f"> {line}" for line in func['docstring'].split('\n')])
                catalog_entries.append(f"{clean_doc}\n")
            
            catalog_entries.append("---\n")                
    # Generate Markdown Catalog
    CATALOG_PATH.write_text("\n".join(catalog_entries), encoding='utf-8')

    print(f"\n[SUCCESS] Compiled {len(py_files)} modules into 'mbrn_toolkit' package.")
    print(f"Registry generated at: {CATALOG_PATH}")
    print("\nHow to use in your agents:")
    print("  Read TOOLKIT_CATALOG.md to discover capabilities, then dynamically import or subprocess the required module.")
    print("==================================================")

if __name__ == "__main__":
    compile_toolkit()
