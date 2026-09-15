## Project

Single-user dog-sitting business tracker built from `sadmann7/tablecn`.

The app tracks:
- Bookings
- Clients
- Revenue and business metrics
- Planning goals
- AI-assisted data entry and updates

Keep the product simple and practical. Do not overengineer.

## Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- TanStack Table / tablecn
- PostgreSQL on Neon
- Drizzle ORM
- Zod
- Vercel AI SDK
- OpenRouter via `@openrouter/ai-sdk-provider`
- pnpm

## Architecture

- Neon Postgres is the source of truth.
- Use Drizzle for all database access.
- Keep database code server-side.
- Prefer Next.js Server Components, Server Actions, or Route Handlers where appropriate.
- Do not introduce another database or persistence layer.
- Do not add Neon Functions unless there is a concrete need.
- No authentication for now; this is currently a single-user app.
- Preserve existing tablecn infrastructure unless it clearly conflicts with the product.

## Core Data

### Bookings
Each booking belongs to a dog/client and includes:
- service type
- start/end date and time
- nights / calendar days
- optional care hours
- revenue
- notes/status

### Clients
Client records include:
- dog name
- optional owner/contact information

Client revenue, booking count, and repeat status should be derived from bookings rather than manually maintained when possible.

### Settings
Single-row planning settings:
- monthly income goal
- monthly expenses
- move-out savings target

## Business Rules

- Bookings are the primary source of truth for revenue.
- Editing or deleting a booking must immediately affect client and dashboard totals.
- Never invent missing dates, times, or dollar amounts.
- If required information is ambiguous, ask before writing data.
- Keep calculations deterministic and centralized in shared utilities.

## AI Chat

The chatbot uses Vercel AI SDK tool calling.

Use OpenRouter only:

- API key: `OPENROUTER_API_KEY`
- model should be configurable by environment variable

The chatbot may read and modify the same Neon data used by the UI.

Typical tools:
- `listBookings`
- `createBooking`
- `updateBooking`
- `deleteBooking`
- `listClients`
- `upsertClient`
- `updateSettings`
- `getDashboardSummary`

The model should never mutate data without using a tool.

## UI

Prefer existing tablecn and shadcn components over custom replacements.

Primary views:
- Dashboard
- Bookings
- Clients
- Chat

Tables should support straightforward add, edit, and delete workflows.

Keep the interface clean, compact, and obvious. Avoid unnecessary abstractions, nested card layouts, or complex state management.

## Coding Guidelines

- TypeScript strictness over shortcuts.
- Avoid `any`.
- Validate external/user input with Zod.
- Keep components small and focused.
- Keep server and client boundaries explicit.
- Reuse existing utilities and components before adding dependencies.
- Prefer simple functions over generic frameworks or abstractions.
- Do not add dependencies unless they solve a real problem.
- Run lint/typecheck after meaningful changes.

## Current Seed Data

- Ylva:
  - Aug 25, 26, 27 2026
  - daycare
  - 7:00 AM–4:00 PM
  - $20 each

- Molly:
  - Aug 30, 2026 at 10:00 AM
  - through morning of Sep 15, 2026
  - overnight
  - 16 nights / 17 calendar dates
  - $550

Expected totals:
- August: $60
- September: $550
- All time: $610
- 4 bookings
- 2 clients