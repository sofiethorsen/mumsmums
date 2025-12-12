# mumsmums

## Running locally

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

## Deploying

<details>
<summary>Prerequisites</summary>

Assuming the host machine OS:

```
Distributor ID: Ubuntu
Description:    Ubuntu 24.04.3 LTS
Release:        24.04
Codename:       noble
```

#### Setup Docker on Host

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

    # Install Docker compose
    sudo apt install docker-compose

    # Add your user to docker group (to run without sudo)
    sudo usermod -aG docker $USER

    # Log out and back in for group changes to take effect
    exit

#### DynDNS

The mumsmums.app domain is managed by hostup.se, and we leverage DynDNS to dynamically update the DNS records if the
IP would change - through the hostup APIs.

    1. Create mumsmums-persist directories in the HOME directory of the host machine:

        # Create directories
        mkdir ~/mumsmums-persist
        mkdir ~/mumsmums-persist/logs

        # Let the directories only be writable by you
        chmod 755 ~/mumsmums-persist
        chmod 755 ~/mumsmums-persist/logs

    2. In mumsmums-persist, create dyndns.conf store the credentials:

        export HOSTUP_HOSTNAME="mumsmums.app"
        export HOSTUP_TOKEN="dyndns-token"

    2. Set appropriate permissions on the config file
        chmod 600 dyndns.conf

    3. Setup cron for automatic updates

        # Edit crontab
        crontab -e

        # Update DNS every 15 minutes if IP changes
        */15 * * * * source ~/mumsmums-persist/dyndns.conf && ~/mumsmums-persist/update-dns.sh >> ~/mumsmums-ddns.log 2>&1

    4. Setup log rotation for the ddns log using logrotate:

        # Create logrotate config
        sudo vi /etc/logrotate.d/mumsmums-ddns

        # Enter config content into the above file:
        /home/nuc/mumsmums-ddns.log {
            su nuc nuc
            daily
            rotate 3
            missingok
            notifempty
            compress
            delaycompress
        }

</details>

### Deploy

    ./scripts/mumsmums deploy <user@host> <port>
