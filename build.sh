#!/bin/bash

echo "🚀 Starting build process..."

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# Build React app
echo "🔨 Building React app..."
npm run build

# Go back to root
cd ..

echo "✅ Build completed successfully!"
echo "📁 Build files created in client/build/" 