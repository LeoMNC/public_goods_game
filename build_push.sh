#!/bin/bash
# ./build_push.sh
# Build & push multi‑arch Docker images with Buildx (with BuildKit cache)
# Cleans out every container and image before building.
# Usage: ./build_push.sh [<docker-user>] [<tag>]

set -euo pipefail

# 0/ Optional: FULL CLEANUP of all containers, images, volumes, networks, builder cache
echo "[0/6] ⇒ Stopping & removing all containers..."
docker stop $(docker ps -aq)       >/dev/null 2>&1 || true
docker rm -f $(docker ps -aq)      >/dev/null 2>&1 || true

echo "[1/6] ⇒ Removing all images..."
docker rmi -f $(docker images -aq) >/dev/null 2>&1 || true

echo "[2/6] ⇒ Pruning volumes, networks, and build cache..."
docker volume prune -f             >/dev/null 2>&1 || true
docker network prune -f            >/dev/null 2>&1 || true
docker builder prune -a --force    >/dev/null 2>&1 || true

# enable BuildKit
export DOCKER_BUILDKIT=1

# check Docker
if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker daemon is not running. Did you forget to launch Docker?" >&2
    exit 1
fi

DEFAULT_USER="marghetislab"
DEFAULT_TAG="v1"
DOCKER_USER="${1:-$DEFAULT_USER}"
TAG="${2:-$DEFAULT_TAG}"
IMAGE="${DOCKER_USER}/public-goods-game"
PLATFORMS="linux/amd64"
BUILDER="multi-builder"

# this is where we push/pull cache layers
CACHE_REF="${IMAGE}:cache"

echo "[3/6] ⇒ Starting build for ${IMAGE}:${TAG} on ${PLATFORMS}"

echo "[4/6] ⇒ Verifying Buildx builder '${BUILDER}'"
if ! docker buildx inspect "${BUILDER}" &>/dev/null; then
  echo "====> Creating builder '${BUILDER}'..."
  docker buildx create --name "${BUILDER}" --driver docker-container --use
else
  docker buildx use "${BUILDER}"
fi

echo "[5/6] ⇒ Building and pushing image (with cache)"
BUILD_LOG="$(mktemp)"
if ! docker buildx build \
     --builder "${BUILDER}" \
     --platform "${PLATFORMS}" \
     --tag "${IMAGE}:${TAG}" \
     --push \
     --cache-from=type=registry,ref="${CACHE_REF}" \
     --cache-to=type=registry,ref="${CACHE_REF}",mode=max \
     --progress=plain \
     . >"$BUILD_LOG" 2>&1; then
  echo "============================================================" >&2
  echo "!!! BUILD OR PUSH FAILED !!!" >&2
  echo "============================================================" >&2
  grep -E 'error: no such object|push access denied' "$BUILD_LOG" >&2 || echo "Unknown error" >&2
  rm "$BUILD_LOG"
  exit 1
fi
rm "$BUILD_LOG"

echo "[6/6] ⇒ Verifying & reporting"

# Check if the image digest is available locally in build output metadata
DIGEST=$(docker buildx imagetools inspect "${IMAGE}:${TAG}" --format '{{.Manifest.Digest}}' 2>/dev/null)

if [[ -n "$DIGEST" ]]; then
  echo "====> Successfully pushed: ${IMAGE}@${DIGEST}"
  echo "====> Image tag: ${IMAGE}:${TAG}"
else
  echo "!!! VERIFY FAILED: digest not found via imagetools inspect !!!" >&2
  exit 1
fi

DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' "${IMAGE}:${TAG}")
echo "====> Image digest: ${DIGEST}"
echo "All done!"
