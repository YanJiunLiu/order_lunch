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

---

## 資料庫與黑名單功能 (SQLite + Alembic)

專案包含一個基於 SQLite 的資料庫，用來儲存黑名單餐廳。
我們使用 SQLAlchemy 作為 ORM，並且使用 Alembic 作為 Migration 工具。

### 在 Docker 中的資料庫行為
如果您使用 `docker-compose up -d --build` 啟動，`docker-compose.yaml` 已經設定了以下機制：
1. **持久化儲存**：透過 `volumes: - ./backend:/app`，Docker 內部產生的 `lunch.db` 資料庫檔案會自動同步到您本機的 `backend` 目錄下，確保重啟不會遺失資料。
2. **自動 Migration**：後端容器啟動前，會自動執行 `alembic upgrade head`，幫您建立/更新資料表結構，然後才啟動 FastAPI 伺服器。

### 手動建立與更新資料庫 (Local Development)
如果您是「手動」在本地環境開發，請確保您在啟動 `uvicorn` 之前，先執行過資料庫遷移指令來建立 `lunch.db`：

```bash
cd backend

# 安裝資料庫相關套件
uv sync

# 執行升級指令，正式建立 SQLite 資料庫檔案與資料表
uv run alembic upgrade head
```

如果有更動 `models/` 目錄底下的資料表結構，請透過以下指令產生新的遷移腳本：
```bash
uv run alembic revision --autogenerate -m "您的變更說明"
```
