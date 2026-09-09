import test from 'node:test';
import assert from 'node:assert/strict';
import { directionsUrl, parseMapQuery, parseBranches, loadRestaurantMap } from '../lib/restaurant-map.ts';

const center = { latitude: 42.3576, longitude: -71.0684 };
const node = (id: number, tags: Record<string, string> = { amenity: 'fast_food', name: 'Chipotle' }) => ({ type: 'node', id, lat: center.latitude, lon: center.longitude, tags });
test('map query preserves ZIP zeros and rejects query injection / unsupported radii', () => {
  assert.deepEqual(parseMapQuery(new URLSearchParams('zip=02108&radius=10&chains=cfa,panda,cfa')), { zip: '02108', radius: 10, chains: ['cfa', 'panda'] });
  for (const input of ['zip=123&radius=10', 'zip=02108&radius=1000', 'zip=02108&radius=5&chains=toString', 'zip=02108&radius=5&chains=panda);']) {
    assert.throws(() => parseMapQuery(new URLSearchParams(input)));
  }
});
test('directions targets exact coordinates and leaves origin to Google Maps', () => {
  const url = new URL(directionsUrl(center));
  assert.equal(url.origin, 'https://www.google.com');
  assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('destination'), '42.3576,-71.0684');
  assert.equal(url.searchParams.has('origin'), false);
  assert.throws(() => directionsUrl({ latitude: NaN, longitude: 1 }));
});
test('branch parsing filters chain, closed, invalid and out-of-radius locations; deduplicates', () => {
  const rows = [node(1), node(1), node(2),
    node(3, { amenity: 'fast_food', name: 'Not Chipotle' }),
    node(4, { amenity: 'fast_food', name: 'Chipotle', disused: 'yes' }),
    { ...node(5), lat: null }, { ...node(6), lat: 30 },
    node(7, { amenity: 'fast_food', name: 'Panda Express' })];
  const result = parseBranches(rows, center, 5, ['chipotle']);
  assert.equal(result.length, 1);
  assert.equal(result[0].source, 'https://www.openstreetmap.org/node/1');
  assert.equal(result[0].distance, 0);
});
test('way centers and safe address text are retained', () => {
  const result = parseBranches([{ type: 'way', id: 9, center: { lat: center.latitude, lon: center.longitude }, tags: { amenity: 'restaurant', name: 'Chipotle Mexican Grill', 'addr:street': '<img onerror=bad>' } }], center, 5, ['chipotle']);
  assert.equal(result[0].address, '<img onerror=bad>'); // rendered as text, never popup HTML
  assert.equal(result[0].restaurantId, 'chipotle');
});
test('provider failure keeps ZIP center and does not invent branches', async () => {
  const failing = (async () => { throw Error('offline'); }) as typeof fetch;
  const result = await loadRestaurantMap('02108', 5, ['chipotle'], failing);
  assert.equal(result.status, 'branches-unavailable');
  assert.equal(result.center?.latitude, center.latitude);
  assert.deepEqual(result.branches, []);
  assert.equal((await loadRestaurantMap('90210', 5, [], failing)).status, 'zip-unavailable');
});
test('empty, unknown ZIP, and partial provider responses are distinguished', async () => {
  assert.equal((await loadRestaurantMap('00000', 5, [], (async () => new Response('', { status: 404 })) as typeof fetch)).status, 'unknown-zip');
  const partial = (async () => Response.json({ elements: [node(1)], remark: 'timed out' })) as typeof fetch;
  assert.equal((await loadRestaurantMap('02108', 5, ['chipotle'], partial)).status, 'branches-unavailable');
  const empty = (async () => Response.json({ elements: [] })) as typeof fetch;
  const result = await loadRestaurantMap('02108', 5, ['chipotle'], empty);
  assert.equal(result.status, 'ok'); assert.deepEqual(result.branches, []);
});
test('external ZIP lookup and sourced pins resolve in sequence', async () => {
  let calls = 0;
  const provider = (async () => ++calls === 1
    ? Response.json({ places: [{ latitude: '42.3576', longitude: '-71.0684', 'place name': 'Fixture', 'state abbreviation': 'MA' }] })
    : Response.json({ elements: [node(1)] })) as typeof fetch;
  const result = await loadRestaurantMap('99999', 5, ['chipotle'], provider);
  assert.equal(calls, 2); assert.equal(result.status, 'ok'); assert.equal(result.branches.length, 1);
});
