#!/usr/bin/env bash

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR" || exit 1

# Ensure that required env vars are set for CI builds
export JWT_SECRET="ci-secret"
export SECURE_COOKIES=false
export DB_PATH=/app/data/mumsmums.db
export IMAGE_STORAGE_PATH=/app/images

# Ensure that the image directory exists since we require it
mkdir -p /home/runner/mumsmums-persist/images

# Build all sources
./scripts/mumsmums build

# Run all tests
./scripts/mumsmums test
