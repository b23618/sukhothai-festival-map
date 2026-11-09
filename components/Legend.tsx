'use client';
import { X } from 'lucide-react';
import type { Language, SymbolKind } from '@/data/points';
import { useMapStore } from '@/store/useMapStore';
const ITEMS: { k: SymbolKind; icon: string; t: Record<Language, string> }[] = [
  { k: 'nang', icon: '👸', t: { th: 'นางนพมาศ / ท้าวศรีจุฬาลักษณ์ (ประกวด การแสดงตำนาน ขบวนเรือ)', en: 'Nang Noppamas / Thao Sri Chulalak (contest, legend show, boat procession)', zh: '娘诺帕玛 / 泰国素可泰传说（选美、传说表演、船队）' } },
  { k: 'market', icon: '🛍️', t: { th: 'ตลาด และจุดจำหน่ายสินค้า', en: 'Markets and product stalls', zh: '市场与商品摊位' } },
  { k: 'cowrie', icon: '🐚', t: { th: 'ตลาดแลกเบี้ย (เบี้ย = เงินตราโบราณ)', en: 'Cowrie-exchange market (cowrie shells = old currency)', zh: '贝币兑换市场（贝壳＝古代货币）' } },
  { k: 'krathong', icon: '🪷', t: { th: 'กระทง (จำหน่าย ประกวด กระทงใหญ่)', en: 'Krathong (sales, contest, large krathong)', zh: '水灯（售卖、比赛、大水灯）' } },
  { k: 'fireworks', icon: '🎆', t: { th: 'เล่นไฟ พลุ ดอกไม้ไฟ', en: 'Fire play and fireworks', zh: '烟火表演' } },
  { k: 'candle', icon: '🕯️', t: { th: 'พิธีเผาเทียน', en: 'Candle-burning ceremony', zh: '烧烛仪式' } },
  { k: 'wc', icon: '🚻', t: { th: 'ห้องสุขา', en: 'Toilets', zh: '洗手间' } },
  { k: 'parking', icon: '🅿️', t: { th: 'ที่จอดรถ', en: 'Parking', zh: '停车场' } },
  { k: 'firstaid', icon: '➕', t: { th: 'หน่วยปฐมพยาบาล', en: 'First aid', zh: '急救站' } },
  { k: 'bus', icon: '🚌', t: { th: 'จุดรถรับ-ส่ง', en: 'Shuttle stop', zh: '接驳车站' } },
];
const T = { th: ['สัญลักษณ์บนแผนที่', 'สัญลักษณ์เป็นภาพประกอบ ไม่ได้บอกตำแหน่งจริงของสิ่งก่อสร้าง'], en: ['Map symbols', 'Symbols are illustrative icons, not surveyed structures'], zh: ['地图符号', '符号仅为示意图标，不代表实际建筑'] } satisfies Record<Language, [string, string]>;
export default function Legend({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, routeFrom, routeTo, gpsMessage } = useMapStore(), busy = !!(routeFrom || routeTo) || gpsMessage;
  if (!open) return null;
  return <aside aria-label={T[lang][0]} className={`absolute right-[72px] top-[130px] z-30 max-h-[60%] w-[300px] overflow-y-auto rounded-2xl bg-white p-3.5 shadow-xl max-md:inset-x-2 max-md:bottom-2 max-md:top-auto max-md:w-auto ${busy ? 'max-md:hidden' : ''}`}>
    <div className="mb-2 flex items-center justify-between"><b className="text-[13px]">{T[lang][0]}</b><button className="grid h-11 w-11 place-items-center rounded-full border-0 bg-[#f4f5f2]" aria-label={{th:'ปิด',en:'Close',zh:'关闭'}[lang]} onClick={onClose}><X size={17} /></button></div>
    <ul className="m-0 list-none space-y-1.5 p-0">{ITEMS.map(i => <li key={i.k} className="flex items-start gap-2.5 text-[12px] leading-5 text-[#33463d]"><span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-[#f6f3ea] text-[16px]">{i.icon}</span><span className="pt-0.5">{i.t[lang]}</span></li>)}</ul>
    <div className="mt-2 text-[10px] text-[#9a9384]">{T[lang][1]}</div>
  </aside>;
}
