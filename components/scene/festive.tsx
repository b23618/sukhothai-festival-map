'use client';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { osmBuildings, osmRuins } from '@/data/osm';
import { ponds, roads } from '@/data/layout';
import { allInitialPoints } from '@/data/points';
import { CENTER, distToPolyline, mulberry32, toWorld, type Pt } from '@/lib/geo';
import { geoToGrid } from '@/lib/georef';
import { WATER_Y, heightAt, pondAt } from '@/lib/terrain';
import { glowMaterials } from './materials';
import { useMapStore } from '@/store/useMapStore';
// Decorative Loy Krathong layer. Krathong / khom loi are drawn larger than life so they read at map scale. These are generic festival
// symbols, NOT documented installations of the 2569 event (only the royal-flame ceremony, held outside the park, is an official activity).
const flame = new THREE.MeshBasicMaterial({ color: '#ffb23a', toneMapped: false });
const bodyMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8, emissive: '#ff9a3a', emissiveIntensity: 0 });
const paper = new THREE.MeshStandardMaterial({ color: '#ffd9a0', emissive: '#ff8c3a', emissiveIntensity: .6, roughness: .7, side: THREE.DoubleSide });
glowMaterials.push(paper);
type Part = { g: THREE.BufferGeometry; c: string; p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number] };
function merge(parts: Part[]) {
  const gs = parts.map(({ g, c, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1] }) => { const x = g.clone().toNonIndexed(); x.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s)));
    const col = new THREE.Color(c), n = x.attributes.position.count, arr = new Float32Array(n * 3); for (let i = 0; i < n; i++) { arr[i * 3] = col.r; arr[i * 3 + 1] = col.g; arr[i * 3 + 2] = col.b; } x.setAttribute('color', new THREE.BufferAttribute(arr, 3)); x.deleteAttribute('uv'); return x; });
  return mergeGeometries(gs)!;
}
/** Lotus-petal krathong on a banana-trunk disc with candle and incense (unit size ~ 1). Returns body (lit) and flame geometries. */
function krathongGeo() {
  const petal = new THREE.ConeGeometry(.09, .3, 5), parts: Part[] = [{ g: new THREE.CylinderGeometry(.42, .42, .14, 16), c: '#d9d28a', p: [0, .07, 0] }, { g: new THREE.CylinderGeometry(.34, .36, .05, 16), c: '#3f8f45', p: [0, .16, 0] }];
  for (let ring = 0; ring < 2; ring++) for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + ring * .35, r = ring ? .19 : .3, t = ring ? .85 : 1.15; parts.push({ g: petal, c: ring ? '#fff2f6' : '#f08fb0', p: [Math.cos(a) * r, .3 + ring * .1, Math.sin(a) * r], r: [Math.sin(a) * t, 0, -Math.cos(a) * t] }); }
  parts.push({ g: new THREE.CylinderGeometry(.05, .05, .3, 8), c: '#fff6e2', p: [0, .36, 0] });
  for (let i = 0; i < 3; i++) { const a = i * 2.1; parts.push({ g: new THREE.CylinderGeometry(.008, .008, .5, 4), c: '#7a4a2a', p: [Math.cos(a) * .1, .5, Math.sin(a) * .1], r: [Math.sin(a) * .3, 0, -Math.cos(a) * .3] }); }
  return { body: merge(parts), flame: new THREE.ConeGeometry(.045, .13, 6).translate(0, .58, 0) };
}
/** Fixed-seed random spots on water, away from island shores. */
function pondSpots(n: number, seed: number) {
  const r = mulberry32(seed), out: { x: number; z: number; ph: number; s: number }[] = [];
  for (let t = 0; t < 20000 && out.length < n; t++) { const gx = 60 + r() * 480, gy = 100 + r() * 460, i = pondAt([gx, gy]); if (i < 0 || ponds[i].islands.some(s => Math.hypot(gx - s.c[0], gy - s.c[1]) < s.r + 8)) continue; const [x, z] = toWorld(gx, gy); out.push({ x, z, ph: r() * 6.28, s: .7 + r() * .6 }); }
  return out;
}
/** Krathong floating on the ponds, with flickering candle flames. */
function KrathongFleet() {
  const g = useMemo(krathongGeo, []), spots = useMemo(() => pondSpots(90, 88), []), a = useRef<THREE.InstancedMesh>(null), b = useRef<THREE.InstancedMesh>(null), time = useMapStore(s => s.time);
  useFrame(st => { const t = st.clock.elapsedTime, o = new THREE.Object3D(); spots.forEach((f, i) => { o.position.set(f.x + Math.sin(t * .25 + f.ph) * .03, WATER_Y + .004 + Math.sin(t * 1.3 + f.ph) * .003, f.z + Math.cos(t * .21 + f.ph) * .03); o.rotation.set(Math.sin(t + f.ph) * .03, f.ph + t * .08, 0); o.scale.setScalar(.075 * f.s); o.updateMatrix(); a.current!.setMatrixAt(i, o.matrix); b.current!.setMatrixAt(i, o.matrix); }); a.current!.instanceMatrix.needsUpdate = true; b.current!.instanceMatrix.needsUpdate = true; flame.color.setScalar(.85 + Math.sin(t * 9) * .08 + Math.sin(t * 13.7) * .07).multiply(new THREE.Color('#ffb23a')); bodyMat.emissiveIntensity = time === 'night' ? .25 : time === 'golden' ? .1 : 0; });
  return <>
    <instancedMesh ref={a} args={[g.body, bodyMat, spots.length]} frustumCulled={false} castShadow /><instancedMesh ref={b} args={[g.flame, flame, spots.length]} frustumCulled={false} />
  </>;
}
/** Khom loi (sky lanterns) drifting up over the park; brighter at night. */
function KhomLoi() {
  const ref = useRef<THREE.InstancedMesh>(null), fl = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => { const r = mulberry32(31); return Array.from({ length: 70 }, () => ({ x: CENTER[0] + (r() - .5) * 15, z: CENTER[1] + (r() - .5) * 11, y: r() * 7, v: .12 + r() * .14, s: .8 + r() * .5, ph: r() * 6.28 })); }, []);
  const body = useMemo(() => new THREE.CylinderGeometry(.55, .38, 1, 10, 1, true), []), fg = useMemo(() => new THREE.SphereGeometry(.2, 6, 5).translate(0, -.45, 0), []);
  useFrame(st => { const t = st.clock.elapsedTime, o = new THREE.Object3D(); items.forEach((l, i) => { const y = .5 + ((l.y + t * l.v) % 7); o.position.set(l.x + Math.sin(t * .18 + l.ph) * .25 + y * .05, y, l.z + Math.cos(t * .15 + l.ph) * .15); o.rotation.set(0, l.ph, Math.sin(t + l.ph) * .05); o.scale.setScalar(.06 * l.s); o.updateMatrix(); ref.current!.setMatrixAt(i, o.matrix); fl.current!.setMatrixAt(i, o.matrix); }); ref.current!.instanceMatrix.needsUpdate = true; fl.current!.instanceMatrix.needsUpdate = true; });
  return <group><instancedMesh ref={ref} args={[body, paper, items.length]} frustumCulled={false} /><instancedMesh ref={fl} args={[fg, flame, items.length]} frustumCulled={false} /></group>;
}
/** Free grid spot near `from`: on land, off roads, ruins, buildings and other points. */
function freeSpot(from: Pt, skip: Pt[]): Pt {
  const pts = allInitialPoints.map(p => [p.x, p.y] as Pt), sites = [...osmRuins, ...osmBuildings].map(f => f.pts[0]);
  for (let rad = 0; rad < 200; rad += 6) for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283, p: Pt = [from[0] + Math.cos(a) * rad, from[1] + Math.sin(a) * rad]; if (pondAt(p) >= 0 || roads.some(r => distToPolyline(p, r.pts) < r.width / 2 + 10) || pts.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 18) || sites.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 14) || skip.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 14)) continue; return p; }
  return from;
}
/** Giant lotus krathong sculpture + a ceremonial flame bowl (echoing the royal-flame ceremony). Decorative stand-ins. */
function Symbols() {
  const g = useMemo(krathongGeo, []), spots = useMemo(() => { const k = freeSpot([300, 330], []), f = freeSpot([k[0] + 22, k[1] + 4], [k]); return { k, f }; }, []);
  const [kx, kz] = toWorld(...spots.k), [fx, fz] = toWorld(...spots.f), ky = heightAt(...spots.k), fy = heightAt(...spots.f), fr = useRef<THREE.Mesh>(null);
  useFrame(st => { const t = st.clock.elapsedTime; if (fr.current) { fr.current.scale.set(1 + Math.sin(t * 8) * .08, 1 + Math.sin(t * 11) * .15, 1 + Math.sin(t * 9.3) * .08); } });
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d8c8a0', roughness: .9 }), []);
  return <>
    <group position={[kx, ky, kz]}><mesh position={[0, .09, 0]} material={stone} castShadow><cylinderGeometry args={[.32, .38, .18, 12]} /></mesh><group position={[0, .18, 0]} scale={.4}><mesh geometry={g.body} material={bodyMat} castShadow /><mesh geometry={g.flame} material={flame} /></group></group>
    <group position={[fx, fy, fz]}><mesh position={[0, .12, 0]} material={stone} castShadow><cylinderGeometry args={[.07, .12, .24, 10]} /></mesh><mesh position={[0, .3, 0]} material={stone} castShadow><cylinderGeometry args={[.17, .07, .12, 12]} /></mesh><mesh ref={fr} position={[0, .42, 0]} material={flame}><coneGeometry args={[.08, .24, 8]} /></mesh></group>
  </>;
}
/** Firework shells: rocket climbs, bursts into ~100 fading sparks that fall under gravity. Night only. */
const dot = (() => { if (typeof document === 'undefined') return null; const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d')!, g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, '#fff'); g.addColorStop(.35, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })();
const SHELLS = 9, SPARKS = 90, CYCLE = 8, RISE = 1.1, BURN = 2.8, COLORS = ['#ff4d4d', '#ffd24a', '#4dd2ff', '#7dff6a', '#ff7be0', '#ffffff', '#ff9a3a'];
function Fireworks() {
  const ref = useRef<THREE.Points>(null);
  const shells = useMemo(() => { const r = mulberry32(2569); return Array.from({ length: SHELLS }, (_, i) => {
    const col = new THREE.Color(COLORS[i % COLORS.length]), dirs = Array.from({ length: SPARKS }, () => { const u = r() * 2 - 1, a = r() * 6.283, q = Math.sqrt(1 - u * u), sp = .5 + r() * .9; return [q * Math.cos(a) * sp, u * sp, q * Math.sin(a) * sp] as const; });
    return { x: CENTER[0] + (r() - .5) * 11, z: CENTER[1] + (r() - .5) * 7 - 1, h: 3.2 + r() * 2.2, off: r() * CYCLE, col, dirs }; }); }, []);
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(), n = SHELLS * (SPARKS + 1); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); return g; }, []);
  useFrame(st => { const pos = geo.attributes.position as THREE.BufferAttribute, col = geo.attributes.color as THREE.BufferAttribute; let k = 0;
    for (const s of shells) { const ph = (st.clock.elapsedTime + s.off) % CYCLE;
      // rocket
      if (ph < RISE) { const t = ph / RISE; pos.setXYZ(k, s.x, 0.4 + (s.h - .4) * (1 - (1 - t) ** 2), s.z); col.setXYZ(k, 1, .8, .5); } else { pos.setXYZ(k, 0, -50, 0); }
      k++;
      const e = ph - RISE, on = e >= 0 && e < BURN, fade = on ? Math.max(0, 1 - e / BURN) ** 1.5 : 0;
      for (const d of s.dirs) { if (on) { pos.setXYZ(k, s.x + d[0] * e * 1.5, s.h + d[1] * e * 1.5 - .5 * e * e, s.z + d[2] * e * 1.5); col.setXYZ(k, s.col.r * fade, s.col.g * fade, s.col.b * fade); } else pos.setXYZ(k, 0, -50, 0); k++; } }
    pos.needsUpdate = true; col.needsUpdate = true; });
  return <points ref={ref} geometry={geo} frustumCulled={false}><pointsMaterial size={.28} map={dot} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation toneMapped={false} /></points>;
}
/** Giant krathong + flame bowl always; krathong fleet, sky lanterns and fireworks only at night (real clock after 19:00, or the night button). */
export function Festive() { const night = useMapStore(s => s.time === 'night'); return <><Symbols />{night && <><KrathongFleet /><KhomLoi /><Fireworks /></>}</>; }
/** Blue "you are here" marker at the visitor's GPS position (only when it falls inside the diorama). */
export function UserDot() {
  const pos = useMapStore(s => s.userPos), ref = useRef<THREE.Mesh>(null);
  useFrame(st => { if (ref.current) { const k = 1 + (st.clock.elapsedTime % 1.6) * .9; ref.current.scale.set(k, k, 1); (ref.current.material as THREE.MeshBasicMaterial).opacity = .55 * (1 - (st.clock.elapsedTime % 1.6) / 1.6); } });
  if (!pos) return null;
  const g = geoToGrid(pos.lat, pos.lng); if (g[0] < -30 || g[0] > 610 || g[1] < 20 || g[1] > 610) return null;
  const [x, z] = toWorld(...g), y = Math.max(heightAt(...g), WATER_Y) + .03;
  return <group position={[x, y, z]}><mesh position={[0, .16, 0]} renderOrder={9}><sphereGeometry args={[.07, 16, 12]} /><meshBasicMaterial color="#2b7bff" depthTest={false} /></mesh><mesh position={[0, .16, 0]} renderOrder={8}><sphereGeometry args={[.1, 16, 12]} /><meshBasicMaterial color="#ffffff" depthTest={false} /></mesh><mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} renderOrder={7}><ringGeometry args={[.1, .13, 32]} /><meshBasicMaterial color="#2b7bff" transparent depthTest={false} /></mesh></group>;
}
