# Scoring Engine

## Overview

The **Scoring Engine** calculates a 0-100 score for each business lead, indicating sales potential and priority.

**Key Principle:** Scores must be explainable—sales teams need to know WHY a lead scored high or low.

---

## Responsibilities

1. **Score Calculation**
   - Combine gap analysis + positive signals - negative signals
   - Apply industry-specific weights
   - Cap score at 100

2. **Score Explanation**
   - Break down score into components
   - Show contribution of each factor
   - Provide actionable context

3. **Lead Prioritization**
   - Rank leads by score
   - Apply filters (min score, max results)
   - Group by urgency level

4. **Dynamic Weighting**
   - Load industry-specific weights
   - Allow customer customization
   - A/B test weight variations

---

## Technical Architecture

### Directory Structure

```
scoring-engine/
├── models/
│   ├── score.go
│   └── weights.go
├── calculators/
│   ├── gap_calculator.go
│   ├── signal_calculator.go
│   └── total_calculator.go
├── weights/
│   ├── default.yaml
│   ├── fnb.yaml
│   ├── logistics.yaml
│   └── retail.yaml
├── score-explainer/
│   ├── explainer.go
│   └── templates/
│       └── explanation.md
├── tests/
├── config/
├── Dockerfile
└── README.md
```

---

## Scoring Formula

```
Total Score = (Gap Score + Positive Signals - Negative Signals)
Capped at 0-100
```

### Gap Score (0-60 points)

**Logic:** Bigger gaps = bigger opportunities

```yaml
gap_weights:
  website_gap: 30
  online_ordering_gap: 40  # F&B specific
  email_gap: 5
  fleet_tracking_gap: 35   # Logistics specific
```

### Positive Signals (0-40 points)

**Logic:** Stronger businesses = better customers

```yaml
positive_weights:
  reputation: 15
  social_engagement: 15
  business_maturity: 10
```

### Negative Signals (-20 to 0 points)

**Logic:** Red flags reduce score

```yaml
negative_weights:
  low_rating: -10
  franchise_detected: -15
  seasonal_business: -5
```

---

## Industry-Specific Weights

### F&B

**File:** `weights/fnb.yaml`

```yaml
industry: fnb

gaps:
  online_ordering: 40      # Critical for F&B
  delivery_integration: 25
  website: 30
  digital_menu: 15
  email: 5

positives:
  reputation: 10
  social_media: 15
  business_age: 10

negatives:
  low_rating: -10
  franchise: -15
```

### Logistics

**File:** `weights/logistics.yaml`

```yaml
industry: logistics

gaps:
  fleet_tracking: 35       # Critical for logistics
  digital_pod: 30
  customer_portal: 20
  website: 25
  email: 10

positives:
  reputation: 10
  fleet_size: 15
  business_age: 10

negatives:
  poor_reviews: -15
  seasonal: -10
```

---

## Score Calculation Example

### Input: Coffee Shop Lead

```json
{
  "business_id": "uuid",
  "industry": "fnb",
  "data": {
    "website_url": null,
    "has_online_ordering": false,
    "rating": 4.7,
    "review_count": 120,
    "facebook_engagement": 4.2,
    "business_age_years": 3
  }
}
```

### Calculation

```javascript
// Gap Analysis
website_gap: +30  (no website)
online_ordering_gap: +40  (no online ordering)
email_gap: +5  (no email)
gap_total: 75

// Positive Signals
reputation: +10  (4.7★ with 120 reviews = good)
social_media: +15  (4.2% engagement = active)
business_age: +10  (3 years = growth phase)
positive_total: 35

// Negative Signals
none: 0

// Total
total: 75 + 35 - 0 = 110
capped: min(110, 100) = 100
```

### Output

```json
{
  "business_id": "uuid",
  "score": 100,
  "label": "🔥 Hot Lead",
  
  "breakdown": {
    "gaps": {
      "website": 30,
      "online_ordering": 40,
      "email": 5,
      "subtotal": 75
    },
    "positives": {
      "reputation": 10,
      "social_media": 15,
      "business_age": 10,
      "subtotal": 35
    },
    "negatives": {
      "subtotal": 0
    },
    "total": 100
  },
  
  "explanation": {
    "summary": "This lead scored 100/100 (Hot Lead) because:",
    "factors": [
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
    ]
  },
  
  "recommendation": "Lead with online ordering pitch (biggest revenue impact)"
}
```

---

## API Endpoints

### POST /api/v1/score

Calculate score for a single lead.

**Request:**
```json
{
  "business_id": "uuid",
  "industry": "fnb",
  "custom_weights": null  // optional
}
```

**Response:** See output example above

---

### POST /api/v1/score/batch

Score multiple leads.

**Request:**
```json
{
  "business_ids": ["uuid1", "uuid2", "uuid3"],
  "industry": "fnb",
  "filters": {
    "min_score": 75
  }
}
```

**Response:**
```json
{
  "scored": 3,
  "filtered": 1,
  "results": [
    {"business_id": "uuid1", "score": 100},
    {"business_id": "uuid2", "score": 85}
  ]
}
```

---

### GET /api/v1/leaderboard

Get top-scoring leads.

**Query Params:**
- `industry`: Filter by industry
- `min_score`: Minimum score (default: 0)
- `limit`: Max results (default: 100)

**Response:**
```json
{
  "leads": [
    {
      "business_id": "uuid1",
      "business_name": "Cà Phê Sáng",
      "score": 100,
      "label": "🔥 Hot Lead"
    },
    {
      "business_id": "uuid2",
      "business_name": "Phở 24",
      "score": 95,
      "label": "🔥 Hot Lead"
    }
  ],
  "total": 2,
  "avg_score": 97.5
}
```

---

## Score Labels

| Score Range | Label | Emoji | Action |
|------------|-------|-------|--------|
| 90-100 | Hot Lead | 🔥 | Contact immediately |
| 75-89 | Qualified Lead | ⭐ | Prioritize |
| 60-74 | Good Lead | ✅ | Nurture |
| 40-59 | Long Shot | ⚠️ | Low priority |
| 0-39 | Poor Fit | ❌ | Skip |

---

## Custom Weights

### Use Case: Small Cafe Focus

Customer wants to target small cafes specifically.

**Custom Weights:**
```yaml
# More emphasis on low-tech gaps
gaps:
  online_ordering: 50  # Increased from 40
  website: 35          # Increased from 30
  
# Less emphasis on reputation
positives:
  reputation: 5        # Decreased from 10
```

### API Usage

```bash
curl -X POST http://localhost:8004/api/v1/score \
  -d '{
    "business_id": "uuid",
    "industry": "fnb",
    "custom_weights": {
      "gaps": {"online_ordering": 50, "website": 35},
      "positives": {"reputation": 5}
    }
  }'
```

---

## Score Validation

### Metrics

**Accuracy:** % of high scores that convert to meetings

```
Conversion Rate by Score Range:
- 90-100: 80%+ should book meeting
- 75-89: 50%+ should book meeting
- 60-74: 30%+ should book meeting
```

**Calibration:** Distribution across score ranges

```
Target Distribution:
- 90-100 (Hot): 10%
- 75-89 (Qualified): 30%
- 60-74 (Good): 40%
- 0-59 (Poor): 20%
```

### Feedback Loop

```bash
# Report conversion outcome
POST /api/v1/feedback
{
  "business_id": "uuid",
  "outcome": "meeting_booked",  # or "no_response", "not_interested"
  "score_at_time": 95
}
```

**System Response:**
- Track conversion rates by score range
- Adjust weights if calibration is off
- Alert if accuracy drops below target

---

## A/B Testing Weights

### Experiment: More Weight on Social Media

**Hypothesis:** Businesses with active social are easier to convert

**Setup:**
```yaml
# Control (default)
control:
  social_media: 15

# Variant
variant:
  social_media: 25  # Increased
  reputation: 5     # Decreased to compensate
```

**Measurement:**
- Split leads 50/50
- Track conversion rates
- Compare after 100 conversions

---

## Configuration

### config.yaml

```yaml
scoring:
  default_industry: "general"
  weights_path: "./weights"
  
  score_range:
    min: 0
    max: 100
  
  labels:
    hot: 90
    qualified: 75
    good: 60
    long_shot: 40
  
  caching:
    enabled: true
    ttl: 1h  # Re-score hourly to catch data updates
```

---

## Performance

### Calculation Speed
- **Single lead:** 5-10ms
- **Batch scoring:** 20-50ms for 100 leads
- **Leaderboard query:** 100-200ms

---

## Monitoring

### Metrics
- **Scoring rate:** Leads per second
- **Score distribution:** Check calibration
- **Conversion correlation:** High scores → high conversion
- **Performance:** Latency p50, p95, p99

### Alerts
- ⚠️ Score distribution skewed (>20% hot or <5% hot)
- ⚠️ Conversion rate drops below target
- ⚠️ Calculation latency > 50ms (p95)

---

## Development

### Setup

```bash
cd services/scoring-engine
go mod download

# Run
go run cmd/server/main.go
```

### Testing

```bash
# Score single lead
curl -X POST http://localhost:8004/api/v1/score \
  -d '{"business_id":"uuid","industry":"fnb"}'

# Get leaderboard
curl "http://localhost:8004/api/v1/leaderboard?industry=fnb&min_score=90"
```

---

## Roadmap

### v1.0 (MVP)
- ✅ Fixed weights by industry
- ✅ Basic explanation
- ✅ Score labels

### v1.1
- ✅ Custom weights
- ✅ A/B testing framework
- ✅ Feedback loop

### v2.0
- ✅ ML-based scoring (predictive)
- ✅ Behavior scoring (engagement tracking)
- ✅ Competitive scoring

---

**Score smart. Prioritize well. Close more deals.**
