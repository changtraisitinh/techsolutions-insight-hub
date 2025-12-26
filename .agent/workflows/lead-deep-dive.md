# Lead Deep Dive Workflow

This workflow describes how to trigger the "lead deep dive" analysis using the Agent Orchestrator.

## Overview
The Agent Orchestrator uses Google ADK and Gemini 1.5 Pro to perform deep research on a specific business. It connects to the `maps-intelligence` service to fetch raw data and then uses its reasoning capabilities to identify gaps.

## Prerequisites
- `agent-orchestrator` service running on port 8080 (default).
- `maps-intelligence` service running on port 8001.
- `GEMINI_API_KEY` set in `.env`.

## Steps

1. **Start the Services**
   ```bash
   # Terminal 1: Maps Service
   cd services/maps-intelligence
   ./start_api.sh

   # Terminal 2: Agent Orchestrator
   cd services/agent-orchestrator
   npm run dev
   ```

2. **Trigger Analysis via API**
   Send a POST request to `/api/v1/agent/research`:

   ```bash
   curl -X POST http://localhost:8080/api/v1/agent/research \
     -H "Content-Type: application/json" \
     -d '{
       "businessName": "Highlands Coffee",
       "location": "District 1, Ho Chi Minh City"
     }'
   ```

3. **Trigger via CLI (Testing)**
   You can also interactively test the agent:

   ```bash
   cd services/agent-orchestrator
   npm run cli
   ```
   
   Then type queries like: "Analyze Highlands Coffee in District 1"

## Agent Logic
1. The agent receives the prompt.
2. It uses `search_lead_by_name` tool to find the business in our database.
3. If not found, it might try to fetch generic leads or report not found (mocked for now).
4. It analyzes the returned JSON structure (rating, reviews, website presence).
5. It outputs a summary of digital opportunities.
