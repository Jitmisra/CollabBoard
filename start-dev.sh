#!/bin/bash

# Start development servers for the whiteboard app

echo "🚀 Starting Whiteboard App Development Servers..."

# Check if we're using MongoDB Atlas (skip local MongoDB check)
if grep -q "mongodb+srv" backend/.env 2>/dev/null; then
    echo "📡 Using MongoDB Atlas (cloud database)"
else
    # Check if MongoDB is running locally
    if ! pgrep -x "mongod" > /dev/null; then
        echo "⚠️  MongoDB is not running. Please start MongoDB first:"
        echo "   brew services start mongodb/brew/mongodb-community"
        echo "   or"
        echo "   mongod"
        exit 1
    fi
fi

# Function to kill background processes on exit
cleanup() {
    echo "🧹 Cleaning up..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start backend server
echo "📡 Starting backend server on port 5010..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server on port 3000..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting up!"
echo "📡 Backend: http://localhost:5010"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait