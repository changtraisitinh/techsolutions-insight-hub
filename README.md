# Insight Hub

**Turn Local Business Data into Growth Intelligence**

Insight Hub is a Local Business Intelligence platform that helps discover, analyze, and convert local business leads into customers. Built for the Vietnamese SME market with a product-first, scale-friendly architecture.

---

## 🎯 Core Philosophy

**Data → Insight → Action → Revenue**

1. **No raw data without insight** – All data must be processed into actionable intelligence
2. **Every insight must lead to an action** – Insights aren't useful unless they drive decisions
3. **Every action must support revenue** – All features must contribute to business growth

---

## 🚀 What is Insight Hub?

Insight Hub is a **local-first intelligence platform** designed to:
- **Discover** potential business leads from local data sources (Google Maps, websites, social media)
- **Analyze** businesses with industry-specific insights and scoring
- **Convert** leads into customers through automated outreach and CRM integration

**Target Market:** Vietnamese SMEs (F&B, Logistics, Retail, Spa, and more)

**Evolution Path:** Service → Product → SaaS Platform

---

## 🏗️ Architecture

This is a **monorepo** designed for:
- ✅ Easy module expansion
- ✅ Shared scoring logic across services
- ✅ SaaS-ready foundation

### Directory Structure

```
insight-hub/
├── docs/                     # Vision, strategy, and technical documentation
├── services/                 # Backend microservices
│   ├── maps-intelligence/   # Lead extraction from Google Maps
│   ├── lead-enrichment/     # Data enrichment (website, email, social)
│   ├── insight-engine/      # ⭐ Core: Transform data into insights
│   ├── scoring-engine/      # Lead scoring and explanation
│   ├── crm-service/         # Customer relationship management
│   ├── automation-service/  # Email campaigns and workflows
│   └── api-gateway/         # Unified API entry point
├── packages/                # Shared libraries and SDKs
│   ├── insight-types/       # Shared type definitions
│   ├── scoring-sdk/         # Reusable scoring utilities
│   ├── data-normalizer/     # Common data normalization
│   ├── industry-schema/     # Industry-specific schemas
│   └── logger/              # Centralized logging
├── infra/                   # Infrastructure as code
│   ├── docker/              # Local development
│   ├── k8s/                 # Kubernetes manifests
│   ├── terraform/           # Cloud resources
│   └── environments/        # Environment configs
├── scripts/                 # Operational automation
│   ├── lead-import/         # Batch lead import
│   ├── audit-generator/     # Business audit reports
│   ├── email-campaign/      # Campaign automation
│   └── crm-sync/            # CRM synchronization
├── data/                    # Datasets and benchmarks
│   ├── raw/                 # Raw data samples
│   ├── processed/           # Normalized datasets
│   ├── benchmarks/          # Industry benchmarks (F&B, logistics, etc.)
│   └── samples/             # Demo datasets
└── .github/                 # CI/CD and templates
```

---

## 🧩 Core Modules

### 1️⃣ Maps Intelligence
Extract and normalize business leads from Google Maps.

**Output:** Raw business data (name, address, phone, category, reviews)

### 2️⃣ Lead Enrichment
Enrich leads with additional signals:
- Website analysis (presence, quality, technology stack)
- Email discovery
- Social media profiles
- Tech stack detection

### 3️⃣ Insight Engine ⭐ **CORE**
Transform enriched data into **actionable business insights**.

**Features:**
- Rule-based analysis (website quality, email presence, reputation)
- Industry-specific insights (F&B, logistics, retail)
- Human-readable reports + structured JSON output

**Example Insight:**
> "This coffee shop has no website (growth opportunity) but strong Google reviews (credibility). High potential for digital transformation package."

### 4️⃣ Scoring Engine
Calculate and explain lead scores.

**Features:**
- Configurable scoring weights
- Explainable AI – why did this lead score high/low?
- Industry-specific scoring models

### 5️⃣ CRM & Automation
Convert insights into action:
- Lead management
- Email campaigns
- Follow-up automation
- Sales pipeline tracking

---

## 📊 Industry Playbooks

Insight Hub provides tailored intelligence for:

| Industry | Focus Areas |
|----------|-------------|
| **F&B** | Online ordering, delivery integration, menu digitization |
| **Logistics** | Fleet tracking, route optimization, digital documentation |
| **Retail** | E-commerce readiness, inventory systems, POS integration |
| **Spa/Beauty** | Booking systems, customer loyalty, online presence |

Each industry has custom:
- Insight rules
- Scoring weights
- Recommended actions

---

## 🗺️ Product Roadmap

### v0.1 – Lead Discovery (MVP)
- ✅ Google Maps extraction
- ✅ Basic data normalization
- ✅ Lead database

### v0.2 – Insight Engine
- ⭐ Rule-based insight generation
- ⭐ Lead scoring with explanations
- ⭐ Industry-specific analysis

### v0.3 – Conversion Automation
- 📧 Email outreach automation
- 📊 CRM integration
- 📈 Sales pipeline management

### v1.0 – SaaS Platform
- 🔐 Multi-tenant architecture
- 💳 Subscription billing
- 🎨 Dashboard UI
- 🔌 Public API & SDK

---

## 🛠️ Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Backend** | Go / Node.js | Performance vs. rapid development |
| **Database** | PostgreSQL | Robust relational queries |
| **Cache** | Redis | In-memory performance |
| **Queue** | Kafka / SQS | Event-driven architecture |
| **Frontend** | Next.js (later) | Modern SaaS UI |
| **Infra** | Docker + Cloudflare | Containers + global CDN |

---

## 📚 Documentation

Comprehensive documentation in [`docs/`](./docs/):

- **[Vision](./docs/vision.md)** – Product mission and long-term goals
- **[Problem Statement](./docs/problem-statement.md)** – Market gaps and opportunities
- **[Personas](./docs/personas.md)** – Target users and use cases
- **[Product Roadmap](./docs/product-roadmap.md)** – Development phases
- **[Data Sources](./docs/data-sources.md)** – Where we get data
- **[Insight Framework](./docs/insight-framework.md)** – How insights are generated
- **[Scoring Model](./docs/scoring-model.md)** – Lead scoring methodology
- **[Conversion Funnel](./docs/conversion-funnel.md)** – Lead → customer journey
- **[Industry Playbooks](./docs/industry-playbooks/)** – Sector-specific guides

---

## 🚦 Getting Started

_(Coming soon after implementation)_

1. **Clone the repository**
2. **Install dependencies**
3. **Run local services with Docker**
4. **Import sample data**
5. **Generate your first insights**

---

## 🤝 Contributing

This is a product-focused monorepo. Please refer to:
- `.github/PULL_REQUEST_TEMPLATE.md` for PR guidelines
- `.github/CODEOWNERS` for code ownership

---

## 📄 License

_(To be determined)_

---

## 🌟 Tagline

**Insight Hub – Turn Local Business Data into Growth Intelligence**

---

**Built with ❤️ for Vietnamese SMEs**