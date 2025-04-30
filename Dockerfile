# Use official Node.js image
#FROM node:20.12.2

# Install Empirica CLI dependencies and Empirica itself
#RUN apt-get update && apt-get install -y rsync curl \
#  && curl https://install.empirica.dev | sh \
#  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
#WORKDIR /app

# Copy the app
#COPY . .

# Install dependencies
#WORKDIR /app/server
#RUN npm install

#WORKDIR /app/client
#RUN npm install

# Back to root
#WORKDIR /app

# Expose Empirica's default port
#EXPOSE 3000

# Start the app in production mode
#CMD ["empirica", "--production"]


# Use the official Node.js image as the base
#FROM node:20.12.2
#FROM ghcr.io/empiricaly/empirica:latest
FROM ghcr.io/empiricaly/empirica:build-v1.12.1

# Set the working directory in the container
WORKDIR /app

# Copy the local files into the container
COPY . /app

# Install Empirica CLI
#RUN curl https://install.empirica.dev | sh

# Install the necessary dependencies for the server and client
WORKDIR /app/server
RUN empirica npm install

WORKDIR /app/client
RUN empirica npm install

# Set the environment variable to production
#ENV NODE_ENV=production

# Expose the port that your application will run on
EXPOSE 3000

WORKDIR /app

# Run the Empirica application in production mode
CMD rm -f .empirica/local/tajriba.json && empirica
#CMD ["empirica", "--production"]

