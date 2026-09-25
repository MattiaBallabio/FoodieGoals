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
  calories: { min: 500, max: 700 },
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
for (const n of nutrients.filter((n) => n !== 'calories'))
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

test('explicit calorie bounds require finite whole numbers and reject ambiguous formats', () => {
  for (const calories of [undefined, null, [], {}, { min: 500 }, { max: 700 }, { min: 701, max: 700 },
    { min: 500, max: 700, value: 600 }, { min: 500, max: 700, mode: 'range' },
    { min: 500, max: 700, tolerance: 100 }])
    assert.throws(() => validateFilters({ ...base(), calories }));
  for (const bound of ['min', 'max'])
    for (const value of ['', null, '500', false, -1, 1.5, NaN, Infinity, -Infinity, 10001])
      assert.throws(() => validateFilters({ ...base(), calories: { min: 0, max: 10000, [bound]: value } }));
  assert.deepEqual(validateFilters({ ...base(), calories: { min: 0, max: 10000 } }).calories, { min: 0, max: 10000 });
});
test('equal calorie bounds match exactly, including zero; missing nutrition stays unknown', () => {
  for (const value of [0, 600, 10000]) {
    const filters = validateFilters({ ...base(), calories: { min: value, max: value } });
    assert.equal(evaluate({ ...meal, totals: { ...meal.totals, calories: value } }, filters).misses.length, 0);
    assert.equal(evaluate({ ...meal, totals: { ...meal.totals, calories: value + 1 } }, filters).misses.length, 1);
    assert.equal(evaluate({ ...meal, totals: { ...meal.totals, calories: null } }, filters).misses[0], 'calories: nutrition unknown');
  }
  const f = validateFilters(base());
  assert.match(evaluate({ ...meal, totals: { ...meal.totals, calories: 499 } }, f).misses[0], /1cal below 500cal minimum/);
  assert.match(evaluate({ ...meal, totals: { ...meal.totals, calories: 701 } }, f).misses[0], /1cal above 700cal maximum/);
});
test('legacy calorie targets normalize without changing accepted matching bounds', () => {
  for (const [value, tolerance, min, max] of [[600, 100, 500, 700], [50, 100, 0, 150], [600.5, 10.25, 590.25, 610.75], [10000, 10000, 0, 20000]]) {
    const filters = validateFilters({ ...base(), calories: { value, mode: 'range', tolerance } });
    assert.deepEqual(filters.calories, { min, max });
    for (const calories of [min, max])
      assert.equal(evaluate({ ...meal, totals: { ...meal.totals, calories } }, filters).misses.length, 0);
  }
  assert.throws(() => validateFilters({ ...base(), calories: { value: 600, mode: 'min', tolerance: 100 } }));
});
test('calorie ranking uses the bounds midpoint, with deterministic ties and protein precedence', () => {
  const f = validateFilters({ ...base(), calories: { min: 100, max: 900 } });
  const list = [['lower', 450, 20], ['upper', 550, 90], ['center', 500, 10], ['far', 800, 30]]
    .map(([id, calories, protein]) => ({ ...meal, id, totals: { ...meal.totals, calories, protein } }));
  assert.deepEqual(rank(list, f).map((m) => m.id), ['center', 'lower', 'upper', 'far']);
  assert.deepEqual(rank(list, { ...f, sort: 'protein' }).map((m) => m.id), ['upper', 'far', 'lower', 'center']);
  assert.deepEqual(list.map((m) => m.id), ['lower', 'upper', 'center', 'far']);
  const legacy = validateFilters({ ...base(), calories: { value: 50, tolerance: 100, mode: 'range' } });
  const clipped = [50, 75].map((calories) => ({ ...meal, id: String(calories), totals: { ...meal.totals, calories } }));
  assert.equal(rank(clipped, legacy)[0].id, '75');
});
