# IEI Hack

這是一個前後端分離的專案，用於自動登入福利網並擷取每日午餐資訊。

## 專案結構

- `frontend/`: 使用 React + Vite + TypeScript 開發的前端介面。
- `backend/`: 使用 FastAPI 與 Python 3.12 開發的後端 API。
- `docker-compose.yaml`: 用於快速啟動前後端服務的 Docker 設定檔。

## 前置設定

在開始啟動服務之前，請先確保您已經設定了 Cookie：

1. 開啟 `backend/config/settings.py`。
2. 將 `PHPSESSID` 的值替換為您從瀏覽器登入福利網後取得的真實 Cookie。

## 啟動方式一：使用 Docker (推薦)

如果您有安裝 Docker，可以在專案根目錄下直接啟動所有服務：

```bash
docker-compose up -d --build
```

- 前端網頁將運行於：`http://localhost:5173`
- 後端 API 將運行於：`http://localhost:8000`

---

## 啟動方式二：手動啟動 (Local Development)

如果您想要在本地環境分開啟動服務進行開發或測試，請依照以下步驟：

### 啟動後端 (FastAPI)

請先開啟一個終端機，切換到 `backend` 目錄：

```bash
cd backend
```

您可以選擇以下其中一種方式來啟動伺服器：

**1. 使用 uv 啟動（如果您有安裝 uv）**
```bash
uv run uvicorn main:app --reload
```

**2. 使用 uvicorn 啟動（如果您已經在虛擬環境中）**
```bash
uvicorn main:app --reload
```

**3. 直接透過 Python 執行**
```bash
python main.py
```

後端成功啟動後，會顯示運行在 `http://0.0.0.0:8000`。

### 啟動前端 (React + Vite)

請開啟**另一個新的終端機視窗**，切換到 `frontend` 目錄：

```bash
cd frontend
```

安裝依賴套件並啟動開發伺服器：

```bash
npm install
npm run dev
```

前端成功啟動後，會顯示運行在 `http://localhost:5173`。請用瀏覽器開啟該網址，即可看見午餐查詢介面。
