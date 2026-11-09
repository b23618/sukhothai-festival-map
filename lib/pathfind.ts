import { roads, bridges } from '@/data/layout';
import type { Pt } from './geo';
const STEP = 4, LINK = 4.5, MAX_STUB = 70;
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
interface Graph { nodes: Pt[]; adj: [number, number][][] }
let cache: Graph | null = null;
/** Walking graph from OSM roads/paths (densified) plus bridges; crossing polylines are linked where nodes lie within LINK cells. */
function graph(): Graph {
  if (cache) return cache;
  const nodes: Pt[] = [], adj: [number, number][][] = [], owner: number[] = [];
  const add = (p: Pt, o: number) => { nodes.push(p); adj.push([]); owner.push(o); return nodes.length - 1; };
  const edge = (i: number, j: number) => { const d = dist(nodes[i], nodes[j]); adj[i].push([j, d]); adj[j].push([i, d]); };
  const polys: Pt[][] = [...roads.map(r => r.pts), ...bridges.map(b => [b.a, b.b] as Pt[])];
  polys.forEach((pts, o) => {
    let prev = -1;
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k], b = pts[k + 1], n = Math.max(1, Math.ceil(dist(a, b) / STEP));
      for (let s = k === 0 ? 0 : 1; s <= n; s++) { const t = s / n, i = add([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], o); if (prev >= 0) edge(prev, i); prev = i; }
    }
  });
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) if (owner[i] !== owner[j] && dist(nodes[i], nodes[j]) <= LINK) edge(i, j);
  return (cache = { nodes, adj });
}
const nearest = (g: Graph, p: Pt) => { let bi = -1, bd = Infinity; g.nodes.forEach((n, i) => { const d = dist(n, p); if (d < bd) { bd = d; bi = i; } }); return { i: bi, d: bd }; };
/** Walking route in grid coords along roads/paths; falls back to a straight line when no connected route exists. */
export function walkRoute(a: Pt, b: Pt): { pts: Pt[]; onPaths: boolean } {
  const straight = { pts: [a, b], onPaths: false }, g = graph();
  if (!g.nodes.length) return straight;
  const s = nearest(g, a), e = nearest(g, b);
  if (s.d > MAX_STUB || e.d > MAX_STUB) return straight;
  const D = new Array(g.nodes.length).fill(Infinity), P = new Array(g.nodes.length).fill(-1), done = new Array(g.nodes.length).fill(false);
  D[s.i] = 0;
  for (;;) {
    let u = -1; for (let i = 0; i < D.length; i++) if (!done[i] && D[i] < Infinity && (u < 0 || D[i] < D[u])) u = i;
    if (u < 0 || u === e.i) break;
    done[u] = true;
    for (const [v, w] of g.adj[u]) if (D[u] + w < D[v]) { D[v] = D[u] + w; P[v] = u; }
  }
  if (D[e.i] === Infinity) return straight;
  const path: Pt[] = []; for (let i = e.i; i >= 0; i = P[i]) path.push(g.nodes[i]);
  path.reverse();
  return { pts: [a, ...path, b], onPaths: true };
}
