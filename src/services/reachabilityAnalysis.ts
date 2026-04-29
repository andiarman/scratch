import * as turf from '@turf/turf';
import type { MarkerData, BBox } from '../types';
import type { AdminArea, ReachabilityResult } from '../stores/analysisStore';
import type { TransportMode } from '../stores/settingsStore';

export function analyzeMarkerReachability(
  marker: MarkerData,
  adminAreas: AdminArea[],
  transportModes: TransportMode[]
): ReachabilityResult[] {
  if (adminAreas.length === 0) return [];

  const markerPoint = turf.point([marker.lng, marker.lat]);

  return adminAreas.map(area => {
    const areaPoint = turf.point([area.centerLng, area.centerLat]);
    const dist = turf.distance(markerPoint, areaPoint, { units: 'kilometers' });

    const modes = transportModes.map(mode => ({
      modeId: mode.id,
      reachable: dist <= mode.maxDistanceKm,
    }));

    return {
      adminArea: area,
      distanceKm: Math.round(dist * 100) / 100,
      modes,
    };
  });
}

export function getMarkerBBox(marker: MarkerData, radiusKm: number): BBox {
  // Convert km to approximate degrees (1 degree ≈ 111km)
  const pad = radiusKm / 111;
  return {
    south: marker.lat - pad,
    west: marker.lng - pad,
    north: marker.lat + pad,
    east: marker.lng + pad,
  };
}
