from config.settings import app
from utils.db_connection import engine, Base
from models.black_list import BlackListRestaurant
from models.record import Record

# 自動建立所有未建立的資料表
Base.metadata.create_all(bind=engine)

from app.lunch import router as lunch_router
from app.login import router as login_router
from app.cookie import router as cookie_router
from app.black_list import router as black_list_router
from app.record import router as record_router

app.include_router(lunch_router)
app.include_router(login_router)
app.include_router(cookie_router)
app.include_router(black_list_router)
app.include_router(record_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
