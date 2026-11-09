# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev        # Next.js dev server, http://localhost:3000
npm run build
npm run start
npm run typecheck  # tsc --noEmit
```

No test runner or linter is configured. Requires Node.js 20.9+. `typecheck` is the only automated check.

## Architecture

Single-page Next.js 15 (App Router) + React 19 + Tailwind v4 (utilities only, no preflight; legacy CSS stays in `app/globals.css`) app: a fully procedural 3D diorama of the Sukhothai Loy Krathong festival 2569 (2026) venue. UI is trilingual (th / en / zh); Thai is default. Deployed to Cloudflare **Pages** as a static export (`output: 'export'` in `next.config.mjs`, output dir `out`, `wrangler.jsonc` has `pages_build_output_dir`). Pages settings: build command `npm run build`, output `out`. No server features may be added (no route handlers/SSR) without moving to Workers + OpenNext. `npm run deploy` = build + `wrangler pages deploy out`.

**Hard rule: the official venue PNG must never be used as a texture/background in the scene.** It lives in `reference/` (outside `public/`) for analysis only.

- `data/points.ts` — `Point` records (8 landmarks A–H, 43 activities, 33 facilities (7 parking, 13 WC, 4 VIP parking, first aid, HQ, shuttle, OB, 2 generic gates); activity names live in `data/activities.ts`, transcribed from the official plan's two legend lists: orange `festival` 1–20 and purple `culture` 1–23, one primary marker each). `x,y` are **layout-grid coords (1000×705)**; world position derives via `pointWorld()`. Also holds `model` (procedural model type), `height`, `focusDistance`, `tags`, `zhStatus`, optional `glb`.
- `data/festival.ts` — festival-level facts (dates, phone, 6 official activities) from the official site. `lib/googleMaps.ts` + `components/PlaceMap.tsx` — keyless Google Maps open/directions links and iframe embed, localised via `hl` (th / en / zh-CN). Landmark `geo` coords come from OpenStreetMap (ODbL); only A–H have them, others show "no verified GPS". `sources[]` on each point lists where facts came from.
- `lib/georef.ts` — metric north-up lat/lng↔grid projection (1 cell = 2.64 m, no rotation/distortion). Activities, facilities and landmarks A–H all derive grid positions from official GPS via `geoToGrid`, so they line up with Google Maps and with `data/osm.ts`. All official coordinates/times come from https://sukhothailoykrathong.com/about (fetched 2026-11-09); `data/festival.ts` holds the dated timeline.
- `data/osm.ts` — GENERATED from OpenStreetMap via Overpass (ODbL, fetched 2026-11-09, bbox 17.011,99.694,17.027,99.712): pond outlines + island circles, roads/paths, bridges, walls, ruin/building footprints in grid coords. Regenerate rather than hand-edit. `data/layout.ts` re-exports these as `ponds/roads/bridges`; `boundary` is the padded convex hull of official activity GPS (not a surveyed fence); `OsmGround` in `environment.tsx` extrudes walls/ruins/buildings.
- `lib/geo.ts` (grid↔world, polygon/spline helpers, `BOUNDS`/`CENTER` of the diorama), `lib/terrain.ts` (`heightAt`, `waterDepth`, ground colours; single source of truth for ground height — placement code must call it), `lib/ribbon.ts` (terrain-following ribbon meshes for roads/shore/bridges).
- `store/useMapStore.ts` — Zustand store: language, points, filters, selection, editor mode, time of day, camera requests (`zoomReq`, `viewReq`). Position edits persist as `{id:[x,y]}` overrides in `localStorage` key `sukhothai-map-overrides-v2`.
- `components/scene/` — `Scene.tsx` (Canvas, lights/sky by time of day, `CameraRig` tweens to selection/views, pins, ambient krathong/lanterns), `environment.tsx` (Terrain, Water shader, Roads, Vegetation via InstancedMesh), `heritage.tsx` (one metre-authored model per landmark: wat-mahathat, wat-chana, noen-prasat, wat-mai, wat-sa-si, traphang-ngoen, monument, pond-feature + scenery si-sawai/island-chedi/viharn-ruins; sizes from published sources, noted in each doc comment; `HeritageAt` scales metres→world via `METER` and exaggerates height by `VEXAG`, both in `lib/geo.ts`; `GroundCtx` lets walls follow terrain), `structures.tsx` (festival set-pieces + facilities), `materials.ts` (shared materials, procedural brick/sign canvases). `components/ThreeVenue.tsx` just re-exports `Scene`.
- `components/RoutePanel.tsx` — pick start/end (store `routeFrom`/`routeTo`, set from detail card buttons); straight-line distance, walk time (×1.3 / 75 m/min), compass heading, Google Maps walking/driving links (`mapsRouteUrl`); `RouteLine` in `Scene.tsx` drapes a dashed line. Points without official GPS use `gridToGeo` (estimated).
- `components/scene/festive.tsx` — decorative Loy Krathong layer (instanced lotus krathong fleet on ponds, khom loi sky lanterns, giant krathong + flame bowl sculptures; toggle `festive`) and `UserDot`. Generic symbols, not documented installations. `components/Nearby.tsx` (nearest 6 places with distance/compass/walk time), `components/GpsPanel.tsx` + store `locate()/userPos` (browser geolocation, never sent anywhere), `lib/route.ts` (`ME` endpoint = user position; walking-only helpers). Route links are walking-only (`mapsRouteUrl`). Parking from sukhothailoykrathong.com/places lives in `placeParking` (some lie outside the diorama: hidden in 3D, still searchable/routable); transport/emergency info in `places` (`data/festival.ts`).
- `components/FestivalExplorer.tsx` — sidebar/detail UI and string table.

Gotchas: pins are a plain DOM overlay projected every frame by `PinProjector` — do not use drei `<Html>` for many pins (React 19 "unmount a root while rendering" errors). Activity set-pieces are stand-ins chosen by meaning (stage/pavilion/food/pier…); those that land in a pond become floating piers. Setting `glb` on a point swaps in a GLB (falls back to procedural if it fails to load).

### Data accuracy

Coordinates, shapes and all 3D models are artistic approximations. Activity names are official but English/Chinese are translations; `schedule` is null; Chinese text is marked `zhStatus:'pending'`. Do not invent real activity names, schedules or historical claims. GPS button intentionally shows a "not available" notice.

## Conventions

- Path alias `@/*` maps to repo root.
- Legacy UI files use a dense style (several statements per line); match it when editing them.
- `.next/`, `.open-next/`, `node_modules/` are gitignored; the directory is not currently a git repo.
