# FoodieGoals project instructions

- Product name: FoodieGoals. The local folder remains `Foodie`; do not rename it without a concrete need because saved project paths depend on it.
- Keep development local unless the user explicitly authorizes deployment. Mentioning foodiegoals.com does not authorize buying a domain or services.
- GitHub home: https://github.com/MattiaBallabio/FoodieGoals (private).
- The user authorizes ongoing commits and pushes of this project's work. Make clear commits at tested milestones and push at the end of a work session. Prefer meaningful checkpoints over every file save. Do not create a scheduled automation for this; perform it as part of active work.
- Before pushing, check staged files, run checks appropriate to the changes, and ensure credentials, local databases, dependencies, and generated build output are excluded. Never force-push or overwrite unrelated user work.
- For app logic changes: run matching tests, API tests against the local server, TypeScript, and the build. For UI flow changes, use the browser tools and `app/tests/browser-flow.mjs`; wait for `main[data-ready="true"]` after navigation so clicks do not race hydration.
- Retain the `foodie-favorites` local-storage key for compatibility with existing saved meals. Internal database IDs and the local Worker name also remain stable to preserve data.
- Keep location demo and historical Chipotle data clearly labeled. Unknown nutrient values are null. Never claim nearby branches or stock without a verified source.
- See README.md and TESTING.md for start/import/test commands and remaining product limitations.
- Future priorities and acceptance criteria are in docs/DEVELOPMENT_PLANNER.md; preliminary legal research is in docs/LEGAL_REVIEW.md. These are planning documents, not automatic authorization to implement every listed feature or evidence of legal clearance. Resume the appropriate day when the user requests development.
