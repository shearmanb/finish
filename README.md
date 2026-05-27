# 🥃 Finish — Bourbon Tasting Journal & Bottle Tracker

A personal, single-user web app for guided bourbon tastings, quick tasting notes, and
bottle/collection tracking. Built to be flexible and future-proof: nearly every list
(flavors, rating dimensions & scales, glassware, distilleries, guided-tasting steps,
tasting phases) is editable in an in-app **Control Panel** — no code changes needed.

## Stack

- **Next.js (App Router) + TypeScript** — UI and server logic (Server Actions)
- **PostgreSQL + Prisma** — data
- **Tailwind CSS v4** + hand-built shadcn-style UI components
- **Single-password auth** — bcrypt hash in env, signed HTTP-only session cookie
- Deploys on **Railway** (app + Postgres in one project)

## Core model

`Distillery → Product (expression) → Bottle → Pour`. A pour captures per-phase notes and
per-phase flavor tags, mouthfeel, and a configurable set of scored dimensions (each with
its own scale + optional descriptive anchor labels — e.g. the t8ke 0–10 Overall).

## Local development

```bash
# 1. Postgres running locally, then set up .env (see .env.example)
cp .env.example .env   # fill in DATABASE_URL, SHADOW_DATABASE_URL, APP_PASSWORD_HASH_B64, SESSION_SECRET

# 2. Apply schema + seed starter data (flavor wheel, t8ke scale, phases, etc.)
npm run db:migrate
npm run db:seed

# 3. Run
npm run dev
```

Generate an app password hash:

```bash
node -e "console.log(Buffer.from(require('bcryptjs').hashSync('YOUR_PASSWORD',10)).toString('base64'))"
```

## Deploying to Railway

1. Create a project, add a **PostgreSQL** plugin (sets `DATABASE_URL`).
2. Add service variables: `APP_PASSWORD_HASH_B64`, `SESSION_SECRET`, and `UPLOAD_DIR=/data/uploads`.
3. Mount a **Volume** at `/data/uploads` for bottle photos.
4. Build command: `npm run build` (runs `prisma generate`).
   Start command: `npm run db:deploy && npm run start` (applies migrations, then serves).
5. Seed once after first deploy: `npm run db:seed`.

## Useful scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run db:migrate` | Create/apply a migration locally |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:seed` | Seed starter lookups (idempotent) |
| `npm run db:studio` | Prisma Studio |
