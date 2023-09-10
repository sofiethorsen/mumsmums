#!/usr/bin/env bash

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR" || exit 1

# Build and test everything
bazel build //...
bazel test //...

# Build the deploy jar
rm -f bazel-bin/src/server/jvmMain/kotlin/app/mumsmums/mumsmums_deploy.jar
bazel build //src/server/jvmMain/kotlin/app/mumsmums:mumsmums_deploy.jar

# Now build the JS
cd "$GIT_DIR/src/client" || exit 1

npm ci
npm run lint
npm run lint:tsc
npm run build --if-present

cd "$GIT_DIR" || exit 1

# Create a folder for the sources and copy them there
rm -rf build
mkdir build

cp bazel-bin/src/server/jvmMain/kotlin/app/mumsmums/mumsmums_deploy.jar build/
