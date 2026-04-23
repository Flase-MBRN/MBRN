"""
Fear & Greed Index Data Source
Fetches market sentiment from alternative.me
DSGVO-compliant: No personal data, only public market sentiment
"""

import requests
from datetime import datetime
from typing import Dict, Any, Optional


class FearGreedClient:
    """Client for Fear & Greed Index API"""
    
    BASE_URL = "https://api.alternative.me/fng/"
    USER_AGENT = "MBRN_Sentiment_Bot/1.0"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.USER_AGENT
        })
    
    def fetch_current(self) -> Optional[Dict[str, Any]]:
        """
        Fetch current Fear & Greed Index
        
        Returns:
            Dict with score (0-100), classification, and timestamp
            None if request fails
        """
        try:
            response = self.session.get(
                f"{self.BASE_URL}?limit=1",
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            if 'data' not in data or len(data['data']) == 0:
                print("[FearGreed] No data in response")
                return None
            
            item = data['data'][0]
            
            return {
                'score': int(item['value']),
                'classification': item['value_classification'],
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'source': 'alternative.me'
            }
            
        except requests.exceptions.RequestException as e:
            print(f"[FearGreed] Request failed: {e}")
            return None
        except (KeyError, ValueError) as e:
            print(f"[FearGreed] Data parsing error: {e}")
            return None
    
    def fetch_history(self, limit: int = 10) -> Optional[list]:
        """
        Fetch historical Fear & Greed data
        
        Args:
            limit: Number of days to fetch (max 365)
            
        Returns:
            List of sentiment data points
        """
        try:
            response = self.session.get(
                f"{self.BASE_URL}?limit={limit}",
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            if 'data' not in data:
                return None
            
            history = []
            for item in data['data']:
                history.append({
                    'score': int(item['value']),
                    'classification': item['value_classification'],
                    'timestamp': item['timestamp'],
                    'source': 'alternative.me'
                })
            
            return history
            
        except requests.exceptions.RequestException as e:
            print(f"[FearGreed] History request failed: {e}")
            return None
        except (KeyError, ValueError) as e:
            print(f"[FearGreed] History parsing error: {e}")
            return None
