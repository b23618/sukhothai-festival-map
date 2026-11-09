'use client';
import { createContext, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { METER, VEXAG, mulberry32, toWorld } from '@/lib/geo';
import { WATER_Y, heightAt } from '@/lib/terrain';
import { M, brick } from './materials';
// ALL dimensions in this file are METRES (local x = east, z = south, y = up). The parent group scales them to world units,
// so footprints are close to real size (see lib/geo.ts METER) while heights are exaggerated by VEXAG.
// Figures marked (src) come from published descriptions (Wikipedia th/en, tourism pages); the rest is plausible filler.
type V3 = [number, number, number];
/** Ground height (in local metres, relative to the model origin) at a local x/z offset. Walls and mounds follow terrain with it. */
export const GroundCtx = createContext<(lx: number, lz: number) => number>(() => 0);
const water = new THREE.MeshStandardMaterial({ color: '#2f8f9a', roughness: .3, metalness: .1 });
const earth = new THREE.MeshStandardMaterial({ color: '#8f8a5a', roughness: 1, flatShading: true });
const lat = new THREE.MeshStandardMaterial({ color: '#9a5a3c', roughness: 1, flatShading: true });
export function Bx({ s, p, m, r }: { s: V3; p: V3; m?: THREE.Material; r?: V3 }) { const mat = useMemo(() => m ?? brick(Math.max(1, s[0] / 4), Math.max(1, s[1] / 3)), [m, s[0], s[1]]); return <mesh position={p} rotation={r} material={mat} castShadow receiveShadow><boxGeometry args={s} /></mesh>; }
const lathe = (pts: [number, number][], seg = 20) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(r, .001), y)), seg);
/** Stack of shrinking square tiers (plinth). */
export function Plinth({ w, d, h, n, inset, m, y0 = 0 }: { w: number; d: number; h: number; n: number; inset: number; m?: THREE.Material; y0?: number }) {
  return <>{Array.from({ length: n }, (_, i) => <Bx key={i} s={[w - inset * 2 * i, h, d - inset * 2 * i]} p={[0, y0 + h * (i + .5), 0]} m={m} />)}</>;
}
export function Stairs({ w, steps, rise, run, p, rotY = 0, m = M.stucco }: { w: number; steps: number; rise: number; run: number; p: V3; rotY?: number; m?: THREE.Material }) {
  return <group position={p} rotation={[0, rotY, 0]}>{Array.from({ length: steps }, (_, i) => <Bx key={i} s={[w, rise * (steps - i), run]} p={[0, rise * (steps - i) / 2, run * (i + .5)]} m={m} />)}</group>;
}
function lotusProfile(R: number, H: number) {
  const p: [number, number][] = [[0, 0]]; let y = 0; const up = (r: number, h: number) => { p.push([r * R, y]); y += h * H; p.push([r * R, y]); };
  up(1, .05); up(.86, .05); up(.72, .045); up(.6, .05); p.push([.4 * R, y]); y += .06 * H; p.push([.4 * R, y]); p.push([.62 * R, y]); y += .02 * H; p.push([.62 * R, y]); p.push([.42 * R, y]);
  for (let i = 1; i <= 14; i++) { const t = i / 14; p.push([R * (.12 + .34 * Math.sin(Math.PI * (.15 + .7 * Math.pow(t, .9)))), y + .3 * H * t]); } y += .3 * H;
  for (let k = 0; k < 6; k++) { const r = .2 - k * .03; p.push([r * R, y]); y += .022 * H; p.push([r * R, y]); p.push([r * .55 * R, y]); } p.push([.01, y + .03 * H]);
  return p;
}
/** Bell (Sri Lankan-style) chedi: two stucco lotus-petal bands at the base, harmika, ringed spire. */
function bellProfile(R: number, H: number, rings = 9) {
  const p: [number, number][] = [[0, 0], [R * 1.08, 0], [R * 1.08, .02 * H], [R * .99, .02 * H], [R * .99, .045 * H], [R * 1.02, .045 * H], [R * 1.02, .065 * H], [R * .96, .065 * H]]; const y0 = .065 * H, hb = .42 * H;
  for (let i = 1; i <= 14; i++) { const t = i / 14; p.push([R * .96 * Math.sqrt(Math.max(0, 1 - Math.pow(t, 2.2))) + .02, y0 + hb * t]); }
  let y = y0 + hb; p.push([.2 * R, y]); y += .035 * H; p.push([.2 * R, y]); p.push([.28 * R, y]); y += .02 * H; p.push([.28 * R, y]);
  for (let k = 0; k < rings; k++) { const r = .17 - k * .016; p.push([r * R, y]); y += .03 * H; p.push([r * R * .82, y]); } p.push([.01, y + .04 * H]);
  return p;
}
export function Lotus({ R, H, m }: { R: number; H: number; m?: THREE.Material }) { const g = useMemo(() => lathe(lotusProfile(R, H)), [R, H]), mat = useMemo(() => m ?? brick(R, H / 3), [m, R, H]); return <mesh geometry={g} material={mat} castShadow receiveShadow />; }
export function Bell({ R, H, m = M.stucco, rings }: { R: number; H: number; m?: THREE.Material; rings?: number }) { const g = useMemo(() => lathe(bellProfile(R, H, rings)), [R, H, rings]); return <mesh geometry={g} material={m} castShadow receiveShadow />; }
/** Khmer-style prang: stepped square tiers narrowing to a rounded top. */
export function Prang({ w, h, m = lat }: { w: number; h: number; m?: THREE.Material }) {
  const n = 4; return <group>{Array.from({ length: n }, (_, i) => { const ww = w * (1 - i * .2), hh = h / (n + 1); return <Bx key={i} s={[ww, hh, ww]} p={[0, hh * (i + .5), 0]} m={m} />; })}<mesh position={[0, h * (n / (n + 1)) + h * .1, 0]} material={m} castShadow><sphereGeometry args={[w * .3, 8, 6]} /></mesh><mesh position={[0, h * .98, 0]} material={M.gold}><coneGeometry args={[w * .03, h * .12, 6]} /></mesh></group>;
}
/** Stepped brick (Mon-style) stupa: square base with N diminishing tiers. */
export function TierStupa({ w, tiers = 5, th = 2 }: { w: number; tiers?: number; th?: number }) { return <Plinth w={w} d={w} h={th} n={tiers} inset={w * .08} />; }
export function Buddha({ H, seated = true, m = M.stucco }: { H: number; seated?: boolean; m?: THREE.Material }) {
  return seated ? <group><Bx s={[H * .8, H * .15, H * .6]} p={[0, H * .075, 0]} m={m} /><mesh position={[0, H * .42, 0]} material={m} castShadow><coneGeometry args={[H * .34, H * .55, 8]} /></mesh><mesh position={[0, H * .78, 0]} material={m} castShadow><sphereGeometry args={[H * .11, 8, 6]} /></mesh><mesh position={[0, H * .92, 0]} material={M.gold}><coneGeometry args={[H * .05, H * .14, 6]} /></mesh></group>
    : <group><mesh position={[0, H * .4, 0]} material={m} castShadow><coneGeometry args={[H * .17, H * .8, 8]} /></mesh><mesh position={[0, H * .88, 0]} material={m} castShadow><sphereGeometry args={[H * .09, 8, 6]} /></mesh></group>;
}
/** Grid of round laterite columns; deterministic broken heights. */
export function Columns({ cols, rows, dx, dz, h, r = .45, seed = 1, p = [0, 0, 0], broken = .35 }: { cols: number; rows: number; dx: number; dz: number; h: number; r?: number; seed?: number; p?: V3; broken?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => { const m = ref.current!, rnd = mulberry32(seed), o = new THREE.Object3D(); let i = 0; for (let a = 0; a < cols; a++) for (let b = 0; b < rows; b++) { const k = 1 - rnd() * broken; o.position.set((a - (cols - 1) / 2) * dx, h * k / 2, (b - (rows - 1) / 2) * dz); o.scale.set(1, k, 1); o.updateMatrix(); m.setMatrixAt(i++, o.matrix); } m.instanceMatrix.needsUpdate = true; }, [cols, rows, dx, dz, h, seed, broken]);
  return <group position={p}><instancedMesh ref={ref} args={[undefined, undefined, cols * rows]} castShadow receiveShadow material={lat}><cylinderGeometry args={[r * .9, r, h, 8]} /></instancedMesh></group>;
}
/** Raised brick terrace with columns (a ruined viharn / ubosot). */
export function Terrace({ w, d, h = 1.5, cols, rows, colH = 6, seed = 1, stairs = 'e', p = [0, 0, 0] as V3 }: { w: number; d: number; h?: number; cols: number; rows: number; colH?: number; seed?: number; stairs?: 'e' | 'w' | 'n' | 's' | ''; p?: V3 }) {
  const rot = { e: -Math.PI / 2, w: Math.PI / 2, n: Math.PI, s: 0, '': 0 }[stairs], off: V3 = stairs === 'e' ? [w / 2, 0, 0] : stairs === 'w' ? [-w / 2, 0, 0] : stairs === 'n' ? [0, 0, -d / 2] : [0, 0, d / 2];
  return <group position={p}><Bx s={[w, h, d]} p={[0, h / 2, 0]} />{stairs && <Stairs w={Math.min(5, d * .4)} steps={3} rise={h / 3} run={1} p={off} rotY={rot} />}<Columns cols={cols} rows={rows} dx={(w - 3) / Math.max(1, cols - 1)} dz={(d - 3) / Math.max(1, rows - 1)} h={colH} seed={seed} p={[0, h, 0]} /></group>;
}
/** Wall/bank along a rectangle that follows the terrain and skips water. */
export function GroundWall({ w, d, t = 1.2, h = 3, step = 5, gap, m = brick(40, 1) }: { w: number; d: number; t?: number; h?: number; step?: number; gap?: { side: 'e' | 'w' | 'n' | 's'; len: number }; m?: THREE.Material }) {
  const ground = useContext(GroundCtx), ref = useRef<THREE.InstancedMesh>(null);
  const segs = useMemo(() => { const out: { x: number; z: number; rot: number }[] = []; const add = (x: number, z: number, rot: number, side: string) => { if (gap && gap.side === side && Math.abs(side === 'e' || side === 'w' ? z : x) < gap.len / 2) return; out.push({ x, z, rot }); };
    for (let x = -w / 2 + step / 2; x < w / 2; x += step) { add(x, -d / 2, 0, 'n'); add(x, d / 2, 0, 's'); } for (let z = -d / 2 + step / 2; z < d / 2; z += step) { add(-w / 2, z, Math.PI / 2, 'w'); add(w / 2, z, Math.PI / 2, 'e'); } return out; }, [w, d, step, gap]);
  useLayoutEffect(() => { const mesh = ref.current!, o = new THREE.Object3D(); let n = 0; for (const s of segs) { const y = ground(s.x, s.z); if (y < -2) continue; o.position.set(s.x, y + h / 2, s.z); o.rotation.set(0, s.rot, 0); o.updateMatrix(); mesh.setMatrixAt(n++, o.matrix); } mesh.count = n; mesh.instanceMatrix.needsUpdate = true; }, [segs, ground, h]);
  return <instancedMesh ref={ref} args={[undefined, undefined, segs.length]} castShadow receiveShadow material={m}><boxGeometry args={[step + .2, h, t]} /></instancedMesh>;
}
/** ~hundreds of small votive chedis scattered inside a compound (instanced). */
function VotiveChedis({ n, area, avoid, seed }: { n: number; area: [number, number]; avoid: [number, number, number, number]; seed: number }) {
  const ref = useRef<THREE.InstancedMesh>(null), ground = useContext(GroundCtx), g = useMemo(() => lathe([[0, 0], [1.2, 0], [1.2, .6], [.9, .6], [.9, 1.4], [.7, 2], [.35, 3.4], [.08, 4.4], [.01, 4.6]], 8), []);
  useLayoutEffect(() => { const r = mulberry32(seed), o = new THREE.Object3D(); let c = 0; for (let t = 0; t < n * 8 && c < n; t++) { const x = (r() - .5) * area[0], z = (r() - .5) * area[1]; if (x > avoid[0] && x < avoid[1] && z > avoid[2] && z < avoid[3]) continue; const y = ground(x, z); if (y < -2) continue; o.position.set(x, y, z); o.scale.setScalar(.8 + r() * .7); o.updateMatrix(); ref.current!.setMatrixAt(c++, o.matrix); } ref.current!.count = c; ref.current!.instanceMatrix.needsUpdate = true; }, [n, area, avoid, seed, ground]);
  return <instancedMesh ref={ref} args={[undefined, undefined, n]} geometry={g} material={M.stucco} castShadow />;
}
const Mondop = ({ p, seated = false }: { p: V3; seated?: boolean }) => <group position={p}><Bx s={[10, 1, 10]} p={[0, .5, 0]} /><Bx s={[1.2, 11, 10]} p={[-4.4, 6.5, 0]} /><Bx s={[1.2, 11, 10]} p={[4.4, 6.5, 0]} /><Bx s={[10, 11, 1.2]} p={[0, 6.5, -4.4]} /><Bx s={[10.6, 1, 10.6]} p={[0, 12.5, 0]} m={M.roofRed} /><Bx s={[7, 1, 7]} p={[0, 13.5, 0]} m={M.roofRed} /><Bx s={[3.5, 1, 3.5]} p={[0, 14.5, 0]} m={M.roofRed} /><group position={[0, 1, 0]}><Buddha H={9} seated={seated} /></group></group>;

/** A — Wat Mahathat. Wall 206x200 m (src); main lotus-bud chedi on a ~27 m base, ~29 m tall (src, th Wikipedia);
 *  4 corner chedis + 4 Khmer-style prangs sharing the base (src, Penang Travel Tips); two brick mondops flanking it, south one
 *  with the standing Phra Attharot (src); viharn east, ubosot north (src); ~200 small chedis (src). Other placements approximate. */
function Mahathat() {
  return <group>
    <GroundWall w={206} d={200} h={3.2} gap={{ side: 'e', len: 16 }} />
    <group position={[-15, 0, 0]}>
      <Plinth w={27} d={27} h={1.8} n={3} inset={1.6} /><group position={[0, 5.4, 0]}><Lotus R={7.5} H={24} /></group>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => <group key={i} position={[a * 10.5, 5.4, b * 10.5]}><Lotus R={2.2} H={16} /></group>)}
      {[[0, -1], [0, 1], [-1, 0], [1, 0]].map(([a, b], i) => <group key={i} position={[a * 11.5, 5.4, b * 11.5]}><Prang w={4.2} h={11} /></group>)}
      <Mondop p={[0, 0, -34]} /><Mondop p={[0, 0, 34]} seated={false} />
    </group>
    <Terrace w={30} d={18} p={[33, 0, 0]} cols={8} rows={4} colH={6.5} seed={3} stairs="e" /><group position={[19.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}><Buddha H={6} /></group>
    <Terrace w={20} d={14} p={[74, 0, 0]} cols={6} rows={2} colH={5.5} seed={8} stairs="e" />
    <Terrace w={24} d={12} p={[10, 0, -58]} cols={7} rows={2} colH={5} seed={12} stairs="s" /><group position={[-1, 1.5, -58]} rotation={[0, Math.PI / 2, 0]}><Buddha H={6} /></group>
    <group position={[-62, 0, 52]}><TierStupa w={16} tiers={5} th={2.2} /></group><group position={[-62, 0, -42]}><TierStupa w={10} tiers={5} th={1.9} /></group><group position={[-48, 0, -62]}><TierStupa w={10} tiers={5} th={1.9} /></group>
    <VotiveChedis n={70} area={[190, 184]} avoid={[-55, 100, -75, 75]} seed={4} />
  </group>;
}
/** B — Wat Chana Songkhram: tall Lanka-style bell chedi keeping its full spire, two lotus-petal bands, two smaller chedis on
 *  indented pedestals, viharn foundation east and ubosot foundation west (src: Thai Holiday Guide, Penang Travel Tips). Sizes approximate. */
function Chana() {
  return <group><Plinth w={20} d={20} h={1.6} n={2} inset={1.8} m={M.stone} /><group position={[0, 3.2, 0]}><Bell R={6.2} H={25} rings={9} /></group>
    {[-1, 1].map(s => <group key={s} position={[0, 0, s * 15]}><Plinth w={7} d={7} h={1.2} n={2} inset={.8} /><group position={[0, 2.4, 0]}><Bell R={2} H={10} /></group></group>)}
    <Terrace w={14} d={9} p={[24, 0, 0]} cols={5} rows={2} colH={4} seed={21} stairs="e" /><Bx s={[10, 1.2, 16]} p={[-22, .6, 0]} m={M.stone} />
    {[-5, 0, 5].map(z => <mesh key={z} position={[-22, 2.2, z]} material={lat} castShadow><cylinderGeometry args={[.4, .45, 2, 8]} /></mesh>)}</group>;
}
/** C — Noen Prasat: ~200x200 m earthen precinct; excavated platform 27.5 x 51.5 m with stairs at both ends; scattered laterite/brick
 *  foundations; two pond depressions (src: Wikipedia/tourism sites). Banks drawn as outline so ponds/roads are not buried. */
function NoenPrasat() {
  return <group><GroundWall w={200} d={200} h={1.4} t={3} step={8} m={earth} />
    <Bx s={[27.5, 3.5, 51.5]} p={[0, 1.75, 0]} /><Stairs w={8} steps={4} rise={.9} run={1.2} p={[0, 0, 25.75]} rotY={0} /><Stairs w={8} steps={4} rise={.9} run={1.2} p={[0, 0, -25.75]} rotY={Math.PI} />
    <Columns cols={4} rows={8} dx={6} dz={6} h={5} seed={31} p={[0, 3.5, 0]} broken={.7} />
    {[[-50, -40, 14, 22], [45, -30, 12, 12], [-45, 40, 18, 10], [50, 45, 10, 18], [-10, 70, 20, 8], [10, -75, 16, 8]].map(([x, z, w, d], i) => <Bx key={i} s={[w, .8, d]} p={[x, .4, z]} m={i % 2 ? lat : undefined} />)}
    {[[-60, 15], [62, 0]].map(([x, z], i) => <mesh key={i} position={[x, .15, z]} material={water}><boxGeometry args={[16, .3, 11]} /></mesh>)}</group>;
}
/** D — Wat Mai: viharn on a ~2 m split-level brick base with stairs and porticoes E/W, five chedis on the lower level, moat ~56 x 120 m (src: Penang Travel Tips, King Rama VI 1908). */
function WatMai() {
  return <group>{[[0, -60, 56, 6], [0, 60, 56, 6], [-28, 0, 6, 114], [28, 0, 6, 114]].map(([x, z, w, d], i) => <mesh key={i} position={[x, .12, z]} material={water} receiveShadow><boxGeometry args={[w, .3, d]} /></mesh>)}
    <Bx s={[20, 1, 34]} p={[0, .5, 0]} /><Bx s={[14, 1, 28]} p={[0, 1.5, 0]} m={M.sandstone} /><Stairs w={5} steps={4} rise={.5} run={1} p={[7, 0, 0]} rotY={-Math.PI / 2} />
    {[[-7, -14], [7, -14], [-7, 14], [7, 14]].map(([x, z], i) => <Bx key={i} s={[1.2, 7, 1.2]} p={[x, 5.5, z]} m={lat} />)}
    <Bx s={[1.2, 7, 28]} p={[-7, 5.5, 0]} m={lat} /><Bx s={[1.2, 7, 28]} p={[7, 5.5, 0]} m={lat} /><Bx s={[14, 7, 1.2]} p={[0, 5.5, -14]} m={lat} />
    {[-16, -8, 0, 8, 16].map(z => <group key={z} position={[-12, 1, z]}><Bell R={1.8} H={9} /></group>)}</group>;
}
/** E — Wat Sa Si: Sri Lankan bell chedi on a ~17 m square base; viharn 16x31 m to the east with a stucco Buddha at its west end; small
 *  circular niche-chedi with a walking Buddha; ubosot with sema stones on its own island joined by a bridge (src: th Wikipedia, Renown Travel). */
function SaSi() {
  return <group>
    <Plinth w={17.2} d={17.2} h={1.6} n={3} inset={1.2} /><group position={[0, 4.8, 0]}><Bell R={5.4} H={20} /></group>
    {[[-14, -8], [-14, 0], [-14, 8]].map(([x, z], i) => <Bx key={i} s={[4, .8, 4]} p={[x, .4, z]} />)}
    <Terrace w={31} d={16} p={[30, 0, 0]} cols={7} rows={2} colH={5.2} seed={5} stairs="e" /><group position={[16.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}><Buddha H={5.5} /></group>
    <group position={[2, 0, -22]}><mesh position={[0, 1.1, 0]} material={M.stucco} castShadow><cylinderGeometry args={[2.8, 3.2, 2.2, 16]} /></mesh><mesh position={[0, 3.6, 0]} material={M.stucco} castShadow><sphereGeometry args={[2.4, 12, 8]} /></mesh>{[0, 1, 2, 3].map(i => <Bx key={i} s={[1.1, 1.8, .5]} p={[Math.cos(i * Math.PI / 2) * 2.7, 1.2, Math.sin(i * Math.PI / 2) * 2.7]} r={[0, -i * Math.PI / 2, 0]} m={M.dark} />)}</group>
    <group position={[8, 0, -18]}><mesh position={[0, .3, 0]} material={M.stone}><cylinderGeometry args={[1.6, 1.8, .6, 12]} /></mesh><group position={[0, .6, 0]}><Buddha H={4} seated={false} /></group></group>
    <Bx s={[3, .6, 9]} p={[54, 1.2, 0]} r={[0, Math.PI / 2, 0]} m={M.sandstone} />
    <group position={[66, 0, 0]}><mesh position={[0, -5, 0]} material={earth} receiveShadow><cylinderGeometry args={[13, 15, 11, 16]} /></mesh><Terrace w={14} d={8} p={[0, .3, 0]} cols={3} rows={2} colH={4} seed={9} stairs="w" h={1} />
      {Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return <Bx key={i} s={[.3, 1.6, 1]} p={[Math.cos(a) * 9, 1, Math.sin(a) * 9]} r={[0, -a, 0]} m={M.stone} />; })}</group>
  </group>;
}
/** F — Wat Traphang Ngoen: lotus-bud chedi, viharn to its east, vimana-style subsidiary chedi to the north, ubosot on an island in the pond (src: th Wikipedia). */
function TraphangNgoen() {
  return <group><Plinth w={22} d={22} h={1.6} n={3} inset={2} /><group position={[0, 4.8, 0]}><Lotus R={5.4} H={17} /></group>
    <Terrace w={24} d={14} p={[26, 0, 0]} cols={6} rows={2} colH={5} seed={14} stairs="e" /><group position={[15, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}><Buddha H={4.8} /></group>
    <group position={[0, 0, -22]}><Plinth w={9} d={9} h={1.4} n={4} inset={1.1} /><mesh position={[0, 5.9, 0]} material={M.roofRed} castShadow><coneGeometry args={[2.4, 3.4, 4]} /></mesh></group>
    <Terrace w={12} d={8} p={[0, 0, 36]} cols={3} rows={2} colH={4} seed={19} stairs="n" h={1} /></group>;
}
/** G — King Ramkhamhaeng Monument: round paved plaza on the plan (~80 m) with a stepped plinth and a gold figure. The real statue's pose
 *  and size were not found; this is a stylized stand-in. */
function Monument() {
  return <group><mesh position={[0, .3, 0]} material={M.sandstone} receiveShadow><cylinderGeometry args={[38, 40, .6, 32]} /></mesh><mesh position={[0, .35, 0]} material={M.stone}><cylinderGeometry args={[30, 30, .7, 32]} /></mesh>
    <Plinth w={12} d={12} h={1.1} n={3} inset={1.4} m={M.sandstone} y0={.6} />
    <group position={[0, 4, 0]}><mesh position={[0, 3, 0]} material={M.gold} castShadow><coneGeometry args={[2.2, 6, 8]} /></mesh><mesh position={[0, 6.6, 0]} material={M.gold} castShadow><sphereGeometry args={[.95, 10, 8]} /></mesh><mesh position={[0, 8.1, 0]} material={M.gold} castShadow><coneGeometry args={[.8, 2.4, 8]} /></mesh></group></group>;
}
function PondFeature() { const pads = useRef<THREE.InstancedMesh>(null); useLayoutEffect(() => { const r = mulberry32(5), o = new THREE.Object3D(); for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = 6 + r() * 22; o.position.set(Math.cos(a) * d, -.3, Math.sin(a) * d); o.scale.setScalar(.7 + r() * .8); o.updateMatrix(); pads.current!.setMatrixAt(i, o.matrix); } pads.current!.instanceMatrix.needsUpdate = true; }, []);
  return <group><instancedMesh ref={pads} args={[undefined, undefined, 14]} material={M.pad}><cylinderGeometry args={[1.8, 1.8, .1, 8]} /></instancedMesh>{[[4, 3], [-7, -2], [0, -10], [9, 8]].map(([x, z], i) => <mesh key={i} position={[x, -.1, z]} material={M.pink}><coneGeometry args={[.8, 1.6, 6]} /></mesh>)}</group>; }
/** Wat Si Sawai: three laterite Khmer-style prangs inside a laterite wall (src: Wikipedia). */
function SiSawai() { return <group><GroundWall w={108} d={99} h={2.6} t={1.4} m={lat} /><group position={[0, 0, 0]}><Plinth w={20} d={20} h={1.2} n={2} inset={2} m={lat} /><group position={[0, 2.4, 0]}><Prang w={9} h={26} /></group></group>{[-1, 1].map(s => <group key={s} position={[s * 0, 0, s * 16]}><Plinth w={9} d={9} h={1} n={1} inset={0} m={lat} /><group position={[0, 1, 0]}><Prang w={5} h={16} /></group></group>)}</group>; }
function IslandChedi() { return <group><Plinth w={14} d={14} h={1.2} n={2} inset={1.4} m={M.stone} /><group position={[0, 2.4, 0]}><Bell R={4} H={16} /></group></group>; }
function RuinsWest() { return <group><Terrace w={22} d={13} cols={5} rows={2} colH={4.5} seed={7} stairs="e" /></group>; }
/** Dispatch one distinct procedural model per ModelType. Authored in metres; see file header. */
export function HeritageModel({ model }: { model: string }) {
  switch (model) {
    case 'wat-mahathat': return <Mahathat />;
    case 'wat-chana': return <Chana />;
    case 'noen-prasat': return <NoenPrasat />;
    case 'wat-mai': return <WatMai />;
    case 'wat-sa-si': return <SaSi />;
    case 'traphang-ngoen': return <TraphangNgoen />;
    case 'monument': return <Monument />;
    case 'pond-feature': return <PondFeature />;
    case 'si-sawai': return <SiSawai />;
    case 'island-chedi': return <IslandChedi />;
    case 'viharn-ruins': return <RuinsWest />;
    default: return null;
  }
}

/** Places a metre-authored model at grid (gx,gy): scales to world units (VEXAG on height) and feeds terrain heights to GroundCtx. */
/** Park axes run ~10 degrees off north (measured on OSM wall outlines of Wat Mahathat, Wat Si Sawai, Noen Prasat). */
const YAWED = new Set(['wat-mahathat', 'noen-prasat', 'si-sawai']);
export function HeritageAt({ model, gx, gy }: { model: string; gx: number; gy: number }) {
  const [x, z] = toWorld(gx, gy), base = Math.max(heightAt(gx, gy), WATER_Y + .01), ky = METER * VEXAG;
  const yaw = YAWED.has(model) ? .175 : 0, cs = Math.cos(yaw), sn = Math.sin(yaw);
  const ground = useMemo(() => (lx: number, lz: number) => (heightAt(gx + (lx * cs + lz * sn) / 2.64, gy + (-lx * sn + lz * cs) / 2.64) - base) / ky, [gx, gy, base, ky, cs, sn]);
  return <group position={[x, base, z]} rotation={[0, yaw, 0]} scale={[METER, ky, METER]}><GroundCtx.Provider value={ground}><HeritageModel model={model} /></GroundCtx.Provider></group>;
}
