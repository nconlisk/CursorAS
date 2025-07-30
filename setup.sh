#!/bin/bash

# Among Us Task Simulator - Setup Script
# This script sets up the local nginx server for the task simulator

echo "🚀 Among Us Task Simulator - Setup Script"
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start the services
echo "🔨 Building and starting the Among Us Task Simulator..."
docker-compose up -d

# Check if the container is running
if [ "$(docker ps -q -f name=amongus-task-simulator)" ]; then
    echo "✅ Among Us Task Simulator is now running!"
    echo ""
    echo "🌐 Access the application at:"
    echo "   http://localhost:8080"
    echo ""
    echo "📱 For mobile testing, use your computer's IP address:"
    echo "   http://$(hostname -I | awk '{print $1}'):8080"
    echo ""
    echo "🛠️  To stop the server, run:"
    echo "   docker-compose down"
    echo ""
    echo "📝 To view logs, run:"
    echo "   docker-compose logs -f"
else
    echo "❌ Failed to start the container. Check the logs:"
    docker-compose logs
    exit 1
fi