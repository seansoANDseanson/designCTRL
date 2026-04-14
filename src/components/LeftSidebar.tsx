import { useState } from 'react';
import { useDesignStore, type Tool } from '../stores/useDesignStore';
import {
  SYMBOL_CATEGORIES,
  getByCategory,
  buildSvgString,
  type SymbolCategory,
  type MEPSymbol,
} from '../symbols/index';

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

const CATEGORY_COLORS: Record<SymbolCategory, string> = {
  HVAC:       '#00d4ff',
  PIPING:     '#22c55e',
  CONTROLS:   '#8b5cf6',
  ELECTRICAL: '#f59e0b',
  FIRE:       '#f43f5e',
};

// Inline SVG thumbnail component — renders the symbol using the SVG path data
function SymbolThumb({ symbol, active }: { symbol: MEPSymbol; active: boolean }) {
  const svgStr = buildSvgString(symbol, 'currentColor');
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

  const [expandedCats, setExpandedCats] = useState<Set<SymbolCategory>>(new Set(['HVAC']));

  const toggleCat = (cat: SymbolCategory) => {
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
        </div>

        {SYMBOL_CATEGORIES.map(cat => {
          const symbols = getByCategory(cat);
          const expanded = expandedCats.has(cat);
          const color = CATEGORY_COLORS[cat];

          return (
            <div key={cat} className="sym-category">
              <button
                className="sym-cat-header"
                style={{ '--cat-color': color } as React.CSSProperties}
                onClick={() => toggleCat(cat)}
              >
                <span className="sym-cat-arrow">{expanded ? '▾' : '▸'}</span>
                <span className="sym-cat-name" style={{ color }}>{cat}</span>
                <span className="sym-cat-count">{symbols.length}</span>
              </button>

              {expanded && (
                <div className="sym-grid">
                  {symbols.map(sym => (
                    <button
                      key={sym.id}
                      className={`sym-item ${activeSymbolId === sym.id && activeTool === 'symbol' ? 'active' : ''}`}
                      onClick={() => pickSymbol(sym)}
                      title={sym.name}
                    >
                      <SymbolThumb symbol={sym} active={activeSymbolId === sym.id && activeTool === 'symbol'} />
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
