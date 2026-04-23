// Nominatim place search — free, no API key. Be polite: include a User-Agent.

export interface PlaceResult {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type: string;
}

const HEADERS = {
  "Accept-Language": "en",
  // Note: browsers ignore custom User-Agent on fetch; Nominatim mainly polices
  // by Referer + IP. We still pass a friendly UA where possible.
};

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(q + " Kenya")}` +
      `&format=json&countrycodes=ke&limit=6&addressdetails=1`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<Record<string, unknown>>;
    return data.map((it) => ({
      id: String(it.place_id),
      name: String(it.name ?? String(it.display_name ?? "").split(",")[0]),
      displayName: String(it.display_name ?? ""),
      lat: parseFloat(String(it.lat)),
      lng: parseFloat(String(it.lon)),
      type: String(it.type ?? ""),
    }));
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: HEADERS },
    );
    if (!res.ok) return "Unknown location";
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? "Unknown location";
  } catch {
    return "Unknown location";
  }
}