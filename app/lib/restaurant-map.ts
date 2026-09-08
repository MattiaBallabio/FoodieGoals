import centers from '../data/zip-centers.json' with { type: 'json' };
import { milesFromZipCenter } from './location.ts';

export const mapChains = {
  panda: 'Panda Express',
  chipotle: 'Chipotle',
  cfa: 'Chick-fil-A',
} as const;
export type ChainId = keyof typeof mapChains;
export type Point = { latitude: number; longitude: number };
export type MapBranch = Point & {
  id: string; restaurantId: ChainId; name: string; address: string;
  distance: number; source: string;
};
export type MapResult = {
  center: (Point & { city: string }) | null;
  branches: MapBranch[];
  status: 'ok' | 'unknown-zip' | 'zip-unavailable' | 'branches-unavailable';
  checked: string;
};
export function isPoint(p: any): p is Point {
  return typeof p?.latitude === 'number' && Number.isFinite(p.latitude) &&
    Math.abs(p.latitude) <= 90 && typeof p.longitude === 'number' &&
    Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180;
}
export function directionsUrl(branch: Point) {
  if (!isPoint(branch)) throw Error('Invalid map destination');
  const params = new URLSearchParams({ api: '1',
    destination: `${branch.latitude},${branch.longitude}` });
  return `https://www.google.com/maps/dir/?${params}`;
}
export function parseMapQuery(params: URLSearchParams) {
  const zip = params.get('zip') ?? '';
  const radius = Number(params.get('radius'));
  const raw = params.get('chains') ?? '';
  const chains = [...new Set(raw ? raw.split(',') : [])];
  if (!/^\d{5}$/.test(zip) || ![5, 10, 25].includes(radius) ||
    chains.some(id => !Object.hasOwn(mapChains, id))) throw Error('Invalid map request');
  return { zip, radius, chains: chains.sort() as ChainId[] };
}
const normalize = (s: unknown) => typeof s === 'string' ? s.toLowerCase().replace(/[^a-z]/g, '') : '';
export function parseBranches(elements: any[], center: Point, radius: number, chains: ChainId[]): MapBranch[] {
  const result: MapBranch[] = [];
  for (const element of elements) {
    const tags = element.tags ?? {};
    if (!['node', 'way', 'relation'].includes(element.type) || !Number.isSafeInteger(element.id)) continue;
    if (!['fast_food', 'restaurant', 'food_court'].includes(tags.amenity) ||
      tags.disused === 'yes' || tags.abandoned === 'yes' || tags['opening_hours'] === 'closed') continue;
    const restaurantId = chains.find(id => {
      const names = [normalize(tags.brand), normalize(tags.name)];
      return names.includes(normalize(mapChains[id])) ||
        (id === 'chipotle' && names.includes('chipotlemexicangrill'));
    });
    const point = { latitude: element.lat ?? element.center?.lat,
      longitude: element.lon ?? element.center?.lon };
    if (!restaurantId || !isPoint(point)) continue;
    const distance = milesFromZipCenter(center, point);
    if (distance > radius) continue;
    // OSM can represent the same branch as both a building and a point.
    if (result.some(b => b.restaurantId === restaurantId && milesFromZipCenter(b, point) < 0.025)) continue;
    const address = [
      [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
      tags['addr:city'], tags['addr:state'], tags['addr:postcode'],
    ].filter(v => typeof v === 'string' && v.length).join(', ');
    result.push({ ...point, id: `${element.type}/${element.id}`, restaurantId,
      name: mapChains[restaurantId], address: address || 'Street address unavailable — directions use the mapped coordinates.',
      distance, source: `https://www.openstreetmap.org/${element.type}/${element.id}` });
  }
  return result.sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
}

// Fixed endpoints; only validated ZIP/radius/chain values enter provider queries.
export async function loadRestaurantMap(zip: string, radius: number, chains: ChainId[], fetcher: typeof fetch = fetch): Promise<MapResult> {
  const checked = new Date().toISOString();
  let center = (centers as Record<string, Point & { city: string }>)[zip] ?? null;
  if (!center) {
    try {
      const response = await fetcher(`https://api.zippopotam.us/us/${zip}`, { signal: AbortSignal.timeout(5000) });
      if (response.status === 404) return { center: null, branches: [], status: 'unknown-zip', checked };
      if (!response.ok) throw Error('ZIP provider unavailable');
      const data: any = await response.json();
      const place = data.places?.[0];
      const point = { latitude: Number(place?.latitude), longitude: Number(place?.longitude) };
      if (!isPoint(point) || !place?.['place name']) throw Error('Invalid ZIP coordinates');
      center = { ...point, city: `${place['place name']}, ${place['state abbreviation']}` };
    } catch { return { center: null, branches: [], status: 'zip-unavailable', checked }; }
  }
  if (!chains.length) return { center, branches: [], status: 'ok', checked };
  try {
    const names = chains.map(id => id === 'chipotle' ? 'Chipotle( Mexican Grill)?' : mapChains[id]).join('|');
    const around = `around:${Math.ceil(radius * 1609.344)},${center.latitude},${center.longitude}`;
    const query = `[out:json][timeout:20][maxsize:134217728];(nwr["amenity"~"^(fast_food|restaurant|food_court)$"]["brand"~"^(${names})$",i](${around});nwr["amenity"~"^(fast_food|restaurant|food_court)$"]["name"~"^(${names})$",i](${around}););out center;`;
    const response = await fetcher('https://overpass-api.de/api/interpreter', {
      method: 'POST', body: new URLSearchParams({ data: query }),
      headers: { 'User-Agent': 'FoodieGoals-local-preview/0.1' },
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) throw Error('Branch provider unavailable');
    const data: any = await response.json();
    // A timed-out Overpass response may contain partial results; don't call it complete.
    if (data.remark || !Array.isArray(data.elements)) throw Error('Incomplete location response');
    return { center, branches: parseBranches(data.elements, center, radius, chains), status: 'ok', checked };
  } catch { return { center, branches: [], status: 'branches-unavailable', checked }; }
}
