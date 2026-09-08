import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validateFilters,
  totalNutrition,
  evaluate,
  matchMeals,
  rank,
  nutrients,
} from '../lib/matching.ts';
import { DemoLocationProvider, milesFromZipCenter } from '../lib/location.ts';
import { validateData, toSQL } from '../scripts/import.mjs';
const base = () => ({
  calories: { value: 600, mode: 'range', tolerance: 100 },
  categories: [],
  zip: '02108',
  radius: 10,
  sort: 'calories',
});
const meal = {
  id: 'a',
  restaurantId: 'r',
  categories: ['Chicken'],
  totals: { calories: 600, protein: 40, carbs: 50, fiber: 7, fat: 20 },
};
test('calories required, inclusive range boundaries', () => {
  for (const value of [500, 600, 700])
    assert.equal(
      evaluate(
        { ...meal, totals: { ...meal.totals, calories: value } },
        validateFilters(base()),
      ).misses.length,
      0,
    );
  for (const value of [499, 701])
    assert.equal(
      evaluate(
        { ...meal, totals: { ...meal.totals, calories: value } },
        validateFilters(base()),
      ).misses.length,
      1,
    );
  assert.throws(() => validateFilters({ ...base(), calories: { value: '' } }));
});
for (const n of nutrients.slice(1))
  for (const mode of ['min', 'max', 'range'])
    test(`${n} ${mode}, zero vs blank and unknown`, () => {
      const filters = validateFilters({
        ...base(),
        [n]: { value: meal.totals[n], mode, tolerance: 0 },
      });
      assert.equal(evaluate(meal, filters).misses.length, 0);
      const failing = mode === 'max' ? meal.totals[n] + 1 : meal.totals[n] - 1;
      assert.equal(
        evaluate({ ...meal, totals: { ...meal.totals, [n]: failing } }, filters)
          .misses.length,
        1,
      );
      assert.equal(
        evaluate({ ...meal, totals: { ...meal.totals, [n]: null } }, filters)
          .misses.length,
        1,
      );
      assert.equal(
        validateFilters({ ...base(), [n]: { value: '' } })[n],
        undefined,
      );
      assert.equal(
        validateFilters({ ...base(), [n]: { value: 0, mode, tolerance: 0 } })[n]
          ?.value,
        0,
      );
    });
test('invalid input never coerced', () => {
  for (const value of [-1, NaN, Infinity, '600', 10001, 0])
    assert.throws(() =>
      validateFilters({
        ...base(),
        calories: { value, mode: 'range', tolerance: 100 },
      }),
    );
  for (const zip of ['2108', 'abcde', 2108])
    assert.throws(() => validateFilters({ ...base(), zip }));
  for (const tolerance of [-1, null, '', Infinity])
    assert.throws(() =>
      validateFilters({
        ...base(),
        calories: { value: 600, mode: 'range', tolerance },
      }),
    );
  assert.throws(() => validateFilters({ ...base(), radius: 3 }));
  assert.throws(() => validateFilters({ ...base(), categories: ['Fake'] }));
  assert.throws(() =>
    validateFilters({ ...base(), protein: { value: 2, mode: 'foo' } }),
  );
});
test('totals multiply exact quantities and propagate unknown', () => {
  assert.deepEqual(
    totalNutrition([
      {
        quantity: 2,
        item: { calories: 250, protein: 27, carbs: 11, fiber: null, fat: 11 },
      },
    ]),
    { calories: 500, protein: 54, carbs: 22, fiber: null, fat: 22 },
  );
});
test('strict matches require all constraints and verified location within radius', () => {
  const filters = validateFilters(base());
  const loc = { restaurantId: 'r', verified: true, distance: 10 };
  assert.equal(matchMeals([meal], filters, [loc]).strict.length, 1);
  assert.equal(
    matchMeals([meal], filters, [{ ...loc, distance: 10.01 }]).strict.length,
    0,
  );
  assert.equal(matchMeals([meal], filters, []).demo.length, 1);
  assert.equal(
    matchMeals([meal], filters, [{ ...loc, verified: false }]).strict.length,
    0,
  );
  const misses = matchMeals(
    [meal],
    { ...filters, protein: { value: 50, mode: 'min', tolerance: 0 } },
    [loc],
  );
  assert.equal(misses.strict.length, 0);
  assert.match(misses.near[0].misses[0], /10g below/);
});
test('multiple categories are OR, nutrition is AND', () => {
  const filters = validateFilters({
    ...base(),
    categories: ['Asian', 'Chicken'],
  });
  assert.equal(matchMeals([meal], filters).demo.length, 1);
  assert.equal(
    matchMeals([meal], { ...filters, categories: ['Asian'] }).demo.length,
    0,
  );
});
test('stable ranking and unknown protein last', () => {
  const f = validateFilters(base());
  const list = [{ ...meal, id: 'b' }, meal];
  assert.deepEqual(
    rank(list, f).map((m) => m.id),
    ['a', 'b'],
  );
  assert.equal(
    rank(
      [
        { ...meal, id: 'unknown', totals: { ...meal.totals, protein: null } },
        meal,
      ],
      { ...f, sort: 'protein' },
    )[0].id,
    'a',
  );
});
test('leading-zero ZIP preserved, unsupported coverage honest', async () => {
  assert.equal(validateFilters(base()).zip, '02108');
  assert.equal(
    (await new DemoLocationProvider().lookup('02108')).supported,
    true,
  );
  assert.equal(
    (await new DemoLocationProvider().lookup('90210')).supported,
    false,
  );
  assert.equal(
    milesFromZipCenter(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 0 },
    ),
    0,
  );
});
const data = JSON.parse(readFileSync('data/verified.json', 'utf8'));
test('30 sourced meals; no cross-restaurant components; totals fixture', () => {
  validateData(data);
  assert.equal(data.meals.length, 30);
  const m = data.meals.find((m: any) => m.id === 'c-chicken-rice');
  const total = totalNutrition(
    m.components.map((c: any) => ({
      ...c,
      item: data.items.find((i: any) => i.id === c.itemId),
    })),
  );
  assert.deepEqual(total, {
    calories: 565,
    protein: 45,
    carbs: 67,
    fiber: 11,
    fat: 14.5,
  });
});
test('import rejects duplicates, invalid nutrients, and mixed restaurants', () => {
  const copy = () => structuredClone(data);
  let d = copy();
  d.items.push(d.items[0]);
  assert.throws(() => validateData(d));
  d = copy();
  d.items[0].fiber = 'unknown';
  assert.throws(() => validateData(d));
  d = copy();
  d.meals[0].components[0].itemId = 'f-nuggets';
  assert.throws(() => validateData(d));
  assert.match(toSQL(data), /ON CONFLICT/);
});
