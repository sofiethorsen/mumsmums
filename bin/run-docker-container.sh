#!/usr/bin/env bash

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR" || exit 1

docker build -t mumsmums .

aws_access_key_id=$(aws configure get aws_access_key_id)
aws_secret_access_key=$(aws configure get aws_secret_access_key)

docker run -d -p 80:80 \
-e AWS_ACCESS_KEY_ID=$aws_access_key_id \
-e AWS_SECRET_ACCESS_KEY=$aws_secret_access_key \
mumsmums
