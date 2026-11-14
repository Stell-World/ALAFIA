export type Coordinates = { latitude: number; longitude: number };

export type HealthCenter = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  services?: string[];
  /** Only records verified by the connected source may be displayed. */
  verified: boolean;
  sourceName: string;
};

/** Adapter contract for a future, verified health-facility directory. */
export type HealthCenterProvider = {
  searchNearby: (position: Coordinates, radiusKm: number) => Promise<HealthCenter[]>;
};

export async function findNearbyCenters(
  position: Coordinates,
  provider?: HealthCenterProvider,
  radiusKm = 15,
): Promise<HealthCenter[]> {
  if (!provider) return [];
  const results = await provider.searchNearby(position, radiusKm);
  return results
    .filter((center) => center.verified)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function openStreetMapEmbedUrl(position: Coordinates) {
  const latDelta = 0.025;
  const lonDelta = Math.min(0.08, 0.025 / Math.max(0.25, Math.cos((position.latitude * Math.PI) / 180)));
  const bbox = [
    position.longitude - lonDelta,
    position.latitude - latDelta,
    position.longitude + lonDelta,
    position.latitude + latDelta,
  ].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${position.latitude},${position.longitude}`;
}

export function directionsUrl(from: Coordinates, center: HealthCenter) {
  const route = `${from.latitude},${from.longitude};${center.latitude},${center.longitude}`;
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${route}`;
}
