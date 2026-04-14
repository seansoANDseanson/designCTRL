import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, Line, PencilBrush } from 'fabric';
import { useCanvasStore } from '../stores/useCanvasStore';
import { useDesignStore } from '../stores/useDesignStore';
import { useSheetStore } from '../stores/useSheetStore';
import { useCanvasTools } from '../hooks/useCanvasTools';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useLayerSync } from '../hooks/useLayerSync';

const GRID_SIZE = 20;
const CANVAS_CUSTOM_PROPS = [
  'layerId', 'symbolId', 'tagPrefix', 'tag', 'uid',
  'equipDesc', 'equipMfr', 'equipModel', 'equipSpecs', 'equipNotes',
];

function drawGrid(canvas: Canvas) {
  const w = canvas.getWidth();
  const h = canvas.getHeight();
  for (let i = 0; i <= w / GRID_SIZE; i++) {
    const x = i * GRID_SIZE;
    const line = new Line([x, 0, x, h], {
      stroke: 'rgba(255,255,255,0.04)', strokeWidth: 1,
      selectable: false, evented: false, excludeFromExport: true,
    });
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }
  for (let j = 0; j <= h / GRID_SIZE; j++) {
    const y = j * GRID_SIZE;
    const line = new Line([0, y, w, y], {
      stroke: 'rgba(255,255,255,0.04)', strokeWidth: 1,
      selectable: false, evented: false, excludeFromExport: true,
    });
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }
}

function clearGrid(canvas: Canvas) {
  canvas.getObjects().filter(o => (o as any).excludeFromExport).forEach(o => canvas.remove(o));
}

// ─── Sheet tab bar ─────────────────────────────────────────────────────────
interface SheetTabBarProps {
  onSwitchSheet: (id: string) => void;
}

function SheetTabBar({ onSwitchSheet }: SheetTabBarProps) {
  const { sheets, activeSheetId, addSheet, removeSheet, renameSheet } = useSheetStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue]  = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitRename = () => {
    if (editingId && editValue.trim()) renameSheet(editingId, editValue.trim());
    setEditingId(null);
  };

  return (
    <div className="sheet-tab-bar">
      {sheets.map((sheet) => (
        <div
          key={sheet.id}
          className={`sheet-tab ${sheet.id === activeSheetId ? 'active' : ''}`}
          onClick={() => sheet.id !== activeSheetId && onSwitchSheet(sheet.id)}
          onDoubleClick={() => startRename(sheet.id, sheet.name)}
          title="Double-click to rename"
        >
          {editingId === sheet.id ? (
            <input
              ref={inputRef}
              className="sheet-tab-input"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null); }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="sheet-tab-name">{sheet.name}</span>
          )}
          {sheets.length > 1 && (
            <button
              className="sheet-tab-close"
              onClick={e => { e.stopPropagation(); removeSheet(sheet.id); }}
              title="Remove sheet"
            >×</button>
          )}
        </div>
      ))}
      <button className="sheet-tab-add" onClick={addSheet} title="Add sheet">+</button>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export function CenterCanvas() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCanvas, setZoom, saveHistory, historyVersion } = useCanvasStore();
  const { gridEnabled, setCursorPosition } = useDesignStore();
  const { sheets, activeSheetId, saveSheetJson, setActiveSheet } = useSheetStore();

  // Activate tool behaviors and keyboard shortcuts
  useCanvasTools();
  useKeyboardShortcuts();
  useLayerSync();

  // Stable save-current-sheet helper
  const persistCurrentSheet = useCallback(() => {
    const canvas = useCanvasStore.getState().canvas;
    const curId  = useSheetStore.getState().activeSheetId;
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON(CANVAS_CUSTOM_PROPS));
    saveSheetJson(curId, json);
  }, [saveSheetJson]);

  // Switch to a different sheet: save current → load target
  const switchSheet = useCallback((targetId: string) => {
    const canvas = useCanvasStore.getState().canvas;
    if (!canvas) return;
    persistCurrentSheet();
    setActiveSheet(targetId);
  }, [persistCurrentSheet, setActiveSheet]);

  // ── Canvas initialization ─────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const container = containerRef.current;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: '#0a0e14',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);

    if (gridEnabled) drawGrid(fabricCanvas);

    // Cursor tracking
    fabricCanvas.on('mouse:move', (opt) => {
      const pointer = fabricCanvas.getScenePoint(opt.e);
      setCursorPosition({ x: Math.round(pointer.x), y: Math.round(pointer.y) });
    });

    // Scroll-wheel zoom
    fabricCanvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let zoom = fabricCanvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(zoom, 0.05), 20);
      fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      setZoom(zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Middle-mouse pan
    fabricCanvas.on('mouse:down', (opt) => {
      if (opt.e.button === 1) {
        (fabricCanvas as any)._isPanning = true;
        (fabricCanvas as any)._lastPanX  = opt.e.clientX;
        (fabricCanvas as any)._lastPanY  = opt.e.clientY;
        fabricCanvas.setCursor('grabbing');
        opt.e.preventDefault();
      }
    });
    fabricCanvas.on('mouse:move', (opt) => {
      if ((fabricCanvas as any)._isPanning) {
        const vpt = fabricCanvas.viewportTransform as number[];
        vpt[4] += opt.e.clientX - (fabricCanvas as any)._lastPanX;
        vpt[5] += opt.e.clientY - (fabricCanvas as any)._lastPanY;
        (fabricCanvas as any)._lastPanX = opt.e.clientX;
        (fabricCanvas as any)._lastPanY = opt.e.clientY;
        fabricCanvas.requestRenderAll();
      }
    });
    fabricCanvas.on('mouse:up', (opt) => {
      if (opt.e.button === 1) {
        (fabricCanvas as any)._isPanning = false;
        fabricCanvas.setCursor(fabricCanvas.defaultCursor);
      }
    });

    setCanvas(fabricCanvas);
    useCanvasStore.getState().saveHistory();

    const ro = new ResizeObserver(() => {
      fabricCanvas.setDimensions({
        width:  container.clientWidth,
        height: container.clientHeight,
      });
      fabricCanvas.renderAll();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      fabricCanvas.dispose();
      setCanvas(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Grid redraw when toggled or after undo/redo ───────────────────────
  useEffect(() => {
    const canvas = useCanvasStore.getState().canvas;
    if (!canvas) return;
    clearGrid(canvas);
    if (gridEnabled) drawGrid(canvas);
    canvas.renderAll();
  }, [gridEnabled, historyVersion]);

  // ── Load sheet when activeSheetId changes ─────────────────────────────
  useEffect(() => {
    const canvas = useCanvasStore.getState().canvas;
    if (!canvas) return;
    const sheet = sheets.find(s => s.id === activeSheetId);
    if (!sheet) return;

    if (sheet.canvasJson) {
      canvas.loadFromJSON(JSON.parse(sheet.canvasJson)).then(() => {
        clearGrid(canvas);
        if (gridEnabled) drawGrid(canvas);
        canvas.renderAll();
        useCanvasStore.getState().saveHistory();
      });
    } else {
      // New blank sheet — clear everything except grid
      clearGrid(canvas);
      canvas.getObjects().forEach(o => canvas.remove(o));
      if (gridEnabled) drawGrid(canvas);
      canvas.renderAll();
      useCanvasStore.getState().saveHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheetId]);

  return (
    <main className="center-canvas">
      <div className="canvas-area" ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>
      <SheetTabBar onSwitchSheet={switchSheet} />
    </main>
  );
}
