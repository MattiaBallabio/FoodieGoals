import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { register } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

register('./support/assignment4-resolve.mjs', import.meta.url);
const { env } = await import('cloudflare:workers');
const { POST } = await import('../app/api/search/route.ts');
const { getMeals } = await import('../lib/database.ts');

const migration = readFileSync(
  new URL('../drizzle/0000_curved_tag.sql', import.meta.url),
  'utf8',
);
const restaurantId = 'fixture-kitchen';
const restaurantName = 'Fixture Kitchen';
const filters = {
  calories: { min: 500, max: 700 },
  categories: ['Chicken'],
  zip: '02108',
  radius: 10,
  sort: 'calories',
};

function createCatalog(t) {
  const sqlite = new DatabaseSync(':memory:');
  t.after(() => {
    delete env.DB;
    sqlite.close();
  });
  t.mock.method(globalThis, 'fetch', () => {
    assert.fail('Component tests must not issue network requests');
  });
  sqlite.exec(migration);
  sqlite
    .prepare('INSERT INTO restaurants (id, name) VALUES (?, ?)')
    .run(restaurantId, restaurantName);

  // Supply the D1 result shape while SQLite executes the repository's real SQL.
  const prepare = t.mock.fn((sql) => ({
    all: async () => ({ results: sqlite.prepare(sql).all() }),
  }));
  env.DB = { prepare };
  return { sqlite, prepare };
}

function addMeal(sqlite, id, parts, categories = ['Chicken']) {
  const record = { id, restaurantId, categories, verification: 'official' };
  sqlite
    .prepare('INSERT INTO meals (id, restaurant_id, record) VALUES (?, ?, ?)')
    .run(id, restaurantId, JSON.stringify(record));

  const insertItem = sqlite.prepare(
    'INSERT INTO menu_items (id, restaurant_id, record) VALUES (?, ?, ?)',
  );
  const insertComponent = sqlite.prepare(
    'INSERT INTO meal_components (id, meal_id, item_id, quantity) VALUES (?, ?, ?, ?)',
  );
  for (const [index, { quantity, nutrients }] of parts.entries()) {
    const itemId = `${id}-item-${index + 1}`;
    const item = {
      id: itemId,
      restaurantId,
      verification: 'official',
      protein: 30,
      carbs: 40,
      fiber: 4,
      fat: 10,
      ...nutrients,
    };
    insertItem.run(itemId, restaurantId, JSON.stringify(item));
    insertComponent.run(`${itemId}-part`, id, itemId, quantity);
  }
}

function search(criteria) {
  return POST(
    new Request('http://localhost/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...filters, ...criteria }),
    }),
  );
}

test('C01 search returns ranked demo meals for a supported ZIP', async (t) => {
  const { sqlite, prepare } = createCatalog(t);
  addMeal(sqlite, 'edge', [{ quantity: 1, nutrients: { calories: 500 } }]);
  addMeal(sqlite, 'center', [{ quantity: 1, nutrients: { calories: 600 } }]);
  addMeal(sqlite, 'low', [{ quantity: 1, nutrients: { calories: 490 } }]);
  addMeal(
    sqlite,
    'burger',
    [{ quantity: 1, nutrients: { calories: 600 } }],
    ['Burgers'],
  );

  const response = await search({});
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.coverage.supported, true);
  assert.equal(result.coverage.city, 'Boston, MA');
  assert.deepEqual(result.strict, []);
  assert.deepEqual(
    result.demo.map(({ id }) => id),
    ['center', 'edge'],
  );
  assert.deepEqual(
    result.near.map(({ id }) => id),
    ['low'],
  );
  assert.deepEqual(result.near[0].misses, [
    'calories: 490cal, 10cal below 500cal minimum',
    'Location: no verified branch within your radius',
  ]);
  assert.ok(prepare.mock.callCount() > 0);
});

test('C02 search rejects invalid criteria before coverage or catalog reads', async (t) => {
  const { prepare } = createCatalog(t);

  const response = await search({
    calories: { min: 701, max: 700 },
    zip: '90210',
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Minimum calories must be less than or equal to maximum calories.',
  });
  assert.equal(prepare.mock.callCount(), 0);
});

test('C03 search returns empty groups for an unsupported ZIP without reading the catalog', async (t) => {
  const { prepare } = createCatalog(t);

  const response = await search({ zip: '90210' });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(result, {
    coverage: {
      supported: false,
      zipCenter: null,
      locations: [],
      message:
        'No location coverage for this ZIP yet. Try demo ZIP 44512, 10001, or 02108. We have not searched for nearby restaurants.',
    },
    strict: [],
    demo: [],
    near: [],
  });
  assert.equal(prepare.mock.callCount(), 0);
});

test('C04 catalog joins a restaurant and two items and calculates meal totals', async (t) => {
  const { sqlite } = createCatalog(t);
  addMeal(sqlite, 'combo', [
    { quantity: 2, nutrients: { calories: 200 } },
    {
      quantity: 0.5,
      nutrients: { calories: 80, protein: 10, carbs: 20, fiber: 2, fat: 4 },
    },
  ]);

  const meals = await getMeals();

  assert.deepEqual(
    meals.map(({ id }) => id),
    ['combo'],
  );
  const [meal] = meals;
  assert.equal(meal.restaurant, restaurantName);
  assert.deepEqual(
    meal.components.map(({ item, quantity }) => [item.id, quantity]).sort(),
    [
      ['combo-item-1', 2],
      ['combo-item-2', 0.5],
    ],
  );
  assert.deepEqual(meal.totals, {
    calories: 440,
    protein: 65,
    carbs: 90,
    fiber: 9,
    fat: 22,
  });
});

test('C05 catalog preserves unknown fiber and measured zero after reading JSON records', async (t) => {
  const { sqlite } = createCatalog(t);
  addMeal(sqlite, 'unknown-fiber', [
    { quantity: 1, nutrients: { calories: 200, fiber: null, fat: 0 } },
    { quantity: 1, nutrients: { calories: 100, fiber: 2, fat: 0 } },
  ]);

  const meals = await getMeals();

  assert.deepEqual(
    meals.map(({ id, totals }) => ({ id, totals })),
    [
      {
        id: 'unknown-fiber',
        totals: { calories: 300, protein: 60, carbs: 80, fiber: null, fat: 0 },
      },
    ],
  );
});

test('C06 catalog excludes a meal when a linked item becomes unofficial', async (t) => {
  const { sqlite } = createCatalog(t);
  addMeal(sqlite, 'changed', [{ quantity: 1, nutrients: { calories: 500 } }]);
  addMeal(sqlite, 'valid', [{ quantity: 1, nutrients: { calories: 600 } }]);
  assert.deepEqual((await getMeals()).map(({ id }) => id).sort(), [
    'changed',
    'valid',
  ]);

  sqlite
    .prepare(
      "UPDATE menu_items SET record = json_set(record, '$.verification', ?) WHERE id = ?",
    )
    .run('demo', 'changed-item-1');

  assert.deepEqual(
    (await getMeals()).map(({ id }) => id),
    ['valid'],
  );
});
