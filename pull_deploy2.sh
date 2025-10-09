#!/usr/bin/env bash
# ./pull_deploy.sh
# Pull a prebuilt Empirica Docker image and deploy it as a container.
#
# Usage:
#   ./pull_deploy.sh [<docker-user>] [<tag>] [--port <port>] [--name <container-name>] \
#       [--env-file <path>] [--network <net>] [--volume <host:ctr>]... \
#       [--detach] [--no-healthcheck] [--docker-healthcheck] [--skip-pull]
#
# Notes:
# - Default CMD should run Empirica, e.g.: empirica serve /app/bundle.tar.zst
# - By default we perform an EXTERNAL readiness check from the host.
#   Use --docker-healthcheck to set a Docker healthcheck that runs INSIDE the container
#   (requires curl inside the image).
set -euo pipefail

# -------- Defaults --------
DEFAULT_USER="marghetislab"
DEFAULT_TAG="v1"
DEFAULT_NAME="public-goods-game"
DEFAULT_PORT="3000"

# -------- Helpers --------
step() { echo "[$1] ⇒ $2"; }
die()  { echo "ERROR: $*" >&2; exit 1; }

# -------- Arg pre-scan (flags-first friendly) --------
# If first/second params look like flags, don't treat them as user/tag.
ARG1="${1:-}"
ARG2="${2:-}"
if [[ -n "${ARG1}" && "${ARG1}" != --* ]]; then
  DOCKER_USER="${ARG1}"
  shift
else
  DOCKER_USER=""  # will be resolved below
fi
if [[ -n "${ARG2}" && "${ARG2}" != --* && -n "${DOCKER_USER:-}" ]]; then
  TAG="${ARG2}"
  shift
else
  TAG=""
fi

# Resolve DOCKER_USER via CLI > logged-in > default
if [[ -z "${DOCKER_USER:-}" ]]; then
  AUTO_USER="$(docker info --format '{{.Username}}' 2>/dev/null || true)"
  DOCKER_USER="${AUTO_USER:-$DEFAULT_USER}"
fi
TAG="${TAG:-$DEFAULT_TAG}"

# -------- Remaining flags --------
PORT="$DEFAULT_PORT"
NAME="$DEFAULT_NAME"
ENV_FILE=""
NETWORK=""
VOLUMES=()
DETACH=0
EXTERNAL_HEALTHCHECK=1
INTERNAL_DOCKER_HEALTHCHECK=0
SKIP_PULL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)             PORT="${2:?missing value for --port}"; shift 2 ;;
    --name)             NAME="${2:?missing value for --name}"; shift 2 ;;
    --env-file)         ENV_FILE="${2:?missing value for --env-file}"; shift 2 ;;
    --network)          NETWORK="${2:?missing value for --network}"; shift 2 ;;
    --volume)           VOLUMES+=("${2:?missing value for --volume}"); shift 2 ;;
    --detach)           DETACH=1; shift ;;
    --no-healthcheck)   EXTERNAL_HEALTHCHECK=0; INTERNAL_DOCKER_HEALTHCHECK=0; shift ;;
    --docker-healthcheck) INTERNAL_DOCKER_HEALTHCHECK=1; EXTERNAL_HEALTHCHECK=0; shift ;;
    --skip-pull)        SKIP_PULL=1; shift ;;
    --)                 shift; break ;;
    *)                  die "Unknown option: $1" ;;
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
  if ! docker image inspect "${IMAGE}" >/dev/null 2>&1; then
    die "Image ${IMAGE} not found locally. Remove --skip-pull or pull the image first."
  fi
fi

# -------- 2/ Stop & remove any existing container --------
if docker ps -a --format '{{.Names}}' | grep -Fxq "${NAME}"; then
  step "2/6" "Stopping existing container '${NAME}' (if running)"
  docker stop "${NAME}" >/dev/null 2>&1 || true
  step "2/6" "Removing existing container '${NAME}'"
  docker rm -f "${NAME}" >/dev/null 2>&1 || true
fi

# -------- 3/ Build docker run args --------
RUN_ARGS=(
  --name "${NAME}"
  --restart unless-stopped
  -e "PORT=${PORT}"
  -p "${PORT}:${PORT}"
)

if [[ -n "$ENV_FILE" ]]; then
  [[ -f "$ENV_FILE" ]] || die "Env file not found: $ENV_FILE"
  RUN_ARGS+=( --env-file "$ENV_FILE" )
fi

if [[ -n "$NETWORK" ]]; then
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

# Optional INTERNAL Docker healthcheck (requires curl inside image)
if [[ "$INTERNAL_DOCKER_HEALTHCHECK" -eq 1 ]]; then
  RUN_ARGS+=(
    --health-cmd "curl -fsS http://localhost:${PORT}/ || exit 1"
    --health-interval 15s
    --health-timeout 5s
    --health-retries 8
  )
fi

# -------- 4/ Run container --------
step "4/6" "Starting container ${NAME} on port ${PORT}"
if [[ "$DETACH" -eq 1 ]]; then
  docker run "${RUN_ARGS[@]}" "${IMAGE}"
else
  echo "====> Attached mode: press Ctrl+C to stop the container."
  # Replace the current process so Ctrl+C works naturally
  exec docker run "${RUN_ARGS[@]}" "${IMAGE}"
fi

# If we reached here, we are detached.

# -------- 5/ Post-start verification (detached) --------
if [[ "$EXTERNAL_HEALTHCHECK" -eq 1 ]]; then
  step "5/6" "Waiting for service to respond on http://localhost:${PORT}/ ..."
  if command -v curl >/dev/null 2>&1; then
    MAX_TRIES=30
    for i in $(seq 1 $MAX_TRIES); do
      if curl -fsS "http://localhost:${PORT}/" >/dev/null 2>&1; then
        echo "====> Service is responding."
        break
      fi
      sleep 2
      if [[ $i -eq $MAX_TRIES ]]; then
        echo "!!! WARNING: Service did not respond in time. Check logs:"
        echo "    docker logs -f ${NAME}"
      fi
    done
  else
    echo "Note: 'curl' not found on host; skipping external readiness check."
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
