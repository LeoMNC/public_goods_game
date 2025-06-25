FROM ghcr.io/empiricaly/empirica:latest

# Set working directory
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

# 3) Copy entire app source
WORKDIR /app
COPY . .

# 4) Set environment variables (no VITE_DEV_* here)
ENV HOST=0.0.0.0 \
    PORT=3000 \
    NODE_ENV=production

# 5) Only expose the Empirica port
EXPOSE 3000

# 6) Clean old data and start Empirica
CMD ["sh", "-c", "rm -rf .empirica/local/* && empirica"]
