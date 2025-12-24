# Data Sources

## Overview

Insight Hub aggregates data from multiple sources to build a comprehensive business profile.

**Philosophy:** More data sources → richer insights → better actions

---

## Primary Data Sources

### 1. Google Maps (Core Source) 🗺️

**What We Extract:**
- Business name
- Full address
- Phone number
- Business category
- Rating (1-5 stars)
- Number of reviews
- Review text (sample)
- Business hours
- Popular times
- Photos (count)
- Website URL (if available)
- GPS coordinates

**Why Important:**
- ✅ Most comprehensive local business directory
- ✅ High data quality (user-verified)
- ✅ Covers 90%+ of Vietnamese SMEs
- ✅ Reviews show customer sentiment

**Technical Approach:**
- API: Google Places API (paid, rate-limited)
- Scraping: Selenium/Playwright (backup)
- Frequency: Weekly updates for active leads

**Data Quality:**
- Accuracy: 95%+
- Coverage: Excellent for cities, good for rural
- Freshness: Updated by businesses + users

**Limitations:**
- ⚠️ Not all businesses have websites listed
- ⚠️ Phone numbers sometimes outdated
- ⚠️ Categories can be generic

---

### 2. Website Analysis 🌐

**What We Extract:**
- Domain name and age
- Page load speed
- Mobile-friendliness
- SSL certificate (HTTPS)
- Technology stack (WordPress, Shopify, custom, etc.)
- Content quality (presence of key pages: About, Services, Contact)
- SEO basics (meta tags, headings)
- Online ordering presence
- Social media links
- Email addresses
- Contact forms

**Why Important:**
- ✅ Website quality indicates digital maturity
- ✅ Missing features = sales opportunities
- ✅ Tech stack shows budget and sophistication

**Technical Approach:**
- Tools: Puppeteer for page rendering
- Libraries: Wappalyzer for tech detection
- Metrics: Google Lighthouse for performance

**Insights Generated:**
- "No website" → Digital transformation opportunity
- "Slow website" → Performance optimization candidate
- "WordPress + old theme" → Redesign opportunity
- "No HTTPS" → Security upgrade needed

**Limitations:**
- ⚠️ Some businesses block automated access
- ⚠️ Dynamic websites need JavaScript rendering

---

### 3. Email Discovery 📧

**What We Extract:**
- Email addresses from website (contact page, footer)
- Email format patterns (info@, contact@, etc.)
- Email validation (MX record check)

**Why Important:**
- ✅ Email presence = professional business
- ✅ Contact email = outreach channel
- ✅ Generic emails (info@) vs. personal = insight into business size

**Technical Approach:**
- Web scraping for visible emails
- Hunter.io API (optional, paid)
- Email validation via SMTP check

**Limitations:**
- ⚠️ Many businesses only list phone/Facebook
- ⚠️ Emails can be outdated

---

### 4. Social Media Presence 📱

**What We Extract:**

#### Facebook
- Page URL
- Follower count
- Post frequency
- Engagement (likes, comments, shares)
- Response time
- Reviews and ratings

#### Zalo
- Zalo Official Account (OA) presence
- Follower count (if public)

#### Instagram (for relevant industries)
- Profile URL
- Follower count
- Post frequency

**Why Important:**
- ✅ Social activity = digital savviness
- ✅ Engagement = brand strength
- ✅ Response time = customer service quality

**Technical Approach:**
- Facebook Graph API (limited access)
- Web scraping for public data
- Manual verification for pilot projects

**Insights Generated:**
- "Active Facebook + no website" → Website opportunity
- "High engagement" → Strong brand, ready for advanced tools
- "Slow response time" → Chatbot/automation opportunity

**Limitations:**
- ⚠️ Facebook API access is restricted
- ⚠️ Requires careful scraping to avoid blocks

---

### 5. Business Registration Data (Future) 📄

**What We Extract:**
- Business registration number
- Legal entity name
- Registration date (business age)
- Owner name
- Registered capital

**Why Important:**
- ✅ Verify business legitimacy
- ✅ Business age = stability indicator
- ✅ Registered capital = size indicator

**Technical Approach:**
- Vietnam National Business Registration Portal
- Paid data providers (Vietnam Business Registry)

**Status:** Phase 2 feature (not MVP)

---

## Secondary Data Sources

### 6. Tech Stack Detection 🔧

**What We Detect:**
- CMS: WordPress, Wix, Shopify, custom
- E-commerce: Shopify, WooCommerce, Haravan
- Analytics: Google Analytics, Facebook Pixel
- Hosting: Cloudflare, AWS, local providers
- Email marketing: Mailchimp, SendGrid
- CRM: HubSpot, Salesforce (rare for SMEs)

**Why Important:**
- ✅ Current tech = budget and sophistication
- ✅ Missing tools = upsell opportunities
- ✅ Outdated tech = upgrade opportunities

**Technical Approach:**
- Wappalyzer library
- HTTP header analysis
- JavaScript library detection

---

### 7. Review Sentiment Analysis 📊

**What We Analyze:**
- Review text from Google Maps
- Sentiment: Positive, Neutral, Negative
- Common keywords
- Pain points mentioned

**Why Important:**
- ✅ Reviews reveal customer experience
- ✅ Pain points = solution opportunities
- ✅ Sentiment = business health indicator

**Technical Approach:**
- Vietnamese NLP models (PhoBERT)
- Keyword extraction
- Sentiment scoring

**Status:** Phase 2-3 feature

---

### 8. Competitor Intelligence (Future) 🔍

**What We Track:**
- Nearby competitors (same category)
- Price comparisons (if available)
- Service offerings
- Marketing strategies

**Why Important:**
- ✅ Competitive pressure = urgency
- ✅ Benchmark against competitors

**Status:** Phase 3+ feature

---

## Data Pipeline Architecture

```
[Google Maps API/Scraper]
          ↓
  [Raw Lead Data]
          ↓
  [Data Normalizer] → Clean, validate, deduplicate
          ↓
  [Lead Database - PostgreSQL]
          ↓
  [Enrichment Queue]
          ↓
┌─────────┴─────────┬──────────────┬─────────────┐
↓                    ↓              ↓             ↓
[Website Analyzer]  [Email Finder] [Social Scout] [Tech Detector]
          ↓
  [Enriched Lead Data]
          ↓
  [Insight Engine] ⭐
          ↓
  [Scored Leads + Insights]
```

---

## Data Refresh Strategy

### Initial Load
- Extract all available data sources

### Ongoing Updates
- **Google Maps:** Monthly (check for new businesses, updated info)
- **Website Analysis:** Quarterly (websites don't change often)
- **Social Media:** Monthly (activity changes more frequently)
- **Reviews:** Monthly (new reviews add insight)

### Triggered Updates
- Customer request
- Lead becomes active (moved to CRM)
- Low data quality score

---

## Data Quality Assurance

### Validation Rules
- ✅ Phone numbers must match Vietnamese format
- ✅ Addresses must include city/district
- ✅ Emails must pass MX record check
- ✅ Websites must be accessible (HTTP 200)
- ✅ Social URLs must match platform format

### Quality Score
Each lead gets a data quality score (0-100):
- **90-100:** Complete data, verified
- **70-89:** Good data, some gaps
- **50-69:** Partial data, usable
- **< 50:** Incomplete, needs manual review

---

## Privacy & Compliance

### Data Collection
- ✅ Only collect publicly available data
- ✅ No scraping of private/gated content
- ✅ Respect robots.txt

### Data Storage
- ✅ Secure storage (encrypted at rest)
- ✅ Access controls
- ✅ Audit logs

### Data Usage
- ✅ Used only for business intelligence
- ✅ No selling of raw data
- ✅ Anonymized in benchmarks

### Compliance
- ✅ Vietnam Personal Data Protection Decree
- ✅ GDPR (for any EU data subjects)
- ✅ Terms of service for all data sources

---

## Future Data Sources

### Under Consideration
- LinkedIn (for B2B)
- E-commerce platforms (Shopee, Lazada storefronts)
- Job postings (hiring = growth signal)
- News mentions (PR activity)
- Government contracts (for B2G businesses)

---

**More data sources = richer insights. We prioritize sources with the best signal-to-noise ratio.**
