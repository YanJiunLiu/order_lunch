import os
import re
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import config.settings as settings

router = APIRouter()

class CookieUpdateRequest(BaseModel):
    phpsessid: str

@router.post("/api/v1/cookie")
def update_cookie(req: CookieUpdateRequest):
    """
    接收來自書籤 (Bookmarklet) 傳來的 PHPSESSID，
    先驗證其有效性，驗證通過才動態更新記憶體並寫入檔案以達持久化。
    """
    new_sessid = req.phpsessid.strip()
    if not new_sessid:
        raise HTTPException(status_code=400, detail="PHPSESSID 不可為空")

    # 0. 驗證 Cookie 是否有效
    try:
        test_url = "https://welfare.ieiworld.com/meal/iei/lunch/"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        }
        res = requests.get(test_url, cookies={'PHPSESSID': new_sessid}, headers=headers, timeout=10)

        text = res.text
        if (not text or 
            ("location.replace" in text and "https://welfare.ieiworld.com/usering/" in text) or 
            ("location.replace" in text and "login.microsoftonline.com" in text)):
            raise HTTPException(status_code=401, detail="驗證失敗：此 Cookie 無效或已過期")
    except requests.RequestException:
        raise HTTPException(status_code=500, detail="無法連線至福利網進行驗證")
    except HTTPException:
        raise

    # 1. 更新記憶體
    settings.PHPSESSID = new_sessid

    # 2. 更新檔案 (backend/config/settings.py)
    settings_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "settings.py")
    try:
        with open(settings_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 使用正則替換 PHPSESSID = "..." 或 PHPSESSID = os.getenv(..., "...")
        # 我們直接找到 PHPSESSID 定義的那一行，替換它的預設值
        new_content = re.sub(
            r'PHPSESSID\s*=\s*os\.getenv\("PHPSESSID",\s*"[^"]*"\)',
            f'PHPSESSID = os.getenv("PHPSESSID", "{new_sessid}")',
            content
        )
        # 兼容另一種可能寫法：PHPSESSID = "..."
        if new_content == content:
             new_content = re.sub(
                r'PHPSESSID\s*=\s*"[^"]*"',
                f'PHPSESSID = "{new_sessid}"',
                content
             )

        with open(settings_path, "w", encoding="utf-8") as f:
            f.write(new_content)

    except Exception as e:
        print(f"寫入設定檔失敗: {e}")
        # 即便寫檔失敗，也算是成功更新了記憶體
        return {"status": "success", "message": "Cookie updated in memory (failed to write file)."}

    return {"status": "success", "message": "Cookie updated successfully."}
