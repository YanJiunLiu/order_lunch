from config.settings import app
from app.lunch import router as lunch_router
from app.login import router as login_router
from app.cookie import router as cookie_router

app.include_router(lunch_router)
app.include_router(login_router)
app.include_router(cookie_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
