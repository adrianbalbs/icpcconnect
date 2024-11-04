#!/bin/bash

set -e

PATTERN=$1

cleanup() {
    echo "Cleaning up..."
    docker compose --profile test down -v test-db
    echo "Environment cleaned up."
}

trap cleanup EXIT

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

npx vitest run --config vitest.config.integration.ts "${PATTERN}"
