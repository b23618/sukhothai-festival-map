import { create } from 'zustand';
import { allInitialPoints, type Category, type Language, type Point } from '@/data/points';
export type TimeOfDay = 'day' | 'golden' | 'night';
export type ViewName = 'overview' | 'top' | 'iso';
const KEY = 'sukhothai-map-overrides-v2';
interface State {
  lang: Language; points: Point[]; query: string; category: 'all' | Category; selectedId: string | null; editor: boolean; time: TimeOfDay;
  routeFrom: string | null; routeTo: string | null; mobileList: boolean; gpsMessage: boolean; zoomReq: number; viewReq: { name: ViewName; n: number } | null;
  setRoute: (from?: string | null, to?: string | null) => void; clearRoute: () => void;
  setLang: (l: Language) => void; setQuery: (q: string) => void; setCategory: (c: 'all' | Category) => void; select: (id: string | null) => void;
  setEditor: (b: boolean) => void; setTime: (t: TimeOfDay) => void; setMobileList: (b: boolean) => void; setGps: (b: boolean) => void;
  zoom: (dir: 1 | -1) => void; setView: (v: ViewName) => void; movePoint: (x: number, y: number) => void; hydrate: () => void;
}
export const useMapStore = create<State>((set, get) => ({
  lang: 'th', points: allInitialPoints, query: '', category: 'all', selectedId: null, editor: false, time: 'golden', routeFrom: null, routeTo: null, mobileList: false, gpsMessage: false, zoomReq: 0, viewReq: null,
  setRoute: (from, to) => set(s => ({ routeFrom: from === undefined ? s.routeFrom : from, routeTo: to === undefined ? s.routeTo : to })), clearRoute: () => set({ routeFrom: null, routeTo: null }),
  setLang: lang => set({ lang }), setQuery: query => set({ query }), setCategory: category => set({ category }), select: selectedId => set({ selectedId }),
  setEditor: editor => set({ editor }), setTime: time => set({ time }), setMobileList: mobileList => set({ mobileList }), setGps: gpsMessage => set({ gpsMessage }),
  zoom: dir => set(s => ({ zoomReq: (Math.abs(s.zoomReq) + 1) * dir })), setView: name => set(s => ({ viewReq: { name, n: (s.viewReq?.n ?? 0) + 1 }, selectedId: null })),
  movePoint: (x, y) => { const { editor, selectedId, points } = get(); if (!editor || !selectedId) return; const next = points.map(p => p.id === selectedId ? { ...p, x, y } : p); set({ points: next }); try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(next.map(p => [p.id, [p.x, p.y]])))); } catch {} },
  hydrate: () => { try { const raw = localStorage.getItem(KEY); if (!raw) return; const o = JSON.parse(raw) as Record<string, [number, number]>; set(s => ({ points: s.points.map(p => Array.isArray(o[p.id]) && o[p.id].every(Number.isFinite) ? { ...p, x: o[p.id][0], y: o[p.id][1] } : p) })); } catch {} },
}));
