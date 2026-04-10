🏛️ MBRN-HUB-V1: MASTER SYSTEM DIRECTIVE \& ARCHITECTURE — PHASE 2.0 (CLOUD EDITION)



⚠️ ZERO-TOLERANCE AI DIRECTIVE: CLOUD UPDATE



READ THIS FIRST: Dieses Dokument ist die Erweiterung des MBRN-Gesetzes für die Phase 2.0 (Cloud Persistence \& Global Scale). Die Architektur wird von einer lokalen "Fortress" zu einem globalen Cloud-Ecosystem (Supabase) ausgebaut. Jede KI-Instanz und jeder Developer ist strikt an diese neuen Synchronisations- und Sicherheitsregeln gebunden.



👉 Das System skaliert jetzt. Die Architektur bleibt modular, wird aber durch den Identity-Layer vervollständigt.



👁️ 1. DIE VISION: DAS GLOBALE MBRN ÖKOSYSTEM



In Phase 2.0 transformiert sich MBRN von einem lokalen Tool-Set zu einer Multi-Device Plattform. Der Fokus liegt auf der Verschmelzung von lokaler Geschwindigkeit und globaler Daten-Persistenz.



&#x20;   👑 The Core Hub: Finanzielle Freiheit und Systematik, synchronisiert über alle Geräte.



&#x20;   🛡️ The Satellites: Die Numerologie-App fungiert als Viraler Lead-Magnet. Sie existiert als hochoptimierter Einstiegspunkt, um Traffic über Social Media (Klaudia) in das MBRN-Backend zu schleusen.



&#x20;   ☁️ The Cloud Brain: Supabase übernimmt die Rolle des globalen Gedächtnisses, während der LocalStorage als "Instant-On" Cache fungiert.



⚖️ 2. DIE EISERNEN REGELN (Sync \& Security Edition)



Zusätzlich zu den 9 Grundgesetzen der Phase 1 gelten ab sofort diese 3 Cloud-Gesetze:



&#x20;   Cloud-First, Offline-Always Rule: Das System startet immer sofort mit LocalStorage-Daten (Instant-UX). Die Cloud-Synchronisation (Supabase) findet asynchron im Hintergrund statt ("Optimistic UI Updates").



&#x20;   Row Level Security (RLS) Law: Kein Datenbank-Zugriff ohne RLS. Daten im Backend sind physisch so getrennt, dass User A niemals die Daten von User B lesen kann – auch wenn er die API-Keys kennt.



&#x20;   Sync-Debouncing Rule: Cloud-Uploads dürfen niemals bei jedem Tastendruck gefeuert werden. Änderungen am State müssen gesammelt (debounced) und in Paketen an die API gesendet werden, um die Performance zu wahren.



📂 3. DIRECTORY STRUCTURE (Finalized Layering)



Die Struktur bleibt stabil, der api.js Layer wird zum aktiven Kommunikationszentrum.

Plaintext



/MBRN-HUB-V1

│

├── /shared                     # 🧠 THE ENGINE

│   ├── /core                   

│   │   ├── api.js              # 🔥 CLOUD GATEWAY: Supabase Client \& Sync-Logic

│   │   ├── actions.js          # Erweitert um Auth- \& Sync-Actions

│   │   └── ...

│   └── /loyalty                

│       └── access\_control.js   # Prüft jetzt auch den Auth-Status (Logged In vs. Guest)

│

├── /apps                       

│   ├── /finance                

│   └── /numerology             # 🛰️ SATELLITE MODE: Inkl. Canvas-Share-Generator

│

└── ...



💾 4. THE CLOUD SCHEMA (Supabase Tables)



A. Table: profiles

Zentraler Speicher für den Nutzerstatus.

Column	Type	Description

id	uuid (PK)	Verknüpft mit Supabase Auth user\_id

display\_name	text	Nutzername für das Dashboard

access\_level	int4	Entspricht MBRN\_CONFIG.accessLevels

current\_streak	int4	Aktueller Loyalty-Status

shields	int4	Verfügbare Shields

last\_sync	timestamp	"Last Write Wins" Zeitstempel



B. Table: app\_data

Flexibler Speicher für App-spezifische Ergebnisse (JSONB).

Column	Type	Description

user\_id	uuid (FK)	Besitzer der Daten

app\_id	text	'finance', 'numerology', etc.

payload	jsonb	Der gespeicherte State der App (Input + Results)



🚀 5. STRICT DATA FLOW (The Sync-Cycle)



Der Datenfluss wird um die Cloud-Schleife erweitert, ohne den lokalen Loop zu unterbrechen:



&#x20;   User Action: User ändert Daten (z.B. Check-in oder Finanz-Input).



&#x20;   Local Loop: actions.js -> state.js -> LocalStorage. Die UI updated sofort.



&#x20;   Cloud Trigger: state.js erkennt Änderung und triggert api.js nach einem Delay (Debounce).



&#x20;   API Sync: api.js sendet Update an Supabase.



&#x20;   Global Confirmation: Bei Erfolg wird ein syncSuccess Event emitted. Bei Fehler bleibt das System im lokalen Modus und versucht den Sync später erneut (Retry-Logik).



END OF PHASE 2.0 DIRECTIVE. THE SYSTEM IS NOW GLOBAL. SYSTEM ARCHITECT OUT.

