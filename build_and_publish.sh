# build_and_publish.sh
# Build & push multi-arch Docker images with Buildx, with filtered progress output
set -euo pipefail

# Usage: ./build_and_publish.sh [<docker-user>] [<tag>]
# Examples:
#   ./build_and_publish.sh           # uses default user and tag
#   ./build_and_publish.sh mxleonc   # pushes mxleonc/public-goods-game:v1
#   ./build_and_publish.sh mylab v2  # pushes mylab/public-goods-game:v2

DEFAULT_USER="marghetislab"
DEFAULT_TAG="v1"
DOCKER_USER="${1:-$DEFAULT_USER}"
TAG="${2:-$DEFAULT_TAG}"
IMAGE="${DOCKER_USER}/public-goods-game"
PLATFORMS="linux/amd64,linux/arm64"
BUILDER="multi-builder"

echo "[0/6] ⇒ Starting build for ${IMAGE}:${TAG} on ${PLATFORMS}"

echo "[1/6] ⇒ Verifying Buildx builder '${BUILDER}'"
if ! docker buildx inspect "${BUILDER}" >/dev/null 2>&1; then
  echo "====> Creating builder '${BUILDER}'..."
  docker buildx create --name "${BUILDER}" --driver docker-container --use >/dev/null
  docker buildx inspect "${BUILDER}" --bootstrap >/dev/null
else
  echo "====> Builder exists, using '${BUILDER}'"
  docker buildx use "${BUILDER}" >/dev/null
fi

echo "[2/6] ⇒ Building image locally"
# Build image and filter to show only the summary line
docker buildx build \
  --builder "${BUILDER}" \
  --platform "${PLATFORMS}" \
  --tag "${IMAGE}:${TAG}" \
  --load \
  --progress=plain \
  . | grep -E '^\[\+ Building'

echo "====> Local build complete"

echo "[3/6] ⇒ Pushing image to registry"
# Push the already-built image and show push summary
docker push "${IMAGE}:${TAG}" | grep 'The push refers to repository \|digest:'

echo "====> Push complete"

echo "[4/6] ⇒ Retrieving digest"
DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' "${IMAGE}:${TAG}")
echo "====> Image digest: ${DIGEST}"

echo "[5/6] ⇒ Verifying pushed image"
docker pull "${IMAGE}:${TAG}" >/dev/null 2>&1 && echo "====> Verified ${IMAGE}:${TAG} is accessible"

echo "[6/6] ⇒ All done! ${IMAGE}:${TAG} is now available"