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
scp -P "${NUC_PORT}" "${NUC_USER}@${NUC_HOST}:${NUC_PERSIST_PATH}/.env" "$LOCAL_PERSIST_PATH/"

# 5. Update SECURE_COOKIES for local development (localhost = HTTP, not HTTPS)
echo "Configuring .env for local development..."
sed -i '' 's/SECURE_COOKIES=true/SECURE_COOKIES=false/' "$LOCAL_PERSIST_PATH/.env"

echo ""
echo "Local environment setup complete:"
echo "  Database: $LOCAL_PERSIST_PATH/mumsmums.db"
echo "  Images:   $LOCAL_PERSIST_PATH/images/recipes/"
echo "  Config:   $LOCAL_PERSIST_PATH/.env (SECURE_COOKIES=false for localhost)"
