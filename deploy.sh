#!/usr/bin/env bash
# deploy.sh
# Stop, remove, clean system, pull, and run the Docker container
set -euo pipefail

# Usage: ./deploy.sh [<docker-user>] [<tag>]
# Examples:
#   ./deploy.sh             # defaults to marghetislab and v1
#   ./deploy.sh mxleonc       # uses mxleonc/public-goods-game:v1
#   ./deploy.sh mxleonc v2    # uses mxleonc/public-goods-game:v2

DEFAULT_USER="marghetislab"
DEFAULT_TAG="v1"
DOCKER_USER="${1:-$DEFAULT_USER}"
TAG="${2:-$DEFAULT_TAG}"
IMAGE="${DOCKER_USER}/public-goods-game:${TAG}"

echo "[1/6] ⇒ Stopping existing container"
docker stop pgg >/dev/null 2>&1 || true
docker rm pgg >/dev/null 2>&1 || true

echo "[2/6] ⇒ Removing all unused containers"
docker container prune -f >/dev/null

echo "[3/6] ⇒ Removing all unused images"
docker image prune -af >/dev/null

echo "[4/6] ⇒ Pulling image ${IMAGE}"
docker pull "${IMAGE}"

echo "[5/6] ⇒ Starting container pgg"
docker run \
  --name pgg \
  -p 3000:3000 \
  -p 8844:8844 \
  -v empirica_data:/app/.empirica/local \
  --restart unless-stopped \
  -d \
  "${IMAGE}"

echo "[6/6] ⇒ ✅ Container pgg is running."