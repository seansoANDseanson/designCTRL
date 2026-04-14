import { useCallback, useEffect, useState } from 'react';
import type { MEPSymbol, SymbolCategory } from '../symbols/index';
import { ALL_SYMBOLS, buildSvgString, symbolDataUrl } from '../symbols/index';
import { getCachedSymbols, fetchAllSymbols } from '../utils/symbolApi';

// Extended category list (includes DUCTWORK from API)
export type ExtendedCategory = SymbolCategory | 'DUCTWORK';

const ALL_CATEGORIES: ExtendedCategory[] = [
  'HVAC', 'PIPING', 'DUCTWORK', 'ELECTRICAL', 'CONTROLS', 'FIRE',
];

const CATEGORY_COLORS: Record<ExtendedCategory, string> = {
  HVAC:       '#00d4ff',
  PIPING:     '#22c55e',
  DUCTWORK:   '#06b6d4',
  CONTROLS:   '#8b5cf6',
  ELECTRICAL: '#f59e0b',
  FIRE:       '#f43f5e',
};

interface SymbolLibrary {
  /** All symbols (merged: bundled + API) */
  symbols: MEPSymbol[];
  /** Ordered category list */
  categories: ExtendedCategory[];
  /** Color per category */
  categoryColor: (cat: ExtendedCategory) => string;
  /** Get symbols for a category */
  byCategory: (cat: ExtendedCategory) => MEPSymbol[];
  /** Look up a single symbol by ID */
  getSymbol: (id: string) => MEPSymbol | undefined;
  /** Re-export helpers so consumers don't need to import symbols/index */
  buildSvg: typeof buildSvgString;
  dataUrl: typeof symbolDataUrl;
  /** Whether the API fetch is still in progress */
  loading: boolean;
}

export function useSymbolLibrary(): SymbolLibrary {
  const [symbols, setSymbols] = useState<MEPSymbol[]>(() => {
    // Start with cached API data if available, else bundled set
    return getCachedSymbols() ?? ALL_SYMBOLS;
  });
  const [loading, setLoading] = useState(false);

  // Fetch from API on mount (background refresh)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAllSymbols()
      .then((apiSymbols) => {
        if (!cancelled && apiSymbols.length > 0) setSymbols(apiSymbols);
      })
      .catch(() => {
        // API unavailable — keep using what we have (cached or bundled)
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const byCategory = useCallback(
    (cat: ExtendedCategory) => symbols.filter(s => s.category === cat),
    [symbols],
  );

  const getSymbol = useCallback(
    (id: string) => symbols.find(s => s.id === id),
    [symbols],
  );

  const categoryColor = useCallback(
    (cat: ExtendedCategory) => CATEGORY_COLORS[cat] ?? '#94a3b8',
    [],
  );

  // Only show categories that actually have symbols
  const categories = ALL_CATEGORIES.filter(cat => symbols.some(s => s.category === cat));

  return {
    symbols,
    categories,
    categoryColor,
    byCategory,
    getSymbol,
    buildSvg: buildSvgString,
    dataUrl: symbolDataUrl,
    loading,
  };
}
