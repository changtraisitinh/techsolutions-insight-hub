# Agent Orchestrator

This service is the "Brain" of Insight Hub, built with **Google Agent Development Kit (ADK)**.

## Architecture
- **Framework**: Google ADK (TypeScript)
- **Model**: Gemini 1.5 Pro
- **Runner**: InMemoryRunner (Express-hosted)
- **Tools**: Maps Intelligence API (via Function Calling)

## Features
- **Researcher Agent**: Investigates businesses to find digital transformation opportunities.

## Setup
1. Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

## Usage
**API:**
POST `/api/v1/agent/research`
```json
{
  "businessName": "Business Name",
  "location": "Optional Location"
}
```

**CLI:**
`npm run cli`
