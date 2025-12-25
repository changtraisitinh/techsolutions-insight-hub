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
from database import init_db, get_db, ExtractionJob, LeadModel, engine

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
    """Cleanup stuck jobs and run migrations on startup"""
    init_db()
    db = next(get_db())
    try:
        # DB Migrations to fix schema updates
        from sqlalchemy import inspect
        inspector = inspect(engine)
        
        # Check Leads table
        lead_columns = [c['name'] for c in inspector.get_columns('leads')]
        if 'is_saved' not in lead_columns:
            print("🔧 Migrating database: adding is_saved column to leads table...")
            db.execute(text('ALTER TABLE leads ADD COLUMN is_saved BOOLEAN DEFAULT FALSE'))
            db.commit()
        if 'status' not in lead_columns:
            print("🔧 Migrating database: adding status column to leads table...")
            db.execute(text("ALTER TABLE leads ADD COLUMN status VARCHAR DEFAULT 'New'"))
            db.commit()
        if 'updated_at' not in lead_columns:
            print("🔧 Migrating database: adding updated_at column to leads table...")
            db.execute(text('ALTER TABLE leads ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'))
            db.commit()

        # Check ExtractionJob table
        job_columns = [c['name'] for c in inspector.get_columns('extraction_jobs')]
        if 'location' not in job_columns:
            print("🔧 Migrating database: adding location column to extraction_jobs table...")
            db.execute(text('ALTER TABLE extraction_jobs ADD COLUMN location VARCHAR'))
            db.commit()
        if 'keyword' not in job_columns:
            print("🔧 Migrating database: adding keyword column to extraction_jobs table...")
            db.execute(text('ALTER TABLE extraction_jobs ADD COLUMN keyword VARCHAR'))
            db.commit()

        # Cleanup stuck jobs
        stuck_jobs = db.query(ExtractionJob).filter(ExtractionJob.status == "processing").all()
        for job in stuck_jobs:
            job.status = "failed"
            job.error_message = "Server was restarted while job was running."
        db.commit()
    except Exception as e:
        print(f"⚠️ Startup migration/cleanup error: {e}")
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
    is_saved: bool = False
    status: str = "New"
    id: Optional[int] = None

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
    keyword: str
    location: str
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
            keyword=j.keyword or "",
            location=j.location or "",
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

@app.post("/api/leads/{lead_id}/save")
async def save_lead(lead_id: int, db: Session = Depends(get_db)):
    """Mark a specific lead as saved (converted)"""
    lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead.is_saved = True
    db.commit()
    return {"status": "success", "message": f"Lead {lead.name} saved to CRM"}

@app.post("/api/jobs/{job_id}/convert")
async def convert_job_to_leads(job_id: str, db: Session = Depends(get_db)):
    """Mark all leads from a job as saved (converted)"""
    job = db.query(ExtractionJob).filter(ExtractionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    leads = db.query(LeadModel).filter(LeadModel.job_id == job_id).all()
    for lead in leads:
        lead.is_saved = True
    
    db.commit()
    return {"status": "success", "message": f"Converted {len(leads)} leads from job {job_id}"}

@app.get("/api/leads", response_model=List[Lead])
async def list_leads(saved_only: bool = False, limit: int = 100, db: Session = Depends(get_db)):
    """List all leads, optionally filtered by status"""
    query = db.query(LeadModel)
    if saved_only:
        query = query.filter(LeadModel.is_saved == True)
    
    leads = query.order_by(LeadModel.created_at.desc()).limit(limit).all()
    return leads

@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get summarized statistics for the dashboard"""
    from sqlalchemy import func
    
    total_leads = db.query(func.count(LeadModel.id)).scalar() or 0
    managed_leads = db.query(func.count(LeadModel.id)).filter(LeadModel.is_saved == True).scalar() or 0
    total_jobs = db.query(func.count(ExtractionJob.id)).scalar() or 0
    
    avg_quality = db.query(func.avg(LeadModel.quality_score)).filter(LeadModel.is_saved == True).scalar() or 0
    
    recent_jobs = db.query(ExtractionJob).order_by(ExtractionJob.created_at.desc()).limit(5).all()
    
    return {
        "total_leads": total_leads,
        "managed_leads": managed_leads,
        "total_jobs": total_jobs,
        "avg_quality": round(float(avg_quality), 1) if avg_quality else 0,
        "conversion_rate": round((managed_leads / total_leads * 100), 1) if total_leads > 0 else 0,
        "recent_activity": [
            {
                "job_id": j.id,
                "keyword": j.keyword,
                "location": j.location,
                "leads_count": j.leads_count,
                "status": j.status,
                "date": j.created_at.isoformat()
            } for j in recent_jobs
        ]
    }

@app.get("/api/analytics")
async def get_analytics(db: Session = Depends(get_db)):
    """Detailed analytics for charts and insights"""
    from sqlalchemy import func, cast, Date
    
    # 1. Category Distribution
    categories = db.query(
        LeadModel.category, 
        func.count(LeadModel.id).label('count')
    ).group_by(LeadModel.category).order_by(text('count DESC')).limit(8).all()
    
    # 2. Daily Leads Found
    daily_leads = db.query(
        cast(LeadModel.created_at, Date).label('date'),
        func.count(LeadModel.id).label('count')
    ).group_by(cast(LeadModel.created_at, Date)).order_by(text('date')).limit(30).all()
    
    # 3. Quality Distribution
    quality_groups = [
        {"name": "Excellent (90+)", "value": db.query(func.count(LeadModel.id)).filter(LeadModel.quality_score >= 90).scalar() or 0},
        {"name": "Good (70-89)", "value": db.query(func.count(LeadModel.id)).filter(LeadModel.quality_score >= 70, LeadModel.quality_score < 90).scalar() or 0},
        {"name": "Average (50-69)", "value": db.query(func.count(LeadModel.id)).filter(LeadModel.quality_score >= 50, LeadModel.quality_score < 70).scalar() or 0},
        {"name": "Poor (<50)", "value": db.query(func.count(LeadModel.id)).filter(LeadModel.quality_score < 50).scalar() or 0},
    ]
    
    # 4. Data Richness
    has_phone = db.query(func.count(LeadModel.id)).filter(LeadModel.phone != None, LeadModel.phone != "").scalar() or 0
    has_website = db.query(func.count(LeadModel.id)).filter(LeadModel.website != None, LeadModel.website != "").scalar() or 0
    total = db.query(func.count(LeadModel.id)).scalar() or 0
    
    return {
        "categories": [{"name": c[0] or "Other", "value": c[1]} for c in categories],
        "trends": [{"date": str(d[0]), "count": d[1]} for d in daily_leads],
        "quality": quality_groups,
        "metrics": {
            "phone_percentage": round((has_phone / total * 100), 1) if total > 0 else 0,
            "website_percentage": round((has_website / total * 100), 1) if total > 0 else 0,
            "total_records": total
        }
    }

@app.post("/api/leads/{lead_id}/status")
async def update_lead_status(lead_id: int, status: str, db: Session = Depends(get_db)):
    """Update the CRM status of a lead"""
    lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead.status = status
    db.commit()
    return {"status": "success", "message": f"Lead status updated to {status}"}

@app.delete("/api/leads/{lead_id}")
async def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    """Delete a lead from the database"""
    lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    db.delete(lead)
    db.commit()
    return {"status": "success", "message": "Lead deleted"}

@app.get("/api/settings")
async def get_settings(db: Session = Depends(get_db)):
    """System configuration and metadata"""
    # Current scoring weights (matching scraper.py)
    scoring_weights = {
        "business_name": 30,
        "physical_address": 20,
        "phone_number": 15,
        "rating_min_10_reviews": 15,
        "active_website": 10,
        "google_id_verification": 10
    }
    
    # Environment info (masked)
    google_key = os.getenv("GOOGLE_API_KEY", "")
    masked_key = f"{google_key[:6]}...{google_key[-4:]}" if len(google_key) > 10 else "Not Configured"
    
    return {
        "scoring": scoring_weights,
        "environment": {
            "google_api_key": masked_key,
            "database_url": os.getenv("DATABASE_URL", "").split("@")[-1],  # Only show host
            "api_port": 8001,
            "version": "1.0.0"
        },
        "system_info": {
            "method_default": "scraping",
            "max_results_limit": 500
        }
    }

@app.post("/api/database/reset")
async def reset_database(db: Session = Depends(get_db)):
    """Wipe all leads and jobs (for maintenance)"""
    try:
        db.query(LeadModel).delete()
        db.query(ExtractionJob).delete()
        db.commit()
        return {"status": "success", "message": "Database successfully wiped"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/geolocate")
async def reverse_geocode(lat: float, lng: float):
    """Convert coordinates to address and province/city"""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        # Static mock for dev if no key (Ho Chi Minh City area)
        if 10.0 <= lat <= 11.0 and 106.0 <= lng <= 107.0:
            return {
                "address": "Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh, Vietnam",
                "province": "Ho Chi Minh City"
            }
        return {"address": f"Location at {lat}, {lng}", "province": ""}

    try:
        import googlemaps
        gmaps = googlemaps.Client(key=api_key)
        results = gmaps.reverse_geocode((lat, lng))
        
        if not results:
            return {"address": "Unknown Location", "province": ""}
            
        full_address = results[0].get('formatted_address', '')
        
        # Try to find province/city from address components
        province = ""
        for component in results[0].get('address_components', []):
            types = component.get('types', [])
            if 'administrative_area_level_1' in types:
                province = component.get('long_name', '')
                # Normalize common names to match dropdown
                if "Thành phố" in province: province = province.replace("Thành phố ", "")
                if "Tỉnh" in province: province = province.replace("Tỉnh ", "")
                break
                
        return {
            "address": full_address,
            "province": province
        }
    except Exception as e:
        print(f"Geocoding error: {e}")
        return {"address": f"Error resolving address: {str(e)}", "province": ""}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
