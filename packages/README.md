# Shared Packages

Reusable libraries and utilities shared across all services.

## Packages

### [insight-types](./insight-types/)
Shared TypeScript/Go type definitions for all services.

**Includes:**
- Business model
- Insight model
- Score model
- API contracts

### [scoring-sdk](./scoring-sdk/)
Reusable scoring utilities (future SaaS SDK).

**Includes:**
- Score calculator
- Weight manager
- Explainer

### [data-normalizer](./data-normalizer/)
Common data normalization and validation.

**Includes:**
- Phone number formatting
- Address parsing
- Email validation
- Data quality scoring

### [industry-schema](./industry-schema/)
Industry-specific data schemas and constants.

**Includes:**
- F&B schemas
- Logistics schemas
- Retail schemas
- Spa schemas

### [logger](./logger/)
Centralized logging utilities.

**Includes:**
- Structured logging
- Log levels
- Context propagation

## Usage

```go
// Example: Using data-normalizer
import "github.com/insight-hub/packages/data-normalizer"

phone := normalizer.FormatPhoneVN("+84281234567")
// Output: "+84 28 1234 5678"
```

## Development

Each package is independently versioned and can be imported by services.
