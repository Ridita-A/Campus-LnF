#!/bin/bash

# Start backend server in background
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Start frontend dev server
npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C and cleanup
trap cleanup INT TERM

echo "Backend running on PID: $BACKEND_PID"
echo "Frontend running on PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait
