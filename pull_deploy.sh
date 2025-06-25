#!/usr/bin/env bash
# ./pull_deploy.sh
# Pull and run the Empirica public-goods-game container
# Usage: ./pull_deploy.sh [<docker-user>] [<tag>]
# Examples:
#   ./pull_deploy.sh             # defaults to marghetislab:v1
#   ./pull_deploy.sh mxleonc     # uses mxleonc/public-goods-game:v1
#   ./pull_deploy.sh mylab v2    # uses mylab/public-goods-game:v2

set -euo pipefail

DEFAULT_USER="marghetislab"
DEFAULT_TAG="v1"
DOCKER_USER="${1:-$DEFAULT_USER}"
TAG="${2:-$DEFAULT_TAG}"
IMAGE="${DOCKER_USER}/public-goods-game:${TAG}"

echo "[1/5] ⇒ Stopping existing container"
docker stop pgg >/dev/null 2>&1 || true
docker rm pgg   >/dev/null 2>&1 || true

echo "[2/5] ⇒ Pruning unused containers and images"
docker container prune -f >/dev/null
docker image prune    -af >/dev/null

echo "[3/5] ⇒ Pulling image ${IMAGE}"
docker pull "${IMAGE}"

echo "[4/5] ⇒ Starting container pgg"
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

echo "[5/5] ⇒ Deployed ${IMAGE}"