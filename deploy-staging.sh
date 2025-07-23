#!/bin/bash
set -e

echo "🚀 Starting staging deployment..."

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: firebase.json not found. Please run this script from the project root."
    exit 1
fi

# Build the webapp for staging
echo "📦 Building the webapp for staging..."
cd webapp

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

# Build for staging (using production mode since staging uses same Firebase project)
echo "🔨 Building webapp..."
npm run build

cd ..

# Deploy to Firebase Hosting (staging target)
echo "🚀 Deploying to Firebase Hosting (staging)..."
firebase deploy --only hosting:staging

echo "✅ Staging deployment completed successfully!"
echo "🌐 Your staging site should be available at the staging URL provided above."
