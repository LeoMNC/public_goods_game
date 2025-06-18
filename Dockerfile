# 1) Base image with Node + Empirica CLI
FROM ghcr.io/empiricaly/empirica:latest

WORKDIR /app

# 2) Install server dependencies
COPY server/package*.json server/
WORKDIR /app/server
RUN npm ci

# 3) Install client dependencies
COPY client/package*.json client/
WORKDIR /app/client
RUN npm ci

# 4) Copy the rest of your source
WORKDIR /app
COPY . .

# 5) (Optional) Install Vite & esbuild globally for dev
RUN npm install -g vite esbuild

# 6) Expose all the ports your dev setup uses
EXPOSE 3000 8844 5173 5174

# 7) Clean out any stale local state, cd into client, and start dev server
WORKDIR /app
CMD ["sh", "-c", "rm -rf .empirica/local/* && cd client && npm run dev"]
