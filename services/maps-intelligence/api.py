"""
Maps Intelligence API Server
Provides REST API endpoints for Google Maps lead extraction
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import asyncio
import uuid
from datetime import datetime
import os
import io
import csv
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from sqlalchemy import text

# Import extraction modules
from scraper import GoogleMapsScraper
from api_extractor import GoogleMapsAPIExtractor
from database import init_db, get_db, ExtractionJob, LeadModel

load_dotenv()

# Initialize Database
init_db()

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

@app.on_event("startup")
def startup_event():
    """Cleanup stuck jobs on startup"""
    init_db()
    db = next(get_db())
    try:
        stuck_jobs = db.query(ExtractionJob).filter(ExtractionJob.status == "processing").all()
        for job in stuck_jobs:
            job.status = "failed"
            job.error_message = "Server was restarted while job was running."
        db.commit()
    finally:
        db.close()

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
    business_status: Optional[str] = None
    quality_score: Optional[int] = None
    google_place_id: Optional[str] = None
    google_maps_url: Optional[str] = None

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
    created_at: datetime

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Check DB connection
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except:
        db_status = "disconnected"
        
    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.now().isoformat(),
        "google_api_configured": bool(os.getenv("GOOGLE_API_KEY"))
    }

async def run_extraction_task(job_id: str, request: ExtractionRequest):
    """Background task to run extraction and save to DB"""
    db = next(get_db())
    job = db.query(ExtractionJob).filter(ExtractionJob.id == job_id).first()
    
    try:
        if request.method == "scraping":
            scraper = GoogleMapsScraper(headless=True)
            leads_data = await scraper.scrape_places(
                location=request.location,
                keyword=request.keyword,
                max_results=request.max_results
            )
        else:
            api_key = os.getenv("GOOGLE_API_KEY")
            extractor = GoogleMapsAPIExtractor(api_key)
            leads_data = await extractor.extract_places(
                location=request.location,
                keyword=request.keyword,
                max_results=request.max_results
            )
        
        # Save leads to DB
        for lead_data in leads_data:
            lead = LeadModel(
                job_id=job_id,
                **lead_data
            )
            db.add(lead)
            
        # Update job status
        job.status = "completed"
        job.progress = 100
        job.leads_count = len(leads_data)
        db.commit()
        
    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        db.commit()
    finally:
        db.close()

@app.post("/api/extract", response_model=ExtractionResponse)
async def extract_leads(request: ExtractionRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Extract business leads from Google Maps
    """
    job_id = str(uuid.uuid4())
    start_time = datetime.now()
    
    # Create job in DB
    job = ExtractionJob(
        id=job_id,
        location=request.location,
        keyword=request.keyword,
        method=request.method,
        status="processing",
        progress=0
    )
    db.add(job)
    db.commit()
    
    # Run extraction in background
    background_tasks.add_task(run_extraction_task, job_id, request)
    
    return ExtractionResponse(
        job_id=job_id,
        status="processing",
        leads_count=0,
        leads=[],
        execution_time=0,
        method_used=request.method
    )

@app.get("/api/jobs", response_model=List[JobStatus])
async def list_jobs(limit: int = 10, db: Session = Depends(get_db)):
    """List recent extraction jobs"""
    jobs = db.query(ExtractionJob).order_by(ExtractionJob.created_at.desc()).limit(limit).all()
    return [
        JobStatus(
            job_id=j.id,
            status=j.status,
            progress=j.progress,
            leads_count=j.leads_count,
            message=j.error_message or "",
            created_at=j.created_at
        ) for j in jobs
    ]

@app.get("/api/jobs/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str, db: Session = Depends(get_db)):
    """Get the status of an extraction job"""
    job = db.query(ExtractionJob).filter(ExtractionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobStatus(
        job_id=job.id,
        status=job.status,
        progress=job.progress,
        leads_count=job.leads_count,
        message=job.error_message or "Processing...",
        created_at=job.created_at
    )

@app.get("/api/jobs/{job_id}/results")
async def get_job_results(job_id: str, db: Session = Depends(get_db)):
    """Get the results of a completed extraction job"""
    job = db.query(ExtractionJob).filter(ExtractionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "completed":
        raise HTTPException(status_code=400, detail=f"Job is {job.status}, not completed")
    
    leads = db.query(LeadModel).filter(LeadModel.job_id == job_id).all()
    return {
        "job_id": job_id,
        "leads": leads,
        "completed_at": job.updated_at.isoformat()
    }

@app.get("/api/jobs/{job_id}/export")
async def export_job_csv(job_id: str, db: Session = Depends(get_db)):
    """Export job results as a CSV file"""
    job = db.query(ExtractionJob).filter(ExtractionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
        
    leads = db.query(LeadModel).filter(LeadModel.job_id == job_id).all()
    
    # Create CSV in memory
    output = io.StringIO()
    fieldnames = list(Lead.model_fields.keys())
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    for lead in leads:
        lead_dict = {f: getattr(lead, f, '') for f in fieldnames}
        writer.writerow(lead_dict)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8-sig')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=leads_{job_id}.csv"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
