# FoodieGoals: seven-day development planner

Created September 8, 2026. **Planning only: none of these product changes is being implemented in this session.** Day 1 starts when the owner chooses to resume development; these are seven working sessions, not scheduled reminders or automatic jobs.

## Outcome and working assumptions

Build toward a mobile-friendly service that accurately finds meals within explicit calorie limits, recognizes US ZIP codes, and lets users securely save meals across devices. Establish a reusable account/API foundation for a later native iOS app. Improve typography and colors after reviewing options with the owner.

Budget approximately five focused hours per day (35 hours for the first cycle). This is an initial development sprint, not a promise to finish nationwide data licensing, legal review, production security, and an iOS app in one week. External approvals and data availability can extend the schedule. Unfinished acceptance criteria carry into the follow-on phases below; dates never substitute for completion evidence.

Owner decides audience, visual direction, service budget, and business scope. Codex prepares designs, implements authorized work, tests it, and maintains GitHub. Counsel resolves legal questions; data providers supply licensed coverage. Paid services, purchasing foodiegoals.com, and public deployment require separate authorization.

Provisional planning assumptions: general non-medical menu filtering, no advertising trackers, no food checkout, and no HealthKit. Age remains undecided; design the initial scope for adults provisionally, but obtain the owner's decision before implementing an age policy. See [legal research](LEGAL_REVIEW.md).

## Starting point

The local app has three chains, 30 meal combinations, historical Chipotle nutrition, two demo ZIP centers (10001 and 02108), and no verified branch locations. Saved meals exist only in this browser. Calories use a target plus tolerance. The most recent implementation passed 25 unit/API tests plus type checking, build, and browser-flow checks; those checks do not establish production security, legal compliance, nationwide coverage, or native iOS readiness.

## Week at a glance

| Day | Objective | Concrete output | Dependency |
| --- | --- | --- | --- |
| 1 | Define the product and legal boundaries | Decision log, data map, launch gate list, local/counsel inquiry drafts | Owner decisions; external responses can follow later |
| 2 | Design the new appearance and calorie entry | Approved visual direction and tested min/max flow | Day 1 scope and owner design selection |
| 3 | Establish trustworthy national reference data | Nutrition rights/freshness register and ZIP ingestion prototype | Source rights and permitted data access |
| 4 | Connect actual restaurant locations | One complete verified nearby-meal flow and coverage report | Licensed branch source and Day 3 ZIP foundation |
| 5 | Add accounts and synced saved meals | Local/staging signup, login, save, restore, and guest migration | Provider selection and privacy/data decisions |
| 6 | Harden accounts and prepare the iOS contract | Deletion/export, isolation tests, incident/backup draft, documented mobile API | Day 5 identity foundation |
| 7 | Verify the whole experience and plan release | QA evidence, outstanding defects, release decision, next sprint | Integrated work and any external reviews |

## Day 1 — Define what FoodieGoals promises

**Time blocks:** 45 minutes owner decisions; 90 minutes legal/data review; 90 minutes specification and data map; 45 minutes priorities and repository checkpoint.

- [ ] Confirm general food discovery versus coaching, age audience, paid features/ads, and national availability expectations.
- [ ] Review the [Ohio and Boardman findings](LEGAL_REVIEW.md). Prepare a screenshot/copy packet for counsel and a local zoning inquiry. Owner handles or explicitly authorizes outreach; do not assume replies arrive today.
- [ ] Inventory every collected field and destination: ZIP, nutrition inputs, account identifier, saved meals, logs, email provider, and externally loaded images. Assign purpose, retention proposal, deletion behavior, and access owner.
- [ ] Create a claims register: exact phrase, evidence, permitted context, and unresolved issue. Include defaults, “healthy,” “nearby,” verified nutrition, and weight-related objectives.
- [ ] Prioritize the unresolved photo license, historical nutrition, local permits, nationwide legal review, and privacy work.

**Done when:** a written decision log distinguishes confirmed decisions from assumptions; legal questions have owners; the development scope and launch blockers are understandable without this conversation. An unanswered legal question remains open.

**If blocked:** continue source inventories and local technical specifications, keeping affected public-release features gated. **Checkpoint:** commit scope, decision log, and data map.

## Day 2 — Typography, palette, and explicit calorie limits

**Time blocks:** 60 minutes two visual directions; 30 minutes owner review; 120 minutes selected styles and min/max implementation; 60 minutes validation and browser checks; 30 minutes checkpoint.

- [ ] Present two restrained font/palette directions on the actual search and meal-result layouts, including mobile. Document font licenses and loading/privacy choices. Owner selects the direction; if unavailable, finish neutral wireframes and the input behavior first.
- [ ] Replace target/tolerance calorie entry with separately labeled **Minimum calories** and **Maximum calories**, including units, help text, and accessible errors.
- [ ] Use inclusive boundaries: a 500–700 request admits both 500 and 700. Recommended initial contract: require both non-negative whole-number bounds, require minimum <= maximum, and allow equality. Confirm any upper guardrail as a technical limit, not medical guidance.
- [ ] Validate identically on the server. Reject malformed or non-finite values and reversed bounds. Retain the existing optional nutrient controls unless separately requested.
- [ ] For any persisted/legacy target-tolerance inputs, migrate lower = max(0, target - tolerance), upper = target + tolerance. Define a transition contract for old requests; do not silently reinterpret them.
- [ ] Update matching explanations, near-match labels, and sorting. Proposed deterministic calorie proximity sort uses distance to the interval midpoint; other sort options retain their stated meanings.

**Done when:** 500/700 boundary cases, equality, blank fields, zero, reversed limits, invalid values, legacy translation, and nutrient combinations have meaningful tests; browser navigation and error recovery work; the approved design works at phone/desktop widths, zoom, and keyboard input.

**If blocked:** finish the min/max contract and tests while visual approval is pending. **Checkpoint:** commit behavior and approved visual changes separately when useful.

## Day 3 — Nutrition accuracy and national ZIP recognition

**Time blocks:** 75 minutes nutrition review; 60 minutes provider/license comparison; 120 minutes reference import and lookup; 45 minutes coverage checks and checkpoint.

- [ ] For every component, record source URL, serving definition, source publication date if available, retrieval date, permitted reuse, and freshness status. Refresh Chipotle from a current permitted source or exclude historical entries from current results. Preserve unknown nutrients as unknown.
- [ ] Compare ZIP sources on active-code completeness, leading-zero preservation, unique/PO-box/military codes, territories, centroid quality, update frequency, caching/display rights, and price. Obtain owner approval before paid access.
- [ ] Store ZIPs as five-character strings. Distinguish invalid format, unknown/retired ZIP, recognized ZIP without usable coordinates, source outage, and valid searchable geography.
- [ ] Implement a replaceable lookup provider with timeouts, controlled caching, a versioned import, and a rollback path. Keep ZIP validation separate from geographic coordinates.
- [ ] Produce an audit against a dated, licensed national postal reference. The final target is 100% recognition of active codes in the agreed scope, not just ten successful samples.

**Done when:** one permitted reference source and its limitations are documented; leading-zero and unusual-code fixtures pass; importing malformed data cannot replace the working dataset; coverage has a measured numerator, denominator, date, and exceptions.

**Scope rule:** target all 50 states and DC, and explicitly resolve territories and military postal codes with the owner. A recognized non-geographic ZIP may require a nearby city or another location; never invent coordinates. ZIP+4 acceptance is a separate choice.

**Source caution:** [Census ZCTAs](https://www.census.gov/programs-surveys/geography/guidance/geo-areas/zctas.html) do not represent all valid ZIP codes. [USPS City State Product](https://postalpro.usps.com/address-quality/city-state-product) documents postal-reference coverage and monthly updates, but has licensing/technical restrictions; it is not assumed to be a freely exportable web-app dataset.

**If blocked:** build the provider contract and clearly identified test fixtures; nationwide completion stays open. **Checkpoint:** commit permitted data/import tooling and the audit, excluding restricted datasets and credentials.

## Day 4 — Verified nearby restaurants

**Time blocks:** 60 minutes branch-source verification; 120 minutes integration; 75 minutes geographic/availability checks; 45 minutes coverage report and checkpoint.

- [ ] Select a permitted official or licensed branch directory. Record location ID, chain, address, coordinates, source, last verification, and operational status where available.
- [ ] Connect ZIP geography to real branches, then to eligible chain meals. A chain's national menu does not prove a branch sells a specific item today.
- [ ] Define radius behavior and label straight-line distance from the ZIP center accurately. Do not label it driving distance or distance from the user's exact location.
- [ ] Distinguish “no verified branches,” “no meals meet your filters,” “location needs clarification,” and “provider unavailable.” Offer useful edits without turning unverified entries into strict matches.
- [ ] Test urban, rural, leading-zero, Alaska, Hawaii, DC, and special postal cases against validated reference fixtures. Test outside-radius branches, stale records, duplicate chains, and provider outages.

**Done when:** one end-to-end lookup uses a verified ZIP, branch, and appropriately sourced meal; unverified locations cannot appear as verified nearby matches; a coverage report states chains/regions supported and missing data.

**If blocked:** complete integration against explicitly labeled fixtures; do not claim real nationwide branch coverage. **Checkpoint:** commit the verified vertical slice and coverage report. Expansion to every supported chain continues after this week if needed.

## Day 5 — Accounts and meals saved across devices

**Time blocks:** 45 minutes provider decision; 120 minutes identity/session integration; 90 minutes saved-meal sync and migration; 45 minutes tests/checkpoint.

- [ ] Compare managed authentication options for web and native iOS, pricing, deletion/export, email delivery, security, and portability. Start with a first-party email flow if appropriate; social login is optional.
- [ ] Implement signup/sign-in, email verification or equivalent verified identity, sign-out, expired-session recovery, and accessible loading/errors using established libraries/provider flows.
- [ ] Associate saved meals with the authenticated server-side user identity. Never trust a browser-supplied user ID as authorization.
- [ ] Add save/list/remove endpoints with duplicate protection. Save a stable meal reference plus an intentional snapshot/version policy, so menu updates and removed meals have understandable behavior.
- [ ] Offer to import this browser's existing `foodie-favorites` after sign-in. Ask before associating guest history with an account, deduplicate, and preserve local data until success. Keep guest use available.
- [ ] Show sync failures and allow retry; do not display success before the server confirms it.

**Done when:** a meal saved on one browser appears after signing into another; sign-out removes private account views; duplicate saves are safe; guest migration handles interruption; user A cannot read or alter user B's saved meals.

**If blocked:** implement schema and endpoint contracts locally with explicit test identity; real accounts remain unavailable until the provider/privacy gate is satisfied. **Checkpoint:** commit identity and saved-meal work without secrets or real user data.

## Day 6 — Account lifecycle, security, and iOS foundation

**Time blocks:** 90 minutes export/deletion; 90 minutes security checks; 60 minutes mobile API contract; 60 minutes recovery documentation and checkpoint.

- [ ] Implement account export and deletion with identity re-verification where appropriate. Cover the app database, authentication provider, active sessions, email systems, and any processor copies; document lawful retention and backup expiry honestly.
- [ ] Test expired sessions, cross-user access, repeated deletion, interrupted requests, invalid input, rate limits, CSRF where applicable, and accidental sensitive logging. Enforce request-size limits before reading an unbounded body.
- [ ] Use secure web cookies/session handling and least-privilege server credentials. Configure secrets outside the repository. Document dependency maintenance and a vulnerability-report route.
- [ ] Define a versioned API and identity identifiers suitable for web and iOS. Plan native OAuth with PKCE and secure device storage where appropriate; never put server credentials in an app binary.
- [ ] Write backup/restore and incident-response procedures, with applicable notification questions assigned for legal review.
- [ ] Record future Apple account-deletion, login, and privacy requirements from the [legal review](LEGAL_REVIEW.md). This prepares a port; it does not build an iOS application or integrate HealthKit.

**Done when:** deletion/export have observable tested outcomes; server authorization tests pass; a restore rehearsal succeeds in an isolated environment; the mobile contract and remaining security findings are documented.

**If blocked:** keep public account launch gated, finish isolation tests and the contract. **Checkpoint:** commit lifecycle/security improvements and evidence.

## Day 7 — Integrated quality and release decision

**Time blocks:** 90 minutes automated verification; 90 minutes real browser/accessibility checks; 60 minutes highest-priority fixes; 60 minutes release report and next-week planning.

- [ ] Run matching/API tests, type checks, and production build after integrated logic changes. Exercise sign-in, min/max search, location lookup, save, second-device restore, export, and deletion.
- [ ] Test mobile Safari on a real iPhone if available and desktop browsers; record any unavailable environment as untested. Test keyboard-only operation and a screen reader, zoom, focus restoration, contrast, and readable errors.
- [ ] Check source freshness, rights evidence, national ZIP audit, branch coverage, provider outages, stale data, empty states, and unknown nutrients.
- [ ] Review actual network requests/logs against the privacy map and final disclosures. Confirm legal/local questions and age policy are resolved for the intended release.
- [ ] Record defects by impact, owners, and acceptance evidence. Fix launch blockers before optional polish.
- [ ] Produce a go/no-go report and prioritized next sprint. Public deployment remains a separate owner decision even if all checks pass.

**Done when:** every requirement is marked passed, failed, blocked, or untested with evidence; no incomplete national coverage or legal review is described as complete; GitHub contains the tested work and an honest release status.

**Checkpoint:** final reviewed commit and push; record the commit in the session handoff.

## Beyond the first week: finish the website, then port it

| Phase | Work remaining until complete | Exit criteria |
| --- | --- | --- |
| A — Complete nationwide data | Expand the Day 3–4 prototype to the full licensed ZIP reference and supported chain footprint; automate permitted updates, stale-data handling, and coverage audits. | Every active ZIP in the agreed scope is recognized; exceptional geography is explained; every nearby claim has branch evidence; supported chains and freshness limits are published. No promise that every ZIP contains a restaurant. |
| B — Production accounts and design | Finish account/provider configuration, abuse controls, deletion across processors, recovery, migration, and all redesigned screens. | Cross-device behavior, access isolation, account lifecycle, accessibility, and mobile-browser acceptance checks pass. |
| C — Public website readiness | Resolve counsel/local/rights/privacy items; verify production environment, HTTPS, monitoring, backups, support process, costs, and rollback. Review domain/name rights. | Owner receives a concrete release checklist with no unresolved blockers and explicitly authorizes launch/domain actions. |
| D — Native iOS release | Choose native architecture, build screens against the shared API, add native identity/session handling, test offline/sync behavior and account deletion, prepare App Store disclosures and review submission. | Real-device QA and applicable Apple requirements pass; owner authorizes submission. This is a separate project phase, not a completed result of this week. |

Estimate each phase after Day 7 using actual provider coverage, remaining defects, and external review status. Preserve incomplete work rather than compressing it to fit a date.

## Master acceptance checklist

- [ ] Legal/product scope, age audience, business use, source rights, and applicable privacy duties resolved for the release.
- [ ] Separate calorie minimum/maximum work throughout UI, API, matching, explanations, and migration.
- [ ] Owner-approved fonts/palette are consistent and accessible on every screen.
- [ ] Complete active ZIP recognition demonstrated against a dated reference; exceptions and geographic limitations are clear.
- [ ] Nearby results use verified branches and supported menus; no invented distances or stock claims.
- [ ] Users can securely sign in, save/remove meals, and restore them across devices.
- [ ] Guest favorites migrate safely; menu changes do not silently corrupt saved records.
- [ ] Export, deletion, recovery, privacy disclosures, security tests, and backup restoration are verified.
- [ ] Shared API and identity model are documented for iOS; native work remains separately tracked.
- [ ] Integrated tests and real-device/accessibility evidence support launch claims.
- [ ] Public release, domain purchase, and any paid services receive the owner's authorization.

## Routine for every future working session

Start by reading this planner, the decision log, and Git status. Pick the highest-priority unblocked acceptance criterion. End with checks appropriate to changed behavior, review staged files for secrets/generated data, commit meaningful milestones, and push to the existing private [FoodieGoals repository](https://github.com/MattiaBallabio/FoodieGoals). Record completed work, remaining blockers, and the next action. Do not add unattended reminders or implement later features merely because they appear in this planner.
