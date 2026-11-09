/** True on phones / touch-first devices: the scene drops shadows, MSAA, point lights and particle counts there to keep a steady frame rate. Client-only (false during SSR). */
export const LOW = typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
