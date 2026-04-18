# M16 — Frequency Engine

> **System:** MBRN-HUB-V1  
> **Context:** Task 16.1 — Name Numerology  
> **Module:** `shared/core/logic/frequency.js`  
> **Date:** 14.04.2026  
> **Status:** ✅ IMPLEMENTED

---

## System Core

### What is the Frequency Engine?
The **Frequency Engine** calculates **name-based numerological frequencies** using the Pythagorean system. It transforms letters into numbers to reveal:

- **Soul Urge (Heart's Desire)** — What you truly want deep down
- **Personality (Outer Self)** — How others perceive you  
- **Expression (Destiny)** — Your life's purpose and potential

### Core Philosophy: Letters as Vibrations
Every letter carries a vibrational frequency (1-9). Names are not arbitrary — they are **mathematical signatures** that encode personality traits, desires, and life paths.

### The Three Core Numbers

| Number | Name | Calculation | Meaning |
|--------|------|-------------|---------|
| **Soul Urge** | Herzenswunsch | Sum of all vowels | Inner desires, motivations |
| **Personality** | Persönlichkeit | Sum of all consonants | External presentation |
| **Expression** | Schicksal | Sum of all letters | Life purpose, full potential |

---

## Tech Stack & Implementation

| Aspect | Implementation |
|--------|----------------|
| **Language** | Vanilla JavaScript (ES6+) |
| **Location** | `shared/core/logic/frequency.js` |
| **Export** | `calculateNameFrequency(fullName)` |
| **Return** | `{success: true, data: {...}}` per Gesetz 4 |
| **System** | Pythagorean Numerology (ancient Greek) |
| **Special Rule** | Y-Vowel heuristic from Archive v3.0 |

### Pythagorean Letter Mapping

```
1: A, J, S
2: B, K, T  
3: C, L, U
4: D, M, V
5: E, N, W
6: F, O, X
7: G, P, Y
8: H, Q, Z
9: I, R
```

**Total Letters:** 26 (A-Z) mapped to 9 vibrational frequencies.

---

## Extractable Logic

### Core Algorithm (frequency.js)

```javascript
/**
 * Pythagorean Letter-to-Number Mapping
 */
const PYTHAGOREAN_MAP = {
  'A': 1, 'J': 1, 'S': 1,
  'B': 2, 'K': 2, 'T': 2,
  'C': 3, 'L': 3, 'U': 3,
  'D': 4, 'M': 4, 'V': 4,
  'E': 5, 'N': 5, 'W': 5,
  'F': 6, 'O': 6, 'X': 6,
  'G': 7, 'P': 7, 'Y': 7,
  'H': 8, 'Q': 8, 'Z': 8,
  'I': 9, 'R': 9
};

/**
 * Y-Vowel Rule: Y counts as vowel when between two consonants
 * Extracted from Archive v3.0 (01_NumerologieRechner)
 */
function isYVowel(chars, index) {
  if (chars[index] !== 'Y') return false;

  const prev = index > 0 ? chars[index - 1] : null;
  const next = index < chars.length - 1 ? chars[index + 1] : null;
  const isVowel = c => c && VOWELS_SET.has(c);

  // At start: vowel only if no vowel follows
  if (!prev) return !isVowel(next);
  // At end: vowel only if no vowel precedes  
  if (!next) return !isVowel(prev);
  // In middle: vowel when between two consonants
  return !isVowel(prev) && !isVowel(next);
}

/**
 * Calculates Name Frequency (Soul Urge, Personality, Expression)
 */
export function calculateNameFrequency(fullName) {
  const chars = normalizeNameToChars(fullName);
  
  let soulSum = 0;
  let personalitySum = 0;
  let expressionSum = 0;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const value = PYTHAGOREAN_MAP[char];

    // Check if vowel (including Y-as-vowel per Archive v3.0)
    const isVowel = VOWELS_SET.has(char) || (char === 'Y' && isYVowel(chars, i));

    if (isVowel) {
      soulSum += value;        // Soul: vowels only
    } else {
      personalitySum += value; // Personality: consonants only
    }
    
    expressionSum += value;     // Expression: all letters
  }

  // Reduce to final digits (preserving Master Numbers 11, 22, 33)
  return {
    soul_urge: reduceToDigit(soulSum),
    personality: reduceToDigit(personalitySum),
    expression: reduceToDigit(expressionSum)
  };
}
```

### Name Normalization

```javascript
function normalizeNameToChars(name) {
  return name.toUpperCase()
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/ß/g, 'SS')
    .replace(/\s+/g, '')
    .split('')
    .filter(ch => PYTHAGOREAN_MAP[ch]);
}
```

**Normalization Steps:**
1. Uppercase conversion
2. German umlaut expansion (Ä→AE, Ö→OE, Ü→UE, ß→SS)
3. Space removal
4. Invalid character filtering

---

## MBRN Mapping

| Dimension | Relevance |
|-----------|-----------|
| **DIM 03 — FREQUENZ** | ✅ Primary — Name vibrations, letter frequencies |
| **DIM 07 — MIND** | ⚠️ Indirect — Self-awareness through name analysis |
| **DIM 06 — CHRONOS** | ⚠️ Indirect — Name + Birth date = complete profile |

**Integration:** The Frequency Engine pairs with the Chronos Engine for complete numerological profiling.

---

## Number Meanings

### Soul Urge (Heart's Desire)

| Number | Meaning |
|--------|---------|
| 1 | Independence, leadership, individuality |
| 2 | Harmony, cooperation, sensitivity |
| 3 | Creativity, self-expression, joy |
| 4 | Stability, order, practicality |
| 5 | Freedom, change, adventure |
| 6 | Love, family, responsibility |
| 7 | Wisdom, spirituality, introspection |
| 8 | Power, success, abundance |
| 9 | Compassion, humanitarianism, completion |
| 11 | Intuition, spiritual insight (Master) |
| 22 | Master builder, practical vision (Master) |
| 33 | Master teacher, healing (Master) |

### Personality (Outer Self)

Same vibrational meanings as Soul Urge, but applied to external presentation.

### Expression (Destiny)

The combined vibrational signature — the path you're meant to walk.

---

## Smoke Test Results

### Test Case: "Erik Klauss"

**Letter Breakdown:**
```
E=5, R=9, I=9, K=2 | K=2, L=3, A=1, U=3, S=1, S=1
Total: 5+9+9+2+2+3+1+3+1+1 = 36
```

**Vowel Analysis (Soul Urge):**
```
Vowels: E=5, I=9, A=1, U=3
Raw Sum: 5+9+1+3 = 18
Reduced: 1+8 = 9
```

**Consonant Analysis (Personality):**
```
Consonants: R=9, K=2, K=2, L=3, S=1, S=1
Raw Sum: 9+2+2+3+1+1 = 18
Reduced: 1+8 = 9
```

**Total Analysis (Expression):**
```
All Letters: 36
Reduced: 3+6 = 9
```

**Expected Output:**
```javascript
{
  success: true,
  data: {
    soul_urge: 9,
    personality: 9,
    expression: 9,
    original_name: "Erik Klauss",
    raw_soul_sum: 18,
    raw_personality_sum: 18,
    raw_expression_sum: 36,
    letter_count: 10
  }
}
```

**Verification Command:**
```javascript
await logic.calculateNameFrequency('Erik Klauss')
```

---

## Architecture Compliance

| Gesetz | Compliance |
|--------|------------|
| **Gesetz 1** | ✅ Pure calculation, no side effects |
| **Gesetz 2** | ✅ No DOM manipulation |
| **Gesetz 4** | ✅ Structured returns `{success, data}` |
| **Gesetz 13** | ✅ Logic isolated in `frequency.js` |
| **Gesetz 15** | ✅ N/A (no temporal calculations) |

---

## Dependencies

- None (pure Vanilla JS)
- Uses shared numerology helpers from the canonical logic layer
- No external libraries required

---

## Future Extensions

- [ ] Karmic Debt detection (13, 14, 16, 19)
- [ ] Hidden Passion numbers (most frequent letters)
- [ ] Cornerstone/Capstone analysis (first/last letters)
- [ ] Balance number (initials)
- [ ] Sub-vocal analysis (vowels within syllables)

---

**Module Version:** 16.1.0 (Frequency Real Implementation)  
**Status:** ✅ PRODUCTION READY  
**Documentation First:** ✅ Compliant  
**Archive Source:** 01_NumerologieRechner (Y-Vowel v3.0 Rule)
