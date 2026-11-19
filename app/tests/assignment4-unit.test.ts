import assert from 'node:assert/strict';
import test from 'node:test';
import {
  evaluate,
  rank,
  totalNutrition,
  validateFilters,
  type Filters,
} from '../lib/matching.ts';

const filters: Filters = {
  calories: { min: 500, max: 700 },
  categories: [],
  zip: '02108',
  radius: 10,
  sort: 'calories',
};

test('U01 validateFilters normalizes a valid request', () => {
  const result = validateFilters({
    ...filters,
    categories: ['Chicken', 'Asian', 'Chicken'],
    protein: { value: 25, mode: 'min', tolerance: 8 },
    carbs: { value: 40, mode: 'range', tolerance: 5 },
  });

  assert.deepEqual(result, {
    ...filters,
    categories: ['Chicken', 'Asian'],
    protein: { value: 25, mode: 'min', tolerance: 0 },
    carbs: { value: 40, mode: 'range', tolerance: 5 },
  });
});

test('U02 validateFilters keeps zero bounds and drops a blank optional goal', () => {
  const result = validateFilters({
    ...filters,
    calories: { min: 0, max: 0 },
    protein: { value: '' },
    fiber: { value: 0, mode: 'max' },
  });

  assert.deepEqual(result, {
    ...filters,
    calories: { min: 0, max: 0 },
    fiber: { value: 0, mode: 'max', tolerance: 0 },
  });
});

test('U03 validateFilters rejects a string used as a nutrient tolerance', () => {
  assert.throws(
    () =>
      validateFilters({
        ...filters,
        protein: { value: 25, mode: 'range', tolerance: '5' },
      }),
    { name: 'Error', message: 'Enter a valid protein tolerance.' },
  );
});

test('U04 totalNutrition sums fractional servings and rounds the totals', () => {
  const result = totalNutrition([
    {
      quantity: 1.5,
      item: { calories: 150, protein: 9.125, carbs: 20, fiber: 0, fat: 2.25 },
    },
    {
      quantity: 0.5,
      item: { calories: 80, protein: 3, carbs: 11, fiber: 2, fat: 1 },
    },
  ]);

  assert.deepEqual(result, {
    calories: 265,
    protein: 15.19,
    carbs: 35.5,
    fiber: 1,
    fat: 3.88,
  });
});

test('U05 totalNutrition returns five zero totals for an empty list', () => {
  assert.deepEqual(totalNutrition([]), {
    calories: 0,
    protein: 0,
    carbs: 0,
    fiber: 0,
    fat: 0,
  });
});

test('U06 totalNutrition propagates null and missing values by nutrient', () => {
  const result = totalNutrition([
    {
      quantity: 1,
      item: { calories: 100, protein: 8, carbs: 10, fiber: 2, fat: 0 },
    },
    {
      quantity: 2,
      item: { calories: 50, protein: 3, fiber: null, fat: 0 },
    },
  ]);

  assert.deepEqual(result, {
    calories: 200,
    protein: 14,
    carbs: null,
    fiber: null,
    fat: 0,
  });
});

test('U07 evaluate explains each satisfied active constraint', () => {
  const result = evaluate(
    { totals: { calories: 620, protein: 30, carbs: 35, fiber: 6 } },
    {
      ...filters,
      protein: { value: 25, mode: 'min', tolerance: 0 },
      carbs: { value: 40, mode: 'max', tolerance: 0 },
      fiber: { value: 5, mode: 'range', tolerance: 2 },
    },
  );

  assert.deepEqual(result, {
    met: [
      'Meets your calorie minimum and maximum',
      'Meets your protein minimum',
      'Meets your carbs maximum',
      'Meets your fiber target range',
    ],
    misses: [],
  });
});

test('U08 evaluate includes the upper calorie and nutrient range endpoints', () => {
  const result = evaluate(
    { totals: { calories: 700, protein: 35 } },
    { ...filters, protein: { value: 30, mode: 'range', tolerance: 5 } },
  );

  assert.deepEqual(result, {
    met: [
      'Meets your calorie minimum and maximum',
      'Meets your protein target range',
    ],
    misses: [],
  });
});

test('U09 evaluate reports shortfall, excess, and unknown nutrition separately', () => {
  const result = evaluate(
    { totals: { calories: 600, protein: 24.75, carbs: 42.5, fiber: null } },
    {
      ...filters,
      protein: { value: 25, mode: 'min', tolerance: 0 },
      carbs: { value: 40, mode: 'max', tolerance: 0 },
      fiber: { value: 0, mode: 'min', tolerance: 0 },
    },
  );

  assert.deepEqual(result, {
    met: ['Meets your calorie minimum and maximum'],
    misses: [
      'protein: 24.75g, 0.25g below 25g minimum',
      'carbs: 42.5g, 2.5g above 40g maximum',
      'fiber: nutrition unknown',
    ],
  });
});

test('U10 rank sorts by distance, then calorie midpoint and meal ID', () => {
  const meals = [
    { id: 'far', distance: 8, totals: { calories: 600 } },
    { id: 'upper', distance: 2, totals: { calories: 650 } },
    { id: 'lower', distance: 2, totals: { calories: 550 } },
    { id: 'center', distance: 2, totals: { calories: 600 } },
  ];

  const result = rank(meals, { ...filters, sort: 'distance' });

  assert.deepEqual(
    result.map((meal) => meal.id),
    ['center', 'lower', 'upper', 'far'],
  );
  assert.deepEqual(
    meals.map((meal) => meal.id),
    ['far', 'upper', 'lower', 'center'],
  );
});

test('U11 rank returns an empty result when there are no meals', () => {
  assert.deepEqual(rank([], filters), []);
});

test('U12 rank puts unknown protein after a known zero', () => {
  const meals = [
    { id: 'unknown', totals: { calories: 600, protein: null } },
    { id: 'zero', totals: { calories: 690, protein: 0 } },
    { id: 'high', totals: { calories: 700, protein: 25 } },
  ];

  const result = rank(meals, { ...filters, sort: 'protein' });

  assert.deepEqual(
    result.map((meal) => meal.id),
    ['high', 'zero', 'unknown'],
  );
});
