import { boundary, ponds } from '@/data/layout';
import { bbox, distToPolyline, pointInPoly, smoothstep, lerp, type Pt } from './geo';
export const WATER_Y = -.04;
const pondBox = ponds.map(p => bbox(p.poly, 2));
const inBox = (b: readonly number[], x: number, y: number) => x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];
const noise = (x: number, y: number) => (Math.sin(x * 1.3 + 1.7 * Math.sin(y * .9)) + Math.sin(y * 1.1 + 1.3 * Math.cos(x * .7)) + Math.sin((x + y) * .45)) / 3;
export const insideVenue = (p: Pt) => pointInPoly(p, boundary);
/** Pond index containing the point, or -1. */
export function pondAt(p: Pt) { for (let i = 0; i < ponds.length; i++) if (inBox(pondBox[i], p[0], p[1]) && pointInPoly(p, ponds[i].poly)) return i; return -1; }
/** Depth of water below the shoreline (0 on land). Islands count as land. */
export function waterDepth(p: Pt) {
  const i = pondAt(p); if (i < 0) return 0;
  const isl = ponds[i].islands.some(s => Math.hypot(p[0] - s.c[0], p[1] - s.c[1]) < s.r * .8);
  return isl ? 0 : smoothstep(0, 9, distToPolyline(p, ponds[i].poly, true));
}
export function heightAt(gx: number, gy: number) {
  const p: Pt = [gx, gy], n = noise(gx * .02, gy * .02);
  let h: number;
  if (insideVenue(p)) h = n * .006; else h = smoothstep(8, 130, distToPolyline(p, boundary, true)) * (.1 + .16 * (n * .5 + .5)) + n * .006;
  const i = pondAt(p);
  if (i >= 0) {
    h -= smoothstep(0, 9, distToPolyline(p, ponds[i].poly, true)) * .11;
    for (const s of ponds[i].islands) { const w = 1 - smoothstep(s.r * .55, s.r, Math.hypot(gx - s.c[0], gy - s.c[1])); if (w > 0) h = lerp(h, .045, w); }
  }
  return h;
}
const hex = (s: string) => [parseInt(s.slice(1, 3), 16) / 255, parseInt(s.slice(3, 5), 16) / 255, parseInt(s.slice(5, 7), 16) / 255] as const;
const C = { lawn: hex('#9cc45f'), lawn2: hex('#86b556'), field: hex('#63a04b'), field2: hex('#4f8d43'), sand: hex('#dccb9a'), plaza: hex('#d9c9a0'), mud: hex('#8a7a55') };
const mix = (a: readonly number[], b: readonly number[], t: number) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/** Vertex colour for the ground: lawns, outer meadow, sandy shores and plazas around heritage sites. */
export function groundColor(gx: number, gy: number, h: number, plazaDist: number) {
  const n = noise(gx * .07, gy * .07) * .5 + .5, inside = insideVenue([gx, gy]);
  let c = inside ? mix(C.lawn, C.lawn2, n) : mix(C.field, C.field2, n);
  c = mix(c, C.plaza, 1 - smoothstep(14, 30, plazaDist));
  c = mix(c, C.sand, 1 - smoothstep(-.03, .012, h));
  c = mix(c, C.mud, smoothstep(-.06, -.12, h) * .8);
  return c;
}
