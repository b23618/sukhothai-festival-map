'use client';
import dynamic from 'next/dynamic';
import {useEffect,useMemo,useState} from 'react';
import {Search, MapPin, Landmark, CalendarDays, Wrench, Menu, X, Plus, Minus, Download, Navigation, Languages, Info, LocateFixed} from 'lucide-react';
import {allInitialPoints,type Category,type Language,type Point} from '@/data/points';
const ThreeVenue=dynamic(()=>import('./ThreeVenue'),{ssr:false,loading:()=> <div className="loading">Loading map…</div>});
const translations={
 th:{brand:'สุโขทัย ลอยกระทง 2569',sub:'แผนที่ท่องเที่ยวแบบอินเทอร์แอคทีฟ',search:'ค้นหาวัด กิจกรรม หรือหมายเลข...',all:'ทั้งหมด',landmark:'โบราณสถาน',activity:'กิจกรรม',facility:'บริการ',explore:'สำรวจสถานที่',empty:'ไม่พบสถานที่',count:'จุดบนแผนที่',select:'เลือกหมุดเพื่อดูรายละเอียด',coordinates:'พิกัดบนภาพ',approx:'พิกัดหมุดเป็นค่าเริ่มต้น โปรดตรวจสอบก่อนเผยแพร่',editor:'โหมดแก้ไขพิกัด',editorHelp:'เลือกจุดจากรายการ แล้วคลิกบนแผนที่เพื่อย้ายหมุด',export:'ส่งออก JSON',original:'ดูภาพต้นฉบับ',location:'ค้นหาตำแหน่ง GPS',gpsNote:'ยังไม่รองรับการนำทางจริง ต้องตั้งค่าพิกัดภูมิศาสตร์และเครือข่ายเส้นทางก่อน',warning:'ชื่อและเวลาแสดงกิจกรรมยังรอยืนยันจากผู้จัดงาน',close:'ปิด',instructions:'ลากเพื่อเลื่อน • คลิกขวาหรือสองนิ้วเพื่อหมุน/เอียง • เลื่อนล้อเพื่อซูม'},
 en:{brand:'Sukhothai Festival 2026',sub:'Interactive visitor map',search:'Search temples, activities or numbers...',all:'All',landmark:'Heritage',activity:'Activities',facility:'Services',explore:'Explore places',empty:'No places found',count:'points on map',select:'Select a marker to see details',coordinates:'Image coordinates',approx:'Marker coordinates are provisional. Verify before publishing.',editor:'Coordinate edit mode',editorHelp:'Choose a point from the list, then click the map to reposition it',export:'Export JSON',original:'Original map',location:'Find my GPS location',gpsNote:'GPS routing is not yet available. Real coordinates and a walking network are needed.',warning:'Activity names and times await organizer verification',close:'Close',instructions:'Drag to pan • Right-drag or two fingers to rotate/tilt • Scroll to zoom'},
 zh:{brand:'素可泰水灯节 2026',sub:'互动游客地图',search:'搜索寺庙、活动或编号...',all:'全部',landmark:'古迹',activity:'活动',facility:'服务',explore:'探索地点',empty:'未找到地点',count:'地图地点',select:'选择标记查看详情',coordinates:'图片坐标',approx:'标记位置为暂定值，发布前请核对。',editor:'坐标编辑模式',editorHelp:'先选择地点，再点击地图移动标记',export:'导出 JSON',original:'原始地图',location:'查找 GPS 位置',gpsNote:'尚未提供 GPS 导航，需要实际地理坐标和步行路径数据。',warning:'活动名称和时间需主办方确认',close:'关闭',instructions:'拖动平移 • 右键或双指旋转/倾斜 • 滚轮缩放'}
};
const categories:('all'|Category)[]=['all','landmark','activity','facility'];
const types:Record<'all'|Category,typeof Landmark>={all:MapPin,landmark:Landmark,activity:CalendarDays,facility:Wrench};
export default function FestivalExplorer(){
 const [lang,setLang]=useState<Language>('th'); const [points,setPoints]=useState<Point[]>(allInitialPoints);
 const [query,setQuery]=useState('');const [category,setCategory]=useState<'all'|Category>('all');const [selectedId,setSelectedId]=useState<string|null>(null);
 const [editor,setEditor]=useState(false); const [zoomRequest,setZoomRequest]=useState(0);const [mobileList,setMobileList]=useState(false);const [gpsMessage,setGpsMessage]=useState(false);
 const ui=translations[lang];
 const filtered=useMemo(()=>points.filter(p=>(category==='all'||p.category===category)&&[p.code,p.title.th,p.title.en,p.title.zh].some(s=>s.toLowerCase().includes(query.trim().toLowerCase()))),[points,category,query]);
 const selected=points.find(p=>p.id===selectedId)||null;
 useEffect(()=>{try{const stored=localStorage.getItem('sukhothai-map-points-v1');if(stored){const parsed=JSON.parse(stored);if(Array.isArray(parsed)&&parsed.every((p:any)=>typeof p.x==='number'&&typeof p.y==='number'&&typeof p.id==='string'))setPoints(parsed)}}catch{}},[]);
 function updatePosition(x:number,y:number){if(!editor||!selectedId)return;setPoints(prev=>{const next=prev.map(p=>p.id===selectedId?{...p,x,y}:p);try{localStorage.setItem('sukhothai-map-points-v1',JSON.stringify(next))}catch{}return next})}
 function downloadData(){const blob=new Blob([JSON.stringify(points,null,2)],{type:'application/json'});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='sukhothai-map-points.json';a.click();URL.revokeObjectURL(href)}
 const categoryButtons=categories.map(c=>{const Icon=types[c];return <button key={c} className={`filter ${category===c?'on':''}`} onClick={()=>setCategory(c)}><Icon size={16}/>{ui[c]}</button>});
 return <main className="shell">
 <header className="topbar"><div className="brand"><span className="brand-icon">✦</span><div><h1>{ui.brand}</h1><p>{ui.sub}</p></div></div>
 <div className="header-actions"><a className="source-link" href="/maps/sukhothai-2569.png" target="_blank" rel="noreferrer">{ui.original}</a><label className="lang-control"><Languages size={16}/><select value={lang} onChange={e=>setLang(e.target.value as Language)} aria-label="Language"><option value="th">ไทย</option><option value="en">English</option><option value="zh">中文</option></select></label><button className="mobile-menu" onClick={()=>setMobileList(!mobileList)} aria-label="Menu">{mobileList?<X/>:<Menu/>}</button></div></header>
 <div className="workspace">
 <aside className={`sidebar ${mobileList?'show':''}`}><div className="sidebar-head"><div className="eyebrow">EXPLORE SUKHOTHAI</div><h2>{ui.explore}</h2><div className="search-box"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={ui.search}/>{query&&<button onClick={()=>setQuery('')} aria-label={ui.close}><X size={16}/></button>}</div></div>
 <div className="filters">{categoryButtons}</div><div className="list-caption">{filtered.length} {ui.count}</div>
 <div className="place-list">{filtered.length?filtered.map(p=><button key={p.id} className={`place-item ${selectedId===p.id?'active':''}`} onClick={()=>{setSelectedId(p.id);setMobileList(false)}}><span className={`code ${p.category}`}>{p.code}</span><span className="place-copy"><strong>{p.title[lang]}</strong><small>{p.category==='activity'?ui.activity:ui.landmark} · {p.title.en}</small></span><span className="arrow">›</span></button>):<div className="no-results">{ui.empty}</div>}</div>
 <div className="sidebar-footer"><div className="editor-toggle"><span><Wrench size={15}/> {ui.editor}</span><input aria-label={ui.editor} type="checkbox" checked={editor} onChange={e=>setEditor(e.target.checked)}/></div>{editor&&<><p className="hint">{ui.editorHelp}</p><button className="export-btn" onClick={downloadData}><Download size={16}/>{ui.export}</button></>}</div>
 </aside>
 <section className="map-area"><ThreeVenue points={filtered} selectedId={selectedId} onSelect={setSelectedId} onPick={editor?updatePosition:undefined} zoomRequest={zoomRequest}/>
 <div className="map-top"><span className="map-status"><span className="dot"/>{ui.sub}</span><button className="gps" onClick={()=>setGpsMessage(!gpsMessage)} title={ui.location}><LocateFixed size={18}/></button></div>
 <div className="map-controls"><button aria-label="Zoom in" onClick={()=>setZoomRequest(v=>Math.max(1,v)+1)}><Plus size={21}/></button><button aria-label="Zoom out" onClick={()=>setZoomRequest(v=>Math.min(-1,v)-1)}><Minus size={21}/></button></div>
 <div className="map-instructions">{ui.instructions}</div>
 {gpsMessage&&<div className="gps-info"><button onClick={()=>setGpsMessage(false)} aria-label={ui.close}><X size={15}/></button>{ui.gpsNote}</div>}
 {editor&&<div className="editor-banner">✎ {ui.editorHelp}</div>}
 {selected?<article className="detail"><button className="detail-close" aria-label={ui.close} onClick={()=>setSelectedId(null)}><X size={19}/></button><div className="eyebrow">{selected.category==='activity'?ui.activity:ui.landmark} · {selected.code}</div><h3>{selected.title[lang]}</h3><div className="english-title">{selected.title.en}</div><p>{selected.description[lang]}</p><div className="coord"><MapPin size={16}/>{ui.coordinates}: {selected.x}, {selected.y}</div>{!selected.verified&&<div className="verification"><Info size={16}/>{ui.warning}</div>}</article>:<div className="map-tip"><Navigation size={17}/>{ui.select}</div>}
 </section></div><footer className="footer-note">{ui.approx} · {ui.warning}</footer></main>;
}
