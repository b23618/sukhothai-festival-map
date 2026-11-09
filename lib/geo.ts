// Layout grid = the 1000x705 coordinate space used to author the venue layout (originally measured on the
// official venue plan, which is NOT shipped in the production scene). World units are scene units (y up, z south).
export type Pt = [number, number];
export const GRID_W = 1000, GRID_H = 705, WORLD_W = 20, WORLD_H = 14.1;
export const GRID_UNIT = WORLD_W / GRID_W; // world units per grid cell (0.02)
export const toWorld = (gx: number, gy: number): Pt => [(gx / GRID_W - .5) * WORLD_W, (gy / GRID_H - .5) * WORLD_H];
export const toGrid = (x: number, z: number): Pt => [Math.round((x / WORLD_W + .5) * GRID_W), Math.round((z / WORLD_H + .5) * GRID_H)];
export const smoothstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export function mulberry32(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function hashString(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function pointInPoly(p: Pt, poly: Pt[]) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) c = !c; } return c; }
export function distToSegment(p: Pt, a: Pt, b: Pt) { const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy; const t = l ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); }
export function distToPolyline(p: Pt, line: Pt[], closed = false) { let d = Infinity; const n = line.length; for (let i = 0; i < n - (closed ? 0 : 1); i++) d = Math.min(d, distToSegment(p, line[i], line[(i + 1) % n])); return d; }
export function bbox(poly: Pt[], pad = 0) { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const [x, y] of poly) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a - pad, b - pad, c + pad, d + pad] as const; }
function cr(p0: number, p1: number, p2: number, p3: number, t: number) { return .5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t); }
export function smoothClosed(poly: Pt[], per = 6): Pt[] { const n = poly.length, out: Pt[] = []; for (let i = 0; i < n; i++) { const a = poly[(i - 1 + n) % n], b = poly[i], c = poly[(i + 1) % n], d = poly[(i + 2) % n]; for (let k = 0; k < per; k++) { const t = k / per; out.push([cr(a[0], b[0], c[0], d[0], t), cr(a[1], b[1], c[1], d[1], t)]); } } return out; }
export function smoothOpen(pts: Pt[], per = 8): Pt[] { if (pts.length < 3) return pts; const out: Pt[] = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[i + 1], d = pts[Math.min(pts.length - 1, i + 2)]; for (let k = 0; k < per; k++) { const t = k / per; out.push([cr(a[0], b[0], c[0], d[0], t), cr(a[1], b[1], c[1], d[1], t)]); } } out.push(pts[pts.length - 1]); return out; }
export const circlePoly = (c: Pt, r: number, n = 12): Pt[] => Array.from({ length: n }, (_, i) => [c[0] + Math.cos(i / n * Math.PI * 2) * r, c[1] + Math.sin(i / n * Math.PI * 2) * r] as Pt);
// Diorama extent (layout-grid -> world). Covers the venue plus a landscape margin; the plan's legend panel is excluded.
export const BOUNDS_GRID = { x0: -30, x1: 610, y0: 20, y1: 610 };
export const BOUNDS = { x0: (BOUNDS_GRID.x0 / GRID_W - .5) * WORLD_W, x1: (BOUNDS_GRID.x1 / GRID_W - .5) * WORLD_W, z0: (BOUNDS_GRID.y0 / GRID_H - .5) * WORLD_H, z1: (BOUNDS_GRID.y1 / GRID_H - .5) * WORLD_H };
export const CENTER: Pt = [(BOUNDS.x0 + BOUNDS.x1) / 2, (BOUNDS.z0 + BOUNDS.z1) / 2];
// Real-world scale: the plan is ~to scale (see georef.ts): 1 grid cell ~ 2.64 m, so 1 world unit ~ 132 m.
export const METER = GRID_UNIT / 2.64, GRID_PER_M = 1 / 2.64;
/** Vertical exaggeration applied to heritage models so 20–30 m monuments stay legible next to 200 m footprints. */
export const VEXAG = 1.8;
