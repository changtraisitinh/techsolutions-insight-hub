# LM Studio Setup Guide

## What is LM Studio?
LM Studio lets you run large language models locally on your Mac without API quotas or costs.

## Step 1: Install LM Studio
1. Download from: https://lmstudio.ai/
2. Install the app

## Step 2: Load a Model
1. Open LM Studio
2. Go to "Discover" tab
3. Search for and download a model (recommended models):
   - `llama-3.2-3b-instruct` (fast, works on most Macs)
   - `mistral-7b-instruct` (better quality, needs 8GB+ RAM)
   - `gemma-2-9b-it` (best quality, needs 16GB+ RAM)
4. Click "Load Model" in the chat tab

## Step 3: Start the Server
1. In LM Studio, go to "Developer" → "Local Server"
2. Click "Start Server"
3. Default URL: `http://localhost:1234`
4. Keep LM Studio running in the background

## Step 4: Enable LM Studio in Agent Orchestrator
Edit `services/agent-orchestrator/.env`:

```env
# Enable LM Studio
USE_LM_STUDIO=true
LM_STUDIO_URL=http://localhost:1234/v1
```

## Step 5: Restart the Agent Service
```bash
cd services/agent-orchestrator
npm run dev
```

## Test It
Now when you use Agent Research in the dashboard, it will use your local LM Studio model instead of Google Gemini!

**Benefits:**
- ✅ No API quotas
- ✅ No cost
- ✅ Works offline
- ✅ Privacy (data never leaves your Mac)

**Note:** LM Studio responses might be slower but you get unlimited usage!
