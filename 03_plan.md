🎯 **MBRN-HUB-V1: PHASE 3.0 (Scale & Monetization)**

   **System-Architect Directive:** Wir transformieren das System in eine Cashflow-Engine, ohne die „Flase“-Identität oder die „Iron Laws“ zu verletzen. Der Fokus liegt auf kühler Professionalität, monolithischem Design und nahtloser Payment-Integration. Eine Phase = Ein konkreter Task, max. 50-100 LOC oder 1-3 Files.

---

### 🛠️ SYSTEM-ARCHITECT "GOTCHAS" (Phase 3.0 Edition)

**1. Die „No-Server“ Payment Falle**
Wir nutzen Stripe Checkout, um die Kreditkartendaten und die PCI-Compliance komplett auszulagern.
   * **Lösung:** Der Client triggert nur eine Session-URL; die Bestätigung erfolgt asynchron via Webhook direkt in Supabase.

**2. PDF-Leistungshunger**
Große PDF-Generierung kann den Browser einfrieren.
   * **Lösung:** Wir nutzen `jspdf` in einem asynchronen Flow, um die „Deep Analysis“ Artefakte zu rendern, während ein Loader den Status anzeigt.

**3. Asset-Isolation (Glow & Design)**
Subtile Glow-Effekte können bei falscher Nutzung die FPS auf Mobile drücken.
   * **Lösung:** Nutzung von CSS Hardware-Acceleration (`transform: translateZ(0)`) für alle violetten Glow-Elemente.

---

### 💎 MILESTONE 10: THE VOID AESTHETIC (Visual Sovereignty)

**Ziel:** Das UI auf das finale „Flase“-Niveau heben. Deep-Purple Glow und Anthrazit-Dominanz.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **17.1** | `theme.css` Update — Implementierung der Deep-Purple Variablen & Glow-Klassen | `theme.css` | ✅ Done |
| **17.2** | Glassmorphism Refactor — Modals & Cards auf semi-transparente Dark-Optik umstellen | `components.css` | ✅ Done |
| **17.3** | Identity Finalization — Austausch aller Platzhalter durch das neutrale „Flase“ Logo | `index.html`, Assets | ✅ Done |
| **17.4** | **SMOKE TEST M10** — Visuelle Prüfung: Wirkt der Raum tief und unendlich? | — | ✅ Done |

**Gotcha-Check:**
* [x] Keine grellen Farben, nur dezenter Glow?
* [x] Performance-Check auf Mobile (Scroll-Flüssigkeit)?

---

### 🔐 MILESTONE 11: THE VAULT (Stripe Integration)

**Ziel:** Bezahlvorgang via Stripe Checkout implementieren und Level-Up automatisieren.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **18.1** | Stripe SDK Integration via ESM-CDN in den API-Layer | `api.js` | ✅ Done |
| **18.2** | `actions.startCheckout()` — Erstellung der Payment-Session Trigger | `actions.js` | ✅ Done |
| **18.3** | Supabase Edge Function — Webhook Handler für `checkout.session.completed` | `supabase/functions` | ✅ Done |
| **18.4** | **SMOKE TEST M11** — Testkauf im Stripe-Simulator schaltet Level 10 frei | — | ✅ Done |

**Gotcha-Check:**
* [x] RLS-Policies verhindern manuelles Level-Up durch den User?
* [x] Stripe-Anon-Key sicher in der Config hinterlegt?

---

### 📄 MILESTONE 12: THE ARTIFACT (PDF Deep Decode)

**Ziel:** Generierung des 10-seitigen Analyse-Reports für PAID_PRO User.

| Sub-Phase | Task | Files | Aufwand |
|-----------|------|-------|---------|
| **19.1** | `jspdf` Integration & PDF-Grundgerüst (Header/Footer im MBRN-Style) | `logic.js` (Num) | ✅ Done |
| **19.2** | Content-Mapper — Numerologische 36-Punkte Analyse in PDF-Text transformieren | `logic.js` | ✅ Done |
| **19.3** | Access-Gate — Download-Button nur für `access_level >= 10` anzeigen | `render.js` (Num) | ✅ Done |
| **19.4** | **SMOKE TEST M12** — Download generiert valides, 10-seitiges Artefakt | — | ✅ Done |

**Gotcha-Check:**
* [x] PDF-Design ist minimalistisch und kühl (Flase-Stil)?
* [x] Download funktioniert auch bei instabiler Verbindung (Client-side)?

---

### 📋 ZUSAMMENFASSUNG PHASE 3.0

| Milestone | Phasen | Status |
|-----------|--------|--------|
| **M10: Void Aesthetic** | 17.1–17.4 | ✅ Complete |
| **M11: The Vault** | 18.1–18.4 | ✅ Complete |
| **M12: The Artifact** | 19.1–19.4 | ✅ Complete |

**Gesamt:** 12 Phasen, Fokus auf Monetarisierung und High-End Output.

**Wichtigste Erfolgsfaktoren:**
* ✅ Nahtloser Übergang von Gratis-Content zu Paid-Artifacts
* ✅ Einhaltung der visuellen „Flase“-Anonymität im gesamten Payment-Prozess
* ✅ Skalierbarkeit durch Serverless Webhooks

---

### 🚀 NÄCHSTER SCHRITT

**Soll mit Phase 17.1 gestartet werden (Visual Deep-Purple Update)?**