#!/bin/bash

# Xtractic AI Frontend Setup Script
# This script helps you get started quickly with the frontend

set -e

echo "🚀 Xtractic AI Frontend Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your backend API URL."
else
    echo "ℹ️  .env file already exists."
fi

echo ""
echo "================================"
echo "✨ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file to configure your backend API URL"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 in your browser"
echo ""
echo "For more information, see README.md or QUICKSTART.md"
echo ""
