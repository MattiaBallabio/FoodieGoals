export const nutrients = [
  'calories',
  'protein',
  'carbs',
  'fiber',
  'fat',
] as const;
export const categories = [
  'Pizza',
  'Asian',
  'Burgers',
  'Chicken',
  'Mexican',
  'Sandwiches',
  'Salads & Bowls',
  'Comfort Food',
];
export type Constraint = {
  value: number;
  mode: 'min' | 'max' | 'range';
  tolerance: number;
};
export type CalorieBounds = { min: number; max: number };
export type Filters = {
  calories: CalorieBounds;
  protein?: Constraint;
  carbs?: Constraint;
  fiber?: Constraint;
  fat?: Constraint;
  categories: string[];
  zip: string;
  radius: number;
  sort: string;
};
function validateCalories(c: any): CalorieBounds {
  if (!c || typeof c !== 'object' || Array.isArray(c))
    throw Error('Enter both minimum and maximum calories.');
  const hasBounds = 'min' in c || 'max' in c;
  const hasLegacy = 'value' in c || 'mode' in c || 'tolerance' in c;
  if (hasBounds && hasLegacy)
    throw Error('Use minimum and maximum calories without a target or tolerance.');
  if (hasBounds) {
    for (const bound of ['min', 'max'] as const) {
      if (typeof c[bound] !== 'number' || !Number.isInteger(c[bound]) || c[bound] < 0 || c[bound] > 10000)
        throw Error('Enter ' + (bound === 'min' ? 'minimum' : 'maximum') + ' calories as a whole number from 0 to 10,000.');
    }
    if (c.min > c.max)
      throw Error('Minimum calories must be less than or equal to maximum calories.');
    return { min: c.min, max: c.max };
  }
  // Preserve existing API targets, including decimals and upper bounds above 10,000.
  if (typeof c.value !== 'number' || !Number.isFinite(c.value) || c.value <= 0 || c.value > 10000)
    throw Error('Enter a valid legacy calorie target above zero, up to 10,000.');
  if (c.mode !== 'range') throw Error('Choose a valid legacy calorie comparison.');
  if (typeof c.tolerance !== 'number' || !Number.isFinite(c.tolerance) || c.tolerance < 0 || c.tolerance > 10000)
    throw Error('Enter a valid legacy calorie tolerance.');
  return { min: Math.max(0, c.value - c.tolerance), max: c.value + c.tolerance };
}
export function validateFilters(raw: any): Filters {
  if (!raw || typeof raw !== 'object')
    throw Error('Please enter your meal goals.');
  const out: any = { calories: validateCalories(raw.calories) };
  for (const key of nutrients.filter((key) => key !== 'calories')) {
    const c = raw[key];
    if (c === undefined || c === null || c.value === '' || c.value === null) {
      continue;
    }
    if (
      typeof c.value !== 'number' ||
      !Number.isFinite(c.value) ||
      c.value < 0 ||
      c.value > 10000
    )
      throw Error(
        `Enter a valid ${key} value (zero or more, up to 10,000).`,
      );
    if (
      !['min', 'max', 'range'].includes(c.mode)
    )
      throw Error(`Choose a valid ${key} comparison.`);
    if (
      c.mode === 'range' &&
      (typeof c.tolerance !== 'number' ||
        !Number.isFinite(c.tolerance) ||
        c.tolerance < 0 ||
        c.tolerance > 10000)
    )
      throw Error(`Enter a valid ${key} tolerance.`);
    out[key] = {
      value: c.value,
      mode: c.mode,
      tolerance: c.mode === 'range' ? c.tolerance : 0,
    };
  }
  if (typeof raw.zip !== 'string' || !/^\d{5}$/.test(raw.zip))
    throw Error('Enter a five-digit US ZIP code.');
  if (![5, 10, 25].includes(raw.radius))
    throw Error('Choose a radius of 5, 10, or 25 miles.');
  if (
    !Array.isArray(raw.categories) ||
    raw.categories.some((c: any) => !categories.includes(c))
  )
    throw Error('Choose a listed food category.');
  if (!['calories', 'protein', 'distance'].includes(raw.sort))
    throw Error('Choose a valid sorting option.');
  return {
    ...out,
    categories: [...new Set(raw.categories)],
    zip: raw.zip,
    radius: raw.radius,
    sort: raw.sort,
  };
}
export function totalNutrition(components: any[]) {
  return Object.fromEntries(
    nutrients.map((key) => [
      key,
      components.some((c) => c.item[key] === null || c.item[key] === undefined)
        ? null
        : Math.round(
            components.reduce((sum, c) => sum + c.item[key] * c.quantity, 0) *
              100,
          ) / 100,
    ]),
  );
}
export function evaluate(meal: any, filters: Filters) {
  const met: string[] = [],
    misses: string[] = [];
  for (const key of nutrients) {
    const c = filters[key];
    if (!c) continue;
    const value = meal.totals[key],
      unit = key === 'calories' ? 'cal' : 'g';
    const constraint = c as Constraint;
    const low = key === 'calories' ? filters.calories.min :
        constraint.mode === 'max'
          ? 0
          : Math.max(0, constraint.value - (constraint.mode === 'range' ? constraint.tolerance : 0)),
      high = key === 'calories' ? filters.calories.max :
        constraint.mode === 'min'
          ? Infinity
          : constraint.value + (constraint.mode === 'range' ? constraint.tolerance : 0);
    if (value === null || value === undefined) {
      misses.push(`${key}: nutrition unknown`);
      continue;
    }
    if (value < low)
      misses.push(
        `${key}: ${value}${unit}, ${Math.round((low - value) * 100) / 100}${unit} below ${low}${unit} minimum`,
      );
    else if (value > high)
      misses.push(
        `${key}: ${value}${unit}, ${Math.round((value - high) * 100) / 100}${unit} above ${high}${unit} maximum`,
      );
    else
      met.push(
        key === 'calories'
          ? 'Meets your calorie minimum and maximum'
          : `Meets your ${key} ${constraint.mode === 'min' ? 'minimum' : constraint.mode === 'max' ? 'maximum' : 'target range'}`,
      );
  }
  return { met, misses };
}
export function rank(meals: any[], filters: Filters) {
  const calorieMidpoint = (filters.calories.min + filters.calories.max) / 2;
  return [...meals].sort((a, b) => {
    if (filters.sort === 'protein') {
      const protein = (b.totals.protein ?? -1) - (a.totals.protein ?? -1);
      if (protein) return protein;
    }
    if (filters.sort === 'distance') {
      const distance = (a.distance ?? Infinity) - (b.distance ?? Infinity);
      if (Number.isFinite(distance) && distance) return distance;
    }
    return (
      Math.abs(a.totals.calories - calorieMidpoint) -
        Math.abs(b.totals.calories - calorieMidpoint) ||
      a.id.localeCompare(b.id)
    );
  });
}
export function matchMeals(
  meals: any[],
  filters: Filters,
  locations: any[] = [],
) {
  const strict: any[] = [],
    near: any[] = [],
    demo: any[] = [];
  for (const meal of meals) {
    if (
      filters.categories.length &&
      !meal.categories.some((c: string) => filters.categories.includes(c))
    )
      continue;
    const branch = locations
      .filter(
        (l) =>
          l.restaurantId === meal.restaurantId &&
          l.verified &&
          Number.isFinite(l.distance) &&
          l.distance <= filters.radius,
      )
      .sort((a, b) => a.distance - b.distance)[0];
    const nutrition = evaluate(meal, filters);
    const result = {
      ...meal,
      ...nutrition,
      distance: branch?.distance ?? null,
      location: branch ?? null,
    };
    if (branch && !nutrition.misses.length) strict.push(result);
    else if (nutrition.misses.length)
      near.push({
        ...result,
        misses: [
          ...nutrition.misses,
          ...(!branch
            ? ['Location: no verified branch within your radius']
            : []),
        ],
      });
    else
      demo.push({
        ...result,
        misses: ['Location: no verified branch within your radius'],
      });
  }
  return {
    strict: rank(strict, filters),
    demo: rank(demo, filters),
    near: rank(near, filters),
  };
}
