# FoodieGoals manual checklist

## Current verification — interface and calorie bounds, September 8, 2026

- 41 passing automated checks: 32 unit/data/map tests and 9 HTTP/API tests. TypeScript and production build pass.
- Browser checks passed for exact Minimum calories / Maximum calories labels, reversed and missing-input errors, equal bounds (500/500), 44512 quick-select/results, and editing filters. The existing default search/details/favorites flow also passed.
- Inter loaded from the local font file. Desktop 1280px and phone 390px layouts were visually reviewed; 320px form width was checked without horizontal overflow. Small-screen map popups/directions and its address list worked; no browser page errors.
- Static palette review found key text pairs above 4.5:1 and input borders above 3:1. This does not replace a full screen-reader or physical-device audit.

## 44512 demo check — September 8, 2026

Added and verified the Boardman / Youngstown quick-select and sourced ZIP center. All 34 unit/API tests, TypeScript, and build passed. Browser search and saved-meal regression flow passed; 44512 returned 11 mapped branches within ten miles, loaded tiles and working Google Maps destination links, with no page errors or mobile overflow. Live counts may change.

Use [the developer guide](docs/DEVELOPER_GUIDE.md) for local setup. Test ZIP `02108` preserves its leading zero. Demo ZIPs `44512` and `10001` also work. Community-mapped branches do not confirm availability of specific meals.

| Check | Steps and expected result |
|---|---|
| Calories only | Minimum 500, maximum 700; leave optional inputs blank; Anything; 02108; 10 miles. Nutrition demo matches are 500–700 calories inclusive. Strict matches remain 0 because meal-to-branch availability is unverified. |
| Optional minimums | Protein 30 minimum; fiber 5 minimum. Every nutrition match has known values meeting both. |
| Optional maximums | Carbs 80 maximum; fat 25 maximum. Every nutrition match stays at or below both. |
| Range | Change protein to target 30 ±5. Every nutrition match has 25–35g inclusive. |
| Blank vs zero | Protein blank adds no constraint. Protein maximum 0 is an actual zero limit and yields no nutrition matches in this seed. |
| Validation | Empty, negative, fractional, or reversed calorie bounds; negative optional-nutrient tolerance; ZIP `2108` or `abcde`. A clear error appears; no search occurs. Calorie zero and equal bounds are valid. |
| Multiple categories | Select Asian and Chicken; revisit step 1 and return. Selections and goals remain. Anything clears them. |
| Unsupported location | ZIP 90210: clear coverage message, no results. Change radius: preserved in results, explicitly unverified in demo. |
| Unknown nutrient | Minimum 500, maximum 500, Chicken. Two 8-count nugget entrées total 500 cal and 54g protein; fiber is unknown. Add fiber minimum 0 and this meal cannot be a nutrition match. |
| Exact combined totals | Chicken brown rice bowl: 565 cal, 45g protein, 67g carbs, 11g fiber, 14.5g fat. Open details to inspect all five components. Historical-source note must be visible. |
| Near matches | Minimum 600, maximum 600. Separate near section lists the exact calorie shortfall/excess; never a strict match badge. |
| Sorting | Highest protein sorts nutrition matches descending. Closest calorie match sorts distance from the midpoint of the bounds. Distance is disabled without verified meal branches. |
| Favorites | Save a meal; refresh; open Saved meals. Meal remains. Unsave removes it. |
| Keyboard | Tab through controls; Enter activates buttons and selects; arrows choose options; Escape closes details; visible focus stays within the dialog until it closes. |
| Responsive | 390px phone, 768px tablet, and 1280px desktop. No horizontal page scrolling; nutrient controls fit; details table can scroll horizontally. |
| Error handling | Stop server after the page loads and submit; show a retryable error. Restart server and retry. Clearing/blocking local storage produces an honest save error. |

## Earlier baseline checks (before the map and bounds updates)

- 25 passing tests: 21 matching/import/location tests plus 4 HTTP/database integration tests.
- Production build and TypeScript check pass.
- FoodieGoals rename verified; the repeatable browser flow now waits for client readiness after reload. Full search/details/Escape/favorite-persistence flow passed on September 8, 2026.
- Imported the seed twice; the API still reports 30 meals (duplicate prevention).
- Browser-tool checks: three-step calories-only flow, leading-zero ZIP, multiple categories, strict/demo/near labeling, exact details table, favorites after refresh, select keyboard activation and target-range input.
- Visual inspection at 390px and 1280px; mobile document width did not exceed viewport. Official photograph loaded successfully.
- Synthetic location fixtures test the inclusive radius boundary and rejection of unverified branches. No real nearby-restaurant search was claimed or tested.

Not performed: screen-reader audit, physical iOS/Android device testing, live branch inventory verification, or an exhaustive browser matrix. The Cloudflare Worker is published; a live 44512 search returned nutrition matches on September 25, 2026. The remaining checklist items still need review for the published site.
# Restaurant identifiers — September 8, 2026

- Added a shared neutral initials/name display to meal cards (including saved meals) and the detail description. No official restaurant artwork is enabled; see `docs/LOGO_RIGHTS.md`.
- Passed: 21 existing unit/data tests, 4 API tests against the local database, TypeScript checking, and production build.
- This presentation-only change leaves the search flow and storage behavior unchanged. No new browser visual or screen-reader audit was performed for this change.
# Restaurant map — September 8, 2026

- Passed 28 unit/data/map tests, 5 API tests, TypeScript checking, and production build.
- Existing `app/tests/browser-flow.mjs` passed in a temporary Edge profile: three-step search, leading-zero ZIP, strict/demo/near sections, detail totals, and favorites after reload.
- Live Boston map: 26 sourced pins within a requested 10 miles, map tiles loaded, pin popup linked to Google Maps with the destination coordinates. A separate five-mile lookup returned 18 locations. Counts depend on live data.
- Desktop 1280px and mobile 390px layout checked; no horizontal overflow or browser page errors. Verified zoom controls, popup directions, OSM attribution, and the expandable address/directions list. Provider-error, unknown-ZIP, partial-response, and empty-result paths are covered with controlled test responses.
- Native Google Maps navigation and physical iPhone Safari were not tested. The verified link follows Google's documented cross-platform URL format.
