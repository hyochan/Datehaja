/** Geo helpers. All coordinates in Datehaja are *approximate* — rounded to ~1km
 *  before they are ever stored, and never returned to another user. */

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Round a coordinate to ~1.1km so an exact home address can never be derived. */
export function coarsen(coord: number): number {
  return Math.round(coord * 100) / 100;
}

export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Great-circle midpoint — where the date should roughly happen. */
export function midpoint(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): { lat: number; lng: number } {
  const lat1 = toRad(aLat);
  const lng1 = toRad(aLng);
  const lat2 = toRad(bLat);
  const dLng = toRad(bLng - aLng);

  const bx = Math.cos(lat2) * Math.cos(dLng);
  const by = Math.cos(lat2) * Math.sin(dLng);

  const lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + bx) ** 2 + by ** 2),
  );
  const lng3 = lng1 + Math.atan2(by, Math.cos(lat1) + bx);

  return {
    lat: coarsen(toDeg(lat3)),
    lng: coarsen(((toDeg(lng3) + 540) % 360) - 180),
  };
}
