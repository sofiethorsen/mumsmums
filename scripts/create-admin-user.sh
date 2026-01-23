#!/bin/bash

# Create admin user script for mumsmums
# Usage: ./scripts/create-admin-user.sh [email] [password] [db_path]
# If arguments are not provided, they will be prompted
#
# Requirements: htpasswd, sqlite3
# On Ubuntu/Debian: sudo apt install apache2-utils sqlite3

set -e

# Get arguments or prompt
EMAIL="${1:-}"
PASSWORD="${2:-}"
DB_PATH="${3:-./sqlite/mumsmums.db}"

if [ -z "$EMAIL" ]; then
    read -p "Enter admin email: " EMAIL
fi

if [ -z "$PASSWORD" ]; then
    read -sp "Enter admin password: " PASSWORD
    echo
fi

# Check if htpasswd is available
if ! command -v htpasswd &> /dev/null; then
    echo "Error: htpasswd not found. Install it with:"
    echo "  macOS: (comes with system)"
    echo "  Ubuntu/Debian: sudo apt install apache2-utils"
    exit 1
fi

# Check if sqlite3 is available
if ! command -v sqlite3 &> /dev/null; then
    echo "Error: sqlite3 not found. Install it with:"
    echo "  macOS: brew install sqlite"
    echo "  Ubuntu/Debian: sudo apt install sqlite3"
    exit 1
fi

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "Error: Database not found at $DB_PATH"
    exit 1
fi

# Check if user already exists
EXISTING_USER=$(sqlite3 "$DB_PATH" "SELECT email FROM users WHERE email='$EMAIL';" 2>/dev/null || echo "")
if [ -n "$EXISTING_USER" ]; then
    echo "Admin user already exists: $EMAIL"
    exit 0
fi

# Generate BCrypt hash using htpasswd (cost factor 12)
# htpasswd outputs "username:hash", we only want the hash part
PASSWORD_HASH=$(htpasswd -nbBC 12 "" "$PASSWORD" | cut -d: -f2)

# Get current timestamp in milliseconds
TIMESTAMP=$(($(date +%s) * 1000))

# Insert user into database (userId will be auto-generated)
sqlite3 "$DB_PATH" <<EOF
INSERT INTO users (email, passwordHash, createdAtInMillis, lastUpdatedAtInMillis)
VALUES ('$EMAIL', '$PASSWORD_HASH', $TIMESTAMP, $TIMESTAMP);
EOF

echo "Admin user created: $EMAIL"
