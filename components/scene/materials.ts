import * as THREE from 'three';
const std = (color: string, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: .9, metalness: 0, flatShading: true, ...o });
function brickTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
  g.fillStyle = '#6e3b26'; g.fillRect(0, 0, 256, 256); let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let row = 0; row < 16; row++) for (let col = -1; col < 8; col++) { const x = col * 32 + (row % 2 ? 16 : 0), y = row * 16, k = r(); g.fillStyle = `hsl(${14 + k * 10},${46 + k * 14}%,${34 + k * 14}%)`; g.fillRect(x + 1.5, y + 1.5, 29, 13); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
let brickTex: THREE.CanvasTexture | null = null; const brickCache = new Map<string, THREE.MeshStandardMaterial>();
/** Procedural brick material; repeat is per-material so brick size stays consistent across differently sized boxes. */
export function brick(rx = 2, ry = 1) {
  const k = `${rx}|${ry}`; let m = brickCache.get(k);
  if (!m) { brickTex ||= brickTexture(); const t = brickTex.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); m = std('#ffffff', { map: t, flatShading: false }); brickCache.set(k, m); }
  return m;
}
const signCache = new Map<string, THREE.MeshBasicMaterial>();
/** Procedurally drawn sign face (letters on a coloured square). */
export function sign(text: string, bg: string, fg = '#fff') {
  const k = text + bg; let m = signCache.get(k);
  if (!m) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!; g.fillStyle = bg; g.fillRect(0, 0, 128, 128); g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(6, 6, 116, 116); g.fillStyle = fg; g.font = `bold ${text.length > 2 ? 44 : 72}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 64, 68); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; m = new THREE.MeshBasicMaterial({ map: t }); signCache.set(k, m); }
  return m;
}
export const M = {
  laterite: std('#a4583a'), stucco: std('#e9dcc0'), stone: std('#b9b2a0'), sandstone: std('#d8c8a0'), gold: std('#d9a521', { metalness: .35, roughness: .45, emissive: '#6b4a05', emissiveIntensity: .25 }),
  roofRed: std('#9c3b2a'), roofGold: std('#c9962b'), teak: std('#7a4a2a'), white: std('#f4f1e8'), dark: std('#3b3a38'), asphalt: std('#6f716f'), roadEdge: std('#a4a39b'), pathStone: std('#dbcba3'), pathEdge: std('#bba97d'),
  trunk: std('#6b4a30'), foam: new THREE.MeshBasicMaterial({ color: '#f4f0e0', transparent: true, opacity: .55, depthWrite: false }), fence: std('#c9962b'),
  leaf1: std('#3f8f45'), leaf2: std('#2f7a3d'), leaf3: std('#5aa24a'), bush: std('#4d9a47'), grass: std('#7fb04f'), earth: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
  red: std('#c0392b'), blue: std('#2b6fa8'), green: std('#2f8f5a'), pink: std('#e08aa6'), orange: std('#e0802b'), purple: std('#7b4fa8'), pad: std('#3e8f4f'),
  glow: new THREE.MeshStandardMaterial({ color: '#ffd37a', emissive: '#ffb347', emissiveIntensity: .6, roughness: .6 }),
  lantern: new THREE.MeshStandardMaterial({ color: '#ffb98a', emissive: '#ff8c3a', emissiveIntensity: .6, roughness: .6 }),
};
export const glowMaterials = [M.glow, M.lantern];
