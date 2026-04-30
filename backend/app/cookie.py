import os
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
    先驗證其有效性，驗證通過才動態更新並寫入 cookie.txt 檔案以達持久化。
    """

    test_url = "https://welfare.ieiworld.com/meal/iei/lunch/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    def check_cookie_valid(sessid):
        try:
            res = requests.get(test_url, cookies={'PHPSESSID': sessid}, headers=headers, timeout=10)
            text = res.text
            if (not text or 
                ("location.replace" in text and "https://welfare.ieiworld.com/usering/" in text) or 
                ("location.replace" in text and "login.microsoftonline.com" in text)):
                return False
            return True
        except requests.RequestException:
            raise HTTPException(status_code=500, detail="無法連線至福利網進行驗證")

    # 1. 先檢查目前的 Cookie
    current_sessid = settings.get_phpsessid()
    if current_sessid and check_cookie_valid(current_sessid):
        # 已經有效，不需要更新
        return {"status": "success", "message": "Current cookie is still valid. No update needed.", "phpsessid": current_sessid}

    new_sessid = req.phpsessid.strip()
    if not new_sessid:
        raise HTTPException(status_code=400, detail="PHPSESSID 不可為空")

    # 2. 如果沒過在使用 req.phpsessid.strip() 做檢查
    if not check_cookie_valid(new_sessid):
        raise HTTPException(status_code=401, detail="驗證失敗：提供的新 Cookie 無效或已過期")

    # 3. 最後如果是使用 req.phpsessid.strip() 且檢查通過，要更新並寫入 cookie.txt
    try:
        settings.set_phpsessid(new_sessid)
    except Exception as e:
        print(f"寫入 cookie 檔失敗: {e}")
        return {"status": "success", "message": "Cookie valid but failed to write file.", "phpsessid": new_sessid}

    return {"status": "success", "message": "Cookie updated successfully.", "phpsessid": new_sessid}

