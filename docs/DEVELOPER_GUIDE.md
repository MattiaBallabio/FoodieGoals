# FoodieGoals developer guide

The public website is at https://foodiegoals.mattiaballabio8-cloudfare.workers.dev/. These commands are for maintaining the source code and local database.

## Run locally

Install Node.js 24 or newer and pnpm. From `app`:

```powershell
pnpm install --frozen-lockfile
node scripts/local.mjs migrate
node scripts/local.mjs import data/verified.json
node scripts/local.mjs dev
```

On the original Windows development computer, Node and pnpm may not be on `PATH`. Use the bundled Node executable documented in the local workspace setup when needed. The local D1 database persists under `app/.wrangler/state/v3/d1`; do not delete it if you need its data. Browser favorites use the `foodie-favorites` local-storage key and are separate from D1.

The checked-in pnpm configuration disables selected dependency build scripts. Review packages and platform requirements before changing that approval policy.

## Verify changes

With the development server running, use another terminal in `app`:

```powershell
node scripts/local.mjs test
node scripts/local.mjs api
node node_modules/typescript/bin/tsc --noEmit
node scripts/local.mjs build
```

Unit tests do not need a server. API tests use `http://localhost:3000` by default; set `FOODIE_URL` to use another port. For UI changes, run the flows in `app/tests/browser-flow.mjs` with a browser-tool tab and wait for `main[data-ready="true"]` after navigation. See [TESTING.md](../TESTING.md) for the manual checklist.

## Maintain meal data

Review primary sources before changing `app/data/verified.json`. Preserve source URLs, serving sizes, check dates, and `null` for unknown nutrients. Validate a reviewed copy before importing:

```powershell
node scripts/import.mjs data/my-reviewed-records.json --validate-only
node scripts/local.mjs import data/my-reviewed-records.json
```

The importer accepts `restaurants`, `items`, `meals`, and `locations` arrays. IDs must be unique lowercase letters, digits, or hyphens. Stable IDs update existing records; omitted IDs are not deleted. Meals must use components from the same restaurant and verification class. Back up `.wrangler/state` before significant local data changes. `data/import.sql` is generated and is not the source of truth. Fictional `demo` meals are excluded by the serving API.

For schema changes, edit `app/db/schema.ts`, generate and inspect a Drizzle migration, then run `node scripts/local.mjs migrate`. Do not edit applied migrations. Remote Cloudflare D1 migrations and imports require `--remote` and authenticated Wrangler access; review their targets before execution.

## Code map

- `app/app/page.tsx`: interface and browser-local saved meals.
- `app/lib/matching.ts`: input validation, exact totals, constraints, and ranking.
- `app/lib/location.ts`: ZIP lookup, demo coverage, and distance calculations.
- `app/lib/database.ts`: restaurant and meal records.
- `app/app/api/search/route.ts` and `app/app/api/meals/route.ts`: server API routes.
- `app/db/schema.ts` and `app/drizzle`: relational schema and migrations.

Calories use inclusive minimum and maximum values. Both are required whole numbers from 0 through 10,000, and equal bounds request an exact total. Unknown active nutrients cannot pass verification. Selected categories use OR; active nutrient constraints use AND. Near matches list failed constraints. Legacy target/tolerance API requests are normalized to explicit bounds.
