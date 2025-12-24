# Services

This directory contains all backend microservices for Insight Hub.

## Architecture

Each service is independent with its own:
- API endpoints
- Data models
- Tests
- Dockerfile
- README

## Services

### Core Pipeline

1. **[maps-intelligence](./maps-intelligence/)** - Lead extraction from Google Maps
2. **[lead-enrichment](./lead-enrichment/)** - Data enrichment (website, email, social)
3. **[insight-engine](./insight-engine/)** ⭐ - Transform data into insights
4. **[scoring-engine](./scoring-engine/)** - Calculate and explain lead scores

### Conversion

5. **[crm-service](./crm-service/)** - Customer relationship management
6. **[automation-service](./automation-service/)** - Email campaigns and workflows

### Infrastructure

7. **[api-gateway](./api-gateway/)** - Unified API entry point

## Development

### Running All Services

```bash
# Using Docker Compose
docker-compose up

# Individual service
cd services/maps-intelligence
go run cmd/server/main.go
```

### Service Ports

| Service | Port |
|---------|------|
| maps-intelligence | 8001 |
| lead-enrichment | 8002 |
| insight-engine | 8003 |
| scoring-engine | 8004 |
| crm-service | 8005 |
| automation-service | 8006 |
| api-gateway | 8000 |

## Communication

Services communicate via:
- **REST APIs** (synchronous)
- **Message Queue** (asynchronous, future)
- **Shared Database** (PostgreSQL)

## Deployment

See `infra/` for deployment configurations.
