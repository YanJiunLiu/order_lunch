from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional
import requests
import urllib.parse
import re
from config import settings

router = APIRouter()

class LunchOption(BaseModel):
    restaurant: str
    purchase_link: str

class LunchResponse(BaseModel):
    options: list[LunchOption]

@router.get("/api/v1/lunch", response_model=LunchResponse)
def get_lunch_data(date: Optional[str] = None):
    if not settings.PHPSESSID or settings.PHPSESSID == "請填寫您的_PHPSESSID":
        raise HTTPException(status_code=400, detail="請先在 backend/config/settings.py 中設定 PHPSESSID")

    base_url = "https://welfare.ieiworld.com"
    # 保留您之前加入的各種 Cookie，以防萬一
    cookies = {
        'PHPSESSID': settings.PHPSESSID,
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
         "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    }
    
    session = requests.Session()
    session.cookies.update(cookies)
    session.headers.update(headers)
    
    try:
        # Step 1: find lunch url for the specific date
        if date:
            target_date = date
        else:
            target_date = datetime.now().strftime("%Y%m%d")
            
        today_url = f"{base_url}/meal/iei/lunch/con_show.php?act={target_date}"
        print(f"Fetching lunch for {target_date} from: {today_url}")

        # Step 2: get today lunch
        res_today = session.get(today_url, timeout=10)
        res_today.raise_for_status()
        res_today.encoding = 'utf-8' # Ensure correct encoding if needed
        
        # if last page is login page, raise error
        if "location.replace" in res_today.text and "login.microsoftonline.com" in res_today.text:
            raise HTTPException(status_code=401, detail="Session 在最後一步失效，請重新取得最新的 PHPSESSID。")
        
        # Step 3: parse today lunch html and extract restaurants
        lunch_html = BeautifulSoup(res_today.text, "html.parser")
        
        # 使用 list 來保存結果，並用 set 去重
        options_list = []
        seen_restaurants = set()
        
        base_lunch_dir = f"{base_url}/meal/iei/lunch/"
        
        # 方法 A: 尋找 title="查看訂單明細" 或 包含 order_detail.php
        for a in lunch_html.find_all('a', href=True):
            href = a['href']
            title = a.get('title', '')
            
            if "order_detail.php" in href or title == "查看訂單明細":
                text = a.get_text(strip=True)
                if text and text not in seen_restaurants:
                    seen_restaurants.add(text)
                    
                    # 尋找這個餐廳對應的「開始訂」按鈕
                    purchase_link = ""
                    
                    # 往上尋找共同的容器 (例如 tr 或上一層的 div)
                    container = a.find_parent('tr')
                    if not container:
                        container = a.find_parent('div')
                        
                    if container:
                        # 尋找文字、title、或 alt 包含「開始訂」的元素
                        def has_start_order(tag):
                            if "開始訂" in tag.get_text():
                                return True
                            if tag.has_attr('title') and "開始訂" in tag['title']:
                                return True
                            if tag.has_attr('alt') and "開始訂" in tag['alt']:
                                return True
                            if tag.has_attr('value') and "開始訂" in tag['value']:
                                return True
                            return False
                            
                        order_elem = container.find(has_start_order)
                        
                        if order_elem:
                            if order_elem.name == 'a' and order_elem.has_attr('href'):
                                purchase_link = urllib.parse.urljoin(base_lunch_dir, order_elem['href'])
                            elif order_elem.parent and order_elem.parent.name == 'a' and order_elem.parent.has_attr('href'):
                                purchase_link = urllib.parse.urljoin(base_lunch_dir, order_elem.parent['href'])
                            elif order_elem.has_attr('onclick'):
                                onclick_text = order_elem['onclick']
                                # 檢查是否為 order_submit(604,95)
                                order_submit_match = re.search(r"order_submit\(\s*['\"]?([^,'\"\s]+)['\"]?\s*,\s*['\"]?([^,'\"\s]+)['\"]?\s*\)", onclick_text)
                                if order_submit_match:
                                    osn = order_submit_match.group(1)
                                    sid = order_submit_match.group(2)
                                    target_href = f"order_main.php?osn={osn}&sid={sid}"
                                    purchase_link = urllib.parse.urljoin(base_lunch_dir, target_href)
                                else:
                                    match = re.search(r"location(?:\.href)?\s*=\s*['\"]([^'\"]+)['\"]", onclick_text)
                                    if match:
                                        purchase_link = urllib.parse.urljoin(base_lunch_dir, match.group(1))
                                    
                    options_list.append({"restaurant": text, "purchase_link": purchase_link})
                    
        print("找到的餐廳選項：", options_list)

        return {
            "options": options_list
        }
        
    except requests.RequestException as e:
        print(f"Request Error: {e}")
        raise HTTPException(status_code=500, detail=f"與福利網連線失敗: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"發生未知的錯誤: {str(e)}")
