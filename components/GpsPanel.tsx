'use client';
import { LocateFixed, X } from 'lucide-react';
import type { Language } from '@/data/points';
import { festival } from '@/data/festival';
import { useMapStore } from '@/store/useMapStore';
import { L as R } from './RoutePanel';
import { fmtDist, walkInfo } from '@/lib/route';
const T = {
  th: { title: 'ตำแหน่งปัจจุบันของคุณ', asking: 'กำลังขออนุญาตและหาตำแหน่ง… (อนุญาตการเข้าถึงตำแหน่งในเบราว์เซอร์)', denied: 'ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง เปิดสิทธิ์ตำแหน่งของเว็บไซต์ในเบราว์เซอร์แล้วลองใหม่', unsupported: 'เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง', acc: 'ความแม่นยำ ±', toVenue: 'ห่างจากกลางงาน', inside: 'คุณอยู่ในพื้นที่งาน — จุดสีน้ำเงินบนแผนที่', outside: 'อยู่นอกพื้นที่แผนที่ 3 มิติ ยังนำทางเดินจากตำแหน่งนี้ได้', stop: 'ปิดตำแหน่ง', privacy: 'ตำแหน่งใช้ในเบราว์เซอร์นี้เท่านั้น ไม่ถูกส่งหรือบันทึกที่ใด' },
  en: { title: 'Your current location', asking: 'Asking permission and finding position… (allow location access in your browser)', denied: 'Location permission denied. Allow location for this site in the browser, then retry.', unsupported: 'This browser does not support geolocation.', acc: 'Accuracy ±', toVenue: 'From venue centre', inside: 'You are inside the venue — blue dot on the map', outside: 'Outside the 3D map area; walking routes from here still work', stop: 'Stop location', privacy: 'Your position stays in this browser; it is not sent or stored anywhere.' },
  zh: { title: '您的当前位置', asking: '正在请求权限并定位…（请在浏览器中允许位置访问）', denied: '位置权限被拒绝。请在浏览器中允许本网站使用位置后重试。', unsupported: '此浏览器不支持定位。', acc: '精度 ±', toVenue: '距活动中心', inside: '您在活动区域内 — 地图上的蓝点', outside: '位于3D地图范围之外，仍可从此处规划步行路线', stop: '关闭定位', privacy: '位置仅在此浏览器中使用，不会上传或保存。' },
} satisfies Record<Language, unknown>;
export default function GpsPanel() {
  const { lang, locState, userPos, gpsMessage, setGps, stopLocate, routeFrom, routeTo } = useMapStore(), routeOpen = !!(routeFrom || routeTo), t = T[lang], r = R[lang];
  if (!gpsMessage) return null;
  const to = userPos ? walkInfo(userPos, festival.center) : null, inside = to && to.d < 900;
  return <div className={`absolute right-[72px] top-[77px] z-20 w-[min(300px,75%)] rounded-xl bg-white p-3.5 text-[12px] leading-[1.6] shadow-xl max-md:inset-x-2 max-md:bottom-2 max-md:top-auto max-md:w-auto ${routeOpen?'max-md:hidden':''}`}>
    <div className="mb-1 flex items-center justify-between"><b className="flex items-center gap-1.5"><LocateFixed size={14} className="text-[#2b7bff]" />{t.title}</b><button className="grid h-11 w-11 place-items-center border-0 bg-transparent" aria-label={r.close} onClick={() => setGps(false)}><X size={17} /></button></div>
    {locState === 'asking' && <div className="text-[#92691e]">{t.asking}</div>}
    {locState === 'denied' && <div className="text-[#b04a1f]">{t.denied}</div>}
    {locState === 'unsupported' && <div className="text-[#b04a1f]">{t.unsupported}</div>}
    {userPos && to && <div className="space-y-0.5 text-[#33463d]"><div>{userPos.lat.toFixed(5)}, {userPos.lng.toFixed(5)}</div><div className="text-[#7b857d]">{t.acc}{Math.round(userPos.acc)} {r.m}</div>
      <div>{t.toVenue}: <b>{fmtDist(to.d, r.m, r.km)}</b></div><div className="text-[#2f6a54]">{inside ? t.inside : t.outside}</div></div>}
    {locState !== 'off' && <button className="mt-2 rounded-lg border border-[#e3e3da] bg-[#fafaf6] px-2.5 py-1 text-[11px]" onClick={() => { stopLocate(); setGps(false); }}>{t.stop}</button>}
    <div className="mt-1.5 text-[10px] text-[#9a9384]">{t.privacy}</div>
  </div>;
}
