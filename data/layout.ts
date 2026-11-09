import { type Pt } from '@/lib/geo';
import { osmBridges, osmPonds, osmRoads } from './osm';
// All coordinates are LAYOUT-GRID values (1000x705). They are hand-approximated from the official venue plan and are
// NOT surveyed, GPS-derived or to scale. Treat every shape here as a prototype approximation.
/** Convex hull (padded 30 cells) of the official activity/landmark GPS points. NOT a surveyed fence line. */
export const boundary: Pt[] = [[109, 366], [108, 341], [287, 62], [430, 134], [590, 369], [396, 609], [151, 436]];
export interface Pond { id: string; raw: Pt[]; poly: Pt[]; islands: { c: Pt; r: number }[] }
export const ponds: Pond[] = osmPonds.map(o => ({ id: o.id, raw: o.poly, poly: o.poly, islands: o.islands })); // real outlines: OpenStreetMap (ODbL)
export interface Road { id: string; pts: Pt[]; width: number; kind: 'road' | 'path'; ref?: string }
export const roads: Road[] = osmRoads.map(r => ({ ...r }));
export interface Bridge { id: string; a: Pt; b: Pt; width: number }
export const bridges: Bridge[] = osmBridges.map((b, i) => ({ id: `ob${i}`, a: b.a, b: b.b, width: b.w }));
// Extra heritage seen in OpenStreetMap but not in the A-H legend. Centres from OSM (ODbL): Wat Si Sawai wall (~108x99 m), Wat Traphang Thong main chedi.
export const scenery: { id: string; model: 'si-sawai' | 'island-chedi'; c: Pt; height: number }[] = [
  { id: 'scenery-si-sawai', model: 'si-sawai', c: [270,536], height: 26 },
  { id: 'scenery-traphang-thong', model: 'island-chedi', c: [546,378], height: 16 },
];

/** Where the road network leaves the mapped area. Destinations come from OSM route relations (12: Mae Sot bridge - Mukdahan, 102: Uttaradit - Mueang Kao) plus the
 *  well-known fact that Highway 12 runs Tak - Sukhothai - Phitsanulok; roads with no known destination keep `dest: null` (never guessed). */
export interface Gateway { id: string; ref: string; c: Pt; dir: 'N' | 'E' | 'S' | 'W'; dest: string | null }
const CEN: Pt = [300, 340], DEST: Record<string, string> = { '102-N': 'uttaradit', '12-W': 'tak', '12-E': 'phitsanulok' };
export const gateways: Gateway[] = (() => {
  const out: Gateway[] = [];
  for (const r of roads) { if (!r.ref) continue; for (const e of [r.pts[0], r.pts[r.pts.length - 1]]) {
    const dx = e[0] - CEN[0], dy = e[1] - CEN[1]; if (Math.hypot(dx, dy) < 280 || out.some(g => Math.hypot(g.c[0] - e[0], g.c[1] - e[1]) < 40)) continue;
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N');
    out.push({ id: `${r.ref}-${dir}`, ref: r.ref, c: e, dir, dest: DEST[`${r.ref}-${dir}`] ?? null }); } }
  return out;
})();
