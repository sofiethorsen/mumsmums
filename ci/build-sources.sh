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

# Start the server in the background for SSR during Next.js build
echo "Starting local server for SSR build..."
bazel run //src/server/jvmMain/kotlin/app/mumsmums > /tmp/mumsmums-server.log 2>&1 &
SERVER_PID=$!

# Ensure we kill the server on script exit
trap "echo 'Stopping server...'; kill $SERVER_PID 2>/dev/null || true; lsof -ti:8080 | xargs kill -9 2>/dev/null || true" EXIT

# Wait for server to be ready
echo "Waiting for server to start..."
for i in {1..30}; do
    if curl -s http://localhost:8080/graphql > /dev/null 2>&1; then
        echo "Server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Server failed to start"
        cat /tmp/mumsmums-server.log
        exit 1
    fi
    sleep 1
done

# Now build the JS with production optimizations but using localhost backend for SSR
cd "$GIT_DIR/src/client" || exit 1

npm ci
npm run lint
npm run lint:tsc

# Build with localhost backend for build-time SSR
NEXT_PUBLIC_USE_LOCAL_BACKEND=true npm run build --if-present

echo "Build complete!"

cd "$GIT_DIR" || exit 1

# Create a folder for the sources and copy them there
rm -rf build
mkdir build

cp bazel-bin/src/server/jvmMain/kotlin/app/mumsmums/mumsmums_deploy.jar build/
