#!/bin/bash

# Install Empirica CLI
curl -s https://install.empirica.dev | sh

# Install dependencies
(cd server && empirica npm install)
(cd client && npm install)  # Not empirica npm install

# Start Empirica backend and Vite frontend in parallel
empirica &                       # Runs backend
(cd client && npx vite --port 8846)

         # Runs frontend

