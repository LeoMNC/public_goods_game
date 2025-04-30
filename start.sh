#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20.12.2

# Install empirica
curl https://install.empirica.dev | sh

# Install dependencies
(cd server && empirica npm install)
(cd client && empirica npm install)

# Start the server
empirica --production
