# deploy.sh
# Stop, remove, pull, and run the Docker container on the Droplet

#!/usr/bin/env bash
set -euo pipefail

# Usage: ./deploy.sh [<docker-user>] [<tag>]
# Examples:
#   ./deploy.sh             # defaults to mxleonc and v1
#   ./deploy.sh mylab       # uses mylab/public-goods-game:v1
#   ./deploy.sh mylab v2    # uses mylab/public-goods-game:v2

DEFAULT_USER="mxleonc"
DEFAULT_TAG="v1"
DOCKER_USER="${1:-$DEFAULT_USER}"
TAG="${2:-$DEFAULT_TAG}"
IMAGE="${DOCKER_USER}/public-goods-game:${TAG}"

echo "Deploying ${IMAGE} to Droplet..."

docker stop pgg    >/dev/null 2>&1 || true
docker rm   pgg    >/dev/null 2>&1 || true

echo "Pulling image ${IMAGE}..."
docker pull "${IMAGE}"

echo "Starting container pgg..."
docker run -d \
  --name pgg \
  -p 3000:3000 \
  -p 8844:8844 \
  -v empirica_data:/app/.empirica/local \
  --restart unless-stopped \
  "${IMAGE}"

echo "✅ Container pgg is running."
