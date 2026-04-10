🚀 MBRN-HUB-V1 ROADMAP (Execution Blueprint)



🎯 SYSTEM ARCHITECT DIRECTIVE: Kein Overthinking. Keine neuen Konzepte. Striktes Abarbeiten der MBRN\_MASTER\_DIRECTIVE.md. Jeder Meilenstein MUSS die "Definition of Done" und den "Smoke Test" bestehen, bevor auch nur eine Zeile Code für den nächsten geschrieben wird.

🧱 MILESTONE 0: FORTRESS SETUP (Structural Foundation)



Ziel: Die Ordnerstruktur steht, Altlasten sind isoliert und die UI-Basis zwingt uns zu XSS-sicherem Rendering über native APIs.



&#x20;   \[x] Neues Repo/Hauptverzeichnis anlegen: /MBRN-HUB-V1



&#x20;   \[x] Alte Code-Schnipsel in /archive verschieben (Nichts wird direkt kopiert!).



&#x20;   \[x] Ordnerstruktur exakt nach Blueprint erstellen (/shared, /apps, /dashboard, etc.).



&#x20;   \[x] shared/ui/theme.css anlegen: Alle Farben, Fonts und Spacings als CSS-Variablen definieren.



&#x20;   \[x] shared/ui/dom\_utils.js anlegen: Die Safe Rendering API implementieren.



&#x20;       dom.setText(id, text) (XSS-sicher via textContent)



&#x20;       dom.renderTemplate(templateId, targetId, callback) (Nutzung von <template> Tags statt HTML-Strings)



&#x20;       dom.clear(id) (via replaceChildren())



✅ DEFINITION OF DONE (M0):



&#x20;   Kein alter Code liegt mehr im Root-Verzeichnis.



&#x20;   theme.css ist die alleinige Quelle für Styling-Variablen.



&#x20;   dom\_utils.js existiert und erzwingt das Arbeiten mit Text Nodes und Templates (kein innerHTML).



🔥 SMOKE TEST (M0):





🧠 MILESTONE 1: THE ENGINE (Core State \& Orchestration)



Ziel: Das Gehirn des Systems "lebt". Daten können gespeichert, Status gesendet und Aktionen ohne UI-Eingriff orchestriert werden.



&#x20;   \[x] shared/core/config.js: Das Gesetzbuch schreiben (Access Levels, Tiers, Shields, PowerPass-Zeiten).



&#x20;   \[x] shared/core/storage.js: Den LocalStorage-Wrapper bauen. Prefix mbrn\_ erzwingen.



&#x20;   \[x] shared/core/state.js: Das Pub/Sub-System bauen (subscribe, emit).



&#x20;   \[x] shared/core/actions.js: Den Orchestrator anlegen.



✅ DEFINITION OF DONE (M1):



&#x20;   state.emit und state.subscribe funktionieren nahtlos.



&#x20;   Daten persistieren nach einem Page-Reload im Browser (via storage.js).



&#x20;   In actions.js und core existiert absolut kein document.querySelector oder anderer DOM-Code.



🔥 SMOKE TEST (M1):



&#x20;   \[x] Manuelles Auslösen einer Action über die Console ändert den State.



&#x20;   \[x] State-Änderung wird im localStorage gespeichert.



&#x20;   \[x] System lädt ohne Errors. Keine Console Errors.



🛡️ MILESTONE 2: THE MASTERY SYSTEM (Loyalty \& Gatekeeper)



Ziel: Konsistenz wird messbar. Das System weiß, wer Zugang hat und wer nicht.



&#x20;   \[x] shared/loyalty/streak\_manager.js: Logik für täglichen Check-in, Streak++ und Shield-Verbrauch implementieren.



&#x20;   \[x] shared/loyalty/access\_control.js: Die Gatekeeper-Funktionen schreiben (hasAccessTo(tool), hasFeature(featureName)).



&#x20;   \[x] Test-Action in actions.js einbauen: actions.triggerCheckIn().



✅ DEFINITION OF DONE (M2):



&#x20;   Ein Check-in erhöht den Streak exakt um 1 und speichert ihn via State-Event.



&#x20;   Der Gatekeeper liest die Regeln erfolgreich aus der MBRN\_CONFIG aus und blockiert/erlaubt Features korrekt.



&#x20;   Alle Zahlen/Grenzwerte kommen aus der Config, null "Magic Numbers" im Code.



🔥 SMOKE TEST (M2):



&#x20;   \[x] Ausführen von actions.triggerCheckIn() wirft keinen Error und ist idempotent (sicher bei Mehrfachaufruf).



&#x20;   \[x] Console-Check: access\_control.hasFeature('paid\_feature') gibt bei Basis-Level korrekterweise false zurück.



&#x20;   \[x] Keine Console Errors.



👑 MILESTONE 3: THE KING (Finance App Integration)



Ziel: Das Lead-Produkt einbauen. Es ist blind für das System, liefert aber den echten Mehrwert.



&#x20;   \[x] apps/finance/logic.js: Die reine Zinseszins-/Szenario-Mathematik schreiben (Returns = {success: true, data: ...}).



&#x20;   \[x] actions.js erweitern: actions.calculateFinance(input) delegiert an logic.js und feuert state.emit.



&#x20;   \[x] apps/finance/render.js: Hört auf Events und nutzt ausschließlich dom\_utils.js (Templates/Text) zum Rendern.



&#x20;   \[x] Feature-Hook im Render einbauen: Gatekeeper-Abfrage für z.B. PDF-Export.



✅ DEFINITION OF DONE (M3):



&#x20;   Die Berechnung in logic.js ist komplett entkoppelt von der UI.



&#x20;   Das UI (HTML/DOM) aktualisiert sich ausschließlich reaktiv über Events, die in render.js gefangen werden.



&#x20;   Kein innerHTML oder wildes String-Parsing für UI-Updates genutzt.



🔥 SMOKE TEST (M3):



&#x20;   \[x] Kompletter Flow funktioniert: UI Input -> Action -> Logic -> State -> UI Render.



&#x20;   \[x] Berechnungs-Ergebnisse stimmen mathematisch.



&#x20;   \[x] Keine Console Errors während des gesamten Flows.



📊 MILESTONE 4: THE MASTERY MIRROR (Dashboard \& UI Glue)



Ziel: Der Nutzer sieht seinen Status. Die Retention-Loop schließt sich.



&#x20;   \[x] dashboard/render\_dashboard.js: Hört auf State-Changes.



&#x20;   \[x] Rendern des Current Tiers und Streaks basierend auf den State-Daten (via <template>).



&#x20;   \[x] Globale Navigation (shared/ui/navigation.js): Routing zwischen Landing, Dashboard und App.



✅ DEFINITION OF DONE (M4):



&#x20;   Das Dashboard zeigt immer die korrekten, aktuellen Daten aus dem State an (keine veralteten Caches).



&#x20;   Die Navigation funktioniert reibungslos, ohne dass der globale State verloren geht.



🔥 SMOKE TEST (M4):



&#x20;   \[x] Wechsel zwischen Finance App und Dashboard funktioniert ohne State-Verlust.



&#x20;   \[x] Klick auf ein gesperrtes Premium-Feature blockiert die Action und öffnet stattdessen das Paywall Modal.



&#x20;   \[x] Wenn eingebaut: Aufruf von api.login('test') gibt nach kurzem Delay ein Promise mit Tokens zurück.



💎 MILESTONE 5: MONETIZATION \& BACKEND PREP (The Bridge)



Ziel: Das System ist bereit für das erste Geld und die Anbindung an mächtige System-Schnittstellen (wie externe Daten-Logiken).



&#x20;   \[x] shared/core/api.js: Dummy-Funktionen oder Supabase-Connectoren für User-Profile Sync bauen.



&#x20;   \[x] Premium-Hooks (Paywalls) scharfschalten (Speed/Depth/Comfort).



&#x20;   \[ ] API-Schnittstellen für spätere AI-Analysen vorbereiten.



✅ DEFINITION OF DONE (M5):



&#x20;   Ein unautorisierter Klick auf ein Premium-Feature triggert zu 100 % den Paywall/Upgrade-Hook.



&#x20;   Fallback-Mechanismus steht: Wenn die API fehlschlägt, greift sofort der lokale localStorage-State.



🔥 SMOKE TEST (M5):



&#x20;   \[ ] System läuft im "Offline-Modus" oder bei API-Error fehlerfrei weiter (Fallback aktiv).



&#x20;   \[ ] Paywall öffnet sich sauber ohne Layout-Bruch.



&#x20;   \[ ] Keine Console Errors im gesamten Netzwerk-Flow.



🏁 ENDSTATE PHASE 0: Plattform statt Tool. Architektur versiegelt. Bereit für Skalierung und erste Nutzer.

