// /shared/ui/dom/text_normalizer.js
// Global German text normalization for UI copy.

const MOJIBAKE_REPLACEMENTS = [
  [/Ã¤/g, 'ä'],
  [/Ã¶/g, 'ö'],
  [/Ã¼/g, 'ü'],
  [/Ã„/g, 'Ä'],
  [/Ã–/g, 'Ö'],
  [/Ãœ/g, 'Ü'],
  [/ÃŸ/g, 'ß'],
  [/â€”/g, '—'],
  [/â€“/g, '–'],
  [/â†’/g, '→'],
  [/âˆž/g, '∞']
];

const TRANSLITERATION_REPLACEMENTS = [
  [/\bBald verfuegbar\b/g, 'Bald verfügbar'],
  [/\bRegelmaessigkeit\b/g, 'Regelmäßigkeit'],
  [/\bwaechst\b/g, 'wächst'],
  [/\blaesst\b/g, 'lässt'],
  [/\bWaehle\b/g, 'Wähle'],
  [/\bUebersicht\b/g, 'Übersicht'],
  [/\bUeberspringen\b/g, 'Überspringen'],
  [/\bGeraet\b/g, 'Gerät'],
  [/\bnervoes\b/g, 'nervös'],
  [/\bfliesst\b/g, 'fließt'],
  [/\bFrueher\b/g, 'Früher'],
  [/\bSpaeter\b/g, 'Später'],
  [/\bNaechste\b/g, 'Nächste'],
  [/\bNaechster\b/g, 'Nächster'],
  [/\bNaechstes\b/g, 'Nächstes'],
  [/\bPruef\b/g, 'Prüf'],
  [/\bmoeglich\b/g, 'möglich'],
  [/\bVerstaendigung\b/g, 'Verständigung'],
  [/\bpersoenliche\b/g, 'persönliche'],
  [/\bSynchronitaet\b/g, 'Synchronität'],
  [/\bfuer\b/g, 'für'],
  [/\bFuer\b/g, 'Für'],
  [/\bueber\b/g, 'über'],
  [/\bUeber\b/g, 'Über']
];

export function normalizeGermanText(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return value;
  }

  let normalized = value;

  for (const [pattern, replacement] of MOJIBAKE_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  for (const [pattern, replacement] of TRANSLITERATION_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized;
}

