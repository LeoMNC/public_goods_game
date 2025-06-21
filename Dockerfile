FROM ghcr.io/empiricaly/empirica:latest

WORKDIR /app

# Install server dependencies
COPY server/package.json server/package-lock.json server/
WORKDIR /app/server
RUN empirica npm install

# Install client dependencies
WORKDIR /app
COPY client/package.json client/package-lock.json client/
WORKDIR /app/client
RUN empirica npm install

# Copy application code
WORKDIR /app
COPY . .

# Set environment variables
ENV HOST=0.0.0.0 \
    PORT=3000 \
    VITE_DEV_SERVER_HOST=0.0.0.0 \
    VITE_DEV_SERVER_PORT=8844 \
    VITE_WS_HOST=host.docker.internal \
    NODE_ENV=development

EXPOSE 3000 8844

CMD ["sh", "-c", "rm -rf .empirica/local/* && empirica --host 0.0.0.0"]