# Insight Framework

## Philosophy

**Insight Hub transforms raw data into actionable business intelligence.**

An **insight** is not just data—it's a contextualized observation that leads to a specific action.

---

## What Makes a Good Insight?

### ✅ Actionable
**Bad:** "This business has no website"  
**Good:** "This coffee shop has no website but 4.5★ reviews → **Digital transformation opportunity** → Pitch website + online ordering"

### ✅ Contextualized
**Bad:** "Rating: 4.2 stars"  
**Good:** "Rating 4.2★ is above industry average (3.8★) → **Strong reputation** → Premium pricing opportunity"

### ✅ Prioritized
**Bad:** "Needs website, CRM, analytics…"  
**Good:** "**Top priority:** No online ordering (loses 30% revenue) → **Secondary:** Website redesign"

---

## Insight Generation Process

```
Raw Data → Enrichment → Rules → Context → Insight → Action
```

### Step 1: Data Collection
From multiple sources: Google Maps, website, social media

### Step 2: Enrichment
Add derived data: website quality score, social engagement rate

### Step 3: Rule Evaluation
Apply industry-specific rules (see Rule Library below)

### Step 4: Contextualization
Add benchmarks, industry standards, market trends

### Step 5: Insight Output
Generate human-readable insight + recommended action

---

## Rule Library

Rules are defined in YAML format for easy customization.

### Example: Website Rules

**File:** `services/insight-engine/rules/website.rules.yaml`

```yaml
rules:
  - id: no-website
    name: "No Website Detected"
    condition: "website_url == null"
    insight: "Business has no website"
    opportunity: "Digital transformation"
    action: "Pitch website development + online presence package"
    priority: high
    score_impact: +30

  - id: slow-website
    name: "Slow Website Performance"
    condition: "page_load_time > 3.0"
    insight: "Website loads in {page_load_time}s (target: <3s)"
    opportunity: "Performance optimization"
    action: "Offer website speed optimization service"
    priority: medium
    score_impact: +15

  - id: no-mobile
    name: "Not Mobile-Friendly"
    condition: "mobile_friendly == false"
    insight: "Website not optimized for mobile (60% of traffic is mobile)"
    opportunity: "Mobile optimization"
    action: "Pitch responsive redesign"
    priority: high
    score_impact: +25

  - id: no-https
    name: "No SSL Certificate"
    condition: "has_ssl == false"
    insight: "Website lacks HTTPS (security risk, SEO penalty)"
    opportunity: "Security upgrade"
    action: "Offer SSL certificate + migration"
    priority: medium
    score_impact: +10
```

### Example: Email Rules

**File:** `services/insight-engine/rules/email.rules.yaml`

```yaml
rules:
  - id: no-email
    name: "No Email Contact"
    condition: "email == null"
    insight: "No email contact found (only phone/Facebook)"
    opportunity: "Professional communication"
    action: "Pitch email setup + G Suite/Office 365"
    priority: low
    score_impact: +5

  - id: generic-email
    name: "Generic Email Address"
    condition: "email matches 'info@|contact@|admin@'"
    insight: "Uses generic email (professional but not personal)"
    opportunity: "Personal branding"
    action: "Recommend branded email (owner@company.com)"
    priority: low
    score_impact: +3
```

### Example: Reputation Rules

**File:** `services/insight-engine/rules/reputation.rules.yaml`

```yaml
rules:
  - id: high-rating
    name: "Strong Reputation"
    condition: "rating >= 4.5 AND review_count >= 50"
    insight: "Excellent reputation ({rating}★ with {review_count} reviews)"
    opportunity: "Leverage credibility for growth"
    action: "Ready for advanced tools (CRM, automation)"
    priority: low
    score_impact: -10  # Negative because low urgency

  - id: low-rating
    name: "Reputation Risk"
    condition: "rating < 3.5 AND review_count >= 20"
    insight: "Low rating ({rating}★) indicates service issues"
    opportunity: "Operations improvement"
    action: "Offer customer experience consulting before tech"
    priority: high
    score_impact: +20

  - id: few-reviews
    name: "Limited Social Proof"
    condition: "review_count < 10"
    insight: "Few reviews ({review_count}) → limited credibility"
    opportunity: "Review generation campaign"
    action: "Pitch review collection tools/strategy"
    priority: medium
    score_impact: +12
```

---

## Industry-Specific Insights

Each industry has custom rules based on sector-specific needs.

### F&B (Food & Beverage)

**Focus Areas:**
- Online ordering capability
- Delivery integration (GrabFood, ShopeeFood)
- Menu digitization
- Table reservation system

**Example Rule:**
```yaml
- id: fnb-no-online-ordering
  name: "No Online Ordering"
  condition: "industry == 'fnb' AND has_online_ordering == false"
  insight: "No online ordering (missing 30% revenue opportunity)"
  opportunity: "E-commerce for F&B"
  action: "Pitch online ordering system + delivery integration"
  priority: high
  score_impact: +40
```

---

### Logistics

**Focus Areas:**
- Fleet tracking
- Route optimization
- Digital documentation (POD, invoices)
- Customer portal

**Example Rule:**
```yaml
- id: logistics-no-tracking
  name: "No Fleet Tracking"
  condition: "industry == 'logistics' AND mentions tracking == false"
  insight: "No visible fleet tracking system"
  opportunity: "Operations efficiency"
  action: "Pitch GPS tracking + route optimization"
  priority: high
  score_impact: +35
```

---

### Retail

**Focus Areas:**
- E-commerce presence
- POS system
- Inventory management
- Omnichannel integration

**Example Rule:**
```yaml
- id: retail-no-ecommerce
  name: "No E-commerce"
  condition: "industry == 'retail' AND has_ecommerce == false"
  insight: "Physical-only retail (missing online sales channel)"
  opportunity: "Omnichannel expansion"
  action: "Pitch e-commerce platform (Shopify/Haravan)"
  priority: high
  score_impact: +45
```

---

### Spa & Beauty

**Focus Areas:**
- Online booking system
- Customer loyalty program
- Treatment database
- Marketing automation

**Example Rule:**
```yaml
- id: spa-no-booking
  name: "No Online Booking"
  condition: "industry == 'spa' AND has_booking_system == false"
  insight: "Phone-only booking (inefficient, high no-show rate)"
  opportunity: "Booking automation"
  action: "Pitch online booking + reminder system"
  priority: high
  score_impact: +38
```

---

## Insight Output Format

### JSON Structure

```json
{
  "business_id": "b12345",
  "business_name": "Cà Phê Sáng",
  "industry": "fnb",
  "insights": [
    {
      "rule_id": "no-website",
      "priority": "high",
      "insight": "Business has no website",
      "opportunity": "Digital transformation",
      "action": "Pitch website development + online presence package",
      "score_impact": 30
    },
    {
      "rule_id": "high-rating",
      "priority": "low",
      "insight": "Excellent reputation (4.7★ with 120 reviews)",
      "opportunity": "Leverage credibility for growth",
      "action": "Ready for advanced tools (CRM, automation)",
      "score_impact": -10
    },
    {
      "rule_id": "fnb-no-online-ordering",
      "priority": "high",
      "insight": "No online ordering (missing 30% revenue opportunity)",
      "opportunity": "E-commerce for F&B",
      "action": "Pitch online ordering system + delivery integration",
      "score_impact": 40
    }
  ],
  "total_score": 85,
  "score_breakdown": {
    "website_gap": 30,
    "reputation": -10,
    "online_ordering_gap": 40,
    "social_presence": 15,
    "email_contact": 5,
    "business_age": 5
  },
  "top_priority_action": "Pitch online ordering system + delivery integration",
  "recommended_package": "F&B Digital Starter Pack"
}
```

### Markdown Summary

```markdown
# Business Insight Report: Cà Phê Sáng

**Lead Score:** 85/100 (High Potential)

## Top Opportunities

### 🔥 Priority 1: Online Ordering System
- **Insight:** No online ordering detected
- **Impact:** Missing 30% revenue opportunity
- **Recommendation:** Pitch online ordering + delivery integration (GrabFood, ShopeeFood)
- **Package:** F&B Digital Starter Pack ($3,500)

### 🔥 Priority 2: Website Development
- **Insight:** No website found
- **Impact:** Low digital visibility, harder to attract new customers
- **Recommendation:** Professional website + menu digitization
- **Package:** Website + SEO ($2,000)

## Strengths

### ✅ Strong Reputation
- 4.7★ rating with 120 reviews
- Consistent positive feedback
- High customer loyalty
- **Implication:** Good foundation for digital transformation

### ✅ Active Social Media
- Active Facebook page (5K followers)
- Regular posts (3x per week)
- Good engagement rate (4%)
- **Implication:** Marketing-savvy owner, tech-ready

## Score Breakdown

| Factor | Score | Weight |
|--------|-------|--------|
| Online Ordering Gap | +40 | High Priority |
| Website Gap | +30 | High Priority |
| Social Presence | +15 | Positive Signal |
| Reputation Strength | -10 | Low Urgency |
| Email Contact | +5 | Nice to Have |
| Business Maturity | +5 | Stability |
| **Total** | **85/100** | **High Potential** |

## Next Steps

1. **Research package pricing** for this business size
2. **Prepare pitch email** highlighting revenue loss
3. **Schedule demo call** to show online ordering ROI
4. **Follow-up timeline:** Week 1 email, Week 2 call, Week 3 demo

---

*Generated by Insight Hub on 2024-12-24*
```

---

## Insight Quality Metrics

We measure insight quality by:

### Accuracy
- % of insights validated by customers
- Target: 80%+

### Actionability
- % of insights that lead to sales conversations
- Target: 60%+

### Conversion Impact
- Revenue attributed to insight-driven pitches
- Target: 3x higher than generic outreach

---

## Continuous Improvement

### Feedback Loop
1. Customer validates insights (thumbs up/down)
2. Track which insights lead to deals
3. Adjust rule weights and priorities
4. Add new rules based on customer requests

### A/B Testing
- Test different insight phrasing
- Measure response rates
- Optimize for conversion

---

**Good insights drive action. Great insights drive revenue.**
