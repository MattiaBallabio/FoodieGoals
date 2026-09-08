import { loadRestaurantMap, parseMapQuery, type MapResult } from '@/lib/restaurant-map';

// Bounded local-preview cache and in-flight deduplication reduce public-provider load.
const cache = new Map<string, { expires: number; data: MapResult }>();
const pending = new Map<string, Promise<MapResult>>();
export async function GET(request: Request) {
  let query;
  try { query = parseMapQuery(new URL(request.url).searchParams); }
  catch { return Response.json({ error: 'Enter a five-digit ZIP and a supported search radius.' }, { status: 400 }); }
  const { zip, radius, chains } = query;
  const key = `${zip}:${radius}:${chains.join(',')}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return Response.json(cached.data);
  let task = pending.get(key);
  if (!task) {
    if (pending.size >= 4) return Response.json({ error: 'Map lookup is busy. Please try again shortly.' }, { status: 503 });
    task = loadRestaurantMap(zip, radius, chains);
    pending.set(key, task);
  }
  try {
    const data = await task;
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(key, { data, expires: Date.now() + (data.status === 'ok' ? 15 * 60_000 : 30_000) });
    return Response.json(data);
  } finally { pending.delete(key); }
}
