'use client';
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, MapControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { scenery } from '@/data/layout';
import { pointWorld, type Point } from '@/data/points';
import { BOUNDS, VENUE, METER, VEXAG, hashString, mulberry32, toWorld } from '@/lib/geo';
import { WATER_Y, heightAt, pondAt } from '@/lib/terrain';
import { ponds } from '@/data/layout';
import { pointInPoly } from '@/lib/geo';
import { useMapStore, type TimeOfDay } from '@/store/useMapStore';
import { M, glowMaterials } from './materials';
import { OsmGround, Roads, Terrain, Vegetation, Water } from './environment';
import { HeritageAt } from './heritage';
import { Festive, UserDot } from './festive';
import { Emblem } from './symbols';
import { LOW } from '@/lib/perf';
import { inDiorama } from '@/lib/georef';
import { endpoint } from '@/lib/route';
import { Facility, Festival } from './structures';

const LOOK: Record<TimeOfDay, { sun: string; sunI: number; sunPos: [number, number, number]; hemiSky: string; hemiGround: string; hemiI: number; top: string; hor: string; glow: number }> = {
  day: { sun: '#fff4dc', sunI: 2.4, sunPos: [8, 14, 6], hemiSky: '#d6ecff', hemiGround: '#a99a66', hemiI: 1, top: '#6fb3ea', hor: '#f4ead2', glow: .05 },
  golden: { sun: '#ffb869', sunI: 2.7, sunPos: [-11, 6, 8], hemiSky: '#f6d9b0', hemiGround: '#9a7a4e', hemiI: .85, top: '#79a6d6', hor: '#ffc88a', glow: .35 },
  night: { sun: '#8fa8ff', sunI: .45, sunPos: [-6, 10, -5], hemiSky: '#4a62c8', hemiGround: '#1c2040', hemiI: .65, top: '#050c4a', hor: '#243c9c', glow: .8 },
};
const skyVert = `varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
const skyFrag = `uniform vec3 uTop; uniform vec3 uHor; varying vec3 vP; void main(){ float h=clamp(normalize(vP).y*1.6+.1,0.,1.); gl_FragColor=vec4(mix(uHor,uTop,pow(h,.7)),1.); }`;
function Atmosphere() {
  const time = useMapStore(s => s.time), sun = useRef<THREE.DirectionalLight>(null), sky = useRef<THREE.ShaderMaterial>(null), look = LOOK[time];
  useEffect(() => { sky.current!.uniforms.uTop.value.set(look.top); sky.current!.uniforms.uHor.value.set(look.hor); glowMaterials.forEach(m => (m.emissiveIntensity = look.glow + .25)); }, [look]);
  useLayoutEffect(() => { const s = sun.current!; s.target.position.set(VENUE[0], 0, VENUE[1]); s.target.updateMatrixWorld(); s.shadow.camera.left = -10; s.shadow.camera.right = 10; s.shadow.camera.top = 8; s.shadow.camera.bottom = -8; s.shadow.camera.near = 1; s.shadow.camera.far = 50; s.shadow.camera.updateProjectionMatrix(); }, []);
  return <>
    <mesh><sphereGeometry args={[90, 24, 16]} /><shaderMaterial ref={sky} side={THREE.BackSide} depthWrite={false} vertexShader={skyVert} fragmentShader={skyFrag} uniforms={{ uTop: { value: new THREE.Color(look.top) }, uHor: { value: new THREE.Color(look.hor) } }} /></mesh>
    <hemisphereLight args={[look.hemiSky, look.hemiGround, look.hemiI]} />
    {time === 'night' && <ambientLight color="#ffb878" intensity={.08} />}
    <directionalLight ref={sun} color={look.sun} intensity={look.sunI} position={[look.sunPos[0] + VENUE[0], look.sunPos[1], look.sunPos[2] + VENUE[1]]} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-.0004} shadow-normalBias={.03} />
  </>;
}

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { bad: boolean }> { state = { bad: false }; static getDerivedStateFromError() { return { bad: true }; } render() { return this.state.bad ? this.props.fallback : this.props.children; } }
function Glb({ url, scale }: { url: string; scale: number }) { const { scene } = useGLTF(url); const c = useMemo(() => scene.clone(true), [scene]); return <primitive object={c} scale={scale} />; }
function ModelSlot({ glb, scale, children }: { glb?: string; scale: number; children: ReactNode }) {
  if (!glb) return <>{children}</>;
  return <Boundary fallback={<>{children}</>}><Suspense fallback={<>{children}</>}><Glb url={glb} scale={scale} /></Suspense></Boundary>;
}
const HERITAGE = new Set(['wat-mahathat', 'wat-chana', 'noen-prasat', 'wat-mai', 'wat-sa-si', 'traphang-ngoen', 'monument', 'pond-feature']);
const FESTIVAL = new Set(['stage', 'tent', 'pavilion', 'platform', 'food', 'rest', 'arch', 'floating-pier']);
function PointModel({ p, selected }: { p: Point; selected: boolean }) {
  if (!inDiorama([p.x, p.y])) return null;
  const select = useMapStore(s => s.select);
  const [x, z] = pointWorld(p), ground = heightAt(p.x, p.y), inWater = p.category === 'activity' && pondAt([p.x, p.y]) >= 0;
  const model = inWater && FESTIVAL.has(p.model) ? 'floating-pier' : p.model, y = model === 'floating-pier' ? WATER_Y + .035 : Math.max(ground, WATER_Y + .01);
  const rot = p.category === 'landmark' ? 0 : (hashString(p.id) % 12) * Math.PI / 6;
  if (HERITAGE.has(model)) return <group onClick={e => { e.stopPropagation(); select(p.id); }} onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = ''; }}>
    <ModelSlot glb={p.glb} scale={1}><HeritageAt model={model} gx={p.x} gy={p.y} /></ModelSlot>
    {selected && <group position={[x, y, z]}><SelectionRing r={.62} /></group>}
  </group>;
  return <group position={[x, y, z]} rotation={[0, rot, 0]} scale={p.scale}
    onClick={e => { e.stopPropagation(); select(p.id); }} onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = ''; }}>
    <ModelSlot glb={p.glb} scale={1}>
      {FESTIVAL.has(model) ? <Festival kind={model} /> : <Facility kind={model} />}
      {p.symbol && <Emblem kind={p.symbol} lift={p.category === 'facility' ? .16 : .26} />}
    </ModelSlot>
    {selected && <SelectionRing r={p.category === 'landmark' ? .62 : .4} />}
  </group>;
}
function SelectionRing({ r }: { r: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(s => { const k = 1 + Math.sin(s.clock.elapsedTime * 3) * .06; ref.current!.scale.set(k, k, 1); });
  return <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, .03, 0]} renderOrder={5}><ringGeometry args={[r, r + .035, 40]} /><meshBasicMaterial color="#ffd24a" transparent opacity={.95} depthTest={false} /></mesh>;
}
function Scenery() { return <>{scenery.map(s => { return <HeritageAt key={s.id} model={s.model} gx={s.c[0]} gy={s.c[1]} />; })}</>; }
/** Orange path between the chosen route endpoints, draped over the terrain. */
function RouteLine() {
  const points = useMapStore(s => s.points), fromId = useMapStore(s => s.routeFrom), toId = useMapStore(s => s.routeTo), user = useMapStore(s => s.userPos);
  const a = endpoint(fromId, points, user), b = endpoint(toId, points, user), ak = a?.grid.join(), bk = b?.grid.join();
  const pts = useMemo(() => { if (!a || !b || fromId === toId) return null; const n = 48; return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, gx = a.grid[0] + (b.grid[0] - a.grid[0]) * t, gy = a.grid[1] + (b.grid[1] - a.grid[1]) * t, [x, z] = toWorld(gx, gy); return new THREE.Vector3(x, Math.max(heightAt(gx, gy), WATER_Y) + .12, z); }); }, [ak, bk, fromId, toId]); // eslint-disable-line react-hooks/exhaustive-deps
  return pts ? <Line points={pts} color="#ff7a1a" lineWidth={4} dashed dashSize={.12} gapSize={.07} renderOrder={6} /> : null;
}
const pinEls: Record<string, HTMLSpanElement | null> = {};
/** DOM pin overlay (outside the Canvas). Positions are written every frame by PinProjector. */
function Pins() {
  const lang = useMapStore(s => s.lang), points = useMapStore(s => s.points), query = useMapStore(s => s.query), category = useMapStore(s => s.category), selectedId = useMapStore(s => s.selectedId), select = useMapStore(s => s.select);
  const q = query.trim().toLowerCase();
  const shown = useMemo(() => points.filter(p => inDiorama([p.x, p.y]) && (category === 'all' || p.category === category) && (!q || [p.code, p.title.th, p.title.en, p.title.zh].some(s => s.toLowerCase().includes(q)))), [points, category, q, selectedId]);
  return <div className="pointer-events-none absolute inset-0 overflow-hidden">{shown.map(p => <span key={p.id} ref={el => { pinEls[p.id] = el; }} style={{ position: 'absolute', left: 0, top: 0, display: 'none', pointerEvents: 'auto' }}>
    <button type="button" title={p.title.en} className={`map-pin ${p.tags.includes('road') ? 'road' : ''} ${p.category} ${p.series ?? ''} ${selectedId === p.id ? 'selected' : ''} ${!p.verified ? 'unverified' : ''}`} onClick={() => select(p.id)}>{p.tags.includes('road') ? `ทล.${p.code}`.replace('ทล.', lang === 'th' ? 'ทล.' : lang === 'zh' ? '' : 'Hwy ') + (p.title[lang].split('→')[1] ? ` → ${p.title[lang].split('→')[1].trim()}` : '') : p.code}</button></span>)}</div>;
}
function PinProjector() {
  const { camera, size } = useThree(), v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => { const pts = useMapStore.getState().points; for (const p of pts) { const el = pinEls[p.id]; if (!el) continue; const [x, z] = pointWorld(p); v.set(x, Math.max(heightAt(p.x, p.y), WATER_Y) + (p.category === 'landmark' ? p.height * METER * VEXAG + .35 : .55), z).project(camera); el.style.display = v.z > 1 ? 'none' : ''; el.style.transform = `translate(${(v.x * .5 + .5) * size.width}px,${(-v.y * .5 + .5) * size.height}px) translate(-50%,-50%)`; el.style.zIndex = String(Math.round((1 - v.z) * 1000)); } });
  return null;
}
const [CX, CZ] = VENUE;
const VIEWS = { overview: { pos: [CX + 9, 11, CZ + 13] as const, tgt: [CX, 0, CZ] as const }, iso: { pos: [CX + 9, 7, CZ + 5.5] as const, tgt: [CX, 0, CZ] as const }, top: { pos: [CX, 19, CZ + .01] as const, tgt: [CX, 0, CZ] as const } };
function CameraRig() {
  const { camera, controls } = useThree(), c = controls as any, viewReq = useMapStore(s => s.viewReq), selectedId = useMapStore(s => s.selectedId), zoomReq = useMapStore(s => s.zoomReq), points = useMapStore(s => s.points);
  const goal = useRef<{ t: THREE.Vector3; p: THREE.Vector3 | null; d: number | null } | null>(null);
  useEffect(() => { if (!c) return; const stop = () => { goal.current = null; }; c.addEventListener('start', stop); return () => c.removeEventListener('start', stop); }, [c]);
  useEffect(() => { if (!viewReq) return; const v = VIEWS[viewReq.name]; goal.current = { t: new THREE.Vector3(...v.tgt), p: new THREE.Vector3(...v.pos), d: null }; }, [viewReq]);
  useEffect(() => { if (!selectedId) return; const p = points.find(q => q.id === selectedId); if (!p) return; const [x, z] = pointWorld(p); goal.current = { t: new THREE.Vector3(x, heightAt(p.x, p.y) + p.height * METER * VEXAG * .35 - p.focusDistance * .09, z), p: null, d: p.focusDistance * 2 }; }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!c || !zoomReq) return; const off = camera.position.clone().sub(c.target); off.setLength(THREE.MathUtils.clamp(off.length() * (zoomReq > 0 ? 1 / 1.35 : 1.35), c.minDistance, c.maxDistance)); camera.position.copy(c.target).add(off); c.update(); }, [zoomReq]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((_, dt) => {
    if (!c) return; const g = goal.current, k = 1 - Math.exp(-5 * dt);
    if (g) {
      const off = camera.position.clone().sub(c.target); c.target.lerp(g.t, k);
      if (g.p) camera.position.lerp(g.p, k); else { off.setLength(THREE.MathUtils.lerp(off.length(), g.d ?? off.length(), k)); camera.position.copy(c.target).add(off); }
      if (c.target.distanceTo(g.t) < .01 && (g.p ? camera.position.distanceTo(g.p) < .02 : Math.abs(off.length() - (g.d ?? off.length())) < .02)) goal.current = null;
    }
    c.target.x = THREE.MathUtils.clamp(c.target.x, BOUNDS.x0, BOUNDS.x1); c.target.z = THREE.MathUtils.clamp(c.target.z, BOUNDS.z0, BOUNDS.z1); c.update();
  });
  return null;
}
function World() {
  const points = useMapStore(s => s.points), selectedId = useMapStore(s => s.selectedId);
  return <>
    <Atmosphere /><Terrain /><Water /><Roads /><OsmGround /><Vegetation /><Scenery /><RouteLine /><Festive /><UserDot />
    {points.map(p => <PointModel key={p.id} p={p} selected={selectedId === p.id} />)}
    <PinProjector />
    <MapControls makeDefault target={[CX, 0, CZ]} enableDamping dampingFactor={.09} minDistance={1.5} maxDistance={46} minPolarAngle={.05} maxPolarAngle={1.42} screenSpacePanning={false} />
    <CameraRig />
  </>;
}
export default function Scene() {
  return <div className="absolute inset-0 isolate"><Canvas shadows={!LOW} dpr={LOW ? [1, 1.25] : [1, 1.75]} camera={{ position: [...VIEWS.overview.pos], fov: 32, near: .3, far: 200 }} onCreated={({ camera }) => camera.lookAt(...VIEWS.overview.tgt)} gl={{ antialias: !LOW, powerPreference: 'high-performance' }} style={{ touchAction: 'none' }}>
    <Suspense fallback={null}><World /></Suspense>
  </Canvas><Pins /></div>;
}
