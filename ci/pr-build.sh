#!/usr/bin/env bash

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR" || exit 1

# Ensure that required env vars are set for CI builds
export JWT_SECRET="ci-secret"

# Build all sources
./scripts/mumsmums build

# Run all tests
./scripts/mumsmums test
