// OSRM public routing service (free, no key) — https://router.project-osrm.org
// Returns a polyline of [lat, lng] coordinates plus distance/duration.

export type OsrmRoute = {
  coords: Array<[number, number]>;
  distanceMeters: number;
  durationSeconds: number;
};

export async function getRoute(
  from: [number, number],
  to: [number, number],
  signal?: AbortSignal,
): Promise<OsrmRoute | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const json: {
      routes?: Array<{
        geometry: { coordinates: [number, number][] };
        distance: number;
        duration: number;
      }>;
    } = await res.json();
    const r = json.routes?.[0];
    if (!r) return null;
    return {
      coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
      distanceMeters: r.distance,
      durationSeconds: r.duration,
    };
  } catch {
    return null;
  }
}

export function fareFromDistance(meters: number) {
  const km = meters / 1000;
  const min = Math.max(50, Math.round(km * 35));
  const max = Math.max(80, Math.round(km * 50));
  return { min, max };
}