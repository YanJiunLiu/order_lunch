FROM python:3.12-slim

WORKDIR /app

# 安裝 uv 作為套件管理工具
RUN pip install uv

# 複製依賴檔案
COPY pyproject.toml ./

# 使用 uv 安裝依賴套件至系統環境
RUN uv pip install --system -e .

# 複製專案原始碼
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
