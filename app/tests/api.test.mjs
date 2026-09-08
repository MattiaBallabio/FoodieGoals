import test from 'node:test';
import assert from 'node:assert/strict';
const origin = process.env.FOODIE_URL || 'http://localhost:3000';
const base = {
  calories: { value: 600, mode: 'range', tolerance: 100 },
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
