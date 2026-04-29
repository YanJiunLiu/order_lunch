from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from utils.db_connection import get_db
from models.black_list import BlackListRestaurant

router = APIRouter()

class BlackListCreate(BaseModel):
    name: str

class BlackListResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

@router.post("/api/v1/black_list", response_model=BlackListResponse)
def create_black_list(item: BlackListCreate, db: Session = Depends(get_db)):
    # 檢查是否已存在
    existing = db.query(BlackListRestaurant).filter(BlackListRestaurant.name == item.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="此餐廳已經在黑名單中")
    
    new_item = BlackListRestaurant(name=item.name)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/api/v1/black_list", response_model=List[BlackListResponse])
def get_black_list(db: Session = Depends(get_db)):
    items = db.query(BlackListRestaurant).all()
    return items

@router.delete("/api/v1/black_list/{id}")
def delete_black_list(id: int, db: Session = Depends(get_db)):
    item = db.query(BlackListRestaurant).filter(BlackListRestaurant.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="找不到指定的黑名單項目")
    
    db.delete(item)
    db.commit()
    return {"status": "success", "message": f"已刪除黑名單項目: {item.name}"}
