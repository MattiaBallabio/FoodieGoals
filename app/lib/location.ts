import centers from '../data/zip-centers.json' with { type: 'json' };
export interface LocationProvider {
  lookup(
    zip: string,
  ): Promise<{
    supported: boolean;
    city?: string;
    message: string;
    locations: any[];
  }>;
}
export class DemoLocationProvider implements LocationProvider {
  async lookup(zip: string) {
    const center = (centers as Record<string, any>)[zip],
      city = center?.city;
    return {
      supported: !!city,
      city,
      zipCenter: center ?? null,
      locations: [],
      message: city
        ? `Location demo · ${city}. These are national-menu examples. The map shows community-mapped branches separately; it does not confirm meal availability at those locations.`
        : 'No location coverage for this ZIP yet. Try demo ZIP 10001 or 02108. We have not searched for nearby restaurants.',
    };
  }
}
export async function lookupUSZip(zip: string) {
  if (!/^\d{5}$/.test(zip)) throw Error('Invalid ZIP');
  const response = await fetch(`https://api.zippopotam.us/us/${zip}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw Error('ZIP lookup temporarily unavailable');
  const data: any = await response.json();
  const place = data.places[0];
  return {
    zip,
    city: place['place name'],
    state: place['state abbreviation'],
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    source: `https://api.zippopotam.us/us/${zip}`,
  };
}
export function milesFromZipCenter(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const r = Math.PI / 180,
    dLat = (b.latitude - a.latitude) * r,
    dLon = (b.longitude - a.longitude) * r;
  return (
    3958.7613 *
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin(dLat / 2) ** 2 +
          Math.cos(a.latitude * r) *
            Math.cos(b.latitude * r) *
            Math.sin(dLon / 2) ** 2,
      ),
    )
  );
}
