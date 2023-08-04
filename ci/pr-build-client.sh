#!/usr/bin/env bash

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR/src/client" || exit 1

npm ci
npm run lint
npm run lint:tsc
npm run build --if-present
npm run test

cd "$GIT_DIR" || exit 1
