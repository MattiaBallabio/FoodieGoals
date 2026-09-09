# Recommendation map

Added September 8, 2026. The results page has an interactive Leaflet map centered on the entered ZIP, a radius circle, numbered branch pins, and Google Maps directions in each popup. An expandable address/directions list provides a text alternative. It uses the chains represented in displayed strict, nutrition, and near-match results; multiple meals at the same branch do not create multiple pins.

## Data and behavior

- Cached ZIP centers for 44512 (Boardman / Youngstown), 10001, and 02108 are reused. Other map centers are requested from Zippopotam.us; missing ZIPs and provider failures are distinguished. Meal recommendations are limited to these three demo ZIPs; this does not establish complete postal coverage. ZIP 44512 was added on September 8, 2026 using the provider's Youngstown, OH center at 41.0252, -80.6687.
- Branches come from OpenStreetMap through Overpass. Only recognized current amenity/name or brand tags with valid coordinates within the requested radius are retained. Building centers may be used; entrances, hours, and menu availability are not verified. Same-chain representations within approximately 40 meters are deduplicated, which can merge closely adjacent listings.
- Only returned sourced coordinates become pins. Community data can be incomplete or stale. A successful empty lookup is not a guarantee that no branches exist. Partial/error responses are not presented as complete results. Map pins do not promote a meal into the existing strict-match category.
- Google Maps links use exact destination coordinates and omit the origin so Google can ask for or use the user's starting location. The browser/app decides how to open them. No GPS permission, Google API key, or Google route calculation is used inside FoodieGoals.
- ZIP lookup has a five-second timeout; branch queries have a twenty-five-second request timeout. The local server limits concurrent distinct lookups to four and keeps at most 100 cached responses (15 minutes for success, 30 seconds for failures). This is per-process load protection, not a distributed production rate limiter.
- Pins and directions remain available in the list if map tiles fail. Map lookup errors do not block meal search. External text is rendered as text, not popup HTML.

## Licenses, service policy, and privacy

[Leaflet](https://leafletjs.com/) is distributed under BSD-2-Clause; its package license is retained. OpenStreetMap map and branch data is attributed and linked to the [ODbL notice](https://www.openstreetmap.org/copyright). The branch response includes the source object URL; OSM location data remains separate from the restaurant nutrition catalog. No restaurant logo assets are used in map pins.

The browser requests only visible tiles from the standard OSM tile server, honoring browser caching and sending its normal referrer. There is no tile prefetching or offline download. Follow the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/). The public [Overpass instance](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html) is used for this low-volume local prototype; its guidance discourages relying on public instances as a general application backend. **Before public deployment, configure a suitable hosted/self-hosted location provider and review tile capacity, caching, attribution, rate limits, and license obligations.** These public services are not a guaranteed production backend.

The server sends the ZIP to Zippopotam.us when uncached, and coordinates/radius/restaurant names to Overpass. The browser sends tile requests and connection metadata to OpenStreetMap. Nutrition goals, favorites, and account details are not sent to map providers by this feature. Google receives the destination only when a user follows a link. Update production privacy disclosures accordingly; this is a change from the previously documented data flow.

Directions format follows [Google Maps URLs documentation](https://developers.google.com/maps/documentation/urls/get-started). No food-order availability, driving-distance estimate, complete branch directory, native iOS behavior, or legal clearance is implied.

## Verification

Automated tests cover coordinate validity, destination encoding, ZIP/radius/chain validation, chain filtering, source IDs, duplicate branches, radius filtering, closed listings, way centers, provider failure, partial results, and missing ZIPs. API tests cover validation and the cached ZIP-center response. Live Boston lookup returned 18 sourced locations within five miles during development; counts can change as data changes.
