import * as THREE from 'three';
import { toWorld, type Pt } from './geo';
import { heightAt } from './terrain';
/** Flat ribbon that follows the terrain. pts/width are in layout-grid units. yFn overrides height (bridges). */
export function ribbonGeometry(pts: Pt[], width: number, lift: number, o: { closed?: boolean; yFn?: (i: number, side: number, gx: number, gy: number) => number } = {}) {
  const n = pts.length, pos: number[] = [], idx: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[o.closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[o.closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    for (const s of [1, -1]) {
      const gx = pts[i][0] - ty * width / 2 * s, gy = pts[i][1] + tx * width / 2 * s, [x, z] = toWorld(gx, gy);
      pos.push(x, (o.yFn ? o.yFn(i, s, gx, gy) : heightAt(gx, gy)) + lift, z);
    }
  }
  const last = o.closed ? n : n - 1;
  for (let i = 0; i < last; i++) { const j = (i + 1) % n, a = i * 2, b = i * 2 + 1, c = j * 2, d = j * 2 + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
