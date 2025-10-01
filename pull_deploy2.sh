#!/usr/bin/env bash
# ./pull_deploy.sh
# Pull a prebuilt Empirica Docker image and deploy it as a container.
#
# Usage:
#   ./pull_deploy.sh [<docker-user>] [<tag>] [--port <port>] [--name <container-name>] \
#       [--env-file <path>] [--network <net>] [--volume <host:ctr>]... [--detach] [--no-healthcheck] [--skip-pull]
#
# Examples:
#   ./pull_deploy.sh marghetislab v1 --port 3000 --name pgg --env-file .env --detach
#   ./pull_deploy.sh marghetislab v1 --network web --volume "$(pwd)/data:/data"
#
# Notes:
#   - Assumes the image was built by build_bundle_push.sh and its Dockerfile CMD runs:
#       empirica serve /app/bundle.tar.zst
#   - PORT inside the container can be overridden by --port (we pass PORT env to the container).
#   - Add --detach to run in the background (default is attached so you can see logs).

set -euo pipefail

# -------- Defaults --------
DEFAULT_USER="marghetislab"
DEFAULT_TAG="v1"
DEFAULT_NAME="public-goods-game"
DEFAULT_PORT="3000"

DOCKER_USER="${1:-$DEFAULT_USER}"
TAG="${2:-$DEFAULT_TAG}"

# Remove the first two args so we can parse flags from the rest
shift $(( $# >= 1 ? 1 : 0 ))
shift $(( $# >= 1 ? 1 : 0 ))

PORT="$DEFAULT_PORT"
NAME="$DEFAULT_NAME"
ENV_FILE=""
NETWORK=""
VOLUMES=()
DETACH=0
HEALTHCHECK=1
SKIP_PULL=0

# -------- Helpers --------
step() { echo "[$1] ⇒ $2"; }
die()  { echo "ERROR: $*" >&2; exit 1; }

# -------- Parse flags --------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)        PORT="${2:?missing value for --port}"; shift 2 ;;
    --name)        NAME="${2:?missing value for --name}"; shift 2 ;;
    --env-file)    ENV_FILE="${2:?missing value for --env-file}"; shift 2 ;;
    --network)     NETWORK="${2:?missing value for --network}"; shift 2 ;;
    --volume)      VOLUMES+=("${2:?missing value for --volume}"); shift 2 ;;
    --detach)      DETACH=1; shift ;;
    --no-healthcheck) HEALTHCHECK=0; shift ;;
    --skip-pull)   SKIP_PULL=1; shift ;;
    --)            shift; break ;;
    *)             die "Unknown option: $1" ;;
  esac
done

IMAGE="${DOCKER_USER}/public-goods-game:${TAG}"

# -------- 0/ Verify docker --------
step "0/6" "Checking Docker daemon"
if ! docker info >/dev/null 2>&1; then
  die "Docker daemon is not running. Please start Docker."
fi

# -------- 1/ Optional: pull image --------
if [[ "$SKIP_PULL" -eq 0 ]]; then
  step "1/6" "Pulling image ${IMAGE}"
  docker pull "${IMAGE}"
else
  step "1/6" "Skipping docker pull (user requested --skip-pull)"
fi

# -------- 2/ Stop & remove any existing container --------
step "2/6" "Stopping any existing container named '${NAME}'"
docker stop "${NAME}" >/dev/null 2>&1 || true

step "3/6" "Removing any existing container named '${NAME}'"
docker rm -f "${NAME}" >/dev/null 2>&1 || true

# -------- 3/ Build docker run args --------
RUN_ARGS=( --name "${NAME}"
           --restart unless-stopped
           -e "PORT=${PORT}"
           -p "${PORT}:${PORT}" )

if [[ -n "$ENV_FILE" ]]; then
  if [[ ! -f "$ENV_FILE" ]]; then
    die "Env file not found: $ENV_FILE"
  fi
  RUN_ARGS+=( --env-file "$ENV_FILE" )
fi

if [[ -n "$NETWORK" ]]; then
  # Create network if it doesn't exist
  if ! docker network inspect "$NETWORK" >/dev/null 2>&1; then
    step "3a/6" "Creating network '${NETWORK}'"
    docker network create "$NETWORK" >/dev/null
  fi
  RUN_ARGS+=( --network "$NETWORK" )
fi

for vol in "${VOLUMES[@]}"; do
  RUN_ARGS+=( -v "$vol" )
done

if [[ "$DETACH" -eq 1 ]]; then
  RUN_ARGS+=( -d )
fi

# Optional basic healthcheck: (Empirica doesn't expose a dedicated /health by default)
# We'll curl the root path. Disable with --no-healthcheck.
if [[ "$HEALTHCHECK" -eq 1 ]]; then
  RUN_ARGS+=( --health-cmd "curl -fsS http://localhost:${PORT}/ || exit 1"
              --health-interval 15s
              --health-timeout 5s
              --health-retries 8 )
fi

# -------- 4/ Run container --------
step "4/6" "Starting container ${NAME} on port ${PORT}"
docker run "${RUN_ARGS[@]}" "${IMAGE}"

# If attached mode (no --detach), we stop here; logs will stream to tty.
if [[ "$DETACH" -eq 0 ]]; then
  step "5/6" "Container started in attached mode. Press Ctrl+C to stop."
  # If healthcheck is enabled but we're attached, we can still tail logs naturally.
  # Exiting here keeps the container running until Ctrl+C.
  exit 0
fi

# -------- 5/ Post-start verification (when detached) --------
if [[ "$HEALTHCHECK" -eq 1 ]]; then
  step "5/6" "Waiting for container to become healthy..."
  # Wait (up to ~3 minutes) for healthy status
  MAX_TRIES=24
  for i in $(seq 1 $MAX_TRIES); do
    STATUS="$(docker inspect --format='{{json .State.Health.Status}}' "${NAME}" 2>/dev/null | tr -d '"')"
    if [[ "$STATUS" == "healthy" ]]; then
      echo "====> Container is healthy."
      break
    fi
    sleep 7
    if [[ $i -eq $MAX_TRIES ]]; then
      echo "!!! WARNING: Container did not report healthy in time. Check logs:"
      echo "    docker logs -f ${NAME}"
    fi
  done
else
  step "5/6" "Healthcheck disabled; doing a simple HTTP check..."
  # Try a simple curl to the mapped port on localhost
  if command -v curl >/dev/null 2>&1; then
    if ! curl -fsS "http://localhost:${PORT}/" >/dev/null 2>&1; then
      echo "!!! WARNING: HTTP check failed on http://localhost:${PORT}/"
    fi
  fi
fi

# -------- 6/ Report --------
step "6/6" "Deployment complete"
echo "====> Image:      ${IMAGE}"
echo "====> Container:  ${NAME}"
echo "====> URL:        http://localhost:${PORT}/"
echo "Tips:"
echo "  • View logs:     docker logs -f ${NAME}"
echo "  • Exec shell:    docker exec -it ${NAME} sh"
echo "  • Stop/Remove:   docker stop ${NAME} && docker rm ${NAME}"
