#!/usr/bin/env bash

set -euo pipefail

# Setup local development environment by syncing data from production (NUC)
# This script downloads the database and images from the NUC to ~/mumsmums-persist

echo "Setting up local development environment..."

# Configuration
NUC_USER="nuc"
NUC_HOST="mumsmums.app"
NUC_PORT="2233"
NUC_PERSIST_PATH="~/mumsmums-persist"
LOCAL_PERSIST_PATH="$HOME/mumsmums-persist"
TEMP_ENV_FILE="/tmp/mumsmums-env-$$.tmp"

# Clean up temp file on exit
trap 'rm -f "$TEMP_ENV_FILE"' EXIT

# 1. Remove and recreate local persist directory
echo "Recreating $LOCAL_PERSIST_PATH..."
rm -rf "$LOCAL_PERSIST_PATH"
mkdir -p "$LOCAL_PERSIST_PATH"

# 2. Download database from NUC
echo "Downloading database from NUC..."
scp -P "${NUC_PORT}" "${NUC_USER}@${NUC_HOST}:${NUC_PERSIST_PATH}/mumsmums.db" "$LOCAL_PERSIST_PATH/"

# 3. Download images from NUC
echo "Downloading images from NUC..."
mkdir -p "$LOCAL_PERSIST_PATH/images/recipes"
rsync -av --progress -e "ssh -p ${NUC_PORT}" "${NUC_USER}@${NUC_HOST}:${NUC_PERSIST_PATH}/images/recipes/" "$LOCAL_PERSIST_PATH/images/recipes/"

# 4. Download .env file from NUC (contains JWT_SECRET)
echo "Downloading .env file from NUC..."
scp -P "${NUC_PORT}" "${NUC_USER}@${NUC_HOST}:${NUC_PERSIST_PATH}/.env" "$TEMP_ENV_FILE"

# 5. Configure .env for local development
echo "Configuring .env for local development..."
# Extract JWT_SECRET from downloaded file
JWT_SECRET=$(grep "^JWT_SECRET=" "$TEMP_ENV_FILE" | cut -d'=' -f2)

# Create new .env with local settings
cat > "$LOCAL_PERSIST_PATH/.env" << EOF
# JWT Secret (from production)
JWT_SECRET=$JWT_SECRET

# Local development settings
SECURE_COOKIES=false

# Docker specific paths
DB_PATH=/app/data/mumsmums.db
IMAGE_STORAGE_PATH=/app/images
EOF

echo ""
echo "Local environment setup complete!"
echo "  Database: $LOCAL_PERSIST_PATH/mumsmums.db"
echo "  Images:   $LOCAL_PERSIST_PATH/images/recipes/"
echo "  Config:   $LOCAL_PERSIST_PATH/.env"
echo ""
