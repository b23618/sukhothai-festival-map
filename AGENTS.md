# Project guide

This repository is a visitor-facing, trilingual (Thai, English, Chinese) 3D map for the Sukhothai Loy Krathong festival. Thai is the default language. Prioritize clear navigation on phones, fast rendering, and factual accuracy about the venue.

## Run and verify

- Node.js 20.9+ and npm. Install with `npm install`, develop with `npm run dev`.
- Run `npm run typecheck` and `npm run build` after code changes. There is currently no test runner or linter.
- The app is Next.js 15 App Router, React 19, TypeScript, React Three Fiber/Three.js, Zustand, and Tailwind CSS 4 plus `app/globals.css`.
- `next.config.mjs` exports a static site to `out/` for Cloudflare Pages. Keep features compatible with static export; do not add server routes, SSR dependencies, or server-only APIs without changing the hosting architecture.

## Where to edit

- `app/page.tsx` mounts `components/FestivalExplorer.tsx`, which owns the visitor UI and language strings. `app/globals.css` owns much of the existing styling.
- `components/scene/Scene.tsx` sets up the Canvas, camera, 3D scene, route line, and DOM pins. `environment.tsx`, `heritage.tsx`, `structures.tsx`, `festive.tsx`, and `symbols.tsx` contain scene elements.
- `data/points.ts` is the place dataset and localized point metadata; `data/activities.ts` holds the numbered activities; `data/festival.ts` holds event and visitor information. `data/layout.ts` and `data/osm.ts` supply terrain and map shapes.
- `store/useMapStore.ts` owns UI state, selection, time of day, routes, and browser geolocation. `lib/geo.ts` converts layout grid to scene coordinates; `lib/georef.ts` converts geographic coordinates to the grid. Use `lib/terrain.ts` `heightAt()` when placing elements on terrain.
- The `@/*` import alias resolves from the repository root.

## Map and content rules

- The official PNG in `reference/` is for analysis only. Build the scene with geometry and data; never display that image as a map background or 3D texture.
- Grid coordinates use a 1000 × 705 layout space. Scene units and GPS coordinates are different systems; use the existing conversion helpers. When changing a point's `geo`, reconcile its `x` and `y` with `geoToGrid`.
- `data/osm.ts` is generated OpenStreetMap data. Regenerate it with `scripts/overpass-query.txt` and `scripts/gen-osm.py` instead of hand-editing generated shapes. Preserve OSM attribution and source metadata.
- `verified` on a point is not proof that its position was surveyed. Models, shapes, some positions, and straight-line route visualization are approximations. Do not represent route lines as safe or accessible walking paths. Label estimated positions and distances accordingly.
- Use documented sources for dates, times, historical claims, opening hours, facilities, and translations. Do not invent schedules or official locations. Chinese copy marked `zhStatus: 'pending'` needs review before being presented as verified.
- A point may have an optional `glb` replacement with a procedural fallback. Keep the fallback functional.

## UI and rendering

- Keep Thai, English, and Chinese strings aligned when changing visitor-facing text. Check phone layout as well as desktop layout; mobile overlays share limited space.
- New scene effects should respect `LOW` from `lib/perf.ts` to preserve frame rate on touch devices and narrow screens.
- The 3D pin labels are DOM overlays projected by `PinProjector`. Preserve this mechanism when changing pins; many Drei `<Html>` roots caused rendering issues.
- The in-scene route is a visual straight line; the external map links and geolocation behavior live in `lib/route.ts`, `lib/googleMaps.ts`, and the route/GPS UI components.
