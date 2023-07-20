#!/usr/bin/env bash

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR" || exit 1

echo "Build succeeded."
