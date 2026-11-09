import type { Point } from '@/data/points';
import { geoToGrid, gridToGeo } from './georef';
import { bearingDeg, haversineM, type Geo } from './googleMaps';
import type { Pt } from './geo';
/** Route endpoint id meaning "the visitor's current GPS position". */
export const ME = 'me';
export interface UserPos { lat: number; lng: number; acc: number }
export const geoOf = (p: Point): Geo => p.geo ?? gridToGeo(p.x, p.y);
export interface End { geo: Geo; grid: Pt; exact: boolean }
/** Resolve a route endpoint id (a point id or ME). `exact` is false for points without official GPS (estimated from the grid). */
export function endpoint(id: string | null, points: Point[], user: UserPos | null): End | null {
  if (!id) return null;
  if (id === ME) return user ? { geo: user, grid: geoToGrid(user.lat, user.lng), exact: true } : null;
  const p = points.find(q => q.id === id); return p ? { geo: geoOf(p), grid: [p.x, p.y], exact: !!p.geo } : null;
}
/** Straight line metres, bearing and walking minutes (detour factor 1.3, 75 m/min). */
export function walkInfo(a: Geo, b: Geo) { const d = haversineM(a, b); return { d, brg: bearingDeg(a, b), walkMin: Math.max(1, Math.round(d * 1.3 / 75)) }; }
export const WALK_LIMIT_M = 5000;
/** Nearest other points to a place (any category), by straight-line distance. */
export function nearestPoints(from: Geo, points: Point[], skipId: string | null, n = 6) {
  return points.filter(p => p.id !== skipId).map(p => ({ p, ...walkInfo(from, geoOf(p)) })).sort((a, b) => a.d - b.d).slice(0, n);
}
export const fmtDist = (d: number, m: string, km: string) => d >= 1000 ? `${(d / 1000).toFixed(2)} ${km}` : `${Math.round(d)} ${m}`;
