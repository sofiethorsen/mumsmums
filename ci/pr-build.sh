#!/usr/bin/env bash

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR" || exit 1

# Ensure that required env vars are set for CI builds
export JWT_SECRET="ci-secret"
export SECURE_COOKIES=false

# Use temp directory for CI database and images
mkdir -p /tmp/mumsmums-ci/images
export DB_PATH=/tmp/mumsmums-ci/mumsmums.db
export IMAGE_STORAGE_PATH=/tmp/mumsmums-ci/images


# Initialize database from recipes.json
bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:initalize

# Build all sources
./scripts/mumsmums build

# Run all tests
./scripts/mumsmums test
