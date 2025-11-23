#!/usr/bin/env bash

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR" || exit 1

# Build and test everything
bazel build //...
bazel test //... --test_output=all

# Build the deploy jar
bazel build //src/server/jvmMain/kotlin/app/mumsmums:mumsmums_deploy.jar
