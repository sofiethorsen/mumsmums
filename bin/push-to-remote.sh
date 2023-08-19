#!/usr/bin/env bash

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR" || exit 1

USER=ubuntu
EC2_HOST=ec2-13-49-230-174.eu-north-1.compute.amazonaws.com

# build deploy jar
bazel build //src/server/jvmMain/kotlin/app/mumsmums:mumsmums_deploy.jar

cd "$GIT_DIR/src/client" || exit 1

# build client artefacts
npm ci
npm run lint
npm run build --if-present

cd "$GIT_DIR" || exit 1

# remove previous files
ssh -i ~/.aws/keys/mumsmums-server.pem "$USER"@"$EC2_HOST" "sudo rm -rf /home/ubuntu/mumsmums_deploy.jar"
ssh -i ~/.aws/keys/mumsmums-server.pem "$USER"@"$EC2_HOST" "sudo rm -rf /home/ubuntu/index.html"
ssh -i ~/.aws/keys/mumsmums-server.pem "$USER"@"$EC2_HOST" "sudo rm -rf /home/ubuntu/index_bundle.js"

# push new files
scp -i ~/.aws/keys/mumsmums-server.pem bazel-bin/src/server/jvmMain/kotlin/app/mumsmums/mumsmums_deploy.jar "$USER"@"$EC2_HOST":/home/ubuntu
scp -i ~/.aws/keys/mumsmums-server.pem src/client/dist/index.html "$USER"@"$EC2_HOST":/home/ubuntu
scp -i ~/.aws/keys/mumsmums-server.pem src/client/dist/index_bundle.js "$USER"@"$EC2_HOST":/home/ubuntu
