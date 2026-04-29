FROM node:20-alpine

WORKDIR /app

# 複製 package.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製專案原始碼
COPY . .

EXPOSE 5173

# 使用 --host 參數讓 Vite 開放對外連線
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
