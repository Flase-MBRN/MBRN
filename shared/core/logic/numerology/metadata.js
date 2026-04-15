/**
 * /shared/core/logic/numerology/metadata.js
 * NUMEROLOGY METADATA — Interpretations & Matrices
 * 
 * Responsibility: All interpretation data, descriptions, and matrices
 */

/* ─── OPERATOR CONFIG ──────────────────────────────────────────────────── */

export const OPERATOR_CONFIG = {
  colors: {
    bgPrimary: [10, 10, 10],
    bgSecondary: [28, 28, 30],
    textPrimary: [255, 255, 255],
    textSecondary: [192, 192, 192],
    textMuted: [100, 100, 100],
    accent: [123, 92, 245],
    border: [60, 60, 65]
  },
  typography: {
    sizes: { hero: 48, title: 24, subtitle: 14, body: 11, micro: 9, value: 32 }
  }
};

/* ─── OPERATOR MATRIX ─────────────────────────────────────────────────── */

export const OPERATOR_MATRIX = {
  lifePath: {
    1: { title: 'Autonomie-Treiber', essence: 'Natürliche Führungskraft. Unabhängige Entscheidungsfindung.', strength: 'Eigenständige Ausrichtung ohne externe Validierung.', focus: 'Geduld in Kollaborationen entwickeln.' },
    2: { title: 'Synergie-Optimierer', essence: 'Harmonisierung von Beziehungen und Systemen.', strength: 'Intuitive Erfassung gruppen-dynamischer Signale.', focus: 'Grenzen setzen ohne Konfliktvermeidung.' },
    3: { title: 'Expression-Verstärker', essence: 'Transformation von Konzepten in emotionale Resonanz.', strength: 'Hohe Überzeugungskraft durch authentischen Ausdruck.', focus: 'Fokussierung der Energie auf wenige Projekte.' },
    4: { title: 'Struktur-Architekt', essence: 'Konstruktion belastbarer Langzeit-Systeme.', strength: 'Methodische Präzision und operationale Beständigkeit.', focus: 'Flexibilität innerhalb stabiler Rahmen.' },
    5: { title: 'Adaptions-Spezialist', essence: 'Navigierung durch komplexe Wandlungsprozesse.', strength: 'Schnelle Anpassung an neue Rahmenbedingungen.', focus: 'Tiefe halten trotz Bewegungsdrang.' },
    6: { title: 'Harmonie-Stabilisator', essence: 'Schaffung geschützter Entwicklungsräume.', strength: 'Natürliche Verantwortungsübernahme für das Kollektiv.', focus: 'Eigenfürsorge vor Fremdlast.' },
    7: { title: 'Tiefen-Analytiker', essence: 'Dekodierung komplexer System-Muster.', strength: 'Präzise Mustererkennung jenseits der Oberfläche.', focus: 'Transfer von Erkenntnis in Handlung.' },
    8: { title: 'Manifestations-Realisierer', essence: 'Skalierung von Vision in materielle Resultate.', strength: 'Verständnis für Macht-Strukturen und Effizienz.', focus: 'Integrität als Fundament von Erfolg.' },
    9: { title: 'Vollendungs-Integrator', essence: 'Abschluss komplexer Zyklen zur Neuausrichtung.', strength: 'Ganzheitliche Sichtweise und Weisheits-Transfer.', focus: 'Pragmatische Umsetzung trotz Idealismus.' },
    11: { title: 'Intuitiver Wegweiser', essence: 'Antenne für transzendente Wahrheiten.', strength: 'Direkter Zugriff auf unbewusstes Wissen.', focus: 'Bodenhaftung trotz hoher Sensitivität.' },
    22: { title: 'Visionärer Baumeister', essence: 'Transformation kollektiver Träume in Realität.', strength: 'Enormes Potential für systemische Konstruktion.', focus: 'Aktivierung der eigenen Größe.' }
  },

  harmony: {
    excellent: { label: 'Optimale Abstimmung', desc: 'Konfiguration synchronisiert. Entscheidungen fließen natürlich.', note: 'Wachstum entsteht durch gezielte Reibung.' },
    good: { label: 'Aktive Integration', desc: 'Spannungsfelder als Entwicklungstreiber erkannt.', note: 'Fokus auf Abgleich von Intuition und Logik.' },
    low: { label: 'Konfigurations-Konflikt', desc: 'Energieverlust durch innere Diskrepanzen.', note: 'Priorität: Primären Konflikt identifizieren.' }
  },

  grid: {
    mental: { active: 'Strukturierte Analyse als Standard-Modus.', potential: 'Intuitiver Zugriff auf Gesamtzusammenhänge.' },
    emotional: { active: 'Hohe Sensitivität für Umgebungs-Signale.', potential: 'Rationale Distanz für klare Entscheidungen.' },
    physical: { active: 'Pragmatische Umsetzung in Resultate.', potential: 'Konzeptuelle Freiheit jenseits physischer Grenzen.' }
  },

  pinnacles: {
    1: { title: 'Autonomie', desc: 'Fokus auf Identitäts-Sicherung und eigenständige Kraft.' },
    2: { title: 'Synergie', desc: 'Fokus auf strategische Bündnisse und Zusammenarbeit.' },
    3: { title: 'Präsenz', desc: 'Fokus auf Sichtbarkeit und authentischen Ausdruck.' },
    4: { title: 'Stabilität', desc: 'Fokus auf Fundament und langfristige Strukturen.' },
    5: { title: 'Expansion', desc: 'Fokus auf Wandel und System-Neuausrichtung.' },
    6: { title: 'Gleichgewicht', desc: 'Fokus auf Verantwortungsübernahme im System.' },
    7: { title: 'Essenz', desc: 'Fokus auf tiefe Wahrheit und Muster-Dekodierung.' },
    8: { title: 'Dominanz', desc: 'Fokus auf materiellen Erfolg und Autorität.' },
    9: { title: 'Vollendung', desc: 'Fokus auf Abschluss und Übergang.' },
    11: { title: 'Illumination', desc: 'Fokus auf intuitive Führung und Wegweisung.' },
    22: { title: 'Manifestation', desc: 'Fokus auf kollektive Schöpfung und Legacy.' }
  },

  cycles: {
    early: {
      1: { theme: 'Autonomie', task: 'Etablierung der eigenen Stimme.' },
      2: { theme: 'Synergie', task: 'Entwicklung von Empathie und Zusammenarbeit.' },
      3: { theme: 'Expression', task: 'Experimentieren mit authentischem Ausdruck.' },
      4: { theme: 'Fundament', task: 'Aufbau erster stabiler Strukturen.' },
      5: { theme: 'Adaptation', task: 'Sammeln vielfältiger Erfahrungen.' },
      6: { theme: 'Stabilität', task: 'Übernahme von Verantwortung.' },
      7: { theme: 'Analyse', task: 'Hinterfragen der Standard-Antworten.' },
      8: { theme: 'Wirkung', task: 'Training im Umgang mit Einfluss.' },
      9: { theme: 'Vollendung', task: 'Lernen des Loslassens.' },
      11: { theme: 'Intuition', task: 'Training der inneren Antenne.' },
      22: { theme: 'Vision', task: 'Vorbereitung großer Konstruktionen.' }
    },
    middle: {
      1: { theme: 'Unabhängigkeit', task: 'Beweis autarker Kraft.' },
      2: { theme: 'Partnerschaft', task: 'Tiefe Integration in Beziehungen.' },
      3: { theme: 'Impact', task: 'Maximale Sichtbarkeit.' },
      4: { theme: 'Struktur', task: 'Langfristige Sicherung.' },
      5: { theme: 'Transformation', task: 'Radikale Identitäts-Updates.' },
      6: { theme: 'Ordnung', task: 'Position als tragende Säule.' },
      7: { theme: 'Tiefe', task: 'Entwicklung intellektueller Essenz.' },
      8: { theme: 'Effizienz', task: 'Erreichung messbarer Ziele.' },
      9: { theme: 'Universalität', task: 'Kollektive Ziele jenseits des Selbst.' },
      11: { theme: 'Illumination', task: 'Wirkung als Wegweiser.' },
      22: { theme: 'Manifestation', task: 'Schöpfung von Monumenten.' }
    },
    late: {
      1: { theme: 'Souveränität', task: 'Bestimmung des eigenen Rhythmus.' },
      2: { theme: 'Weisheit', task: 'Transfer von Erfahrung.' },
      3: { theme: 'Präsenz', task: 'Erhaltung der Ausdruckskraft.' },
      4: { theme: 'Ernte', task: 'Nutzen der gebauten Strukturen.' },
      5: { theme: 'Freiheit', task: 'Nutzung der Unabhängigkeit.' },
      6: { theme: 'Harmonie', task: 'Ordnende Instanz durch Präsenz.' },
      7: { theme: 'Stille', task: 'Klarheit durch Loslösung.' },
      8: { theme: 'Legacy', task: 'Absicherung der Wirkung.' },
      9: { theme: 'Vollendung', task: 'Abschluss und Übergang.' },
      11: { theme: 'Klarheit', task: 'Visionäre Distanz.' },
      22: { theme: 'Legacy-Bau', task: 'Absicherung systemischer Werke.' }
    }
  },

  challenges: {
    0: { desc: 'Keine primäre Spannung. Risiko: Selbstzufriedenheit.' },
    1: { desc: 'Entwicklung autarker Entscheidungskraft ohne externe Validierung.' },
    2: { desc: 'Setzen klarer Grenzen bei gleichzeitiger Empathie.' },
    3: { desc: 'Fokussierung der Energie auf wenige Kernprojekte.' },
    4: { desc: 'Flexibilität innerhalb stabiler Strukturen.' },
    5: { desc: 'Halten der Tiefe trotz Bewegungsdrang.' },
    6: { desc: 'Eigenfürsorge vor Fremdlast priorisieren.' },
    7: { desc: 'Transfer von Analyse in konkrete Handlung.' },
    8: { desc: 'Integrität als Fundament materiellen Erfolgs.' },
    9: { desc: 'Pragmatische Umsetzung trotz Idealismus.' }
  },

  karmic: {
    1: { lesson: 'Souveränität', desc: 'Entwicklung von Führung ohne Bestätigungsbedarf.' },
    2: { lesson: 'Synergie', desc: 'Empathie als operativer Vorteil etablieren.' },
    3: { lesson: 'Klarheit', desc: 'Zerstreuung in fokussierten Ausdruck wandeln.' },
    4: { lesson: 'Disziplin', desc: 'Struktur als Voraussetzung für Freiheit nutzen.' },
    5: { lesson: 'Tiefe', desc: 'Flucht-Reflexe in haltbare Präsenz transformieren.' },
    6: { lesson: 'Harmonie', desc: 'Verantwortung ohne Selbstaufgabe tragen.' },
    7: { lesson: 'Wahrheit', desc: 'Stille zur Dekodierung der Realität nutzen.' },
    8: { lesson: 'Integrität', desc: 'Erfolg durch faire Kraft statt Dominanz.' },
    9: { lesson: 'Vollendung', desc: 'Radikaler Abschluss zur Raumschaffung.' }
  },

  getStrategy(lp) {
    const strategies = {
      1: 'Übernimm Initiative. Warte nicht auf externe Validierung.',
      2: 'Setze klare Grenzen. Nutze Empathie strategisch.',
      3: 'Fokussiere auf EINE Idee bis zum Resultat.',
      4: 'Baue stabile Rahmen, bleibe darin flexibel.',
      5: 'Nutze Wandel als Beschleuniger, nicht als Flucht.',
      6: 'Stabilisiere dich selbst, dann das Umfeld.',
      7: 'Wandle Erkenntnis in messbare Taten um.',
      8: 'Skaliere durch Integrität, nicht durch Macht.',
      9: 'Denke kollektiv. Deine Wirkung braucht Maßstab.',
      11: 'Vertraue deiner Intuition über jede Logik. Zweifle nicht.',
      22: 'Baue das Unmögliche jetzt. Nimm heute den ersten Stein.'
    };
    return strategies[lp] || 'Handle konsequent nach deiner Konfiguration.';
  }
};

/* ─── DEEP DECODE MATRIX ──────────────────────────────────────────────── */

export const DEEP_DECODE_MATRIX = {
  lifePath: {
    1: { title: 'DER PIONIER', essence: 'Bauplan: Führung und Neuanfang. Autarke Ausführung.', strengths: 'Hohe Eigenständigkeit. Kein Bedarf an externer Validierung. Starker Wille.', challenges: 'Fehlende Geduld. Isolation führt zum System-Stillstand.', purpose: 'Demonstration individueller Willenskraft als primärer Impuls.' },
    2: { title: 'DER VERBINDER', essence: 'Bauplan: Harmonie und Bündnis-Optimierung.', strengths: 'Hohe Empathie. Signal-Detektion für Bedürfnisse. Synergie-Talent.', challenges: 'Selbstaufgabe zur Konfliktvermeidung. Druck-Ansammlung durch unterdrückte Bedürfnisse.', purpose: 'Stabilisierung von Gruppen-Entitäten durch integrierte Harmonie.' },
    3: { title: 'DER ALCHIMIST', essence: 'Bauplan: Wirkung durch Ausdruck. Signal-Verstärkung.', strengths: 'Hohe Überzeugungskraft. Transformation von Ideen in Begeisterung. Kreativer Impuls.', challenges: 'Energie-Verlust durch Zerstreuung. Hohe Anzahl unvollendeter Projekte.', purpose: 'Injektion von Inspiration in das gesellschaftliche System.' },
    4: { title: 'DER ARCHITEKT', essence: 'Bauplan: Struktur und Fundament-Sicherung.', strengths: 'Methodische Präzision. Aufbau langfristiger Systeme. Hohe Beständigkeit.', challenges: 'System-Erstarrung durch Kontrollzwang. Angst vor unvorhersehbaren Variablen.', purpose: 'Konstruktion belastbarer Rahmenbedingungen für Visionen.' },
    5: { title: 'DER FREIHEITSSUCHER', essence: 'Bauplan: Adaption und Wandel. System-Flexibilität.', strengths: 'Hohe Anpassungsrate. Schnelle Lösung von Blockaden. Neugier-Antrieb.', challenges: 'Flucht vor System-Tiefe. Unberechenbarkeit führt zu Bindungsverlust.', purpose: 'Demonstration von Sicherheit durch dynamische Bewegung.' },
    6: { title: 'DER MONITOR', essence: 'Bauplan: Stabilisierung und System-Fürsorge.', strengths: 'Hohe soziale Verantwortung. Potential-Erkennung. Stabilisierendes Feld.', challenges: 'Ressourcen-Erschöpfung durch Fremdlast-Übernahme. Helfer-Syndrom.', purpose: 'Schaffung geschützter Räume für optimale Entwicklung.' },
    7: { title: 'DER ANALYTIKER', essence: 'Bauplan: Dekodierung der System-Essenz.', strengths: 'Präziser Verstand. Muster-Erkennung jenseits der Oberfläche. Tiefen-Analyse.', challenges: 'Isolation im analytischen Raum. Realitäts-Verlust durch Handlungs-Lähmung.', purpose: 'Bereitstellung von Klarheit als Voraussetzung für Freiheit.' },
    8: { title: 'DER REALISIERER', essence: 'Bauplan: Manifestation und Skalierung.', strengths: 'Verständnis für Macht-Strukturen. Fokus auf messbare Resultate. Autoritäts-Aspekt.', challenges: 'Identifikation über materielle Werte. Macht-Missbrauch als Default-Risiko.', purpose: 'Beweisführung stabiler Dominanz durch Integrität.' },
    9: { title: 'DER VOLLENDETER', essence: 'Bauplan: Abschluss und Universal-Abgleich.', strengths: 'Ganzheitliche Sichtweise. Abschluss-Fähigkeit für komplexe Zyklen. Weisheits-Transfer.', challenges: 'Idealismus-Überhang. Vernachlässigung notwendiger physischer Schritte.', purpose: 'Vollendung von Kreisläufen zur Einleitung neuer System-Iterationen.' },
    11: { title: 'DER INSPIRATOR', essence: 'Meister-Signal: Antenne für systemische Wahrheit.', strengths: 'Intuitiver Direkt-Zugriff. Wirkung allein durch Präsenz. Hohe Resonanz.', challenges: 'Reiz-Überflutung durch extreme Sensitivität. Neigung zur Realitäts-Flucht.', purpose: 'Übertragung von Impulsen aus dem unbewussten Raum.' },
    22: { title: 'DER WELTENBAUMEISTER', essence: 'Meister-Signal: Transformation von Vision in Materie.', strengths: 'Enormes Bau-Potential. Skalierung von Träumen in Stein. Schöpferische Dominanz.', challenges: 'Lähmung durch Potential-Druck. Unterdrückung der eigenen Größe.', purpose: 'Konstruktion von Strukturen zur Sicherung der kollektiven Zukunft.' }
  },

  harmony: {
    excellent: { title: 'OPTIMALE HARMONIE', desc: 'Dein Bauplan ist synchronisiert. Entscheidungen fließen verlustfrei aus deiner Natur.', warning: 'Warnung: Fehlende Reibung begünstigt Stagnation. Suche gezielt nach Widerstand.' },
    good: { title: 'AKTIVER ABGLEICH', desc: 'Spannungsfelder zwischen Kernzahlen detektiert. Das ist dein innerer Treibstoff.', action: 'Anweisung: Identifiziere den Konflikt zwischen Logik und Impuls.' },
    low: { title: 'SYSTEMKONFLIKT', desc: 'Fundamentale Spannungen im Bauplan. Hoher Energie-Verlust durch innere Reibung.', urgency: 'Priorität: Beseitige die primäre Diskrepanz im System.' }
  },

  grid: {
    mental: { name: 'MENTALER FOKUS', present: 'Strukturiertes Denken. Objektive Problem-Lösung als Standard.', absent: 'Intuitiver Zugriff. Erkennung des Gesamtbildes ohne analytische Kette.' },
    emotional: { name: 'EMOTIONALER FOKUS', present: 'Hohe Detektions-Rate für Signale im Umfeld. Tiefe Wahrnehmung.', absent: 'Rationale Distanz. Emotionale Variablen stören die Prozess-Abwicklung nicht.' },
    physical: { name: 'PHYSISCHER FOKUS', present: 'Pragmatische Ausführung. Transformation von Ideen in physische Masse.', absent: 'Konzeptueller Fokus. Denken jenseits materieller Grenzen.' },
    thinking: { name: 'DENK-PROZESS', present: 'Logische Präzision. Objektive Analyse der Daten-Basis.', absent: 'Nicht-lineare Vernetzung. Detektion versteckter Synergien.' },
    will: { name: 'DURCHSETZUNG', present: 'Enorme Willenskraft. Erreichung gesetzter Ziele gegen Widerstand.', absent: 'Hohe Adoptions-Fähigkeit. Finden alternativer Wege bei Blockaden.' },
    action: { name: 'AUSFÜHRUNG', present: 'Schnelle Realisierung. Erfahrungsgewinn durch unmittelbares Handeln.', absent: 'Geplante Realisierung. Sicherung des Terrains vor dem ersten Schritt.' }
  },

  pinnacles: {
    1: { title: 'AUTONOMIE', desc: 'Fokus auf Identitäts-Sicherung. Aufbau einer eigenständigen Kraft-Einheit.' },
    2: { title: 'SYNERGIE', desc: 'Fokus auf Bündnisse. Strategische Verbindung mit anderen Entitäten.' },
    3: { title: 'PRÄSENZ', desc: 'Fokus auf Sichtbarkeit. Expression des eigenen Bauplans nach außen.' },
    4: { title: 'STABILITÄT', desc: 'Fokus auf Fundament. Bau von Strukturen, die den Zeitfluss überdauern.' },
    5: { title: 'EXPANSION', desc: 'Fokus auf Wandel. Sprengung alter System-Grenzen zur Neuausrichtung.' },
    6: { title: 'GLEICHGEWICHT', desc: 'Fokus auf Verantwortung. Übernahme tragender Rollen im System.' },
    7: { title: 'ESSENZ', desc: 'Fokus auf Wahrheit. Dekodierung der tieferen Mechanismen der Existenz.' },
    8: { title: 'DOMINANZ', desc: 'Fokus auf Erfolg. Phase höchster physischer und materieller Wirkung.' },
    9: { title: 'VOLLENDUNG', desc: 'Fokus auf Abschluss. Überführung alter Daten in einen neuen Zyklus.' },
    11: { title: 'ILLUMINATION', desc: 'Fokus auf Intuition. Wirkung als systemischer Wegweiser für andere.' },
    22: { title: 'MANIFESTATION', desc: 'Fokus auf Schöpfung. Bau von Monumenten des eigenen Bauplans.' }
  },

  cycles: {
    early: {
      1: { theme: 'AUTONOMIE', task: 'Etablierung der eigenen Stimme. Trennung von externer Erlaubnis.' },
      2: { theme: 'BÜNDNIS', task: 'Detektion des Werts von Zusammenarbeit und Signal-Wahrnehmung.' },
      3: { theme: 'AUSDRUCK', task: 'Versuchs-Zyklen zum authentischen Ausdruck des Bauplans.' },
      4: { theme: 'FUNDAMENT', task: 'Bau der ersten stabilen Strukturen. Training der System-Disziplin.' },
      5: { theme: 'WANDEL', task: 'Sammeln von Daten-Punkten durch schnelle Adaption und Erfahrung.' },
      6: { theme: 'STABILITÄT', task: 'Übernahme von Verantwortung zur Sicherung des Umfelds.' },
      7: { theme: 'ANALYSE', task: 'Hinterfragung der Default-Antworten. Suche nach der System-Wahrheit.' },
      8: { theme: 'WIRKUNG', task: 'Training im Umgang mit Macht-Variablen und physischem Erfolg.' },
      9: { theme: 'VOLLENDUNG', task: 'Lerne den Prozess des Loslassens zur Vorbereitung neuer Zyklen.' },
      11: { theme: 'INTUITION', task: 'Training der inneren Antenne. Detektion von Mustern hinter den Daten.' },
      22: { theme: 'VISION', task: 'Vorbereitung großer System-Bauten. Erfassung technischer Tiefe.' }
    },
    middle: {
      1: { theme: 'INDEPENDENZ', task: 'Beweisführung des autarken Bauplans. Etablierung als Kraft-Zentrum.' },
      2: { theme: 'SYNERGIE', task: 'Integration in tiefe Bündnisse ohne Verlust der Eigenständigkeit.' },
      3: { theme: 'IMPACT', task: 'Optimale Sichtbarkeit. Transformation der inneren Realität nach außen.' },
      4: { theme: 'STRUKTUR', task: 'Langfristige Sicherung des Terrains. Bau von dauerhaften Systemen.' },
      5: { theme: 'ADAPTION', task: 'Durchlauf radikaler Transformations-Zyklen. Identitäts-Update.' },
      6: { theme: 'ORDNUNG', task: 'Einnahme des Platzes als tragende Säule innerhalb der Gesellschaft.' },
      7: { theme: 'ESSENZ', task: 'Entwicklung intellektueller oder systemischer Tiefe. Sinn-Suche.' },
      8: { theme: 'EFFIZIENZ', task: 'Erreichung messbare Ziele. Etablierung als anerkannte Autorität.' },
      9: { theme: 'UNIVERSAL', task: 'Extension des Einflusses auf kollektive Ziele jenseits des Selbst.' },
      11: { theme: 'ILLUMINATION', task: 'Wirkung als systemischer Wegweiser. Transfer von intuitivem Wissen.' },
      22: { theme: 'MANIFESTATION', task: 'Schöpfung von Monumenten. Transformation von Vision in harte Realität.' }
    },
    late: {
      1: { theme: 'SOUVERÄNITÄT', task: 'Bestimmung des Rhythmus ohne Rücksicht auf System-Druck.' },
      2: { theme: 'WEISHEIT', task: 'Transfer der Erfahrung in Bündnissen. Spuren-Hinterlegung.' },
      3: { theme: 'PRÄSENZ', task: 'Erhaltung der Ausdruckskraft. Nutzung des Alters als Signal-Vorteil.' },
      4: { theme: 'ERNTE', task: 'Nutze die Resultate aus den gebauten Strukturen. Reife-Phase.' },
      5: { theme: 'FREIHEIT', task: 'Nutzung der Unabhängigkeit für neue praktische Räume.' },
      6: { theme: 'HARMONIE', task: 'Wirkung als ordnende Instanz allein durch physische Präsenz.' },
      7: { theme: 'STILLE', task: 'Klarheit durch Loslösung von materiellen Parametern.' },
      8: { theme: 'LEGACY', task: 'Absicherung der Wirkung über die eigene Existenz hinaus.' },
      9: { theme: 'VOLLENDUNG', task: 'Durchlauf der finalen Korrektur. Vorbereitung des Übergangs.' },
      11: { theme: 'REIFE-SEHEN', task: 'Klarheit durch visionäre Distanz. Abschluss der inneren Dekodierung.' },
      22: { theme: 'LEGACY-BAU', task: 'Absicherung systemischer Werke für kommende Iterationen.' }
    }
  },

  challenges: {
    0: { desc: 'Keine primäre Spannung detektiert. Risiko: Selbstzufriedenheit.' },
    1: { desc: 'Anweisung: Setze deine Stimme durch. Bauplan darf nicht untersinken.' },
    2: { desc: 'Anweisung: Setze klare Grenzen. Vermeidung von Dominanz anderer.' },
    3: { desc: 'Anweisung: Beende die Zerstreuung. Konzentration auf den Kern-Impuls.' },
    4: { desc: 'Anweisung: Lerne das Loslassen starrer Regeln und Strukturen.' },
    5: { desc: 'Anweisung: Halte die innerliche Tiefe aus. Beende die Flucht-Reflexe.' },
    6: { desc: 'Anweisung: Priorisiere den eigenen Bauplan vor fremder Last.' },
    7: { desc: 'Anweisung: Beende die Analyse-Lähmung. Gehe in die physische Umsetzung.' },
    8: { desc: 'Anweisung: Nutze deine Macht messbar, aber ohne Integritäts-Verlust.' },
    9: { desc: 'Anweisung: Bleibe messbar and praktisch. Vermeide Idealismus-Blasen.' }
  },

  bridges: {
    0: "Keine Kluft detektiert. Denken und Handeln sind synchronisiert.",
    1: "Kluft der Individualität: Lerne, ohne Angst eigenständig zu entscheiden.",
    2: "Kluft der Diplomatie: Lerne, Konflikte als Synergie zu begreifen.",
    3: "Kluft des Ausdrucks: Überwinde die Barriere zwischen Gedanke und Stimme.",
    4: "Kluft der Ordnung: Lerne, dass Freiheit eine Struktur braucht.",
    5: "Kluft des Wandels: Akzeptiere die Unsicherheit als Teil deines Bauplans.",
    6: "Kluft der Harmonie: Erkenne, dass deine Last nicht die der anderen ist.",
    7: "Kluft der Tiefe: Erkenne, dass Logik allein die Wahrheit nicht fassen kann.",
    8: "Kluft der Macht: Lerne, Erfolg nicht als Beweis für Wert zu sehen.",
    9: "Kluft der Vision: Lerne, das große Ganze im Detail zu finden."
  },

  maturity: {
    1: "Reifeziel: Souveräne Führung. Du wirst im Alter zum autarken Zentrum.",
    2: "Reifeziel: Diplomatische Synergie. Deine Stärke liegt in der Vermittlung.",
    3: "Reifeziel: Inspirierender Ausdruck. Du wirst zur lebenden Ideenschmiede.",
    4: "Reifeziel: Manifeste Ordnung. Du schaffst bleibende, gereifte Werte.",
    5: "Reifeziel: Dynamische Neugier. Du bleibst geistig und physisch in Bewegung.",
    6: "Reifeziel: System-Stabilisierung. Du wirst zur tragenden Schutzzone.",
    7: "Reifeziel: Dekodierte Weisheit. Du findest die Wahrheit hinter den Daten.",
    8: "Reifeziel: Integre Dominanz. Erfolg wird zum Werkzeug deines Charakters.",
    9: "Reifeziel: Universeller Dienst. Dein Leben wird zum Kompass für andere."
  },

  karmic: {
    1: { lesson: 'SOUVERÄNITÄT', desc: 'System-Upgrade: Lerne, ohne Bestätigung von außen zu führen.' },
    2: { lesson: 'SYNERGIE', desc: 'System-Upgrade: Entwickle Empathie als operativen Vorteil.' },
    3: { lesson: 'KLARHEIT', desc: 'System-Upgrade: Wandle Zerstreuung in fokussierten Ausdruck.' },
    4: { lesson: 'DISZIPLIN', desc: 'System-Upgrade: Struktur ist die Voraussetzung für Freiheit.' },
    5: { lesson: 'TIEFE', desc: 'System-Upgrade: Beende die Flucht; lerne die operative Tiefe zu halten.' },
    6: { lesson: 'HARMONIE', desc: 'System-Upgrade: Akzeptiere Verantwortung ohne Selbstaufgabe.' },
    7: { lesson: 'WAHRHEIT', desc: 'System-Upgrade: Nutze die Stille zur Dekodierung der Realität.' },
    8: { lesson: 'INTEGRITÄT', desc: 'System-Upgrade: Siege durch faire Kraft, nicht durch Dominanz.' },
    9: { lesson: 'VOLLENDUNG', desc: 'System-Upgrade: Schließe Zyklen radikal ab, um Raum zu schaffen.' }
  },

  getStrategicTips(lp) {
    const t = {
      1: "Übernimm die volle Kontrolle. Warte nicht auf Erlaubnis.",
      2: "Setze klare Grenzen. Lass dich nicht als Puffer missbrauchen.",
      3: "Fokussiere deine Energie auf EINE Idee bis zum Resultat.",
      4: "Strukturen dienen DIR, nicht umgekehrt. Bleibe flexibel.",
      5: "Nutze den Wandel. Skaliere jetzt, wenn alles umbricht.",
      6: "Stabilisiere dich selbst, bevor du andere führst.",
      7: "Wandle Wissen in Taten um. Beginne die Umsetzung heute.",
      8: "Skaliere durch Integrität. Ehrlichkeit ist dein Fundament.",
      9: "Denke global. Deine Wirkung braucht einen großen Maßstab.",
      11: "Vertraue deiner Intuition über jede Logik. Zweifle nicht.",
      22: "Baue das Unmögliche jetzt. Nimm heute den ersten Stein."
    };
    return t[lp] || "Handle konsequent nach deinem Bauplan.";
  }
};
