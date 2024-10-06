#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

cleanup() {
    echo "Cleaning up..."
    docker compose --profile test down test-db
    echo "Environment cleaned up."
}

trap cleanup EXIT

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    echo "Waiting for PostgreSQL to be ready..."
    while ! docker exec capstone-project-2024-t3-3900f15atomatofactory-test-db-1 pg_isready -U testuser -d test-db >/dev/null 2>&1; do
        sleep 1
    done
    echo "PostgreSQL is ready!"
}

echo "Cleaning up running containers..."
docker compose down

echo "Starting PostgreSQL container..."
docker compose --profile test up -d test-db

wait_for_postgres

echo "Running tests..."
NODE_ENV="test" npm run db:migrate
npx jest --runInBand integration/
