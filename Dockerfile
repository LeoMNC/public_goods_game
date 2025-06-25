FROM ghcr.io/empiricaly/empirica:latest

WORKDIR /app

# 1) Install server dependencies
COPY server/package.json server/package-lock.json server/
WORKDIR /app/server
RUN empirica npm install

# 2) Install client dependencies
WORKDIR /app
COPY client/package.json client/package-lock.json client/
WORKDIR /app/client
RUN empirica npm install

# 3) Copy application code
WORKDIR /app
COPY . .

# 4) Set environment variables
ENV HOST=0.0.0.0 \
    PORT=3000 \
    VITE_DEV_SERVER_HOST=0.0.0.0 \
    VITE_DEV_SERVER_PORT=8844 \
    VITE_WS_HOST=0.0.0.0 \
    NODE_ENV=development

# 5) Expose both Empirica (3000) and Vite HMR (8844)
EXPOSE 3000 8844

# 6) Clean any old state and start
CMD ["sh", "-c", "rm -rf .empirica/local/* && empirica"]
