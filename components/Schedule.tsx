'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, MapPin, Star, X, Radio } from 'lucide-react';
import type { Language } from '@/data/points';
import { DAYS, DAY_BADGE, SCHEDULE, SCHEDULE_SOURCE, type DayKey, type ScheduleItem } from '@/data/schedule';
/** Daily programme: day strip, "now / next" for today, earlier vs upcoming slots, plus previous-day / next-day previews. Data: data/schedule.ts (official PDF). */
const T = {
  th: { title: 'กำหนดการรายวัน', sub: 'งานประเพณีลอยกระทง เผาเทียน เล่นไฟ 15–24 พ.ย. 2569', close: 'ปิด', today: 'วันนี้', yesterday: 'เมื่อวาน', tomorrow: 'พรุ่งนี้', before: 'ผ่านไปแล้ว', now: 'เริ่มล่าสุด', next: 'ถัดไป', later: 'ต่อไป', upcoming: 'กำหนดการวันนี้', all: 'ทั้งหมด', key: 'ไฮไลต์', items: 'รายการ', prevDay: 'วันก่อนหน้า', nextDay: 'วันถัดไป', go: 'ดูวันนี้', by: 'จัดโดย', showPast: (n: number) => `แสดงที่ผ่านไปแล้ว ${n} รายการ`, hidePast: 'ซ่อนที่ผ่านไปแล้ว', in: (h: number, m: number) => `อีก ${h ? `${h} ชม. ` : ''}${m} นาที`, startsIn: (d: number) => d === 0 ? 'งานเริ่มวันนี้' : `งานเริ่มในอีก ${d} วัน`, over: 'งานสิ้นสุดแล้ว', none: 'ไม่มีรายการ', extra: 'ไม่อยู่ในกำหนดการทางการ', note: 'ถอดจากกำหนดการทางการ (ฉบับ 1 ต.ค. 2569) เวลาเป็นเวลาเริ่มกิจกรรม อาจมีการเปลี่ยนแปลง', src: 'ดูกำหนดการทางการ', empty: 'วันนี้ไม่มีกิจกรรมที่เหลือ', nowLbl: 'ตอนนี้', live: 'กำลังแสดง', liveNone: 'ตอนนี้ยังไม่มีการแสดง', open: (n: number) => `ตลาด/บูธที่เปิดอยู่ ${n} รายการ`, left: (m: number) => `เหลือราว ${m} นาที`, est: 'เวลาจบเป็นค่าประมาณ (PDF ระบุเฉพาะเวลาเริ่ม)', updated: 'อัปเดตสด' },
  en: { title: 'Daily schedule', sub: 'Loy Krathong, Candle-Burning & Fireworks · 15–24 Nov 2026', close: 'Close', today: 'Today', yesterday: 'Yesterday', tomorrow: 'Tomorrow', before: 'Earlier', now: 'Latest start', next: 'Up next', later: 'Later', upcoming: "Today's programme", all: 'All', key: 'Highlights', items: 'items', prevDay: 'Previous day', nextDay: 'Next day', go: 'View', by: 'By', showPast: (n: number) => `Show ${n} earlier item${n > 1 ? 's' : ''}`, hidePast: 'Hide earlier items', in: (h: number, m: number) => `in ${h ? `${h} h ` : ''}${m} min`, startsIn: (d: number) => d === 0 ? 'Festival starts today' : `Festival starts in ${d} day${d > 1 ? 's' : ''}`, over: 'Festival has ended', none: 'No items', extra: 'Not in the official schedule', note: 'Transcribed from the official schedule (1 Oct 2026). Times are start times and may change.', src: 'Official schedule', empty: 'Nothing left today', nowLbl: 'Now', live: 'Live now', liveNone: 'No show right now', open: (n: number) => `${n} markets/booths open`, left: (m: number) => `~${m} min left`, est: 'End times are estimates (the PDF gives start times only)', updated: 'Live' },
  zh: { title: '每日日程', sub: '水灯节·烧烛·烟火 2026年11月15–24日', close: '关闭', today: '今天', yesterday: '昨天', tomorrow: '明天', before: '已结束', now: '最近开始', next: '接下来', later: '稍后', upcoming: '今日安排', all: '全部', key: '重点', items: '项', prevDay: '前一天', nextDay: '后一天', go: '查看', by: '主办', showPast: (n: number) => `显示已结束的 ${n} 项`, hidePast: '隐藏已结束项目', in: (h: number, m: number) => `还有 ${h ? `${h}小时` : ''}${m}分钟`, startsIn: (d: number) => d === 0 ? '活动今天开始' : `活动还有 ${d} 天开始`, over: '活动已结束', none: '无安排', extra: '不在官方日程内', note: '摘自官方日程（2026年10月1日版），时间为开始时间，可能有变动。', src: '官方日程', empty: '今天已无后续活动', nowLbl: '现在', live: '正在进行', liveNone: '当前暂无演出', open: (n: number) => `${n} 个集市/摊位营业中`, left: (m: number) => `约剩 ${m} 分钟`, est: '结束时间为估计（PDF仅列出开始时间）', updated: '实时' },
} as const;
const LOC: Record<Language, string> = { th: 'th-TH', en: 'en-GB', zh: 'zh-CN' };
/** Bangkok date + minutes of day. `?now=2026-11-24T20:40` overrides (for previews/tests). */
function bkk(d = new Date()) {
  let o: string | null = null; try { o = new URLSearchParams(location.search).get('now'); } catch { /* ignore */ }
  const m = o?.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/); if (m) return { date: m[1], min: +m[2] * 60 + +m[3] };
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, min: (+p.hour % 24) * 60 + +p.minute };
}
export function useBkkNow() { const [n, setN] = useState<{ date: string; min: number } | null>(null); useEffect(() => { setN(bkk()); const id = setInterval(() => setN(bkk()), 10000); return () => clearInterval(id); }, []); return n; }
const mins = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3);
const endOf = (it: ScheduleItem) => mins(it.time) + (it.dur ?? (it.stay ? Math.max(30, 22 * 60 - mins(it.time)) : 60));
const dayNum = (k: string) => +k.slice(8);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const wk = (k: string, lang: Language, style: 'short' | 'long' = 'short') => new Date(`${k}T12:00:00+07:00`).toLocaleDateString(LOC[lang], { weekday: style, timeZone: 'Asia/Bangkok' });
const dateLabel = (k: string, lang: Language) => lang === 'zh' ? `11月${dayNum(k)}日 ${wk(k, lang, 'long')}` : `${wk(k, lang, 'long')} ${dayNum(k)} ${lang === 'th' ? 'พฤศจิกายน' : 'Nov'}`;
/** Which day to open: today if inside the festival, else the nearest end. */
export const initialDay = (date: string | null): DayKey => !date || date < DAYS[0] ? DAYS[0] : date > DAYS[9] ? DAYS[9] : (date as DayKey);
type Slot = { time: string; items: ScheduleItem[] };
const slots = (items: ScheduleItem[]): Slot[] => { const out: Slot[] = []; for (const it of items) { const s = out[out.length - 1]; if (s && s.time === it.time) s.items.push(it); else out.push({ time: it.time, items: [it] }); } return out; };
function Row({ it, lang, tone, left }: { it: ScheduleItem; lang: Language; tone: 'past' | 'now' | 'next' | 'plain'; left?: number }) {
  const s = T[lang];
  return <li className={`rounded-xl border px-3 py-2 ${tone === 'now' ? 'border-[#176b53] bg-[#eef6f1] shadow-[0_0_0_2px_rgba(23,107,83,.25)]' : tone === 'next' ? 'border-[#e6b45a] bg-[#fff7e4]' : it.key ? 'border-[#ecd9a8] bg-[#fffaf0]' : 'border-[#eeeee8] bg-white'} ${tone === 'past' ? 'opacity-60' : ''}`}>
    {tone === 'now' && <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#176b53]"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e8175d] opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#e8175d]" /></span>{s.live}{left !== undefined && <span className="rounded-full bg-white px-1.5 py-0.5 normal-case tracking-normal text-[#546258]">{s.left(left)}</span>}</div>}
    <div className="flex items-start gap-1.5 text-[13px] font-semibold leading-5 text-[#1b2b25]">{it.key && <Star size={13} className="mt-1 shrink-0 text-[#d08a1c]" fill="currentColor" />}<span>{it.title[lang]}</span></div>
    <div className="mt-0.5 flex items-start gap-1 text-[12px] leading-4 text-[#546258]"><MapPin size={12} className="mt-0.5 shrink-0" /><span>{it.place[lang]}</span></div>
    {it.by && <div className="mt-0.5 text-[11px] leading-4 text-[#8a7a4a]">{s.by} {it.by}</div>}
    {it.extra && <div className="mt-1 inline-block rounded-full bg-[#f3e8ff] px-2 py-0.5 text-[10px] font-semibold text-[#6b2e98]">{s.extra}</div>}
  </li>;
}
function SlotView({ slot, lang, tone }: { slot: Slot; lang: Language; tone: 'past' | 'now' | 'next' | 'plain' }) {
  return <div className="grid grid-cols-[3.4rem_1fr] gap-2 max-md:grid-cols-[3rem_1fr]">
    <div className={`pt-2 text-[15px] font-bold tabular-nums ${tone === 'now' ? 'text-[#176b53]' : tone === 'next' ? 'text-[#b36a00]' : 'text-[#172a24]'}`}>{slot.time}</div>
    <ul className="m-0 list-none space-y-1.5 p-0">{slot.items.map((it, i) => <Row key={i} it={it} lang={lang} tone={tone} />)}</ul>
  </div>;
}
function Preview({ k, label, lang, onGo, side }: { k: DayKey; label: string; lang: Language; onGo: () => void; side: 'prev' | 'next' }) {
  const items = SCHEDULE[k], keys = items.filter(i => i.key).slice(0, 3), show = keys.length ? keys : items.slice(0, 3);
  return <button type="button" onClick={onGo} className="w-full rounded-2xl border border-[#e5e5dc] bg-[#fafaf6] p-3 text-left">
    <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#7a6a35]">{side === 'prev' && <ChevronLeft size={14} />}{label}{side === 'next' && <ChevronRight size={14} className="ml-auto" />}<span className="ml-auto" /></div>
    <div className="mt-0.5 text-[14px] font-bold text-[#172a24]">{dateLabel(k, lang)}{DAY_BADGE[k] && <span className="ml-2 rounded-full bg-[#d9941f] px-2 py-0.5 text-[10px] font-bold text-white">{DAY_BADGE[k]![lang]}</span>}</div>
    <ul className="m-0 mt-1.5 list-none space-y-1 p-0 text-[12px] leading-4 text-[#3c4a43]">{show.map((i, n) => <li key={n} className="flex gap-2"><b className="w-10 shrink-0 tabular-nums">{i.time}</b><span className="line-clamp-2">{i.title[lang]}</span></li>)}</ul>
  </button>;
}
export function ScheduleCard({ lang, onOpen }: { lang: Language; onOpen: () => void }) {
  const s = T[lang], now = useBkkNow();
  const info = useMemo(() => {
    if (!now) return null;
    if (now.date < DAYS[0]) return { head: s.startsIn(daysBetween(now.date, DAYS[0])), line: null as ScheduleItem | null, live: false };
    if (now.date > DAYS[9]) return { head: s.over, line: null, live: false };
    const items = SCHEDULE[now.date as DayKey], live = items.find(i => !i.stay && mins(i.time) <= now.min && now.min < endOf(i)), nx = items.find(i => mins(i.time) > now.min);
    return { head: s.today, line: live ?? nx ?? null, live: !!live };
  }, [now, s]);
  return <button type="button" onClick={onOpen} className="flex w-full items-center gap-2.5 rounded-xl border border-[#cfe3d8] bg-gradient-to-br from-[#eef6f1] to-[#f9fcfa] px-2.5 py-2 text-left">
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#176b53] text-white"><CalendarClock size={18} /></span>
    <span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase tracking-wider text-[#176b53]">{s.title}{info?.line ? ` · ${info.live ? s.live : s.next}` : ''}</span>
      <span className="block truncate text-[13px] font-bold text-[#172a24]">{info?.line ? `${info.line.time} ${info.line.title[lang]}` : info?.head ?? s.sub}</span></span>
    <ChevronRight size={18} className="shrink-0 text-[#176b53]" />
  </button>;
}
export default function Schedule({ lang, onClose }: { lang: Language; onClose: () => void }) {
  const s = T[lang], now = useBkkNow();
  const [day, setDay] = useState<DayKey>(() => initialDay(typeof window === 'undefined' ? null : bkk().date));
  const [onlyKey, setOnlyKey] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const e = (ev: KeyboardEvent) => { if (ev.key === 'Escape') onClose(); }; document.addEventListener('keydown', e); return () => document.removeEventListener('keydown', e); }, [onClose]);
  useEffect(() => { stripRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest' }); scrollRef.current?.scrollTo({ top: 0 }); setShowPast(false); }, [day]);
  const idx = DAYS.indexOf(day), items = SCHEDULE[day], hasKey = items.some(i => i.key);
  const shown = onlyKey && hasKey ? items.filter(i => i.key) : items;
  const rel = now ? daysBetween(now.date, day) : null; // 0 = today
  const isToday = rel === 0, nowMin = isToday && now ? now.min : null;
  const stOf = (it: ScheduleItem) => nowMin === null ? (rel !== null && rel < 0 ? 'past' : 'next') : mins(it.time) > nowMin ? 'next' : nowMin < endOf(it) ? 'live' : 'past';
  const liveShows = nowMin === null ? [] : shown.filter(i => !i.stay && stOf(i) === 'live');
  const liveStays = nowMin === null ? [] : shown.filter(i => i.stay && stOf(i) === 'live');
  const upcoming = nowMin === null ? [] : shown.filter(i => stOf(i) === 'next'), past = nowMin === null ? [] : shown.filter(i => stOf(i) === 'past');
  const upSlots = slots(upcoming);
  const pastCount = past.length;
  const relTag = rel === null ? '' : rel === 0 ? s.today : rel === 1 ? s.tomorrow : rel === -1 ? s.yesterday : '';
  const todayIsLive = !!now && now.date >= DAYS[0] && now.date <= DAYS[9];
  const countdown = (() => { if (!upSlots.length || !now) return null; const d = mins(upSlots[0].time) - now.min; return s.in(Math.floor(d / 60), d % 60); })();
  const [showStays, setShowStays] = useState(false);
  const go = (i: number) => setDay(DAYS[Math.min(9, Math.max(0, i))]);
  const body = (() => {
    if (!isToday) return <div className="space-y-2.5">{slots(shown).map((sl, i) => <SlotView key={i} slot={sl} lang={lang} tone={rel !== null && rel < 0 ? 'past' : 'plain'} />)}</div>;
    return <div className="space-y-2.5">
      {pastCount > 0 && <button type="button" onClick={() => setShowPast(v => !v)} className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#cfd3cb] bg-[#f7f7f3] text-[12px] font-semibold text-[#53625a]">{showPast ? <ChevronUp size={15} /> : <ChevronDown size={15} />}{showPast ? s.hidePast : s.showPast(pastCount)}</button>}
      {showPast && slots(past).map((sl, i) => <SlotView key={`p${i}`} slot={sl} lang={lang} tone="past" />)}
      <div className="space-y-2">{liveShows.length ? <ul className="m-0 list-none space-y-2 p-0">{liveShows.map((it, i) => <div key={i} className="grid grid-cols-[3.4rem_1fr] gap-2 max-md:grid-cols-[3rem_1fr]"><div className="pt-2 text-[15px] font-bold tabular-nums text-[#176b53]">{it.time}</div><ul className="m-0 list-none p-0"><Row it={it} lang={lang} tone="now" left={endOf(it) - now!.min} /></ul></div>)}</ul> : <div className="rounded-xl border border-dashed border-[#cfe3d8] bg-[#f4faf6] px-3 py-3 text-center text-[12px] text-[#53625a]">{s.liveNone}</div>}
        {liveStays.length > 0 && <div><button type="button" onClick={() => setShowStays(v => !v)} className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-[#cfe3d8] bg-[#f4faf6] text-[12px] font-semibold text-[#176b53]">{showStays ? <ChevronUp size={15} /> : <ChevronDown size={15} />}{s.open(liveStays.length)}</button>{showStays && <div className="mt-2 space-y-2.5">{slots(liveStays).map((sl, i) => <SlotView key={i} slot={sl} lang={lang} tone="plain" />)}</div>}</div>}
      </div>
      {upSlots.length > 0 ? <div><div className="mb-1 mt-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#b36a00]">{s.next}{countdown && <span className="rounded-full bg-[#fff0cf] px-2 py-0.5 normal-case tracking-normal">{countdown}</span>}</div><div className="space-y-2.5">{upSlots.map((sl, i) => <SlotView key={`n${i}`} slot={sl} lang={lang} tone={i === 0 ? 'next' : 'plain'} />)}</div></div> : !liveShows.length && <div className="rounded-xl bg-[#f7f7f3] px-3 py-4 text-center text-[13px] text-[#546258]">{s.empty}</div>}
    </div>;
  })();
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 max-md:p-0 max-md:items-end" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label={s.title} className="flex h-[min(46rem,92dvh)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-md:h-[94dvh] max-md:max-w-none max-md:rounded-b-none" onClick={e => e.stopPropagation()}>
      <div className="flex items-start justify-between gap-3 bg-[#172a24] px-4 pb-3 pt-3.5 text-white">
        <div className="min-w-0"><h2 className="m-0 flex items-center gap-2 text-[17px] leading-6"><CalendarClock size={19} />{s.title}</h2><p className="m-0 mt-0.5 text-[11px] leading-4 text-white/70">{s.sub}</p></div>
        <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-0 bg-white/15 text-white" aria-label={s.close} onClick={onClose}><X size={18} /></button>
      </div>
      <div className="border-b border-[#eeeee8] bg-[#fafaf6] px-2 py-2">
        <div className="flex items-center gap-1">
          <button type="button" aria-label={s.prevDay} disabled={idx === 0} onClick={() => go(idx - 1)} className="grid h-11 w-9 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-[#172a24] disabled:opacity-30"><ChevronLeft size={20} /></button>
          <div ref={stripRef} className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">{DAYS.map((k, i) => { const on = k === day, td = now?.date === k; return <button key={k} type="button" aria-current={on ? 'true' : undefined} onClick={() => setDay(k)} className={`relative flex h-14 w-[3.4rem] shrink-0 flex-col items-center justify-center rounded-xl border text-center ${on ? 'border-[#176b53] bg-[#176b53] text-white' : 'border-[#e5e5dc] bg-white text-[#172a24]'}`}><span className={`text-[10px] leading-3 ${on ? 'text-white/80' : 'text-[#7b857f]'}`}>{wk(k, lang)}</span><span className="text-[18px] font-bold leading-5">{dayNum(k)}</span>{(DAY_BADGE[k] || td) && <span className={`absolute -top-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-white ${td ? 'bg-[#e8175d]' : 'bg-[#d9941f]'}`} aria-hidden />}<span className="sr-only">{i}</span></button>; })}</div>
          <button type="button" aria-label={s.nextDay} disabled={idx === 9} onClick={() => go(idx + 1)} className="grid h-11 w-9 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-[#172a24] disabled:opacity-30"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="m-0 text-[16px] font-bold text-[#172a24]">{dateLabel(day, lang)}</h3>
          {relTag && <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${isToday ? 'bg-[#e8175d] text-white' : 'bg-[#eceee9] text-[#53625a]'}`}>{relTag}</span>}
          {DAY_BADGE[day] && <span className="rounded-full bg-[#d9941f] px-2 py-0.5 text-[11px] font-bold text-white">{DAY_BADGE[day]![lang]}</span>}
          <span className="ml-auto text-[11px] text-[#7b857f]">{shown.length} {s.items}</span>
        </div>
        {now && !todayIsLive && <div className="mb-2 rounded-xl bg-[#fff6e0] px-3 py-2 text-[12px] font-semibold text-[#6b5314]">{now.date < DAYS[0] ? s.startsIn(daysBetween(now.date, DAYS[0])) : s.over}</div>}
        {hasKey && <div className="mb-3 inline-flex rounded-xl border border-[#e5e5dc] bg-[#f4f5f2] p-0.5 text-[12px]" role="group">{([[false, s.all], [true, s.key]] as const).map(([v, l]) => <button key={String(v)} type="button" aria-pressed={onlyKey === v} onClick={() => setOnlyKey(v)} className={`min-h-9 rounded-[10px] border-0 px-3.5 font-semibold ${onlyKey === v ? 'bg-white text-[#176b53] shadow-sm' : 'bg-transparent text-[#53625a]'}`}>{v && <Star size={11} className="mr-1 inline" fill="currentColor" />}{l}</button>)}</div>}
        {body}
        <div className="mt-5 grid grid-cols-2 gap-2 max-md:grid-cols-1">
          {idx > 0 && <Preview k={DAYS[idx - 1]} label={s.prevDay} lang={lang} side="prev" onGo={() => go(idx - 1)} />}
          {idx < 9 && <Preview k={DAYS[idx + 1]} label={s.nextDay} lang={lang} side="next" onGo={() => go(idx + 1)} />}
        </div>
        <p className="mb-1 mt-4 text-[11px] leading-4 text-[#8a9189]">{isToday && <>{s.est}. </>}{s.note} <a className="underline" href={SCHEDULE_SOURCE.url} target="_blank" rel="noreferrer">{s.src}</a>{lang === 'zh' && ' · 中文为翻译，待核对'}</p>
      </div>
    </div>
  </div>;
}
