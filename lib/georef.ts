import { BOUNDS_GRID, type Pt } from './geo';
// Metric, north-up projection lat/lng <-> layout grid: 1 cell = 2.64 m on both axes, no rotation or distortion, so official GPS points,
// OpenStreetMap geometry (data/osm.ts) and Google Maps all line up. The venue plan image is NOT used for positions.
const LA0 = 17.0185, LN0 = 99.7035, X0 = 321.0, Y0 = 339.7, KX = 4.033, KY = 4.188; // cells per 1e-4 degree (lng / lat)
export function geoToGrid(lat: number, lng: number): Pt { return [Math.round(X0 + KX * (lng - LN0) * 1e4), Math.round(Y0 - KY * (lat - LA0) * 1e4)]; }
export function gridToGeo(x: number, y: number) { return { lat: +(LA0 - (y - Y0) / KY / 1e4).toFixed(7), lng: +(LN0 + (x - X0) / KX / 1e4).toFixed(7) }; }
export const inDiorama = (p: Pt) => p[0] >= BOUNDS_GRID.x0 && p[0] <= BOUNDS_GRID.x1 && p[1] >= BOUNDS_GRID.y0 && p[1] <= BOUNDS_GRID.y1;
