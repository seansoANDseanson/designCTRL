import { useState } from 'react';
import { useDesignStore, type Tool } from '../stores/useDesignStore';
import { useSymbolLibrary, type ExtendedCategory } from '../hooks/useSymbolLibrary';
import type { MEPSymbol } from '../symbols/index';

const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: 'select',  label: 'SELECT',  icon: '⮚' },
  { id: 'line',    label: 'LINE',    icon: '╱' },
  { id: 'rect',    label: 'RECT',    icon: '▭' },
  { id: 'circle',  label: 'CIRCLE',  icon: '◯' },
  { id: 'text',    label: 'TEXT',    icon: 'T' },
  { id: 'symbol',  label: 'SYMBOL',  icon: '⬡' },
  { id: 'measure', label: 'MEASURE', icon: '↦' },
  { id: 'pan',     label: 'PAN',     icon: '⬡' },
];

// Inline SVG thumbnail component — renders the symbol using the SVG path data
function SymbolThumb({ symbol, active, buildSvg }: { symbol: MEPSymbol; active: boolean; buildSvg: (s: MEPSymbol, c?: string) => string }) {
  const svgStr = buildSvg(symbol, 'currentColor');
  return (
    <div
      className={`sym-thumb ${active ? 'active' : ''}`}
      title={symbol.name}
      // dangerouslySetInnerHTML is safe here — SVG is authored by us, not user input
      dangerouslySetInnerHTML={{ __html: svgStr }}
    />
  );
}

export function LeftSidebar() {
  const {
    activeTool, setActiveTool,
    activeSymbolId, setActiveSymbolId,
    activeLayerId, setActiveLayerId,
    gridEnabled, toggleGrid,
    snapEnabled, toggleSnap,
    layers,
  } = useDesignStore();

  const lib = useSymbolLibrary();
  const [expandedCats, setExpandedCats] = useState<Set<ExtendedCategory>>(new Set(['HVAC']));
  const [search, setSearch] = useState('');

  const toggleCat = (cat: ExtendedCategory) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const pickSymbol = (symbol: MEPSymbol) => {
    setActiveSymbolId(symbol.id);
    setActiveTool('symbol');
  };

  // Filter symbols by search term
  const matchesSearch = (sym: MEPSymbol) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return sym.name.toLowerCase().includes(q)
      || sym.tagPrefix.toLowerCase().includes(q)
      || sym.id.toLowerCase().includes(q);
  };

  return (
    <aside className="left-sidebar">

      {/* ── DRAWING TOOLS ── */}
      <div className="sidebar-section">
        <div className="section-header">
          <span className="bracket-label">╔ TOOLS ╗</span>
        </div>
        <div className="tool-grid">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              className={`tool-btn ${activeTool === tool.id && (tool.id !== 'symbol' || !activeSymbolId) ? 'active' : ''}`}
              onClick={() => { setActiveTool(tool.id); if (tool.id !== 'symbol') setActiveSymbolId(null); }}
              title={tool.label}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-label">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CANVAS OPTIONS ── */}
      <div className="sidebar-section">
        <div className="section-header">
          <span className="bracket-label">╔ OPTIONS ╗</span>
        </div>
        <div className="option-toggles">
          <button className={`option-btn ${gridEnabled ? 'active' : ''}`} onClick={toggleGrid}>
            GRID {gridEnabled ? 'ON' : 'OFF'}
          </button>
          <button className={`option-btn ${snapEnabled ? 'active' : ''}`} onClick={toggleSnap}>
            SNAP {snapEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* ── ACTIVE LAYER ── */}
      <div className="sidebar-section">
        <div className="section-header">
          <span className="bracket-label">╔ ACTIVE LAYER ╗</span>
        </div>
        <div className="layer-select">
          {layers.map(layer => (
            <button
              key={layer.id}
              className={`layer-select-btn ${activeLayerId === layer.id ? 'active' : ''}`}
              style={{ '--layer-color': layer.color } as React.CSSProperties}
              onClick={() => setActiveLayerId(layer.id)}
              title={`Draw on ${layer.name}`}
            >
              <span className="layer-select-dot" style={{ background: layer.color }} />
              {layer.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── SYMBOL LIBRARY ── */}
      <div className="sidebar-section sidebar-section--symbols">
        <div className="section-header">
          <span className="bracket-label">╔ SYMBOLS ╗</span>
          <span className="sym-total-badge">{lib.symbols.length}</span>
        </div>

        <input
          className="sym-search"
          type="text"
          placeholder="Search symbols..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {lib.loading && <p className="sym-loading">Syncing library...</p>}

        {lib.categories.map(cat => {
          const allInCat = lib.byCategory(cat);
          const filtered = allInCat.filter(matchesSearch);
          if (search && filtered.length === 0) return null;
          const expanded = expandedCats.has(cat) || !!search;
          const color = lib.categoryColor(cat);

          return (
            <div key={cat} className="sym-category">
              <button
                className="sym-cat-header"
                style={{ '--cat-color': color } as React.CSSProperties}
                onClick={() => toggleCat(cat)}
              >
                <span className="sym-cat-arrow">{expanded ? '▾' : '▸'}</span>
                <span className="sym-cat-name" style={{ color }}>{cat}</span>
                <span className="sym-cat-count">{search ? `${filtered.length}/${allInCat.length}` : allInCat.length}</span>
              </button>

              {expanded && (
                <div className="sym-grid">
                  {(search ? filtered : allInCat).map(sym => (
                    <button
                      key={sym.id}
                      className={`sym-item ${activeSymbolId === sym.id && activeTool === 'symbol' ? 'active' : ''}`}
                      onClick={() => pickSymbol(sym)}
                      title={sym.name}
                    >
                      <SymbolThumb symbol={sym} active={activeSymbolId === sym.id && activeTool === 'symbol'} buildSvg={lib.buildSvg} />
                      <span className="sym-item-label">{sym.tagPrefix}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </aside>
  );
}
