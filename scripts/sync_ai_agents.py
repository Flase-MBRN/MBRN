import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER_FILE = os.path.join(ROOT_DIR, "AI_MASTER_RULES.md")
TRAE_RULES = os.path.join(ROOT_DIR, ".cursorrules")
WINDSURF_RULES = os.path.join(ROOT_DIR, ".windsurfrules")


def sync_rules():
    if not os.path.exists(MASTER_FILE):
        print(f"❌ Fehler: {MASTER_FILE} nicht gefunden!")
        return

    with open(MASTER_FILE, "r", encoding="utf-8") as f:
        master_content = f.read()

    # 1. Sync für Trae (.cursorrules)
    with open(TRAE_RULES, "w", encoding="utf-8") as f:
        f.write(master_content)
    print("✅ Erfolgreich: Trae (.cursorrules) aktualisiert.")

    # 2. Sync für Windsurf (.windsurfrules)
    with open(WINDSURF_RULES, "w", encoding="utf-8") as f:
        f.write(master_content)
    print("✅ Erfolgreich: Windsurf (.windsurfrules) aktualisiert.")

    # 3. Output für Web-IDEs (Codex / Antigravity)
    print("\n" + "="*50)
    print("🚀 KOPIER-BLOCK FÜR ANTIGRAVITY & CODEX 🚀")
    print("="*50)
    print("Lies diese System-Regeln und akzeptiere sie, bevor wir starten:\n")
    print(master_content)
    print("="*50 + "\n")


if __name__ == "__main__":
    sync_rules()
