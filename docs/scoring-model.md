# Scoring Model

## Overview

The **Lead Scoring Engine** calculates a 0-100 score for each business, indicating:
- **Sales potential** (how likely to buy)
- **Urgency** (how soon they need a solution)
- **Value** (how profitable the deal)

**Key Principle:** Scores must be **explainable**—sales teams need to understand WHY a lead scored high or low.

---

## Scoring Philosophy

### What We Score

**NOT:** Business quality (we're not rating businesses)  
**YES:** Opportunity potential (how good a sales lead they are)

### Score Interpretation

| Score Range | Label | Meaning |
|------------|-------|---------|
| **90-100** | 🔥 Hot Lead | High urgency + high value, contact immediately |
| **75-89** | ⭐ Qualified Lead | Strong potential, worth prioritizing |
| **60-74** | ✅ Good Lead | Decent opportunity, nurture over time |
| **40-59** | ⚠️ Long Shot | Low priority, low conversion likelihood |
| **0-39** | ❌ Poor Fit | Not worth pursuing |

---

## Scoring Factors

### 1. Gap Analysis (60% of total score)

**Logic:** Bigger gaps = bigger opportunities

#### Website Gaps (0-30 points)
- **No website:** +30 pts (biggest opportunity)
- **Outdated website:** +20 pts
- **Slow website:** +15 pts
- **Not mobile-friendly:** +15 pts
- **No HTTPS:** +10 pts
- **Modern website:** +0 pts (no opportunity)

#### Digital Capability Gaps (0-40 points)
Industry-specific:

**F&B:**
- No online ordering: +40 pts
- No delivery integration: +25 pts
- No digital menu: +15 pts

**Logistics:**
- No fleet tracking: +35 pts
- No digital POD: +30 pts
- No customer portal: +20 pts

**Retail:**
- No e-commerce: +45 pts
- No POS system: +35 pts
- No inventory system: +25 pts

**Spa:**
- No online booking: +38 pts
- No loyalty program: +28 pts
- No CRM: +25 pts

#### Email/Communication Gaps (0-10 points)
- No email found: +5 pts
- Generic email only: +3 pts
- Professional email: +0 pts

---

### 2. Positive Signals (20% of total score)

**Logic:** Stronger businesses = better customers

#### Reputation (0-15 points)
- **4.5+ stars, 100+ reviews:** +5 pts (strong, but low urgency)
- **4.0-4.4 stars, 50+ reviews:** +10 pts (good, moderate urgency)
- **3.5-3.9 stars, 20+ reviews:** +15 pts (issues = need help)
- **<3.5 stars:** +5 pts (risky customer)
- **<10 reviews:** +12 pts (new, needs visibility)

#### Social Media Activity (0-15 points)
- **Active FB page + high engagement:** +15 pts (marketing-savvy)
- **FB page, low activity:** +10 pts (understands social, needs help)
- **No social media:** +5 pts (complete digital gap)

#### Business Maturity (0-10 points)
- **2-5 years old:** +10 pts (growth phase, ready to invest)
- **5-10 years old:** +5 pts (established, may be conservative)
- **<2 years:** +3 pts (too early, limited budget)
- **>10 years:** +0 pts (set in their ways)

---

### 3. Negative Signals (-20 to 0 points)

**Logic:** Some businesses are poor fits

#### Red Flags
- **Very low rating (<3.0 stars):** -10 pts (operations issues first)
- **Seasonal/temporary business:** -5 pts (low lifetime value)
- **Chain/franchise detected:** -15 pts (decisions made centrally)
- **Recent negative review trend:** -5 pts (crisis mode, bad timing)

---

## Score Calculation

### Formula

```
Total Score = Gap Score + Positive Signals - Negative Signals
```

### Example: Coffee Shop

| Factor | Points | Reasoning |
|--------|--------|-----------|
| **Gap Analysis** |
| No online ordering | +40 | Biggest F&B opportunity |
| No website | +30 | Major digital gap |
| No email | +5 | Minor gap |
| **Positive Signals** |
| Good reputation (4.3★, 80 reviews) | +10 | Credible, ready to invest |
| Active social media | +15 | Marketing-savvy owner |
| 3 years old | +10 | Growth phase |
| **Negative Signals** |
| None | 0 | Clean |
| **Total** | **110** | Capped at 100 → **100/100** 🔥 |

**Interpretation:** Hot lead! Strong business with major digital gaps = perfect customer.

---

## Industry-Specific Weights

### F&B Focus

```yaml
weights:
  online_ordering: 40  # Critical for F&B
  delivery_integration: 25
  website: 30
  reputation: 10
  social: 15
```

### Logistics Focus

```yaml
weights:
  fleet_tracking: 35  # Critical for logistics
  digital_pod: 30
  customer_portal: 20
  website: 25
  reputation: 10
```

### Retail Focus

```yaml
weights:
  ecommerce: 45  # Critical for retail
  pos_system: 35
  inventory: 25
  website: 30
  social: 15
```

### Spa Focus

```yaml
weights:
  online_booking: 38  # Critical for spa/beauty
  loyalty_program: 28
  crm: 25
  website: 30
  reputation: 15  # More important for service business
```

---

## Score Explainability

### Why Explainability Matters

Sales teams need to:
- **Prioritize** which leads to contact first
- **Personalize** pitch based on score breakdown
- **Build trust** by showing data-driven approach

### Explainer Output

```json
{
  "business_name": "Cà Phê Sáng",
  "total_score": 95,
  "label": "Hot Lead",
  "explanation": "This lead scored 95/100 because:",
  "score_breakdown": [
    {
      "factor": "No online ordering detected",
      "points": 40,
      "reason": "F&B businesses without online ordering lose 30% revenue"
    },
    {
      "factor": "No website found",
      "points": 30,
      "reason": "Complete digital gap = full transformation opportunity"
    },
    {
      "factor": "Active social media presence",
      "points": 15,
      "reason": "Marketing-savvy owner indicates tech readiness"
    },
    {
      "factor": "Strong reputation (4.7★, 120 reviews)",
      "points": 10,
      "reason": "Credible business ready to invest in growth"
    }
  ],
  "top_recommendation": "Lead with online ordering pitch (biggest revenue impact)",
  "estimated_deal_value": "$3,500-5,000"
}
```

---

## Dynamic Scoring

### Adjustable Weights

Customers can customize scoring weights:

```yaml
# Default F&B weights
default:
  online_ordering: 40
  website: 30
  delivery: 25
  reputation: 10

# Custom for agency targeting small cafes
custom_small_cafe:
  online_ordering: 50  # Even more critical
  website: 35          # Increased importance
  delivery: 20         # Less critical (may not need)
  reputation: 5        # Less important
```

### Context-Aware Scoring

Adjust based on:
- **Customer's service offerings** (what they sell influences what matters)
- **Geographic location** (urban vs. rural priorities differ)
- **Deal size preference** (enterprise vs. SME focus)
- **Sales capacity** (high volume vs. high touch)

---

## Scoring Quality Metrics

### Accuracy
- **Measure:** % of high-scoring leads that convert
- **Target:** 80%+ of 90-100 scores convert to meetings

### Calibration
- **Measure:** Distribution across score ranges
- **Target:** 10% hot (90-100), 30% qualified (75-89), 40% good (60-74), 20% poor (0-59)

### Feedback Loop
- **Collect:** Customer feedback on lead quality
- **Analyze:** Which scoring factors correlate with conversions
- **Iterate:** Adjust weights based on real-world performance

---

## Advanced Scoring (Future)

### Predictive Scoring (ML)
- Train model on conversion data
- Predict: Likelihood to buy, deal size, time to close
- Inputs: All current factors + historical patterns

### Behavior-Based Scoring
- Track: Website visits, email opens, content downloads
- Adjust score dynamically based on engagement
- Implement: Lead intelligence tracking

### Competitive Scoring
- Compare: Lead vs. competitors in same area
- Factor: How many competitors have better digital presence
- Insight: "This business is falling behind 5 nearby competitors"

---

## Scoring API

Future SDK will expose scoring:

```javascript
const { ScoreEngine } = require('@insight-hub/scoring-sdk');

const engine = new ScoreEngine({
  industry: 'fnb',
  weights: 'custom_small_cafe'
});

const score = engine.calculate({
  website: null,
  rating: 4.7,
  reviewCount: 120,
  hasOnlineOrdering: false,
  socialEngagement: 'high'
});

console.log(score);
// {
//   total: 95,
//   label: 'Hot Lead',
//   breakdown: [...],
//   recommendation: 'Lead with online ordering pitch'
// }
```

---

**Score smart. Sell smarter.**
