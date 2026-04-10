🎯 MBRN-HUB-V1: PHASE 2.0 (Cloud Persistence \& Global Scale)



&#x20;   System-Architect Directive: Wir integrieren das Backend (Supabase), ohne die bestehende "Offline-First" Logik zu zerstören. Das System muss auch bei Server-Ausfall fehlerfrei im LocalStorage weiterlaufen. Eine Phase = Ein konkreter Task, max. 50-100 LOC oder 1-3 Files.



🛠️ SYSTEM-ARCHITECT "GOTCHAS" (Phase 2.0 Edition)

1\. Die "Client-Side Secret" Falle



Da wir keine Build-Tools nutzen, können wir keine .env Dateien im klassischen Sinne verstecken.



&#x20;   Lösung: Wir nutzen die öffentlichen Supabase "Anon"-Keys. Diese sind sicher, solange die Row Level Security (RLS) in der Datenbank korrekt konfiguriert ist.



&#x20;   Regel: Niemals administrative "Service Role" Keys im Frontend verwenden!



2\. Race Condition beim Cloud-Sync



Wenn der User die Seite lädt, feuert initSystem(). Wenn gleichzeitig der Supabase-Call läuft, müssen wir Konflikte vermeiden.



&#x20;   Lösung: Der LocalStorage bleibt die primäre "Source of Truth" für den sofortigen Start. Supabase "hydriert" den State im Hintergrund nach, sobald die Verbindung steht.



3. Dependency-Management (CDN vs. Local)

Wir binden die Supabase-SDK via ESM-CDN ein, um ohne NPM/Webpack auszukommen.
- Richtig: `import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'`

### 4. Die "Bounce-Rate" Falle (Supabase Ban-Protection)
Supabase blockiert Projekte mit zu hoher Bounce-Rate (ungültige E-Mails) beim Auth-Testing.
- ❌ **Falsch:** Registrierungen mit `test@test.com` oder `asdf@gmail.com` testen.
- ✅ **Richtig:** Ausschließlich "+ Aliase" der eigenen echten E-Mail nutzen (z.B. `dein.name+test1@gmail.com`, `dein.name+test2@gmail.com`). 
- **Zukunft:** Custom SMTP (Resend/SendGrid) wird später ans Backend geklemmt, um Limits aufzuheben.



☁️ MILESTONE 6: CLOUD FORTRESS (Supabase Setup)



Ziel: Verbindung zur Cloud steht, API-Layer ist isoliert.

Sub-Phase	Task	Files	Aufwand

13.1	Supabase Projekt anlegen \& Tabellen (profiles, streaks) via SQL-Editor erstellen	Cloud Console	15 min

13.2	shared/core/api.js — Client-Initialisierung mit Anon-Key \& URL	api.js	10 min

13.3	SMOKE TEST M6 — Console Log api.client zeigt erfolgreiche Verbindung	api.js	5 min



Gotcha-Check:



&#x20;   \[x] RLS (Row Level Security) für Tabellen aktiviert?



&#x20;   \[x] Anon-Key ist im Code als Konstante hinterlegt?



🔐 MILESTONE 7: IDENTITY LAYER (Auth Integration)



Ziel: User können sich einloggen. State bekommt eine user-Property.

Sub-Phase	Task	Files	Aufwand

14.1	actions.login(email, password) — Wrapper für Supabase Auth	actions.js, api.js	20 min

14.2	state.js erweitern — user Objekt in den globalen State aufnehmen	state.js	10 min

14.3	UI-Anpassung: Login-Trigger auf der Landingpage implementieren	index.html, render\_dashboard.js	20 min

14.4	SMOKE TEST M7 — Login erfolgreich → State user ist gefüllt	—	10 min



Gotcha-Check:



&#x20;   \[x] user Objekt wird im state.js korrekt initialisiert?



&#x20;   \[x] Login-Events triggern state.emit('userLoggedIn', data)?



🔄 MILESTONE 8: THE GLOBAL MIRROR (Cloud Sync)



Ziel: Lokale Daten werden automatisch mit der Cloud synchronisiert.

Sub-Phase	Task	Files	Aufwand

15.1	actions.syncProfile() — Push lokaler State (Streak, Level) in die Cloud	actions.js, api.js	25 min

15.2	Auto-Sync Hook: state.emit triggert bei Profil-Änderung Cloud-Upload	state.js, actions.js	20 min

15.3	Cloud-Pull bei initSystem(): Cloud-Daten haben Priorität vor LocalStorage	actions.js	20 min

15.4	SMOKE TEST M8 — PC-Daten eingeben → Handy laden → Daten synchron	—	15 min



Gotcha-Check:



&#x20;    [x] Debouncing für Cloud-Sync implementiert (nicht bei jedem Tastendruck senden)?



    [x] Fallback auf LocalStorage bei fehlender Internetverbindung stabil?



💎 MILESTONE 9: THE VIRAL SATELLITE (Numerology Polish)



Ziel: Die Numerologie-App wird zum ultimativen Share-Tool.

Sub-Phase	Task	Files	Aufwand

16.1	Quantum Gauge UI: SVG-Animation für den Vibrations-Score	numerology/render.js	30 min

16.2	9:16 Share Card: Canvas-Generator für Instagram/TikTok Stories	numerology/logic.js	40 min

16.3	Lead-Bridge: CTA am Ende der Berechnung zum MBRN-Hub	numerology/index.html	15 min

16.4	SMOKE TEST M9 — Share-Card Download funktioniert, CTA leitet weiter	—	10 min



Gotcha-Check:



&#x20;   \[x] Canvas-Export hat korrekte Auflösung für Mobile?



&#x20;   \[x] Alle neuen Imports nutzen .js Endung?



📋 ZUSAMMENFASSUNG PHASE 2.0

Milestone	Phasen	Status

M6: Cloud Fortress	13.1–13.3	✅ Completed

M7: Identity	14.1–14.4	✅ Completed

M8: Global Mirror	15.1–15.4	✅ Completed

M9: Viral Satellite	16.1–16.4	⏳ Pending



Gesamt: 16 Phasen (Fortführung), Fokus auf Cloud-Synchronität und Viralität.



Wichtigste Erfolgsfaktoren:



&#x20;   ✅ Supabase RLS für Datensicherheit



&#x20;   ✅ Debounced Cloud-Sync für Performance



&#x20;   ✅ Viralitäts-Fokus für organisches Wachstum



🚀 NÄCHSTER SCHRITT



Soll mit Phase 13.1 gestartet werden (Supabase Tabellen-Struktur anlegen)?

