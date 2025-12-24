"""
Maps Intelligence API Server
Provides REST API endpoints for Google Maps lead extraction
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import asyncio
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Import extraction modules
from scraper import GoogleMapsScraper
from api_extractor import GoogleMapsAPIExtractor

load_dotenv()

app = FastAPI(
    title="Maps Intelligence API",
    description="Extract business leads from Google Maps",
    version="1.0.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class ExtractionRequest(BaseModel):
    location: str = Field(..., description="City or area to search")
    keyword: str = Field(..., description="Business type/keyword")
    max_results: int = Field(default=100, ge=1, le=500)
    method: Literal["scraping", "api"] = Field(default="scraping")

class Lead(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    category: Optional[str] = None
    quality_score: Optional[int] = None
    google_place_id: Optional[str] = None

class ExtractionResponse(BaseModel):
    job_id: str
    status: str
    leads_count: int
    leads: List[Lead]
    execution_time: float
    method_used: str

class JobStatus(BaseModel):
    job_id: str
    status: Literal["pending", "processing", "completed", "failed"]
    progress: int
    leads_count: int
    message: str

# In-memory job storage (use Redis/DB in production)
jobs = {}

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "service": "Maps Intelligence API",
        "version": "1.0.0",
        "endpoints": {
            "extract": "/api/extract",
            "health": "/health",
            "jobs": "/api/jobs/{job_id}"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "google_api_configured": bool(os.getenv("GOOGLE_API_KEY"))
    }

@app.post("/api/extract", response_model=ExtractionResponse)
async def extract_leads(request: ExtractionRequest, background_tasks: BackgroundTasks):
    """
    Extract business leads from Google Maps
    
    Methods:
    - scraping: Free web scraping (slower, 3-5 min for 100 leads)
    - api: Google Places API (faster, requires API key)
    """
    
    job_id = str(uuid.uuid4())
    start_time = datetime.now()
    
    # Initialize job tracking
    jobs[job_id] = {
        "status": "processing",
        "progress": 0,
        "leads": [],
        "started_at": start_time.isoformat()
    }
    
    try:
        if request.method == "scraping":
            # Web scraping method
            scraper = GoogleMapsScraper(headless=True)
            leads_data = await scraper.scrape_places(
                location=request.location,
                keyword=request.keyword,
                max_results=request.max_results
            )
            
        else:  # api method
            # Check if API key is configured
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise HTTPException(
                    status_code=400,
                    detail="Google API key not configured. Use 'scraping' method instead or configure GOOGLE_API_KEY in .env"
                )
            
            # Google Places API method
            extractor = GoogleMapsAPIExtractor(api_key)
            leads_data = await extractor.extract_places(
                location=request.location,
                keyword=request.keyword,
                max_results=request.max_results
            )
        
        # Convert to Lead models
        leads = [Lead(**lead) for lead in leads_data]
        
        # Calculate execution time
        execution_time = (datetime.now() - start_time).total_seconds()
        
        # Update job status
        jobs[job_id] = {
            "status": "completed",
            "progress": 100,
            "leads": leads,
            "completed_at": datetime.now().isoformat()
        }
        
        return ExtractionResponse(
            job_id=job_id,
            status="completed",
            leads_count=len(leads),
            leads=leads,
            execution_time=execution_time,
            method_used=request.method
        )
        
    except Exception as e:
        jobs[job_id] = {
            "status": "failed",
            "progress": 0,
            "error": str(e)
        }
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jobs/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    """Get the status of an extraction job"""
    
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    return JobStatus(
        job_id=job_id,
        status=job.get("status", "unknown"),
        progress=job.get("progress", 0),
        leads_count=len(job.get("leads", [])),
        message=job.get("error", "Processing...")
    )

@app.get("/api/jobs/{job_id}/results")
async def get_job_results(job_id: str):
    """Get the results of a completed extraction job"""
    
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job is {job['status']}, not completed"
        )
    
    return {
        "job_id": job_id,
        "leads": job["leads"],
        "completed_at": job["completed_at"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
