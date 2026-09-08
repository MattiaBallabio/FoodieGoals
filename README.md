# FoodieGoals — Find your next bite.

A local, mobile-friendly first version. Open **http://localhost:3000/** while the development server is running. Nothing has been published and no paid services or API keys are needed.

Source and version history: [MattiaBallabio/FoodieGoals](https://github.com/MattiaBallabio/FoodieGoals) (private). The local folder remains named `Foodie` so existing project paths and database storage continue to work. The saved-meal storage key also stays compatible with the original version.

We save meaningful, tested Git commits and push at the end of each working session, or at a useful milestone during longer work. Future project agents follow this preference in `AGENTS.md`. This is part of active development, not an unattended recurring job. The intended domain is `foodiegoals.com`; this project has not purchased or connected it.

## Quick start on this computer

The app and its dependencies are in `app`. In PowerShell:

```powershell
cd "C:\Users\gdslmb\Desktop\Coding Projects\Foodie\app"
$foodieNode = "C:\Users\gdslmb\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
& $foodieNode scripts/local.mjs dev
```

Open the Local URL printed by the server. **Stop:** press **Ctrl+C** in that terminal. If port 3000 is occupied, use the printed URL; avoid starting a second copy while this preview is running.

The database is already initialized. It lives in `app/.wrangler/state/v3/d1` and survives refreshes and server restarts. Do not delete `.wrangler` if you want to keep imported data. Favorites live separately in this browser’s local storage. Clearing browser data removes favorites.

## Start on another computer

Install Node.js **24 or newer** and pnpm. Then, from `app`:

```powershell
pnpm install --frozen-lockfile
node scripts/local.mjs migrate
node scripts/local.mjs import data/verified.json
node scripts/local.mjs dev
```

Respect any package approval prompts from your environment. On this machine pnpm reported blocked optional dependency build scripts, but the prebuilt packages successfully ran development, type checking, database commands, and the production build. No approval policy was bypassed.

The checked-in pnpm configuration explicitly disables those dependency build scripts. If another platform needs them, review the relevant packages and your environment's approval policy before enabling them.

## What works

- Three steps, editable calorie tolerance, optional minimum/maximum/range nutrient preferences, multiple categories, and five-digit ZIP validation.
- A persistent SQLite database (local Cloudflare D1) queried through server API routes. No restaurant scraping during searches.
- Exact component totals, explanations for every active constraint, separate strict/demo/near sections, sorting, details, source links, and saved meals.
- Phone and desktop layouts, keyboard focus, accessible select and dialog controls, loading, validation, empty, and server-error states.

## Data honesty and coverage

There are **30 sourced meal combinations from 3 chains**, built from 23 individual components. This does not mean 30 current, locally available restaurant offerings:

| Chain | Meals | Evidence and limitation |
|---|---:|---|
| Panda Express | 16 | Eight entrées paired with a full published portion of either Super Greens or white rice. Values transcribed from the official US nutrition table on September 7, 2026. |
| Chick-fil-A | 4 | Two sandwiches, an 8-count nugget entrée, and two 8-count nugget entrées. Official product-page values checked September 7, 2026. Nugget fiber was not available in the accessed page and is **null**. |
| Chipotle | 10 | Five proteins with either brown rice or greens, plus beans, salsa, and vegetables. The accessible official US PDF is marked **July 2022**. These historical published values are clearly labeled on every card and need current-menu re-verification before launch. |

All portions, source URLs, notes, and dates are in `app/data/verified.json`. “Official” describes the provenance of the transcribed facts, not guaranteed freshness or branch inventory. Combinations are FoodieGoals suggestions, not claims of official named combos. Drinks and unlisted extras are excluded. Chipotle customizations are exact published components, with no guessed subtraction for sauces or ingredients. Nutrition and menu availability can vary.

Primary sources:

- [Panda Express nutrition table](https://www.pandaexpress.com/nutritioninformation)
- [Chick-fil-A grilled sandwich](https://www.chick-fil-a.com/menu/entrees/grilled-chicken-sandwich), [spicy sandwich](https://www.chick-fil-a.com/menu/entrees/spicy-chicken-sandwich), [8-count nuggets](https://www.chick-fil-a.com/menu/entrees/8-ct-chick-fil-a-nuggets)
- [Chipotle official US PDF, marked July 2022](https://www.chipotle.com/content/dam/poc/order/nutrition-files/PaperMenu_STANDARD_NoPricing_120221_us.pdf)

**Location is explicitly a limited demo.** Supported examples: `10001` and `02108`. Their real ZIP centers were checked against Zippopotam.us and cached with source URLs in `app/data/zip-centers.json`, so the app works offline. There are **no fabricated branches, addresses, distances, or stock claims**. The locations table is intentionally empty. Unsupported ZIPs receive a coverage message rather than unrelated results.

Because branch coverage is absent, the shipped app has **zero strict location-verified matches**. Its separate national-menu demo section shows meals meeting nutrition and category constraints. It explicitly states that the requested radius cannot be verified. Distance sorting is disabled until verified locations are available. The matching engine’s verified-location and distance behavior is covered by synthetic unit-test fixtures; those fixtures never enter the product database.

The official Chick-fil-A photograph is loaded from its website as a local preview reference. No open commercial reuse license was established; obtain permission or replace it with owned/licensed photography before public launch.

## Tests and build

With the development server running, use a second PowerShell terminal in `app`. On this computer use `& $foodieNode` in place of `node` if Node is not on your terminal PATH.

```powershell
node scripts/local.mjs test
node scripts/local.mjs api
node node_modules/typescript/bin/tsc --noEmit
node scripts/local.mjs build
```

The unit tests need no server. The API tests exercise the actual HTTP routes and persistent database; their default URL is `http://localhost:3000`. To change it: `$env:FOODIE_URL = "http://localhost:3001"`.

See `app/tests/browser-flow.mjs` for a repeatable browser-tool test flow and `TESTING.md` for the manual checklist and recorded checks. Ask Codex to run the exported flow with its browser-tool tab object; it uses the supported browser API, not a separate installed browser driver.

## Import or update meals

Copy `app/data/verified.json` to your own JSON file and edit that copy after checking official sources. Do not overwrite verification dates just to make records appear fresh.

```powershell
node scripts/import.mjs data/my-reviewed-records.json --validate-only
node scripts/local.mjs import data/my-reviewed-records.json
```

The import accepts four arrays: `restaurants`, `items`, `meals`, and `locations`. See the seed file for a complete example. Every row needs a stable, unique lowercase/digit/hyphen `id`. Restaurants need names. Items need `restaurantId`, `name`, `serving`, `calories`, `protein`, `carbs`, `fiber`, `fat`, an HTTPS `source`, a `checked` date (`YYYY-MM-DD`), `verification` (`official` or `demo`), and a useful `note`. Unknown nutrients must be JSON `null`; this starter requires known calories. Meals need `restaurantId`, `name`, nonempty supported `categories`, `verification`, and a nonempty `components` list of `{ "itemId": "...", "quantity": 1 }`.

The importer rejects negative/non-numeric nutrients, duplicate IDs/components, missing sources, and cross-restaurant or mixed-verification meals. Stable IDs update existing rows instead of making duplicates. It replaces a meal’s components when updating that meal. Omitted IDs are **not deleted**. Import full restaurant/item dependencies along with the meals being updated. Back up `.wrangler/state` before significant data changes. The generated `data/import.sql` is an intermediate, not the source of truth; always use the validator/import command.

Fictional `demo` meals can be stored for development, but the serving API filters them out. The shipped seed has none. Never relabel fictional values as official. `scripts/create-seed.mjs` records the original manual transcription and can regenerate the original 30-meal JSON; use your own reviewed JSON for later updates.

For schema changes, edit `app/db/schema.ts`, run `node node_modules/drizzle-kit/bin.cjs generate`, inspect the new SQL under `drizzle`, and run `node scripts/local.mjs migrate`. Keep applied migrations unchanged. Refresh the two cached ZIP centers with `node scripts/update-zips.mjs` (network required; no key).

## How the code is organized

- `app/app/page.tsx`: the React interface and browser-local favorites.
- `app/lib/matching.ts`: input validation, exact totals, constraints, and deterministic ranking. It has no browser or AI dependency.
- `app/lib/location.ts`: replaceable location-provider contract, real ZIP lookup adapter, cached demo coverage, and straight-line distance calculation.
- `app/lib/database.ts`: reads stored restaurant, component, and meal records.
- `app/app/api/search/route.ts`: validated `POST /api/search`; `app/app/api/meals/route.ts`: catalog for saved meals.
- `app/db/schema.ts` and `app/drizzle`: relational schema and its migration. Rich serving/nutrition/source fields are stored in validated JSON records within the item and meal tables.

Calories use an inclusive target range. Each optional constraint is evaluated independently; all must pass. An active nutrient with unknown data fails verification. Selected categories are an OR (“Asian or Chicken”). Ranking uses absolute calorie difference, then stable meal ID; protein sorting uses descending known protein, then calorie difference; distance uses verified straight-line miles, then calorie difference. No percentages or AI scores. Near matches always list failures and never silently change a constraint.

The starter uses React with Vinext/Vite and Cloudflare’s local SQLite runtime. The generated stack includes some unused UI primitives for later work. Vinext is a beta dependency; reassess framework stability and pin/update dependencies before a public launch. The shared API and matching module can support a future mobile client without rewriting nutrition arithmetic.

## Next steps

1. **Broader accurate data:** replace historical Chipotle values with current official records; add more chains and category coverage; review allergens separately if that becomes a product feature. Add automated freshness reports and human review of changed portions.
2. **Live location coverage:** choose a permitted/licensed restaurant directory (or maintain sourced branch records), implement `LocationProvider`, calculate distances from the real ZIP center, and label distances as approximate straight-line miles. Keep stock unconfirmed unless a source explicitly verifies it. Keep service keys on the server in ignored environment files; no browser keys are needed for this prototype.
3. **Public launch:** obtain permission before publishing; review data/photo reuse, accessibility, API rate limits, request-size limits, monitoring, backups, privacy, and dependency stability. Add importer transactions/review tooling and scalable database queries as the catalog grows. No hosting account or service was purchased here.
4. **Future mobile app:** consume the existing HTTP API, reuse the matching types/rules, and add device-local favorites first. Accounts, payments, delivery, and native apps are intentionally outside this version.

The `.setup` folder holds the locally installed scaffold tool used to work around a Windows package-manager resolution issue. It is not part of the app and is not needed to start FoodieGoals.
