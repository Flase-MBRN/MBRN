"""
SYNERGY_CORE_DATA.PY

Berechnet Lebenszahlen für Erik & Klaudia.
Sector C (Data Arbitrage) - DATA-MAKER Agent 2
"""

import json
from datetime import datetime, timezone
from typing import Dict, List, Any, Tuple
from pathlib import Path

# Meisternummern (Master Numbers)
MASTER_NUMBERS = {11, 22}


def reduce_number(n: int, preserve_master: bool = True) -> int:
    """
    Reduziert eine Zahl zu einer einstelligen Zahl (1-9).
    Wenn preserve_master=True und n ist 11 oder 22, bleibt es erhalten.
    """
    if preserve_master and n in MASTER_NUMBERS:
        return n

    while n > 9:
        n = sum(int(digit) for digit in str(n))
    return n


def calculate_life_path(day: int, month: int, year: int) -> Dict[str, Any]:
    """
    Berechnet die Lebenszahl aus Tag, Monat, Jahr.
    Berücksichtigt Meisternummern (11, 22).
    """
    # Einzelne Komponenten reduzieren
    day_reduced = reduce_number(day, preserve_master=True)
    month_reduced = reduce_number(month, preserve_master=False)  # Monat hat keine Master-Nummern
    year_reduced = reduce_number(year, preserve_master=True)

    # Summe berechnen
    total_sum = day_reduced + month_reduced + year_reduced

    # Finale Reduktion
    final_number = reduce_number(total_sum, preserve_master=True)

    # Gefundene Meisternummern tracken
    master_numbers_found = []
    if day in MASTER_NUMBERS:
        master_numbers_found.append(day)
    if year_reduced in MASTER_NUMBERS:
        master_numbers_found.append(year_reduced)
    if final_number in MASTER_NUMBERS:
        master_numbers_found.append(final_number)

    return {
        "day": day_reduced,
        "month": month_reduced,
        "year": year_reduced,
        "sum": total_sum,
        "final_reduction": f"{total_sum} → {final_number}" if total_sum != final_number else str(final_number),
        "life_path_number": final_number,
        "master_numbers": master_numbers_found
    }


def get_synergy_compatibility(num1: int, num2: int) -> str:
    """
    Gibt eine einfache Kompatibilitätsbeschreibung zurück.
    """
    # Kompatibilitätsmatrix (vereinfacht)
    compatible_pairs = {
        (1, 5): "Dynamisch & Abenteuerlich",
        (3, 5): "Kreativ & Kommunikativ",
        (3, 1): "Inspiration & Führung",
    }

    # Sortiere für konsistente Lookup
    pair = tuple(sorted([num1, num2]))

    return compatible_pairs.get(pair, f"Synergie zwischen {num1} und {num2}")


def process_person(name: str, birthdate_str: str) -> Dict[str, Any]:
    """
    Verarbeitet eine Person und berechnet alle numerischen Werte.
    birthdate_format: DD.MM.YYYY
    """
    # Parse Datum
    day, month, year = map(int, birthdate_str.split('.'))

    # Berechne Lebenszahl
    calc_result = calculate_life_path(day, month, year)

    return {
        "name": name,
        "birthdate": birthdate_str,
        "life_path_number": calc_result["life_path_number"],
        "master_numbers": calc_result["master_numbers"],
        "calculation_steps": {
            "day": calc_result["day"],
            "month": calc_result["month"],
            "year": calc_result["year"],
            "sum": calc_result["sum"],
            "final_reduction": calc_result["final_reduction"]
        }
    }


def main():
    """Hauptfunktion: Berechnet Synergy-Daten für Erik & Klaudia."""

    # Datensätze definieren
    persons_data = [
        {"name": "Erik Klauß", "birthdate": "11.12.2005"},
        {"name": "Klaudia Sekowska", "birthdate": "28.03.2008"}
    ]

    # Verarbeite jede Person
    processed_persons = []
    for person in persons_data:
        result = process_person(person["name"], person["birthdate"])
        processed_persons.append(result)

    # Synergy-Analyse
    life_path_1 = processed_persons[0]["life_path_number"]
    life_path_2 = processed_persons[1]["life_path_number"]
    combined_energy = reduce_number(life_path_1 + life_path_2, preserve_master=True)

    synergy_analysis = {
        "life_path_compatibility": get_synergy_compatibility(life_path_1, life_path_2),
        "combined_energy": combined_energy,
        "individual_paths": [life_path_1, life_path_2]
    }

    # Erstelle finalen Output
    output = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "source": "synergy_core_data",
        "data": {
            "persons": processed_persons,
            "synergy_analysis": synergy_analysis
        },
        "mbrn_enriched": {
            "confidence": 1.0,
            "calculation_method": "standard_numerology_v1",
            "master_numbers_recognized": True
        }
    }

    # Speichere als JSON
    output_path = Path("c:/DevLab/MBRN-HUB-V1/docs/S3_Data/synergy_input_raw.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"✅ Synergy-Daten gespeichert: {output_path}")
    print(f"📊 Erik Lebenszahl: {life_path_1}")
    print(f"📊 Klaudia Lebenszahl: {life_path_2}")
    print(f"🔗 Kombinierte Energie: {combined_energy}")

    return output


if __name__ == "__main__":
    result = main()
