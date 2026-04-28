# MBRN System Review: google-maps-lead-engine
**Source:** [esberdevop/google-maps-lead-engine](https://github.com/esberdevop/google-maps-lead-engine)
**Status:** Alpha Flood Discovery (Money Score: 100)

## 1. What it does
The `google-maps-lead-engine` is an all-in-one lead generation and sales automation platform. It automates the workflow of:
- **Discovery**: Scraping Google Maps for local businesses (plumbers, lawyers, etc.) based on location and niche.
- **Audit**: Automatically checking the discovered websites for SEO issues, mobile performance (PageSpeed), and missing metadata.
- **Sales Asset Generation**: Creating PDF "Pitch Reports" that highlight the business's weaknesses.
- **Outreach**: Managing automated email and WhatsApp drip sequences for cold outreach.

## 2. Why it is valuable for MBRN
This tool is a "Monetization Diamond." It represents a complete business model (Lead Gen Agency) that can be operated autonomously.
- **High Utility**: Directly solves the "How to get clients?" problem for freelancers and SMBs.
- **MBRN Fit**: Aligns with the v5.7 mandate to prioritize "Money-First" business tools.
- **Automation Potential**: Could be integrated into the Hub as an autonomous "Lead Hunter" worker.

## 3. Legal & Security Risks
> [!WARNING]
> **TOS Violations**: Scraping Google Maps without an official API key is against Google's Terms of Service and can lead to IP bans or legal action.
> **Compliance**: Cold outreach (Email/WhatsApp) must strictly follow GDPR (EU) and CAN-SPAM (US) regulations.
> **Dependency Risk**: Relies on external AI and Performance APIs which can incur significant costs if unmonitored.

## 4. Rebuild or Integrate?
**Decision: REBUILD (MBRN-Style)**
The original project likely uses a heavy Next.js/Full-stack framework. For MBRN's "local-first/vanilla" architecture, we should extract the core logic (Scraping + Auditing) and implement it as a lightweight MBRN Utility Engine.
- Avoids framework bloat.
- Ensures data stays local.
- Allows for native integration with the MBRN Prime Director.

## 5. Vanilla JS MVP Concept
A minimal implementation for the MBRN Hub:
```javascript
// Simple Lead Scout (Core Logic)
async function scoutLead(businessName, url) {
  const audit = {
    name: businessName,
    url: url,
    score: Math.floor(Math.random() * 100), // Simulated PageSpeed
    hasMeta: !!document.querySelector('meta[name="description"]'),
    status: 'Ready for Pitch'
  };
  return audit;
}

// Generate Pitch Template
function generatePitch(audit) {
  return `Hi ${audit.name}, your site scores ${audit.score}/100. We can fix that.`;
}
```

## 6. Final Verdict
**Verdict: BUILD**
> [!TIP]
> This is a high-priority "Money" tool. We should schedule the creation of a `mbrn-lead-hunter` module based on these concepts, focusing on local-first data storage and vanilla JS reporting.
