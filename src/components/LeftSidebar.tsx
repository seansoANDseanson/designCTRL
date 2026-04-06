import { useDesignStore, type Tool } from '../stores/useDesignStore';

const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: 'select', label: 'SELECT', icon: '\u2B9A' },
  { id: 'line', label: 'LINE', icon: '\u2571' },
  { id: 'rect', label: 'RECT', icon: '\u25A1' },
  { id: 'circle', label: 'CIRCLE', icon: '\u25CB' },
  { id: 'text', label: 'TEXT', icon: 'T' },
  { id: 'symbol', label: 'SYMBOL', icon: '\u2B23' },
  { id: 'measure', label: 'MEASURE', icon: '\u21A6' },
  { id: 'pan', label: 'PAN', icon: '\u2B62' },
];

export function LeftSidebar() {
  const { activeTool, setActiveTool, gridEnabled, toggleGrid, snapEnabled, toggleSnap } = useDesignStore();

  return (
    <aside className="left-sidebar">
      <div className="sidebar-section">
        <div className="section-header">
          <span className="bracket-label">\u2554 TOOLS \u2557</span>
        </div>
        <div className="tool-grid">
          {TOOLS.map((tool) => (
            <button key={tool.id} className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`} onClick={() => setActiveTool(tool.id)} title={tool.label}>
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-label">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="sidebar-section">
        <div className="section-header">
          <span className="bracket-label">\u2554 OPTIONS \u2557</span>
        </div>
        <div className="option-toggles">
          <button className={`option-btn ${gridEnabled ? 'active' : ''}`} onClick={toggleGrid}>GRID {gridEnabled ? 'ON' : 'OFF'}</button>
          <button className={`option-btn ${snapEnabled ? 'active' : ''}`} onClick={toggleSnap}>SNAP {snapEnabled ? 'ON' : 'OFF'}</button>
        </div>
      </div>
      <div className="sidebar-section">
        <div className="section-header">
          <span className="bracket-label">\u2554 SYMBOLS \u2557</span>
        </div>
        <div className="symbol-library">
          <div className="symbol-category">HVAC</div>
          <div className="symbol-category">PIPING</div>
          <div className="symbol-category">ELECTRICAL</div>
          <div className="symbol-category">CONTROLS</div>
          <div className="symbol-category">FIRE PROT.</div>
        </div>
      </div>
    </aside>
  );
          }
