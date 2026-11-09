# Sukhothai Festival Interactive Map (2569 / 2026)

Mobile-friendly **2.5D venue map** built with Next.js, React Three Fiber (Three.js), and Drei. Based on the supplied 1000×705 venue plan.

## Quick start

Requirements: Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Features

- Fully procedural 3D scene — **no map image is used as a texture or background** (the plan lives in `reference/` for analysis only)
- Terrain with ponds, island mounds and soil skirt; animated water shader; roads, stone paths and bridges
- Instanced trees, bushes and grass; floating krathong; sky lanterns at golden hour/night
- Distinct procedural models for landmarks A–H (lotus-bud and bell chedis, ruins, mondop, monument, pond), generic festival set-pieces, parking, first aid, WC, shuttle stops, VIP tents, gates
- Day / golden / night lighting, soft shadows, camera tweens to selected places, overview / isometric / top views
- Thai / English / Chinese UI (Chinese text flagged pending review), search, filters
- Coordinate edit mode (click terrain to move the selected item; export JSON); edits stored in this browser
- Optional GLB replacement per point (`glb` field in `data/points.ts`, e.g. `/models/wat-mahathat.glb`); falls back to the procedural model

## Dataset and accuracy

The `data/points.ts` file holds `Point` objects. **Point coordinates are estimates** and should be confirmed by organizer review. The `verified` flag for A–H indicates that the landmark NAME was legible in the source legend — NOT that the pixel position was GPS-surveyed. Activity labels and schedules are deliberately generic pending authoritative verification. A few activity numbers may recur in the printed map; do not assume that one printed marker always corresponds to exactly one event site.

No GPS positions, walking routes, live schedules, or guaranteed accessible paths are included. The GPS button explains that navigation is not yet enabled rather than misleading visitors.

To persist edits for everyone, export the JSON and either copy it into your application dataset or add an admin API/DB. The current editor stores changes only in the editor's browser; it is a proof of concept, not a production multi-user CMS.

## Next steps

1. Confirm all activity names, translations, positions and hours with the official festival organizer.
2. Add a NestJS API + Prisma tables for maps, points, schedules, assets, and translations.
3. Replace localStorage editor with authenticated updates; add moderation/review and publish workflow.
4. For pedestrian navigation, georeference the image, survey entrances and walkways, create a routable walking graph, and use verified GPS input.
5. Test in iOS Safari, Android Chrome, and under real festival cellular loads.

## Original source

https://sukhothailoykrathong.com/docs/sukhothai-loykrathong-2569-venue-map.png

Respect the original map publisher's copyright/permissions for public redistribution. The copy bundled here is provided for this user's prototype and may require permission for public deployment.
