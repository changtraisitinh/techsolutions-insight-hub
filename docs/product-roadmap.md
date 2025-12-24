# Product Roadmap

## Overview

Insight Hub follows a phased approach from **Service → Product → SaaS Platform**.

Each phase builds on the previous, adding more automation and self-service capabilities.

---

## Phase 1: MVP - Lead Discovery (v0.1)
**Timeline:** Months 1-3  
**Goal:** Prove the core value: quality leads with context  
**Business Model:** Service (manual-assisted)

### Features
- ✅ **Maps Intelligence**
  - Google Maps scraping by location + category
  - Basic data extraction (name, address, phone, rating, reviews)
  - Export to CSV/JSON

- ✅ **Data Normalization**
  - Clean addresses and phone numbers
  - Categorize business types
  - Deduplicate entries

- ✅ **Lead Database**
  - PostgreSQL storage
  - Basic search and filtering
  - Export capabilities

### Success Criteria
- ✅ 1,000+ businesses extracted
- ✅ 90%+ data accuracy
- ✅ 3 paying pilot customers

### Revenue Target
**$5K** (3 customers × $1.5K-2K per project)

---

## Phase 2: Insight Engine (v0.2) ⭐
**Timeline:** Months 4-6  
**Goal:** Generate actionable business insights automatically  
**Business Model:** Service → Early Product

### Features

#### Insight Generation
- ✅ **Website Analysis**
  - Presence detection
  - Quality scoring (speed, mobile-friendly, SEO)
  - Tech stack identification

- ✅ **Email & Social Detection**
  - Email discovery from websites
  - Facebook/Zalo profile finding
  - Social engagement metrics

- ✅ **Rule-Based Insights**
  - "No website → Digital transformation opportunity"
  - "High reviews + no online ordering → E-commerce potential"
  - "Old website + strong brand → Redesign candidate"

#### Lead Scoring
- ✅ **Configurable Scoring Model**
  - Website presence weight
  - Review quality weight
  - Social engagement weight
  - Business size indicators

- ✅ **Explainable Scores**
  - "Score: 85/100"
  - "Why: Strong reviews (40 pts), no website (30 pts), active social (15 pts)"

#### Industry Playbooks
- ✅ **F&B Insights**
  - Online ordering readiness
  - Delivery integration potential
  - Menu digitization opportunity

- ✅ **Logistics Insights**
  - Fleet tracking needs
  - Route optimization gaps
  - Documentation digitization

### Success Criteria
- ✅ 5,000+ businesses analyzed
- ✅ 80%+ insight accuracy (validated by customers)
- ✅ 10 paying customers

### Revenue Target
**$25K** (10 customers × $2K-3K per project)

---

## Phase 3: Automation & Conversion (v0.3)
**Timeline:** Months 7-9  
**Goal:** Convert insights into revenue automatically  
**Business Model:** Product (low-touch sales)

### Features

#### CRM Integration
- ✅ **Lead Management**
  - Import insights to CRM
  - Track outreach status
  - Pipeline visualization

- ✅ **Integrations**
  - HubSpot connector
  - Pipedrive connector
  - Custom webhook support

#### Email Automation
- ✅ **Campaign Builder**
  - Template library by industry
  - Personalization with insights
  - A/B testing

- ✅ **Automated Workflows**
  - Trigger: New high-score lead
  - Action: Send personalized email
  - Follow-up: Automated sequences

#### Reporting
- ✅ **Performance Dashboard**
  - Leads generated
  - Conversion rates
  - Revenue attribution

- ✅ **Insight Reports**
  - PDF/Email delivery
  - Industry benchmarks
  - Actionable recommendations

### Success Criteria
- ✅ 20,000+ businesses analyzed
- ✅ 30+ paying customers
- ✅ 15%+ average conversion rate for customers

### Revenue Target
**$60K** (30 customers × $2K average)

---

## Phase 4: SaaS Platform (v1.0)
**Timeline:** Months 10-15  
**Goal:** Self-service platform with recurring revenue  
**Business Model:** SaaS (Monthly subscriptions)

### Features

#### Multi-Tenant Platform
- ✅ **User Authentication**
  - Email/password + OAuth
  - Team accounts
  - Role-based access

- ✅ **Workspace Management**
  - Multiple projects per account
  - Shared team workspaces
  - Usage tracking

#### Self-Service UI
- ✅ **Dashboard**
  - Lead discovery interface
  - Insight viewer
  - Scoring customization

- ✅ **Campaign Management**
  - Email campaign builder
  - Performance analytics
  - A/B testing tools

#### API & SDK
- ✅ **Public API**
  - RESTful endpoints
  - Webhook notifications
  - Rate limiting

- ✅ **SDK for Partners**
  - JavaScript SDK
  - Python SDK
  - Documentation + examples

#### Pricing Tiers
- **Starter:** $99/month
  - 500 leads/month
  - Basic insights
  - Email support

- **Professional:** $299/month
  - 2,000 leads/month
  - Advanced insights + scoring
  - CRM integration
  - Priority support

- **Enterprise:** Custom
  - Unlimited leads
  - Custom industry playbooks
  - API access
  - Dedicated support

### Success Criteria
- ✅ 100+ monthly active users
- ✅ $15K MRR (Monthly Recurring Revenue)
- ✅ 80%+ customer retention (3-month)

### Revenue Target
**$180K ARR** (Annual Recurring Revenue)

---

## Phase 5: Intelligence Marketplace (v2.0)
**Timeline:** Months 16-24  
**Goal:** Platform + ecosystem  
**Business Model:** Platform fees + data licensing

### Features

#### Benchmark Data Marketplace
- ✅ Sell anonymized industry benchmark data
- ✅ Trend reports by sector
- ✅ Competitive intelligence feeds

#### Partner Ecosystem
- ✅ API partners integrate Insight Hub
- ✅ Revenue sharing model
- ✅ Partner marketplace

#### AI-Powered Insights
- ✅ LLM-generated custom insights
- ✅ Predictive lead scoring
- ✅ Automated action recommendations

### Success Criteria
- ✅ 1,000+ monthly active users
- ✅ 50+ API partners
- ✅ $50K MRR

### Revenue Target
**$600K ARR**

---

## Roadmap Summary

| Phase | Timeline | Key Milestone | Revenue Target |
|-------|----------|--------------|----------------|
| **v0.1 MVP** | Months 1-3 | 1,000 leads extracted | $5K |
| **v0.2 Insights** | Months 4-6 | 5,000 leads analyzed | $25K |
| **v0.3 Automation** | Months 7-9 | 30 customers, automation | $60K |
| **v1.0 SaaS** | Months 10-15 | 100 users, $15K MRR | $180K ARR |
| **v2.0 Platform** | Months 16-24 | 1,000 users, ecosystem | $600K ARR |

---

## Feature Prioritization Framework

### Must Have (P0)
- Core value proposition
- Blocks next phase
- Customer validation required

### Should Have (P1)
- Improves conversion
- Reduces churn
- Competitive differentiation

### Nice to Have (P2)
- Future optimization
- Edge cases
- Advanced features

---

## Risk Mitigation

### Technical Risks
- **Data quality issues** → Validation layer + human review in early phases
- **Scraping detection** → Rate limiting + proxy rotation
- **Scalability** → Start with proven tech stack (Postgres, Redis)

### Business Risks
- **Low conversion** → Start with service model to prove value
- **Churn** → Focus on ROI metrics from day 1
- **Competition** → Build Vietnam-specific moat (local data + industry playbooks)

### Go-to-Market Risks
- **Awareness** → Content marketing + case studies
- **Pricing** → Start high (service), iterate based on feedback
- **Adoption** → Low-touch onboarding + automated value delivery

---

## Next Steps

### Month 1 Priorities
1. ✅ Build maps-intelligence service
2. ✅ Create lead database schema
3. ✅ Extract 1,000 F&B leads (pilot)
4. ✅ Recruit 2-3 pilot customers

### Success Metrics Tracking
We will track:
- **Leads extracted** (quantity)
- **Data accuracy** (quality)
- **Customer satisfaction** (NPS)
- **Conversion rate** (business outcome)

---

**The roadmap is a living document. We adapt based on customer feedback.**
