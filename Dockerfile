# Use platform flag for cross-compatibility
ARG EMPIRICA_IMAGE=ghcr.io/empiricaly/empirica:latest
ARG TARGET_PLATFORM=linux/amd64
FROM --platform=$TARGET_PLATFORM ${EMPIRICA_IMAGE}

WORKDIR /app
COPY . .

# Install dependencies
WORKDIR /app/server
RUN empirica npm install

WORKDIR /app/client
# Explicitly install esbuild for Linux first
RUN npm install --platform=linux --omit=optional esbuild
RUN empirica npm install

# Set back to app root
WORKDIR /app

EXPOSE 3000 8844 5173 5174

CMD ["sh", "-c", "rm -rf .empirica/local/tajriba.json && empirica"]