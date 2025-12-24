# Lead Enrichment Service

## Overview

The **Lead Enrichment Service** enhances raw business leads with additional data points from various sources.

**Role in Pipeline:** Second step—transforms raw leads into enriched profiles

---

## Responsibilities

1. **Website Analysis**
   - Detect website presence
   - Analyze page performance
   - Identify technology stack
   - Check SEO basics

2. **Email Discovery**
   - Extract emails from websites
   - Validate email addresses
   - Identify email patterns

3. **Social Media Detection**
   - Find Facebook pages
   - Detect Zalo Official Accounts
   - Discover Instagram profiles
   - Measure engagement

4. **Tech Stack Identification**
   - CMS detection (WordPress, Shopify, etc.)
   - E-commerce platforms
   - Analytics tools
   - Marketing tools

---

## Technical Architecture

### Directory Structure

```
lead-enrichment/
├── website-analyzer/
│   ├── scraper.go
│   ├── performance.go
│   └── seo.go
├── email-detector/
│   ├── extractor.go
│   └── validator.go
├── social-finder/
│   ├── facebook.go
│   ├── zalo.go
│   └── instagram.go
├── tech-stack-detector/
│   ├── wappalyzer.go
│   └── headers.go
├── models/
│   └── enriched_lead.go
├── tests/
├── config/
├── Dockerfile
└── README.md
```

---

## Data Model

### Enriched Lead

```json
{
  "business_id": "uuid",
  "enrichment_status": "completed",
  "enrichment_date": "2024-12-24T11:00:00Z",
  
  "website": {
    "url": "https://cafesang.vn",
    "has_website": true,
    "has_ssl": true,
    "page_load_time": 2.1,
    "mobile_friendly": true,
    "seo_score": 75,
    "tech_stack": {
      "cms": "WordPress",
      "ecommerce": null,
      "analytics": ["Google Analytics"],
      "hosting": "Cloudflare"
    }
  },
  
  "email": {
    "primary": "contact@cafesang.vn",
    "validated": true,
    "type": "generic"
  },
  
  "social": {
    "facebook": {
      "url": "https://facebook.com/cafesang",
      "followers": 5200,
      "engagement_rate": 4.2,
      "last_post": "2024-12-20"
    },
    "zalo": {
      "has_oa": true,
      "followers": 1200
    },
    "instagram": {
      "url": "https://instagram.com/cafesang",
      "followers": 3100
    }
  },
  
  "enrichment_score": 90
}
```

---

## API Endpoints

### POST /api/v1/enrich

Enrich a single lead.

**Request:**
```json
{
  "business_id": "uuid",
  "priority": "high"
}
```

**Response:**
```json
{
  "business_id": "uuid",
  "status": "completed",
  "enrichment_data": {...}
}
```

---

### POST /api/v1/enrich/batch

Enrich multiple leads.

**Request:**
```json
{
  "business_ids": ["uuid1", "uuid2", "uuid3"],
  "priority": "normal"
}
```

**Response:**
```json
{
  "job_id": "enrich_job_123",
  "queued": 3,
  "estimated_time": "5 minutes"
}
```

---

## Enrichment Strategies

### 1. Website Analysis

#### Detection
- Check if URL from Google Maps is valid
- Try common patterns (businessname.vn, businessname.com.vn)
- Search Google for "[Business Name] [Location] website"

#### Performance Testing
```javascript
// Using Lighthouse / web-vitals
{
  "page_load_time": 2.1,  // seconds
  "first_contentful_paint": 0.8,
  "largest_contentful_paint": 1.5,
  "cumulative_layout_shift": 0.05,
  "mobile_friendly": true
}
```

#### Tech Stack Detection
- Use Wappalyzer library
- Analyze HTTP headers
- Check JavaScript libraries
- Identify CSS frameworks

---

### 2. Email Discovery

#### Extraction Methods
1. **Website Scraping**
   - Parse contact pages
   - Check footer
   - Look for mailto: links

2. **Pattern Matching**
   ```
   Common patterns:
   - info@domain.com
   - contact@domain.com
   - hello@domain.com
   - [businessname]@gmail.com
   ```

3. **Validation**
   - MX record check
   - SMTP verification (without sending)
   - Catch-all detection

---

### 3. Social Media Discovery

#### Facebook
```javascript
// Search pattern
https://www.facebook.com/search/pages/?q=[Business Name] [Location]

// Data to extract
{
  "page_url": "...",
  "followers": 5200,
  "posts_per_week": 3,
  "avg_likes": 50,
  "avg_comments": 5,
  "response_time": "within hours"
}
```

#### Zalo
- Check for Zalo OA link on website
- Search Zalo directory (if available)

#### Instagram
- Common pattern: instagram.com/[businessname]
- Check website for Instagram widget

---

### 4. Tech Stack Detection

#### Key Signals

**CMS:**
- WordPress: `/wp-content/` paths, meta generator tag
- Shopify: `cdn.shopify.com`
- Wix: `wix.com` in HTML

**E-commerce:**
- Shopify: `.myshopify.com`
- WooCommerce: `woocommerce` JavaScript
- Haravan: `haravan.com`

**Analytics:**
- Google Analytics: `ga.js` or `gtag.js`
- Facebook Pixel: `fbevents.js`

**Hosting:**
- Cloudflare: CF headers
- AWS: `.amazonaws.com`

---

## Enrichment Priority

### High Priority (Immediate)
- Hot leads (score 90+)
- VIP customers
- Manually requested

### Normal Priority (Queue)
- Qualified leads (score 75-89)
- Batch enrichment jobs

### Low Priority (Scheduled)
- Good leads (score 60-74)
- Re-enrichment of old data

---

## Error Handling

### Common Failures

1. **Website Unreachable**
   - Retry with different User-Agent
   - Try HTTPS and HTTP
   - Mark as "no website" if fails

2. **Email Not Found**
   - Not an error, just mark as null
   - Try alternative discovery methods

3. **Social Media Not Found**
   - Not an error, mark as null
   - Some businesses don't use social

4. **Rate Limiting**
   - Respect robots.txt
   - Add delays between requests
   - Use proxy if needed

---

## Data Quality

### Enrichment Score (0-100)

```javascript
score = 
  + 40 (website found and analyzed)
  + 20 (email found and validated)
  + 20 (Facebook found with data)
  + 10 (Instagram found)
  + 10 (Tech stack identified)
```

**Target:** 70%+ of leads score 60+

---

## Performance

### Enrichment Speed
- **Website analysis:** 3-5 seconds per lead
- **Email discovery:** 2-3 seconds
- **Social finding:** 5-10 seconds
- **Total:** 10-18 seconds per lead

### Throughput
- **Sequential:** 200-350 leads/hour
- **Parallel (10 workers):** 2,000-3,500 leads/hour

---

## Configuration

### config.yaml

```yaml
enrichment:
  workers: 10
  timeout: 30s
  retry_attempts: 2
  
  website:
    lighthouse: true
    screenshot: false
    user_agent: "Insight Hub Bot 1.0"
  
  email:
    verify_smtp: true
    hunter_api_key: "${HUNTER_API_KEY}"  # optional
  
  social:
    facebook_token: "${FB_TOKEN}"  # optional for Graph API
    instagram_scraping: true
  
  cache:
    enabled: true
    ttl: 7d  # Re-enrich after 7 days
```

---

## Development

### Setup

```bash
cd services/lead-enrichment
npm install  # or go mod download

# Configure
cp .env.example .env
# Edit .env with API keys

# Run
npm run dev  # or go run main.go
```

### Testing

```bash
# Test single enrichment
curl -X POST http://localhost:8002/api/v1/enrich \
  -d '{"business_id":"uuid","priority":"high"}'

# Check results
curl http://localhost:8002/api/v1/leads/uuid/enrichment
```

---

## Monitoring

### Metrics
- **Enrichment rate:** Leads per hour
- **Success rate:** % with usable data
- **Coverage:** % with website, email, social
- **Performance:** Average enrichment time

### Alerts
- ⚠️ Enrichment rate drops below 100/hour
- ⚠️ Success rate < 60%
- ⚠️ Timeout rate > 5%

---

## Privacy & Compliance

### Data Collection
- ✅ Only public data
- ✅ Respect robots.txt
- ✅ Rate limiting to avoid abuse

### Data Storage
- ✅ Encrypted at rest
- ✅ Audit logs
- ✅ GDPR-compliant deletion

---

## Roadmap

### v1.0 (MVP)
- ✅ Website analysis
- ✅ Email discovery
- ✅ Basic social detection

### v1.1
- ✅ Tech stack detection
- ✅ Performance metrics
- ✅ Parallel processing

### v2.0
- ✅ AI-powered content analysis
- ✅ Competitor detection
- ✅ Review sentiment analysis

---

**Rich data = better insights. Enrich well.**
