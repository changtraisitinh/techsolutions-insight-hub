"""
Web scraper module for Google Maps
Refactored from scrape_leads.py for API use
"""

import asyncio
from playwright.async_api import async_playwright
from typing import List, Dict
import re


class GoogleMapsScraper:
    """Scrape Google Maps using Playwright"""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.results = []
    
    async def scrape_places(self, location: str, keyword: str, max_results: int = 100) -> List[Dict]:
        """
        Scrape places from Google Maps
        
        Returns:
            List of business dictionaries with lead data
        """
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.headless)
            page = await browser.new_page()
            
            # Build search URL
            search_query = f"{keyword} in {location}"
            encoded_query = search_query.replace(' ', '+')
            url = f"https://www.google.com/maps/search/{encoded_query}"
            
            # Navigate
            await page.goto(url, wait_until='domcontentloaded', timeout=90000)
            await asyncio.sleep(5)
            
            # Get results panel
            results_panel = await page.query_selector('div[role="feed"]')
            
            if not results_panel:
                await browser.close()
                return []
            
            # Scroll to load results
            prev_count = 0
            scroll_attempts = 0
            max_scrolls = 10
            
            while scroll_attempts < max_scrolls:
                items = await results_panel.query_selector_all('div[role="article"]')
                current_count = len(items)
                
                if current_count >= max_results:
                    break
                
                if current_count == prev_count:
                    scroll_attempts += 1
                else:
                    scroll_attempts = 0
                
                prev_count = current_count
                await results_panel.evaluate('(element) => element.scrollTo(0, element.scrollHeight)')
                await asyncio.sleep(2)
            
            # Extract details
            for idx, item in enumerate(items[:max_results]):
                try:
                    await item.click()
                    await asyncio.sleep(1.5)
                    
                    business = await self.extract_business_data(page)
                    
                    if business:
                        # Calculate quality score
                        business['quality_score'] = self.calculate_quality_score(business)
                        self.results.append(business)
                    
                except Exception:
                    continue
            
            await browser.close()
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
                    business['rating'] = float(rating_match.group(1)) if rating_match else None
                else:
                    business['rating'] = None
            except:
                business['rating'] = None
            
            # Review count
            # Review count
            try:
                business['review_count'] = 0
                
                # Method 1: Check the rating stars aria-label (often contains "4.5 stars 123 reviews")
                if rating_elem:
                    stars_aria = await rating_elem.get_attribute('aria-label')
                    # Match "1,234 reviews" or "1.234 đánh giá" inside the stars label
                    combined_match = re.search(r'(\d[\d,.]*)\s+(?:reviews|đánh giá)', stars_aria, re.IGNORECASE)
                    if combined_match:
                        count_str = combined_match.group(1).replace(',', '').replace('.', '')
                        business['review_count'] = int(count_str)
                
                # Method 2: If not found, check specific review buttons/elements
                if business['review_count'] == 0:
                    # Selectors for the reviews count element
                    reviews_selectors = [
                        'button[aria-label*="reviews"]',
                        'button[aria-label*="đánh giá"]',
                        'span[aria-label*="reviews"]',
                        'span[aria-label*="đánh giá"]',
                        'div.F7kYSe', # Common class for review count parent
                        'span.F7kYSe' 
                    ]
                    
                    for selector in reviews_selectors:
                        elem = await page.query_selector(selector)
                        if elem:
                            # Try aria-label first
                            aria_label = await elem.get_attribute('aria-label')
                            if aria_label:
                                match = re.search(r'(\d[\d,.]*)\s+(?:reviews|đánh giá)', aria_label, re.IGNORECASE)
                                if match:
                                    count_str = match.group(1).replace(',', '').replace('.', '')
                                    business['review_count'] = int(count_str)
                                    break
                            
                            # Try inner text (often just "(123)" or "123")
                            text = await elem.inner_text()
                            # Match (123) or just 123 at the start strings
                            text_match = re.search(r'\(?(\d[\d,.]*)\)?', text)
                            if text_match:
                                # Ensure it looks like a number and not part of an address
                                possibly_number = text_match.group(1).replace(',', '').replace('.', '')
                                if possibly_number.isdigit() and len(possibly_number) < 7: # Sanity check < 1 million reviews usually
                                     business['review_count'] = int(possibly_number)
                                     break
            except Exception:
                pass # Default to 0 established at start
            
            # Address
            try:
                address_elem = await page.query_selector('button[data-item-id="address"]')
                if address_elem:
                    addr_text = await address_elem.get_attribute('aria-label')
                    # Remove "Address: " or "Địa chỉ: " prefix
                    business['address'] = addr_text.replace('Address:', '').replace('Địa chỉ:', '').strip() 
                else:
                    business['address'] = ''
            except:
                business['address'] = ''
            
            # Phone
            try:
                phone_elem = await page.query_selector('button[data-item-id*="phone"]')
                if phone_elem:
                    phone_aria = await phone_elem.get_attribute('aria-label')
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
                    business['business_status'] = status_text if status_text else ''
            except:
                business['business_status'] = ''
            
            # Google Place ID & Maps URL
            try:
                current_url = page.url
                place_id_match = re.search(r'!1s([^!]+)', current_url)
                place_id = place_id_match.group(1) if place_id_match else ''
                
                # If the URL is still a search/results page, construct a direct link using Place ID
                if '/search/' in current_url and place_id:
                    business['google_maps_url'] = f"https://www.google.com/maps/place/?q=place_id:{place_id}"
                else:
                    business['google_maps_url'] = current_url
                    
                business['google_place_id'] = place_id
            except:
                business['google_maps_url'] = ''
                business['google_place_id'] = ''
            
            return business
            
        except Exception:
            return None
    
    def calculate_quality_score(self, business: Dict) -> int:
        """Calculate data quality score (0-100)"""
        score = 0
        
        if business.get('name'): score += 30
        if business.get('address'): score += 20
        if business.get('phone'): score += 15
        if business.get('rating') and business.get('review_count', 0) >= 10: score += 15
        if business.get('website'): score += 10
        if business.get('google_place_id'): score += 10
        
        return score
