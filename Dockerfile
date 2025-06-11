FROM ghcr.io/empiricaly/empirica:latest

WORKDIR /app
COPY . .

# Install all dependencies (server and client)
WORKDIR /app/server
RUN empirica npm install

WORKDIR /app/client
RUN empirica npm install

# Ensure Vite and esbuild are installed globally (for dev mode)
RUN npm install --global vite esbuild

# Return to root
WORKDIR /app

# Expose ports
EXPOSE 3000 8844 5173 5174

# Remove stale local file & launch
CMD ["sh", "-c", "rm -f .empirica/local/tajriba.json && empirica"]
