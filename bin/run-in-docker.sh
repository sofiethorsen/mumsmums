#!/usr/bin/env bash

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR" || exit 1

./ci/build-sources.sh

docker build -t mumsmums -f docker/mumsmums.Dockerfile .
docker build -t next -f docker/next.Dockerfile .

aws_access_key_id=$(aws configure get aws_access_key_id)
aws_secret_access_key=$(aws configure get aws_secret_access_key)

docker run -d --network app_net --name mumsmums -p 8080:8080 \
-e AWS_ACCESS_KEY_ID=$aws_access_key_id \
-e AWS_SECRET_ACCESS_KEY=$aws_secret_access_key \
mumsmums

docker run -d --network app_net --name next -p 3000:3000 next
