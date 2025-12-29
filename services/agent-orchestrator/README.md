# Agent Orchestrator Service

**AI-powered business research and real estate analysis with flexible provider support**

## 🏗️ Architecture

```
src/
├── providers/          # Provider Pattern (Main Architecture)
│   ├── base.ts        # AIProvider interface & shared prompts
│   ├── factory.ts     # Auto-detection & provider creation
│   ├── gemini.ts      # Google Gemini implementation
│   └── openai.ts      # OpenAI & LM Studio implementation
├── agents/            # Legacy Gemini Agent (ADK)
│   └── researcher.ts  # Used by Gemini provider
├── tools/             # Research Tools (for Gemini)
│   ├── maps.ts        # Maps Intelligence integration
│   └── realestate.ts  # Real Estate data search
├── config.ts          # Service configuration
└── server.ts          # Express REST API

```

## 🚀 Features

- **Multi-Provider Support**: Gemini, OpenAI, LM Studio
- **Auto Provider Detection**: Based on environment config
- **Research Modes**: General, Real Estate, Marketing, Competitor Analysis, Lead Generation
- **Tool Integration**: Maps Intelligence, Real Estate Search
- **Graceful Fallback**: Simulated responses when rate-limited

## 📋 API Endpoints

### Research Query
```http
POST /api/v1/agent/research
Content-Type: application/json

{
  "businessName": "Your query here",
  "location": "Optional location",
  "mode": "general | real-estate | marketing | competitor | leads"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": "AI-generated analysis",
    "provider": "OpenAI",
    "trace": [...]
  }
}
```

### Provider Status
```http
GET /api/v1/provider/status
```

Returns active provider and configuration status.

### Health Check
```http
GET /health
```

## ⚙️ Configuration

### Environment Variables

```env
# Port
PORT=8080

# Provider Selection (Priority Order)
# 1. LM Studio (if enabled)
USE_LM_STUDIO=true
LM_STUDIO_URL=http://localhost:1234/v1

# 2. OpenAI (if API key provided)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_BASE_URL=https://api.openai.com/v1

# 3. Gemini (default fallback)
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.0-flash-exp

# Service Integration
MAPS_SERVICE_URL=http://localhost:8001
REAL_ESTATE_SERVICE_URL=http://localhost:8002
```

## 🎯 Supported Providers

| Provider | Cost | Quota | Speed | Quality | Setup |
|----------|------|-------|-------|---------|-------|
| **LM Studio** | Free | ∞ | Fast | Good | Medium |
| **Gemini** | Free | Limited | Fast | Best | Easy |
| **OpenAI** | Paid | High | Fast | Excellent | Easy |
| **Anthropic** | Paid | High | Medium | Excellent | Coming Soon |

### Recommended Configuration

**Development:**
```env
USE_LM_STUDIO=true
LM_STUDIO_URL=http://localhost:1234/v1
```

**Production:**
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
```

## 📦 Installation

```bash
cd services/agent-orchestrator
npm install
```

## 🏃 Running

```bash
# Development (with hot reload)
npm run dev

# Production
npm start

# Build
npm run build
```

## 🧪 Testing

```bash
# Test provider status
curl http://localhost:8080/api/v1/provider/status

# Test research query
curl -X POST http://localhost:8080/api/v1/agent/research \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Highlands Coffee",
    "location": "District 1",
    "mode": "general"
  }'
```

## 🔧 Development

### Adding a New Provider

1. Create provider class in `src/providers/your-provider.ts`
2. Implement `AIProvider` interface
3. Add to `ProviderFactory` in `src/providers/factory.ts`
4. Update environment configuration

See `PROVIDERS.md` for detailed guide.

### Project Structure

- **`providers/`** - Main architecture using provider pattern
- **`agents/`** - Legacy Gemini agent (kept for compatibility)
- **`tools/`** - Research tools used by Gemini provider
- **`server.ts`** - REST API server
- **`config.ts`** - Service configuration

## 📚 Documentation

- [Provider Architecture](./PROVIDERS.md) - Detailed provider guide
- [LM Studio Setup](../../LM_STUDIO_SETUP.md) - Local inference setup

## 🔗 Integration

This service integrates with:
- **Maps Intelligence API** (`localhost:8001`) - Business lead data
- **Real Estate Service** (`localhost:8002`) - Property search
- **Dashboard** (`localhost:3000`) - Frontend UI

## 🛠️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **AI SDKs**:
  - `@google/adk` - Gemini Agent Development Kit
  - `openai` - OpenAI SDK (also LM Studio compatible)
- **Dev Tools**: ts-node-dev (hot reload)

## 📝 License

Part of TechSolutions Insight Hub
