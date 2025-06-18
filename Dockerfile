# Base image with Node + Empirica CLI
FROM ghcr.io/empiricaly/empirica:latest

# Set working dir
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

# 3) Copy the rest of your application code
WORKDIR /app
COPY . .

# 4) (Optional) Install global dev tools if you need them
#    You can remove this if you only ever run in prod mode.
RUN empirica npm install -g vite esbuild

# 5) Expose only the ports your app actually uses
#    - 3000: Empirica backend + admin UI
#    - 8844: Empirica HMR channel (dev mode)
EXPOSE 3000 8844

# 6) On container start, wipe stale local data and launch Empirica
CMD ["sh","-c","rm -rf .empirica/local/* && empirica"]