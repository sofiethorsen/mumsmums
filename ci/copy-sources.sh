#!/usr/bin/env bash

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR" || exit 1

# Create a folder for the sources
rm -rf build
mkdir build

cp bazel-bin/src/server/jvmMain/kotlin/app/mumsmums/mumsmums_deploy.jar build/
cp src/client/dist/index.html build/
cp src/client/dist/index_bundle.js build/
