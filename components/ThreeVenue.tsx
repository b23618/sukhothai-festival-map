'use client';
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { Html, MapControls, useTexture } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';
import type { Point } from '@/data/points';

const IMAGE_W=1000,IMAGE_H=705,W=20,H=14.1;
export function pixelToWorld(x:number,y:number):[number,number,number] { return [(x/IMAGE_W-.5)*W,(.5-y/IMAGE_H)*H,.03]; }
function Ground({onPick}:{onPick?:(x:number,y:number)=>void}){
 const texture=useTexture('/maps/sukhothai-2569.png');const gl=useThree(s=>s.gl);
 useEffect(()=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=gl.capabilities.getMaxAnisotropy();texture.needsUpdate=true},[texture,gl]);
 const onClick=(e:ThreeEvent<MouseEvent>)=>{if(!onPick||!e.uv)return;onPick(Math.round(e.uv.x*IMAGE_W),Math.round((1-e.uv.y)*IMAGE_H))};
 return <mesh onClick={onClick}><planeGeometry args={[W,H]}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>;
}
const PIN_H=.5;
function Pin({point,active,onSelect}:{point:Point;active:boolean;onSelect:(id:string)=>void}){
 return <group position={pixelToWorld(point.x,point.y)}>
 <mesh position={[0,0,PIN_H/2]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.012,.012,PIN_H,6]}/><meshBasicMaterial color={active?'#c2410c':'#5b4a2e'}/></mesh>
 <mesh position={[0,0,.005]}><circleGeometry args={[.07,16]}/><meshBasicMaterial color="#5b4a2e" transparent opacity={.45}/></mesh>
 <Html position={[0,0,PIN_H]} center transform={false} zIndexRange={[20,0]}>
 <button type="button" title={point.title.en} className={`map-pin ${point.category} ${active?'selected':''} ${!point.verified?'unverified':''}`} onClick={(e)=>{e.stopPropagation();onSelect(point.id)}}>{point.code}</button>
 </Html></group>;
}
const MIN_DIST=10,MAX_DIST=32;
function CameraZoom({zoomRequest}:{zoomRequest:number}){
 const {camera,controls,invalidate}=useThree();
 useEffect(()=>{const c=controls as any;if(!zoomRequest||!c)return;const off=camera.position.clone().sub(c.target);off.setLength(Math.max(MIN_DIST,Math.min(MAX_DIST,off.length()*(zoomRequest>0?1/1.3:1.3))));camera.position.copy(c.target).add(off);c.update();invalidate()},[zoomRequest,camera,controls,invalidate]);
 return null;
}
export default function ThreeVenue({points,selectedId,onSelect,onPick,zoomRequest}:{points:Point[];selectedId:string|null;onSelect:(id:string)=>void;onPick?:(x:number,y:number)=>void;zoomRequest:number}){
 return <Canvas camera={{up:[0,0,1],position:[0,-9,13],fov:45,near:.1,far:100}} gl={{antialias:true,alpha:false}} style={{touchAction:'none'}}>
 <color attach="background" args={['#ece4d1']}/>
 <Ground onPick={onPick}/>
 {points.map(point=><Pin key={point.id} point={point} active={selectedId===point.id} onSelect={onSelect}/>)}
 <MapControls makeDefault enableRotate enablePan enableZoom minDistance={MIN_DIST} maxDistance={MAX_DIST} maxPolarAngle={1.2} screenSpacePanning={false} />
 <CameraZoom zoomRequest={zoomRequest}/>
 </Canvas>;
}
