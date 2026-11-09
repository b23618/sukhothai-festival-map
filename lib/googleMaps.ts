import type { Language } from '@/data/points';
/** Google Maps UI language codes (hl). Google localises labels, buttons and directions to this language. */
export const GOOGLE_HL: Record<Language, string> = { th: 'th', en: 'en', zh: 'zh-CN' };
export interface Geo { lat: number; lng: number }
const ll = (g: Geo) => `${g.lat},${g.lng}`;
/** Open the place in Google Maps (no API key needed). */
export const mapsOpenUrl = (g: Geo, lang: Language) => `https://www.google.com/maps/search/?api=1&query=${ll(g)}&hl=${GOOGLE_HL[lang]}`;
/** Turn-by-turn directions from the visitor's current location. */
export const mapsDirectionsUrl = (g: Geo, lang: Language) => `https://www.google.com/maps/dir/?api=1&destination=${ll(g)}&travelmode=walking&hl=${GOOGLE_HL[lang]}`;
/** Keyless embeddable map for an <iframe>. */
export const mapsEmbedUrl = (g: Geo, lang: Language, zoom = 18) => `https://maps.google.com/maps?q=${ll(g)}&z=${zoom}&hl=${GOOGLE_HL[lang]}&output=embed`;
/** Directions between two places (origin -> destination). `mode` is a Google travelmode. */
export const mapsRouteUrl = (from: Geo, to: Geo, lang: Language, mode: 'walking' | 'driving' | 'transit' = 'walking') => `https://www.google.com/maps/dir/?api=1&origin=${ll(from)}&destination=${ll(to)}&travelmode=${mode}&hl=${GOOGLE_HL[lang]}`;
/** Great-circle distance in metres. */
export const haversineM = (a: Geo, b: Geo) => { const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r, h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2; return 12742000 * Math.asin(Math.sqrt(h)); };
/** Initial compass bearing (0 = north, clockwise) in degrees. */
export const bearingDeg = (a: Geo, b: Geo) => { const r = Math.PI / 180, y = Math.sin((b.lng - a.lng) * r) * Math.cos(b.lat * r), x = Math.cos(a.lat * r) * Math.sin(b.lat * r) - Math.sin(a.lat * r) * Math.cos(b.lat * r) * Math.cos((b.lng - a.lng) * r); return (Math.atan2(y, x) / r + 360) % 360; };
