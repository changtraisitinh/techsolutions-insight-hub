#!/usr/bin/env python3
"""
Google Maps Lead Scraper (Playwright)
Extracts business leads from Google Maps using web scraping
No API key required - completely free!
"""

import asyncio
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
import pandas as pd
import click
from typing import List, Dict
import time
import re


class GoogleMapsScraper:
    """Scrape Google Maps using Playwright"""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.results = []
    
    async def scrape_places(self, location: str, keyword: str, max_results: int = 10) -> List[Dict]:
        """
        Scrape places from Google Maps
        
        Args:
            location: City or area
            keyword: Business type
            max_results: Maximum results to scrape
            
        Returns:
            List of business dictionaries
        """
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(headless=self.headless)
            page = await browser.new_page()
            
            # Build search URL
            search_query = f"{keyword} in {location}"
            encoded_query = search_query.replace(' ', '+')
            url = f"https://www.google.com/maps/search/{encoded_query}"
            
            click.echo(f"🔍 Searching for '{keyword}' in {location}...")
            click.echo(f"🌐 URL: {url}")
            
            # Navigate to Google Maps
            # Use 'domcontentloaded' instead of 'networkidle' for better reliability
            await page.goto(url, wait_until='domcontentloaded', timeout=90000)
            await asyncio.sleep(5)  # Wait for results to load
            
            # Scroll to load more results
            click.echo("📜 Scrolling to load results...")
            results_panel = await page.query_selector('div[role="feed"]')
            
            if not results_panel:
                click.echo("⚠️  No results found. Try different keywords.")
                await browser.close()
                return []
            
            # Scroll multiple times to load more results
            prev_count = 0
            scroll_attempts = 0
            max_scrolls = 10
            
            while scroll_attempts < max_scrolls:
                # Get current count
                items = await results_panel.query_selector_all('div[role="article"]')
                current_count = len(items)
                
                if current_count >= max_results:
                    break
                
                if current_count == prev_count:
                    scroll_attempts += 1
                else:
                    scroll_attempts = 0
                
                prev_count = current_count
                
                # Scroll down
                await results_panel.evaluate('(element) => element.scrollTo(0, element.scrollHeight)')
                await asyncio.sleep(2)
                
                click.echo(f"   Found {current_count} results...")
            
            # Extract business data
            click.echo(f"📍 Extracting details from {len(items)} places...")
            
            for idx, item in enumerate(items[:max_results], 1):
                try:
                    # Click to open details
                    await item.click()
                    await asyncio.sleep(1.5)  # Wait for details to load
                    
                    # Extract data
                    business = await self.extract_business_data(page)
                    
                    if business:
                        self.results.append(business)
                        
                        # Progress
                        if idx % 10 == 0:
                            click.echo(f"   Processed {idx}/{min(len(items), max_results)}...")
                    
                except Exception as e:
                    click.echo(f"   ⚠️  Error extracting business {idx}: {str(e)}")
                    continue
            
            await browser.close()
            click.echo(f"✅ Successfully scraped {len(self.results)} leads")
            
            return self.results
    
    async def extract_business_data(self, page) -> Dict:
        """Extract business data from details panel"""
        try:
            business = {}
            
            # Name - try multiple selectors for reliability
            try:
                # Try the main heading in the details panel first
                name_elem = await page.query_selector('h1.DUwDvf')
                if not name_elem:
                    # Fallback to other possible selectors
                    name_elem = await page.query_selector('div[role="main"] h1')
                if not name_elem:
                    # Last resort - any h1 in the details area
                    name_elem = await page.query_selector('.m6QErb h1')
                
                business['name'] = await name_elem.inner_text() if name_elem else ''
            except:
                business['name'] = ''
            
            # Rating
            try:
                rating_elem = await page.query_selector('span[role="img"][aria-label*="stars"]')
                if rating_elem:
                    aria_label = await rating_elem.get_attribute('aria-label')
                    rating_match = re.search(r'([\d.]+) stars', aria_label)
                    business['rating'] = float(rating_match.group(1)) if rating_match else ''
                else:
                    business['rating'] = ''
            except:
                business['rating'] = ''
            
            # Review count
            try:
                reviews_elem = await page.query_selector('button[aria-label*="reviews"]')
                if reviews_elem:
                    aria_label = await reviews_elem.get_attribute('aria-label')
                    reviews_match = re.search(r'([\d,]+)\s+reviews', aria_label)
                    if reviews_match:
                        business['review_count'] = int(reviews_match.group(1).replace(',', ''))
                    else:
                        business['review_count'] = 0
                else:
                    business['review_count'] = 0
            except:
                business['review_count'] = 0
            
            # Address
            try:
                address_elem = await page.query_selector('button[data-item-id="address"]')
                business['address'] = await address_elem.get_attribute('aria-label') if address_elem else ''
            except:
                business['address'] = ''
            
            # Phone
            try:
                phone_elem = await page.query_selector('button[data-item-id*="phone"]')
                if phone_elem:
                    phone_aria = await phone_elem.get_attribute('aria-label')
                    # Extract phone from aria-label
                    phone_match = re.search(r'Phone:\s*(.+)', phone_aria)
                    business['phone'] = phone_match.group(1) if phone_match else ''
                else:
                    business['phone'] = ''
            except:
                business['phone'] = ''
            
            # Website
            try:
                website_elem = await page.query_selector('a[data-item-id="authority"]')
                if website_elem:
                    business['website'] = await website_elem.get_attribute('href')
                else:
                    business['website'] = ''
            except:
                business['website'] = ''
            
            # Category
            try:
                category_elem = await page.query_selector('button[jsaction*="category"]')
                business['category'] = await category_elem.inner_text() if category_elem else ''
            except:
                business['category'] = ''
            
            # Business status
            try:
                status_elem = await page.query_selector('span[class*="fontBodyMedium"]')
                status_text = await status_elem.inner_text() if status_elem else ''
                if 'Open' in status_text or 'Closed' in status_text:
                    business['business_status'] = 'OPERATIONAL'
                else:
                    business['business_status'] = ''
            except:
                business['business_status'] = ''
            
            # Google Place ID & Maps URL
            try:
                current_url = page.url
                place_id_match = re.search(r'!1s([^!]+)', current_url)
                place_id = place_id_match.group(1) if place_id_match else ''
                
                # If URL is still search results, construct direct link
                if '/search/' in current_url and place_id:
                    business['google_maps_url'] = f"https://www.google.com/maps/place/?q=place_id:{place_id}"
                else:
                    business['google_maps_url'] = current_url
                
                business['google_place_id'] = place_id
            except:
                business['google_maps_url'] = ''
                business['google_place_id'] = ''
            
            return business
            
        except Exception as e:
            click.echo(f"   Error extracting data: {str(e)}")
            return None


def calculate_quality_score(business: Dict) -> int:
    """Calculate data quality score (0-100)"""
    score = 0
    
    if business.get('name'): score += 30
    if business.get('address'): score += 20
    if business.get('phone'): score += 15
    if business.get('rating') and business.get('review_count', 0) >= 10: score += 15
    if business.get('website'): score += 10
    if business.get('google_place_id'): score += 10
    
    return score


@click.command()
@click.option('--location', '-l', required=True, help='Location to search (e.g., "Ho Chi Minh City")')
@click.option('--keyword', '-k', required=True, help='Business type (e.g., "coffee shop")')
@click.option('--output', '-o', default='leads.csv', help='Output CSV file')
@click.option('--max-results', '-m', default=100, type=int, help='Maximum results (default: 100)')
@click.option('--headless/--no-headless', default=True, help='Run browser in headless mode')
def scrape(location: str, keyword: str, output: str, max_results: int, headless: bool):
    """
    Scrape Google Maps for business leads (No API key required!)
    
    Examples:
    
        # Scrape coffee shops in HCMC
        python scrape_leads.py -l "Ho Chi Minh City" -k "coffee shop"
        
        # See browser while scraping
        python scrape_leads.py -l "Hanoi" -k "restaurant" --no-headless
        
        # Scrape up to 200 results
        python scrape_leads.py -l "Da Nang" -k "hotel" -m 200
    """
    
    click.echo("")
    click.echo("=" * 60)
    click.echo("🕷️  GOOGLE MAPS WEB SCRAPER")
    click.echo("=" * 60)
    click.echo("💰 FREE - No API key required!")
    click.echo("⚠️  Note: Slower than API but completely free")
    click.echo("=" * 60)
    click.echo("")
    
    try:
        # Create scraper
        scraper = GoogleMapsScraper(headless=headless)
        
        # Run async scraping
        leads = asyncio.run(
            scraper.scrape_places(location, keyword, max_results)
        )
        
        if not leads:
            click.echo("⚠️  No leads scraped. Exiting.")
            return
        
        # Calculate quality scores
        for lead in leads:
            lead['quality_score'] = calculate_quality_score(lead)
        
        # Convert to DataFrame
        df = pd.DataFrame(leads)
        df = df.sort_values('quality_score', ascending=False)
        
        # Reorder columns
        column_order = [
            'name', 'rating', 'review_count', 'quality_score',
            'phone', 'address', 'website', 'google_maps_url',
            'category', 'business_status',
            'google_place_id'
        ]
        
        column_order = [col for col in column_order if col in df.columns]
        df = df[column_order]
        
        # Export to CSV
        df.to_csv(output, index=False, encoding='utf-8-sig')
        
        # Summary
        click.echo("")
        click.echo("=" * 60)
        click.echo("📊 SCRAPING SUMMARY")
        click.echo("=" * 60)
        click.echo(f"Total leads scraped: {len(leads)}")
        click.echo(f"Average quality score: {df['quality_score'].mean():.1f}/100")
        click.echo(f"Leads with phone: {df['phone'].astype(bool).sum()} ({df['phone'].astype(bool).sum()/len(leads)*100:.0f}%)")
        click.echo(f"Leads with website: {df['website'].astype(bool).sum()} ({df['website'].astype(bool).sum()/len(leads)*100:.0f}%)")
        
        if df['rating'].astype(bool).any():
            avg_rating = df[df['rating'].astype(bool)]['rating'].mean()
            click.echo(f"Average rating: {avg_rating:.1f}⭐")
        
        click.echo(f"Output file: {output}")
        click.echo("=" * 60)
        click.echo("")
        click.echo("✅ Done! Open the CSV file to see your leads.")
        
    except Exception as e:
        click.echo(f"❌ Error: {str(e)}", err=True)
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    scrape()
