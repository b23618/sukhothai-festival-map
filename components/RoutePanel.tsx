'use client';
import { ArrowUpDown, Clock, Compass, ExternalLink, Footprints, Car, Ruler, X } from 'lucide-react';
import { gridToGeo } from '@/lib/georef';
import { bearingDeg, haversineM, mapsRouteUrl, type Geo } from '@/lib/googleMaps';
import { useMapStore } from '@/store/useMapStore';
import type { Language, Point } from '@/data/points';

const L = {
  th: { title: 'เส้นทาง', from: 'จุดเริ่มต้น', to: 'ปลายทาง', pick: 'เลือกสถานที่…', swap: 'สลับ', close: 'ปิด', dist: 'ระยะทางตรง', walk: 'เดินประมาณ', dir: 'ทิศทาง', gmWalk: 'นำทางเดินใน Google Maps', gmDrive: 'ขับรถใน Google Maps', approx: 'ระยะทางเป็นเส้นตรง คูณ 1.3 สำหรับทางเดินจริง; พิกัดจุดที่ไม่มี GPS ทางการประมาณจากผัง', same: 'เลือกสองจุดที่ต่างกัน', m: 'ม.', km: 'กม.', min: 'นาที', groups: { landmark: 'โบราณสถาน', activity: 'กิจกรรม', facility: 'บริการ' }, c: ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้', 'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'], head: 'มุ่งหน้า' },
  en: { title: 'Route', from: 'From', to: 'To', pick: 'Choose a place…', swap: 'Swap', close: 'Close', dist: 'Straight-line', walk: 'Walk about', dir: 'Heading', gmWalk: 'Walking directions in Google Maps', gmDrive: 'Driving in Google Maps', approx: 'Straight-line distance; walking time adds 30% for real paths. Points without official GPS are estimated from the plan.', same: 'Pick two different places', m: 'm', km: 'km', min: 'min', groups: { landmark: 'Heritage', activity: 'Activities', facility: 'Services' }, c: ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'], head: 'Head' },
  zh: { title: '路线', from: '起点', to: '终点', pick: '选择地点…', swap: '互换', close: '关闭', dist: '直线距离', walk: '步行约', dir: '方向', gmWalk: '在谷歌地图查看步行路线', gmDrive: '在谷歌地图查看驾车路线', approx: '为直线距离，步行时间按实际路径增加30%；无官方GPS的地点由平面图估算。', same: '请选择两个不同地点', m: '米', km: '公里', min: '分钟', groups: { landmark: '古迹', activity: '活动', facility: '服务' }, c: ['北', '东北', '东', '东南', '南', '西南', '西', '西北'], head: '前往' },
} satisfies Record<Language, unknown>;
export const geoOf = (p: Point): Geo => p.geo ?? gridToGeo(p.x, p.y);
export function routeInfo(a: Point, b: Point) {
  const ga = geoOf(a), gb = geoOf(b), d = haversineM(ga, gb), brg = bearingDeg(ga, gb);
  return { ga, gb, d, brg, walkMin: Math.max(1, Math.round(d * 1.3 / 75)) };
}
export default function RoutePanel() {
  const { lang, points, routeFrom, routeTo, setRoute, clearRoute } = useMapStore(), s = L[lang];
  if (!routeFrom && !routeTo) return null;
  const a = points.find(p => p.id === routeFrom), b = points.find(p => p.id === routeTo), info = a && b && a.id !== b.id ? routeInfo(a, b) : null;
  const opts = (['landmark', 'activity', 'facility'] as const).map(c => <optgroup key={c} label={s.groups[c]}>{points.filter(p => p.category === c).map(p => <option key={p.id} value={p.id}>{p.code} · {p.title[lang]}</option>)}</optgroup>);
  const sel = 'w-full rounded-lg border border-[#dddeda] bg-[#fafaf8] px-2 py-1.5 text-[12px]', btn = 'inline-flex items-center gap-1.5 rounded-lg border border-[#e3e3da] bg-[#fafaf6] px-2.5 py-1.5 text-[11px] text-[#2f4a3e] no-underline hover:bg-[#f0f4ec]';
  const dist = info ? (info.d >= 1000 ? `${(info.d / 1000).toFixed(2)} ${s.km}` : `${Math.round(info.d)} ${s.m}`) : '', compass = info ? s.c[Math.round(info.brg / 45) % 8] : '';
  return <aside aria-label={s.title} className="absolute right-5 top-[196px] z-20 max-h-[55%] w-[300px] overflow-y-auto rounded-2xl bg-white p-3.5 shadow-xl max-md:left-3 max-md:right-3 max-md:top-[120px] max-md:w-auto">
    <div className="mb-2 flex items-center justify-between"><b className="text-[13px]">{s.title}</b><button className="rounded-full border-0 bg-[#f4f5f2] p-1" aria-label={s.close} onClick={clearRoute}><X size={15} /></button></div>
    <label className="block text-[10px] font-bold uppercase text-[#8a9189]">{s.from}</label>
    <select className={sel} value={routeFrom ?? ''} onChange={e => setRoute(e.target.value || null)}><option value="">{s.pick}</option>{opts}</select>
    <div className="my-1 flex justify-center"><button className={btn} onClick={() => setRoute(routeTo, routeFrom)}><ArrowUpDown size={13} />{s.swap}</button></div>
    <label className="block text-[10px] font-bold uppercase text-[#8a9189]">{s.to}</label>
    <select className={sel} value={routeTo ?? ''} onChange={e => setRoute(undefined, e.target.value || null)}><option value="">{s.pick}</option>{opts}</select>
    {a && b && !info && <div className="mt-2 text-[11px] text-[#92691e]">{s.same}</div>}
    {a && b && info && <div className="mt-3 space-y-1.5 text-[12px] text-[#33463d]">
      <div className="flex items-center gap-2"><Ruler size={14} />{s.dist}: <b>{dist}</b></div>
      <div className="flex items-center gap-2"><Clock size={14} />{s.walk}: <b>{info.walkMin} {s.min}</b></div>
      <div className="flex items-center gap-2"><Compass size={14} />{s.dir}: <b>{s.head}{lang === 'en' ? ' ' : ''}{compass}</b> ({Math.round(info.brg)}°)</div>
      <div className="flex flex-wrap gap-1.5 pt-1"><a className={btn} target="_blank" rel="noreferrer" href={mapsRouteUrl(info.ga, info.gb, lang, 'walking')}><Footprints size={13} />{s.gmWalk} <ExternalLink size={11} /></a><a className={btn} target="_blank" rel="noreferrer" href={mapsRouteUrl(info.ga, info.gb, lang, 'driving')}><Car size={13} />{s.gmDrive} <ExternalLink size={11} /></a></div>
      <div className="text-[10px] text-[#9a9384]">{s.approx}</div></div>}
  </aside>;
}
