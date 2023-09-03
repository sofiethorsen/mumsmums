#!/usr/bin/env bash

set -euo pipefail

BUCKET_NAME="mumsmums"

# Dir for the images we're uploading
BASE_DIR="/Users/sthorsen/Downloads/mumsimg"
RECIPE_ID="43986376914944"

# Loop through image files in the base directory
for FILE_PATH in "$BASE_DIR"/*; do
    # Extract the filename without the path
    FILENAME=$(basename "$FILE_PATH")

    # Upload the image to S3 with appropriate prefixes
    aws s3 cp "$FILE_PATH" "s3://$BUCKET_NAME/assets/$RECIPE_ID/$FILENAME" --metadata "Cache-Control=max-age=31536000"
done
