export type TokenFixture = {
  name: string;
  value: string;
  sourceLine: number;
};

export const paperTokenFixture = [
  { name: '--bg', value: '#ECECF0', sourceLine: 205 },
  { name: '--bg-2', value: '#F6F6F8', sourceLine: 206 },
  { name: '--bg-3', value: '#E3E3E9', sourceLine: 207 },
  { name: '--paper', value: '#FFFFFF', sourceLine: 208 },
  { name: '--paper-2', value: '#ECECF0', sourceLine: 209 },
  { name: '--line', value: '#E4E4EA', sourceLine: 210 },
  { name: '--line-2', value: '#D3D3DC', sourceLine: 211 },
  { name: '--text', value: '#1A1A1F', sourceLine: 212 },
  { name: '--text-2', value: '#44444C', sourceLine: 213 },
  { name: '--text-3', value: '#757575', sourceLine: 214 },
  { name: '--text-4', value: '#9A9AA3', sourceLine: 215 },
  { name: '--ok', value: '#1E9E63', sourceLine: 218 },
  { name: '--warn', value: '#B5791F', sourceLine: 219 },
  { name: '--bad', value: '#D32414', sourceLine: 220 },
  { name: '--info', value: '#5B53A8', sourceLine: 221 },
  { name: '--accent', value: '#93358D', sourceLine: 223 },
  { name: '--accent-dim', value: '#93358D24', sourceLine: 22383 },
  { name: '--accent-ink', value: '#FFFFFF', sourceLine: 225 },
  { name: '--brand-purple', value: '#93358D', sourceLine: 228 },
  { name: '--brand-indigo', value: '#3B2D59', sourceLine: 229 },
  { name: '--brand-red', value: '#EE3124', sourceLine: 230 },
  { name: '--brand-orange', value: '#E57828', sourceLine: 231 },
  { name: '--brand-yellow', value: '#EFAC37', sourceLine: 232 },
  { name: '--brand-lilac', value: '#B282BA', sourceLine: 233 },
  { name: '--brand-pink', value: '#DEB0D2', sourceLine: 234 },
  { name: '--brand-periwinkle', value: '#7670B3', sourceLine: 235 },
  { name: '--brand-mint', value: '#73C69C', sourceLine: 236 },
  { name: '--blue-dark', value: '#1E2A4D', sourceLine: 240 },
  { name: '--blue-med', value: '#4F6FB8', sourceLine: 241 },
  { name: '--blue-light', value: '#B0BDF5', sourceLine: 242 },
  { name: '--blue-soft', value: '#EAEEFB', sourceLine: 243 },
] satisfies readonly TokenFixture[];

export const invariantTokenFixture = [
  { name: '--radius-sm', value: '6px', sourceLine: 246 },
  { name: '--radius', value: '8px', sourceLine: 247 },
  { name: '--radius-lg', value: '10px', sourceLine: 248 },
  { name: '--radius-xl', value: '14px', sourceLine: 249 },
  {
    name: '--font-sans',
    value:
      "'NumCalibri', 'Zarid Sans', 'Myriad Pro', 'Calibri', system-ui, sans-serif",
    sourceLine: 253,
  },
  {
    name: '--font-serif',
    value: "'NumCalibri', 'Cormorant', 'Times New Roman', serif",
    sourceLine: 254,
  },
  { name: '--font-display', value: 'var(--font-sans)', sourceLine: 255 },
  { name: '--font-ui', value: 'var(--font-sans)', sourceLine: 256 },
  {
    name: '--font-arabic',
    value:
      "'NumCalibri', 'GE SS', 'GE SS Two', 'GE SS Text', 'BCN Arabic', sans-serif",
    sourceLine: 257,
  },
  { name: '--font-mono', value: 'var(--font-sans)', sourceLine: 258 },
  {
    name: '--font-num',
    value: "'Calibri', 'Carlito', 'Segoe UI', system-ui, sans-serif",
    sourceLine: 260,
  },
] satisfies readonly TokenFixture[];

export const inkTokenFixture = [
  { name: '--bg', value: 'oklch(0.18 0.008 240)', sourceLine: 265 },
  { name: '--bg-2', value: 'oklch(0.21 0.008 240)', sourceLine: 266 },
  { name: '--bg-3', value: 'oklch(0.26 0.009 240)', sourceLine: 267 },
  { name: '--paper', value: 'oklch(0.235 0.009 240)', sourceLine: 268 },
  { name: '--paper-2', value: 'oklch(0.27 0.01 240)', sourceLine: 269 },
  { name: '--line', value: 'oklch(0.32 0.01 240)', sourceLine: 270 },
  { name: '--line-2', value: 'oklch(0.40 0.012 240)', sourceLine: 271 },
  { name: '--text', value: 'oklch(0.97 0.005 240)', sourceLine: 272 },
  { name: '--text-2', value: 'oklch(0.78 0.01 240)', sourceLine: 273 },
  { name: '--text-3', value: 'oklch(0.58 0.01 240)', sourceLine: 274 },
  { name: '--text-4', value: 'oklch(0.45 0.008 240)', sourceLine: 275 },
  { name: '--ok', value: 'oklch(0.80 0.15 155)', sourceLine: 277 },
  { name: '--warn', value: 'oklch(0.82 0.14 75)', sourceLine: 278 },
  { name: '--bad', value: 'oklch(0.72 0.16 22)', sourceLine: 279 },
  { name: '--info', value: 'oklch(0.78 0.12 235)', sourceLine: 280 },
  { name: '--blue-med', value: '#8AA4E6', sourceLine: 283 },
  {
    name: '--blue-soft',
    value: 'color-mix(in srgb, #4F6FB8 26%, transparent)',
    sourceLine: 284,
  },
] satisfies readonly TokenFixture[];
