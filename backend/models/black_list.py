from sqlalchemy import Column, Integer, String
from utils.db_connection import Base

class BlackListRestaurant(Base):
    __tablename__ = "blacklist_restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
