#!/usr/bin/env bash
# ./build_push.sh
# Bundle Empirica app, then build & push multi-arch Docker images with Buildx (and BuildKit cache)
# Usage: ./build_push.sh [<docker-user>] [<tag>] [--full-clean]
#
# Examples:
#   ./build_push.sh marghetislab v1
#   ./build_push.sh marghetislab v1 --full-clean
#
# Notes:
# - Requires: empirica CLI, Docker with Buildx
# - This script does NOT run the container; it only bundles, builds, and pushes.

set -euo pipefail

DEFAULT_USER="marghetislab"
DEFAULT_TAG="v1"
DOCKER_USER="${1:-$DEFAULT_USER}"
TAG="${2:-$DEFAULT_TAG}"
FULL_CLEAN="${3:-}"

IMAGE="${DOCKER_USER}/public-goods-game"
PLATFORMS="linux/amd64"   # add ,linux/arm64 if you want
BUILDER="multi-builder"

# enable BuildKit
export DOCKER_BUILDKIT=1

step() { echo "[$1] ⇒ $2"; }

# 0/ Optional: aggressive Docker cleanup (matches your original script) — opt-in only
if [[ "${FULL_CLEAN:-}" == "--full-clean" ]]; then
  step "0/7" "Stopping & removing all containers..."
  docker stop $(docker ps -aq)       >/dev/null 2>&1 || true
  docker rm -f $(docker ps -aq)      >/dev/null 2>&1 || true

  step "1/7" "Removing all images..."
  docker rmi -f $(docker images -aq) >/dev/null 2>&1 || true

  step "2/7" "Pruning volumes, networks, and build cache..."
  docker volume prune -f             >/dev/null 2>&1 || true
  docker network prune -f            >/dev/null 2>&1 || true
  docker builder prune -a --force    >/dev/null 2>&1 || true
else
  step "0/7" "Skipping destructive Docker cleanup (pass --full-clean to enable)"
fi

# 3/ Verify Docker daemon
if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not running. Did you forget to launch Docker?" >&2
  exit 1
fi

# 4/ Verify Empirica CLI
step "3/7" "Verifying Empirica CLI..."
if ! command -v empirica >/dev/null 2>&1; then
  echo "Error: empirica CLI not found. Install with: curl https://install.empirica.dev | sh -s" >&2
  exit 1
fi

# 5/ Bundle Empirica app
step "4/7" "Bundling experiment with empirica bundle..."
# Clean previous bundles this script might have created
mkdir -p dist
shopt -s nullglob
for f in dist/*.tar.zst; do rm -f "$f"; done

if ! empirica bundle; then
  echo "!!! ERROR: empirica bundle failed !!!" >&2
  exit 1
fi

NEWEST_BUNDLE="$(ls -t *.tar.zst 2>/dev/null | head -n 1 || true)"
if [[ -z "${NEWEST_BUNDLE}" ]]; then
  echo "!!! ERROR: No bundle (*.tar.zst) found after bundling !!!" >&2
  exit 1
fi

TAGGED_BUNDLE="dist/empirica-bundle-${TAG}.tar.zst"
cp -f "${NEWEST_BUNDLE}" "${TAGGED_BUNDLE}"
echo "====> Created bundle: ${TAGGED_BUNDLE}"

if [[ ! -s "${TAGGED_BUNDLE}" ]]; then
  echo "!!! ERROR: Bundle file is empty or missing: ${TAGGED_BUNDLE} !!!" >&2
  exit 1
fi

# 6/ Ensure Buildx builder
step "5/7" "Verifying Buildx builder '${BUILDER}'"
if ! docker buildx inspect "${BUILDER}" &>/dev/null; then
  echo "====> Creating builder '${BUILDER}'..."
  docker buildx create --name "${BUILDER}" --driver docker-container --use
else
  docker buildx use "${BUILDER}"
fi

# 7/ Build & push image with cache
CACHE_REF="${IMAGE}:cache"
step "6/7" "Building and pushing ${IMAGE}:${TAG} for ${PLATFORMS}"
BUILD_LOG="$(mktemp)"

set +e
docker buildx build \
  --builder "${BUILDER}" \
  --platform "${PLATFORMS}" \
  --tag "${IMAGE}:${TAG}" \
  --push \
  --cache-from=type=registry,ref="${CACHE_REF}" \
  --cache-to=type=registry,ref="${CACHE_REF}",mode=max \
  --build-arg BUNDLE_FILE="${TAGGED_BUNDLE}" \
  --progress=plain \
  -f Dockerfile.empirica \
  . >"$BUILD_LOG" 2>&1
STATUS=$?
set -e

if [[ $STATUS -ne 0 ]]; then
  echo "============================================================" >&2
  echo "!!! BUILD OR PUSH FAILED !!!" >&2
  echo "============================================================" >&2
  grep -E 'error: no such object|push access denied|no basic auth credentials|denied: requested access' "$BUILD_LOG" >&2 || echo "Unknown error" >&2
  rm -f "$BUILD_LOG"
  exit 1
fi
rm -f "$BUILD_LOG"

# 8/ Verify remote
step "7/7" "Verifying & reporting"
REMOTE_DIGEST=$(docker buildx imagetools inspect "${IMAGE}:${TAG}" --format '{{.Manifest.Digest}}' 2>/dev/null || true)

if [[ -n "$REMOTE_DIGEST" ]]; then
  echo "====> Successfully pushed: ${IMAGE}@${REMOTE_DIGEST}"
  echo "====> Image tag: ${IMAGE}:${TAG}"
  echo "All done!"
else
  echo "!!! ERROR: Image was not found in registry via imagetools inspect !!!" >&2
  exit 1
fi
