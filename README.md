# Start the server
empirica --production

Admin credentials -> cat .empirica/empirica.toml

rm .empirica/local/tajriba.json; empirica


# Public Goods Game - Dockerized Application

This project provides a Dockerized version of the Public Goods Game, which can be easily run on a Linux Subsystem for Windows (WSL). Follow the instructions below to set up the application using Docker.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Docker Desktop for Windows**: Install Docker Desktop to run Docker on your Windows machine with WSL 2 integration. [Download Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- **Git**: Install Git to clone the repository.

---

## Step-by-Step Guide

### 1. Install Docker on WSL

#### 1.1 Install Docker Desktop for Windows

1. Download **[Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)**.
2. During installation, ensure the **Enable WSL 2 integration** option is selected.
3. Follow the installation instructions, and restart your computer if necessary.

#### 1.2 Enable WSL 2 (if not already enabled)

1. Open PowerShell as Administrator and run the following command:
   ```bash
   wsl --set-default-version 2


2. Pull the Docker Image
After cloning the repository, you can pull the pre-built Docker image from Docker Hub. Run this command:

docker pull sillyduckyluck/public-goods-game:latest
This will download the Docker image to your local system


3. Run the Docker Container
Once the image is downloaded, you can start the application by running the Docker container. Execute the following command:

docker run -p 3000:3000 sillyduckyluck/public-goods-game:latest
This command will:

Run the Docker container.

Map port 3000 on your system to port 3000 in the container (adjust the port if needed based on your configuration).


5. Access the Application
Once the container is running, you can access the application in your browser by navigating to:

http://localhost:3000
This will open the Public Goods Game application.


Troubleshooting
Docker is not running: If you see errors such as Docker Daemon not running, make sure Docker Desktop is up and running.

Permission issues: If you get permission errors, try using sudo for Linux commands or ensure that Docker is properly integrated with WSL.

Port issues: If port 3000 is already in use, modify the port in the docker run command or docker-compose.yml.