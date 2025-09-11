#!/bin/bash

# MMS Setup Script
# This script sets up the Maintenance Management System

echo "🚀 Setting up Maintenance Management System (MMS) v3.0"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Create frontend directory if it doesn't exist
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found. Please ensure you're in the correct directory."
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend

if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in frontend directory"
    exit 1
fi

npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local with your Supabase credentials"
    echo "   - VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "   - VITE_SUPABASE_ANON_KEY=your_anon_key"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Set up your Supabase project:"
echo "   - Create a new project at https://supabase.com"
echo "   - Go to SQL Editor and run the following files in order:"
echo "     - schema.sql (creates tables and policies)"
echo "     - rpc.sql (creates stored procedures)"
echo "     - seed.sql (creates sample data)"
echo ""
echo "2. Update your environment variables:"
echo "   - Edit frontend/.env.local with your Supabase credentials"
echo ""
echo "3. Start the development server:"
echo "   - cd frontend"
echo "   - npm run dev"
echo ""
echo "4. Open your browser and navigate to http://localhost:3000"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "Happy coding! 🚀"