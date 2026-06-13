import type { OrderStatus } from '@/store/order-store';

export interface LatLng {
  latitude: number;
  longitude: number;
}

// Restaurant (pickup) — Al Baik, Al Rawdah, Jeddah
export const RESTAURANT: LatLng = { latitude: 21.4858, longitude: 39.1925 };
export const RESTAURANT_NAME = 'Al Baik - Al Rawdah';
export const RESTAURANT_ADDRESS = 'Al Rawdah District, Jeddah';

export const DESTINATION: LatLng = { latitude: 21.4735, longitude: 39.1778 };

// Dummy delivery route — waypoints following roads in Jeddah (restaurant → customer)
export const ROAD_WAYPOINTS: LatLng[] = [
  RESTAURANT,
  { latitude: 21.4856, longitude: 39.1912 },
  { latitude: 21.4852, longitude: 39.1898 },
  { latitude: 21.4845, longitude: 39.1893 },
  { latitude: 21.4838, longitude: 39.1893 },
  { latitude: 21.483, longitude: 39.1888 },
  { latitude: 21.4822, longitude: 39.1878 },
  { latitude: 21.4815, longitude: 39.1868 },
  { latitude: 21.4808, longitude: 39.1858 },
  { latitude: 21.48, longitude: 39.1852 },
  { latitude: 21.4792, longitude: 39.1845 },
  { latitude: 21.4785, longitude: 39.1838 },
  { latitude: 21.4778, longitude: 39.1828 },
  { latitude: 21.477, longitude: 39.1818 },
  { latitude: 21.4762, longitude: 39.181 },
  { latitude: 21.4755, longitude: 39.1802 },
  { latitude: 21.4748, longitude: 39.1795 },
  { latitude: 21.4742, longitude: 39.1788 },
  { latitude: 21.4738, longitude: 39.1783 },
  DESTINATION,
];

// Where the driver starts when an order is accepted (a few blocks from the restaurant)
export const DRIVER_ORIGIN: LatLng = { latitude: 21.4895, longitude: 39.1968 };

// Driver → restaurant approach path (pickup leg)
export const PICKUP_WAYPOINTS: LatLng[] = [
  DRIVER_ORIGIN,
  { latitude: 21.4888, longitude: 39.1958 },
  { latitude: 21.488, longitude: 39.1948 },
  { latitude: 21.4872, longitude: 39.1938 },
  { latitude: 21.4865, longitude: 39.193 },
  RESTAURANT,
];

export function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

/**
 * A polyline preprocessed with cumulative segment lengths, so a marker can be
 * interpolated at constant real-world speed regardless of how unevenly the
 * route geometry is spaced (road-API geometry is dense on curves, sparse on
 * straights).
 */
export interface RoutePath {
  coords: LatLng[];
  /** Cumulative distance (km) up to each coordinate; same length as coords. */
  cumulative: number[];
  totalKm: number;
}

export function buildRoutePath(coords: LatLng[]): RoutePath {
  const cumulative: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    cumulative.push(cumulative[i - 1] + haversineKm(coords[i - 1], coords[i]));
  }
  return { coords, cumulative, totalKm: cumulative[cumulative.length - 1] };
}

/** Distance-weighted position along a path for progress in [0, 1]. */
export function pointOnPath(path: RoutePath, progress: number): LatLng {
  const { coords, cumulative, totalKm } = path;
  if (coords.length < 2 || totalKm === 0) return coords[0];
  const targetKm = Math.max(0, Math.min(1, progress)) * totalKm;

  // Binary search for the segment containing targetKm.
  let lo = 0;
  let hi = cumulative.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] <= targetKm) lo = mid;
    else hi = mid;
  }
  const segLen = cumulative[hi] - cumulative[lo];
  const t = segLen === 0 ? 0 : (targetKm - cumulative[lo]) / segLen;
  return lerp(coords[lo], coords[hi], t);
}

/** Region that fits a set of coordinates, with padding. */
export function regionForCoords(coords: LatLng[], padding = 1.6) {
  let minLat = 90,
    maxLat = -90,
    minLng = 180,
    maxLng = -180;
  for (const c of coords) {
    if (c.latitude < minLat) minLat = c.latitude;
    if (c.latitude > maxLat) maxLat = c.latitude;
    if (c.longitude < minLng) minLng = c.longitude;
    if (c.longitude > maxLng) maxLng = c.longitude;
  }
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * padding, 0.01),
    longitudeDelta: Math.max((maxLng - minLng) * padding, 0.01),
  };
}

/** Great-circle distance between two points in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Driver earnings: base fare + per-km rate, rounded to whole SAR. */
export function computeEarnings(distanceKm: number): number {
  const BASE = 10;
  const PER_KM = 3;
  return Math.round(BASE + distanceKm * PER_KM);
}

/** Rough urban riding pace: ~3 min per km, never less than a minute. */
export function etaMinutesForKm(km: number): number {
  return Math.max(1, Math.round(km * 3));
}

export interface DriverStage {
  key: OrderStatus;
  label: string;
  short: string;
}

/** The driver-facing stages, in order, from acceptance to delivery. */
export const DRIVER_STAGES: DriverStage[] = [
  { key: 'accepted', label: 'Order accepted', short: 'Accepted' },
  { key: 'driving_to_restaurant', label: 'Heading to restaurant', short: 'To restaurant' },
  { key: 'arrived_at_restaurant', label: 'At the restaurant', short: 'Arrived' },
  { key: 'meal_collected', label: 'Meal collected', short: 'Collected' },
  { key: 'driving_to_customer', label: 'Heading to customer', short: 'To customer' },
  { key: 'delivered', label: 'Delivered', short: 'Delivered' },
];

export type CustomerStage = 'verifying' | 'cooking' | 'driver' | 'delivering' | 'delivered';

/** Map the unified order status to the customer-facing 5-stage tracker. */
export function customerStageFromStatus(status: OrderStatus): CustomerStage {
  switch (status) {
    case 'verifying':
      return 'verifying';
    case 'cooking':
      return 'cooking';
    case 'accepted':
    case 'driving_to_restaurant':
    case 'arrived_at_restaurant':
    case 'meal_collected':
      return 'driver';
    case 'driving_to_customer':
      return 'delivering';
    case 'delivered':
      return 'delivered';
    // Screens branch on `cancelled` before mapping; this keeps the switch total.
    case 'cancelled':
      return 'verifying';
    default:
      return 'verifying';
  }
}

/**
 * True when an order is in the pool a driver can accept. Orders only become
 * visible to drivers once the restaurant has confirmed them (`cooking`).
 */
export function isAvailableForDriver(status: OrderStatus): boolean {
  return status === 'cooking';
}
