#!/usr/bin/env bash

set -euo pipefail

docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /tmp/acme_challenge:/tmp/acme_challenge \
  certbot/certbot renew --webroot -w /tmp/acme_challenge --quiet

# Reload Nginx to apply the renewed certificates
docker exec nginx nginx -s reload
