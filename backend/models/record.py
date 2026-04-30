from sqlalchemy import Column, Integer, String, Date
from utils.db_connection import Base

class Record(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=True)
    created = Column(Date, nullable=False)
    description = Column(String(255), nullable=True)
    created_by = Column(String(255), nullable=True)
