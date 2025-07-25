#!/bin/bash

# Build script for production deployment
# This script builds the Vite app and prepares it for deployment

set -e

echo "🔨 Building Proxmox Configuration Backup Manager for production..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the Vite application
echo "🔧 Building frontend application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

# Copy server files
echo "📋 Copying server files..."
cp server.js dist/
cp package.json dist/

# Create production package.json (only runtime dependencies)
cat > dist/package.json << 'EOF'
{
  "name": "proxmox-backup-manager",
  "version": "1.0.0",
  "description": "Proxmox Configuration Backup Manager",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "node-ssh": "^13.1.0",
    "cron": "^3.1.6",
    "archiver": "^6.0.1"
  }
}
EOF

echo "✅ Build completed successfully!"
echo "📂 Production files are in the 'dist' directory"
echo ""
echo "🚀 To deploy:"
echo "   1. Copy the 'dist' directory to your server"
echo "   2. Run 'npm install --production' in the dist directory"
echo "   3. Run 'node server.js' to start the application"
echo ""
echo "📝 Or use the install script for automated deployment:"
echo "   bash -c \"\$(wget -qLO - https://raw.githubusercontent.com/your-repo/proxmox-backup-manager/main/install.sh)\""