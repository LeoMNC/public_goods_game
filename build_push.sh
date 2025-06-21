#!/bin/bash
# ./build_push.sh
# Build & push multi-arch Docker images with Buildx
# Usage: ./build_and_publish.sh [<docker-user>] [<tag>]
# Examples:
#   ./build_and_publish.sh           # uses default user and tag
#   ./build_and_publish.sh mxleonc   # pushes mxleonc/public-goods-game:v1
#   ./build_and_publish.sh mylab v2  # pushes mylab/public-goods-game:v2

set -euo pipefail


if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker daemon is not running. Did you forget to launch Docker Desktop?"
    exit 1
fi

DEFAULT_USER="marghetislab"
DEFAULT_TAG="v1"
DOCKER_USER="${1:-$DEFAULT_USER}"
TAG="${2:-$DEFAULT_TAG}"
IMAGE="${DOCKER_USER}/public-goods-game"
PLATFORMS="linux/amd64,linux/arm64"
BUILDER="multi-builder"

echo "[0/6] ⇒ Starting build for ${IMAGE}:${TAG} on ${PLATFORMS}"

echo "[1/6] ⇒ Verifying Buildx builder '${BUILDER}'"
if ! docker buildx inspect "${BUILDER}" &>/dev/null; then
  echo "====> Creating builder '${BUILDER}'..."
  docker buildx create --name "${BUILDER}" --driver docker-container --use
  echo "====> Builder created"
else
  echo "====> Builder exists, using '${BUILDER}'"
  docker buildx use "${BUILDER}"
fi

echo "[2/6] ⇒ Building image"
docker buildx build \
  --builder "${BUILDER}" \
  --platform "${PLATFORMS}" \
  --tag "${IMAGE}:${TAG}" \
  --load \
  --progress=plain \
  . | grep -E '^#?\d+ .+|^\[\+ Building'

echo "====> Local build complete"

echo "[3/6] ⇒ Pushing image to registry"
docker push "${IMAGE}:${TAG}" | grep -i 'digest:\|pushing'

echo "====> Push complete"

echo "[4/6] ⇒ Retrieving digest"
DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' "${IMAGE}:${TAG}")
echo "====> Image digest: ${DIGEST}"

echo "[5/6] ⇒ Verifying pushed image"
docker pull "${IMAGE}:${TAG}" >/dev/null 2>&1 && echo "====> Verified ${IMAGE}:${TAG} is accessible"

echo "[6/6] ⇒ All done! ${IMAGE}:${TAG} is now available"