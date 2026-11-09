'use client';
import { ExternalLink } from 'lucide-react';
import type { Language } from '@/data/points';
import { mapsOpenUrl, type Geo } from '@/lib/googleMaps';
const L = {
  th: { open: 'เปิดใน Google Maps', noGeo: 'ยังไม่มีพิกัด GPS ที่ยืนยัน', point: 'จุดที่' },
  en: { open: 'Open in Google Maps', noGeo: 'No verified GPS position yet', point: 'Spot' },
  zh: { open: '在谷歌地图打开', noGeo: '暂无已核实的GPS位置', point: '地点' },
};
/** Google Maps link-out, localised through the `hl` parameter (th / en / zh-CN). */
export default function PlaceMap({ geo, extra = [], lang }: { geo?: Geo; extra?: Geo[]; lang: Language }) {
  const s = L[lang];
  if (!geo) return <div className="mt-2 text-[11px] text-[#9a9384]">{s.noGeo}</div>;
  const btn = 'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#176b53] bg-[#176b53] px-3 py-2 text-[12px] font-semibold text-white no-underline hover:bg-[#10533f]';
  return <div className="mt-3">
    <div className="flex flex-wrap gap-1.5">
      <a className={btn} href={mapsOpenUrl(geo, lang)} target="_blank" rel="noreferrer"><ExternalLink size={13} />{s.open}</a>
    </div>
    {extra.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">{extra.map((g, i) => <a key={i} className="text-[#2f6a54] underline" href={mapsOpenUrl(g, lang)} target="_blank" rel="noreferrer">{s.point} {i + 2}</a>)}</div>}
  </div>;
}
