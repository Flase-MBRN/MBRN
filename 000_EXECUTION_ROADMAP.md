# 🏛️ MBRN EXECUTION ROADMAP — PHASE 4

## Scope

- Target ticket: `D1`
- Target surface: root landing in [index.html](/C:/DevLab/MBRN-HUB-V1/index.html)
- Execution agent: `Kimi k2.5 (Windsurf)`
- Goal: replace current landing with a higher-contrast entry flow that proves MBRN live in the first session and pulls into `dashboard/`

## Repo Facts

- Current landing entry file: [index.html](/C:/DevLab/MBRN-HUB-V1/index.html)
- Current landing logic file: [shared/ui/render_landing.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/render_landing.js)
- Current DOM facade: [shared/ui/dom_utils.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/dom_utils.js)
- Current DOM methods available through facade:
  - `dom.setText`
  - `dom.clear`
  - `dom.createEl`
  - `dom.toggleClass`
  - `animateValue`
  - `showTerminalLoader`
  - `createGlowRing`
  - `bindSmartDateInput`
- Canonical numerology entrypoint: [shared/core/logic/numerology/index.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/numerology/index.js)
- Canonical numerology function: `calculateFullProfile(name, dateStr)`
- Canonical unified profile entrypoint: [shared/core/logic/orchestrator.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/orchestrator.js)
- Canonical chronos engine: [shared/core/logic/chronos_v2.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/chronos_v2.js)
- Current numerology app UI file: [apps/numerology/render.js](/C:/DevLab/MBRN-HUB-V1/apps/numerology/render.js)

## Import Rules

- Valid landing imports:
  - `import { calculateFullProfile } from './shared/core/logic/numerology/index.js';`
  - `import { dom, animateValue, createGlowRing, bindSmartDateInput } from './shared/ui/dom_utils.js';`
  - `import { nav } from './shared/ui/navigation.js';`
  - `import { storage } from './shared/core/storage.js';`
- Invalid import:
  - `./apps/numerology/logic.js`
  - Reason: file does not exist in the current repo

## Iron Laws

- `NO-BUILD`
  - no npm runtime dependency
  - no bundler
  - no transpiler
  - all imports with `.js`
- `INLINE-FIRST`
  - root landing styles live in one `<style>` block inside [index.html](/C:/DevLab/MBRN-HUB-V1/index.html)
  - remove local stylesheet links to:
    - `shared/ui/theme.css`
    - `shared/ui/components.css`
    - `shared/ui/landing.css`
- `DOM-SAFETY`
  - all DOM writes and dynamic element creation must go through [shared/ui/dom_utils.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/dom_utils.js)
  - no `innerHTML`
  - no direct text assignment outside `dom.setText` / `dom.createEl`
- `FILE-RESPONSIBILITY`
  - visual structure and inline CSS in [index.html](/C:/DevLab/MBRN-HUB-V1/index.html)
  - landing behavior in [shared/ui/render_landing.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/render_landing.js)
  - do not move numerology logic out of `shared/core/logic/numerology/`
- `ROUTING`
  - keep [shared/ui/navigation.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/navigation.js) unchanged
  - no `<base href>`

## Visual Tokens

### Required CSS Variables

```css
:root {
  --void: #05050A;
  --surface: #0A0A0F;
  --glass: rgba(255, 255, 255, 0.03);
  --border: rgba(255, 255, 255, 0.06);
  --border-md: rgba(255, 255, 255, 0.12);
  --star: #7B5CF5;
  --star-glow: rgba(123, 92, 245, 0.15);
  --star-dim: rgba(123, 92, 245, 0.06);
  --text-1: #F5F5F5;
  --text-2: rgba(255, 255, 255, 0.55);
  --text-3: rgba(255, 255, 255, 0.25);
}
```

### Typography Rules

- Hero word `MBRN`: `Syne`, weight `800`
- Hero size: `clamp(100px, 20vw, 180px)` allowed range
- Hero width occupation target: `60%` to `80%` of viewport width
- Body copy: `Inter`
- Labels / meta copy: `Space Mono`

## Data Flow

### D1 Teaser Flow

1. User enters `name` and `date` in root landing form
2. Date input is handled as `TT.MM.JJJJ`
3. Landing calls:
   - `calculateFullProfile(name, dateStr)`
4. Engine returns:
   - `result.success`
   - `result.data.core.lifePath`
   - `result.data.core.soulUrge`
   - `result.data.core.personality`
   - `result.data.core.expression`
5. Landing derives primary values from formatted strings:
   - `4`
   - `2/11`
   - `6/33`
   - rule: split on `/`, use first token for teaser number rendering
6. Landing maps primary values to short teaser descriptions in UI layer
7. Landing stores session bridge payload through `storage.set('last_numerology_calc', ...)`
8. Reveal block becomes visible without page reload
9. CTA routes to `./dashboard/`

### Required Storage Shape

```js
{
  name,
  birthDate,
  lifePath,
  calculatedAt: new Date().toISOString()
}
```

## Sprint 1 — Visual Identity / Hero

### Objective

- replace current quiet landing with a dominant hero and minimal chrome

### Files

- [index.html](/C:/DevLab/MBRN-HUB-V1/index.html)

### Actions

- remove local CSS `<link rel="stylesheet">` tags from root landing
- keep Google Fonts imports
- add one inline `<style>` block in `<head>`
- rebuild root markup in this order:
  1. minimal top nav
  2. hero section
  3. teaser section shell
  4. dimensions strip/grid
  5. support block
  6. footer
- keep one module script tag for [shared/ui/render_landing.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/render_landing.js)
- use `#05050A` as base background
- use `#7B5CF5` only for accents, not for large fills
- set `MBRN` hero word as the first visual object in the viewport

### Layout Spec

- nav height: compact, no sidebar
- hero min-height: `80vh`
- hero alignment: left or center-left
- hero subtitle: `built to be used`
- subtitle style:
  - `Space Mono`
  - uppercase
  - high letter spacing
  - low contrast
- no large explanatory paragraph above the teaser

### DoD

- `MBRN` hero occupies `60%` to `80%` viewport width on desktop
- hero fills at least `80vh`
- root landing contains exactly one inline `<style>` block for landing styles
- no remaining root stylesheet imports to `theme.css`, `components.css`, `landing.css`
- page is readable on mobile width `390px`

### Verification

- open root landing
- confirm hero is visible without scroll
- confirm no white background on inputs
- confirm no broken CSS dependencies after stylesheet removal

## Sprint 2 — Interactive Teaser / Numerology

### Objective

- replace the current pseudo-analysis with real numerology output from the existing engine

### Files

- [index.html](/C:/DevLab/MBRN-HUB-V1/index.html)
- [shared/ui/render_landing.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/render_landing.js)

### Actions

- remove local `calculateLifePath()` duplication from [shared/ui/render_landing.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/render_landing.js)
- import canonical numerology logic:

```js
import { calculateFullProfile } from '../core/logic/numerology/index.js';
import { dom, animateValue, createGlowRing, bindSmartDateInput } from './dom_utils.js';
import { nav } from './navigation.js';
import { storage } from '../core/storage.js';
```

- convert date field from `type="date"` to text input if needed for `TT.MM.JJJJ`
- bind date mask with `bindSmartDateInput`
- on submit:
  - validate `name`
  - validate `date`
  - call `calculateFullProfile(name, dateStr)`
  - stop on `success: false`
- reveal these teaser outputs:
  - `lifePath`
  - `lifePath` description
  - `soulUrge`
  - `soulUrge` description
- build the teaser result through `dom_utils`
- use `animateValue` and `createGlowRing` only if they improve the reveal without slowing the interaction
- persist bridge state with `storage.set('last_numerology_calc', ...)`

### Mapping Rules

- engine output source:
  - `result.data.core.lifePath`
  - `result.data.core.soulUrge`
- teaser display value:
  - primary token before `/`
- teaser descriptions:
  - maintain a local dictionary in [shared/ui/render_landing.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/render_landing.js)
  - do not add interpretation logic inside core numerology modules

### DOM Rules

- `dom.setText` for text nodes
- `dom.clear` before rerendering result area
- `dom.createEl` for dynamic result rows and CTA
- `dom.toggleClass` for reveal state classes
- no `innerHTML`

### DoD

- user enters name and date
- numerology result appears without page reload
- invalid input does not navigate away
- result rendering uses canonical numerology engine, not local duplicate math
- `last_numerology_calc` is written through storage wrapper

### Verification

- enter valid `TT.MM.JJJJ`
- click CTA
- confirm result block appears in place
- confirm browser URL does not change
- confirm refresh keeps last calculation bridge payload available

## Sprint 3 — Conversion / Dashboard-Sog

### Objective

- turn the reveal into a controlled pull toward the dashboard and the wider ecosystem

### Files

- [index.html](/C:/DevLab/MBRN-HUB-V1/index.html)
- [shared/ui/render_landing.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/render_landing.js)

### Actions

- replace generic skip behavior with clearer funnel states:
  - hero CTA
  - teaser CTA
  - result CTA
- keep direct dashboard bridge
- add a dimensions block with these visible states:
  - `01 Kapital` live
  - `03 Frequenz` live
  - `05 Bindung` soon
  - `06 Chronos` soon
  - `11 ∞` open
- live cards:
  - clickable
  - accent border only
- soon/open cards:
  - reduced opacity
  - no click handler
- add one support block with neutral copy and Ko-fi link
- keep footer minimal

### Conversion Logic

- result CTA target: `./dashboard/`
- nav dashboard target: `./dashboard/`
- use `nav.bindNavigation()` only where route hooks are needed
- do not inject auth friction into D1 flow
- do not move user into `apps/numerology/` before the reveal

### DoD

- result state exposes one clear next action into dashboard
- dashboard CTA is visible immediately after teaser success
- live dimension cards are visually distinct from soon/open cards
- support block exists but does not dominate the page

### Verification

- complete teaser flow
- click dashboard CTA
- confirm dashboard route opens correctly
- confirm live cards navigate and soon cards do not

## Non-Negotiable Corrections To Briefing

- do not import `./apps/numerology/logic.js`
- do not invent `calculateNumerologyProfile`
- use `calculateFullProfile(name, dateStr)` from [shared/core/logic/numerology/index.js](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/numerology/index.js)
- do not move business logic into [index.html](/C:/DevLab/MBRN-HUB-V1/index.html)
- do not touch:
  - [shared/core/logic/numerology/](/C:/DevLab/MBRN-HUB-V1/shared/core/logic/numerology/index.js)
  - [apps/numerology/render.js](/C:/DevLab/MBRN-HUB-V1/apps/numerology/render.js)
  - [shared/ui/navigation.js](/C:/DevLab/MBRN-HUB-V1/shared/ui/navigation.js)

## Final Acceptance Gate

- root landing uses inline landing CSS only
- landing JS stays no-build ES module
- canonical numerology engine is used
- reveal works without reload
- dashboard pull is explicit
- no console errors in landing flow
- no broken route behavior on localhost or GitHub Pages

## Execution Order

1. Sprint 1
2. Sprint 2
3. Sprint 3
4. manual smoke on desktop
5. manual smoke on mobile width
6. commit only after all three DoD blocks pass
