#!/usr/bin/env bash

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR" || exit 1

# Build all sources
./scripts/mumsmums build

# Run all tests
./scripts/mumsmums test
