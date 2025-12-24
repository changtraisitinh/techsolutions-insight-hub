# Maps Intelligence Service - API Documentation

REST API service for extracting business leads from Google Maps.

**Base URL:** http://localhost:8001

---

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start API Server

```bash
# Method 1: Using script
./start_api.sh

# Method 2: Direct command
python -m uvicorn api:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Access API

- **API:** http://localhost:8001
- **Interactive Docs:** http://localhost:8001/docs
- **OpenAPI Schema:** http://localhost:8001/openapi.json

---

## API Endpoints

### 1. Health Check

**GET** `/health`

Check if API is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-24T14:35:00",
  "google_api_configured": false
}
```

---

### 2. Extract Leads

**POST** `/api/extract`

Extract business leads from Google Maps.

**Request Body:**
```json
{
  "location": "Ho Chi Minh City",
  "keyword": "coffee shop",
  "max_results": 100,
  "method": "scraping"
}
```

**Parameters:**
- `location` (string, required): City or area to search
- `keyword` (string, required): Business type/keyword
- `max_results` (integer, optional): Max leads (1-500, default: 100)
- `method` (string, optional): "scraping" or "api" (default: "scraping")

**Response:**
```json
{
  "job_id": "uuid",
  "status": "completed",
  "leads_count": 58,
  "execution_time": 245.3,
  "method_used": "scraping",
  "leads": [
    {
      "name": "The Coffee House",
      "address": "123 Nguyễn Huệ, Q1, TP.HCM",
      "phone": "+84 28 1234 5678",
      "website": "https://thecoffeehouse.vn",
      "rating": 4.5,
      "review_count": 1250,
      "category": "cafe, coffee_shop",
      "quality_score": 95,
      "google_place_id": "ChIJ..."
    }
  ]
}
```

---

### 3. Get Job Status

**GET** `/api/jobs/{job_id}`

Get status of an extraction job.

**Response:**
```json
{
  "job_id": "uuid",
  "status": "processing",
  "progress": 45,
  "leads_count": 23,
  "message": "Processing..."
}
```

**Status values:** `pending`, `processing`, `completed`, `failed`

---

### 4. Get Job Results

**GET** `/api/jobs/{job_id}/results`

Get results of a completed job.

**Response:**
```json
{
  "job_id": "uuid",
  "leads": [...],
  "completed_at": "2024-12-24T14:40:00"
}
```

---

## Extraction Methods

### Method 1: Web Scraping (Default)

```json
{
  "method": "scraping"
}
```

**Features:**
- ✅ Completely FREE
- ✅ No API key required
- ✅ No quotas or limits
- ⚠️ Slower (3-5 min for 100 leads)

### Method 2: Google Places API

```json
{
  "method": "api"
}
```

**Features:**
- ✅ Much faster (1-2 min for 100 leads)
- ✅ More reliable
- ⚠️ Requires Google API key
- ⚠️ Costs ~$1.70 per 100 leads

**Setup:**
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Places API
3. Add to `.env`: `GOOGLE_API_KEY=your_key`

---

## Usage Examples

### cURL

```bash
# Extract with web scraping
curl -X POST "http://localhost:8001/api/extract" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Ho Chi Minh City",
    "keyword": "coffee shop",
    "max_results": 50,
    "method": "scraping"
  }'

# Check health
curl "http://localhost:8001/health"
```

### Python

```python
import requests

# Extract leads
response = requests.post('http://localhost:8001/api/extract', json={
    'location': 'Ho Chi Minh City',
    'keyword': 'coffee shop',
    'max_results': 100,
    'method': 'scraping'
})

data = response.json()
print(f"Found {data['leads_count']} leads")

for lead in data['leads']:
    print(f"- {lead['name']}: {lead['phone']}")
```

### JavaScript/Fetch

```javascript
// From frontend dashboard
const response = await fetch('http://localhost:8001/api/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'Ho Chi Minh City',
    keyword: 'coffee shop',
    max_results: 100,
    method: 'scraping'
  })
});

const data = await response.json();
console.log(`Found ${data.leads_count} leads`);
```

---

## Integration with Dashboard

Update the dashboard extraction page to call the API:

```typescript
// In dashboard/app/extract/page.tsx

const handleExtract = async () => {
  setIsExtracting(true);
  
  try {
    const response = await fetch('http://localhost:8001/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        keyword,
        max_results: maxResults,
        method: 'scraping'
      })
    });
    
    const data = await response.json();
    setResults(data.leads);
    setProgress(100);
  } catch (error) {
    console.error('Extraction failed:', error);
  } finally {
    setIsExtracting(false);
  }
};
```

---

## Error Handling

### 400 Bad Request
- Missing required fields
- Invalid method
- API key not configured (when using "api" method)

### 404 Not Found
- Job ID doesn't exist

### 500 Internal Server Error
- Extraction failed
- Network issues
- Google Maps changes

---

## CORS Configuration

API allows requests from:
- `http://localhost:3000` (Next.js dev)
- `http://localhost:3001` (alternative port)

To add more origins, edit `api.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    ...
)
```

---

## Running in Production

```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn api:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001
```

---

## Interactive API Documentation

FastAPI automatically generates interactive API documentation:

**Swagger UI:** http://localhost:8001/docs

Features:
- Try out API endpoints
- See request/response schemas
- Test authentication

**ReDoc:** http://localhost:8001/redoc

Alternative documentation format.

---

## Summary

✅ **REST API endpoints** for both extraction methods  
✅ **Web scraping** - free, no API key  
✅ **Google API** - fast, requires key  
✅ **CORS enabled** for frontend access  
✅ **Interactive docs** at `/docs`  
✅ **Job tracking** for async operations

**Start the API:** `./start_api.sh` or `python -m uvicorn api:app --port 8001 --reload`
