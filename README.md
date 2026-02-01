# mumsmums

Live app at: https://mumsmums.app

## Running locally

Setup local env (requires SSH access to the prod host to copy state):

    ./scripts/setup-local-env.sh

Build all sources:

    ./scripts/mumsmums build

Run all tests:

    ./scripts/mumsmums test

Start the app:

    ./scripts/mumsmums start

Stop the app:

    ./scripts/mumsmums stop

## Running in Docker

Start the app:

    ./scripts/mumsmums start --docker

Stop the app:

    ./scripts/mumsmums stop --docker

## Host configuration

<details>
<summary>Prerequisites</summary>

Assuming the host machine OS:

```
Distributor ID: Ubuntu
Description:    Ubuntu 24.04.3 LTS
Release:        24.04
Codename:       noble
```

#### Setup environment on host

    # Add Docker's official GPG key:
    sudo apt update
    sudo apt install ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources:
    sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
    Types: deb
    URIs: https://download.docker.com/linux/ubuntu
    Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
    Components: stable
    Signed-By: /etc/apt/keyrings/docker.asc
    EOF

    sudo apt update

    # Install Docker Engine, CLI, and Containerd:
    sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Install sqlite3 and apache2-utils for htpasswd (used to manually create admin users)
    sudo apt install sqlite3
    sudo apt install apache2-utils

    # Install Docker compose
    sudo apt install docker-compose

    # Add your user to docker group (to run without sudo)
    sudo usermod -aG docker $USER

    # Log out and back in for group changes to take effect
    exit

    # Create mumsmums-persist directories in the HOME directory of the host machine:

        # Create directories
        mkdir -p ~/mumsmums-persist/logs
        mkdir -p ~/mumsmums-persist/images/recipes

        # Set ownership to UID 1000 (the Docker containers will use this too)
        sudo chown -R 1000:1000 ~/mumsmums-persist

        # Lets the 1000 owner have full read/write/execute access, the cron can write to the log file
        # and the Docker container can read/write to the DB. No other groups/other will have access.
        chmod -R 700 ~/mumsmums-persist

    # In mumsmums-persist, create .env with all required environment variables:

        touch ~/mumsmums-persist/.env
        vi ~/mumsmums-persist/.env

        # Generate JWT_SECRET with: openssl rand -base64 32

        # Env vars
        JWT_SECRET=<your-secret-here>
        SECURE_COOKIES=true

        # Docker specific paths
        DB_PATH=/app/data/mumsmums.db
        IMAGE_STORAGE_PATH=/app/images

        chmod 600 ~/mumsmums-persist/.env

    # Note: For local development, scripts/setup-local-env.sh will automatically
    # download this .env and set SECURE_COOKIES=false for HTTP connections.


#### DynDNS

The mumsmums.app domain is managed by hostup.se, and we leverage DynDNS to dynamically update the DNS records if the
IP would change - through the hostup APIs.

    1. In mumsmums-persist, create dyndns.conf store the credentials:

        export HOSTUP_HOSTNAME="mumsmums.app"
        export HOSTUP_TOKEN="dyndns-token"

    2. Set appropriate permissions on the config file
        chmod 600 dyndns.conf

    3. Setup cron for automatic updates

        # Edit crontab
        crontab -e

        # Update DNS every 15 minutes if IP changes
        */15 * * * * /bin/bash -c "source ~/mumsmums-persist/dyndns.conf && ~/mumsmums-persist/update-dns.sh"

    4. Setup log rotation for the ddns log using logrotate:

        # Create logrotate config
        sudo vi /etc/logrotate.d/mumsmums-ddns

        # Enter config content into the above file:
        /home/nuc/mumsmums-ddns.log {
            daily
            rotate 3
            missingok
            notifempty
            compress
            delaycompress
        }

</details>
