#!/usr/bin/env bash

# Dynamic DNS update script used on the host machine
# Updates DNS A/AAAA record when public IP changes using Hostup DynDNS API

set -euo pipefail

# These env vars should be supplied when invoking the script
DYNDNS_HOSTNAME="${HOSTUP_HOSTNAME:-mumsmums.app}"
DYNDNS_TOKEN="${HOSTUP_TOKEN:-}"

# Persistent data directory
PERSIST_DIR="${HOME}/mumsmums-persist"
LOG_DIR="${PERSIST_DIR}/logs"

# File to cache the last known IP
IP_CACHE_FILE="${PERSIST_DIR}/last-ip"

# Logging
LOG_FILE="${LOG_DIR}/ddns.log"

# Ensure directories exist
mkdir -p "$LOG_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

error() {
    log "ERROR: $*"
    exit 1
}

# Validate configuration
if [ -z "$DYNDNS_TOKEN" ]; then
    error "HOSTUP_TOKEN environment variable not set"
fi

# Get current public IP
CURRENT_IP=$(curl -s https://api.ipify.org)
if [ -z "$CURRENT_IP" ]; then
    error "Failed to get current public IP"
fi

# Check if IP has changed
if [ -f "$IP_CACHE_FILE" ]; then
    CACHED_IP=$(cat "$IP_CACHE_FILE")
    if [ "$CURRENT_IP" = "$CACHED_IP" ]; then
        log "IP unchanged: $CURRENT_IP"
        exit 0
    fi
    log "IP changed from $CACHED_IP to $CURRENT_IP"
else
    log "No cached IP found. Current IP: $CURRENT_IP"
fi

# Update DNS using Hostup DynDNS API
log "Updating DNS for ${DYNDNS_HOSTNAME} to ${CURRENT_IP}..."

RESPONSE=$(curl -s -X GET \
    "https://cloud.hostup.se/api/dyndns/update?hostname=${DYNDNS_HOSTNAME}&token=${DYNDNS_TOKEN}&ip=${CURRENT_IP}")

# Check if update was successful
# Hostup returns simple text responses following DynDNS2 protocol:
# - "good IP" or "nochg IP" = success
# - "badauth", "notfqdn", "nohost", "abuse", etc. = errors
if [[ "$RESPONSE" =~ ^(good|nochg) ]]; then
    log "DNS update successful: $RESPONSE"
    # Save current IP to cache
    echo "$CURRENT_IP" > "$IP_CACHE_FILE"
    log "New IP cached: $CURRENT_IP"
else
    error "DNS update failed: $RESPONSE"
fi
