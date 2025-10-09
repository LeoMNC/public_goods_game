#!/usr/bin/env bash
# ./pull_deploy.sh
# Pull a prebuilt Empirica Docker image and deploy it as a container.
#
# Usage:
#   ./pull_deploy.sh [<docker-user>|<tag>] [<tag>] [--user <user>] [--tag <tag>] \
#       [--port <port>] [--name <container-name>] [--env-file <path>] [--network <net>] \
#       [--volume <host:ctr>]... [--detach] [--no-healthcheck] [--docker-healthcheck] \
#       [--skip-pull] [--preflight-only] [--force] [--yes]
#
# Notes:
# - Defaults to pulling from marghetislab/public-goods-game:v1 unless overridden.
# - External readiness check by default. Use --docker-healthcheck for container-internal check.
set -euo pipefail

# -------- Defaults --------
DEFAULT_USER="marghetislab"
DEFAULT_TAG="v1"
DEFAULT_NAME="public-goods-game"
DEFAULT_PORT="3000"

# -------- Helpers --------
step() { echo "[$1] ⇒ $2"; }
die()  { echo "ERROR: $*" >&2; exit 1; }

_has() { command -v "$1" >/dev/null 2>&1; }

_port_in_use_non_docker() {
  local port="$1"
  if _has ss; then
    ss -ltnp 2>/dev/null | awk -v p=":${port}" '$4 ~ p {print $0}'
  elif _has lsof; then
    lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null | awk -v p=":${port}" '$9 ~ p {print $0}'
  elif _has netstat; then
    netstat -tulpn 2>/dev/null | awk -v p=":${port}" '$4 ~ p {print $0}'
  else
    return 1
  fi
}

_docker_containers_on_port() {
  local port="$1"
  docker ps --format '{{.ID}} {{.Names}} {{.Ports}}' \
   | awk -v p=":${port}->" 'index($0,p)>0 {print $0}'
}

_confirm() {
  local prompt="${1:-Proceed? [y/N] }"
  if [[ "${ASSUME_YES:-0}" == "1" ]]; then
    echo "y"; return 0
  fi
  read -rp "$prompt" ans || true
  [[ "$ans" =~ ^[Yy]$ ]]
}

# -------- Parse positionals for user/tag (flags can override later) --------
ARG1="${1:-}"
ARG2="${2:-}"

POS_USER=""
POS_TAG=""
CONSUME=0

if [[ -z "$ARG1" || "$ARG1" == --* ]]; then
  CONSUME=0
elif [[ "$ARG1" =~ ^v[0-9] ]]; then
  POS_TAG="$ARG1"; CONSUME=1
else
  POS_USER="$ARG1"; CONSUME=1
  if [[ -n "${ARG2:-}" && "$ARG2" != --* ]]; then
    POS_TAG="$ARG2"; CONSUME=2
  fi
fi

# Consume the positionals we interpreted
if [[ $CONSUME -ge 1 ]]; then shift; fi
if [[ $CONSUME -ge 2 ]]; then shift; fi

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
FLAG_USER=""
FLAG_TAG=""
PREFLIGHT_ONLY=0
FORCE_FIX=0
ASSUME_YES=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --user)               FLAG_USER="${2:?missing value for --user}"; shift 2 ;;
    --tag)                FLAG_TAG="${2:?missing value for --tag}"; shift 2 ;;
    --port)               PORT="${2:?missing value for --port}"; shift 2 ;;
    --name)               NAME="${2:?missing value for --name}"; shift 2 ;;
    --env-file)           ENV_FILE="${2:?missing value for --env-file}"; shift 2 ;;
    --network)            NETWORK="${2:?missing value for --network}"; shift 2 ;;
    --volume)             VOLUMES+=("${2:?missing value for --volume}"); shift 2 ;;
    --detach)             DETACH=1; shift ;;
    --no-healthcheck)     EXTERNAL_HEALTHCHECK=0; INTERNAL_DOCKER_HEALTHCHECK=0; shift ;;
    --docker-healthcheck) INTERNAL_DOCKER_HEALTHCHECK=1; EXTERNAL_HEALTHCHECK=0; shift ;;
    --skip-pull)          SKIP_PULL=1; shift ;;
    --preflight-only)     PREFLIGHT_ONLY=1; shift ;;
    --force)              FORCE_FIX=1; shift ;;
    --yes|-y)             ASSUME_YES=1; shift ;;
    --)                   shift; break ;;
    *)                    die "Unknown option: $1" ;;
  esac
done

# -------- Resolve user/tag precedence: flags > positionals > defaults --------
DOCKER_USER="${FLAG_USER:-${POS_USER:-$DEFAULT_USER}}"
TAG="${FLAG_TAG:-${POS_TAG:-$DEFAULT_TAG}}"

IMAGE="${DOCKER_USER}/public-goods-game:${TAG}"

echo "🧭 Using Docker Hub namespace: ${DOCKER_USER}"
echo "🏷  Image tag: ${TAG}"
echo "📦 Image ref: ${IMAGE}"
echo "🔌 Host port: ${PORT}"
echo "📛 Container name: ${NAME}"

# -------- 0/ Verify docker --------
step "0/7" "Checking Docker daemon"
if ! docker info >/dev/null 2>&1; then
  die "Docker daemon is not running. Please start Docker."
fi

# -------- -1/ Preflight checks --------
step "1/7" "Preflight: name & port conflicts"

# a) Same-name container exists?
EXISTING_BY_NAME="$(docker ps -a --format '{{.ID}} {{.Names}} {{.Status}}' | awk -v n="^${NAME}$" '$2 ~ n {print $0}')"
if [[ -n "$EXISTING_BY_NAME" ]]; then
  echo "• A container named '${NAME}' exists:"
  echo "  $EXISTING_BY_NAME"
  if [[ "$PREFLIGHT_ONLY" -eq 1 ]]; then
    echo "Preflight failed: name conflict."
    exit 1
  fi
  if [[ "$FORCE_FIX" -eq 1 ]] || _confirm "Stop & remove '${NAME}'? [y/N] "; then
    docker stop "${NAME}" >/dev/null 2>&1 || true
    docker rm -f "${NAME}" >/dev/null 2>&1 || true
    echo "  ✓ Removed '${NAME}'"
  else
    die "Name conflict. Re-run with --force or choose --name."
  fi
fi

# b) Docker container bound to the host port?
PORT_CONTAINERS="$(_docker_containers_on_port "$PORT" || true)"
if [[ -n "$PORT_CONTAINERS" ]]; then
  echo "• Port ${PORT} is in use by Docker container(s):"
  echo "$PORT_CONTAINERS" | sed 's/^/  /'
  if [[ "$PREFLIGHT_ONLY" -eq 1 ]]; then
    echo "Preflight failed: port conflict (docker)."
    exit 1
  fi
  if [[ "$FORCE_FIX" -eq 1 ]] || _confirm "Stop all containers using host port ${PORT}? [y/N] "; then
    # Stop by ID (first field)
    echo "$PORT_CONTAINERS" | awk '{print $1}' | xargs -r docker stop >/dev/null 2>&1 || true
    echo "$PORT_CONTAINERS" | awk '{print $1}' | xargs -r docker rm -f >/dev/null 2>&1 || true
    echo "  ✓ Cleared Docker port conflicts"
  else
    die "Port ${PORT} in use by Docker. Re-run with --force or change --port."
  fi
fi

# c) Non-Docker process listening on the host port?
PORT_PROC="$(_port_in_use_non_docker "$PORT" || true)"
if [[ -n "$PORT_PROC" ]]; then
  echo "• Port ${PORT} is in use by NON-Docker process:"
  echo "$PORT_PROC" | sed 's/^/  /'
  if [[ "$PREFLIGHT_ONLY" -eq 1 ]]; then
    echo "Preflight failed: port conflict (non-docker)."
    exit 1
  fi
  # We never kill random host processes; ask user to resolve.
  die "Port ${PORT} occupied by host process. Stop it or choose another --port."
fi

if [[ "$PREFLIGHT_ONLY" -eq 1 ]]; then
  echo "Preflight OK ✅"
  exit 0
fi

# -------- 1/ Optional: pull image --------
step "2/7" "Pulling image (or using local)"
if [[ "$SKIP_PULL" -eq 0 ]]; then
  step "2/7" "Pulling ${IMAGE}"
  docker pull "${IMAGE}"
else
  step "2/7" "Skipping docker pull (user requested --skip-pull)"
  if ! docker image inspect "${IMAGE}" >/dev/null 2>&1; then
    die "Image ${IMAGE} not found locally. Remove --skip-pull or pull the image first."
  fi
fi

# -------- 2/ Stop & remove any existing container with the same name (already cleared in preflight, but safe) --------
if docker ps -a --format '{{.Names}}' | grep -Fxq "${NAME}"; then
  step "3/7" "Stopping existing container '${NAME}' (if running)"
  docker stop "${NAME}" >/dev/null 2>&1 || true
  step "3/7" "Removing existing container '${NAME}'"
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
    step "3a/7" "Creating network '${NETWORK}'"
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
step "4/7" "Starting container ${NAME} on port ${PORT}"
if [[ "$DETACH" -eq 1 ]]; then
  docker run "${RUN_ARGS[@]}" "${IMAGE}"
else
  echo "====> Attached mode: press Ctrl+C to stop the container."
  exec docker run "${RUN_ARGS[@]}" "${IMAGE}"
fi

# -------- 5/ Post-start verification (detached) --------
if [[ "$EXTERNAL_HEALTHCHECK" -eq 1 ]]; then
  step "5/7" "Waiting for service to respond on http://localhost:${PORT}/ ..."
  if _has curl; then
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
step "6/7" "Deployment complete"
echo "====> Image:      ${IMAGE}"
echo "====> Container:  ${NAME}"
echo "====> URL:        http://localhost:${PORT}/"
echo "Tips:"
echo "  • View logs:     docker logs -f ${NAME}"
echo "  • Exec shell:    docker exec -it ${NAME} sh"
echo "  • Stop/Remove:   docker stop ${NAME} && docker rm ${NAME}"