# Backend

This is a Express.js backend with Drizzle ORM.

## Database Migrations

1. Make updates to the `src/db/schema.ts` file
2. Run `npm run db:generate` to generate a migration file
3. Run `docker compose up --build` to automatically apply the migrations
