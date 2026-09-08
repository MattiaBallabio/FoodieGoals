import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
export function validateData(data) {
  const ids = {};
  for (const group of ['restaurants', 'items', 'meals', 'locations']) {
    if (!Array.isArray(data[group])) throw Error(`Missing ${group} array`);
    ids[group] = new Set();
    for (const row of data[group]) {
      if (
        typeof row.id !== 'string' ||
        !/^[-a-z0-9]+$/.test(row.id) ||
        ids[group].has(row.id)
      )
        throw Error(`Invalid or duplicate ${group} ID`);
      ids[group].add(row.id);
    }
  }
  for (const r of data.restaurants)
    if (typeof r.name !== 'string' || !r.name.trim())
      throw Error('Restaurant name required');
  for (const i of data.items) {
    if (!ids.restaurants.has(i.restaurantId) || !i.name || !i.serving)
      throw Error('Invalid item restaurant/name/serving');
    if (!['official', 'demo'].includes(i.verification))
      throw Error('Explicit verification status required');
    if (
      !/^https:\/\//.test(i.source) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(i.checked) ||
      Number.isNaN(Date.parse(i.checked))
    )
      throw Error('Source URL and check date required');
    for (const n of ['calories', 'protein', 'carbs', 'fiber', 'fat'])
      if (
        i[n] !== null &&
        (typeof i[n] !== 'number' || !Number.isFinite(i[n]) || i[n] < 0)
      )
        throw Error(`Invalid ${n}; unknown must be null`);
    if (i.calories === null)
      throw Error('Initial catalog requires known calories');
  }
  const allowed = [
    'Pizza',
    'Asian',
    'Burgers',
    'Chicken',
    'Mexican',
    'Sandwiches',
    'Salads & Bowls',
    'Comfort Food',
  ];
  for (const m of data.meals) {
    if (
      !ids.restaurants.has(m.restaurantId) ||
      !m.name ||
      !Array.isArray(m.categories) ||
      !m.categories.length ||
      m.categories.some((c) => !allowed.includes(c)) ||
      !['official', 'demo'].includes(m.verification)
    )
      throw Error('Invalid meal metadata');
    if (!Array.isArray(m.components) || !m.components.length)
      throw Error('Meal must include components');
    const used = new Set();
    for (const c of m.components) {
      const item = data.items.find((i) => i.id === c.itemId);
      if (
        !item ||
        item.restaurantId !== m.restaurantId ||
        item.verification !== m.verification ||
        !Number.isFinite(c.quantity) ||
        c.quantity <= 0 ||
        used.has(c.itemId)
      )
        throw Error('Invalid/cross-restaurant/duplicate meal component');
      used.add(c.itemId);
    }
  }
  for (const l of data.locations)
    if (
      !ids.restaurants.has(l.restaurantId) ||
      typeof l.verified !== 'boolean' ||
      !l.source ||
      !l.checked ||
      !Number.isFinite(l.latitude) ||
      !Number.isFinite(l.longitude) ||
      Math.abs(l.latitude) > 90 ||
      Math.abs(l.longitude) > 180
    )
      throw Error('Invalid location');
  return data;
}
export function toSQL(data) {
  validateData(data);
  const q = (v) => "'" + String(v).replaceAll("'", "''") + "'";
  const lines = [];
  for (const r of data.restaurants)
    lines.push(
      `INSERT INTO restaurants(id,name) VALUES(${q(r.id)},${q(r.name)}) ON CONFLICT(id) DO UPDATE SET name=excluded.name;`,
    );
  for (const i of data.items)
    lines.push(
      `INSERT INTO menu_items(id,restaurant_id,record) VALUES(${q(i.id)},${q(i.restaurantId)},${q(JSON.stringify(i))}) ON CONFLICT(id) DO UPDATE SET restaurant_id=excluded.restaurant_id,record=excluded.record;`,
    );
  for (const m of data.meals) {
    lines.push(
      `INSERT INTO meals(id,restaurant_id,record) VALUES(${q(m.id)},${q(m.restaurantId)},${q(JSON.stringify(m))}) ON CONFLICT(id) DO UPDATE SET restaurant_id=excluded.restaurant_id,record=excluded.record;`,
      `DELETE FROM meal_components WHERE meal_id=${q(m.id)};`,
    );
    for (const c of m.components)
      lines.push(
        `INSERT INTO meal_components(id,meal_id,item_id,quantity) VALUES(${q(m.id + ':' + c.itemId)},${q(m.id)},${q(c.itemId)},${c.quantity});`,
      );
  }
  for (const l of data.locations)
    lines.push(
      `INSERT INTO locations(id,restaurant_id,record) VALUES(${q(l.id)},${q(l.restaurantId)},${q(JSON.stringify(l))}) ON CONFLICT(id) DO UPDATE SET record=excluded.record;`,
    );
  return lines.join('\n');
}
if (process.argv[1]?.endsWith('import.mjs')) {
  try {
    const data = JSON.parse(
      readFileSync(process.argv[2] || 'data/verified.json', 'utf8'),
    );
    const sql = toSQL(data);
    writeFileSync('data/import.sql', sql);
    if (!process.argv.includes('--validate-only')) {
      const result = spawnSync(
        process.execPath,
        [
          'node_modules/wrangler/bin/wrangler.js',
          'd1',
          'execute',
          'DB',
          '--local',
          '--config',
          'wrangler.json',
          '--file',
          'data/import.sql',
        ],
        {
          stdio: 'inherit',
          env: {
            ...process.env,
            WRANGLER_SEND_METRICS: 'false',
            WRANGLER_LOG_PATH: '.wrangler/logs',
          },
        },
      );
      if (result.status !== 0) process.exit(result.status || 1);
    }
    console.log(
      `Validated ${data.meals.length} meals. Stable IDs prevent duplicates.`,
    );
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
