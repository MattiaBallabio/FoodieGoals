// Human-transcribed official nutrition rows; regenerates the reviewable JSON import.
import { mkdirSync, writeFileSync } from 'node:fs';
const checked = '2026-09-07';
const panda = 'https://www.pandaexpress.com/nutritioninformation';
const chip =
  'https://www.chipotle.com/content/dam/poc/order/nutrition-files/PaperMenu_STANDARD_NoPricing_120221_us.pdf';
const data = {
  restaurants: [
    { id: 'panda', name: 'Panda Express' },
    { id: 'chipotle', name: 'Chipotle' },
    { id: 'cfa', name: 'Chick-fil-A' },
  ],
  items: [],
  meals: [],
  locations: [],
};
function item(
  id,
  restaurantId,
  name,
  serving,
  values,
  source,
  note = 'Standard published portion; no added sauces or extras.',
) {
  data.items.push({
    id,
    restaurantId,
    name,
    serving,
    ...Object.fromEntries(
      ['calories', 'protein', 'carbs', 'fiber', 'fat'].map((k, i) => [
        k,
        values[i],
      ]),
    ),
    source,
    checked,
    verification: 'official',
    note,
  });
}
function meal(
  id,
  restaurantId,
  name,
  categories,
  parts,
  note = 'Only the listed items are included. No drink or additional sauces.',
) {
  data.meals.push({
    id,
    restaurantId,
    name,
    categories,
    components: parts.map(([itemId, quantity = 1]) => ({ itemId, quantity })),
    note,
    verification: 'official',
  });
}
item('p-greens', 'panda', 'Super Greens', '10 oz', [130, 9, 14, 7, 4], panda);
item(
  'p-rice',
  'panda',
  'White Steamed Rice',
  '11 oz',
  [520, 10, 118, 0, 0],
  panda,
);
const entrees = [
  ['grilled', 'Grilled Teriyaki Chicken', '6 oz', [275, 33, 14, 0, 10]],
  ['orange', 'Orange Chicken', '5.92 oz', [510, 16, 53, 2, 24]],
  ['kung', 'Kung Pao Chicken', '6.73 oz', [320, 17, 15, 2, 21]],
  ['mushroom', 'Mushroom Chicken', '5.70 oz', [220, 13, 10, 1, 14]],
  ['string', 'String Bean Chicken Breast', '5.60 oz', [210, 12, 13, 5, 12]],
  ['broccoli', 'Broccoli Beef', '5.44 oz', [150, 15, 12, 2, 6]],
  ['steak', 'Black Pepper Sirloin Steak', '5.10 oz', [180, 19, 12, 2, 6]],
  ['tofu', 'Eggplant Tofu', '6.10 oz', [340, 7, 23, 3, 24]],
];
for (const [id, name, serving, values] of entrees) {
  item('p-' + id, 'panda', name, serving, values, panda);
  for (const [side, label] of [
    ['greens', 'Super Greens'],
    ['rice', 'White Rice'],
  ])
    meal(
      'p-' + id + '-' + side,
      'panda',
      name + ' + ' + label,
      [
        'Asian',
        ...(['grilled', 'orange', 'kung', 'mushroom', 'string'].includes(id)
          ? ['Chicken']
          : []),
      ],
      [['p-' + id], ['p-' + side]],
    );
}
const vintage =
  'Official US guide marked JUL 2022, checked 2026-09-07. Historical published values; current recipes require re-verification. Only listed portions; no extras.';
for (const [id, name, serving, values] of [
  ['rice', 'Cilantro-Lime Brown Rice', '4 oz', [210, 4, 36, 2, 6]],
  ['beans', 'Black Beans', '4 oz', [130, 8, 22, 7, 1.5]],
  ['salsa', 'Fresh Tomato Salsa', '4 oz', [25, 0, 4, 1, 0]],
  ['salad', 'Supergreens Salad Mix', '3 oz', [15, 1, 3, 2, 0]],
  ['veg', 'Fajita Vegetables', '2 oz', [20, 1, 5, 1, 0]],
  ['chicken', 'Chicken', '4 oz', [180, 32, 0, 0, 7]],
  ['steak', 'Steak', '4 oz', [150, 21, 1, 1, 6]],
  ['sofritas', 'Sofritas', '4 oz', [150, 8, 9, 3, 10]],
  ['barbacoa', 'Barbacoa', '4 oz', [170, 24, 2, 1, 7]],
  ['carnitas', 'Carnitas', '4 oz', [210, 23, 0, 0, 12]],
])
  item('c-' + id, 'chipotle', name, serving, values, chip, vintage);
for (const protein of ['chicken', 'steak', 'sofritas', 'barbacoa', 'carnitas'])
  for (const base of ['rice', 'salad'])
    meal(
      'c-' + protein + '-' + base,
      'chipotle',
      protein[0].toUpperCase() +
        protein.slice(1) +
        (base === 'rice' ? ' brown rice bowl' : ' greens bowl'),
      ['Mexican', 'Salads & Bowls'],
      [['c-' + protein], ['c-' + base], ['c-beans'], ['c-salsa'], ['c-veg']],
      vintage + ' No dressing, cheese, sour cream, guacamole, or tortilla.',
    );
item(
  'f-grilled',
  'cfa',
  'Grilled Chicken Sandwich',
  '1 sandwich',
  [390, 28, 45, 3, 11],
  'https://www.chick-fil-a.com/menu/entrees/grilled-chicken-sandwich',
);
item(
  'f-spicy',
  'cfa',
  'Spicy Chicken Sandwich',
  '1 sandwich',
  [450, 28, 45, 1, 19],
  'https://www.chick-fil-a.com/menu/entrees/spicy-chicken-sandwich',
);
item(
  'f-nuggets',
  'cfa',
  '8 ct Chick-fil-A Nuggets',
  '1 entrée (8 nuggets)',
  [250, 27, 11, null, 11],
  'https://www.chick-fil-a.com/menu/entrees/8-ct-chick-fil-a-nuggets',
  'No dipping sauce. Fiber not available in the accessed source; stored as unknown.',
);
for (const id of ['grilled', 'spicy', 'nuggets'])
  meal(
    'f-' + id,
    'cfa',
    data.items.find((i) => i.id === 'f-' + id).name,
    ['Chicken', ...(id === 'nuggets' ? [] : ['Sandwiches'])],
    [['f-' + id]],
  );
meal(
  'f-double-nuggets',
  'cfa',
  'Two 8-count nugget entrées',
  ['Chicken'],
  [['f-nuggets', 2]],
);
mkdirSync('data', { recursive: true });
writeFileSync('data/verified.json', JSON.stringify(data, null, 2) + '\n');
console.log(
  `${data.meals.length} meals; ${data.items.length} components. No fictional nutrition or branches.`,
);
