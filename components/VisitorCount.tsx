'use client';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Language } from '@/data/points';
const LABEL = { th: 'ผู้เข้าชม', en: 'Visitors', zh: '访客' } satisfies Record<Language, string>;
/** Real visit counter backed by functions/api/visits.ts. Counts one visit per browser per day; hidden when the API is unavailable (e.g. local dev). */
export default function VisitorCount({ lang }: { lang: Language }) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    let day = '', seen = '';
    try { day = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }); seen = localStorage.getItem('visit-day') ?? ''; } catch { /* storage blocked: just read the count */ }
    const count = day && seen !== day;
    fetch('/api/visits', { method: count ? 'POST' : 'GET' }).then(r => r.ok ? r.json() : null).then(j => {
      if (typeof j?.count !== 'number') return;
      setN(j.count); if (count) try { localStorage.setItem('visit-day', day); } catch { /* ignore */ }
    }).catch(() => {});
  }, []);
  if (n === null) return null;
  return <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-[#77857d]"><Eye size={12} />{LABEL[lang]} {n.toLocaleString(lang === 'th' ? 'th-TH' : lang === 'zh' ? 'zh-CN' : 'en-US')}</span>;
}
