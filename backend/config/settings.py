import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 請在此填入您的 PHPSESSID
PHPSESSID = os.getenv("PHPSESSID", "r9hj55i6se421fsakamk0q8bej")

# 建立 FastAPI 實例
app = FastAPI(title="IEI Hack API", version="1.0.0")

# 設定 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "https://welfare.ieiworld.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
