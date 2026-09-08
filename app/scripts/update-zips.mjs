import { writeFileSync } from 'node:fs';
import { lookupUSZip } from '../lib/location.ts';
const centers = {};
for (const zip of ['02108', '10001']) {
  const row = await lookupUSZip(zip);
  if (!row) throw Error(`ZIP ${zip} not found`);
  centers[zip] = {
    city: `${row.city}, ${row.state}`,
    latitude: row.latitude,
    longitude: row.longitude,
    source: row.source,
    checked: new Date().toISOString().slice(0, 10),
  };
}
writeFileSync('data/zip-centers.json', JSON.stringify(centers, null, 2) + '\n');
console.log(
  'Updated two sourced ZIP centers. Branch coverage remains demo-only.',
);
