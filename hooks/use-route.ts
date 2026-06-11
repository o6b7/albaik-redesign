import { LatLng, haversineKm } from '@/constants/delivery';
import { useEffect, useMemo, useState } from 'react';

export interface RoadRoute {
  coords: LatLng[];
  distanceKm: number;
  durationMin: number;
}

// Routes never change for a given from/to pair, so cache for the app session.
const routeCache = new Map<string, RoadRoute>();

function keyFor(from: LatLng, to: LatLng) {
  return `${from.latitude},${from.longitude}|${to.latitude},${to.longitude}`;
}

/**
 * Road-following route between two points via the public OSRM server, so the
 * map polyline hugs actual streets instead of cutting across blocks. Falls
 * back to the provided waypoints when offline or the request fails.
 */
export function useRoute(from: LatLng, to: LatLng, fallback: LatLng[]): RoadRoute {
  const key = keyFor(from, to);
  const [fetched, setFetched] = useState<RoadRoute | null>(routeCache.get(key) ?? null);

  useEffect(() => {
    const cached = routeCache.get(key);
    if (cached) {
      setFetched(cached);
      return;
    }
    let active = true;
    (async () => {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
          `?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        const route = json?.routes?.[0];
        const coordinates: [number, number][] | undefined = route?.geometry?.coordinates;
        if (!coordinates || coordinates.length < 2) return;
        const result: RoadRoute = {
          coords: coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng })),
          distanceKm: route.distance / 1000,
          durationMin: route.duration / 60,
        };
        routeCache.set(key, result);
        if (active) setFetched(result);
      } catch {
        // offline / server down — the hand-drawn fallback waypoints are used
      }
    })();
    return () => {
      active = false;
    };
  }, [key]);

  return useMemo(
    () =>
      fetched ?? {
        coords: fallback,
        distanceKm: haversineKm(from, to),
        durationMin: 0,
      },
    [fetched, fallback]
  );
}
