# Dockerfile
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

# 4. Build client app
WORKDIR /app/client
RUN npm run build

# 5. Copy built frontend to /app/public for Empirica
WORKDIR /app
RUN rm -rf public \
 && mkdir -p public \
 && cp -a client/dist/. public/ \
 && ls -l public/index.html

# 6) Set environment variables
ENV HOST=0.0.0.0 \
    PORT=3000 \
    NODE_ENV=production

# 7) Only expose Empirica’s port
EXPOSE 3000

# 8) Clean old local data & start the server
CMD ["sh", "-c", "rm -rf .empirica/local/* && empirica"]
