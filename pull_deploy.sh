#!/usr/bin/env bash
# ./pull_deploy.sh
# Full cleanup + pull & deploy Empirica public-goods-game container
# Usage: ./pull_deploy.sh [<docker-user>] [<tag>]

set -euo pipefail

# 0/6 ⇒ STOP & REMOVE ALL CONTAINERS
echo "[0/6] ⇒ Stopping & removing all containers..."
docker stop $(docker ps -aq) >/dev/null 2>&1 || true
docker rm -f $(docker ps -aq) >/dev/null 2>&1 || true

# 1/6 ⇒ REMOVE ALL IMAGES
echo "[1/6] ⇒ Removing all images..."
docker rmi -f $(docker images -aq) >/dev/null 2>&1 || true

# 2/6 ⇒ PRUNE VOLUMES, NETWORKS, BUILD CACHE
echo "[2/6] ⇒ Pruning volumes, networks, and build cache..."
docker volume prune -f >/dev/null 2>&1   # remove anonymous volumes :contentReference[oaicite:3]{index=3}
docker network prune -f >/dev/null 2>&1  # remove unused networks :contentReference[oaicite:4]{index=4}
docker builder prune -a --force >/dev/null 2>&1  # BuildKit cache :contentReference[oaicite:5]{index=5}

# 3/6 ⇒ SETUP IMAGE VARIABLES
DEFAULT_USER="marghetislab"
DEFAULT_TAG="v1"
DOCKER_USER="${1:-$DEFAULT_USER}"
TAG="${2:-$DEFAULT_TAG}"
IMAGE="${DOCKER_USER}/public-goods-game:${TAG}"

# 4/6 ⇒ PULL THE IMAGE
echo "[4/6] ⇒ Pulling image ${IMAGE}..."
docker pull "${IMAGE}"

# 5/6 ⇒ RUN THE CONTAINER
echo "[5/6] ⇒ Starting container pgg..."
docker run \
  --name pgg \
  -p 3000:3000 \
  -p 8844:8844 \
  -e HOST=0.0.0.0 \
  -e PORT=3000 \
  -e VITE_DEV_SERVER_HOST=0.0.0.0 \
  -e VITE_DEV_SERVER_PORT=8844 \
  -e VITE_WS_HOST=0.0.0.0 \
  -e NODE_ENV=development \
  -v empirica_data:/app/.empirica/local \
  --restart unless-stopped \
  "${IMAGE}"

# 6/6 ⇒ DONE
echo "[6/6] ⇒ Deployed ${IMAGE} successfully."
