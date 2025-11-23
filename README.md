# mumsmums

## Running locally

Build all sources:

`./ci/build-sources.sh`

Start the backend:

`bazel run //src/server/jvmMain/kotlin/app/mumsmums`

Start the frontend:

`cd src/client && npm run dev`

## Running in Docker

`./bin/run-in-docker.sh`
