# FoodieGoals — Find your next bite.

A mobile-friendly way to find restaurant meals that fit your calorie and nutrient preferences. **[Use FoodieGoals](https://foodiegoals.mattiaballabio8-cloudfare.workers.dev/).**

The site is currently hosted on Cloudflare. The planned `foodiegoals.com` domain is not connected yet.

## Published site and current limits

The Cloudflare Worker is live, and its D1 database contains 3 restaurants, 23 menu items, and 30 meal combinations. A live search for demo ZIP 44512 returned nutrition matches on September 25, 2026. Location remains a limited demo: mapped branches do not verify that a particular meal is available there, and there are no strict location-verified matches. Saved meals remain in each browser's local storage; there are no accounts or cross-device sync.

Publication does not resolve the outstanding data, image-rights, accessibility, privacy, and operational review noted below. In particular, the Chick-fil-A photograph currently shown has no established commercial reuse license, and Chipotle nutrition is based on a July 2022 source. Resolve these before broader promotion.

## Future development and legal research

The recommendations page now includes a ZIP-centered map, sourced restaurant pins, and Google Maps directions. See [map behavior, providers, and limitations](docs/RESTAURANT_MAP.md). Meal recommendations support demo ZIPs **44512 (Boardman / Youngstown), 10001, and 02108**; mapped locations do not verify branch meal availability. Live map lookups need internet access.

Restaurant names now have neutral initials badges on meal cards and details. [Logo rights review](docs/LOGO_RIGHTS.md): no official restaurant logos are enabled because permission for this use has not been established.

The [seven-day development planner](docs/DEVELOPMENT_PLANNER.md) tracks nationwide coverage, accounts, synced saved meals, and preparation for a later iOS app. Its first UI milestones are now implemented: explicit calorie minimum/maximum entry, a navy-and-teal palette, and self-hosted Inter typography. See [interface and calorie-filter notes](docs/INTERFACE_AND_FILTERS.md). The [legal research and launch checklist](docs/LEGAL_REVIEW.md) covers federal issues, Ohio, Boardman, and priority nationwide privacy questions; it remains preliminary research, not legal clearance.

## What works

- Three steps, separate calorie minimum and maximum fields, optional minimum/maximum/range nutrient preferences, multiple categories, and five-digit ZIP validation.
- Meal data stored in Cloudflare D1 and queried through server API routes. No restaurant scraping during searches.
- Exact component totals, explanations for every active constraint, separate strict/demo/near sections, sorting, details, source links, and saved meals.
- Phone and desktop layouts, keyboard focus, accessible select and dialog controls, loading, validation, empty, and server-error states.

## Data honesty and coverage

There are **30 sourced meal combinations from 3 chains**, built from 23 individual components. This does not mean 30 current, locally available restaurant offerings:

| Chain | Meals | Evidence and limitation |
|---|---:|---|
| Panda Express | 16 | Eight entrées paired with a full published portion of either Super Greens or white rice. Values transcribed from the official US nutrition table on September 7, 2026. |
| Chick-fil-A | 4 | Two sandwiches, an 8-count nugget entrée, and two 8-count nugget entrées. Official product-page values checked September 7, 2026. Nugget fiber was not available in the accessed page and is **null**. |
| Chipotle | 10 | Five proteins with either brown rice or greens, plus beans, salsa, and vegetables. The accessible official US PDF is marked **July 2022**. These historical published values are clearly labeled on every card and need current-menu re-verification. |

All portions, source URLs, notes, and dates are in `app/data/verified.json`. “Official” describes the provenance of the transcribed facts, not guaranteed freshness or branch inventory. Combinations are FoodieGoals suggestions, not claims of official named combos. Drinks and unlisted extras are excluded. Chipotle customizations are exact published components, with no guessed subtraction for sauces or ingredients. Nutrition and menu availability can vary.

Primary sources:

- [Panda Express nutrition table](https://www.pandaexpress.com/nutritioninformation)
- [Chick-fil-A grilled sandwich](https://www.chick-fil-a.com/menu/entrees/grilled-chicken-sandwich), [spicy sandwich](https://www.chick-fil-a.com/menu/entrees/spicy-chicken-sandwich), [8-count nuggets](https://www.chick-fil-a.com/menu/entrees/8-ct-chick-fil-a-nuggets)
- [Chipotle official US PDF, marked July 2022](https://www.chipotle.com/content/dam/poc/order/nutrition-files/PaperMenu_STANDARD_NoPricing_120221_us.pdf)

**Location is explicitly a limited demo.** Supported examples: `44512` (Boardman / Youngstown), `10001`, and `02108`. Their real ZIP centers were checked against Zippopotam.us and cached with source URLs in `app/data/zip-centers.json`, so nutrition results and ZIP centers work offline. The provider labels 44512 as Youngstown, OH; the quick-select identifies the Boardman / Youngstown area. There are **no fabricated branches, addresses, distances, or stock claims**. The locations table is intentionally empty; map branches are fetched separately from OpenStreetMap and require internet access. Unsupported ZIPs receive a coverage message rather than unrelated results.

Because branch coverage is absent, the shipped app has **zero strict location-verified matches**. Its separate national-menu demo section shows meals meeting nutrition and category constraints. It explicitly states that the requested radius cannot be verified. Distance sorting is disabled until verified locations are available. The matching engine’s verified-location and distance behavior is covered by synthetic unit-test fixtures; those fixtures never enter the product database.

The official Chick-fil-A photograph is loaded from its website. No open commercial reuse license was established; obtain permission or replace it with owned/licensed photography.

## Next steps

1. **Broader accurate data:** replace historical Chipotle values with current official records; add more chains and category coverage; review allergens separately if that becomes a product feature. Add automated freshness reports and human review of changed portions.
2. **Live location coverage:** add a permitted restaurant location source, calculate distances from real ZIP centers, and label them as approximate straight-line miles. Keep stock unconfirmed unless a source explicitly verifies it.
3. **Release readiness:** resolve data/photo reuse, accessibility, API rate limits, request-size limits, monitoring, backups, privacy, and dependency stability for the published site. Add importer transactions/review tooling and scalable database queries as the catalog grows.
4. **Future mobile app:** consume the existing HTTP API, reuse the matching types/rules, and add device-local favorites first. Accounts, payments, delivery, and native apps are intentionally outside this version.
