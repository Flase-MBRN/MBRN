#!/usr/bin/env python3
"""
SECURE KEY MANAGER V1
Sichere API-Key Verwaltung via Windows Credential Manager (Level 2 Security)

Usage:
    from secure_key_manager import SecureKeyManager
    
    # Initialisierung
    manager = SecureKeyManager()
    
    # Key speichern (einmalig ausführen)
    manager.store_key("SUPABASE_SERVICE_ROLE_KEY", "your-actual-key")
    
    # Key abrufen (mit Fallback auf .env)
    key = manager.get_key("SUPABASE_SERVICE_ROLE_KEY")

Architect: MBRN Data-MAKER | Law 15: UTC Compliance | Security-Sentinel Approved
"""

import os
import sys
from pathlib import Path
from typing import Optional

# Platform-spezifische Imports
if sys.platform == "win32":
    try:
        import win32cred
        CRED_MANAGER_AVAILABLE = True
    except ImportError:
        CRED_MANAGER_AVAILABLE = False
elif sys.platform == "darwin":
    try:
        import keyring
        CRED_MANAGER_AVAILABLE = True
    except ImportError:
        CRED_MANAGER_AVAILABLE = False
else:
    # Linux: keyring als generische Lösung
    try:
        import keyring
        CRED_MANAGER_AVAILABLE = True
    except ImportError:
        CRED_MANAGER_AVAILABLE = False


class SecureKeyManager:
    """
    Sichere API-Key Verwaltung mit Platform-spezifischen Credential Managern.
    
    Priority:
    1. Windows Credential Manager (Windows)
    2. macOS Keychain (macOS)
    3. keyring (Linux/generic)
    4. .env Fallback (legacy)
    """
    
    def __init__(self, service_name: str = "MBRN_DATA_PIPELINE"):
        self.service_name = service_name
        
        if not CRED_MANAGER_AVAILABLE:
            print(f"[SECURE_KEY] WARNING: Credential Manager nicht verfügbar. Nutze .env Fallback.")
            print(f"[SECURE_KEY] Installiere 'pywin32' (Windows) oder 'keyring' (macOS/Linux) für Level 2 Security.")
    
    def store_key(self, key_name: str, key_value: str) -> bool:
        """
        Speichert API-Key sicher im Credential Manager.
        
        Args:
            key_name: Name des Keys (z.B. SUPABASE_SERVICE_ROLE_KEY)
            key_value: Der eigentliche API-Key
            
        Returns:
            True wenn erfolgreich gespeichert
        """
        if not CRED_MANAGER_AVAILABLE:
            print(f"[SECURE_KEY] ERROR: Credential Manager nicht verfügbar.")
            return False
        
        try:
            # Verwende keyring für alle Plattformen (bessere Encoding-Unterstützung)
            import keyring
            keyring.set_password(self.service_name, key_name, key_value)
            print(f"[SECURE_KEY] OK: {key_name} in Credential Manager gespeichert.")
            return True
                
        except Exception as e:
            print(f"[SECURE_KEY] ERROR: Key speichern fehlgeschlagen: {e}")
            return False
        
        return False
    
    def get_key(self, key_name: str) -> Optional[str]:
        """
        Liest API-Key sicher aus Credential Manager (mit .env Fallback).
        
        Args:
            key_name: Name des Keys
            
        Returns:
            Key-String oder None wenn nicht gefunden
        """
        if CRED_MANAGER_AVAILABLE:
            try:
                # Verwende keyring für alle Plattformen
                import keyring
                password = keyring.get_password(self.service_name, key_name)
                if password:
                    return password
                        
            except Exception as e:
                print(f"[SECURE_KEY] WARN: Credential Manager Zugriff fehlgeschlagen: {e}")
                print(f"[SECURE_KEY] Fallback auf .env...")
        
        # Fallback: .env Datei
        env_value = os.getenv(key_name)
        if env_value:
            print(f"[SECURE_KEY] WARN: {key_name} aus .env geladen (nicht sicher!)")
            return env_value
        
        print(f"[SECURE_KEY] ERROR: {key_name} nicht gefunden.")
        return None
    
    def delete_key(self, key_name: str) -> bool:
        """
        Löscht API-Key aus Credential Manager.
        
        Args:
            key_name: Name des Keys
            
        Returns:
            True wenn erfolgreich gelöscht
        """
        if not CRED_MANAGER_AVAILABLE:
            return False
        
        try:
            # Verwende keyring für alle Plattformen
            import keyring
            keyring.delete_password(self.service_name, key_name)
            print(f"[SECURE_KEY] OK: {key_name} aus Credential Manager gelöscht.")
            return True
                
        except Exception as e:
            print(f"[SECURE_KEY] ERROR: Key löschen fehlgeschlagen: {e}")
            return False
        
        return False
    
    def list_keys(self) -> list[str]:
        """
        Listet alle gespeicherten Keys auf.
        
        Returns:
            Liste der Key-Namen
        """
        keys = []
        if not CRED_MANAGER_AVAILABLE:
            return keys
        
        try:
            if sys.platform == "win32":
                # Windows: Alle Credentials durchsuchen
                for cred in win32cred.CredEnumerate():
                    target = cred['TargetName']
                    if target.startswith(f"{self.service_name}_"):
                        key_name = target.replace(f"{self.service_name}_", "")
                        keys.append(key_name)
                        
            elif sys.platform in ("darwin", "linux"):
                # keyring hat keine direkte List-Funktion
                print(f"[SECURE_KEY] INFO: Keyring List nicht verfügbar auf {sys.platform}")
                
        except Exception as e:
            print(f"[SECURE_KEY] ERROR: Keys auflisten fehlgeschlagen: {e}")
        
        return keys


# =============================================================================
# SETUP HELPER (Initial Migration)
# =============================================================================

def migrate_env_to_secure_manager(env_path: Optional[Path] = None) -> dict[str, str]:
    """
    Migriert Keys aus .env Datei in den Credential Manager.
    
    Args:
        env_path: Pfad zur .env Datei (optional)
        
    Returns:
        Dict mit {key_name: status}
    """
    if env_path is None:
        env_path = Path(__file__).parent / ".env"
    
    if not env_path.exists():
        print(f"[SECURE_KEY] ERROR: .env nicht gefunden: {env_path}")
        return {}
    
    manager = SecureKeyManager()
    results = {}
    
    try:
        content = env_path.read_text(encoding="utf-8")
        for line in content.splitlines():
            if "=" in line and not line.startswith("#"):
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                
                # Nur sensible Keys migrieren
                if "KEY" in key or "SECRET" in key or "TOKEN" in key:
                    success = manager.store_key(key, value)
                    results[key] = "OK" if success else "FAIL"
                    print(f"[MIGRATE] {key}: {results[key]}")
                    
    except Exception as e:
        print(f"[SECURE_KEY] ERROR: Migration fehlgeschlagen: {e}")
    
    return results


# =============================================================================
# MODULE TEST
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("MBRN Secure Key Manager — Module Test")
    print("=" * 60)
    
    manager = SecureKeyManager()
    
    # Test: Key speichern
    print("\n[TEST] Speichere Test-Key...")
    manager.store_key("TEST_API_KEY", "test-value-12345")
    
    # Test: Key lesen
    print("\n[TEST] Lese Test-Key...")
    retrieved = manager.get_key("TEST_API_KEY")
    print(f"Retrieved: {retrieved}")
    
    # Test: Key löschen
    print("\n[TEST] Lösche Test-Key...")
    manager.delete_key("TEST_API_KEY")
    
    # Test: Keys auflisten
    print("\n[TEST] Liste gespeicherte Keys...")
    keys = manager.list_keys()
    print(f"Stored Keys: {keys}")
    
    print("\n[TEST] Fertig.")
