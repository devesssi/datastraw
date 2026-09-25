import os
import datetime
import random
import string
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, func, or_
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship

# Database setup
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tickets.db")

# Fix Render PostgreSQL URL scheme if needed
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Models
class TicketDB(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(20), unique=True, index=True, nullable=False)
    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default="Open", nullable=False) # Open, In Progress, Closed
    priority = Column(String(20), default="Medium", nullable=False) # Low, Medium, High, Urgent
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    notes = relationship("NoteDB", back_populates="ticket", cascade="all, delete-orphan", order_by="NoteDB.created_at.desc()")

class NoteDB(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(20), ForeignKey("tickets.ticket_id"), nullable=False)
    author_name = Column(String(100), default="Support Agent")
    note_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    ticket = relationship("TicketDB", back_populates="notes")

Base.metadata.create_all(bind=engine)

# Pydantic Schemas
class NoteCreate(BaseModel):
    note_text: str
    author_name: Optional[str] = "Support Agent"

class NoteResponse(BaseModel):
    id: int
    ticket_id: str
    author_name: str
    note_text: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TicketCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=100)
    customer_email: EmailStr
    subject: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    priority: Optional[str] = "Medium"

class TicketUpdate(BaseModel):
    status: Optional[str] = None # Open, In Progress, Closed
    priority: Optional[str] = None
    notes: Optional[str] = None
    author_name: Optional[str] = "Support Agent"

class TicketListItem(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    status: str
    priority: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class TicketDetail(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    priority: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    notes: List[NoteResponse] = []

    class Config:
        from_attributes = True

class StatsResponse(BaseModel):
    total: int
    open: int
    in_progress: int
    closed: int

# FastAPI App Instance
app = FastAPI(
    title="Datastraw Customer Support Ticket CRM API",
    description="Full-stack Customer Support Management System API",
    version="1.0.0"
)

# CORS Middleware for local and production deployment
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_ticket_id(db: Session) -> str:
    count = db.query(TicketDB).count()
    ticket_num = count + 1001
    return f"TKT-{ticket_num}"

# Pre-populate sample tickets if database is empty
def seed_initial_data(db: Session):
    if db.query(TicketDB).count() == 0:
        sample_tickets = [
            {
                "customer_name": "Sarah Connor",
                "customer_email": "sarah.connor@cyberdyne.com",
                "subject": "Unable to reset account password",
                "description": "I requested a password reset link 20 minutes ago but haven't received any email in my inbox or spam folder.",
                "status": "Open",
                "priority": "High"
            },
            {
                "customer_name": "Alex Mercer",
                "customer_email": "alex.m@gentek.org",
                "subject": "Billing discrepancy on invoice #INV-492",
                "description": "I was charged twice for the monthly premium tier. Please refund the duplicate charge of $49.00.",
                "status": "In Progress",
                "priority": "Urgent"
            },
            {
                "customer_name": "Elena Rostova",
                "customer_email": "elena.r@techcorp.io",
                "subject": "API Rate limit questions for enterprise plan",
                "description": "We are planning to upgrade our team to the Enterprise tier and wanted to confirm the burst limit per minute.",
                "status": "Closed",
                "priority": "Low"
            }
        ]
        for item in sample_tickets:
            t_id = generate_ticket_id(db)
            now = datetime.datetime.utcnow()
            ticket = TicketDB(
                ticket_id=t_id,
                customer_name=item["customer_name"],
                customer_email=item["customer_email"],
                subject=item["subject"],
                description=item["description"],
                status=item["status"],
                priority=item["priority"],
                created_at=now,
                updated_at=now
            )
            db.add(ticket)
            db.commit()
            db.refresh(ticket)
            
            note = NoteDB(
                ticket_id=t_id,
                author_name="System Bot",
                note_text=f"Ticket {t_id} created successfully.",
                created_at=now
            )
            db.add(note)
            db.commit()

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

# API Endpoints
@app.get("/")
def root():
    return {"message": "Datastraw Ticket CRM API is running smoothly!", "docs": "/docs"}

@app.get("/api/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    total = db.query(TicketDB).count()
    open_count = db.query(TicketDB).filter(TicketDB.status == "Open").count()
    in_progress = db.query(TicketDB).filter(TicketDB.status == "In Progress").count()
    closed = db.query(TicketDB).filter(TicketDB.status == "Closed").count()
    return StatsResponse(
        total=total,
        open=open_count,
        in_progress=in_progress,
        closed=closed
    )

@app.post("/api/tickets", status_code=status.HTTP_201_CREATED)
def create_ticket(ticket_data: TicketCreate, db: Session = Depends(get_db)):
    ticket_id = generate_ticket_id(db)
    now = datetime.datetime.utcnow()
    
    new_ticket = TicketDB(
        ticket_id=ticket_id,
        customer_name=ticket_data.customer_name,
        customer_email=ticket_data.customer_email,
        subject=ticket_data.subject,
        description=ticket_data.description,
        priority=ticket_data.priority or "Medium",
        status="Open",
        created_at=now,
        updated_at=now
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    initial_note = NoteDB(
        ticket_id=ticket_id,
        author_name="System",
        note_text=f"Ticket created by customer {ticket_data.customer_name}.",
        created_at=now
    )
    db.add(initial_note)
    db.commit()

    return {
        "ticket_id": new_ticket.ticket_id,
        "created_at": new_ticket.created_at
    }

@app.get("/api/tickets", response_model=List[TicketListItem])
def list_tickets(
    status: Optional[str] = Query(None, description="Filter by status: Open, In Progress, Closed"),
    search: Optional[str] = Query(None, description="Search across names, ticket IDs, emails, subject & description"),
    db: Session = Depends(get_db)
):
    query = db.query(TicketDB)
    
    if status and status.lower() != "all":
        query = query.filter(TicketDB.status.ilike(status.strip()))
        
    if search and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                TicketDB.ticket_id.ilike(search_term),
                TicketDB.customer_name.ilike(search_term),
                TicketDB.customer_email.ilike(search_term),
                TicketDB.subject.ilike(search_term),
                TicketDB.description.ilike(search_term)
            )
        )
        
    tickets = query.order_by(TicketDB.created_at.desc()).all()
    return tickets

@app.get("/api/tickets/{ticket_id}", response_model=TicketDetail)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(TicketDB).filter(TicketDB.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@app.put("/api/tickets/{ticket_id}")
def update_ticket(ticket_id: str, update_data: TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(TicketDB).filter(TicketDB.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    now = datetime.datetime.utcnow()
    updated = False

    if update_data.status and update_data.status != ticket.status:
        old_status = ticket.status
        ticket.status = update_data.status
        updated = True
        
        status_note = NoteDB(
            ticket_id=ticket.ticket_id,
            author_name=update_data.author_name or "Support Agent",
            note_text=f"Status changed from '{old_status}' to '{ticket.status}'.",
            created_at=now
        )
        db.add(status_note)

    if update_data.priority and update_data.priority != ticket.priority:
        ticket.priority = update_data.priority
        updated = True

    if update_data.notes and update_data.notes.strip():
        user_note = NoteDB(
            ticket_id=ticket.ticket_id,
            author_name=update_data.author_name or "Support Agent",
            note_text=update_data.notes.strip(),
            created_at=now
        )
        db.add(user_note)
        updated = True

    if updated:
        ticket.updated_at = now
        db.commit()

    return {
        "success": True,
        "updated_at": ticket.updated_at
    }

@app.post("/api/tickets/{ticket_id}/notes", response_model=NoteResponse)
def add_note(ticket_id: str, note_data: NoteCreate, db: Session = Depends(get_db)):
    ticket = db.query(TicketDB).filter(TicketDB.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    now = datetime.datetime.utcnow()
    new_note = NoteDB(
        ticket_id=ticket_id,
        author_name=note_data.author_name or "Support Agent",
        note_text=note_data.note_text.strip(),
        created_at=now
    )
    ticket.updated_at = now
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note
