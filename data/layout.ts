import { type Pt } from '@/lib/geo';
import { osmBridges, osmPonds, osmRoads } from './osm';
// All coordinates are LAYOUT-GRID values (1000x705). They are hand-approximated from the official venue plan and are
// NOT surveyed, GPS-derived or to scale. Treat every shape here as a prototype approximation.
/** Convex hull (padded 30 cells) of the official activity/landmark GPS points. NOT a surveyed fence line. */
export const boundary: Pt[] = [[109, 366], [108, 341], [287, 62], [430, 134], [590, 369], [396, 609], [151, 436]];
export interface Pond { id: string; raw: Pt[]; poly: Pt[]; islands: { c: Pt; r: number }[] }
export const ponds: Pond[] = osmPonds.map(o => ({ id: o.id, raw: o.poly, poly: o.poly, islands: o.islands })); // real outlines: OpenStreetMap (ODbL)
export interface Road { id: string; pts: Pt[]; width: number; kind: 'road' | 'path' }
export const roads: Road[] = osmRoads.map(r => ({ ...r }));
export interface Bridge { id: string; a: Pt; b: Pt; width: number }
export const bridges: Bridge[] = osmBridges.map((b, i) => ({ id: `ob${i}`, a: b.a, b: b.b, width: b.w }));
// Extra heritage seen in OpenStreetMap but not in the A-H legend. Centres from OSM (ODbL): Wat Si Sawai wall (~108x99 m), Wat Traphang Thong main chedi.
export const scenery: { id: string; model: 'si-sawai' | 'island-chedi'; c: Pt; height: number }[] = [
  { id: 'scenery-si-sawai', model: 'si-sawai', c: [270,536], height: 26 },
  { id: 'scenery-traphang-thong', model: 'island-chedi', c: [546,378], height: 16 },
];
