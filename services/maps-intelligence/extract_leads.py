#!/usr/bin/env python3
"""
Google Maps Lead Extractor
Extracts business leads from Google Maps and exports to CSV
"""

import googlemaps
import pandas as pd
import click
import os
from dotenv import load_dotenv
from typing import List, Dict
import time

# Load environment variables
load_dotenv()


class GoogleMapsExtractor:
    """Extract business data from Google Maps using Places API"""
    
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("Google API key is required. Set GOOGLE_API_KEY in .env file")
        self.client = googlemaps.Client(key=api_key)
    
    def search_places(self, location: str, keyword: str, max_results: int = 60) -> List[Dict]:
        """
        Search for places matching keyword in location
        
        Args:
            location: City or area (e.g., "Ho Chi Minh City")
            keyword: Business type (e.g., "coffee shop", "restaurant")
            max_results: Maximum number of results to return
            
        Returns:
            List of business dictionaries with extracted data
        """
        results = []
        
        click.echo(f"🔍 Searching for '{keyword}' in {location}...")
        
        try:
            # Perform text search
            search_results = self.client.places(
                query=f"{keyword} in {location}"
            )
            
            places = search_results.get('results', [])
            
            if not places:
                click.echo("⚠️  No results found. Try a different search term.")
                return []
            
            click.echo(f"📍 Found {len(places)} places. Extracting details...")
            
            # Extract details for each place
            for idx, place in enumerate(places[:max_results], 1):
                try:
                    place_id = place.get('place_id')
                    
                    # Get detailed information
                    details = self.client.place(place_id, fields=[
                        'name',
                        'formatted_address',
                        'formatted_phone_number',
                        'international_phone_number',
                        'website',
                        'rating',
                        'user_ratings_total',
                        'types',
                        'geometry',
                        'business_status',
                        'price_level',
                        'opening_hours'
                    ])['result']
                    
                    # Extract and structure the data
                    lead = {
                        'name': details.get('name', ''),
                        'address': details.get('formatted_address', ''),
                        'phone': details.get('formatted_phone_number', ''),
                        'international_phone': details.get('international_phone_number', ''),
                        'website': details.get('website', ''),
                        'rating': details.get('rating', ''),
                        'review_count': details.get('user_ratings_total', 0),
                        'category': ', '.join(details.get('types', [])[:3]),  # First 3 types
                        'latitude': details.get('geometry', {}).get('location', {}).get('lat', ''),
                        'longitude': details.get('geometry', {}).get('location', {}).get('lng', ''),
                        'business_status': details.get('business_status', ''),
                        'price_level': details.get('price_level', ''),
                        'google_place_id': place_id
                    }
                    
                    results.append(lead)
                    
                    # Progress indicator
                    if idx % 10 == 0:
                        click.echo(f"   Processed {idx}/{min(len(places), max_results)}...")
                    
                    # Small delay to avoid rate limiting
                    time.sleep(0.1)
                    
                except Exception as e:
                    click.echo(f"   ⚠️  Error extracting details for place {idx}: {str(e)}")
                    continue
            
            click.echo(f"✅ Successfully extracted {len(results)} leads")
            
        except Exception as e:
            click.echo(f"❌ Error during search: {str(e)}", err=True)
            raise
        
        return results
    
    def calculate_quality_score(self, lead: Dict) -> int:
        """Calculate data quality score (0-100)"""
        score = 0
        
        if lead.get('name'): score += 30
        if lead.get('address'): score += 20
        if lead.get('phone'): score += 15
        if lead.get('rating') and lead.get('review_count', 0) >= 10: score += 15
        if lead.get('website'): score += 10
        if lead.get('latitude') and lead.get('longitude'): score += 10
        
        return score


@click.command()
@click.option('--location', '-l', required=True, help='Location to search (e.g., "Ho Chi Minh City")')
@click.option('--keyword', '-k', required=True, help='Business type (e.g., "coffee shop", "restaurant")')
@click.option('--output', '-o', default='leads.csv', help='Output CSV file (default: leads.csv)')
@click.option('--max-results', '-m', default=60, type=int, help='Maximum number of results (default: 60)')
def extract(location: str, keyword: str, output: str, max_results: int):
    """
    Extract business leads from Google Maps to CSV
    
    Examples:
    
        # Extract coffee shops in HCMC
        python extract_leads.py -l "Ho Chi Minh City" -k "coffee shop"
        
        # Extract restaurants in Hanoi with custom output
        python extract_leads.py -l "Hanoi" -k "restaurant" -o restaurants.csv
        
        # Limit to 100 results
        python extract_leads.py -l "Da Nang" -k "hotel" -m 100
    """
    
    # Get API key from environment
    api_key = os.getenv('GOOGLE_API_KEY')
    
    if not api_key:
        click.echo("❌ Error: GOOGLE_API_KEY not found", err=True)
        click.echo("", err=True)
        click.echo("Please set your API key:", err=True)
        click.echo("  1. Copy .env.example to .env", err=True)
        click.echo("  2. Add your Google API key to .env", err=True)
        click.echo("  3. Get API key from: https://console.cloud.google.com/apis/credentials", err=True)
        return
    
    try:
        # Initialize extractor
        extractor = GoogleMapsExtractor(api_key)
        
        # Extract leads
        leads = extractor.search_places(location, keyword, max_results)
        
        if not leads:
            click.echo("⚠️  No leads extracted. Exiting.")
            return
        
        # Calculate quality scores
        for lead in leads:
            lead['quality_score'] = extractor.calculate_quality_score(lead)
        
        # Convert to DataFrame and sort by quality
        df = pd.DataFrame(leads)
        df = df.sort_values('quality_score', ascending=False)
        
        # Reorder columns for better readability
        column_order = [
            'name', 'rating', 'review_count', 'quality_score',
            'phone', 'address', 'website', 
            'category', 'business_status', 'price_level',
            'latitude', 'longitude', 'google_place_id',
            'international_phone'
        ]
        
        # Only include columns that exist
        column_order = [col for col in column_order if col in df.columns]
        df = df[column_order]
        
        # Export to CSV
        df.to_csv(output, index=False, encoding='utf-8-sig')  # utf-8-sig for Excel compatibility
        
        # Display summary
        click.echo("")
        click.echo("=" * 60)
        click.echo("📊 EXTRACTION SUMMARY")
        click.echo("=" * 60)
        click.echo(f"Total leads extracted: {len(leads)}")
        click.echo(f"Average quality score: {df['quality_score'].mean():.1f}/100")
        click.echo(f"Leads with phone: {df['phone'].notna().sum()} ({df['phone'].notna().sum()/len(leads)*100:.0f}%)")
        click.echo(f"Leads with website: {df['website'].notna().sum()} ({df['website'].notna().sum()/len(leads)*100:.0f}%)")
        click.echo(f"Average rating: {df[df['rating'] != '']['rating'].astype(float).mean():.1f}⭐")
        click.echo(f"Output file: {output}")
        click.echo("=" * 60)
        click.echo("")
        click.echo("✅ Done! Open the CSV file to see your leads.")
        
    except Exception as e:
        click.echo(f"❌ Error: {str(e)}", err=True)
        raise


if __name__ == '__main__':
    extract()
