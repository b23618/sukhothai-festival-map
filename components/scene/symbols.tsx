'use client';
import { useRef, type ReactElement } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SymbolKind } from '@/data/points';
// Recognisable emblems floating above set-pieces so visitors can tell what a spot is at a glance (see components/Legend.tsx).
// Pictograms are generic icons, not documented installations; the Nang Noppamas figure is a stylised stand-in.
const mat = (c: string, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .7, ...o });
const S = {
  gold: mat('#e0b02a', { metalness: .4, roughness: .4, emissive: '#6b4a05', emissiveIntensity: .3 }), pink: mat('#e0487f'), skin: mat('#f0c8a0'), hair: mat('#2a1a14'), white: mat('#fbf8f0'), ivory: mat('#f3e8d0'), dark: mat('#2c2c2c'),
  red: mat('#d6382f'), blue: mat('#1f67c0'), green: mat('#3aa05a'), wood: mat('#8a5a35'), shell: mat('#f5ead2', { roughness: .35 }), glow: new THREE.MeshBasicMaterial({ color: '#ffb23a', toneMapped: false }), lotus: mat('#f08fb0'), leaf: mat('#3f8f45'),
};
type V3 = [number, number, number];
const Cyl = ({ p, r, h, m, r2 }: { p: V3; r: number; h: number; m: THREE.Material; r2?: number }) => <mesh position={p} material={m} castShadow><cylinderGeometry args={[r2 ?? r, r, h, 12]} /></mesh>;
const Box = ({ p, s, m, rot }: { p: V3; s: V3; m: THREE.Material; rot?: V3 }) => <mesh position={p} rotation={rot} material={m} castShadow><boxGeometry args={s} /></mesh>;
const Ball = ({ p, r, m, s }: { p: V3; r: number; m: THREE.Material; s?: V3 }) => <mesh position={p} scale={s} material={m} castShadow><sphereGeometry args={[r, 14, 10]} /></mesh>;
const Cone = ({ p, r, h, m, seg = 12, rot }: { p: V3; r: number; h: number; m: THREE.Material; seg?: number; rot?: V3 }) => <mesh position={p} rotation={rot} material={m} castShadow><coneGeometry args={[r, h, seg]} /></mesh>;

/** Nang Noppamas: woman in traditional Thai dress with a gold pointed crown, holding a lotus krathong. */
function Nang() {
  return <group>
    <Cone p={[0, .13, 0]} r={.1} h={.26} m={S.pink} seg={16} /><Box p={[0, .17, 0]} s={[.22, .03, .1]} m={S.gold} rot={[0, 0, -.9]} />
    <Cyl p={[0, .31, 0]} r={.04} h={.1} m={S.pink} />
    <Ball p={[0, .395, 0]} r={.04} m={S.skin} /><Ball p={[0, .405, -.012]} r={.043} m={S.hair} s={[1, .9, 1]} />
    <Cone p={[0, .485, 0]} r={.035} h={.11} m={S.gold} seg={8} /><Cyl p={[0, .435, 0]} r={.045} h={.02} m={S.gold} />
    <Cyl p={[.07, .27, .06]} r={.012} h={.13} m={S.skin} /><Cyl p={[-.07, .27, .06]} r={.012} h={.13} m={S.skin} />
    <group position={[0, .22, .11]}><Cyl p={[0, 0, 0]} r={.05} h={.015} m={S.leaf} />{Array.from({ length: 6 }, (_, i) => { const a = i / 6 * 6.283; return <Cone key={i} p={[Math.cos(a) * .035, .018, Math.sin(a) * .035]} r={.014} h={.04} m={S.lotus} seg={5} rot={[Math.sin(a) * .8, 0, -Math.cos(a) * .8]} />; })}<Cyl p={[0, .03, 0]} r={.008} h={.04} m={S.ivory} /><Ball p={[0, .06, 0]} r={.008} m={S.glow} /></group>
  </group>;
}
/** Market stall: striped awning over a counter with goods. */
function Market() {
  return <group>
    {[[-.14, -.09], [.14, -.09], [-.14, .09], [.14, .09]].map(([x, z], i) => <Cyl key={i} p={[x, .1, z]} r={.008} h={.2} m={S.wood} />)}
    {Array.from({ length: 6 }, (_, i) => <Box key={i} p={[-.125 + i * .05, .225, 0]} s={[.05, .012, .24]} m={i % 2 ? S.white : S.red} rot={[0, 0, 0]} />)}
    <Box p={[0, .06, 0]} s={[.3, .025, .12]} m={S.wood} /><Box p={[-.09, .09, 0]} s={[.07, .04, .06]} m={S.green} /><Ball p={[.02, .095, 0]} r={.03} m={mat('#e8902a')} /><Box p={[.1, .09, 0]} s={[.06, .035, .06]} m={S.pink} />
  </group>;
}
/** Cowrie shell (bia), the old Sukhothai-era currency, for the cowrie-exchange market. */
function Cowrie() {
  return <group>
    <Ball p={[0, .17, 0]} r={.1} m={S.shell} s={[1, .66, 1.45]} /><Box p={[0, .225, 0]} s={[.014, .02, .2]} m={S.dark} />
    {Array.from({ length: 7 }, (_, i) => <Box key={i} p={[0, .22 + .01, -.075 + i * .025]} s={[.045, .008, .008]} m={S.ivory} />)}
    {[[-.13, .04], [.13, .06], [.02, -.15]].map(([x, z], i) => <Ball key={i} p={[x, .04, z]} r={.035} m={S.shell} s={[1, .66, 1.45]} />)}
  </group>;
}
function Krathong() {
  return <group><Cyl p={[0, .04, 0]} r={.1} h={.06} m={mat('#d9d28a')} /><Cyl p={[0, .075, 0]} r={.08} h={.02} m={S.leaf} />{Array.from({ length: 10 }, (_, i) => { const a = i / 10 * 6.283; return <Cone key={i} p={[Math.cos(a) * .065, .13, Math.sin(a) * .065]} r={.02} h={.1} m={S.lotus} seg={5} rot={[Math.sin(a) * 1, 0, -Math.cos(a) * 1]} />; })}<Cyl p={[0, .15, 0]} r={.012} h={.1} m={S.ivory} /><Cone p={[0, .225, 0]} r={.011} h={.04} m={S.glow} seg={6} /></group>;
}
function Fireworks() {
  const cols = ['#ff4d4d', '#ffd24a', '#4dd2ff', '#7dff6a', '#ff7be0', '#ffffff'];
  return <group position={[0, .26, 0]}><Ball p={[0, 0, 0]} r={.015} m={S.glow} />{Array.from({ length: 16 }, (_, i) => { const a = i / 16 * 6.283, up = i % 2 ? .5 : -.1; return <mesh key={i} position={[Math.cos(a) * .09, up * .1, Math.sin(a) * .09]} rotation={[Math.sin(a) * 1.57, 0, -Math.cos(a) * 1.57]}><coneGeometry args={[.01, .1, 4]} /><meshBasicMaterial color={cols[i % cols.length]} toneMapped={false} /></mesh>; })}<Cyl p={[0, -.2, 0]} r={.008} h={.4} m={S.wood} /></group>;
}
function Candle() {
  return <group><Cyl p={[0, .1, 0]} r={.035} h={.2} m={S.ivory} /><Cone p={[0, .24, 0]} r={.022} h={.07} m={S.glow} seg={8} /><Cyl p={[0, .015, 0]} r={.07} h={.03} m={S.gold} /></group>;
}
/** Toilet sign: man and woman pictogram on a blue board. */
function Wc() {
  return <group>
    <Cyl p={[0, .15, 0]} r={.007} h={.3} m={S.dark} /><Box p={[0, .36, 0]} s={[.26, .2, .02]} m={S.blue} />
    <group position={[-.055, .36, .012]}><Ball p={[0, .055, 0]} r={.018} m={S.white} /><Box p={[0, -.005, 0]} s={[.035, .06, .01]} m={S.white} /><Box p={[-.012, -.06, 0]} s={[.012, .05, .01]} m={S.white} /><Box p={[.012, -.06, 0]} s={[.012, .05, .01]} m={S.white} /></group>
    <group position={[.06, .36, .012]}><Ball p={[0, .055, 0]} r={.018} m={S.white} /><Cone p={[0, -.005, 0]} r={.03} h={.075} m={S.white} seg={3} /><Box p={[-.008, -.06, 0]} s={[.01, .045, .01]} m={S.white} /><Box p={[.008, -.06, 0]} s={[.01, .045, .01]} m={S.white} /></group>
    <Box p={[0, .275, .012]} s={[.2, .004, .005]} m={S.white} />
  </group>;
}
function Parking() {
  return <group><Cyl p={[0, .15, 0]} r={.007} h={.3} m={S.dark} /><Box p={[0, .36, 0]} s={[.2, .2, .02]} m={S.blue} /><Box p={[-.03, .36, .012]} s={[.025, .12, .008]} m={S.white} /><Box p={[.01, .395, .012]} s={[.07, .025, .008]} m={S.white} /><Box p={[.04, .365, .012]} s={[.025, .06, .008]} m={S.white} /><Box p={[.01, .34, .012]} s={[.07, .025, .008]} m={S.white} /></group>;
}
function FirstAid() {
  return <group><Cyl p={[0, .15, 0]} r={.007} h={.3} m={S.dark} /><Box p={[0, .36, 0]} s={[.2, .2, .02]} m={S.white} /><Box p={[0, .36, .012]} s={[.12, .04, .008]} m={S.red} /><Box p={[0, .36, .012]} s={[.04, .12, .008]} m={S.red} /></group>;
}
function Bus() {
  return <group><Cyl p={[0, .15, 0]} r={.007} h={.3} m={S.dark} /><Box p={[0, .36, 0]} s={[.22, .2, .02]} m={S.green} /><Box p={[0, .37, .012]} s={[.14, .08, .008]} m={S.white} /><Ball p={[-.04, .32, .014]} r={.012} m={S.dark} /><Ball p={[.04, .32, .014]} r={.012} m={S.dark} /></group>;
}
const EMBLEMS: Record<SymbolKind, () => ReactElement> = { nang: Nang, market: Market, cowrie: Cowrie, krathong: Krathong, fireworks: Fireworks, candle: Candle, wc: Wc, parking: Parking, firstaid: FirstAid, bus: Bus };
const Y = new THREE.Vector3(0, 1, 0), tmpP = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpT = new THREE.Quaternion();
/** Small plain emblem that always turns to face the camera (flat pictograms stay readable); `lift` raises it above the set-piece below. */
export function Emblem({ kind, lift = .3 }: { kind: SymbolKind; lift?: number }) {
  const ref = useRef<THREE.Group>(null), E = EMBLEMS[kind];
  useFrame(({ camera }) => { const g = ref.current; if (!g?.parent) return; g.getWorldPosition(tmpP); g.parent.getWorldQuaternion(tmpQ); tmpT.setFromAxisAngle(Y, Math.atan2(camera.position.x - tmpP.x, camera.position.z - tmpP.z)); g.quaternion.copy(tmpQ.invert().multiply(tmpT)); });
  return <group ref={ref} position={[0, lift, 0]} scale={.5}><E /></group>;
}
