# MBRN Blueprint: Local Business Audit Assistant (MVP)
**Concept ID:** `MBRN-U-LBAA-01`
**Derived from:** `google-maps-lead-engine_review.md`

## 1. User Flow
1. **Input**: User manually enters a business name and website URL in the Hub dashboard.
2. **Analysis**: The Assistant runs a series of client-side checks (Performance, Mobile-Friendliness, Meta-Data availability).
3. **Manual Audit**: User goes through a checklist of visual improvements (e.g., "Is the phone number clickable?", "Are there reviews?").
4. **Generation**: System generates a PDF-ready audit summary and a personalized cold-pitch draft.
5. **Storage**: The audit is saved to `localStorage` or a local JSON file within the MBRN data layer.

## 2. MVP Screens
- **Dashboard Widget**: A compact card in the MBRN Hub for quick lead entry.
- **Audit View**: A split-screen layout:
    - *Left*: The business website (via `iframe` or manual link).
    - *Right*: The dynamic checklist and audit score calculator.
- **Export View**: Preview of the pitch text and a "Copy to Clipboard" button.

## 3. Data Model (Local-First)
```json
{
  "audit_id": "uuid-1234",
  "timestamp": "2026-04-28T01:00:00Z",
  "business": {
    "name": "Acme Plumbing",
    "url": "https://acmeplumbing.test"
  },
  "metrics": {
    "has_https": true,
    "has_responsive_meta": true,
    "has_og_tags": false,
    "manual_checklist_score": 75
  },
  "output": {
    "pitch_draft": "Hi Acme Plumbing, I noticed your site is missing...",
    "final_verdict": "Needs SEO optimization"
  }
}
```

## 4. Risk-Safe Boundaries
- **No Scraping**: The system does not automatedly crawl Google Maps. All data is user-provided.
- **No Auto-Outreach**: The system creates *drafts* only. The user must manually click "Send" in their own email client.
- **CORS Respect**: Automated checks are limited to what the browser allows (or via a simple MBRN-local proxy if available later).

## 5. Monetization Idea
- **Lead Gen Service**: Users can use this tool to build their own local SEO agency.
- **Report Selling**: Selling high-quality, professional PDF audits to local businesses for a flat fee.
- **Upsell**: Using the audit as a "foot-in-the-door" to sell full MBRN automation packages.

## 6. Integration Path into MBRN Hub
1. **Frontend**: Register a new component in `dashboard/cockpit_renderer.js`.
2. **Data Layer**: Use the existing `shared/core/storage` for persisting audits.
3. **Worker**: Optional Prime Director check to suggest auditing "integration_queue" candidates if they look like business tools.

## 7. Definition of Done
- [ ] User can add a business URL manually.
- [ ] Checklist calculates a score (0-100) based on manual inputs.
- [ ] Pitch text is generated dynamically using template strings.
- [ ] Data persists across browser refreshes (Vanilla JS + LocalStorage).
- [ ] ZERO external dependencies or API calls in the MVP phase.
