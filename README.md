# FoodieGoals

FoodieGoals helps people compare restaurant meals using calorie and nutrient goals. The app brings nutrition data from several chains into one search and explains why each result fits or misses the selected goals. [Try the demo](https://foodiegoals.mattiaballabio8-cloudfare.workers.dev/)

## Current features

- Filter by calorie range, protein, carbs, fat, fiber, and meal category.
- Compare ranked meals and view the included menu items, nutrition totals, and sources.
- Save favorites in your browser.
- View mapped restaurant branches and directions in the demo areas.

The catalog contains 30 meal combinations from Panda Express, Chick-fil-A, and Chipotle. Chipotle’s July 2022 nutrition data is marked as historical. Meal search supports ZIP codes `44512`, `10001`, and `02108`. Meal availability at mapped branches is unverified. [Catalog sources](app/data/verified.json) · [Map details](docs/RESTAURANT_MAP.md)

## Potential next steps

- Add a browser-local tracker for meals ordered, portions, and daily calorie totals.
- Explore exercise logging with partial or full completion and estimated calories burned.
- Expand ZIP coverage, refresh older nutrition records, and apply the proposed 10% cutoff for near matches.

## Development

FoodieGoals uses React and TypeScript. Server routes read the meal catalog from Cloudflare D1. The developer guide covers local setup, catalog imports, and test commands. [Developer guide](docs/DEVELOPER_GUIDE.md) · [Development planner](docs/DEVELOPMENT_PLANNER.md) · [Launch checklist](docs/LEGAL_REVIEW.md)
