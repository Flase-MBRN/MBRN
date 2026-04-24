import math
from typing import Dict, List, Any
from collections import defaultdict

def calculate_alignment_score(sentiment_values: List[float], numerology_relevance: List[float]) -> float:
    if len(sentiment_values) != len(numerology_relevance):
        raise ValueError("Sentiment and numerology lists must have same length")
    if len(sentiment_values) == 0:
        return 50.0

    sum_s_squared = sum(s ** 2 for s in sentiment_values)
    sum_n_squared = sum(n ** 2 for n in numerology_relevance)
    sum_s_n = sum(s * n for s, n in zip(sentiment_values, numerology_relevance))

    if sum_s_n == 0:
        return 50.0

    raw_score = (sum_s_squared * sum_n_squared) / sum_s_n
    normalized_score = min(100, max(0, 50 + (math.log(raw_score + 1) - math.log(100)) * 10))
    return round(normalized_score, 2)

def calculate_std_dev(values: List[float]) -> float:
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return math.sqrt(variance)

def calculate_correlation_coefficient(x: List[float], y: List[float]) -> float:
    if len(x) != len(y) or len(x) < 2:
        return 0.0

    n = len(x)
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(xi * yi for xi, yi in zip(x, y))
    sum_x2 = sum(xi ** 2 for xi in x)
    sum_y2 = sum(yi ** 2 for yi in y)

    numerator = n * sum_xy - sum_x * sum_y
    denominator = math.sqrt((n * sum_x2 - sum_x ** 2) * (n * sum_y2 - sum_y ** 2))
    if denominator == 0:
        return 0.0
    return numerator / denominator

def build_correlation_matrix(merged_data: List[Dict[str, Any]]) -> Dict[int, Dict[str, Any]]:
    day_groups = defaultdict(list)

    for record in merged_data:
        day_num = record["numerology"]["day_number"]
        sentiment = record["market"]["sentiment_score"]
        relevance = record["numerology"]["relevance_score"]
        day_groups[day_num].append({
            "sentiment": sentiment,
            "relevance": relevance,
            "date": record["date"]
        })

    matrix = {}
    for day_num, records in day_groups.items():
        sentiments = [r["sentiment"] for r in records]
        relevances = [r["relevance"] for r in records]
        avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 50
        std_sentiment = calculate_std_dev(sentiments) if len(sentiments) > 1 else 0
        avg_relevance = sum(relevances) / len(relevances) if relevances else 0.5
        alignment = calculate_alignment_score(sentiments, relevances)

        matrix[day_num] = {
            "day_number": day_num,
            "count": len(records),
            "avg_sentiment": round(avg_sentiment, 2),
            "std_sentiment": round(std_sentiment, 2),
            "avg_relevance": round(avg_relevance, 3),
            "alignment_score": round(alignment, 2),
            "records": records
        }

    return matrix

def find_patterns(correlation_matrix: Dict[int, Dict[str, Any]]) -> Dict[str, Any]:
    if not correlation_matrix:
        return {
            "strongest_correlation": None,
            "weakest_correlation": None,
            "overall_trend": "insufficient_data",
            "statistical_significance": "low"
        }

    alignments = [(day_num, data["alignment_score"]) for day_num, data in correlation_matrix.items()]
    strongest = max(alignments, key=lambda x: x[1])
    weakest = min(alignments, key=lambda x: x[1])

    all_sentiments = []
    all_relevances = []
    for data in correlation_matrix.values():
        for record in data["records"]:
            all_sentiments.append(record["sentiment"])
            all_relevances.append(record["relevance"])

    overall_r = calculate_correlation_coefficient(all_sentiments, all_relevances)
    total_records = sum(data["count"] for data in correlation_matrix.values())
    significance = "high" if total_records >= 50 else "medium" if total_records >= 20 else "low"

    if overall_r > 0.3:
        trend = "positive_correlation"
    elif overall_r < -0.3:
        trend = "negative_correlation"
    else:
        trend = "weak_or_no_correlation"

    return {
        "strongest_correlation": {
            "day_number": strongest[0],
            "alignment_score": strongest[1],
            "avg_sentiment": correlation_matrix[strongest[0]]["avg_sentiment"]
        },
        "weakest_correlation": {
            "day_number": weakest[0],
            "alignment_score": weakest[1],
            "avg_sentiment": correlation_matrix[weakest[0]]["avg_sentiment"]
        },
        "overall_correlation_r": round(overall_r, 3),
        "overall_trend": trend,
        "statistical_significance": significance,
        "total_records_analyzed": total_records,
        "day_numbers_analyzed": len(list(correlation_matrix.keys()))
    }

def get_sentiment_prediction_for_day(day_number: int, correlation_matrix: Dict[int, Dict[str, Any]], current_sentiment_trend: float = 0.0) -> float:
    if day_number not in correlation_matrix:
        return 50.0

    day_stats = correlation_matrix[day_number]
    base_sentiment = day_stats["avg_sentiment"]
    alignment = day_stats["alignment_score"]
    adjustment_factor = (alignment - 50) / 100
    predicted = base_sentiment + (current_sentiment_trend * adjustment_factor * 10)
    return round(min(100, max(0, predicted)), 2)
