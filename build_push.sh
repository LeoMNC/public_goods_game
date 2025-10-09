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

# ---------- Config ----------
DEFAULT_USER="marghetislab"
DEFAULT_TAG="v1"
BUILDER="multi-builder"

# Allow override via env, e.g. PLATFORMS="linux/amd64,linux/arm64"
PLATFORMS_VAL="${PLATFORMS:-linux/amd64}"

# Enable BuildKit
export DOCKER_BUILDKIT=1

step() { echo "[$1] ⇒ $2"; }

# ---------- Args ----------
# Accept positional args but allow auto-detected Docker Hub username
CLI_USER="${1:-}"
TAG="${2:-$DEFAULT_TAG}"
FULL_CLEAN="${3:-}"

# ---------- Pre-flight: Docker daemon ----------
step "0/8" "Checking Docker daemon..."
if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not running. Did you forget to launch Docker?" >&2
  exit 1
fi

# ---------- Compute Docker user (CLI > logged-in > default) ----------
AUTO_USER="$(docker info --format '{{.Username}}' 2>/dev/null || true)"
if [[ -z "$AUTO_USER" ]]; then
  AUTO_USER="$DEFAULT_USER"
fi
DOCKER_USER="${CLI_USER:-$AUTO_USER}"

# ---------- Readonly guards ----------
readonly DEFAULT_USER DEFAULT_TAG BU ILDER PLATFORMS_VAL
readonly TAG FULL_CLEAN DOCKER_USER

IMAGE="${DOCKER_USER}/public-goods-game"
CACHE_REF="${IMAGE}:cache"

# ---------- Optional destructive cleanup ----------
if [[ "${FULL_CLEAN:-}" == "--full-clean" ]]; then
  step "1/8" "Stopping & removing all containers..."
  docker stop $(docker ps -aq)       >/dev/null 2>&1 || true
  docker rm -f $(docker ps -aq)      >/dev/null 2>&1 || true

  step "2/8" "Removing all images..."
  docker rmi -f $(docker images -aq) >/dev/null 2>&1 || true

  step "3/8" "Pruning volumes, networks, and build cache..."
  docker volume prune -f             >/dev/null 2>&1 || true
  docker network prune -f            >/dev/null 2>&1 || true
  docker builder prune -a --force    >/dev/null 2>&1 || true
else
  step "1/8" "Skipping destructive Docker cleanup (pass --full-clean to enable)"
fi

# ---------- Verify Empirica CLI ----------
step "4/8" "Verifying Empirica CLI..."
if ! command -v empirica >/dev/null 2>&1; then
  echo "Error: empirica CLI not found. Install with: curl https://install.empirica.dev | sh -s" >&2
  exit 1
fi

# ---------- Verify required files ----------
[[ -f Dockerfile.empirica ]] || { echo "Error: Dockerfile.empirica not found."; exit 1; }

# ---------- Bundle Empirica app ----------
step "5/8" "Bundling experiment with empirica bundle..."
mkdir -p dist
shopt -s nullglob
rm -f dist/*.tar.zst

if ! empirica bundle; then
  echo "!!! ERROR: empirica bundle failed !!!" >&2
  exit 1
fi

NEWEST_BUNDLE="$(ls -t ./*.tar.zst 2>/dev/null | head -n 1 || true)"
if [[ -z "${NEWEST_BUNDLE}" ]]; then
  echo "!!! ERROR: No bundle (*.tar.zst) found after bundling !!!" >&2
  exit 1
fi

TAGGED_BUNDLE="dist/empirica-bundle-${TAG}.tar.zst"
cp -f -- "${NEWEST_BUNDLE}" "${TAGGED_BUNDLE}"
if [[ ! -s "${TAGGED_BUNDLE}" ]]; then
  echo "!!! ERROR: Bundle file is empty or missing: ${TAGGED_BUNDLE} !!!" >&2
  exit 1
fi
echo "====> Created bundle: ${TAGGED_BUNDLE}"

# ---------- Ensure Buildx builder ----------
step "6/8" "Verifying Buildx builder '${BUILDER}'"
if ! docker buildx inspect "${BUILDER}" &>/dev/null; then
  echo "====> Creating builder '${BUILDER}'..."
  docker buildx create --name "${BUILDER}" --driver docker-container --use
else
  docker buildx use "${BUILDER}"
fi

# ---------- Build & push (with cache) ----------
step "7/8" "Building and pushing ${IMAGE}:${TAG} for ${PLATFORMS_VAL}"

BUILD_LOG="$(mktemp)"
cleanup() { rm -f "$BUILD_LOG"; }
trap cleanup EXIT

set +e
docker buildx build \
  --builder "${BUILDER}" \
  --platform "${PLATFORMS_VAL}" \
  --tag "${IMAGE}:${TAG}" \
  --push \
  --pull \
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
  if ! grep -E 'error: no such object|push access denied|no basic auth credentials|denied: requested access' "$BUILD_LOG" >&2; then
    echo "--- tail of build log ---" >&2
    tail -n 50 "$BUILD_LOG" >&2
  fi
  exit 1
fi

# ---------- Verify remote image ----------
step "8/8" "Verifying & reporting"
if docker buildx imagetools inspect "${IMAGE}:${TAG}" >/dev/null 2>&1; then
  DIGEST="$(docker buildx imagetools inspect "${IMAGE}:${TAG}" --format '{{.Manifest.Digest}}' 2>/dev/null || true)"
  [[ -n "$DIGEST" ]] && echo "====> Successfully pushed: ${IMAGE}@${DIGEST}"
  echo "====> Image tag: ${IMAGE}:${TAG}"
  echo "====> Platforms: ${PLATFORMS_VAL}"
  echo "====> Registry user: ${DOCKER_USER}"
  echo "All done!"
else
  echo "!!! ERROR: Image not found in registry via imagetools inspect !!!" >&2
  exit 1
fi
