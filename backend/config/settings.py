import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def get_phpsessid():
    cookie_path = os.path.join(os.path.dirname(__file__), "cookie.txt")
    if os.path.exists(cookie_path):
        with open(cookie_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if content:
                return content
    return os.getenv("PHPSESSID", "123")

def set_phpsessid(new_sessid):
    cookie_path = os.path.join(os.path.dirname(__file__), "cookie.txt")
    with open(cookie_path, "w", encoding="utf-8") as f:
        f.write(new_sessid)

# 為了向下相容，雖然保留此變數，但建議使用 get_phpsessid()
PHPSESSID = get_phpsessid()

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
