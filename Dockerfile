FROM ghcr.io/empiricaly/empirica:latest

WORKDIR /app
COPY . .

# Install dependencies
WORKDIR /app/server
RUN empirica npm install

WORKDIR /app/client
RUN empirica npm install

# Set back to app root
WORKDIR /app

# Expose all needed ports
EXPOSE 3000 8844 5173 5174

CMD ["sh", "-c", "rm -f .empirica/local/tajriba.json && empirica"]