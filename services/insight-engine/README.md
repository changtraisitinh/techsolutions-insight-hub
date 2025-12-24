# Insight Engine ⭐

## Overview

The **Insight Engine** is the **heart of Insight Hub**—it transforms enriched data into actionable business intelligence.

**Philosophy:** No raw data without insight. Every insight must lead to an action.

---

## Responsibilities

1. **Rule Evaluation**
   - Apply industry-specific rules to enriched data
   - Identify gaps and opportunities
   - Generate contextualized insights

2. **Insight Generation**
   - Create human-readable insights
   - Recommend specific actions
   - Prioritize by urgency and impact

3. **Industry Adaptation**
   - Load industry-specific playbooks
   - Adjust rules and weights by sector
   - Provide tailored recommendations

4. **Output Formatting**
   - Generate JSON for downstream systems
   - Create markdown reports for humans
   - Prepare email-ready summaries

---

## Technical Architecture

### Directory Structure

```
insight-engine/
├── rules/
│   ├── website.rules.yaml
│   ├── email.rules.yaml
│   ├── reputation.rules.yaml
│   └── social.rules.yaml
├── analyzers/
│   ├── gap_analyzer.go
│   ├── opportunity_scorer.go
│   └── insight_generator.go
├── industry/
│   ├── fnb/
│   │   ├── rules.yaml
│   │   └── templates.yaml
│   ├── logistics/
│   ├── retail/
│   └── spa/
├── output/
│   ├── formatters/
│   │   ├── json.go
│   │   ├── markdown.go
│   │   └── email.go
│   └── templates/
│       └── insight_report.md
├── models/
│   ├── insight.go
│   └── report.go
├── tests/
├── config/
├── Dockerfile
└── README.md
```

---

## Rule Engine

### Rule Structure (YAML)

```yaml
rules:
  - id: no-website
    name: "No Website Detected"
    enabled: true
    
    # Condition (evaluated against enriched data)
    condition: "website_url == null"
    
    # Insight output
    insight: "Business has no website"
    opportunity: "Digital transformation"
    action: "Pitch website development + online presence package"
    
    # Metadata
    priority: high  # high, medium, low
    score_impact: +30  # Impact on lead score
    category: "digital_presence"
    
    # Supporting data
    benchmark: "70% of customers search online before visiting"
    revenue_impact: "Missing 40% of potential customers"
    
  - id: slow-website
    name: "Slow Website Performance"
    enabled: true
    condition: "website.page_load_time > 3.0"
    insight_template: "Website loads in {website.page_load_time}s (target: <3s)"
    opportunity: "Performance optimization"
    action: "Offer website speed optimization service"
    priority: medium
    score_impact: +15
    category: "technical_debt"
```

### Rule Types

#### Gap Detection Rules
Identify missing capabilities:
- No website
- No online ordering (F&B)
- No fleet tracking (Logistics)
- No e-commerce (Retail)

#### Quality Rules
Assess existing systems:
- Slow website
- Not mobile-friendly
- Missing HTTPS
- Poor SEO

#### Opportunity Rules
Market-based signals:
- High reputation + missing tech = ready to invest
- Active social + no website = understanding value
- New business + gaps = growth phase

---

## Insight Generation Process

```
Enriched Data → Rule Evaluation → Context Addition → Priority Assignment → Insight Output
```

### Step 1: Rule Evaluation

```go
// Pseudo-code
func EvaluateRules(lead EnrichedLead, rules []Rule) []Insight {
    var insights []Insight
    
    for _, rule := range rules {
        if evaluate(rule.Condition, lead) {
            insight := generateInsight(rule, lead)
            insights = append(insights, insight)
        }
    }
    
    return insights
}
```

### Step 2: Context Addition

```go
func AddContext(insight Insight, benchmarks IndustryBenchmarks) Insight {
    // Add industry benchmarks
    insight.Benchmark = benchmarks.GetRelevant(insight.Category)
    
    // Add revenue impact calculation
    insight.RevenueImpact = calculateImpact(insight, lead)
    
    // Add competitive context
    insight.CompetitivePosition = compareToLocal(lead, competitors)
    
    return insight
}
```

### Step 3: Priority Assignment

```go
func PrioritizeInsights(insights []Insight) []Insight {
    // Sort by:
    // 1. Revenue impact (highest first)
    // 2. Ease of implementation (easiest first)
    // 3. Score impact (highest first)
    
    sort.Slice(insights, func(i, j int) bool {
        return insights[i].Priority > insights[j].Priority
    })
    
    return insights
}
```

---

## Industry-Specific Analysis

### F&B Rules Example

**File:** `industry/fnb/rules.yaml`

```yaml
industry: fnb
base_rules:
  - website.rules.yaml
  - email.rules.yaml
  - reputation.rules.yaml

fnb_specific_rules:
  - id: fnb-no-online-ordering
    name: "No Online Ordering"
    condition: "industry == 'fnb' AND has_online_ordering == false"
    insight: "No online ordering detected (30% revenue loss)"
    opportunity: "E-commerce for F&B"
    action: "Pitch online ordering system + delivery integration"
    priority: critical
    score_impact: +40
    
    revenue_calculation:
      avg_monthly_revenue: estimated_revenue
      online_percentage: 30%
      monthly_loss: avg_monthly_revenue * 0.30
    
    recommended_solution:
      name: "F&B Digital Starter Pack"
      price: "$3,500-5,000"
      includes:
        - Online ordering platform
        - GrabFood + ShopeeFood integration
        - Digital menu (QR code)
```

---

## Output Formats

### JSON Output

```json
{
  "business_id": "uuid",
  "business_name": "Cà Phê Sáng",
  "industry": "fnb",
  "analysis_date": "2024-12-24T11:30:00Z",
  
  "insights": [
    {
      "id": "insight_1",
      "rule_id": "fnb-no-online-ordering",
      "priority": "critical",
      "category": "revenue_opportunity",
      
      "insight": "No online ordering detected",
      "opportunity": "E-commerce for F&B",
      "action": "Pitch online ordering system + delivery integration",
      
      "impact": {
        "revenue_loss_monthly": "$9,000",
        "revenue_loss_annual": "$108,000",
        "score_contribution": 40
      },
      
      "context": {
        "benchmark": "70% of F&B revenue comes from online channels",
        "industry_average": "30% online ordering adoption",
        "competitive_gap": "5 nearby competitors have online ordering"
      },
      
      "recommendation": {
        "solution": "F&B Digital Starter Pack",
        "estimated_cost": "$3,500-5,000",
        "roi_months": 0.5,
        "implementation_time": "2 weeks"
      }
    }
  ],
  
  "summary": {
    "total_insights": 4,
    "critical": 1,
    "high": 2,
    "medium": 1,
    "total_revenue_opportunity": "$12,000/month",
    "recommended_investment": "$8,000",
    "expected_roi": "1.5x in first month"
  }
}
```

### Markdown Report

See `output/templates/insight_report.md` for full template.

---

## API Endpoints

### POST /api/v1/analyze

Generate insights for a business.

**Request:**
```json
{
  "business_id": "uuid",
  "industry": "fnb",
  "deep_analysis": true
}
```

**Response:**
```json
{
  "business_id": "uuid",
  "insights": [...],
  "report_url": "/api/v1/reports/uuid.md"
}
```

---

### POST /api/v1/analyze/batch

Analyze multiple businesses.

**Request:**
```json
{
  "business_ids": ["uuid1", "uuid2"],
  "industry": "fnb"
}
```

**Response:**
```json
{
  "job_id": "analysis_job_123",
  "queued": 2,
  "estimated_time": "30 seconds"
}
```

---

### GET /api/v1/reports/:business_id.md

Get markdown report.

**Response:** Markdown file (see template)

---

### GET /api/v1/reports/:business_id.json

Get JSON report.

**Response:** JSON (see format above)

---

## Rule Management

### Adding New Rules

1. Create YAML rule definition
2. Add to appropriate rules file
3. Test with sample data
4. Deploy

**Example:**
```yaml
# rules/social.rules.yaml
- id: high-engagement
  name: "Strong Social Engagement"
  condition: "social.facebook.engagement_rate > 3.0"
  insight: "High social engagement (${social.facebook.engagement_rate}%)"
  opportunity: "Marketing amplification"
  action: "Offer advanced social media tools"
  priority: medium
  score_impact: +10
```

### Rule Testing

```bash
# Test rule against sample data
./scripts/test-rule.sh --rule=high-engagement --sample=cafe_sample.json

# Output
✅ Rule triggered
📊 Insight: "High social engagement (4.2%)"
💡 Action: "Offer advanced social media tools"
✨ Score impact: +10
```

---

## Benchmarks & Context

### Industry Benchmarks

**File:** `data/benchmarks/fnb.json`

```json
{
  "industry": "fnb",
  "last_updated": "2024-12-01",
  
  "metrics": {
    "online_ordering_adoption": 70,
    "avg_rating": 3.8,
    "avg_reviews": 45,
    "website_presence": 60,
    "social_media_presence": 85
  },
  
  "revenue_models": {
    "online_percentage": 30,
    "delivery_percentage": 40,
    "dine_in_percentage": 30
  }
}
```

### Using Benchmarks in Insights

```yaml
- id: below-avg-rating
  condition: "rating < ${benchmark.avg_rating}"
  insight_template: "Rating ({rating}★) below industry average ({benchmark.avg_rating}★)"
  opportunity: "Reputation management"
  action: "Focus on service quality before tech investment"
```

---

## Configuration

### config.yaml

```yaml
insight_engine:
  rules_path: "./rules"
  industry_path: "./industry"
  benchmarks_path: "../../data/benchmarks"
  
  analysis:
    max_insights_per_lead: 10
    min_priority: "low"  # Filter out lower than this
    include_benchmarks: true
    calculate_roi: true
  
  output:
    formats: ["json", "markdown"]
    include_recommendations: true
    include_competitive_analysis: true
```

---

## Performance

### Analysis Speed
- **Rule evaluation:** 10-20ms per lead
- **Context enrichment:** 5-10ms
- **Report generation:** 50-100ms
- **Total:** 65-130ms per lead

### Throughput
- **Sequential:** ~500 leads/minute
- **Parallel (10 workers):** ~5,000 leads/minute

---

## Monitoring

### Metrics
- **Analysis rate:** Leads per minute
- **Rule trigger rate:** Which rules fire most
- **Insight accuracy:** Customer validation feedback
- **Performance:** p50, p95, p99 latency

### Alerts
- ⚠️ Analysis latency > 200ms (p95)
- ⚠️ No insights generated (all rules fail)
- ⚠️ Insight accuracy < 75%

---

## Development

### Setup

```bash
cd services/insight-engine
go mod download

# Load sample data
psql -U postgres insight_hub < ../../data/samples/enriched_leads.sql

# Run
go run cmd/server/main.go
```

### Testing Insights

```bash
# Analyze single business
curl -X POST http://localhost:8003/api/v1/analyze \
  -d '{"business_id":"uuid","industry":"fnb"}'

# View markdown report
curl http://localhost:8003/api/v1/reports/uuid.md
```

---

## Roadmap

### v1.0 (MVP)
- ✅ Rule-based insights
- ✅ Industry-specific rules (F&B)
- ✅ JSON + Markdown output

### v1.1
- ✅ Benchmark integration
- ✅ ROI calculations
- ✅ Competitive analysis

### v2.0
- ✅ AI-powered insights (LLM)
- ✅ Predictive recommendations
- ✅ Custom rule builder UI

---

**The intelligence layer. This is what makes Insight Hub unique.**
