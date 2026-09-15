# Per-user data migration

## Order

1. `pnpm db:migrate` — applies `0001_add_user_ownership` (nullable `user_id` columns).
2. `pnpm db:report-unowned` — record how many legacy rows still need an owner.
3. `LEGACY_DATA_OWNER_USER_ID=<neon-auth-user-id> pnpm db:backfill-owner` — assigns only rows where `user_id` IS NULL.
4. `pnpm db:migrate` — applies `0002_enforce_user_ownership` (NOT NULL + settings keyed by `user_id`).
5. Deploy the application code that scopes all reads/writes by `session.user.id`.

Do not run step 4 until step 3 completes with zero remaining unowned rows.

## Seed (development)

```bash
SEED_USER_ID=<neon-auth-user-id> pnpm db:seed
```

Seed data is replaced only for that user id (not global).

## Tests

```bash
pnpm exec dotenv -e .env -e .env.local -- pnpm test
```

Requires migrations through `0002` on the target database.
