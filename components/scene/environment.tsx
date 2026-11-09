'use client';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { boundary, bridges, ponds, roads } from '@/data/layout';
import { allInitialPoints } from '@/data/points';
import { osmBuildings, osmRuins, osmWalls } from '@/data/osm';
import { METER, VEXAG } from '@/lib/geo';
import { BOUNDS, BOUNDS_GRID, CENTER, WORLD_H, WORLD_W, distToPolyline, mulberry32, pointInPoly, smoothClosed, smoothOpen, toWorld, type Pt } from '@/lib/geo';
import { WATER_Y, groundColor, heightAt, insideVenue, pondAt, waterDepth } from '@/lib/terrain';
import { ribbonGeometry } from '@/lib/ribbon';
import { useMapStore, type TimeOfDay } from '@/store/useMapStore';
import { M, glowMaterials } from './materials';
import { Bx } from './heritage';

const TW = BOUNDS.x1 - BOUNDS.x0, TH = BOUNDS.z1 - BOUNDS.z0, SKIRT = -.7;
const sites: Pt[] = allInitialPoints.map(p => [p.x, p.y]);
const g2 = (x: number, z: number): Pt => [(x / WORLD_W + .5) * 1000, (z / WORLD_H + .5) * 705];

/** Continuous terrain with vertex-coloured zones, pond basins, island mounds and a soil "diorama" skirt. */
export function Terrain() {
  const { top, skirt } = useMemo(() => {
    const nx = 360, nz = 340, pos: number[] = [], col: number[] = [], idx: number[] = [], hs: number[][] = [];
    for (let j = 0; j <= nz; j++) { hs.push([]); for (let i = 0; i <= nx; i++) {
      const x = BOUNDS.x0 + i / nx * TW, z = BOUNDS.z0 + j / nz * TH, [gx, gy] = g2(x, z), h = heightAt(gx, gy);
      let pd = 1e9; for (const s of sites) pd = Math.min(pd, Math.hypot(gx - s[0], gy - s[1]));
      pos.push(x, h, z); const c = groundColor(gx, gy, h, pd), ao = 1 - .35 * waterDepth([gx, gy]); col.push(c[0] * ao, c[1] * ao, c[2] * ao); hs[j].push(h); } }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const t = new THREE.BufferGeometry(); t.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); t.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); t.setIndex(idx); t.computeVertexNormals();
    // Curtain along the four edges
    const sp: number[] = [], sc: number[] = [], si: number[] = [], edge: [number, number][][] = [[], [], [], []];
    for (let i = 0; i <= nx; i++) { edge[0].push([i, 0]); edge[1].push([nx - i, nz]); } for (let j = 0; j <= nz; j++) { edge[2].push([nx, j]); edge[3].push([0, nz - j]); }
    let o = 0; for (const e of edge) { for (let k = 0; k < e.length; k++) { const [i, j] = e[k], x = BOUNDS.x0 + i / nx * TW, z = BOUNDS.z0 + j / nz * TH, h = hs[j][i]; sp.push(x, h, z, x, SKIRT, z); sc.push(.42, .3, .2, .16, .11, .08); if (k < e.length - 1) { const a = o + k * 2; si.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } } o += e.length * 2; }
    const s = new THREE.BufferGeometry(); s.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); s.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3)); s.setIndex(si); s.computeVertexNormals();
    return { top: t, skirt: s };
  }, []);
  return <group>
    <mesh geometry={top} receiveShadow><meshStandardMaterial vertexColors roughness={1} flatShading={false} /></mesh>
    <mesh geometry={skirt} material={M.earth} /><mesh position={[CENTER[0], SKIRT, CENTER[1]]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[TW, TH]} /><meshBasicMaterial color="#1c140d" /></mesh>
  </group>;
}

const waterVert = `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`;
const waterFrag = `uniform float uT; uniform vec3 uA; uniform vec3 uB; uniform vec3 uSky; uniform vec3 uSun; uniform float uNight; varying vec3 vW;
float wv(vec2 p){ return sin(p.x*3.1+uT*.9)+sin(p.y*2.7-uT*.7)+sin((p.x+p.y)*4.3+uT*1.3)*.6+sin((p.x-p.y)*6.1-uT*1.7)*.35; }
void main(){ vec2 p=vW.xz; float e=.02; vec3 n=normalize(vec3(-(wv(p+vec2(e,0.))-wv(p))*.05,1.,-(wv(p+vec2(0.,e))-wv(p))*.05));
  vec3 v=normalize(cameraPosition-vW); float f=pow(1.-max(dot(n,v),0.),3.); vec3 L=normalize(uSun); vec3 h=normalize(L+v); float sp=pow(max(dot(n,h),0.),120.)*(1.-uNight*.7);
  float sh=.5+.5*wv(p*.6+3.)*.25; vec3 base=mix(uA,uB,sh); vec3 c=mix(base,uSky,f*.65)+sp*vec3(1.,.93,.78);
  gl_FragColor=vec4(c,.86); }`;
const WATER_TARGET: Record<TimeOfDay, { a: string; b: string; sky: string; sun: [number, number, number]; night: number }> = {
  day: { a: '#4fc3bd', b: '#1f8f9a', sky: '#bfe3f7', sun: [8, 12, 6], night: 0 }, golden: { a: '#4fb5a8', b: '#1f7f86', sky: '#f2c993', sun: [-10, 5, 8], night: 0 }, night: { a: '#1b3550', b: '#0b1830', sky: '#2a2c63', sun: [-6, 8, -4], night: 1 },
};
/** Water bodies: shader-animated surface with fresnel sky reflection + sun glint, plus a pale shoreline lip. */
export function Water() {
  const time = useMapStore(s => s.time);
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: waterVert, fragmentShader: waterFrag, transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() }, uSky: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3() }, uNight: { value: 0 } } }), []);
  useEffect(() => { const w = WATER_TARGET[time]; mat.uniforms.uA.value.set(w.a); mat.uniforms.uB.value.set(w.b); mat.uniforms.uSky.value.set(w.sky); mat.uniforms.uSun.value.set(...w.sun); mat.uniforms.uNight.value = w.night; }, [time, mat]);
  useFrame(s => { mat.uniforms.uT.value = s.clock.elapsedTime; });
  const geos = useMemo(() => ponds.map(p => { const sh = new THREE.Shape(p.poly.map(pt => { const [x, z] = toWorld(pt[0], pt[1]); return new THREE.Vector2(x, -z); })); const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); g.translate(0, WATER_Y, 0); return g; }), []);
  const lips = useMemo(() => ponds.map(p => ribbonGeometry(p.poly, 3.2, 0, { closed: true, yFn: () => WATER_Y + .004 })), []);
  return <group>{geos.map((g, i) => <mesh key={i} geometry={g} material={mat} renderOrder={2} />)}{lips.map((g, i) => <mesh key={i} geometry={g} material={M.foam} renderOrder={1} />)}</group>;
}

const KY = METER * VEXAG;
// Roads are thin ribbons laid a hair above the terrain; without a depth offset they z-fight (flicker) with the ground and each other while the camera moves.
for (const m of [M.asphalt, M.roadEdge, M.pathStone, M.pathEdge]) { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; m.depthWrite = false; }
/** Extruded footprints (ruin foundations / modern buildings) from OpenStreetMap, each set on the ground at its centroid. */
function Footprints({ items, h, material }: { items: { pts: Pt[] }[]; h: number; material: THREE.Material }) {
  const geos = useMemo(() => items.map(it => { const c = it.pts.reduce((a, p) => [a[0] + p[0] / it.pts.length, a[1] + p[1] / it.pts.length], [0, 0]), gy = heightAt(c[0], c[1]);
    const sh = new THREE.Shape(it.pts.map(p => { const [x, z] = toWorld(p[0], p[1]); return new THREE.Vector2(x, -z); })), g = new THREE.ExtrudeGeometry(sh, { depth: h * KY, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); g.translate(0, Math.max(gy, WATER_Y + .01), 0); return g; }), [items, h]);
  return <group>{geos.map((g, i) => <mesh key={i} geometry={g} material={material} castShadow receiveShadow />)}</group>;
}
/** Low brick ruin footprints, walls and modern buildings traced from OpenStreetMap (ODbL). */
export function OsmGround() {
  const walls = useMemo(() => osmWalls.flatMap(w => { const pts = w.closed ? [...w.pts, w.pts[0]] : w.pts; return pts.slice(0, -1).map((a, i) => ({ a, b: pts[i + 1], k: w.k })); }), []);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => { const m = ref.current!, o = new THREE.Object3D(); walls.forEach((s, i) => { const [x1, z1] = toWorld(...(s.a as Pt)), [x2, z2] = toWorld(...(s.b as Pt)), mx = (s.a[0] + s.b[0]) / 2, my = (s.a[1] + s.b[1]) / 2, len = Math.hypot(x2 - x1, z2 - z1), h = (s.k === 'city_wall' ? 3.5 : 2) * KY;
    o.position.set((x1 + x2) / 2, Math.max(heightAt(mx, my), WATER_Y + .01) + h / 2, (z1 + z2) / 2); o.rotation.set(0, -Math.atan2(z2 - z1, x2 - x1), 0); o.scale.set(len, h, (s.k === 'city_wall' ? 1.6 : 1) * METER); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.count = walls.length; m.instanceMatrix.needsUpdate = true; }, [walls]);
  return <group>
    <instancedMesh ref={ref} args={[undefined, undefined, Math.max(1, walls.length)]} castShadow receiveShadow material={M.laterite}><boxGeometry args={[1, 1, 1]} /></instancedMesh>
    <Footprints items={osmRuins} h={3} material={M.stone} /><Footprints items={osmBuildings} h={5} material={M.white} />
  </group>;
}
/** Roads, stone paths and bridges. */
export function Roads() {
  const parts = useMemo(() => roads.map(r => { const pts = smoothOpen(r.pts, 8), road = r.kind === 'road'; return { id: r.id, edge: ribbonGeometry(pts, r.width + (road ? 3 : 2), .012), main: ribbonGeometry(pts, r.width, .016), edgeM: road ? M.roadEdge : M.pathEdge, mainM: road ? M.asphalt : M.pathStone }; }), []);
  return <group>
    {parts.map(p => <group key={p.id}><mesh geometry={p.edge} material={p.edgeM} receiveShadow renderOrder={1} /><mesh geometry={p.main} material={p.mainM} receiveShadow renderOrder={2} /></group>)}
    <group>{bridges.map(b => <BridgeMesh key={b.id} a={b.a} b={b.b} w={b.width} />)}</group>
  </group>;
}
function BridgeMesh({ a, b, w }: { a: Pt; b: Pt; w: number }) {
  const { deck, rails, posts } = useMemo(() => {
    const n = 14, pts: Pt[] = Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n] as Pt);
    const y0 = Math.max(heightAt(...a), heightAt(...b), WATER_Y) + .05, yAt = (i: number) => y0 + Math.sin(Math.PI * i / n) * .045;
    const deck = ribbonGeometry(pts, w, 0, { yFn: i => yAt(i) });
    const rails = [1, -1].map(s => ribbonGeometry(pts, .6, 0, { yFn: i => yAt(i) + .06 }));
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
    const posts = pts.filter((_, i) => i % 2 === 0).flatMap((p, k) => [1, -1].map(s => { const [x, z] = toWorld(p[0] + nx * w / 2 * s, p[1] + ny * w / 2 * s); return [x, yAt(k * 2) , z] as [number, number, number]; }));
    return { deck, rails: [rails[0]], posts };
  }, [a, b, w]);
  return <group><mesh geometry={deck} material={M.sandstone} castShadow receiveShadow />{posts.map((p, i) => <Bx key={i} s={[.02, .08, .02]} p={[p[0], p[1] + .04, p[2]]} m={M.stucco} />)}</group>;
}

const rnd = mulberry32(2569);
function scatter(count: number, test: (p: Pt) => boolean, tries = 40000) {
  const out: { x: number; z: number; gx: number; gy: number; s: number; r: number }[] = [];
  for (let t = 0; t < tries && out.length < count; t++) { const gx = BOUNDS_GRID.x0 + rnd() * (BOUNDS_GRID.x1 - BOUNDS_GRID.x0), gy = BOUNDS_GRID.y0 + rnd() * (BOUNDS_GRID.y1 - BOUNDS_GRID.y0), p: Pt = [gx, gy]; if (!test(p)) continue; const [x, z] = toWorld(gx, gy); out.push({ x, z, gx, gy, s: .7 + rnd() * .7, r: rnd() * 6.28 }); }
  return out;
}
const osmSites: Pt[] = [...osmRuins, ...osmBuildings].map(f => [f.pts[0][0], f.pts[0][1]] as Pt);
const clear = (p: Pt, pad: number) => !osmSites.some(s => Math.hypot(p[0] - s[0], p[1] - s[1]) < 8) && !sites.some(s => Math.hypot(p[0] - s[0], p[1] - s[1]) < pad) && roads.every(r => distToPolyline(p, r.pts) > r.width / 2 + 5) && waterDepth(p) === 0 && pondAt(p) < 0;
/** Instanced trees (3 silhouettes), bushes and grass tufts. */
export function Vegetation() {
  const refs = [useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null)];
  const data = useMemo(() => {
    const inside = scatter(200, p => insideVenue(p) && clear(p, 26)), outside = scatter(520, p => !insideVenue(p) && pondAt(p) < 0 && distToPolyline(p, boundary, true) > 10 && p[0] > BOUNDS_GRID.x0 + 12 && p[0] < BOUNDS_GRID.x1 - 12 && p[1] > BOUNDS_GRID.y0 + 12 && p[1] < BOUNDS_GRID.y1 - 12 && roads.every(r => distToPolyline(p, r.pts) > r.width / 2 + 4) && !osmSites.some(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < 8));
    const all = [...inside.map(t => ({ ...t, out: false })), ...outside.map(t => ({ ...t, out: true }))];
    const bushes = scatter(240, p => insideVenue(p) && clear(p, 20)), tufts = scatter(1600, p => insideVenue(p) && clear(p, 14));
    return { trees: [0, 1, 2].map(k => all.filter((_, i) => i % 3 === k)), bushes, tufts };
  }, []);
  useLayoutEffect(() => {
    const o = new THREE.Object3D(), col = new THREE.Color();
    data.trees.forEach((list, k) => { const trunk = refs[k].current!, crown = refs[3 + k]?.current; list.forEach((t, i) => { const h = heightAt(t.gx, t.gy), s = t.s * (t.out ? 1.25 : 1) * .11; o.position.set(t.x, h, t.z); o.rotation.set(0, t.r, 0); o.scale.setScalar(s * 1); o.updateMatrix(); trunk.setMatrixAt(i, o.matrix); if (crown) { crown.setMatrixAt(i, o.matrix); crown.setColorAt(i, col.setHSL(.27 + (rnd() - .5) * .06, .45 + rnd() * .2, .3 + rnd() * .1)); } }); trunk.instanceMatrix.needsUpdate = true; if (crown) { crown.instanceMatrix.needsUpdate = true; if (crown.instanceColor) crown.instanceColor.needsUpdate = true; } });
  }, [data]);
  const bushRef = useRef<THREE.InstancedMesh>(null), tuftRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => { const o = new THREE.Object3D(), c = new THREE.Color();
    data.bushes.forEach((b, i) => { o.position.set(b.x, heightAt(b.gx, b.gy) + .02, b.z); o.rotation.set(0, b.r, 0); o.scale.set(b.s * .05, b.s * .035, b.s * .05); o.updateMatrix(); bushRef.current!.setMatrixAt(i, o.matrix); bushRef.current!.setColorAt(i, c.setHSL(.3 + rnd() * .05, .5, .3 + rnd() * .12)); });
    data.tufts.forEach((b, i) => { o.position.set(b.x, heightAt(b.gx, b.gy), b.z); o.rotation.set(0, b.r, 0); o.scale.setScalar(b.s); o.updateMatrix(); tuftRef.current!.setMatrixAt(i, o.matrix); });
    for (const r of [bushRef.current!, tuftRef.current!]) r.instanceMatrix.needsUpdate = true; if (bushRef.current!.instanceColor) bushRef.current!.instanceColor.needsUpdate = true; }, [data]);
  const [a, b, c] = data.trees.map(l => l.length);
  return <group>
    {[a, b, c].map((n, k) => <instancedMesh key={`t${k}`} ref={refs[k]} args={[undefined, undefined, n]} material={M.trunk} castShadow><cylinderGeometry args={[.1, .14, k === 1 ? 1.5 : 1.1, 6]} onUpdate={g => g.translate(0, (k === 1 ? 1.5 : 1.1) / 2, 0)} /></instancedMesh>)}
    <instancedMesh ref={refs[3]} args={[undefined, undefined, a]} castShadow receiveShadow position={[0, 0, 0]}><icosahedronGeometry args={[.75, 1]} onUpdate={g => g.translate(0, 1.55, 0)} /><meshStandardMaterial flatShading roughness={.9} /></instancedMesh>
    <instancedMesh ref={refs[4]} args={[undefined, undefined, b]} castShadow receiveShadow><coneGeometry args={[.6, 1.9, 7]} onUpdate={g => g.translate(0, 1.55, 0)} /><meshStandardMaterial flatShading roughness={.9} /></instancedMesh>
    <instancedMesh ref={refs[5]} args={[undefined, undefined, c]} castShadow receiveShadow><sphereGeometry args={[1, 8, 6]} onUpdate={g => { g.scale(1.2, .65, 1.2); g.translate(0, 1.4, 0); }} /><meshStandardMaterial flatShading roughness={.9} /></instancedMesh>
    <instancedMesh ref={bushRef} args={[undefined, undefined, data.bushes.length]} castShadow><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial flatShading roughness={1} /></instancedMesh>
    <instancedMesh ref={tuftRef} args={[undefined, undefined, data.tufts.length]} material={M.grass}><coneGeometry args={[.012, .06, 4]} /></instancedMesh>
  </group>;
}
