from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import re

router = APIRouter()

class LoginResponse(BaseModel):
    redirect_url: str

@router.get("/api/v1/login", response_model=LoginResponse)
def get_login_url():
    """
    獲取福利網的 Microsoft OAuth 登入網址
    """
    url = "https://welfare.ieiworld.com/oauth_aad/login.php?op=aad_login"
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        
        # 尋找 location.replace 或 location.href 來擷取微軟登入網址
        match = re.search(r"location\.replace\(\s*['\"]([^'\"]+)['\"]\s*\)", res.text)
        if not match:
            match = re.search(r"location(?:\.href)?\s*=\s*['\"]([^'\"]+)['\"]", res.text)
            
        if match:
            redirect_url = match.group(1)
            return {"redirect_url": redirect_url}
        else:
            # 如果已經登入或是沒抓到跳轉網址
            raise HTTPException(status_code=500, detail="無法從福利網解析登入網址，可能該網址格式已改變。")
            
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"連線至福利網失敗: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"發生未知的錯誤: {str(e)}")
