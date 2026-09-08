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
export type Filters = {
  calories: Constraint;
  protein?: Constraint;
  carbs?: Constraint;
  fiber?: Constraint;
  fat?: Constraint;
  categories: string[];
  zip: string;
  radius: number;
  sort: string;
};
export function validateFilters(raw: any): Filters {
  if (!raw || typeof raw !== 'object')
    throw Error('Please enter your meal goals.');
  const out: any = {};
  for (const key of nutrients) {
    const c = raw[key];
    if (c === undefined || c === null || c.value === '' || c.value === null) {
      if (key === 'calories')
        throw Error('Calories for this meal is required.');
      continue;
    }
    if (
      typeof c.value !== 'number' ||
      !Number.isFinite(c.value) ||
      c.value < 0 ||
      c.value > 10000 ||
      (key === 'calories' && c.value === 0)
    )
      throw Error(
        `Enter a valid ${key} value (${key === 'calories' ? 'above zero' : 'zero or more'}, up to 10,000).`,
      );
    if (
      !['min', 'max', 'range'].includes(c.mode) ||
      (key === 'calories' && c.mode !== 'range')
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
    const low =
        c.mode === 'max'
          ? 0
          : Math.max(0, c.value - (c.mode === 'range' ? c.tolerance : 0)),
      high =
        c.mode === 'min'
          ? Infinity
          : c.value + (c.mode === 'range' ? c.tolerance : 0);
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
          ? 'Within your calorie range'
          : `Meets your ${key} ${c.mode === 'min' ? 'minimum' : c.mode === 'max' ? 'maximum' : 'target range'}`,
      );
  }
  return { met, misses };
}
export function rank(meals: any[], filters: Filters) {
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
      Math.abs(a.totals.calories - filters.calories.value) -
        Math.abs(b.totals.calories - filters.calories.value) ||
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
