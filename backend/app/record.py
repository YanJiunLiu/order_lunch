from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional
from pydantic import BaseModel
from utils.db_connection import get_db
from models.record import Record

router = APIRouter()

class RecordCreate(BaseModel):
    name: Optional[str] = None
    created: date
    description: Optional[str] = None

class RecordResponse(BaseModel):
    id: int
    name: Optional[str]
    created: date
    description: Optional[str]
    created_by: Optional[str]

    class Config:
        from_attributes = True

@router.post("/api/v1/record", response_model=RecordResponse)
def create_record(record_in: RecordCreate, db: Session = Depends(get_db)):
    new_record = Record(
        name=record_in.name,
        created=record_in.created,
        description=record_in.description
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@router.get("/api/v1/record", response_model=List[RecordResponse])
def get_records(name: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Record)
    if name:
        query = query.filter(Record.name == name)
    # Return records ordered by created date descending
    return query.order_by(Record.created.desc()).all()

@router.delete("/api/v1/record/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(Record).filter(Record.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Record deleted"}
