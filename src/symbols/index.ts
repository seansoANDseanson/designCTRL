export interface MEPSymbol {
  id: string;
  name: string;
  category: SymbolCategory;
  tagPrefix: string;   // AHU, VAV, P, etc. — used for auto-numbering
  defaultW: number;    // canvas units at placement
  defaultH: number;
  viewBox: string;
  svg: string;         // inner SVG elements; uses currentColor for stroke/fill
}

export type SymbolCategory = 'HVAC' | 'PIPING' | 'DUCTWORK' | 'ELECTRICAL' | 'CONTROLS' | 'FIRE';

// ─── HVAC ──────────────────────────────────────────────────────────────────
const HVAC: MEPSymbol[] = [
  {
    id: 'hvac-ahu',
    name: 'Air Handling Unit',
    category: 'HVAC',
    tagPrefix: 'AHU',
    defaultW: 120, defaultH: 80,
    viewBox: '0 0 60 40',
    svg: `
      <rect x="1" y="1" width="58" height="38" rx="1"/>
      <line x1="28" y1="1" x2="28" y2="39"/>
      <path d="M6 20 Q9 12 12 20 Q15 28 18 20 Q21 12 24 20" fill="none"/>
      <circle cx="44" cy="20" r="14" fill="none"/>
      <line x1="44" y1="6" x2="44" y2="34"/>
      <line x1="30" y1="20" x2="58" y2="20"/>
    `,
  },
  {
    id: 'hvac-vav',
    name: 'VAV Box',
    category: 'HVAC',
    tagPrefix: 'VAV',
    defaultW: 80, defaultH: 50,
    viewBox: '0 0 60 40',
    svg: `
      <rect x="1" y="8" width="58" height="24" rx="1"/>
      <line x1="10" y1="20" x2="50" y2="14" stroke-width="2"/>
      <circle cx="10" cy="20" r="2.5" fill="currentColor"/>
      <polygon points="54,20 48,16 48,24" fill="currentColor"/>
    `,
  },
  {
    id: 'hvac-supply-diff',
    name: 'Supply Diffuser',
    category: 'HVAC',
    tagPrefix: 'SD',
    defaultW: 60, defaultH: 60,
    viewBox: '0 0 60 60',
    svg: `
      <rect x="3" y="3" width="54" height="54" rx="1"/>
      <line x1="3" y1="3" x2="57" y2="57"/>
      <line x1="57" y1="3" x2="3" y2="57"/>
      <line x1="30" y1="3" x2="30" y2="57"/>
      <line x1="3" y1="30" x2="57" y2="30"/>
    `,
  },
  {
    id: 'hvac-return-grille',
    name: 'Return Grille',
    category: 'HVAC',
    tagPrefix: 'RG',
    defaultW: 80, defaultH: 50,
    viewBox: '0 0 60 40',
    svg: `
      <rect x="3" y="3" width="54" height="34" rx="1"/>
      <line x1="9" y1="12" x2="51" y2="12"/>
      <line x1="9" y1="20" x2="51" y2="20"/>
      <line x1="9" y1="28" x2="51" y2="28"/>
    `,
  },
  {
    id: 'hvac-fan',
    name: 'Centrifugal Fan',
    category: 'HVAC',
    tagPrefix: 'CF',
    defaultW: 60, defaultH: 60,
    viewBox: '0 0 60 60',
    svg: `
      <circle cx="30" cy="30" r="27"/>
      <path d="M30 3 A27 27 0 0 1 57 30 L30 30 Z" fill="none"/>
      <path d="M57 30 A27 27 0 0 1 30 57 L30 30 Z" fill="none"/>
      <path d="M30 57 A27 27 0 0 1 3 30 L30 30 Z" fill="none"/>
      <path d="M3 30 A27 27 0 0 1 30 3 L30 30 Z" fill="none"/>
      <circle cx="30" cy="30" r="5"/>
    `,
  },
  {
    id: 'hvac-pump',
    name: 'Pump',
    category: 'HVAC',
    tagPrefix: 'P',
    defaultW: 60, defaultH: 60,
    viewBox: '0 0 60 60',
    svg: `
      <circle cx="30" cy="30" r="26"/>
      <polygon points="18,18 18,42 44,30" fill="none"/>
      <line x1="56" y1="30" x2="60" y2="30"/>
      <line x1="4" y1="30" x2="0" y2="30"/>
    `,
  },
  {
    id: 'hvac-chiller',
    name: 'Chiller',
    category: 'HVAC',
    tagPrefix: 'CH',
    defaultW: 120, defaultH: 80,
    viewBox: '0 0 60 40',
    svg: `
      <rect x="1" y="1" width="58" height="38" rx="1"/>
      <line x1="1" y1="14" x2="59" y2="14"/>
      <line x1="1" y1="26" x2="59" y2="26"/>
      <line x1="12" y1="14" x2="12" y2="26"/>
      <line x1="22" y1="14" x2="22" y2="26"/>
      <line x1="32" y1="14" x2="32" y2="26"/>
      <line x1="42" y1="14" x2="42" y2="26"/>
      <line x1="52" y1="14" x2="52" y2="26"/>
    `,
  },
  {
    id: 'hvac-cooling-tower',
    name: 'Cooling Tower',
    category: 'HVAC',
    tagPrefix: 'CT',
    defaultW: 80, defaultH: 80,
    viewBox: '0 0 60 60',
    svg: `
      <path d="M8 4 L52 4 L56 56 L4 56 Z" fill="none"/>
      <line x1="4" y1="22" x2="56" y2="22"/>
      <circle cx="18" cy="38" r="3" fill="currentColor"/>
      <circle cx="30" cy="44" r="3" fill="currentColor"/>
      <circle cx="42" cy="38" r="3" fill="currentColor"/>
      <line x1="18" y1="31" x2="18" y2="35"/>
      <line x1="30" y1="31" x2="30" y2="41"/>
      <line x1="42" y1="31" x2="42" y2="35"/>
    `,
  },
  {
    id: 'hvac-boiler',
    name: 'Boiler',
    category: 'HVAC',
    tagPrefix: 'B',
    defaultW: 80, defaultH: 80,
    viewBox: '0 0 60 60',
    svg: `
      <ellipse cx="30" cy="34" rx="26" ry="22"/>
      <path d="M22 38 Q24 28 28 34 Q30 26 30 18 Q34 28 36 22 Q40 34 38 38" fill="none"/>
      <line x1="30" y1="12" x2="30" y2="6"/>
      <line x1="4" y1="44" x2="1" y2="44"/>
      <line x1="56" y1="44" x2="59" y2="44"/>
    `,
  },
  {
    id: 'hvac-fcu',
    name: 'Fan Coil Unit',
    category: 'HVAC',
    tagPrefix: 'FCU',
    defaultW: 90, defaultH: 50,
    viewBox: '0 0 60 36',
    svg: `
      <rect x="1" y="1" width="58" height="34" rx="1"/>
      <line x1="22" y1="1" x2="22" y2="35"/>
      <path d="M6 18 Q9 10 12 18 Q15 26 18 18" fill="none"/>
      <circle cx="40" cy="18" r="12"/>
      <line x1="40" y1="6" x2="40" y2="30"/>
      <line x1="28" y1="18" x2="52" y2="18"/>
    `,
  },
  {
    id: 'hvac-damper',
    name: 'Damper',
    category: 'HVAC',
    tagPrefix: 'D',
    defaultW: 60, defaultH: 50,
    viewBox: '0 0 60 40',
    svg: `
      <line x1="8" y1="4" x2="8" y2="36"/>
      <line x1="52" y1="4" x2="52" y2="36"/>
      <line x1="8" y1="28" x2="52" y2="12" stroke-width="2.5"/>
      <circle cx="30" cy="20" r="3" fill="currentColor"/>
    `,
  },
  {
    id: 'hvac-fire-damper',
    name: 'Fire Damper',
    category: 'HVAC',
    tagPrefix: 'FD',
    defaultW: 60, defaultH: 50,
    viewBox: '0 0 60 40',
    svg: `
      <line x1="8" y1="4" x2="8" y2="36"/>
      <line x1="52" y1="4" x2="52" y2="36"/>
      <line x1="8" y1="28" x2="52" y2="12" stroke-width="2"/>
      <circle cx="30" cy="20" r="3" fill="currentColor"/>
      <rect x="24" y="6" width="12" height="28" rx="1"/>
      <line x1="24" y1="6" x2="36" y2="34" stroke-width="1.5"/>
    `,
  },
  {
    id: 'hvac-thermostat',
    name: 'Thermostat',
    category: 'HVAC',
    tagPrefix: 'T',
    defaultW: 50, defaultH: 50,
    viewBox: '0 0 60 60',
    svg: `
      <circle cx="30" cy="30" r="26"/>
      <circle cx="30" cy="30" r="16"/>
      <line x1="30" y1="4" x2="30" y2="10"/>
      <line x1="56" y1="30" x2="50" y2="30"/>
      <line x1="4" y1="30" x2="10" y2="30"/>
      <line x1="30" y1="56" x2="30" y2="50"/>
      <line x1="49" y1="11" x2="44" y2="16"/>
      <line x1="11" y1="11" x2="16" y2="16"/>
    `,
  },
  {
    id: 'hvac-sensor',
    name: 'Sensor (Temp/RH)',
    category: 'HVAC',
    tagPrefix: 'S',
    defaultW: 50, defaultH: 50,
    viewBox: '0 0 60 60',
    svg: `
      <polygon points="30,4 56,30 30,56 4,30"/>
      <circle cx="30" cy="30" r="7"/>
      <line x1="30" y1="4" x2="30" y2="23"/>
      <line x1="56" y1="30" x2="37" y2="30"/>
      <line x1="4" y1="30" x2="23" y2="30"/>
      <line x1="30" y1="56" x2="30" y2="37"/>
    `,
  },
  {
    id: 'hvac-hx',
    name: 'Heat Exchanger',
    category: 'HVAC',
    tagPrefix: 'HX',
    defaultW: 80, defaultH: 60,
    viewBox: '0 0 60 44',
    svg: `
      <rect x="1" y="1" width="58" height="42" rx="1"/>
      <line x1="1" y1="22" x2="59" y2="22"/>
      <path d="M8 12 Q12 6 16 12 Q20 18 24 12 Q28 6 32 12 Q36 18 40 12 Q44 6 48 12 Q52 18 56 12" fill="none"/>
      <path d="M8 32 Q12 38 16 32 Q20 26 24 32 Q28 38 32 32 Q36 26 40 32 Q44 38 48 32 Q52 26 56 32" fill="none"/>
    `,
  },
];

// ─── PIPING ────────────────────────────────────────────────────────────────
const PIPING: MEPSymbol[] = [
  {
    id: 'pip-gate-valve',
    name: 'Gate Valve',
    category: 'PIPING',
    tagPrefix: 'GV',
    defaultW: 50, defaultH: 40,
    viewBox: '0 0 60 40',
    svg: `
      <line x1="0" y1="20" x2="22" y2="20"/>
      <line x1="38" y1="20" x2="60" y2="20"/>
      <polygon points="22,6 38,6 38,34 22,34" fill="none"/>
      <line x1="30" y1="6" x2="30" y2="0"/>
    `,
  },
  {
    id: 'pip-ball-valve',
    name: 'Ball Valve',
    category: 'PIPING',
    tagPrefix: 'BV',
    defaultW: 50, defaultH: 40,
    viewBox: '0 0 60 40',
    svg: `
      <line x1="0" y1="20" x2="18" y2="20"/>
      <line x1="42" y1="20" x2="60" y2="20"/>
      <circle cx="30" cy="20" r="12"/>
      <line x1="30" y1="8" x2="30" y2="2"/>
    `,
  },
  {
    id: 'pip-butterfly-valve',
    name: 'Butterfly Valve',
    category: 'PIPING',
    tagPrefix: 'BFV',
    defaultW: 50, defaultH: 40,
    viewBox: '0 0 60 40',
    svg: `
      <line x1="0" y1="20" x2="60" y2="20"/>
      <ellipse cx="30" cy="20" rx="12" ry="16"/>
      <line x1="30" y1="4" x2="30" y2="0"/>
    `,
  },
  {
    id: 'pip-check-valve',
    name: 'Check Valve',
    category: 'PIPING',
    tagPrefix: 'CV',
    defaultW: 50, defaultH: 40,
    viewBox: '0 0 60 40',
    svg: `
      <line x1="0" y1="20" x2="60" y2="20"/>
      <polygon points="22,8 38,20 22,32" fill="none"/>
      <line x1="38" y1="8" x2="38" y2="32"/>
    `,
  },
  {
    id: 'pip-strainer',
    name: 'Strainer / Y-Strainer',
    category: 'PIPING',
    tagPrefix: 'STR',
    defaultW: 60, defaultH: 50,
    viewBox: '0 0 60 50',
    svg: `
      <line x1="0" y1="20" x2="60" y2="20"/>
      <polygon points="20,8 40,8 40,32 20,32" fill="none"/>
      <line x1="30" y1="32" x2="30" y2="46"/>
      <line x1="22" y1="12" x2="38" y2="28"/>
      <line x1="26" y1="12" x2="38" y2="24"/>
      <line x1="22" y1="16" x2="34" y2="28"/>
    `,
  },
  {
    id: 'pip-prv',
    name: 'Pressure Reducing Valve',
    category: 'PIPING',
    tagPrefix: 'PRV',
    defaultW: 60, defaultH: 50,
    viewBox: '0 0 60 44',
    svg: `
      <line x1="0" y1="22" x2="18" y2="22"/>
      <line x1="42" y1="22" x2="60" y2="22"/>
      <polygon points="18,6 42,6 42,38 18,38" fill="none"/>
      <line x1="30" y1="6" x2="30" y2="1"/>
      <path d="M24 20 Q30 14 36 20" fill="none"/>
    `,
  },
  {
    id: 'pip-exp-tank',
    name: 'Expansion Tank',
    category: 'PIPING',
    tagPrefix: 'ET',
    defaultW: 50, defaultH: 70,
    viewBox: '0 0 40 60',
    svg: `
      <ellipse cx="20" cy="46" rx="16" ry="12"/>
      <line x1="4" y1="46" x2="4" y2="20"/>
      <line x1="36" y1="46" x2="36" y2="20"/>
      <ellipse cx="20" cy="20" rx="16" ry="6"/>
      <line x1="20" y1="58" x2="20" y2="64"/>
      <line x1="14" y1="30" x2="26" y2="30"/>
    `,
  },
  {
    id: 'pip-flow-meter',
    name: 'Flow Meter',
    category: 'PIPING',
    tagPrefix: 'FM',
    defaultW: 60, defaultH: 40,
    viewBox: '0 0 60 40',
    svg: `
      <line x1="0" y1="20" x2="60" y2="20"/>
      <circle cx="30" cy="20" r="16"/>
      <line x1="22" y1="28" x2="38" y2="12"/>
      <polygon points="38,12 32,14 36,18" fill="currentColor"/>
    `,
  },
];

// ─── CONTROLS ──────────────────────────────────────────────────────────────
const CONTROLS: MEPSymbol[] = [
  {
    id: 'ctrl-controller',
    name: 'DDC Controller',
    category: 'CONTROLS',
    tagPrefix: 'CTL',
    defaultW: 70, defaultH: 70,
    viewBox: '0 0 60 60',
    svg: `
      <rect x="8" y="8" width="44" height="44" rx="3"/>
      <line x1="8" y1="20" x2="52" y2="20"/>
      <rect x="14" y="26" width="8" height="6" rx="1"/>
      <rect x="26" y="26" width="8" height="6" rx="1"/>
      <rect x="38" y="26" width="8" height="6" rx="1"/>
      <rect x="14" y="36" width="8" height="6" rx="1"/>
      <rect x="26" y="36" width="8" height="6" rx="1"/>
      <rect x="38" y="36" width="8" height="6" rx="1"/>
    `,
  },
  {
    id: 'ctrl-actuator',
    name: 'Actuator',
    category: 'CONTROLS',
    tagPrefix: 'ACT',
    defaultW: 50, defaultH: 50,
    viewBox: '0 0 60 60',
    svg: `
      <rect x="14" y="4" width="32" height="24" rx="2"/>
      <line x1="30" y1="28" x2="30" y2="40"/>
      <line x1="8" y1="40" x2="52" y2="40"/>
      <line x1="8" y1="40" x2="8" y2="56"/>
      <line x1="52" y1="40" x2="52" y2="56"/>
      <line x1="8" y1="56" x2="52" y2="56"/>
    `,
  },
  {
    id: 'ctrl-relay',
    name: 'Relay / Switch',
    category: 'CONTROLS',
    tagPrefix: 'RY',
    defaultW: 50, defaultH: 40,
    viewBox: '0 0 60 40',
    svg: `
      <circle cx="14" cy="20" r="5"/>
      <circle cx="46" cy="20" r="5"/>
      <line x1="0" y1="20" x2="9" y2="20"/>
      <line x1="51" y1="20" x2="60" y2="20"/>
      <line x1="19" y1="20" x2="41" y2="10"/>
    `,
  },
];

// ─── ELECTRICAL ────────────────────────────────────────────────────────────
const ELECTRICAL: MEPSymbol[] = [
  {
    id: 'elec-panel',
    name: 'Electrical Panel',
    category: 'ELECTRICAL',
    tagPrefix: 'LP',
    defaultW: 60, defaultH: 80,
    viewBox: '0 0 40 60',
    svg: `
      <rect x="4" y="4" width="32" height="52" rx="2"/>
      <rect x="10" y="10" width="20" height="10" rx="1"/>
      <line x1="14" y1="26" x2="26" y2="26"/>
      <line x1="14" y1="32" x2="26" y2="32"/>
      <line x1="14" y1="38" x2="26" y2="38"/>
      <line x1="14" y1="44" x2="26" y2="44"/>
      <circle cx="20" cy="50" r="3"/>
    `,
  },
  {
    id: 'elec-vfd',
    name: 'Variable Frequency Drive',
    category: 'ELECTRICAL',
    tagPrefix: 'VFD',
    defaultW: 70, defaultH: 70,
    viewBox: '0 0 60 60',
    svg: `
      <rect x="4" y="4" width="52" height="52" rx="3"/>
      <path d="M12 42 L12 32 L22 32 L22 22 L32 22 L32 32 L42 32 L42 42" fill="none" stroke-width="2"/>
      <line x1="4" y1="48" x2="56" y2="48"/>
      <line x1="20" y1="48" x2="20" y2="56"/>
      <line x1="30" y1="48" x2="30" y2="56"/>
      <line x1="40" y1="48" x2="40" y2="56"/>
    `,
  },
  {
    id: 'elec-disconnect',
    name: 'Disconnect Switch',
    category: 'ELECTRICAL',
    tagPrefix: 'DS',
    defaultW: 50, defaultH: 60,
    viewBox: '0 0 40 50',
    svg: `
      <rect x="6" y="4" width="28" height="42" rx="2"/>
      <line x1="20" y1="14" x2="20" y2="32"/>
      <line x1="12" y1="14" x2="28" y2="14"/>
      <line x1="12" y1="32" x2="28" y2="32"/>
      <line x1="20" y1="4" x2="20" y2="0"/>
      <line x1="20" y1="46" x2="20" y2="50"/>
    `,
  },
];

// ─── FIRE PROTECTION ───────────────────────────────────────────────────────
const FIRE: MEPSymbol[] = [
  {
    id: 'fire-sprinkler',
    name: 'Sprinkler Head',
    category: 'FIRE',
    tagPrefix: 'SP',
    defaultW: 40, defaultH: 40,
    viewBox: '0 0 40 40',
    svg: `
      <circle cx="20" cy="20" r="6"/>
      <line x1="20" y1="14" x2="20" y2="4"/>
      <line x1="20" y1="26" x2="20" y2="36"/>
      <line x1="14" y1="20" x2="4" y2="20"/>
      <line x1="26" y1="20" x2="36" y2="20"/>
      <line x1="15.8" y1="15.8" x2="8.7" y2="8.7"/>
      <line x1="24.2" y1="24.2" x2="31.3" y2="31.3"/>
      <line x1="24.2" y1="15.8" x2="31.3" y2="8.7"/>
      <line x1="15.8" y1="24.2" x2="8.7" y2="31.3"/>
    `,
  },
  {
    id: 'fire-fdc',
    name: 'Fire Dept Connection',
    category: 'FIRE',
    tagPrefix: 'FDC',
    defaultW: 50, defaultH: 60,
    viewBox: '0 0 40 50',
    svg: `
      <rect x="8" y="4" width="24" height="32" rx="2"/>
      <circle cx="14" cy="14" r="4"/>
      <circle cx="26" cy="14" r="4"/>
      <circle cx="14" cy="26" r="4"/>
      <circle cx="26" cy="26" r="4"/>
      <line x1="20" y1="36" x2="20" y2="46"/>
      <line x1="12" y1="46" x2="28" y2="46"/>
    `,
  },
  {
    id: 'fire-tamper',
    name: 'Tamper Switch',
    category: 'FIRE',
    tagPrefix: 'TS',
    defaultW: 40, defaultH: 40,
    viewBox: '0 0 40 40',
    svg: `
      <rect x="6" y="6" width="28" height="28" rx="2"/>
      <line x1="6" y1="6" x2="34" y2="34"/>
      <line x1="34" y1="6" x2="6" y2="34"/>
    `,
  },
  {
    id: 'fire-flow-switch',
    name: 'Flow Switch',
    category: 'FIRE',
    tagPrefix: 'FS',
    defaultW: 60, defaultH: 40,
    viewBox: '0 0 60 40',
    svg: `
      <line x1="0" y1="20" x2="60" y2="20"/>
      <rect x="18" y="10" width="24" height="20" rx="1"/>
      <line x1="30" y1="10" x2="30" y2="4"/>
      <polygon points="22,20 30,14 38,20" fill="none"/>
    `,
  },
];

// ─── REGISTRY ──────────────────────────────────────────────────────────────
export const ALL_SYMBOLS: MEPSymbol[] = [
  ...HVAC,
  ...PIPING,
  ...CONTROLS,
  ...ELECTRICAL,
  ...FIRE,
];

export const SYMBOL_CATEGORIES: SymbolCategory[] = [
  'HVAC', 'PIPING', 'CONTROLS', 'ELECTRICAL', 'FIRE',
];

export function getSymbol(id: string): MEPSymbol | undefined {
  // Check bundled set first, then localStorage cache from API
  const bundled = ALL_SYMBOLS.find(s => s.id === id);
  if (bundled) return bundled;
  try {
    const cached = localStorage.getItem('designctrl-symbols');
    if (cached) {
      const arr = JSON.parse(cached) as MEPSymbol[];
      return arr.find(s => s.id === id);
    }
  } catch { /* ignore */ }
  return undefined;
}

export function getByCategory(cat: SymbolCategory): MEPSymbol[] {
  return ALL_SYMBOLS.filter(s => s.category === cat);
}

/** Build a full SVG string for a symbol with given stroke color */
export function buildSvgString(symbol: MEPSymbol, color = 'currentColor'): string {
  const [,, w, h] = symbol.viewBox.split(' ').map(Number);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${symbol.viewBox}" width="${w}" height="${h}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${symbol.svg}</svg>`;
}

/** Build a data URL for use with FabricImage.fromURL */
export function symbolDataUrl(symbol: MEPSymbol, color: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildSvgString(symbol, color))}`;
}
