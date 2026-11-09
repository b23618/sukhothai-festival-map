'use client';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mulberry32 } from '@/lib/geo';
import { M, sign } from './materials';
import { Bx } from './heritage';
type V3 = [number, number, number];
const Post = ({ p, h, r = .012, m = M.white }: { p: V3; h: number; r?: number; m?: THREE.Material }) => <mesh position={[p[0], p[1] + h / 2, p[2]]} material={m} castShadow><cylinderGeometry args={[r, r, h, 6]} /></mesh>;
const Lamp = ({ p, s = .018, m = M.lantern }: { p: V3; s?: number; m?: THREE.Material }) => <mesh position={p} material={m}><sphereGeometry args={[s, 8, 6]} /></mesh>;
const Roof = ({ p, r, h, m = M.roofRed, rot = Math.PI / 4 }: { p: V3; r: number; h: number; m?: THREE.Material; rot?: number }) => <mesh position={p} rotation={[0, rot, 0]} material={m} castShadow><coneGeometry args={[r, h, 4]} /></mesh>;
function Sign({ p, text, bg, size = .09 }: { p: V3; text: string; bg: string; size?: number }) { const m = sign(text, bg); return <group position={p}><Post p={[0, 0, 0]} h={size * 1.6} r={.006} m={M.dark} /><mesh position={[0, size * 1.6 + size / 2, 0]} material={m}><planeGeometry args={[size, size]} /></mesh><mesh position={[0, size * 1.6 + size / 2, -.002]} rotation={[0, Math.PI, 0]} material={m}><planeGeometry args={[size, size]} /></mesh></group>; }
/** Generic festival set-pieces. They illustrate "a place where something happens"; they do not identify any real event. */
export function Festival({ kind }: { kind: string }) {
  switch (kind) {
    case 'stage': return <group><Bx s={[.56, .06, .34]} p={[0, .03, 0]} m={M.teak} /><Bx s={[.56, .3, .02]} p={[0, .21, -.16]} m={M.roofRed} /><Bx s={[.6, .025, .38]} p={[0, .38, 0]} m={M.roofGold} r={[.08, 0, 0]} />
      {[-.26, .26].map(x => <Post key={x} p={[x, .06, .15]} h={.32} />)}{[-.2, -.1, 0, .1, .2].map(x => <Lamp key={x} p={[x, .36, .17]} />)}</group>;
    case 'tent': return <group>{[[-.14, -.14], [.14, -.14], [-.14, .14], [.14, .14]].map(([x, z], i) => <Post key={i} p={[x, 0, z]} h={.15} />)}<Roof p={[0, .2, 0]} r={.26} h={.12} m={M.white} /><Roof p={[0, .17, 0]} r={.275} h={.07} m={M.red} />{[-.08, .08].map(x => <Bx key={x} s={[.1, .04, .08]} p={[x, .02, 0]} m={M.teak} />)}</group>;
    case 'pavilion': return <group><Bx s={[.4, .035, .4]} p={[0, .018, 0]} m={M.stone} />{[[-.16, -.16], [.16, -.16], [-.16, .16], [.16, .16]].map(([x, z], i) => <Post key={i} p={[x, .035, z]} h={.2} r={.017} m={M.teak} />)}<Roof p={[0, .3, 0]} r={.34} h={.13} m={M.roofRed} /><Roof p={[0, .38, 0]} r={.2} h={.12} m={M.roofGold} /><Lamp p={[0, .15, 0]} s={.03} /></group>;
    case 'platform': return <group><mesh position={[0, .025, 0]} material={M.stone} castShadow receiveShadow><cylinderGeometry args={[.28, .3, .05, 20]} /></mesh>{Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return <group key={i}><Post p={[Math.cos(a) * .26, .05, Math.sin(a) * .26]} h={.2} r={.008} m={M.dark} /><Lamp p={[Math.cos(a) * .26, .27, Math.sin(a) * .26]} s={.02} /></group>; })}<mesh position={[0, .06, 0]} material={M.gold}><cylinderGeometry args={[.06, .08, .02, 8]} /></mesh></group>;
    case 'food': return <group>{[-.26, 0, .26].map((x, i) => <group key={i} position={[x, 0, 0]}><Bx s={[.2, .08, .1]} p={[0, .04, 0]} m={M.teak} /><Bx s={[.23, .015, .15]} p={[0, .2, .0]} m={[M.red, M.orange, M.blue][i]} r={[.25, 0, 0]} />{[-.1, .1].map(px => <Post key={px} p={[px, 0, -.04]} h={.19} r={.007} />)}<Lamp p={[0, .17, .06]} s={.014} /></group>)}</group>;
    case 'rest': return <group>{[-.15, .15].map((x, i) => <group key={i}><Bx s={[.16, .02, .07]} p={[x, .06, .1]} m={M.teak} />{[-.06, .06].map(l => <Bx key={l} s={[.01, .06, .06]} p={[x + l, .03, .1]} m={M.dark} />)}</group>)}<Post p={[0, 0, -.08]} h={.2} r={.008} m={M.dark} /><mesh position={[0, .22, -.08]} material={M.orange} castShadow><coneGeometry args={[.17, .06, 10]} /></mesh></group>;
    case 'arch': return <group>{[-.2, .2].map(x => <Post key={x} p={[x, 0, 0]} h={.3} r={.02} m={M.roofGold} />)}<mesh position={[0, .3, 0]} material={M.roofRed} castShadow><torusGeometry args={[.2, .018, 6, 14, Math.PI]} /></mesh>{[-.15, -.07, 0, .07, .15].map((x, i) => <Lamp key={i} p={[x, .27 - Math.abs(x) * .25, 0]} s={.02} />)}</group>;
    case 'floating-pier': return <group>{Array.from({ length: 6 }, (_, i) => <Bx key={i} s={[.1, .012, .32]} p={[-.25 + i * .1, .0, 0]} m={M.teak} />)}{[-.28, .28].flatMap(x => [-.14, .14].map(z => <Post key={`${x}${z}`} p={[x, -.05, z]} h={.13} r={.012} m={M.teak} />))}<Lamp p={[-.28, .1, -.14]} /><Lamp p={[.28, .1, .14]} /></group>;
    default: return null;
  }
}
const carColors = ['#c0392b', '#2b6fa8', '#e9e6dc', '#3b3a38', '#d9a521', '#2f8f5a'];
function ParkingLot() {
  const bodies = useRef<THREE.InstancedMesh>(null), cabins = useRef<THREE.InstancedMesh>(null), lines = useRef<THREE.InstancedMesh>(null);
  const slots = useMemo(() => { const a: { x: number; z: number; c: THREE.Color }[] = [], r = mulberry32(17); for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) if (r() < .6) a.push({ x: -.25 + i * .1, z: j ? .1 : -.1, c: new THREE.Color(carColors[Math.floor(r() * carColors.length)]) }); return a; }, []);
  useLayoutEffect(() => { const o = new THREE.Object3D(); slots.forEach((s, i) => { o.position.set(s.x, .024, s.z); o.updateMatrix(); bodies.current!.setMatrixAt(i, o.matrix); bodies.current!.setColorAt(i, s.c); o.position.set(s.x, .042, s.z); o.updateMatrix(); cabins.current!.setMatrixAt(i, o.matrix); });
    for (let i = 0; i < 7; i++) { o.position.set(-.3 + i * .1, .006, 0); o.updateMatrix(); lines.current!.setMatrixAt(i, o.matrix); for (const r of [bodies.current!, cabins.current!, lines.current!]) r.instanceMatrix.needsUpdate = true; } bodies.current!.instanceColor!.needsUpdate = true; }, [slots]);
  return <group><Bx s={[.72, .012, .46]} p={[0, .003, 0]} m={M.asphalt} /><instancedMesh ref={lines} args={[undefined, undefined, 7]} material={M.white}><boxGeometry args={[.006, .002, .4]} /></instancedMesh>
    <instancedMesh ref={bodies} args={[undefined, undefined, slots.length]} castShadow><boxGeometry args={[.065, .026, .12]} /><meshStandardMaterial roughness={.5} /></instancedMesh>
    <instancedMesh ref={cabins} args={[undefined, undefined, slots.length]} material={M.dark}><boxGeometry args={[.05, .02, .06]} /></instancedMesh><Sign p={[-.31, 0, -.2]} text="P" bg="#1f5fa8" /></group>;
}
export function Facility({ kind }: { kind: string }) {
  switch (kind) {
    case 'parking': return <ParkingLot />;
    case 'hospital': return <group><Bx s={[.26, .14, .2]} p={[0, .07, 0]} m={M.white} /><Bx s={[.28, .02, .22]} p={[0, .15, 0]} m={M.stone} /><Bx s={[.1, .03, .004]} p={[0, .09, .102]} m={M.green} /><Bx s={[.03, .1, .004]} p={[0, .09, .102]} m={M.green} /><Sign p={[.2, 0, .12]} text="+" bg="#2f8f5a" /></group>;
    case 'hq': return <group><Bx s={[.3, .12, .2]} p={[0, .06, 0]} m={M.stucco} /><mesh position={[0, .18, 0]} rotation={[0, Math.PI / 4, 0]} material={M.roofRed} castShadow><coneGeometry args={[.24, .1, 4]} /></mesh><Sign p={[.2, 0, .12]} text="HQ" bg="#a83b2b" /></group>;
    case 'wc': return <group><Bx s={[.2, .12, .14]} p={[0, .06, 0]} m={M.stucco} /><Bx s={[.22, .02, .16]} p={[0, .13, 0]} m={M.blue} /><Sign p={[.15, 0, .1]} text="WC" bg="#2b6fa8" /></group>;
    case 'bus-stop': return <group><Bx s={[.3, .015, .14]} p={[0, .2, 0]} m={M.blue} />{[-.13, .13].map(x => <Post key={x} p={[x, 0, 0]} h={.2} r={.008} m={M.dark} />)}<Bx s={[.22, .02, .05]} p={[0, .05, -.03]} m={M.teak} /><Sign p={[.2, 0, 0]} text="BUS" bg="#6d3f9b" /></group>;
    case 'vip-tent': return <group>{[[-.15, -.12], [.15, -.12], [-.15, .12], [.15, .12]].map(([x, z], i) => <Post key={i} p={[x, 0, z]} h={.16} r={.01} m={M.roofGold} />)}<Roof p={[0, .22, 0]} r={.27} h={.14} m={M.roofGold} /><Bx s={[.28, .006, .22]} p={[0, .004, 0]} m={M.red} /><Sign p={[.22, 0, .12]} text="VIP" bg="#b8862b" /></group>;
    case 'gate': return <group>{[-.2, .2].map(x => <Post key={x} p={[x, 0, 0]} h={.34} r={.025} m={M.roofRed} />)}<Bx s={[.5, .04, .06]} p={[0, .34, 0]} m={M.roofGold} /><Roof p={[0, .42, 0]} r={.3} h={.12} m={M.roofRed} rot={0} /><Roof p={[0, .5, 0]} r={.16} h={.1} m={M.roofGold} rot={0} /></group>;
    default: return null;
  }
}
