#!/bin/bash
set -e

# Build the webapp
echo "Building the webapp for staging..."
cd webapp
npm install
npm run build -- --mode staging
cd ..

# Deploy to Firebase Hosting (staging)
echo "Deploying to staging..."
firebase deploy --only hosting:staging
