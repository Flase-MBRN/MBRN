# Phase D: Design System (D1-D2)

> **Status:** ✅ COMPLETE  
> **Tags:** #design #ui #medical-luxury #sternenhimmel #wtf-moment  
> **Files:** `theme.css`, `components.css`, `index.html`, `landing.css`

---

## Overview

The "WTF Moment" phase. The interface should not feel like a website from the 21st century, but from another era entirely.

**Core Question:** *"Fühlt sich das noch wie eine Website an — oder wie etwas aus einem anderen Zeitalter?"*

Answer: **"Anderes Zeitalter"** ✅

---

## The Sternenhimmel Principle

### Visual Metaphor
> "Sternenhimmel in einer beleuchteten Stadt. Guckt man kurz hin — sieht man fast nichts. Guckt man genauer — sieht man 2-3 Sterne."

### First Impression Test
Show the landing page to a stranger. If their first comment contains:
- ❌ "schön" → Redesign
- ✅ "weird" / "anders" / "WTF" → Success

---

## Color System

### CSS Variables (theme.css)
```css
:root {
  /* Sternenhimmel Background */
  --bg-primary: #05050A;      /* Fast black, not pure */
  --bg-surface: #0A0A0F;      /* Elevated surfaces */
  --bg-elevated: #0F0F15;     /* Cards, modals */
  
  /* Purple Accent */
  --accent: #7c3aed;          /* Deep purple */
  --accent-glow: rgba(124, 58, 237, 0.15);
  --accent-hover: rgba(124, 58, 237, 0.25);
  
  /* Text Hierarchy */
  --text-primary: #F5F5F5;      /* White, not glaring */
  --text-secondary: rgba(255, 255, 255, 0.5);
  --text-muted: rgba(255, 255, 255, 0.25);
  
  /* Borders */
  --border: rgba(255, 255, 255, 0.06);  /* Barely visible */
}
```

### Verboten (Forbidden)
| Color | Why |
|-------|-----|
| `#0d0d1a` | Navy — too generic |
| `#000000` | Pure black — too harsh |
| Bright gradients | Too AI-generic |
| Kitsch graphics | No data-viz only |

---

## Typography

### Font Stack
```css
--font-display: 'Syne', sans-serif;    /* Headlines */
--font-body: 'Inter', sans-serif;      /* Body text */
--font-mono: 'Space Mono', monospace;  /* Labels */
```

### Syne (Display)
- Weights: 400, 600, 700, 800
- Use: Hero headlines, single words
- Size: 80px+ for main headlines
- Effect: Bold, architectural, distant

### Inter (Body)
- Weights: 300, 400, 500, 600
- Use: All body text, descriptions
- Size: 14-16px standard
- Effect: Readable, neutral

### Space Mono (Labels)
- Use: Metrics, coordinates, technical labels
- Style: Uppercase + letter-spacing
- Effect: Precise, systematic

---

## Layout Principles

### Mut zur Leere (Courage for Emptiness)
- Lots of whitespace
- Few elements
- Each element placed with intent

### The Metrics Bar
```
3          0 KB        ∞
Tools Live Data Sent Access Forever
```
- Numbers large (Syne)
- Labels small (Space Mono)
- Subtle dividers

### Card System
```css
.tool-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
}
```

---

## D1: Landing Page (index.html)

### Hero Section
```html
<div class="hero-eyebrow">✦ THE BEHAVIOR SYSTEM</div>
<h1 class="hero-title">MBRN</h1>
<p class="hero-subtitle">
  Wir fragen nicht nach Zertifikaten. 
  Wir fragen nach Potenzial.
</p>
```

### The Antimatter Principle Section
```html
<div class="arch-eyebrow">✦ Das Antimaterie-Prinzip</div>
<h2>Die Welt fragt, was du hast. MBRN fragt, was du kannst.</h2>
```

### Tools Grid
- Finance (DIM 01 — KAPITAL)
- Numerology (DIM 03 — FREQUENZ)
- Dashboard (Command Center)

---

## D2: Component System

### Buttons

**Primary (CTA)**
```css
.btn-primary {
  background: #7c3aed;
  border-radius: 50px;       /* Pill shape */
  padding: 14px 28px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
}
```

**Secondary**
```css
.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}
```

### Inputs (Dark Mode)
```css
input, select, textarea {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border-radius: 8px;
}
```

### Cards
```css
.card {
  background: #0A0A0F;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}
```

---

## Gesetz 9: No Local CSS

### Strict Rule
> "Ausschließlich globale CSS-Variablen aus theme.css."

### Compliance
- ✅ No inline `<style>` blocks
- ✅ No `style="..."` attributes
- ✅ All colors via CSS variables
- ✅ All spacing via variables
- ✅ Typography via font variables

### File Structure
```
/shared/ui/
├── theme.css       # Variables (single source of truth)
├── components.css  # Global components
├── landing.css     # Page-specific (rare)
└── dom_utils.js    # Dynamic styling via classes
```

---

## Responsive Behavior

### Breakpoints
- **Mobile:** < 768px (single column)
- **Tablet:** 768px - 1024px (2 columns)
- **Desktop:** > 1024px (full layout)

### Mobile Optimizations
- Touch targets: 44px minimum
- Font scaling: 16px base (no zoom)
- Sidebar: collapsible
- Cards: full width

---

## The WTF Checklist

| Element | Test | Status |
|---------|------|--------|
| Background | Not pure black? | ✅ #05050A |
| Text | Not glaring white? | ✅ #F5F5F5 |
| Accent | Used sparingly? | ✅ Purple, minimal |
| Glow | Subtle, not disco? | ✅ 0.15 opacity |
| Space | Breathing room? | ✅ 120px+ padding |
| Typography | Syne headlines? | ✅ Yes |
| Mood | "Anderes Zeitalter"? | ✅ Yes |

---

## Related

- Philosophy: [[000_MBRN-CODEX]]
- Architecture: [[000_ARCHITECTURE]]
- Previous: [[Phase_3_The_Artifact]]
- Current Math: [[M14_Synergy_Engine]]

---

**Completed:** D2  
**Design Status:** ✅ STERNENHIMMEL
