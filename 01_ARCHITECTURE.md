🏛️ MBRN-HUB-V1: MASTER SYSTEM DIRECTIVE \& ARCHITECTURE (FINAL)



⚠️ ZERO-TOLERANCE AI DIRECTIVE

READ THIS FIRST: This document is the ABSOLUTE LAW for the MBRN ecosystem. As an AI coding agent or developer, you are strictly forbidden from violating these boundaries.

👉 Das System ist architektonisch geschlossen. Keine Konzept-Änderungen mehr. Nur noch Exekution.

👁️ 1. DIE VISION: DAS MBRN ÖKOSYSTEM



MBRN ist kein loses Tool-Paket, sondern ein modulares Ökosystem, das Disziplin in Zugang, Status und echten Nutzen verwandelt. Die Plattform belohnt Konsistenz statt Zufall.



&#x20;   👑 Finance (Conversion Engine): Zieht die Nutzer rein.



&#x20;   🛡️ Discipline \& Numerology (Retention Loop): Halten die Nutzer im System.



&#x20;   ⚙️ Config (Monetarisierung): Access Levels und Features sind von Tag 1 an tief im Core verankert.



⚖️ 2. DIE EISERNEN REGELN (Core Guidelines \& AI-Proofing)



Niemand bricht diese 9 Gesetze. Sie verhindern Spaghetticode, XSS, UI-Chaos und AI-Halluzinationen.



&#x20;   Module Responsibility Rule: Jedes File/Modul hat exakt EINE Aufgabe. Niemals Logic + State + UI in einer Datei mischen.



&#x20;   No direct DOM manipulation in Core/Logic/Actions: document.querySelector oder innerHTML ist AUSSCHLIESSLICH in dedizierten render.js oder UI-Layern erlaubt.



&#x20;   Safe Rendering Rule: Alle DOM-Updates müssen über dom\_utils.js laufen (Sanitized Rendering only). Das verhindert XSS, kaputte UI und unsichere Inserts.



&#x20;   Structured Returns Only: ALLE Module/Funktionen müssen standardisierte Objekte zurückgeben: { success: true, data: ... } oder { success: false, error: "..." }. Niemals raw strings oder undefined.



&#x20;   Idempotent Actions: Alle Actions müssen sicher mehrfach ausführbar sein, ohne den State zu zerschießen (Wichtig für Doppel-Klicks, Network-Lags und AI-Calls).



&#x20;   Event Naming Convention: Alle Pub/Sub Events folgen strikt diesem Muster:



&#x20;       actionCompleted (z.B. calculationDone, loginSuccess)



&#x20;       stateChanged (z.B. streakUpdated, themeSwitched)



&#x20;       uiRequested (z.B. renderDashboard, openModal)



&#x20;   Fallback State: Falls die Datenbank (Supabase) nicht lädt oder offline ist, muss das System immer auf den localStorage State zurückfallen (Stabile UX garantiert).



&#x20;   No Magic Numbers: Alles wird über die MBRN\_CONFIG gesteuert (Thresholds, Levels, Delays).



&#x20;   No Local CSS override: Nutze ausschließlich /shared/ui/theme.css Variablen.



📂 3. DIRECTORY STRUCTURE (The Fortified Micro-Architecture)



Strikte Trennung von Daten (Core), Ansicht (UI), Use Cases (Actions) und Geschäftslogik (Apps).

Plaintext



/MBRN-HUB-V1

│

├── /shared                     # 🧠 THE ENGINE (Platform Core)

│   ├── /ui                     # THE RENDERING LAYER (Exclusive DOM Rights)

│   │   ├── theme.css           # SINGLE SOURCE OF TRUTH (:root, colors, fonts)

│   │   ├── components.css      # Globale Buttons, Cards, Modals

│   │   ├── navigation.js       # Globale Hub-Navigation

│   │   └── dom\_utils.js        # Helfer für sicheres DOM-Rendering (Sanitization)

│   │

│   ├── /core                   # THE DATA \& ORCHESTRATION LAYER

│   │   ├── config.js           # MBRN\_CONFIG (Single Source of Truth)

│   │   ├── storage.js          # Unified LocalStorage Wrapper (mbrn\_\*)

│   │   ├── state.js            # Global State Manager (Pub/Sub Event System)

│   │   ├── actions.js          # 🔥 ACTIONS LAYER: Orchestriert Logik \& State-Emits

│   │   └── api.js              # Database Connections (z.B. Supabase)

│   │

│   └── /loyalty                # THE BUSINESS LAYER (The Mastery System)

│       ├── streak\_manager.js   # Berechnet Streaks, Shields und Check-ins

│       └── access\_control.js   # Gatekeeper: Prüft Unlocks \& Feature Flags

│

├── /apps                       # 🧩 THE PLUG-INS (Isolated App Logic)

│   ├── /finance                # 👑 Der König (Lead Product)

│   │   ├── index.html

│   │   ├── logic.js            # STRICTLY MATHE/LOGIK (Pure Functions)

│   │   ├── render.js           # Hört auf Events, manipuliert DOM

│   │   └── app.css             # NUR lokales Grid/Layout

│   ├── /discipline             # 🛡️ Der Diener 1

│   └── /numerology             # 🛡️ Der Diener 2

│

├── /dashboard                  # 📊 USER AREA (The Mastery Mirror)

│   ├── index.html              

│   └── render\_dashboard.js     # Zeigt Tiers, Shields und Unlocks

│

├── /landing                    # 🌍 PUBLIC FRONTEND (The Hook)

│   └── index.html              

│

└── index.html                  # 🔄 ROOT REDIRECT (Routing)



💾 4. THE CONFIG \& DATA SCHEMA (Rules Engine)

A. Das MBRN Mastery System (/shared/core/config.js)

JavaScript



export const MBRN\_CONFIG = {

&#x20; accessLevels: {

&#x20;   FREE: 0,

&#x20;   SPARK: 1,      // 7 Tage: Kleine Anerkennung, erster Status

&#x20;   BUILDER: 2,    // 30 Tage: 1 Tool nach Wahl dauerhaft freigeschaltet

&#x20;   OPERATOR: 3,   // 90 Tage: 3 Tools + erweiterte Funktionen

&#x20;   MEMBER: 4,     // 365 Tage: Full Hub Access, Beta, Voting

&#x20;   PAID\_PRO: 10   // Premium Features (Depth \& Comfort)

&#x20; },

&#x20; tiers: { spark: 7, builder: 30, operator: 90, member: 365 },

&#x20; shields: { earnRate: 7, max: 3 }, // Streak Shield: Schutz vor Rückfall

&#x20; powerPass: { triggerDay: 15, durationHours: 48 } // Vorgeschmack auf Premium

};



B. State Layer (Supabase / LocalStorage Fallback)

JSON



{

&#x20; "user\_id": "uuid",

&#x20; "current\_streak": 0,

&#x20; "shields\_available": 0,      

&#x20; "access\_level": 0,           

&#x20; "unlocked\_tools": \["finance\_basic"],

&#x20; "features": {                

&#x20;   "ai\_analysis": false,

&#x20;   "pdf\_export": false

&#x20; }

}



🚀 5. STRICT DATA FLOW (The Event-Driven Engine)



Ein sauberer Flow ohne Kurzschlüsse. Keine Ausnahmen.



&#x20;   User Action: User klickt auf "Berechnen" im UI. UI triggert actions.calculateFinance(input).



&#x20;   Action Layer (actions.js): \* Ruft logic.js auf (Idempotent, Pure Math).



&#x20;       Fängt Errors ab (Standardized Error Handling).



&#x20;       Emit event: state.emit('calculationDone', { success: true, data: result }).



&#x20;   Logic Layer (logic.js): Rechnet nur, weiß nichts vom DOM oder vom State.



&#x20;   State Layer (state.js): Verteilt das Event sicher an alle Subscriber. Fallback auf LocalStorage, falls DB offline.



&#x20;   Rendering Layer (render.js): \* Hört auf Event: state.subscribe('calculationDone', updateUI).



&#x20;       Gatekeeper-Check (Loyalty/Access): if(hasFeature('pdf\_export')) renderPdfButton().



&#x20;       Zeigt das Ergebnis an (Strictly via dom\_utils.js).



END OF DIRECTIVE. SYSTEM ARCHITECT OUT.

