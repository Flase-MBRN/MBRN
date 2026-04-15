"""
CoinGecko Market Data Source
Fetches trending coins and market metrics
DSGVO-compliant: Only public market data, no personal information
"""

import requests
from datetime import datetime
from typing import Dict, Any, List, Optional


class CoinGeckoClient:
    """Client for CoinGecko API (public tier)"""
    
    BASE_URL = "https://api.coingecko.com/api/v3"
    USER_AGENT = "MBRN_Sentiment_Bot/1.0"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.USER_AGENT
        })
    
    def fetch_trending(self) -> Optional[List[Dict[str, Any]]]:
        """
        Fetch trending coins from CoinGecko
        
        Returns:
            List of trending coins with market data
            None if request fails
        """
        try:
            response = self.session.get(
                f"{self.BASE_URL}/search/trending",
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            if 'coins' not in data:
                print("[CoinGecko] No trending coins in response")
                return None
            
            trending = []
            for coin_data in data['coins'][:7]:  # Top 7 trending
                coin = coin_data['item']
                trending.append({
                    'id': coin['id'],
                    'name': coin['name'],
                    'symbol': coin['symbol'],
                    'market_cap_rank': coin.get('market_cap_rank', None),
                    'price_btc': coin.get('price_btc', None),
                    'score': coin.get('score', None)
                })
            
            return trending
            
        except requests.exceptions.RequestException as e:
            print(f"[CoinGecko] Trending request failed: {e}")
            return None
        except (KeyError, ValueError) as e:
            print(f"[CoinGecko] Trending parsing error: {e}")
            return None
    
    def fetch_global_metrics(self) -> Optional[Dict[str, Any]]:
        """
        Fetch global crypto market metrics
        
        Returns:
            Dict with market cap, volume, dominance
            None if request fails
        """
        try:
            response = self.session.get(
                f"{self.BASE_URL}/global",
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            if 'data' not in data:
                return None
            
            global_data = data['data']
            
            return {
                'total_market_cap_usd': global_data.get('total_market_cap', {}).get('usd', 0),
                'total_volume_24h_usd': global_data.get('total_volume', {}).get('usd', 0),
                'market_cap_change_24h': global_data.get('market_cap_change_percentage_24h_usd', 0),
                'btc_dominance': global_data.get('market_cap_percentage', {}).get('btc', 0),
                'eth_dominance': global_data.get('market_cap_percentage', {}).get('eth', 0),
                'active_cryptocurrencies': global_data.get('active_cryptocurrencies', 0),
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
            
        except requests.exceptions.RequestException as e:
            print(f"[CoinGecko] Global metrics request failed: {e}")
            return None
        except (KeyError, ValueError) as e:
            print(f"[CoinGecko] Global metrics parsing error: {e}")
            return None
    
    def fetch_market_data(self, coins: List[str] = None) -> Optional[List[Dict[str, Any]]]:
        """
        Fetch market data for specific coins
        
        Args:
            coins: List of coin IDs (e.g., ['bitcoin', 'ethereum'])
            
        Returns:
            List of market data for each coin
        """
        if coins is None:
            coins = ['bitcoin', 'ethereum', 'cardano', 'solana']
        
        try:
            coin_ids = ','.join(coins)
            response = self.session.get(
                f"{self.BASE_URL}/coins/markets",
                params={
                    'vs_currency': 'usd',
                    'ids': coin_ids,
                    'order': 'market_cap_desc',
                    'sparkline': 'false'
                },
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            market_data = []
            for coin in data:
                market_data.append({
                    'id': coin['id'],
                    'symbol': coin['symbol'],
                    'current_price': coin.get('current_price', 0),
                    'price_change_24h': coin.get('price_change_24h', 0),
                    'price_change_percentage_24h': coin.get('price_change_percentage_24h', 0),
                    'market_cap': coin.get('market_cap', 0),
                    'volume_24h': coin.get('total_volume', 0),
                    'ath': coin.get('ath', 0),
                    'ath_change_percentage': coin.get('ath_change_percentage', 0)
                })
            
            return market_data
            
        except requests.exceptions.RequestException as e:
            print(f"[CoinGecko] Market data request failed: {e}")
            return None
        except (KeyError, ValueError) as e:
            print(f"[CoinGecko] Market data parsing error: {e}")
            return None
