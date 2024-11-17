#!/usr/bin/env pwsh

# Exit on error
$ErrorActionPreference = "Stop"

function Cleanup {
    Write-Host "Cleaning up..."
    docker compose --profile test down -v test-db
    Write-Host "Environment cleaned up."
}

function Wait-ForPostgres {
    Write-Host "Waiting for PostgreSQL to be ready..."
    while (-not (docker exec capstone-project-2024-t3-3900f15atomatofactory-test-db-1 pg_isready -U testuser -d test-db 2>$null)) {
        Start-Sleep -Seconds 1
    }
    Write-Host "PostgreSQL is ready!"
}

try {
    Write-Host "Cleaning up running containers..."
    docker-compose down

    Write-Host "Starting PostgreSQL container..."
    docker-compose --profile test up -d test-db redis

    Wait-ForPostgres

    # Write-Host "Checking test environment is set"
    $env:PG_TEST_USER = "testuser"
    $env:PG_TEST_HOST = "localhost"
    $env:PG_TEST_PW = "testpassword"
    $env:PG_TEST_DB = "testdb"
    $env:PG_TEST_PORT = "5556"

    # Checking that necessary packages are installed
    Write-Host "Checking that necessary packages are installed..."
    npm install

    Write-Host "Running tests..."

    $PATTERN = $args[0]
    if (-not $PATTERN) {
        $PATTERN = '.*'
    }
    npx vitest run --config vitest.config.integration.ts "src/integration"
}
finally {
    Cleanup
    redis
}
