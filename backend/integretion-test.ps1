#!/usr/bin/env pwsh

# Exit on error
$ErrorActionPreference = "Stop"

function Cleanup {
    Write-Host "Cleaning up..."
    docker compose --profile test down test-db
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
    docker-compose --profile test up -d test-db

    Wait-ForPostgres

    Write-Host "Checking test environment is set"
    $env:TEST_DB = "postgres://testuser:testpassword@localhost:5556/testdb"

    Write-Host "Running tests..."
    $env:NODE_ENV = "test"
    npm run db:migrate

    $PATTERN = $args[0]
    if (-not $PATTERN) {
        $PATTERN = '.*'
    }
    $env:NODE_OPTIONS="--experimental-vm-modules"; npx jest --runInBand --config jest.config.integration.js --testPathPattern="$PATTERN"
}
finally {
    Cleanup
}
