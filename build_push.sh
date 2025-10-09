#!/usr/bin/env bash
# ./build_push.sh
# Bundle Empirica app, then build & push Docker images with Buildx (and BuildKit cache)
# Usage: ./build_push.sh [<docker-user>|<tag>] [<tag>] [--full-clean]
#
# Examples:
#   ./build_push.sh                 # detected user + v1
#   ./build_push.sh v2              # detected user + v2
#   ./build_push.sh myuser v3       # explicit user + v3
#   ./build_push.sh myuser v3 --full-clean

set -euo pipefail

# =========================
# Volta bootstrap (Node/npm/vite)
# =========================
export VOLTA_HOME="${VOLTA_HOME:-$HOME/.volta}"
export PATH="$VOLTA_HOME/bin:$PATH"

if ! command -v volta >/dev/null 2>&1; then
  echo "⚠️  Volta is not installed."
  read -rp "Install Volta now? [y/N] " yn
  if [[ "$yn" =~ ^[Yy]$ ]]; then
    curl https://get.volta.sh | bash
    export VOLTA_HOME="$HOME/.volta"
    export PATH="$VOLTA_HOME/bin:$PATH"
  else
    echo "❌ Volta is required. Aborting."; exit 1
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  echo "⚠️  Node.js not found in Volta."
  read -rp "Install Node 20.x now? [y/N] " yn
  if [[ "$yn" =~ ^[Yy]$ ]]; then volta install node@20; else echo "❌ Aborting."; exit 1; fi
fi

if ! command -v vite >/dev/null 2>&1; then
  echo "⚠️  vite not found in Volta."
  read -rp "Install vite now? [y/N] " yn
  if [[ "$yn" =~ ^[Yy]$ ]]; then volta install vite; else echo "❌ Aborting."; exit 1; fi
fi

echo "Using Node: $(node -v)"
echo "Using npm:  $(npm -v)"
echo "Using vite: $(vite --version)"

# =========================
# Helpers
# =========================
step() { echo "[$1] ⇒ $2"; }
_b64_decode() { # cross-platform base64 decode (Linux/macOS)
  { printf '%s' "$1" | base64 --decode 2>/dev/null || \
    printf '%s' "$1" | base64 -d        2>/dev/null || \
    printf '%s' "$1" | base64 -D        2>/dev/null; } || true
}
_is_wsl() { grep -qi microsoft /proc/version 2>/dev/null; }

# =========================
# WSL-safe Docker config
# If ~/.docker/config.json delegates to Windows ("desktop.exe"),
# switch THIS PROCESS to a WSL-local config in ~/.docker-wsl.
# =========================
_setup_wsl_docker_config() {
  local host_cfg="$HOME/.docker/config.json"
  local wsl_cfg_dir="$HOME/.docker-wsl"
  local wsl_cfg="$wsl_cfg_dir/config.json"

  if _is_wsl && [[ -r "$host_cfg" ]] && grep -q '"credsStore": *"desktop.exe"' "$host_cfg"; then
    mkdir -p "$wsl_cfg_dir"
    if [[ ! -f "$wsl_cfg" ]]; then
      cat > "$wsl_cfg" <<'JSON'
{
  "auths": {
    "https://index.docker.io/v1/": {}
  }
}
JSON
    fi
    export DOCKER_CONFIG="$wsl_cfg_dir"
    echo "ℹ️  Using WSL-local Docker config: $DOCKER_CONFIG (separate from Desktop)"
  fi
}
_setup_wsl_docker_config

# =========================
# Detect Docker username (respects DOCKER_CONFIG)
# =========================
DEFAULT_USER="marghetislab"
DEFAULT_TAG="v1"
BUILDER="multi-builder"

ARG1="${1:-}"
ARG2="${2:-}"
FULL_CLEAN="${3:-}"

_detect_user_from_config() {
  local cfg="${DOCKER_CONFIG:-$HOME/.docker}/config.json"
  [[ -r "$cfg" ]] || return 1

  local auth
  auth="$(awk '/"https:\/\/index.docker.io\/v1\/"/,/\}/'  "$cfg" | awk -F'"' '/"auth":/ {print $4}' | head -n1 || true)"
  if [[ -z "$auth" ]]; then
    auth="$(awk '/"https:\/\/registry-1.docker.io\/v2\/"/,/\}/' "$cfg" | awk -F'"' '/"auth":/ {print $4}' | head -n1 || true)"
  fi

  if [[ -n "$auth" ]]; then
    local decoded name
    decoded="$(_b64_decode "$auth")"
    name="${decoded%%:*}"
    [[ -n "$name" ]] && { echo "$name"; return 0; }
  fi
  return 1
}

_detect_docker_user() {
  # 1) DOCKER_USER env
  if [[ -n "${DOCKER_USER:-}" ]]; then echo "$DOCKER_USER"; return; fi

  # 2) Newer Docker CLIs
  local u
  u="$(docker system info --format '{{ .Username }}' 2>/dev/null || true)"
  if [[ -n "$u" && "$u" != "<unknown>" ]]; then echo "$u"; return; fi

  # 3) Parse active config.json
  local cfg_user; cfg_user="$(_detect_user_from_config)" || true
  if [[ -n "$cfg_user" ]]; then echo "$cfg_user"; return; fi

  # 4) Fallback
  echo "$DEFAULT_USER"
}

DETECTED_USER="$(_detect_docker_user)"

# If still defaulting, do NON-BROWSER login via PAT, then re-detect; finally prompt username fallback.
if [[ "$DETECTED_USER" == "$DEFAULT_USER" ]]; then
  echo "⚠️  Could not detect Docker Hub username in this shell."
  echo "    We'll log in using your Docker Hub username + Personal Access Token (no browser)."

  # If env vars provided, use them silently
  if [[ -n "${DOCKERHUB_USER:-}" && -n "${DOCKERHUB_PAT:-}" ]]; then
    echo "🔐 Using DOCKERHUB_USER / DOCKERHUB_PAT from environment."
    if ! printf '%s' "$DOCKERHUB_PAT" | docker login --username "$DOCKERHUB_USER" --password-stdin; then
      echo "❌ docker login failed with provided env vars."; exit 1
    fi
  else
    # Prompt for username + PAT
    read -rp "Docker Hub username: " cli_user
    read -rsp "Docker Hub Personal Access Token: " cli_pat; echo
    if ! printf '%s' "$cli_pat" | docker login --username "$cli_user" --password-stdin; then
      echo "❌ docker login failed."; exit 1
    fi
  fi

  DETECTED_USER="$(_detect_docker_user)"
  if [[ "$DETECTED_USER" == "$DEFAULT_USER" ]]; then
    # Last resort: ask for username only
    read -rp "Enter Docker Hub username to use for the push: " manual_user
    [[ -n "$manual_user" ]] && DETECTED_USER="$manual_user"
  fi
fi

# Arg interpretation:
# - no args            -> detected user + default tag
# - first like vN      -> tag-only, detected user
# - otherwise          -> first=user, second(optional)=tag
if [[ -z "$ARG1" ]]; then
  DOCKER_USER="$DETECTED_USER"; TAG="$DEFAULT_TAG"
elif [[ "$ARG1" =~ ^v[0-9] ]]; then
  DOCKER_USER="$DETECTED_USER"; TAG="$ARG1"
else
  DOCKER_USER="$ARG1"; TAG="${ARG2:-$DEFAULT_TAG}"
fi

IMAGE="${DOCKER_USER}/public-goods-game"
PLATFORMS_VAL="${PLATFORMS:-linux/amd64}"

echo "🧭 Using Docker Hub user: ${DOCKER_USER}"
echo "🏷  Image tag: ${TAG}"

# =========================
# Optional destructive Docker cleanup
# =========================
if [[ "${FULL_CLEAN:-}" == "--full-clean" ]]; then
  step "0/8" "Stopping & removing all containers..."
  docker stop $(docker ps -aq) >/dev/null 2>&1 || true
  docker rm -f $(docker ps -aq) >/dev/null 2>&1 || true

  step "1/8" "Removing all images..."
  docker rmi -f $(docker images -aq) >/dev/null 2>&1 || true

  step "2/8" "Pruning volumes, networks, and build cache..."
  docker volume prune -f >/dev/null 2>&1 || true
  docker network prune -f >/dev/null 2>&1 || true
  docker builder prune -a --force >/dev/null 2>&1 || true
else
  step "0/8" "Skipping destructive Docker cleanup (pass --full-clean to enable)"
fi

# =========================
# Docker daemon check
# =========================
if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not running." >&2
  exit 1
fi

# =========================
# Empirica CLI check
# =========================
step "3/8" "Verifying Empirica CLI..."
if ! command -v empirica >/dev/null 2>&1; then
  echo "Error: empirica CLI not found. Install with: curl https://install.empirica.dev | sh -s" >&2
  exit 1
fi

# =========================
# Bundle app
# =========================
step "4/8" "Bundling experiment with empirica bundle..."
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

# =========================
# Buildx builder
# =========================
step "5/8" "Verifying Buildx builder '${BUILDER}'"
if ! docker buildx inspect "${BUILDER}" &>/dev/null; then
  docker buildx create --name "${BUILDER}" --driver docker-container --use
else
  docker buildx use "${BUILDER}"
fi

# =========================
# Build & push (live progress + saved log)
# =========================
CACHE_REF="${IMAGE}:cache}"
CACHE_REF="${IMAGE}:cache"  # correct var
step "6/8" "Building and pushing ${IMAGE}:${TAG} for ${PLATFORMS_VAL}"

mkdir -p dist
BUILD_LOG="dist/build-$(date +%Y%m%d-%H%M%S).log"

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
  --provenance=false \
  --sbom=false \
  --progress=plain \
  -f Dockerfile.empirica \
  . | tee "${BUILD_LOG}"
STATUS=${PIPESTATUS[0]}
set -e

echo "🗒  Build log saved to ${BUILD_LOG}"
if [[ $STATUS -ne 0 ]]; then
  echo "============================================================" >&2
  echo "!!! BUILD OR PUSH FAILED !!!" >&2
  echo "============================================================" >&2
  exit $STATUS
fi

# =========================
# Verify remote image
# =========================
step "7/8" "Verifying & reporting"
if docker buildx imagetools inspect "${IMAGE}:${TAG}" >/dev/null 2>&1; then
  DIGEST="$(docker buildx imagetools inspect "${IMAGE}:${TAG}" --format '{{.Manifest.Digest}}' 2>/dev/null || true)"
  [[ -n "$DIGEST" ]] && echo "====> Successfully pushed: ${IMAGE}@${DIGEST}"
  echo "====> Image tag: ${IMAGE}:${TAG}"
  echo "====> Platforms: ${PLATFORMS_VAL}"
  echo "All done! 🚀"
else
  echo "!!! ERROR: Image not found in registry via imagetools inspect !!!" >&2
  exit 1
fi
