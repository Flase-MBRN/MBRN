🚀 MBRN-HUB-V1 ROADMAP: PHASE 2.0 (Cloud Persistence \& Global Scale)



🎯 SYSTEM ARCHITECT DIRECTIVE: Keine Abweichungen. Phase 2.0 macht aus der lokalen Festung eine globale Cloud-Plattform. Wir integrieren das Backend (Supabase), ohne die "Offline-First" Stabilität zu opfern. Jeder Meilenstein muss die Cloud-Synchronität beweisen, bevor das nächste Feature gebaut wird.

✅ MILESTONE 6: CLOUD FORTRESS (Supabase Integration)



Ziel: Die Anbindung an die Cloud steht. Das System besitzt einen isolierten API-Layer, der mit der Datenbank kommuniziert, ohne den Core zu blockieren.



&#x20;   \[ ] Datenbank-Architektur: Tabellen für profiles und streaks via SQL-Editor in Supabase anlegen.



&#x20;   \[ ] Security First: Row Level Security (RLS) in Supabase aktivieren, um Datenzugriff zu schützen.



&#x20;   \[ ] API Client Init: shared/core/api.js vervollständigen – Client mit Anon-Key und URL initialisieren.



&#x20;   \[ ] Connectivity Guard: Verbindungstest-Logik implementieren (Online/Offline Status im State).



✅ DEFINITION OF DONE (M6):



&#x20;   Die Verbindung zwischen Hub und Supabase ist stabil und via Console verifizierbar.



&#x20;   api.js ist das einzige Modul, das die Supabase-SDK kennt (Isolation).



&#x20;   Die Datenbank-Tabellen entsprechen exakt der Struktur des lokalen state.js.



🔥 SMOKE TEST (M6):



&#x20;   \[ ] Aufruf von api.client in der Browser-Console gibt kein undefined, sondern das initialisierte Supabase-Objekt zurück.



&#x20;   \[ ] Ein manueller Test-Insert in die Datenbank via API funktioniert ohne Permission-Errors.



✅ MILESTONE 7: IDENTITY LAYER (User Auth \& State)



Ziel: Nutzer können sich identifizieren. Das System unterscheidet zwischen anonymen Besuchern und registrierten "System Architects".



&#x20;   \[ ] Auth Wrappers: actions.login(email, password) und actions.register() in actions.js implementieren.



&#x20;   \[ ] State Hydration: Das state.js Objekt um die Property user erweitern.



&#x20;   \[ ] Session Persistence: Automatisches Wiederherstellen der Session beim App-Start in initSystem().



&#x20;   \[ ] UI-Trigger: Login-Komponente auf der Landingpage mit dem Auth-Flow verknüpfen.



✅ DEFINITION OF DONE (M7):



&#x20;   Nach dem Login ist das user-Objekt im State global verfügbar.



&#x20;   Auth-Events (Login/Logout) werden via state.emit an alle Apps (Finance, Numerology) kommuniziert.



&#x20;   Das System bleibt bei fehlgeschlagenem Login voll funktionsfähig (Fallback auf Gast-Modus).



🔥 SMOKE TEST (M7):



    [x] Login-Vorgang füllt den State und löst ein userLoggedIn-Event aus.



    [x] Page-Reload nach Login: Der User bleibt eingeloggt (Session Recovery).



    [x] Keine Console Errors bei falschen Zugangsdaten (sauberes Error-Handling).



✅ MILESTONE 8: THE GLOBAL MIRROR (Cloud Sync Engine)



Ziel: Lokale Daten und Cloud-Daten verschmelzen. Der Nutzer kann das Gerät wechseln, ohne seinen Streak oder seine Berechnungen zu verlieren.



    [x] Sync Logic: actions.syncProfile() implementiert den Push-Pull-Mechanismus zwischen LocalStorage und Supabase.



    [x] Conflict Management: Zeitstempel-Vergleich einführen – die neueste Änderung gewinnt ("Last Write Wins").



    [x] Debounced Upload: Automatischer Cloud-Sync bei State-Änderungen (mit Verzögerung, um API-Limits zu schonen).



    [x] Cloud-First Boot: actions.initSystem() so erweitern, dass Cloud-Daten bevorzugt geladen werden, wenn ein User eingeloggt ist.



✅ DEFINITION OF DONE (M8):



    Änderungen am lokalen Streak werden innerhalb von max. 5 Sekunden in die Cloud gespiegelt.



    Ein eingeloggter User sieht auf einem neuen Gerät sofort seine alten Daten.



    Offline-Änderungen werden automatisch synchronisiert, sobald das System wieder "Online" erkennt.



🔥 SMOKE TEST (M8):



    [x] Daten am PC ändern -> Handy öffnen -> Daten sind identisch.



    [x] Flugmodus-Test: Daten lokal ändern -> Online gehen -> Daten werden in Supabase aktualisiert.



💎 MILESTONE 9: THE VIRAL SATELLITE (Advanced Numerology)



Ziel: Das Numerologie-Plugin wird zum perfekten "Lead-Magneten" ausgebaut, um die Reichweiten-Engine (Klaudia) zu füttern.



&#x20;   \[ ] Quantum UI: Die "Quantum Score" Gauge mit SVG-Animationen in render.js finalisieren.



&#x20;   \[ ] Canvas Story Generator: Export-Funktion für 9:16 Share-Cards (Instagram/TikTok) in logic.js bauen.



&#x20;   \[ ] Lead-Bridge: Den strategischen CTA am Ende der Berechnung implementieren ("Maximiere dein Potential im MBRN Hub").



&#x20;   \[ ] Analytics Hooks: Tracking von "Shares" und "Calculations" (anonymisiert) in Supabase.



✅ DEFINITION OF DONE (M9):



&#x20;   Alle 36 Kennzahlen werden mathematisch korrekt berechnet und visuell ansprechend gerendert.



&#x20;   Der User kann ein Bild seines Profils mit einem Klick generieren und herunterladen.



&#x20;   Der Konvertierungspfad von der Numerologie-App zum MBRN-Finanz-Hub ist nahtlos.



🔥 SMOKE TEST (M9):



&#x20;   \[ ] Share-Card Download erzeugt ein gültiges .png in korrekter Auflösung.



&#x20;   \[ ] Klick auf den CTA führt ohne Umwege zur Finance-App oder zum Dashboard.



&#x20;   \[ ] Quantum-Score Animation läuft flüssig ohne Frame-Drops.



🏁 ENDSTATE PHASE 2.0: Aus dem lokalen Tool ist ein globales Ökosystem geworden. Die Daten sind sicher in der Cloud, die Nutzer sind identifizierbar und die virale Reichweite ist durch den Numerologie-Satelliten technisch vorbereitet.

