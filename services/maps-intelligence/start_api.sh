#!/bin/bash

# Start Maps Intelligence API Server

echo "🚀 Starting Maps Intelligence API..."
echo "📍 API will be available at: http://localhost:8001"
echo "📖 API docs at: http://localhost:8001/docs"
echo ""

# Run with uvicorn
python -m uvicorn api:app --host 0.0.0.0 --port 8001 --reload
