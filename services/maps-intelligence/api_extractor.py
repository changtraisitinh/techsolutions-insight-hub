"""
Google Maps API extractor module
Refactored from extract_leads.py for API use
"""

import googlemaps
import asyncio
from typing import List, Dict


class GoogleMapsAPIExtractor:
    """Extract places using Google Maps Places API"""
    
    def __init__(self, api_key: str):
        self.client = googlemaps.Client(key=api_key)
    
    async def extract_places(self, location: str, keyword: str, max_results: int = 100) -> List[Dict]:
        """
        Extract places from Google Maps Places API
        
        Returns:
            List of business dictionaries with lead data
        """
        # Run in thread pool since googlemaps is synchronous
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None,
            self._extract_sync,
            location,
            keyword,
            max_results
        )
        return results
    
    def _extract_sync(self, location: str, keyword: str, max_results: int) -> List[Dict]:
        """Synchronous extraction logic"""
        results = []
        
        # Text search
        search_results = self.client.places(
            query=f"{keyword} in {location}"
        )
        
        places = search_results.get('results', [])
        
        # Extract details for each place
        for place in places[:max_results]:
            try:
                place_id = place.get('place_id')
                
                # Get detailed info
                details = self.client.place(place_id, fields=[
                    'name',
                    'formatted_address',
                    'formatted_phone_number',
                    'international_phone_number',
                    'website',
                    'rating',
                    'user_ratings_total',
                    'types',
                    'geometry'
                ])['result']
                
                # Build lead object
                lead = {
                    'name': details.get('name', ''),
                    'address': details.get('formatted_address', ''),
                    'phone': details.get('formatted_phone_number', ''),
                    'website': details.get('website', ''),
                    'rating': details.get('rating'),
                    'review_count': details.get('user_ratings_total', 0),
                    'category': ', '.join(details.get('types', [])[:3]),
                    'google_place_id': place_id,
                    'quality_score': self.calculate_quality_score({
                        'name': details.get('name'),
                        'address': details.get('formatted_address'),
                        'phone': details.get('formatted_phone_number'),
                        'website': details.get('website'),
                        'rating': details.get('rating'),
                        'review_count': details.get('user_ratings_total', 0)
                    })
                }
                
                results.append(lead)
                
            except Exception:
                continue
        
        return results
    
    def calculate_quality_score(self, lead: dict) -> int:
        """Calculate data quality score (0-100)"""
        score = 0
        
        if lead.get('name'): score += 30
        if lead.get('address'): score += 20
        if lead.get('phone'): score += 15
        if lead.get('rating') and lead.get('review_count', 0) >= 10: score += 15
        if lead.get('website'): score += 10
        if lead.get('google_place_id'): score += 10
        
        return score
