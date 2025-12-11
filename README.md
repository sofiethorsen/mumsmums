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

</details>

### Deploy

    ./scripts/mumsmums deploy <user@host> <port>
