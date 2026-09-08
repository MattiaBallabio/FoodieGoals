'use client';
import { useEffect, useRef, useState } from 'react';
import { directionsUrl, type MapResult } from '@/lib/restaurant-map';

function MapCanvas({ data, zip, radius }: { data: MapResult; zip: string; radius: number }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!data.center || !container.current) return;
    let disposed = false;
    let map: import('leaflet').Map | undefined;
    let observer: ResizeObserver | undefined;
    setError('');
    import('leaflet').then(L => {
      if (disposed || !container.current || !data.center) return;
      const point: [number, number] = [data.center.latitude, data.center.longitude];
      map = L.map(container.current, { scrollWheelZoom: false, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false }).setView(point, radius === 5 ? 12 : radius === 10 ? 11 : 10);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, referrerPolicy: 'strict-origin-when-cross-origin',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).on('tileerror', () => { if (!disposed) setError('Some map tiles could not load. Restaurant links below still work.'); }).addTo(map);
      L.circle(point, { radius: radius * 1609.344, color: '#55584f', weight: 1, dashArray: '5 6', fillOpacity: 0.025 }).addTo(map);
      L.circleMarker(point, { radius: 7, color: '#fff', weight: 2, fillColor: '#17678b', fillOpacity: 1 })
        .bindTooltip(`ZIP ${zip} center`, { permanent: true, direction: 'top' }).addTo(map);
      data.branches.forEach((branch, index) => {
        const popup = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = branch.name;
        const address = document.createElement('p');
        address.textContent = branch.address;
        const link = document.createElement('a');
        link.href = directionsUrl(branch); link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = 'Directions in Google Maps ↗';
        popup.appendChild(name); popup.appendChild(address); popup.appendChild(link);
        L.marker([branch.latitude, branch.longitude], {
          riseOnHover: true,
          title: `${branch.name} — ${branch.address}`,
          alt: `${branch.name}, location ${index + 1}`,
          icon: L.divIcon({ className: 'restaurant-pin', html: `<span>${index + 1}</span>`, iconSize: [32, 38], iconAnchor: [16, 38] }),
        }).bindPopup(popup).addTo(map!);
      });
      observer = new ResizeObserver(() => map?.invalidateSize());
      observer.observe(container.current);
    }).catch(() => { if (!disposed) setError('The map could not load. Use the restaurant links below.'); });
    return () => { disposed = true; observer?.disconnect(); map?.remove(); };
  }, [data, zip, radius]);
  return <>
    <div className="restaurant-map-canvas" ref={container} role="region" aria-label={`Restaurant map centered on ZIP ${zip}`} />
    {error && <p role="status" className="hint">{error}</p>}
  </>;
}

export function RestaurantMap({ zip, radius, chains }: { zip: string; radius: number; chains: string }) {
  const [data, setData] = useState<MapResult | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData(null); setError('');
    const params = new URLSearchParams({ zip, radius: String(radius), chains });
    fetch(`/api/map?${params}`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw Error('Map lookup is unavailable. Please try again.');
      return response.json() as Promise<MapResult>;
    }).then(result => { if (!controller.signal.aborted) setData(result); }).catch(() => {
      if (!controller.signal.aborted) setError('Map lookup is unavailable. Please try again.');
    });
    return () => controller.abort();
  }, [zip, radius, chains, attempt]);
  return <section className="restaurant-map-panel" aria-labelledby="restaurant-map-title">
    <div className="map-heading"><div><h2 id="restaurant-map-title">Find a restaurant</h2>
      <p>Near ZIP {zip} · {radius}-mile radius from the ZIP center</p></div>
      <a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: `${zip} USA` })}`}>Open area in Google Maps ↗</a>
    </div>
    {!data && !error && <p role="status">Loading map and restaurant locations…</p>}
    {data?.center && <MapCanvas data={data} zip={zip} radius={radius} />}
    {(error || data?.status === 'zip-unavailable' || data?.status === 'branches-unavailable') && <div role="status">
      <p>{error || (data?.center ? 'The ZIP center is shown, but restaurant locations are temporarily unavailable.' : 'The ZIP location service is temporarily unavailable.')}</p>
      <button onClick={() => setAttempt(v => v + 1)}>Retry map lookup</button>
    </div>}
    {data?.status === 'unknown-zip' && <p>No map center was found for this ZIP. Check the ZIP or open the area in Google Maps.</p>}
    {data?.status === 'ok' && !data.branches.length && <p>{chains ? 'No mapped locations for these restaurants were found within your radius. This does not prove there are no branches nearby.' : 'No restaurant recommendations to pin for these filters. The map shows your ZIP area.'}</p>}
    {!!data?.branches.length && <>
      <p className="hint">{data.branches.length} mapped locations for the restaurants in your results. Zoom in to separate nearby pins, or use the address list below. Pins include restaurants from near matches. Locations are community-maintained; confirm hours and meal availability before traveling.</p>
      <details className="map-location-list"><summary>Restaurant addresses & directions ({data.branches.length})</summary>
        <ol>{data.branches.map((branch, index) => <li key={branch.id}>
          <strong>{index + 1}. {branch.name}</strong><span>{branch.address}</span>
          <span>{branch.distance.toFixed(1)} miles from ZIP center · straight-line estimate</span>
          <a href={directionsUrl(branch)} target="_blank" rel="noopener noreferrer">Directions to {branch.name} in Google Maps ↗</a>
          <a href={branch.source} target="_blank" rel="noopener noreferrer">Check location source ↗</a>
        </li>)}</ol>
      </details>
    </>}
    <p className="hint map-credit">Map and location data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors (ODbL)</a>. ZIP centers: Zippopotam.us. Map providers receive the requested area; Google Maps opens only when you follow a link.</p>
  </section>;
}
