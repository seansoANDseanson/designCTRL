import type { MEPSymbol, SymbolCategory } from '../symbols/index';

// ─── API response shape (D1 column names) ──────────────────────────────────
interface ApiSymbol {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  tag_prefix: string;
  default_w: number;
  default_h: number;
  view_box: string;
  svg: string;
  keywords: string | null;
}

// ─── Map API row → frontend MEPSymbol ──────────────────────────────────────
function toMEPSymbol(row: ApiSymbol): MEPSymbol {
  return {
    id:        row.id,
    name:      row.name,
    category:  row.category as SymbolCategory,
    tagPrefix: row.tag_prefix,
    defaultW:  row.default_w,
    defaultH:  row.default_h,
    viewBox:   row.view_box,
    svg:       row.svg,
  };
}

// ─── Cache keys ────────────────────────────────────────────────────────────
const CACHE_KEY  = 'designctrl-symbols';
const CACHE_TS   = 'designctrl-symbols-ts';
const CACHE_TTL  = 24 * 60 * 60 * 1000; // 24 hours

// ─── Read from localStorage cache ──────────────────────────────────────────
export function getCachedSymbols(): MEPSymbol[] | null {
  try {
    const ts   = localStorage.getItem(CACHE_TS);
    const data = localStorage.getItem(CACHE_KEY);
    if (!ts || !data) return null;
    if (Date.now() - Number(ts) > CACHE_TTL) return null;
    return JSON.parse(data) as MEPSymbol[];
  } catch {
    return null;
  }
}

// ─── Write to localStorage cache ───────────────────────────────────────────
function setCachedSymbols(symbols: MEPSymbol[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(symbols));
    localStorage.setItem(CACHE_TS, String(Date.now()));
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

// ─── Fetch all symbols from the API ────────────────────────────────────────
export async function fetchAllSymbols(): Promise<MEPSymbol[]> {
  const res = await fetch('/api/symbols');
  if (!res.ok) throw new Error(`Symbol API ${res.status}`);
  const json = await res.json() as { symbols: ApiSymbol[]; count: number };
  const symbols = json.symbols.map(toMEPSymbol);
  setCachedSymbols(symbols);
  return symbols;
}

// ─── Fetch symbols by category ─────────────────────────────────────────────
export async function fetchByCategory(category: string): Promise<MEPSymbol[]> {
  const res = await fetch(`/api/symbols?category=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error(`Symbol API ${res.status}`);
  const json = await res.json() as { symbols: ApiSymbol[]; count: number };
  return json.symbols.map(toMEPSymbol);
}

// ─── Search symbols ────────────────────────────────────────────────────────
export async function searchSymbols(query: string): Promise<MEPSymbol[]> {
  const res = await fetch(`/api/symbols?search=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Symbol API ${res.status}`);
  const json = await res.json() as { symbols: ApiSymbol[]; count: number };
  return json.symbols.map(toMEPSymbol);
}
