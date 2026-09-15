# Dog Sit

A practical dog-sitting business tracker: bookings, clients, revenue and planning goals, plus an AI assistant for natural-language data entry. The data tables are built on [tablecn](https://github.com/sadmann7/tablecn) (shadcn + TanStack Table with server-side sorting, filtering, and pagination).

**Repository:** [https://github.com/drewsephski/dogsitting-tracker](https://github.com/drewsephski/dogsitting-tracker)

## Primary views

- **Dashboard** — revenue, goals, and business metrics
- **Bookings** — service types, dates, revenue, and status
- **Clients** — dogs and contact info; totals derived from bookings
- **Chat** — AI tools to read and update the same data as the UI

Access is gated with [Neon Auth](https://neon.tech/docs/neon-auth/overview); bookings, clients, and settings are scoped to the signed-in user.

## Tech stack

- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI:** [shadcn/ui](https://ui.shadcn.com)
- **Tables:** [TanStack Table](https://tanstack.com/table/latest) via tablecn patterns
- **Database:** [Neon](https://neon.tech) (PostgreSQL)
- **ORM:** [Drizzle](https://orm.drizzle.team)
- **Validation:** [Zod](https://zod.dev)
- **AI:** [Vercel AI SDK](https://sdk.vercel.ai) with [OpenRouter](https://openrouter.ai)

## Environment variables

Copy `.env.example` to `.env` (and use `.env.local` for secrets pulled from Neon):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon (or Postgres) connection string |
| `DATABASE_URL_UNPOOLED` | Direct connection for migrations (Neon) |
| `NEON_BRANCH` | Neon branch name (e.g. `production`) |
| `NEON_FUNCTION_HELLO_BASE_URL` | Optional Neon function URL after `pnpm neon:apply` |
| `NEON_AUTH_BASE_URL` | Neon Auth endpoint |
| `NEON_AUTH_COOKIE_SECRET` | Session cookie secret (32+ characters) |
| `OPENROUTER_API_KEY` | API key for the chat assistant |
| `OPENROUTER_MODEL` | OpenRouter model id (optional; has a default in code) |

For Neon, link the project (`npx neon link`) and run `pnpm neon:env` to refresh auth and database URLs. For local Docker Postgres, see the commented block in `.env.example`.

Legacy rows without `user_id` stay hidden until claimed with `LEGACY_DATA_OWNER_USER_ID=... pnpm db:backfill-owner` (see `AGENTS.md`).

## Running locally

### Quick setup (Docker Postgres)

1. **Clone the repository**

   ```bash
   git clone https://github.com/drewsephski/dogsitting-tracker.git
   cd dogsitting-tracker
   ```

2. **Copy environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in `OPENROUTER_API_KEY`, Neon Auth values, and either Neon `DATABASE_URL` or the Docker Postgres settings from the comments in `.env.example`.

3. **Run setup**

   ```bash
   pnpm ollie
   ```

   This installs dependencies, starts Docker PostgreSQL (if configured), migrates, and seeds sample data.

4. **Start the dev server**

   ```bash
   pnpm dev
   ```

### Manual setup

1. Clone and install:

   ```bash
   git clone https://github.com/drewsephski/dogsitting-tracker.git
   cd dogsitting-tracker
   pnpm install
   ```

2. Configure `.env` / `.env.local` as above.

3. Apply schema and seed:

   ```bash
   pnpm db:setup
   ```

4. Run:

   ```bash
   pnpm dev
   ```

## Scripts

- `pnpm lint` / `pnpm typecheck` — code quality
- `pnpm test` — Vitest (database tests skip without `DATABASE_URL`)
- `pnpm db:migrate` / `pnpm db:seed` — database lifecycle
- `pnpm neon:apply` / `pnpm neon:env` — Neon project config and env pull

## Deployment

Deploy like any Next.js app (e.g. [Vercel](https://vercel.com/docs/frameworks/nextjs)). Set the same environment variables as in production Neon and OpenRouter.

## Credits

- [tablecn](https://github.com/sadmann7/tablecn) — table infrastructure and patterns
- [shadcn/ui](https://ui.shadcn.com) — UI components
- [create-t3-app](https://create.t3.gg) — project scaffolding
