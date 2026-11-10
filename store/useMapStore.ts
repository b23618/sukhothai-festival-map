import { create } from 'zustand';
import type { UserPos } from '@/lib/route';
import { allInitialPoints, type Category, type CategoryFilter, type Language, type Point } from '@/data/points';
export type TimeOfDay = 'day' | 'golden' | 'night';
export type ViewName = 'overview' | 'top' | 'iso';
interface State {
  lang: Language; points: Point[]; query: string; categories: CategoryFilter[]; selectedId: string | null; time: TimeOfDay;
  routeFrom: string | null; routeTo: string | null; userPos: UserPos | null; locState: 'off' | 'asking' | 'on' | 'denied' | 'unsupported'; timeManual: boolean; mobileList: boolean; gpsMessage: boolean; zoomReq: number; viewReq: { name: ViewName; n: number } | null;
  locate: () => void; stopLocate: () => void; autoTime: () => void;
  setRoute: (from?: string | null, to?: string | null) => void; clearRoute: () => void;
  setLang: (l: Language) => void; setQuery: (q: string) => void; setCategory: (c: CategoryFilter) => void; toggleCategory: (c: CategoryFilter) => void; select: (id: string | null) => void;
  setTime: (t: TimeOfDay) => void; setMobileList: (b: boolean) => void; setGps: (b: boolean) => void;
  zoom: (dir: 1 | -1) => void; setView: (v: ViewName) => void;
}
let watchId: number | null = null;
/** Real local time in Thailand: night from 19:00 to 05:00, golden hour 17:00-19:00 and 05:00-06:30, otherwise day. */
export function timeForNow(d = new Date()): TimeOfDay {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d), h = +(parts.find(x => x.type === 'hour')?.value ?? 12) % 24, m = +(parts.find(x => x.type === 'minute')?.value ?? 0), t = h + m / 60;
  return t >= 19 || t < 5 ? 'night' : t >= 17 || t < 6.5 ? 'golden' : 'day';
}
export const useMapStore = create<State>((set, get) => ({
  lang: 'th', points: allInitialPoints, query: '', categories: [], selectedId: null, time: 'golden', routeFrom: null, routeTo: null, userPos: null, locState: 'off', timeManual: false, mobileList: false, gpsMessage: false, zoomReq: 0, viewReq: null,
  autoTime: () => { if (!get().timeManual) set({ time: timeForNow() }); },
  locate: () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { set({ locState: 'unsupported' }); return; }
    if (watchId !== null) return; set({ locState: 'asking' });
    watchId = navigator.geolocation.watchPosition(pos => set({ userPos: { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy }, locState: 'on' }), err => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); watchId = null; set({ locState: err.code === 1 ? 'denied' : 'off' }); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
  },
  stopLocate: () => { if (watchId !== null && typeof navigator !== 'undefined') navigator.geolocation.clearWatch(watchId); watchId = null; set({ userPos: null, locState: 'off', ...(get().routeFrom === 'me' ? { routeFrom: null } : {}) }); },
  setRoute: (from, to) => set(s => ({ routeFrom: from === undefined ? s.routeFrom : from, routeTo: to === undefined ? s.routeTo : to })), clearRoute: () => set({ routeFrom: null, routeTo: null }),
  setLang: lang => set({ lang }), setQuery: query => set({ query }), setCategory: c => set({ categories: c === 'all' ? [] : [c] }), toggleCategory: c => set(s => ({ categories: c === 'all' ? [] : s.categories.includes(c) ? s.categories.filter(x => x !== c) : [...s.categories, c] })), select: selectedId => set({ selectedId }),
  setTime: time => set({ time, timeManual: true }), setMobileList: mobileList => set({ mobileList }), setGps: gpsMessage => set({ gpsMessage }),
  zoom: dir => set(s => ({ zoomReq: (Math.abs(s.zoomReq) + 1) * dir })), setView: name => set(s => ({ viewReq: { name, n: (s.viewReq?.n ?? 0) + 1 }, selectedId: null })),
}));
