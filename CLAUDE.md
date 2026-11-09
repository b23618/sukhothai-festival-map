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

Single-page Next.js 15 (App Router) + React 19 app: a 2.5D interactive venue map for the Sukhothai Loy Krathong festival 2569 (2026). UI is trilingual (th / en / zh); Thai is the default.

Three files carry the logic:

- `data/points.ts` — all map data. `Point` objects hold pixel coordinates `x,y` in the **1000×705 source image space** (not world or GPS coordinates) plus `Localized` `{th,en,zh}` title/description. 8 landmarks A–H are hand-written; 23 activities are generated from the `activityCoords` array. `allInitialPoints` is the merged export.
- `components/FestivalExplorer.tsx` — client component owning all state (language, points, search, category filter, selection, editor mode). Holds the UI string table `translations` inline. Sidebar list, detail card, and header live here.
- `components/ThreeVenue.tsx` — React Three Fiber canvas: tilted perspective camera (up = +Z, orbit enabled, polar angle capped), map PNG (`public/maps/sukhothai-2569.png`) as a textured plane, `MapControls` for pan/zoom with zoom buttons dollying the camera toward the controls target, pins rendered as drei `<Html>` buttons on raised stakes. Loaded via `next/dynamic` with `ssr:false` from `FestivalExplorer`.

### Coordinate system

`pixelToWorld` in `ThreeVenue.tsx` maps image pixels to the 20×14.1 world plane (y flipped). Edit-mode clicks invert this via the mesh `uv` in `Ground.onClick`. If the image size or plane size changes, update `IMAGE_W/IMAGE_H/W/H` together.

### Coordinate edit mode and persistence

Editor mode (sidebar toggle) lets the user select a point, then click the map to move it. Edits are written to `localStorage` key `sukhothai-map-points-v1` and loaded in a `useEffect` on mount, **replacing the entire `points` array** if shape validates. After editing `data/points.ts` defaults, stale localStorage in a browser will override them — clear the key to see changes. Export JSON button downloads current points; no backend exists.

### Data accuracy

Coordinates are estimates. Activity entries are placeholders (`verified:false`, generic names) pending organizer confirmation; `verified:true` on A–H only means the landmark name was legible, not that position is surveyed. Do not invent real activity names or schedules. GPS button intentionally shows a "not available" notice; no routing or geolocation exists.

## Conventions

- Path alias `@/*` maps to repo root.
- Code style is dense: minimal whitespace, several statements per line. Match it when editing nearby code.
- `.next/` and `node_modules/` are gitignored; the directory is not currently a git repo.
