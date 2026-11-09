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
- `data/festival.ts` — festival-level facts (dates, phone, 6 official activities) from the official site. `lib/googleMaps.ts` + `components/PlaceMap.tsx` — keyless Google Maps open link (directions and iframe embed helpers remain in lib/googleMaps.ts but are unused by the UI), localised via `hl` (th / en / zh-CN). Landmark `geo` coords come from OpenStreetMap (ODbL); only A–H have them, others show "no verified GPS". `sources[]` on each point lists where facts came from.
- `lib/georef.ts` — metric north-up lat/lng↔grid projection (1 cell = 2.64 m, no rotation/distortion). Activities, facilities and landmarks A–H all derive grid positions from official GPS via `geoToGrid`, so they line up with Google Maps and with `data/osm.ts`. All official coordinates/times come from https://sukhothailoykrathong.com/about (fetched 2026-11-09); `data/festival.ts` holds the dated timeline.
- `data/osm.ts` — GENERATED from OpenStreetMap via Overpass (ODbL, fetched 2026-11-09, bbox 17.0075,99.6905,17.0295,99.7150): pond outlines + island circles, roads/paths, bridges, walls, ruin/building footprints in grid coords. Regenerate rather than hand-edit: run the query in `scripts/overpass-query.txt` against Overpass, then `python3 scripts/gen-osm.py result.json`. `data/layout.ts` re-exports these as `ponds/roads/bridges`; `boundary` is the padded convex hull of official activity GPS (not a surveyed fence); `OsmGround` in `environment.tsx` extrudes walls/ruins/buildings.
- `lib/geo.ts` (grid↔world, polygon/spline helpers, `BOUNDS`/`CENTER` of the diorama), `lib/terrain.ts` (`heightAt`, `waterDepth`, ground colours; single source of truth for ground height — placement code must call it), `lib/ribbon.ts` (terrain-following ribbon meshes for roads/shore/bridges).
- `store/useMapStore.ts` — Zustand store: language, points, filters, selection, time of day (auto from Bangkok clock via `timeForNow`: night 19:00–05:00, golden 17:00–19:00/05:00–06:30; re-checked every minute until the user picks a mode manually), camera requests (`zoomReq`, `viewReq`).
- `components/scene/` — `Scene.tsx` (Canvas, lights/sky by time of day, `CameraRig` tweens to selection/views, pins, ambient krathong/lanterns), `environment.tsx` (Terrain, Water shader, Roads, Vegetation via InstancedMesh), `heritage.tsx` (one metre-authored model per landmark: wat-mahathat, wat-chana, noen-prasat, wat-mai, wat-sa-si, traphang-ngoen, monument, pond-feature + scenery si-sawai/island-chedi/viharn-ruins; sizes from published sources, noted in each doc comment; `HeritageAt` scales metres→world via `METER` and exaggerates height by `VEXAG`, both in `lib/geo.ts`; `GroundCtx` lets walls follow terrain), `structures.tsx` (festival set-pieces + facilities), `materials.ts` (shared materials, procedural brick/sign canvases). `components/ThreeVenue.tsx` just re-exports `Scene`.
- `components/RoutePanel.tsx` — pick start/end (store `routeFrom`/`routeTo`, set from detail card buttons); straight-line distance, walk time (×1.3 / 75 m/min), compass heading, Google Maps walking/driving links (`mapsRouteUrl`); `RouteLine` in `Scene.tsx` drapes a dashed line. Points without official GPS use `gridToGeo` (estimated).
- `components/scene/festive.tsx` — decorative Loy Krathong layer (giant krathong + flame bowl sculptures always; instanced krathong fleet, khom loi sky lanterns and `Fireworks` (rockets with trails; peony/ring/willow bursts, drag, gravity, flash) only when time-of-day is night; no toggle button; `TitleFireworks` rockets burst into the festival title "งานประเพณีลอยกระทง เผาเทียน เล่นไฟ จังหวัดสุโขทัย ปี 2569" written in sparks, sampled from a canvas, billboarded to the camera) night-only `PlaceGlow` (coloured pool + beam per point) / `LandmarkLights` (amber floodlights on heritage), and `UserDot`. Generic symbols, not documented installations. `components/Nearby.tsx` (nearest 6 places with distance/compass/walk time), `components/GpsPanel.tsx` + store `locate()/userPos` (browser geolocation, never sent anywhere), `lib/route.ts` (`ME` endpoint = user position; walking-only helpers). Route links are walking-only (`mapsRouteUrl`). Parking from sukhothailoykrathong.com/places lives in `placeParking` (some lie outside the diorama: hidden in 3D, still searchable/routable); transport/emergency info in `places` (`data/festival.ts`).
- `components/scene/symbols.tsx` — `Emblem` pictograms floating above spots (nang noppamas figure, market stall, cowrie shell, krathong, fireworks, candle, WC, P, first aid, bus). `Point.symbol` is assigned by `symbolFor` in `data/points.ts` (regex on official Thai names / facility model). `components/Legend.tsx` explains them (button under zoom controls). Add a new emblem in three places: `SymbolKind`, `symbolFor`, `EMBLEMS` + legend `ITEMS`.
- `components/FestivalExplorer.tsx` — sidebar/detail UI and string table. Filter chips use `CategoryFilter` (`data/points.ts`: all/landmark/activity/facility plus virtual `parking`/`shuttle`/`wc`/`firstaid`, matched on the facility `model`); both the sidebar and the 3D pins filter through `inCategory`. Sidebar footer carries the maker credit (Facebook link). The coordinate-editor mode was removed; point positions are fixed from data.

Gotchas: pins are a plain DOM overlay projected every frame by `PinProjector` — do not use drei `<Html>` for many pins (React 19 "unmount a root while rendering" errors). Activity set-pieces are stand-ins chosen by meaning (stage/pavilion/food/pier…); those that land in a pond become floating piers. Setting `glb` on a point swaps in a GLB (falls back to procedural if it fails to load).

### Data accuracy

Landmark GPS (A–H) was cross-checked against Google Maps place pins on 2026-11-09: A, C, E, G match exactly, D within ~40 m; B (Wat Chana Songkhram) and F (Wat Traphang Ngoen) were moved to the Google pins (the official-site GPS was 74 m / 156 m off). H (Traphang Tan) was not verified. Landmark `x,y` are hard-coded, so recompute them with `geoToGrid` whenever `geo` changes.

Coordinates, shapes and all 3D models are artistic approximations. Activity names are official but English/Chinese are translations; `schedule` is null; Chinese text is marked `zhStatus:'pending'`. Do not invent real activity names, schedules or historical claims. GPS button intentionally shows a "not available" notice.

## Terrain extent & roads out of the area

`BOUNDS_GRID` (lib/geo.ts) is larger than the venue so the surrounding road network is visible; `VENUE` is the venue centre (cameras/lights/ambience aim at it, `CENTER` is the whole terrain's centre). `gateways` (data/layout.ts) are road ends with an OSM `ref` (12, 102, 1272) that leave the area; they become `road-*` facility points (blue pills in 3D, search-able). Destinations are only set where OSM route relations / known facts support it (12 W→Tak, 12 E→Phitsanulok, 102 N→Uttaradit); others stay unlabelled. Gotcha: the built-in browser pane freezes the r3f loop while hidden, so the map looks blank until the pane is shown.

## Mobile layout

Performance: `lib/perf.ts` exports `LOW` (coarse pointer or width < 768). On LOW the scene drops shadows, MSAA, landmark point lights, lowers DPR (≤1.25), terrain resolution, firework/walker counts. Keep new heavy effects behind `LOW`.

Below 768 px (`max-md:` + the `@media(max-width:760px)` blocks at the end of `app/globals.css`): compact header (icon-only info button), icon-only view buttons, no status chip/instructions/footer note, and ONE bottom sheet at a time — route panel > GPS panel > detail card (detail card is collapsed to title/description/walk buttons with a "more details" toggle). Keep new overlays inside that priority scheme.

## Conventions

- Path alias `@/*` maps to repo root.
- Legacy UI files use a dense style (several statements per line); match it when editing them.
- `.next/`, `.open-next/`, `node_modules/` are gitignored; the directory is not currently a git repo.
