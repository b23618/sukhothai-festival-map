'use client';
import { useState } from 'react';
import { ExternalLink, Map as MapIcon, Route } from 'lucide-react';
import type { Language } from '@/data/points';
import { mapsDirectionsUrl, mapsEmbedUrl, mapsOpenUrl, type Geo } from '@/lib/googleMaps';
const L = {
  th: { open: 'เปิดใน Google Maps', dir: 'นำทาง', show: 'ดูแผนที่จริง', hide: 'ซ่อนแผนที่จริง', title: 'แผนที่ Google', noGeo: 'ยังไม่มีพิกัด GPS ที่ยืนยัน', point: 'จุดที่' },
  en: { open: 'Open in Google Maps', dir: 'Directions', show: 'Show real map', hide: 'Hide real map', title: 'Google Map', noGeo: 'No verified GPS position yet', point: 'Spot' },
  zh: { open: '在谷歌地图打开', dir: '导航', show: '显示真实地图', hide: '隐藏真实地图', title: '谷歌地图', noGeo: '暂无已核实的GPS位置', point: '地点' },
};
/** Google Maps link-out + keyless embed, localised through the `hl` parameter (th / en / zh-CN). */
export default function PlaceMap({ geo, extra = [], lang, zoom = 18 }: { geo?: Geo; extra?: Geo[]; lang: Language; zoom?: number }) {
  const [show, setShow] = useState(false), s = L[lang];
  if (!geo) return <div className="mt-2 text-[11px] text-[#9a9384]">{s.noGeo}</div>;
  const btn = 'inline-flex items-center gap-1.5 rounded-lg border border-[#e3e3da] bg-[#fafaf6] px-2.5 py-1.5 text-[11px] text-[#2f4a3e] no-underline hover:bg-[#f0f4ec]';
  return <div className="mt-3">
    <div className="flex flex-wrap gap-1.5">
      <a className={btn} href={mapsOpenUrl(geo, lang)} target="_blank" rel="noreferrer"><ExternalLink size={13} />{s.open}</a>
      <a className={btn} href={mapsDirectionsUrl(geo, lang)} target="_blank" rel="noreferrer"><Route size={13} />{s.dir}</a>
      <button className={btn} onClick={() => setShow(v => !v)}><MapIcon size={13} />{show ? s.hide : s.show}</button>
    </div>
    {extra.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">{extra.map((g, i) => <a key={i} className="text-[#2f6a54] underline" href={mapsOpenUrl(g, lang)} target="_blank" rel="noreferrer">{s.point} {i + 2}</a>)}</div>}
    {show && <iframe key={lang + geo.lat + geo.lng} title={s.title} className="mt-2 h-44 w-full rounded-lg border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapsEmbedUrl(geo, lang, zoom)} />}
  </div>;
}
