import test from 'node:test';
import assert from 'node:assert/strict';
const origin = process.env.FOODIE_URL || 'http://localhost:3000';
test('44512 demo returns nutrition recommendations and its sourced map center', async () => {
  const [status, data] = await search({ ...base, zip: '44512' });
  assert.equal(status, 200);
  assert.equal(data.coverage.supported, true);
  assert.equal(data.coverage.city, 'Youngstown, OH');
  assert.ok(data.demo.length > 0);
  assert.equal(data.strict.length, 0);
  const map = await (await fetch(origin + '/api/map?zip=44512&radius=10&chains=')).json();
  assert.equal(map.status, 'ok');
  assert.equal(map.center.latitude, 41.0252);
  assert.equal(map.center.longitude, -80.6687);
});
test('map API validates filters and returns a ZIP center without requesting unrelated chains', async () => {
  const bad = await fetch(origin + '/api/map?zip=02108&radius=900&chains=panda');
  assert.equal(bad.status, 400);
  const result = await fetch(origin + '/api/map?zip=02108&radius=5&chains=');
  assert.equal(result.status, 200);
  const map = await result.json();
  assert.equal(map.status, 'ok');
  assert.equal(map.center.latitude, 42.3576);
  assert.deepEqual(map.branches, []);
});
const base = {
  calories: { min: 500, max: 700 },
  categories: [],
  zip: '02108',
  radius: 10,
  sort: 'calories',
};
async function search(body) {
  const r = await fetch(origin + '/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return [r.status, await r.json()];
}
test('persistent catalog returns thirty meals and exact totals', async () => {
  const r = await fetch(origin + '/api/meals');
  assert.equal(r.status, 200);
  const data = await r.json();
  assert.equal(data.length, 30);
  assert.equal(
    data.find((m) => m.id === 'f-double-nuggets').totals.calories,
    500,
  );
  assert.equal(
    data.find((m) => m.id === 'f-double-nuggets').totals.fiber,
    null,
  );
});
test('calories-only end to end with real DB', async () => {
  const [status, data] = await search(base);
  assert.equal(status, 200);
  assert.equal(data.coverage.city, 'Boston, MA');
  assert.ok(data.demo.length > 0);
  assert.equal(data.strict.length, 0);
  for (const m of data.demo)
    assert.ok(m.totals.calories >= 500 && m.totals.calories <= 700);
});
test('all optional constraints, unknown exclusion, multiple categories', async () => {
  const [status, data] = await search({
    ...base,
    categories: ['Asian', 'Mexican'],
    protein: { value: 30, mode: 'min' },
    carbs: { value: 80, mode: 'max' },
    fiber: { value: 5, mode: 'min' },
    fat: { value: 25, mode: 'max' },
  });
  assert.equal(status, 200);
  assert.ok(data.demo.length > 0);
  for (const m of data.demo) {
    assert.ok(
      m.totals.protein >= 30 &&
        m.totals.carbs <= 80 &&
        m.totals.fiber >= 5 &&
        m.totals.fat <= 25,
    );
    assert.ok(
      m.categories.includes('Asian') || m.categories.includes('Mexican'),
    );
  }
});
test('unsupported ZIP, invalid ZIP and explicit zero', async () => {
  const [ok, missing] = await search({ ...base, zip: '90210' });
  assert.equal(ok, 200);
  assert.equal(missing.coverage.supported, false);
  assert.equal(missing.demo.length, 0);
  assert.equal((await search({ ...base, zip: '2108' }))[0], 400);
  const [, zero] = await search({
    ...base,
    protein: { value: 0, mode: 'max' },
  });
  assert.equal(zero.demo.length, 0);
  assert.ok(zero.near.length > 0);
});

test('explicit bounds preserve inclusive exact calorie matches and allow zero', async () => {
  const [status, exact] = await search({ ...base, calories: { min: 500, max: 500 } });
  assert.equal(status, 200);
  assert.ok(exact.demo.some((m) => m.id === 'f-double-nuggets'));
  assert.ok(exact.demo.every((m) => m.totals.calories === 500));
  const [zeroStatus, zero] = await search({ ...base, calories: { min: 0, max: 0 } });
  assert.equal(zeroStatus, 200);
  assert.equal(zero.demo.length, 0);
  assert.ok(zero.near.length > 0);
});
test('API rejects missing, reversed, nonnumeric, fractional and mixed calorie bounds', async () => {
  for (const calories of [undefined, null, {}, { min: 500 }, { max: 700 },
    { min: 701, max: 700 }, { min: '', max: 700 }, { min: null, max: 700 },
    { min: '500', max: 700 }, { min: 500.5, max: 700 }, { min: -1, max: 700 },
    { min: 500, max: 10001 }, { min: 500, max: 700, tolerance: 100 }]) {
    const [status, data] = await search({ ...base, calories });
    assert.equal(status, 400, JSON.stringify(calories));
    assert.equal(typeof data.error, 'string');
  }
});
test('legacy requests keep equivalent results to explicit default calorie bounds', async () => {
  const [boundsStatus, bounds] = await search(base);
  const [legacyStatus, legacy] = await search({ ...base, calories: { value: 600, mode: 'range', tolerance: 100 } });
  assert.equal(boundsStatus, 200);
  assert.equal(legacyStatus, 200);
  for (const group of ['strict', 'demo', 'near'])
    assert.deepEqual(legacy[group].map((m) => m.id), bounds[group].map((m) => m.id));
});
