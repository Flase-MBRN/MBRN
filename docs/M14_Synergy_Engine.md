# M14 — Synergy Engine

> **Vault Path:** `/docs/M14_Synergy_Engine.md`  
> **Module:** `shared/core/modular_logic.js`  
> **Phase:** 14.1 (Task Complete)  
> **Status:** ✅ LIVE

---

## Purpose

The Synergy Engine calculates the resonance compatibility between two Operators (persons) based on their numerological core numbers.

Based on M-Theory: *Two perspectives on the same membrane fundament.*

---

## Mathematical Formula

```
Ssync = 100 - Σ(ΔVi × Wi)
```

Where:
- **Ssync**: Synergy Score (0-100)
- **ΔVi**: Difference Vectors (absolute differences)
- **Wi**: Weights for each dimension

---

## Input Parameters

Both operators must provide:

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `life_path` | number | 1-9, 11, 22, 33 | Mental/Life Path number |
| `expression` | number | 1-9, 11, 22, 33 | Operativ/Expression number |
| `soul` | number | 1-9, 11, 22, 33 | Emotional/Soul number |

---

## Calculation Steps

### 1. Master Number Reduction

For difference calculation, Master Numbers (11, 22, 33) are reduced to their base:

| Master | Reduction | Result |
|--------|-----------|--------|
| 11 | 1+1 | 2 |
| 22 | 2+2 | 4 |
| 33 | 3+3 | 6 |

**Function:** `reduceForDiff(value)`

### 2. Difference Vectors (ΔVi)

```javascript
mentalDiff = abs(reduceForDiff(A.life_path) - reduceForDiff(B.life_path))
emotionalDiff = abs(reduceForDiff(A.soul) - reduceForDiff(B.soul))
operativDiff = abs(reduceForDiff(A.expression) - reduceForDiff(B.expression))
```

### 3. Weight Application (Wi)

| Dimension | Weight (Wi) | Rationale |
|-----------|-------------|-----------|
| **Mental** (Life Path) | 2.5 | Highest impact on compatibility |
| **Operativ** (Expression) | 2.0 | Significant operational alignment |
| **Emotional** (Soul) | 1.5 | Emotional resonance factor |

### 4. Score Calculation

```javascript
baseScore = 100 - (
  (mentalDiff × 2.5) +
  (emotionalDiff × 1.5) +
  (operativDiff × 2.0)
)

synergy_score = max(0, min(100, baseScore))
```

**Capping:** Score is always clamped between 0 and 100.

---

## Output Analysis

### Resonance Zones (Low Difference = High Sync)

When difference ≤ 1 for a dimension:

| Dimension | Resonance Message |
|-----------|-------------------|
| Mental | "Hohe mentale Synchronität" |
| Emotional | "Hohe emotionale Resonanz" |
| Operativ | "Hohe operative Abstimmung" |

### Friction Points (High Difference = Conflict)

When difference ≥ 4 for a dimension:

| Dimension | Friction Message |
|-----------|------------------|
| Mental | "Mentale Dissonanz" |
| Emotional | "Emotionale Reibung" |
| Operativ | "Operative Konflikte" |

---

## Output Format (Gesetz 4)

```javascript
{
  success: true,
  data: {
    synergy_score: 78.5,        // number (0-100)
    mental_diff: 1,             // number
    emotional_diff: 0,            // number
    operativ_diff: 2,             // number
    resonance_zones: [            // string[]
      "Hohe mentale Synchronität",
      "Hohe emotionale Resonanz"
    ],
    friction_points: [],          // string[]
    operators: {
      a: { life_path, expression, soul },
      b: { life_path, expression, soul }
    }
    // Note: No timestamp — Math Engine is timeless
  }
}
```

---

## Example Calculation

**Operator A:** `{ life_path: 1, expression: 2, soul: 3 }`  
**Operator B:** `{ life_path: 1, expression: 2, soul: 3 }`

| Calculation | Value |
|-------------|-------|
| mentalDiff | 0 (1-1) |
| emotionalDiff | 0 (3-3) |
| operativDiff | 0 (2-2) |
| baseScore | 100 - 0 = 100 |
| **synergy_score** | **100** |
| resonance_zones | All 3 zones |
| friction_points | None |

**Result:** Perfect compatibility (100/100).

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Identical values | Diff = 0, full score |
| One Master Number | Reduced for calculation |
| Both Master Numbers | Reduced + potential bonus (Phase 2) |
| Score < 0 | Capped to 0 |
| Score > 100 | Capped to 100 |
| Missing fields | Validation error (Gesetz 4) |

---

## Code Location

```
/shared/core/modular_logic.js
├── isMasterNumber(value)          // Helper
├── reduceForDiff(value)             // Helper
├── diff(a, b)                       // Helper
└── calculateSynergy(A, B)           // Main function
```

---

## Compliance

- ✅ **Gesetz 1**: Pure calculation module
- ✅ **Gesetz 2**: Zero DOM manipulation
- ✅ **Gesetz 4**: Structured Returns
- ✅ **Gesetz 13**: Logic Isolation
- ✅ **Gesetz 15**: UTC comments (timestamp-free)

---

**Related:** [[M15_Cronos_Engine]] | [[000_ARCHITECTURE]] | [[000_plan]]
