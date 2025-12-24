from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/insight_hub")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class ExtractionJob(Base):
    __tablename__ = "extraction_jobs"

    id = Column(String, primary_key=True, index=True)
    location = Column(String, index=True)
    keyword = Column(String, index=True)
    method = Column(String)
    status = Column(String)  # pending, processing, completed, failed
    progress = Column(Integer, default=0)
    leads_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    leads = relationship("LeadModel", back_populates="job", cascade="all, delete-orphan")

class LeadModel(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, ForeignKey("extraction_jobs.id"))
    name = Column(String, index=True)
    address = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    website = Column(Text, nullable=True)
    google_maps_url = Column(Text, nullable=True)
    rating = Column(Float, nullable=True)
    review_count = Column(Integer, nullable=True)
    category = Column(String, nullable=True)
    business_status = Column(String, nullable=True)
    quality_score = Column(Integer, nullable=True)
    google_place_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("ExtractionJob", back_populates="leads")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
