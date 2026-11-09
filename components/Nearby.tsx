'use client';
import { useMemo } from 'react';
import { Footprints, Navigation2 } from 'lucide-react';
import type { Language, Point } from '@/data/points';
import { useMapStore } from '@/store/useMapStore';
import { fmtDist, geoOf, nearestPoints } from '@/lib/route';
import { L as R, compass } from './RoutePanel';
const T = { th: { title: 'สถานที่ใกล้เคียง', note: 'ระยะทางตรง · เวลาเดินโดยประมาณ' }, en: { title: 'Nearby places', note: 'straight-line distance · approx. walking time' }, zh: { title: '附近地点', note: '直线距离 · 步行时间估算' } } satisfies Record<Language, unknown>;
/** Nearest places (any category) with distance, compass direction and walking time; click to select, or set as walking destination. */
export default function Nearby({ place }: { place: Point }) {
  const { lang, points, select, setRoute } = useMapStore(), t = T[lang], r = R[lang];
  const list = useMemo(() => nearestPoints(geoOf(place), points, place.id, 6), [place, points]);
  return <div className="mt-3">
    <div className="mb-1 flex items-baseline justify-between"><b className="text-[12px] text-[#33463d]">{t.title}</b><span className="text-[10px] text-[#9a9384]">{t.note}</span></div>
    <ul className="m-0 list-none space-y-1 p-0">{list.map(({ p, d, brg, walkMin }) => <li key={p.id} className="flex items-center gap-2 text-[11px]">
      <span title={`${compass(lang, brg)} ${Math.round(brg)}°`} className="grid h-5 w-5 flex-none place-items-center rounded-full bg-[#eef3ee] text-[#2f6a54]"><Navigation2 size={11} style={{ transform: `rotate(${brg}deg)` }} /></span>
      <button className="min-w-0 flex-1 truncate border-0 bg-transparent p-0 text-left text-[#33463d] underline-offset-2 hover:underline" onClick={() => select(p.id)}>{p.code} · {p.title[lang]}</button>
      <span className="flex-none text-[#7b857d]">{fmtDist(d, r.m, r.km)} · {compass(lang, brg)} · {walkMin} {r.min}</span>
      <button aria-label={r.title} title={r.title} className="grid h-5 w-5 flex-none place-items-center rounded-full border border-[#dfe5dc] bg-white p-0 text-[#2f6a54]" onClick={() => setRoute(place.id, p.id)}><Footprints size={11} /></button></li>)}</ul>
  </div>;
}
