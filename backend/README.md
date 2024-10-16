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
PG_TEST_USER=testuser
PG_TEST_HOST=localhost
PG_TEST_PW=testpassword
PG_TEST_DB=testdb
PG_TEST_PORT=5556
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
