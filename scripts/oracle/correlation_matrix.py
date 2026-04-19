#!/usr/bin/env python3
"""
/scripts/oracle/correlation_matrix.py
CORRELATION MATRIX — Statistical analysis with mathematical weighting

Responsibilities:
- Build correlation matrix between numerology and market sentiment
- Calculate Alignment Score (A) with mathematical weighting
- Identify patterns and statistical significance

Architect's Formula for Alignment Score (A):
A = Σ(Si²) · Σ(Ni²) / Σ(Si · Ni)

Where:
- Si = Market Sentiment for day i
- Ni = Numerological Relevance for day i
"""

import math
from typing import Dict, List, Tuple, Any
from collections import defaultdict

# =============================================================================
# ALIGNMENT SCORE CALCULATION (ARCHITECT'S FORMULA)
# =============================================================================

def calculate_alignment_score(sentiment_values: List[float], 
                              numerology_relevance: List[float]) -> float:
    """
    Calculate Alignment Score (A) using the Architect's mathematical weighting.
    
    Formula: A = Σ(Si²) · Σ(Ni²) / Σ(Si · Ni)
    
    Where:
    - Si = Market Sentiment for day i
    - Ni = Numerological Relevance for day i
    
    Args:
        sentiment_values: List of sentiment scores (0-100)
        numerology_relevance: List of relevance scores (0.0-1.0)
        
    Returns:
        Alignment Score (normalized to 0-100 scale)
    """
    if len(sentiment_values) != len(numerology_relevance):
        raise ValueError("Sentiment and numerology lists must have same length")
    
    if len(sentiment_values) == 0:
        return 50.0  # Neutral score for empty data
    
    # Calculate components
    sum_s_squared = sum(s ** 2 for s in sentiment_values)
    sum_n_squared = sum(n ** 2 for n in numerology_relevance)
    sum_s_n = sum(s * n for s, n in zip(sentiment_values, numerology_relevance))
    
    # Avoid division by zero
    if sum_s_n == 0:
        return 50.0
    
    # Apply formula
    raw_score = (sum_s_squared * sum_n_squared) / sum_s_n
    
    # Normalize to 0-100 scale
    # The raw score can be very large, so we apply a logarithmic normalization
    normalized_score = min(100, max(0, 50 + (math.log(raw_score + 1) - math.log(100)) * 10))
    
    return round(normalized_score, 2)

# =============================================================================
# CORRELATION ANALYSIS
# =============================================================================

def build_correlation_matrix(merged_data: List[Dict[str, Any]]) -> Dict[int, Dict[str, Any]]:
    """
    Build correlation matrix grouped by day number.
    
    Args:
        merged_data: List of merged records with numerology and market data
        
    Returns:
        Dict mapping day_number to statistics
    """
    # Group by day number
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
    
    # Calculate statistics per day number
    matrix = {}
    for day_num, records in day_groups.items():
        sentiments = [r["sentiment"] for r in records]
        relevances = [r["relevance"] for r in records]
        
        # Basic statistics
        avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 50
        std_sentiment = calculate_std_dev(sentiments) if len(sentiments) > 1 else 0
        avg_relevance = sum(relevances) / len(relevances) if relevances else 0.5
        
        # Alignment Score for this day number
        alignment = calculate_alignment_score(sentiments, relevances)
        
        # Count occurrences
        count = len(records)
        
        matrix[day_num] = {
            "day_number": day_num,
            "count": count,
            "avg_sentiment": round(avg_sentiment, 2),
            "std_sentiment": round(std_sentiment, 2),
            "avg_relevance": round(avg_relevance, 3),
            "alignment_score": round(alignment, 2),
            "records": records
        }
    
    return matrix

def calculate_std_dev(values: List[float]) -> float:
    """Calculate standard deviation."""
    if len(values) < 2:
        return 0.0
    
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return math.sqrt(variance)

def calculate_correlation_coefficient(x: List[float], y: List[float]) -> float:
    """
    Calculate Pearson correlation coefficient between two lists.
    
    Args:
        x: First list of values
        y: Second list of values
        
    Returns:
        Correlation coefficient (-1 to 1)
    """
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

# =============================================================================
# PATTERN DETECTION
# =============================================================================

def find_patterns(correlation_matrix: Dict[int, Dict[str, Any]]) -> Dict[str, Any]:
    """
    Identify patterns and statistical significance in correlation matrix.
    
    Args:
        correlation_matrix: Output from build_correlation_matrix
        
    Returns:
        Dict with pattern analysis results
    """
    if not correlation_matrix:
        return {
            "strongest_correlation": None,
            "weakest_correlation": None,
            "overall_trend": "insufficient_data",
            "statistical_significance": "low"
        }
    
    # Find strongest and weakest alignment
    day_numbers = list(correlation_matrix.keys())
    alignments = [(day_num, data["alignment_score"]) 
                  for day_num, data in correlation_matrix.items()]
    
    strongest = max(alignments, key=lambda x: x[1])
    weakest = min(alignments, key=lambda x: x[1])
    
    # Calculate overall correlation across all days
    all_sentiments = []
    all_relevances = []
    
    for data in correlation_matrix.values():
        for record in data["records"]:
            all_sentiments.append(record["sentiment"])
            all_relevances.append(record["relevance"])
    
    overall_r = calculate_correlation_coefficient(all_sentiments, all_relevances)
    
    # Determine statistical significance
    total_records = sum(data["count"] for data in correlation_matrix.values())
    significance = "high" if total_records >= 50 else "medium" if total_records >= 20 else "low"
    
    # Overall trend
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
        "day_numbers_analyzed": len(day_numbers)
    }

def get_sentiment_prediction_for_day(day_number: int, 
                                     correlation_matrix: Dict[int, Dict[str, Any]],
                                     current_sentiment_trend: float = 0.0) -> float:
    """
    Predict sentiment for a specific day number based on historical correlation.
    
    Args:
        day_number: Target day number
        correlation_matrix: Historical correlation data
        current_sentiment_trend: Current market sentiment trend (positive/negative)
        
    Returns:
        Predicted sentiment score (0-100)
    """
    if day_number not in correlation_matrix:
        return 50.0  # Neutral prediction for unknown patterns
    
    day_stats = correlation_matrix[day_number]
    base_sentiment = day_stats["avg_sentiment"]
    
    # Adjust based on alignment score
    alignment = day_stats["alignment_score"]
    
    # Higher alignment = more confidence in historical pattern
    adjustment_factor = (alignment - 50) / 100  # -0.5 to +0.5
    
    predicted = base_sentiment + (current_sentiment_trend * adjustment_factor * 10)
    
    return round(min(100, max(0, predicted)), 2)

# =============================================================================
# MAIN (TEST)
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("CORRELATION MATRIX TEST")
    print("=" * 60)
    
    # Test with mock data
    mock_data = [
        {
            "date": "01.01.2026",
            "date_utc": "2026-01-01T00:00:00Z",
            "numerology": {
                "day_number": 8,
                "is_master": False,
                "description": "Macht, Erfolg",
                "relevance_score": 0.8
            },
            "market": {
                "sentiment_score": 75,
                "confidence": 0.8,
                "vix_level": 18.5,
                "recommendation": "buy"
            }
        },
        {
            "date": "02.01.2026",
            "date_utc": "2026-01-02T00:00:00Z",
            "numerology": {
                "day_number": 8,
                "is_master": False,
                "description": "Macht, Erfolg",
                "relevance_score": 0.8
            },
            "market": {
                "sentiment_score": 80,
                "confidence": 0.75,
                "vix_level": 17.2,
                "recommendation": "buy"
            }
        }
    ]
    
    matrix = build_correlation_matrix(mock_data)
    patterns = find_patterns(matrix)
    
    print(f"\n[OK] Correlation Matrix built for {len(matrix)} day numbers")
    print(f"\nPatterns:")
    print(json.dumps(patterns, indent=2))
    
    # Test alignment score calculation
    test_sentiments = [75, 80, 70, 85]
    test_relevances = [0.8, 0.8, 0.6, 0.9]
    alignment = calculate_alignment_score(test_sentiments, test_relevances)
    print(f"\n[TEST] Alignment Score: {alignment}")
