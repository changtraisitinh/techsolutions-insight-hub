# Agent Orchestrator + Real Estate Service Integration

## ✅ Integration Complete!

The agent-orchestrator service now successfully integrates with the realestate-service to provide AI-powered property analysis.

## Architecture Flow

```
User Query (Dashboard)
    ↓
Agent Orchestrator (port 8080)
    ↓
Mode Detection → Real Estate Mode?
    ↓ YES
Real Estate Service API (port 8002)
    ↓
PostgreSQL Database Query
    ↓
Property Data (JSON)
    ↓
LM Studio / OpenAI / Gemini
    ↓
AI-Generated Analysis
    ↓
Response to User
```

## Test Results

### Direct Real Estate API:
```bash
curl "http://localhost:8002/api/search-parcels?q=so%20to%2057%20so%20thua%208"
```

**Result:** ✅ Found 76 parcels matching criteria

### Agent Integration:
```bash
curl -X POST http://localhost:8080/api/v1/agent/research \
  -H "Content-Type: application/json" \
  -d '{"businessName":"so to 57, so thua 8","mode":"real-estate"}'
```

**Process:**
1. ✅ Agent detects "real-estate" mode
2. ✅ Calls Real Estate API: `GET /api/search-parcels?q=so+to+57+so+thua+8`
3. ✅ Receives 76 parcels with full property data
4. ✅ Passes data to LM Studio (DeepSeek R1)
5. ✅ LM Studio analyzes and generates insights
6. ✅ Returns formatted response with maps links

## Implementation Details

### OpenAI Provider Enhancement
File: `src/providers/openai.ts`

When `mode === 'real-estate'`:
1. Extracts query from user input
2. Calls `http://localhost:8002/api/search-parcels?q={query}`
3. Appends property data as JSON context to the LLM prompt
4. LLM analyzes the real data and generates insights

### Gemini Provider
File: `src/providers/gemini.ts`

Uses Google ADK's function calling:
- `searchRealEstateTool` - Defined in `src/tools/realestate.ts`
- Automatically calls Real Estate API when needed
- Returns structured data to Gemini

## Configuration

Environment variables (`.env`):
```env
# Real Estate Service
REAL_ESTATE_SERVICE_URL=http://localhost:8002

# AI Provider (LM Studio recommended)
USE_LM_STUDIO=true
LM_STUDIO_URL=http://localhost:1234/v1
```

## Example Response

### Query:
```
"so to 57, so thua 8, phuong tan phu"
```

### Real Estate Data Retrieved:
- **Count**: 76 parcels found
- **Sample**: Sheet 57, Parcel 8, Phú Trung Ward, 22.5m²
- **Includes**: Location, area, planning info, Google Maps links

### AI Analysis:
LM Studio (DeepSeek R1) generates:
- Property summary
- Legal status analysis
- Planning insights
- Market recommendations
- Embedded Google Maps

## Benefits

✅ **Real Data** - Connects to actual PostgreSQL database
✅ **AI Enhanced** - LLM provides insights and analysis
✅ **Unlimited** - LM Studio = no API quotas
✅ **Bilingual** - Handles Vietnamese property data
✅ **Interactive Maps** - Auto-embeds location visualizations

## Verified Working

- ✅ Real Estate Service running (port 8002)
- ✅ Agent Orchestrator running (port 8080)
- ✅ LM Studio connected (localhost:1234)
- ✅ API integration functional
- ✅ Data retrieval successful (76 parcels found)
- ✅ DeepSeek R1 processing queries

## Next Steps

Test in Dashboard:
1. Navigate to `http://localhost:3000/agent`
2. Select **Real Estate** mode
3. Enter: `so to 57, so thua 8, phuong tan phu`
4. Click **Analyze**
5. See AI-powered property analysis with embedded maps!
