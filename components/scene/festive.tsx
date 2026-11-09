'use client';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { osmBuildings, osmRuins } from '@/data/osm';
import { ponds, roads } from '@/data/layout';
import { allInitialPoints, pointWorld, type Point } from '@/data/points';
import { VENUE, distToPolyline, mulberry32, toWorld, type Pt } from '@/lib/geo';
import { geoToGrid, inDiorama } from '@/lib/georef';
import { WATER_Y, heightAt, pondAt } from '@/lib/terrain';
import { glowMaterials } from './materials';
import { useMapStore } from '@/store/useMapStore';
import { LOW } from '@/lib/perf';
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
  const items = useMemo(() => { const r = mulberry32(31); return Array.from({ length: 70 }, () => ({ x: VENUE[0] + (r() - .5) * 15, z: VENUE[1] + (r() - .5) * 11, y: r() * 7, v: .12 + r() * .14, s: .8 + r() * .5, ph: r() * 6.28 })); }, []);
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
const SHELLS = LOW ? 5 : 8, SPARKS = LOW ? 60 : 110, TRAIL = LOW ? 3 : 5, CYCLE = 9, RISE = 1.2, DRAG = 1.7, PER = 1 + 8 + SPARKS * TRAIL;
const COLORS = [['#ff4d4d', '#ffd24a'], ['#4dd2ff', '#ffffff'], ['#7dff6a', '#ffe36a'], ['#ff7be0', '#9a6bff'], ['#ffc34a', '#ffc34a'], ['#ff9a3a', '#ff4d4d']];
type Kind = 'peony' | 'ring' | 'willow';
const KINDS: Kind[] = ['peony', 'willow', 'ring', 'peony', 'willow', 'peony', 'ring', 'willow'];
/** Night fireworks: rockets with sparks trail, then peony / ring / willow bursts with drag, gravity, twinkle and a flash. Decorative show, not a documented schedule. */
function Fireworks() {
  const shells = useMemo(() => { const r = mulberry32(2569); return Array.from({ length: SHELLS }, (_, i) => {
    const kind = KINDS[i % KINDS.length], willow = kind === 'willow', [c1, c2] = willow ? ['#ffc34a', '#ffd98a'] : COLORS[i % COLORS.length], cA = new THREE.Color(c1), cB = new THREE.Color(c2);
    const tilt = r() * 1.2, ct = Math.cos(tilt), st = Math.sin(tilt);
    const sparks = Array.from({ length: SPARKS }, (_, j) => {
      let d: [number, number, number], sp = (willow ? .9 : .55) + r() * (willow ? .5 : .55);
      if (kind === 'ring') { const a = j / SPARKS * 6.283, x = Math.cos(a), y = Math.sin(a); d = [x, y * ct, y * st]; sp = 1.15 + r() * .08; }
      else { const u = r() * 2 - 1, a = r() * 6.283, q = Math.sqrt(1 - u * u); d = [q * Math.cos(a), u, q * Math.sin(a)]; }
      return { d, sp, ph: r() * 6.283, c: (kind === 'peony' ? j % 2 : r() < .5 ? 0 : 1) ? cB : cA };
    });
    return { kind, x: VENUE[0] + (r() - .5) * 12, z: VENUE[1] + (r() - .5) * 7 - 1, h: 3.4 + r() * 2.2, off: i * (CYCLE / SHELLS) + r() * .6, sparks, burn: willow ? 4.2 : 3.2, grav: willow ? .75 : .38, tw: !willow, flash: cA }; }); }, []);
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(), n = SHELLS * PER; g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3).fill(0), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); return g; }, []);
  const fgeo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SHELLS * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(SHELLS * 3), 3)); return g; }, []);
  useFrame(st => { const pos = geo.attributes.position as THREE.BufferAttribute, col = geo.attributes.color as THREE.BufferAttribute, fp = fgeo.attributes.position as THREE.BufferAttribute, fc = fgeo.attributes.color as THREE.BufferAttribute; let k = 0, si = 0;
    const hide = () => { pos.setXYZ(k, 0, -50, 0); col.setXYZ(k, 0, 0, 0); k++; };
    for (const s of shells) { const live = st.clock.elapsedTime > SHOW_DELAY, ph = live ? (st.clock.elapsedTime - SHOW_DELAY + s.off) % CYCLE : CYCLE - .01, e = ph - RISE, rise = (t: number) => .4 + (s.h - .4) * (1 - (1 - t) ** 2);
      // rocket head + glowing tail
      for (let j = 0; j < 9; j++) { const t = ph / RISE - j * .035; if (ph < RISE && t > 0) { const f = (1 - j / 9) ** 1.6; pos.setXYZ(k, s.x + Math.sin(t * 40 + j) * .02, rise(t), s.z); col.setXYZ(k, 1 * f, .75 * f, .4 * f); k++; } else hide(); }
      const on = e >= 0 && e < s.burn, fade = on ? Math.max(0, 1 - e / s.burn) ** 1.4 : 0;
      for (const sp of s.sparks) for (let j = 0; j < TRAIL; j++) { const te = e - j * (s.kind === 'willow' ? .07 : .04);
        if (on && te > 0) { const dist = sp.sp * 2.1 * (1 - Math.exp(-DRAG * te)) / DRAG * 1.6, f = fade * (1 - j / TRAIL) ** 1.4 * (s.tw && e > s.burn * .55 ? .55 + .45 * Math.sin(e * 28 + sp.ph) : 1), hot = Math.max(0, 1 - te * 2.2);
          pos.setXYZ(k, s.x + sp.d[0] * dist, s.h + sp.d[1] * dist - s.grav * te * te, s.z + sp.d[2] * dist); col.setXYZ(k, (sp.c.r + hot * (1 - sp.c.r)) * f, (sp.c.g + hot * (1 - sp.c.g)) * f, (sp.c.b + hot * (1 - sp.c.b)) * f); k++; } else hide(); }
      // burst flash
      const fl = e >= 0 && e < .35 ? (1 - e / .35) ** 2 : 0; fp.setXYZ(si, s.x, fl ? s.h : -50, s.z); fc.setXYZ(si, fl, fl * .9, fl * .75); si++; }
    pos.needsUpdate = true; col.needsUpdate = true; fp.needsUpdate = true; fc.needsUpdate = true; });
  return <>
    <points geometry={geo} frustumCulled={false}><pointsMaterial size={.2} map={dot} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation toneMapped={false} /></points>
    <points geometry={fgeo} frustumCulled={false}><pointsMaterial size={2.4} map={dot} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation toneMapped={false} /></points>
  </>;
}
/** Rockets that burst into the festival title written in sparks (one rocket per line). Billboards around Y to face the camera. */
const V0 = new THREE.Vector3(), V1 = new THREE.Vector3(), V2 = new THREE.Vector3();
const SHOW_DELAY = 4; // seconds after the canvas mounts before any firework starts
const TITLE = ['งานประเพณีลอยกระทง', 'เผาเทียน เล่นไฟ', 'จังหวัดสุโขทัย ปี 2569'], T_CYCLE = 15, T_RISE = 1.4, T_FORM = 1.2, T_HOLD = 5, T_FADE = 1.8, T_GAP = 1.1, T_W = 6, T_LH = .8;
const T_TINT = ['#ffd24a', '#ff9a5a', '#ffe9b0'];
function TitleFireworks() {
  const data = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const W = 1400, LH = 190, c = document.createElement('canvas'); c.width = W; c.height = LH * TITLE.length;
    const x = c.getContext('2d')!; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    TITLE.forEach((t, l) => { let size = 150; x.font = `700 ${size}px "Noto Sans Thai","Sarabun",Thonburi,Tahoma,sans-serif`; const w = x.measureText(t).width; if (w > W - 40) { size *= (W - 40) / w; x.font = `700 ${size}px "Noto Sans Thai","Sarabun",Thonburi,Tahoma,sans-serif`; } x.fillText(t, W / 2, LH * l + LH / 2); });
    const img = x.getImageData(0, 0, W, c.height).data, r = mulberry32(69), pts: { l: number; tx: number; ty: number; sx: number; sy: number; sz: number; ph: number }[] = [], step = LOW ? 6 : 4, sc = T_W / W;
    for (let py = 0; py < c.height; py += step) for (let px = 0; px < W; px += step) if (img[(py * W + px) * 4 + 3] > 128) { const l = Math.floor(py / LH); pts.push({ l, tx: (px - W / 2) * sc, ty: (TITLE.length / 2 - py / LH) * T_LH, sx: 0, sy: 0, sz: (r() - .5) * .08, ph: r() * 6.283 }); }
    const centre = TITLE.map((_, l) => (TITLE.length / 2 - (l + .5)) * T_LH);
    return { pts, centre };
  }, []);
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(), n = (data?.pts.length ?? 0) + TITLE.length * 9; g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); return g; }, [data]);
  const tint = useMemo(() => T_TINT.map(c => new THREE.Color(c)), []);
  useFrame(st => {
    if (!data) return; const { pts, centre } = data, pos = geo.attributes.position as THREE.BufferAttribute, col = geo.attributes.color as THREE.BufferAttribute, el = st.clock.elapsedTime - SHOW_DELAY, time = el % T_CYCLE;
    geo.setDrawRange(0, el < 0 ? 0 : Infinity); if (el < 0) return;
    const cam = st.camera.position, yaw = Math.atan2(cam.x - VENUE[0], cam.z - VENUE[1]), rx = Math.cos(yaw), rz = -Math.sin(yaw), fx = Math.sin(yaw), fz = Math.cos(yaw), BASE0 = 5.4, DEPTH = 0, HH = TITLE.length * T_LH / 2;
    // Fit the whole title on screen whatever the camera: shrink to the view width and slide down if the top would be cut off.
    const c0 = V0.set(VENUE[0] + DEPTH * fx, BASE0, VENUE[1] + DEPTH * fz).project(st.camera), cx = c0.x, cy = c0.y;
    const r0 = V1.set(VENUE[0] + DEPTH * fx + rx * T_W / 2, BASE0, VENUE[1] + DEPTH * fz + rz * T_W / 2).project(st.camera), u0 = V2.set(VENUE[0] + DEPTH * fx, BASE0 + HH, VENUE[1] + DEPTH * fz).project(st.camera);
    const sc = Math.min(1, .42 / Math.max(.05, Math.abs(r0.x - cx))), perUnit = Math.max(.01, (u0.y - cy) / HH), top = cy + HH * sc * perUnit;
    const base = BASE0 - Math.max(0, top - .8) / perUnit, sh = .2 / Math.max(.01, Math.abs(r0.x - cx) / (T_W / 2)); // shift right so the left-hand control panel never covers the title
    const put = (k: number, lx: number, ly: number, ld: number, r_: number, g_: number, b_: number) => { pos.setXYZ(k, VENUE[0] + (lx * sc + sh) * rx + (ld + DEPTH) * fx, base + ly * sc, VENUE[1] + (lx * sc + sh) * rz + (ld + DEPTH) * fz); col.setXYZ(k, r_, g_, b_); };
    const ease = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3; let k = 0;
    // rockets
    for (let l = 0; l < TITLE.length; l++) { const t = (time - l * T_GAP) / T_RISE;
      for (let j = 0; j < 9; j++) { const tt = t - j * .035; if (tt > 0 && t < 1) { const f = (1 - j / 9) ** 1.6, y0 = (-base + .4) / sc; put(k, Math.sin(tt * 40 + j) * .03, y0 + (centre[l] - y0) * (1 - (1 - tt) ** 2), 0, f, .75 * f, .4 * f); } else { pos.setXYZ(k, 0, -50, 0); col.setXYZ(k, 0, 0, 0); } k++; } }
    for (const p of pts) { const e = time - p.l * T_GAP - T_RISE, c = tint[p.l];
      if (e < 0 || e > T_FORM + T_HOLD + T_FADE) { pos.setXYZ(k, 0, -50, 0); col.setXYZ(k, 0, 0, 0); k++; continue; }
      const m = ease(e / T_FORM), fe = Math.max(0, e - T_FORM - T_HOLD), fade = 1 - fe / T_FADE, hot = Math.max(0, 1 - e * 1.4), tw = e > T_FORM ? .8 + .2 * Math.sin(e * 22 + p.ph) : 1, droop = fe * fe * .35;
      put(k, p.tx * m, centre[p.l] + (p.ty - centre[p.l]) * m - droop, p.sz * m + (1 - m) * p.sz * 4, (c.r + hot * (1 - c.r)) * fade * tw, (c.g + hot * (1 - c.g)) * fade * tw, (c.b + hot * (1 - c.b)) * fade * tw); k++; }
    pos.needsUpdate = true; col.needsUpdate = true; });
  if (!data) return null;
  return <points geometry={geo} frustumCulled={false}><pointsMaterial size={.1} map={dot} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation depthTest={false} toneMapped={false} /></points>;
}
/** Night colour-coding: a coloured light pool on the ground + a faint light beam over every place so each stays easy to spot. Colours follow the pin colours. */
const glowTex = (() => { if (typeof document === 'undefined') return null; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d')!, g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.3, 'rgba(255,255,255,.5)'); g.addColorStop(.7, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const beamTex = (() => { if (typeof document === 'undefined') return null; const c = document.createElement('canvas'); c.width = 4; c.height = 128; const x = c.getContext('2d')!, g = x.createLinearGradient(0, 128, 0, 0); g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(.5, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 4, 128); return new THREE.CanvasTexture(c); })();
function glowSpec(p: Point) {
  if (p.category === 'landmark') return { col: '#ffb347', r: .8, h: 2.4 };
  if (p.category === 'activity') return p.series === 'culture' ? { col: '#a46bff', r: .3, h: 1.1 } : { col: '#ff5fa2', r: .3, h: 1.1 };
  if (p.tags.includes('road')) return { col: '#4da3ff', r: .35, h: .9 };
  if (p.model === 'wc') return { col: '#3fd2c7', r: .3, h: .7 };
  if (p.model === 'parking' || p.model === 'vip-tent') return { col: '#4da3ff', r: .3, h: .7 };
  if (p.model === 'hospital') return { col: '#ff6b6b', r: .32, h: .8 };
  if (p.model === 'bus-stop') return { col: '#ffd24a', r: .32, h: .8 };
  return { col: '#5fe0ff', r: .32, h: .8 };
}
function PlaceGlow() {
  const points = useMapStore(s => s.points), list = useMemo(() => points.filter(p => inDiorama([p.x, p.y])), [points]);
  const disc = useRef<THREE.InstancedMesh>(null), beam = useRef<THREE.InstancedMesh>(null), dm = useRef<THREE.MeshBasicMaterial>(null), bm = useRef<THREE.MeshBasicMaterial>(null);
  useLayoutEffect(() => { const d = disc.current, b = beam.current; if (!d || !b) return; const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    list.forEach((p, i) => { const { col, r, h } = glowSpec(p), [x, z] = pointWorld(p), y = Math.max(heightAt(p.x, p.y), WATER_Y);
      m.compose(new THREE.Vector3(x, y + .04, z), q, new THREE.Vector3(r * 2, r * 2, 1)); d.setMatrixAt(i, m); d.setColorAt(i, c.set(col));
      m.compose(new THREE.Vector3(x, y + h / 2, z), q, new THREE.Vector3(r * .55, h, r * .55)); b.setMatrixAt(i, m); b.setColorAt(i, c.set(col)); });
    d.count = b.count = list.length; d.instanceMatrix.needsUpdate = b.instanceMatrix.needsUpdate = true; if (d.instanceColor) d.instanceColor.needsUpdate = true; if (b.instanceColor) b.instanceColor.needsUpdate = true; }, [list]);
  useFrame(st => { const k = .8 + .2 * Math.sin(st.clock.elapsedTime * 1.6); if (dm.current) dm.current.opacity = .12 * k; if (bm.current) bm.current.opacity = .1 * k; });
  const n = Math.max(list.length, 1);
  return <>
    <instancedMesh ref={disc} args={[undefined, undefined, n]} frustumCulled={false} renderOrder={3}><planeGeometry args={[1, 1]} onUpdate={g => g.rotateX(-Math.PI / 2)} /><meshBasicMaterial ref={dm} map={glowTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></instancedMesh>
    <instancedMesh ref={beam} args={[undefined, undefined, n]} frustumCulled={false} renderOrder={4}><cylinderGeometry args={[.35, 1, 1, 14, 1, true]} /><meshBasicMaterial ref={bm} map={beamTex} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} toneMapped={false} /></instancedMesh>
  </>;
}
/** Warm amber up-lighting on every heritage monument at night (like floodlit temples): low point lights beside each landmark. */
function LandmarkLights() {
  const points = useMapStore(s => s.points), lm = useMemo(() => points.filter(p => p.category === 'landmark' && inDiorama([p.x, p.y])), [points]);
  return <>{lm.map(p => { const [x, z] = pointWorld(p), y = Math.max(heightAt(p.x, p.y), WATER_Y);
    return <group key={p.id} position={[x, y, z]}><pointLight color="#ffb05a" intensity={.9} distance={2.6} decay={1.6} position={[.5, .5, .6]} /><pointLight color="#ff9a3a" intensity={.4} distance={1.8} decay={1.6} position={[-.5, .3, -.4]} /></group>; })}</>;
}
/** Festival-goers: small low-poly figures (drawn larger than life so they read at map scale) strolling back and forth along the OSM paths near the venue. Decorative, not real crowd data. */
const WALKERS = LOW ? 50 : 110, SHIRTS = ['#ff6b8b', '#ffd24a', '#4dc3ff', '#7ddc6a', '#ff9a3a', '#b48cff', '#ffffff', '#ff5a4a', '#3fd2c7'], SKINS = ['#f1c9a0', '#d9a273', '#b9825a', '#8d5a3a'];
const SC = new THREE.Vector3(1.6, 1.6, 1.6);
function Crowd() {
  const body = useRef<THREE.InstancedMesh>(null), head = useRef<THREE.InstancedMesh>(null);
  const walkers = useMemo(() => {
    const r = mulberry32(777), near = roads.filter(rd => rd.pts.some(q => Math.hypot(q[0] - 300, q[1] - 345) < 200));
    const lines = near.map(rd => { const cum = [0]; for (let i = 1; i < rd.pts.length; i++) cum.push(cum[i - 1] + Math.hypot(rd.pts[i][0] - rd.pts[i - 1][0], rd.pts[i][1] - rd.pts[i - 1][1])); return { pts: rd.pts, cum, len: cum[cum.length - 1] }; }).filter(l => l.len > 25);
    if (!lines.length) return [];
    return Array.from({ length: WALKERS }, () => { const l = lines[Math.floor(r() * lines.length)], win = Math.min(l.len, 50 + r() * 90), a = r() * (l.len - win);
      return { l, a, win, speed: 3 + r() * 3, ph: r() * 100, shirt: new THREE.Color(SHIRTS[Math.floor(r() * SHIRTS.length)]), skin: new THREE.Color(SKINS[Math.floor(r() * SKINS.length)]) }; });
  }, []);
  useLayoutEffect(() => { walkers.forEach((w, i) => { body.current?.setColorAt(i, w.shirt); head.current?.setColorAt(i, w.skin); }); if (body.current?.instanceColor) body.current.instanceColor.needsUpdate = true; if (head.current?.instanceColor) head.current.instanceColor.needsUpdate = true; }, [walkers]);
  const m = useMemo(() => new THREE.Matrix4(), []), q = useMemo(() => new THREE.Quaternion(), []), e = useMemo(() => new THREE.Euler(), []);
  useFrame(st => { const bm = body.current, hm = head.current; if (!bm || !hm) return; const t = st.clock.elapsedTime;
    walkers.forEach((w, i) => { const u = ((t * w.speed + w.ph) % (2 * w.win)), d = u < w.win ? u : 2 * w.win - u, s = w.a + d; let k = 1; while (k < w.l.cum.length - 1 && w.l.cum[k] < s) k++;
      const c0 = w.l.cum[k - 1], f = (s - c0) / Math.max(1e-6, w.l.cum[k] - c0), p0 = w.l.pts[k - 1], p1 = w.l.pts[k], gx = p0[0] + (p1[0] - p0[0]) * f, gy = p0[1] + (p1[1] - p0[1]) * f, [x, z] = toWorld(gx, gy), y = Math.max(heightAt(gx, gy), WATER_Y) + .01 + Math.abs(Math.sin(t * 9 + w.ph)) * .012;
      e.set(0, 0, Math.sin(t * 9 + w.ph) * .06); q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, y + .09, z), q, SC); bm.setMatrixAt(i, m); m.compose(new THREE.Vector3(x, y + .22, z), q, SC); hm.setMatrixAt(i, m); });
    bm.instanceMatrix.needsUpdate = true; hm.instanceMatrix.needsUpdate = true; });
  if (!walkers.length) return null;
  return <>
    <instancedMesh ref={body} args={[undefined, undefined, walkers.length]} frustumCulled={false} castShadow><cylinderGeometry args={[.026, .036, .11, 8]} /><meshStandardMaterial roughness={.8} /></instancedMesh>
    <instancedMesh ref={head} args={[undefined, undefined, walkers.length]} frustumCulled={false}><sphereGeometry args={[.03, 10, 8]} /><meshStandardMaterial roughness={.7} /></instancedMesh>
  </>;
}
/** Giant krathong + flame bowl always; krathong fleet, sky lanterns and fireworks only at night (real clock after 19:00, or the night button). */
export function Festive() { const night = useMapStore(s => s.time === 'night'); return <><Symbols /><Crowd />{night && <><PlaceGlow />{!LOW && <LandmarkLights />}<KrathongFleet /><KhomLoi /><Fireworks /><TitleFireworks /></>}</>; }
/** Blue "you are here" marker at the visitor's GPS position (only when it falls inside the diorama). */
export function UserDot() {
  const pos = useMapStore(s => s.userPos), ref = useRef<THREE.Mesh>(null);
  useFrame(st => { if (ref.current) { const k = 1 + (st.clock.elapsedTime % 1.6) * .9; ref.current.scale.set(k, k, 1); (ref.current.material as THREE.MeshBasicMaterial).opacity = .55 * (1 - (st.clock.elapsedTime % 1.6) / 1.6); } });
  if (!pos) return null;
  const g = geoToGrid(pos.lat, pos.lng); if (g[0] < -30 || g[0] > 610 || g[1] < 20 || g[1] > 610) return null;
  const [x, z] = toWorld(...g), y = Math.max(heightAt(...g), WATER_Y) + .03;
  return <group position={[x, y, z]}><mesh position={[0, .16, 0]} renderOrder={9}><sphereGeometry args={[.07, 16, 12]} /><meshBasicMaterial color="#2b7bff" depthTest={false} /></mesh><mesh position={[0, .16, 0]} renderOrder={8}><sphereGeometry args={[.1, 16, 12]} /><meshBasicMaterial color="#ffffff" depthTest={false} /></mesh><mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} renderOrder={7}><ringGeometry args={[.1, .13, 32]} /><meshBasicMaterial color="#2b7bff" transparent depthTest={false} /></mesh></group>;
}
