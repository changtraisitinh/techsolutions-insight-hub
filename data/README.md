# Data

Datasets, benchmarks, and sample data for Insight Hub.

## Directories

### [raw](./raw/)
Raw data samples for testing.

**Contents:**
- Sample Google Maps extracts
- Test business profiles
- Development datasets

### [processed](./processed/)
Processed and normalized datasets.

**Contents:**
- Enriched business data
- Cleaned lead lists
- Ready-to-analyze data

### [benchmarks](./benchmarks/)
Industry benchmark data.

**Files:**
- `fnb.json` - F&B industry benchmarks
- `logistics.json` - Logistics benchmarks
- `retail.json` - Retail benchmarks
- `spa.json` - Spa/Beauty benchmarks

**Example: fnb.json**
```json
{
  "industry": "fnb",
  "metrics": {
    "online_ordering_adoption": 70,
    "avg_rating": 3.8,
    "avg_reviews": 45,
    "website_presence": 60
  }
}
```

### [samples](./samples/)
Sample datasets for demos and pitches.

**Use Cases:**
- Product demonstrations
- Sales presentations
- Customer onboarding
- Testing

## Usage

```bash
# Load benchmark data
psql insight_hub < data/benchmarks/fnb.json

# Import sample data for testing
./scripts/load-samples.sh
```

## Data Sources

All data is either:
- Publicly available
- Synthetically generated
- Anonymized customer data (with permission)

## Privacy

No personally identifiable information (PII) in this repository.
