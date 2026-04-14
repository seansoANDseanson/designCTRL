import { useState } from 'react';
import { useDesignStore, type AccentColor } from '../stores/useDesignStore';
import { useCanvasStore } from '../stores/useCanvasStore';
import { useSheetStore } from '../stores/useSheetStore';
import { TitleBlockModal } from './TitleBlockModal';
import { exportSheetPDF, PAGE_SIZES, type PageSizeName } from '../utils/pdfExport';

const ACCENT_SWATCHES: { id: AccentColor; hex: string; label: string }[] = [
  { id: 'cyan',   hex: '#00d4ff', label: 'Cyan'   },
  { id: 'indigo', hex: '#6366f1', label: 'Indigo' },
  { id: 'violet', hex: '#8b5cf6', label: 'Violet' },
  { id: 'green',  hex: '#22c55e', label: 'Green'  },
  { id: 'rose',   hex: '#f43f5e', label: 'Rose'   },
  { id: 'amber',  hex: '#f59e0b', label: 'Amber'  },
  { id: 'steel',  hex: '#94a3b8', label: 'Steel'  },
];

const PAGE_SIZE_KEYS = Object.keys(PAGE_SIZES) as PageSizeName[];

export function HeaderBar() {
  const { accentColor, setAccentColor, appearanceMode, setAppearanceMode } = useDesignStore();
  const { historyIndex, history, undo, redo } = useCanvasStore();
  const { sheets, activeSheetId, titleBlock } = useSheetStore();
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const [tbOpen,      setTbOpen]      = useState(false);
  const [pageSize,    setPageSize]    = useState<PageSizeName>('ANSI B (11×17)');
  const [exporting,   setExporting]   = useState(false);

  const handleExportPDF = async () => {
    const canvas = useCanvasStore.getState().canvas;
    if (!canvas) return;
    const sheet = sheets.find(s => s.id === activeSheetId);
    if (!sheet) return;
    const idx = sheets.findIndex(s => s.id === activeSheetId);
    setExporting(true);
    try {
      await exportSheetPDF(canvas, sheet, idx, sheets.length, titleBlock, pageSize);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <header className="header-bar">
        <div className="header-left">
          <div className="header-logo">
            <span className="logo-bracket">[</span>
            <span className="logo-text">designCTRL</span>
            <span className="logo-bracket">]</span>
          </div>
          <nav className="header-nav">
            <button className="nav-btn active">DESIGN</button>
            <button className="nav-btn">SCHEDULE</button>
            <button className="nav-btn">SUBMITTAL</button>
            <button className="nav-btn">COMMISSION</button>
          </nav>
        </div>

        <div className="header-center">
          <span
            className="project-name"
            title="Click to edit title block"
            onClick={() => setTbOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            {titleBlock.projectName || 'UNTITLED PROJECT'}
          </span>
        </div>

        <div className="header-right">
          {/* Title block edit */}
          <button
            className="header-action-btn"
            onClick={() => setTbOpen(true)}
            title="Edit title block"
          >
            TB
          </button>

          {/* PDF export */}
          <div className="export-group">
            <select
              className="page-size-select"
              value={pageSize}
              onChange={e => setPageSize(e.target.value as PageSizeName)}
              title="Page size"
            >
              {PAGE_SIZE_KEYS.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <button
              className={`header-action-btn export-btn ${exporting ? 'exporting' : ''}`}
              onClick={handleExportPDF}
              disabled={exporting}
              title="Export current sheet as PDF"
            >
              {exporting ? '…' : 'PDF ↓'}
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="undo-redo">
            <button className="undo-btn" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">&#x21A9;</button>
            <button className="undo-btn" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">&#x21AA;</button>
          </div>

          {/* Accent color picker */}
          <div className="accent-picker" title="Accent color">
            {ACCENT_SWATCHES.map(sw => (
              <button
                key={sw.id}
                className={`accent-swatch ${accentColor === sw.id ? 'active' : ''}`}
                style={{ background: sw.hex }}
                onClick={() => setAccentColor(sw.id)}
                title={sw.label}
              />
            ))}
          </div>

          {/* Appearance mode */}
          <div className="mode-switcher">
            <button className={`mode-btn ${appearanceMode === 'classic'       ? 'active' : ''}`} onClick={() => setAppearanceMode('classic')}       title="Classic Depth">CLS</button>
            <button className={`mode-btn ${appearanceMode === 'glassmorphism' ? 'active' : ''}`} onClick={() => setAppearanceMode('glassmorphism')} title="Glassmorphism Depth">GLS</button>
            <button className={`mode-btn ${appearanceMode === 'cyberpunk'     ? 'active' : ''}`} onClick={() => setAppearanceMode('cyberpunk')}     title="Neon Cyberpunk">NEO</button>
          </div>
        </div>
      </header>

      <TitleBlockModal open={tbOpen} onClose={() => setTbOpen(false)} />
    </>
  );
}
