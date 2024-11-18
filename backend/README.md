# Backend

This is a Express.js backend with Drizzle ORM.

## Database Migrations

1. Make updates to the `src/db/schema.ts` file
2. Run `npm run db:generate` to generate a migration file
3. Run `docker compose up --build` to automatically apply the migrations

## Testing

There are two types of tests used in this repo: Unit Tests and Integration Tests. Unit tests
are stored next to the file of the code being tested is, but will have a `*.test.ts` suffix appended
to it. Integration tests are stored in the `src/integration` folder and are used to test any
code that interacts with the database/other modules as a whole.

To run the integration tests, make an `.env` folder in the root directory of this folder. Then add the
following environment variables:

```txt
export NODE_ENV=test
export LOG_LEVEL=info
export SMTP_SERVER=smtp.ethereal.email
export EMAIL_USER=rebeca.auer@ethereal.email
export EMAIL_PASSWORD=gpYtdgMPkywbQek1Gb
export EMAIL_PORT=587
export JWT_SECRET=test-secret
export REFRESH_TOKEN_SECRET=refresh-test-secret
export PG_TEST_USER=testuser
export PG_TEST_HOST=localhost
export PG_TEST_PW=testpassword
export PG_TEST_DB=testdb
export PG_TEST_PORT=5556
export REDIS_HOST=localhost
export REDIS_PORT=6379
export ADMIN_EMAIL=admin@comp3900.com
export ADMIN_PASSWORD=tomatofactory
```

Then you can run

```txt
npm run test:integration
```

To run all tests use:

```txt
npm run test
```

For unit tests, use:

```txt
npm run test:unit
```

## Testing in Windows Platform

The test process is similar to the testing in linux platform. For now, it just supports integration test.

To run the test, open the Power Shell terminal with administrator permissions, then run

```txt
npm run test:integration_windows
```
