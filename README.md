Public Goods Game

A simple Empirica-based Public Goods Game experiment.

Local Development:
1. Install dependencies & build:
   # In server folder
   cd server && npm install
   # In client folder
   cd ../client && npm install && npm run build
2. Run Empirica server:
   empirica --serve
3. Access:
   Open http://localhost:3000 in your browser. 
4. Admin credentials:
   cat .empirica/empirica.toml

Docker Deployment:
1. Build the image:
   docker build -t public-goods-game .
2. Run the container:
   docker run -p 3000:3000 -p 8844:8844 public-goods-game
   docker run -d --name pgg -p 3000:3000 -v empirica_data:/app/.empirica/local public-goods-game
3. Access:
   Visit http://localhost:3000
4. Cleanup data / reset state:
   docker stop pgg
   docker volume rm public_goods_game_empirica_data

Troubleshooting:
- Port in use: Change -p 3000:3000 to another host port.
- Permissions: Add your user to the docker group or use sudo.
- Container logs:
   docker logs pgg
- Exec into container:
   docker exec -it pgg /bin/sh
   then view credentials:
   cat .empirica/empirica.toml

Notes:
- cleanup.sh can be run inside the container before startup if you set RUN_CLEANUP=true.
- In production images the client and server are pre-built; no live Vite or esbuild at runtime.
- For rapid iteration locally, use: cd client && npm run dev


<!-- # Start the server
empirica

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
```

2. Pull the Docker Image
After cloning the repository, you can pull the pre-built Docker image from Docker Hub. Run this command:
```bash
   docker pull sillyduckyluck/public-goods-game:latest
```

This will download the Docker image to your local system


3. Run the Docker Container
Once the image is downloaded, you can start the application by running the Docker container. Execute the following command:

```bash
docker run -p 3000:3000 sillyduckyluck/public-goods-game:latest
```


This command will:

Run the Docker container.

Map port 3000 on your system to port 3000 in the container (adjust the port if needed based on your configuration).


5. Access the Application
Once the container is running, you can access the application in your browser by navigating to:

```bash
http://localhost:3000
```


This will open the Public Goods Game application.


Troubleshooting
Docker is not running: If you see errors such as Docker Daemon not running, make sure Docker Desktop is up and running.

Permission issues: If you get permission errors, try using sudo for Linux commands or ensure that Docker is properly integrated with WSL.

Port issues: If port 3000 is already in use, modify the port in the docker run command or docker-compose.yml. -->