'use client';
import { ArrowUpDown, Clock, Compass, ExternalLink, Footprints, LocateFixed, Ruler, TriangleAlert, X } from 'lucide-react';
import { mapsRouteUrl } from '@/lib/googleMaps';
import { ME, WALK_LIMIT_M, endpoint, fmtDist, walkInfo } from '@/lib/route';
import { useMapStore } from '@/store/useMapStore';
import type { Language } from '@/data/points';

export const L = {
  th: { title: 'เส้นทางเดิน', from: 'จุดเริ่มต้น', to: 'ปลายทาง', pick: 'เลือกสถานที่…', me: 'ตำแหน่งของฉัน', waitGps: 'กำลังหาตำแหน่ง GPS…', swap: 'สลับ', close: 'ปิด', dist: 'ระยะทางตรง', walk: 'เดินประมาณ', dir: 'ทิศทาง', gm: 'นำทางเดินใน Google Maps', far: 'ไกลเกิน 5 กม. ไม่เหมาะกับการเดิน', approx: 'ระยะทางเป็นเส้นตรง คูณ 1.3 สำหรับทางเดินจริง เฉพาะเส้นทางเดินเท้า; จุดที่ไม่มี GPS ทางการประมาณจากผัง', same: 'เลือกสองจุดที่ต่างกัน', m: 'ม.', km: 'กม.', min: 'นาที', groups: { landmark: 'โบราณสถาน', activity: 'กิจกรรม', facility: 'บริการ' }, c: ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้', 'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'], head: 'มุ่งหน้า' },
  en: { title: 'Walking route', from: 'From', to: 'To', pick: 'Choose a place…', me: 'My location', waitGps: 'Finding GPS position…', swap: 'Swap', close: 'Close', dist: 'Straight-line', walk: 'Walk about', dir: 'Heading', gm: 'Walking directions in Google Maps', far: 'Over 5 km: too far to walk', approx: 'Straight-line distance; walking time adds 30% for real paths. Walking routes only. Points without official GPS are estimated from the plan.', same: 'Pick two different places', m: 'm', km: 'km', min: 'min', groups: { landmark: 'Heritage', activity: 'Activities', facility: 'Services' }, c: ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'], head: 'Head' },
  zh: { title: '步行路线', from: '起点', to: '终点', pick: '选择地点…', me: '我的位置', waitGps: '正在获取GPS位置…', swap: '互换', close: '关闭', dist: '直线距离', walk: '步行约', dir: '方向', gm: '在谷歌地图查看步行路线', far: '超过5公里，不适合步行', approx: '为直线距离，步行时间按实际路径增加30%。仅提供步行路线；无官方GPS的地点由平面图估算。', same: '请选择两个不同地点', m: '米', km: '公里', min: '分钟', groups: { landmark: '古迹', activity: '活动', facility: '服务' }, c: ['北', '东北', '东', '东南', '南', '西南', '西', '西北'], head: '前往' },
} satisfies Record<Language, unknown>;
export const compass = (lang: Language, brg: number) => L[lang].c[Math.round(brg / 45) % 8];
export default function RoutePanel() {
  const { lang, points, routeFrom, routeTo, userPos, locState, setRoute, clearRoute, locate } = useMapStore(), s = L[lang];
  if (!routeFrom && !routeTo) return null;
  const a = endpoint(routeFrom, points, userPos), b = endpoint(routeTo, points, userPos), same = routeFrom === routeTo, info = a && b && !same ? walkInfo(a.geo, b.geo) : null;
  const opts = (['landmark', 'activity', 'facility'] as const).map(c => <optgroup key={c} label={s.groups[c]}>{points.filter(p => p.category === c).map(p => <option key={p.id} value={p.id}>{p.code} · {p.title[lang]}</option>)}</optgroup>);
  const me = <option value={ME}>📍 {s.me}</option>;
  const sel = 'w-full rounded-lg border border-[#dddeda] bg-[#fafaf8] px-2 py-1.5 text-[12px]', btn = 'inline-flex items-center gap-1.5 rounded-lg border border-[#e3e3da] bg-[#fafaf6] px-2.5 py-1.5 text-[11px] text-[#2f4a3e] no-underline hover:bg-[#f0f4ec]';
  const waiting = (routeFrom === ME || routeTo === ME) && !userPos;
  return <aside aria-label={s.title} className="absolute right-5 top-[196px] z-20 max-h-[55%] w-[300px] overflow-y-auto rounded-2xl bg-white p-3.5 shadow-xl max-md:inset-x-2 max-md:bottom-2 max-md:top-auto max-md:max-h-[60%] max-md:w-auto">
    <div className="mb-2 flex items-center justify-between"><b className="flex items-center gap-1.5 text-[13px]"><Footprints size={15} />{s.title}</b><button className="rounded-full border-0 bg-[#f4f5f2] p-1" aria-label={s.close} onClick={clearRoute}><X size={15} /></button></div>
    <label className="block text-[10px] font-bold uppercase text-[#8a9189]">{s.from}</label>
    <select className={sel} value={routeFrom ?? ''} onChange={e => { setRoute(e.target.value || null); if (e.target.value === ME) locate(); }}><option value="">{s.pick}</option>{me}{opts}</select>
    <div className="my-1 flex justify-center"><button className={btn} onClick={() => setRoute(routeTo, routeFrom)}><ArrowUpDown size={13} />{s.swap}</button></div>
    <label className="block text-[10px] font-bold uppercase text-[#8a9189]">{s.to}</label>
    <select className={sel} value={routeTo ?? ''} onChange={e => { setRoute(undefined, e.target.value || null); if (e.target.value === ME) locate(); }}><option value="">{s.pick}</option>{me}{opts}</select>
    {waiting && <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#92691e]"><LocateFixed size={13} />{locState === 'denied' ? '' : s.waitGps}</div>}
    {a && b && same && <div className="mt-2 text-[11px] text-[#92691e]">{s.same}</div>}
    {a && b && info && <div className="mt-3 space-y-1.5 text-[12px] text-[#33463d]">
      <div className="flex items-center gap-2"><Ruler size={14} />{s.dist}: <b>{fmtDist(info.d, s.m, s.km)}</b></div>
      <div className="flex items-center gap-2"><Clock size={14} />{s.walk}: <b>{info.walkMin} {s.min}</b></div>
      <div className="flex items-center gap-2"><Compass size={14} />{s.dir}: <b>{s.head}{lang === 'en' ? ' ' : ''}{compass(lang, info.brg)}</b> ({Math.round(info.brg)}°)</div>
      {info.d > WALK_LIMIT_M && <div className="flex items-center gap-1.5 text-[11px] text-[#b04a1f]"><TriangleAlert size={13} />{s.far}</div>}
      <div className="pt-1"><a className={btn} target="_blank" rel="noreferrer" href={mapsRouteUrl(a.geo, b.geo, lang)}><Footprints size={13} />{s.gm} <ExternalLink size={11} /></a></div>
      <div className="text-[10px] text-[#9a9384]">{s.approx}</div></div>}
  </aside>;
}
