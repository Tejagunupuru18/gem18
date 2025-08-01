#!/bin/bash

# Deployment script for Career Mentorship Portal
echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install

# Install client dependencies and build
echo "📦 Installing client dependencies..."
cd client
npm install

echo "🔨 Building React app..."
npm run build

# Go back to root
cd ..

echo "✅ Build completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to render.com and create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Use these settings:"
echo "   - Build Command: npm install && cd client && npm install && npm run build"
echo "   - Start Command: npm start"
echo "5. Set environment variables in Render dashboard"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 