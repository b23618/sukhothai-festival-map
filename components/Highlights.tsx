'use client';
import { Crown, Drama, Flame, Flower2, Lightbulb, Star, Store } from 'lucide-react';
import type { Language, Point } from '@/data/points';
import { festival } from '@/data/festival';
/** "Highlights" strip at the top of the place list: the 6 main activities from the official site (festival.activities, same order) each jump to the matching spot, plus the featured Loy Krathong night show. */
const MAIN = [
  { Icon: Crown, find: /จุดรวมขบวนแห่/, c: '#b4572a' }, { Icon: Flame, find: /เล่นไฟ การแสดงพลุ/, c: '#d9531e' }, { Icon: Lightbulb, find: /Light and Sound/, c: '#7b39a8' },
  { Icon: Flower2, find: /จุดลอยกระทงสำหรับนักท่องเที่ยว/, c: '#c2457a' }, { Icon: Store, find: /วันวานที่คิดถึง/, c: '#2f7d5b' }, { Icon: Drama, find: /^การแสดงศิลปวัฒนธรรม$/, c: '#b98236' },
];
const T = {
  th: { main: 'กิจกรรมหลัก', src: 'จากเว็บไซต์ทางการ', feat: 'โชว์เด่นคืนลอยกระทง', where: 'เวทีแรกนาขวัญ ตลาดสินค้าสหกรณ์', others: 'สถานที่และกิจกรรมอื่นๆ' },
  en: { main: 'Main activities', src: 'from the official site', feat: 'Loy Krathong night show', where: 'Raknakhwan Stage, Cooperative Goods Market', others: 'Other places and activities' },
  zh: { main: '主要活动', src: '来自官方网站', feat: '水灯节之夜演出', where: '农耕祈福舞台 · 合作社商品市场', others: '其他地点和活动' },
} satisfies Record<Language, Record<string, string>>;
/** Featured shows on the Raknakhwan stage, in date order. `when` is left without a time when the organizer has not announced one. */
const SHOWS: { who: Record<Language, string>; when: Record<Language, string> }[] = [
  { who: { th: 'อ๊อฟ สุรพล', en: 'Off Surapol', zh: '奥夫·苏拉蓬' }, when: { th: '19 พ.ย. · ยังไม่ระบุเวลา', en: '19 Nov · time not announced', zh: '11月19日 · 时间未公布' } },
  { who: { th: 'อ้น ภานุวัฒน์ · ชิงช้าสวรรค์', en: 'Aun Phanuwat · Ching Cha Sawan', zh: '阿恩·帕努瓦 · 摩天轮' }, when: { th: '24 พ.ย. 20:30–21:30 น.', en: '24 Nov 20:30–21:30', zh: '11月24日 20:30–21:30' } },
];
export default function Highlights({ lang, points, onPick }: { lang: Language; points: Point[]; onPick: (id: string) => void }) {
  const s = T[lang], stage = points.find(p => p.id === 'stage-raknakhwan');
  return <><section className="border-b border-[#f0f0eb] bg-[#fffaf0] pb-2.5 pt-2" aria-label={s.main}>
    {stage && <div className="mb-2">
      <div className="mb-1.5 flex items-baseline justify-between px-4"><b className="text-[13px] text-[#7a1f3d]">{s.feat}</b><span className="truncate pl-2 text-[10px] text-[#9a8a64]">{s.where}</span></div>
      <div className="flex gap-2 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none]">{SHOWS.map((x, i) => <button key={i} type="button" onClick={() => onPick(stage.id)} className="flex min-h-14 w-56 shrink-0 items-center gap-2.5 rounded-xl border-0 bg-gradient-to-br from-[#7a1f3d] via-[#a3284f] to-[#d9531e] p-2.5 text-left text-white shadow-md ring-1 ring-[#ffe3a8]/60">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/25 text-[#ffe3a8]"><Star size={20} fill="currentColor" /></span>
        <span className="min-w-0"><span className="block truncate text-[14px] font-extrabold leading-5">{x.who[lang]}</span><span className="block truncate text-[12px] leading-4 text-[#ffe3a8]">{x.when[lang]}</span></span>
      </button>)}</div>
    </div>}
    <div className="mb-1.5 flex items-baseline justify-between px-4"><b className="text-[12px] text-[#6b4a14]">{s.main}</b><span className="text-[10px] text-[#9a8a64]">{s.src}</span></div>
    <div className="flex gap-2 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none]">{MAIN.map(({ Icon, find, c }, i) => { const p = points.find(q => find.test(q.title.th)); return <button key={i} type="button" disabled={!p} onClick={() => p && onPick(p.id)} className="flex min-h-12 w-36 shrink-0 items-center gap-2 rounded-xl border border-[#eadfc8] bg-white p-2 text-left text-[#2f3a33] disabled:opacity-50">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: c }}><Icon size={17} /></span><span className="text-[12px] font-semibold leading-4">{festival.activities[i][lang]}</span></button>; })}</div>
  </section><h3 className="m-0 bg-white px-4 pb-1 pt-3 text-[13px] font-bold text-[#2f3a33]">{s.others}</h3></>;
}
