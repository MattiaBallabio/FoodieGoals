# FoodieGoals manual checklist

Start the app using README.md. Test ZIP `02108` preserves its leading zero. Test ZIP `10001` also works in demo mode. These are examples, not a claim of nearby branches.

| Check | Steps and expected result |
|---|---|
| Calories only | 600 ±100; leave optional inputs blank; Anything; 02108; 10 miles. Nutrition demo matches are 500–700 calories inclusive. Strict matches are 0 because branch coverage is absent. |
| Optional minimums | Protein 30 minimum; fiber 5 minimum. Every nutrition match has known values meeting both. |
| Optional maximums | Carbs 80 maximum; fat 25 maximum. Every nutrition match stays at or below both. |
| Range | Change protein to target 30 ±5. Every nutrition match has 25–35g inclusive. |
| Blank vs zero | Protein blank adds no constraint. Protein maximum 0 is an actual zero limit and yields no nutrition matches in this seed. |
| Validation | Empty/zero/negative calories; negative tolerance; ZIP `2108` or `abcde`. A clear error appears; no search occurs. |
| Multiple categories | Select Asian and Chicken; revisit step 1 and return. Selections and goals remain. Anything clears them. |
| Unsupported location | ZIP 90210: clear coverage message, no results. Change radius: preserved in results, explicitly unverified in demo. |
| Unknown nutrient | Target 500 ±0, Chicken. Two 8-count nugget entrées total 500 cal and 54g protein; fiber is unknown. Add fiber minimum 0 and this meal cannot be a nutrition match. |
| Exact combined totals | Chicken brown rice bowl: 565 cal, 45g protein, 67g carbs, 11g fiber, 14.5g fat. Open details to inspect all five components. Historical-source note must be visible. |
| Near matches | Target 600 ±0. Separate near section lists the exact calorie shortfall/excess; never a strict match badge. |
| Sorting | Highest protein sorts nutrition matches descending. Closest calorie match sorts absolute calorie difference. Distance is disabled without verified branches. |
| Favorites | Save a meal; refresh; open Saved meals. Meal remains. Unsave removes it. |
| Keyboard | Tab through controls; Enter activates buttons and selects; arrows choose options; Escape closes details; visible focus stays within the dialog until it closes. |
| Responsive | 390px phone, 768px tablet, and 1280px desktop. No horizontal page scrolling; nutrient controls fit; details table can scroll horizontally. |
| Error handling | Stop server after the page loads and submit; show a retryable error. Restart server and retry. Clearing/blocking local storage produces an honest save error. |

## Automated and browser checks recorded

- 25 passing tests: 21 matching/import/location tests plus 4 HTTP/database integration tests.
- Production build and TypeScript check pass.
- FoodieGoals rename verified; the repeatable browser flow now waits for client readiness after reload. Full search/details/Escape/favorite-persistence flow passed on September 8, 2026.
- Imported the seed twice; the API still reports 30 meals (duplicate prevention).
- Browser-tool checks: three-step calories-only flow, leading-zero ZIP, multiple categories, strict/demo/near labeling, exact details table, favorites after refresh, select keyboard activation and target-range input.
- Visual inspection at 390px and 1280px; mobile document width did not exceed viewport. Official photograph loaded successfully.
- Synthetic location fixtures test the inclusive radius boundary and rejection of unverified branches. No real nearby-restaurant search was claimed or tested.

Not performed: screen-reader audit, physical iOS/Android device testing, live branch inventory verification, public deployment, or an exhaustive browser matrix. Manual checklist items beyond the checks above remain useful before launch.
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
