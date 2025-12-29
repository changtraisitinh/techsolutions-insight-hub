# Agent Orchestrator - Provider Architecture

## Overview

The Agent Orchestrator now uses a **flexible provider pattern** that makes it easy to switch between different AI platforms without code changes - just update your `.env` file!

## Supported Providers

### 1. **LM Studio** (Recommended for Development)
- ✅ **Free & Unlimited** - No API costs or quotas
- ✅ **Privacy** - Data never leaves your machine
- ✅ **Offline** - Works without internet
- ✅ **Fast** - Local inference

**Setup:**
```env
USE_LM_STUDIO=true
LM_STUDIO_URL=http://localhost:1234/v1
```

See `LM_STUDIO_SETUP.md` for detailed instructions.

### 2. **Google Gemini** (Default)
- ✅ **Advanced reasoning** - Best for complex analysis
- ✅ **Free tier** - Limited quota
- ❌ **Quota limits** - May hit daily limits

**Setup:**
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp  # optional
```

### 3. **OpenAI**
- ✅ **Reliable** - Production-ready
- ✅ **GPT-4 support** - Highest quality
- ❌ **Paid** - Costs per token

**Setup:**
```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4
OPENAI_BASE_URL=https://api.openai.com/v1  # optional
```

### 4. **Anthropic Claude** (Coming Soon)
```env
ANTHROPIC_API_KEY=your_api_key_here
```

## Provider Selection Priority

The system automatically selects a provider in this order:

1. **LM Studio** (if `USE_LM_STUDIO=true`)
2. **OpenAI** (if `OPENAI_API_KEY` is set)
3. **Anthropic** (if `ANTHROPIC_API_KEY` is set) - Coming soon
4. **Gemini** (default fallback)

## Architecture

```
src/
├── providers/
│   ├── base.ts       # AIProvider interface & shared prompts
│   ├── factory.ts    # Provider creation & auto-detection
│   ├── gemini.ts     # Gemini implementation (ADK)
│   ├── openai.ts     # OpenAI/LM Studio implementation
│   └── anthropic.ts  # Coming soon
├── agents/
│   └── researcher.ts # Legacy - kept for Gemini compatibility
└── server.ts         # Express server using providers
```

## Adding a New Provider

1. **Create provider class** in `src/providers/your-provider.ts`:

```typescript
import { AIProvider, PROMPTS } from './base';

export class YourProvider implements AIProvider {
  name = 'YourProvider';
  
  async execute(query: string, mode: string): Promise<string> {
    // Your implementation
  }
  
  async isAvailable(): Promise<boolean> {
    // Check if configured
  }
}
```

2. **Add to factory** in `src/providers/factory.ts`:

```typescript
case 'your-provider':
  return new YourProvider(config);
```

3. **Update environment** in `.env`:

```env
YOUR_PROVIDER_API_KEY=...
```

## API Endpoints

### Research Query
```bash
POST /api/v1/agent/research
{
  "businessName": "Highlands Coffee",
  "location": "District 1",
  "mode": "general"  # or real-estate, marketing, etc.
}
```

### Provider Status
```bash
GET /api/v1/provider/status
# Returns active provider and configuration
```

### Health Check
```bash
GET /health
# Returns service status and active provider
```

## Benefits of This Architecture

✅ **Flexibility** - Switch providers with environment variables
✅ **Extensibility** - Easy to add new AI platforms
✅ **Testability** - Mock providers for testing
✅ **Maintainability** - Clean separation of concerns
✅ **Reliability** - Automatic fallback to simulated responses

## Example Configurations

### Development (LM Studio)
```env
USE_LM_STUDIO=true
LM_STUDIO_URL=http://localhost:1234/v1
```

### Production (OpenAI)
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
```

### Hybrid (Gemini + LM Studio Fallback)
```env
GEMINI_API_KEY=AIza...
USE_LM_STUDIO=true
LM_STUDIO_URL=http://localhost:1234/v1
```

The system will try Gemini first. If you hit quota limits, manually switch to LM Studio by removing the Gemini key.
