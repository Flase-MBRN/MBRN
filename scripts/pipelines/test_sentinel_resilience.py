#!/usr/bin/env python3
"""
TEST: Sentinel Resilience Verbesserungen
Testet die neue Fehlerbehandlung und Circuit Breaker Logik.
"""

import os
import sys
from pathlib import Path

# Füge pipelines zum Pfad hinzu
sys.path.insert(0, str(Path(__file__).parent))

from sentinel_daemon import perform_heartbeat, heartbeat_circuit_breaker, CONFIG
from pipeline_utils import CircuitBreaker

def test_circuit_breaker():
    """Testet Circuit Breaker Funktionalität."""
    print("\n=== TEST 1: Circuit Breaker ===")
    
    # Initialer Zustand prüfen
    assert heartbeat_circuit_breaker.state == "closed", "Circuit Breaker sollte initial CLOSED sein"
    print("✓ Circuit Breaker initial CLOSED")
    
    # Fehlschläge simulieren
    for i in range(CONFIG["circuit_breaker_threshold"]):
        heartbeat_circuit_breaker.record_failure()
    
    assert heartbeat_circuit_breaker.state == "open", "Circuit Breaker sollte nach Threshold OPEN sein"
    print(f"✓ Circuit Breaker nach {CONFIG['circuit_breaker_threshold']} Fehlern OPEN")
    
    # Can Execute sollte False zurückgeben
    assert not heartbeat_circuit_breaker.can_execute(), "Can Execute sollte False sein wenn OPEN"
    print("✓ Can Execute gibt False zurück bei OPEN")
    
    # Reset
    heartbeat_circuit_breaker.record_success()
    assert heartbeat_circuit_breaker.state == "closed", "Circuit Breaker sollte nach Success CLOSED sein"
    print("✓ Circuit Breaker nach Success wieder CLOSED")
    
    print("\n✅ TEST 1 PASSED")

def test_heartbeat_missing_keys():
    """Testet Heartbeat mit fehlenden API Keys."""
    print("\n=== TEST 2: Heartbeat Missing Keys ===")
    
    # Keys temporär entfernen
    original_url = os.getenv("SUPABASE_URL")
    original_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    os.environ["SUPABASE_URL"] = ""
    os.environ["SUPABASE_SERVICE_ROLE_KEY"] = ""
    
    result = perform_heartbeat()
    assert result == False, "Heartbeat sollte False zurückgeben ohne Keys"
    print("✓ Heartbeat gibt False zurück ohne Keys")
    
    # Keys wiederherstellen
    if original_url:
        os.environ["SUPABASE_URL"] = original_url
    if original_key:
        os.environ["SUPABASE_SERVICE_ROLE_KEY"] = original_key
    
    print("\n✅ TEST 2 PASSED")

def test_config_values():
    """Testet ob die neuen CONFIG Werte korrekt gesetzt sind."""
    print("\n=== TEST 3: CONFIG Values ===")
    
    assert "heartbeat_timeout_seconds" in CONFIG, "heartbeat_timeout_seconds sollte in CONFIG sein"
    print(f"✓ heartbeat_timeout_seconds: {CONFIG['heartbeat_timeout_seconds']}")
    
    assert "max_retries" in CONFIG, "max_retries sollte in CONFIG sein"
    print(f"✓ max_retries: {CONFIG['max_retries']}")
    
    assert "circuit_breaker_threshold" in CONFIG, "circuit_breaker_threshold sollte in CONFIG sein"
    print(f"✓ circuit_breaker_threshold: {CONFIG['circuit_breaker_threshold']}")
    
    assert "circuit_breaker_cooldown" in CONFIG, "circuit_breaker_cooldown sollte in CONFIG sein"
    print(f"✓ circuit_breaker_cooldown: {CONFIG['circuit_breaker_cooldown']}")
    
    assert CONFIG["heartbeat_timeout_seconds"] == [5, 10, 30], "Timeouts sollten [5, 10, 30] sein"
    print("✓ Timeout Backoff korrekt konfiguriert")
    
    print("\n✅ TEST 3 PASSED")

def test_secure_key_manager():
    """Testet Secure Key Manager."""
    print("\n=== TEST 4: Secure Key Manager ===")
    
    try:
        from secure_key_manager import SecureKeyManager
        
        manager = SecureKeyManager()
        print("✓ SecureKeyManager importiert")
        
        # Test-Key speichern
        test_key_name = "TEST_SENTINEL_KEY"
        test_key_value = "test-12345"
        
        success = manager.store_key(test_key_name, test_key_value)
        if success:
            print(f"✓ Test-Key '{test_key_name}' gespeichert")
            
            # Test-Key lesen
            retrieved = manager.get_key(test_key_name)
            assert retrieved == test_key_value, f"Retrieved Key sollte '{test_key_value}' sein, aber ist '{retrieved}'"
            print(f"✓ Test-Key korrekt zurückgegeben")
            
            # Test-Key löschen
            manager.delete_key(test_key_name)
            print(f"✓ Test-Key '{test_key_name}' gelöscht")
            
            print("\n✅ TEST 4 PASSED")
        else:
            print("⚠️  TEST 4 SKIPPED: Credential Manager nicht verfügbar")
            
    except ImportError as e:
        print(f"⚠️  TEST 4 SKIPPED: secure_key_manager nicht verfügbar: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("MBRN Sentinel Resilience Tests")
    print("=" * 60)
    
    try:
        test_circuit_breaker()
        test_heartbeat_missing_keys()
        test_config_values()
        test_secure_key_manager()
        
        print("\n" + "=" * 60)
        print("🎉 ALLE TESTS BESTANDEN")
        print("=" * 60)
        
    except AssertionError as e:
        print(f"\n❌ TEST FEHLGESCHLAGEN: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        sys.exit(1)
