import { useEffect, useRef } from 'react';
import { Line, Rect, Ellipse, IText } from 'fabric';
import { useCanvasStore } from '../stores/useCanvasStore';
import { useDesignStore, type AccentColor } from '../stores/useDesignStore';

const GRID_SIZE = 20;

const ACCENT_HEX: Record<AccentColor, string> = {
  cyan: '#00d4ff',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  green: '#22c55e',
  rose: '#f43f5e',
  amber: '#f59e0b',
  steel: '#94a3b8',
};

function snap(val: number, enabled: boolean): number {
  if (!enabled) return val;
  return Math.round(val / GRID_SIZE) * GRID_SIZE;
}

function snapPt(pt: { x: number; y: number }, enabled: boolean) {
  return { x: snap(pt.x, enabled), y: snap(pt.y, enabled) };
}

// Shared drawing state lives in a ref so it persists across renders
// without causing re-renders and without stale closure issues
interface DrawState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  preview: any; // Fabric object used as live preview
}

export function useCanvasTools() {
  const canvas = useCanvasStore(s => s.canvas);
  const saveHistory = useCanvasStore(s => s.saveHistory);
  const historyVersion = useCanvasStore(s => s.historyVersion);
  const { activeTool, snapEnabled, accentColor, setSelectedObjectIds } = useDesignStore();

  const ds = useRef<DrawState>({ isDrawing: false, startX: 0, startY: 0, preview: null });

  useEffect(() => {
    if (!canvas) return;

    const st = ds.current;
    const accent = ACCENT_HEX[accentColor];

    // --- Clean up any in-progress drawing when tool changes ---
    st.isDrawing = false;
    if (st.preview) {
      canvas.remove(st.preview);
      st.preview = null;
    }
    canvas.renderAll();

    // --- Set canvas-level mode ---
    const isSelect = activeTool === 'select';
    canvas.isDrawingMode = false;
    canvas.selection = isSelect;

    // Make all user objects selectable only in select mode
    canvas.getObjects().forEach(obj => {
      if ((obj as any).excludeFromExport) return; // grid lines — leave alone
      obj.selectable = isSelect;
      obj.evented = isSelect;
    });

    const cursors: Record<string, string> = {
      select: 'default', pan: 'grab', line: 'crosshair',
      rect: 'crosshair', circle: 'crosshair', text: 'text',
      measure: 'crosshair', symbol: 'crosshair',
    };
    canvas.defaultCursor = cursors[activeTool] ?? 'default';

    // ── SELECT ────────────────────────────────────────────────
    if (activeTool === 'select') {
      const onSelChange = () => {
        const objs = canvas.getActiveObjects();
        setSelectedObjectIds(objs.map((_, i) => String(i)));
      };
      const onCleared = () => setSelectedObjectIds([]);
      canvas.on('selection:created', onSelChange);
      canvas.on('selection:updated', onSelChange);
      canvas.on('selection:cleared', onCleared);
      return () => {
        canvas.off('selection:created', onSelChange);
        canvas.off('selection:updated', onSelChange);
        canvas.off('selection:cleared', onCleared);
      };
    }

    // ── PAN ───────────────────────────────────────────────────
    if (activeTool === 'pan') {
      let lastX = 0, lastY = 0;
      const onDown = (opt: any) => {
        st.isDrawing = true;
        lastX = opt.e.clientX;
        lastY = opt.e.clientY;
        canvas.setCursor('grabbing');
      };
      const onMove = (opt: any) => {
        if (!st.isDrawing) return;
        const vpt = canvas.viewportTransform as number[];
        vpt[4] += opt.e.clientX - lastX;
        vpt[5] += opt.e.clientY - lastY;
        lastX = opt.e.clientX;
        lastY = opt.e.clientY;
        canvas.requestRenderAll();
      };
      const onUp = () => { st.isDrawing = false; canvas.setCursor('grab'); };
      canvas.on('mouse:down', onDown);
      canvas.on('mouse:move', onMove);
      canvas.on('mouse:up', onUp);
      return () => {
        canvas.off('mouse:down', onDown);
        canvas.off('mouse:move', onMove);
        canvas.off('mouse:up', onUp);
      };
    }

    // ── LINE ──────────────────────────────────────────────────
    if (activeTool === 'line') {
      const onDown = (opt: any) => {
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        st.isDrawing = true;
        st.startX = pt.x; st.startY = pt.y;
        st.preview = new Line([pt.x, pt.y, pt.x, pt.y], {
          stroke: accent + '99', strokeWidth: 1.5,
          selectable: false, evented: false,
        });
        canvas.add(st.preview);
      };
      const onMove = (opt: any) => {
        if (!st.isDrawing || !st.preview) return;
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        st.preview.set({ x2: pt.x, y2: pt.y });
        canvas.renderAll();
      };
      const onUp = (opt: any) => {
        if (!st.isDrawing) return;
        st.isDrawing = false;
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        canvas.remove(st.preview); st.preview = null;
        const dx = pt.x - st.startX, dy = pt.y - st.startY;
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
        const line = new Line([st.startX, st.startY, pt.x, pt.y], {
          stroke: accent, strokeWidth: 1.5, selectable: true, evented: true,
        });
        canvas.add(line);
        saveHistory();
        // Re-apply non-selectable since we're still in line mode
        line.selectable = false; line.evented = false;
        canvas.renderAll();
      };
      canvas.on('mouse:down', onDown);
      canvas.on('mouse:move', onMove);
      canvas.on('mouse:up', onUp);
      return () => {
        canvas.off('mouse:down', onDown);
        canvas.off('mouse:move', onMove);
        canvas.off('mouse:up', onUp);
      };
    }

    // ── RECT ──────────────────────────────────────────────────
    if (activeTool === 'rect') {
      const onDown = (opt: any) => {
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        st.isDrawing = true;
        st.startX = pt.x; st.startY = pt.y;
        st.preview = new Rect({
          left: pt.x, top: pt.y, width: 0, height: 0,
          fill: 'transparent', stroke: accent + '99', strokeWidth: 1.5,
          selectable: false, evented: false,
        });
        canvas.add(st.preview);
      };
      const onMove = (opt: any) => {
        if (!st.isDrawing || !st.preview) return;
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        const w = pt.x - st.startX, h = pt.y - st.startY;
        st.preview.set({
          left: w < 0 ? pt.x : st.startX,
          top: h < 0 ? pt.y : st.startY,
          width: Math.abs(w), height: Math.abs(h),
        });
        canvas.renderAll();
      };
      const onUp = (opt: any) => {
        if (!st.isDrawing) return;
        st.isDrawing = false;
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        canvas.remove(st.preview); st.preview = null;
        const w = pt.x - st.startX, h = pt.y - st.startY;
        if (Math.abs(w) < 3 && Math.abs(h) < 3) return;
        const rect = new Rect({
          left: w < 0 ? pt.x : st.startX,
          top: h < 0 ? pt.y : st.startY,
          width: Math.abs(w), height: Math.abs(h),
          fill: 'transparent', stroke: accent, strokeWidth: 1.5,
          selectable: true, evented: true,
        });
        canvas.add(rect);
        saveHistory();
        rect.selectable = false; rect.evented = false;
        canvas.renderAll();
      };
      canvas.on('mouse:down', onDown);
      canvas.on('mouse:move', onMove);
      canvas.on('mouse:up', onUp);
      return () => {
        canvas.off('mouse:down', onDown);
        canvas.off('mouse:move', onMove);
        canvas.off('mouse:up', onUp);
      };
    }

    // ── CIRCLE (Ellipse) ──────────────────────────────────────
    if (activeTool === 'circle') {
      const onDown = (opt: any) => {
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        st.isDrawing = true;
        st.startX = pt.x; st.startY = pt.y;
        st.preview = new Ellipse({
          left: pt.x, top: pt.y, rx: 0, ry: 0,
          fill: 'transparent', stroke: accent + '99', strokeWidth: 1.5,
          selectable: false, evented: false,
        });
        canvas.add(st.preview);
      };
      const onMove = (opt: any) => {
        if (!st.isDrawing || !st.preview) return;
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        const w = pt.x - st.startX, h = pt.y - st.startY;
        st.preview.set({
          left: w < 0 ? pt.x : st.startX,
          top: h < 0 ? pt.y : st.startY,
          rx: Math.abs(w) / 2, ry: Math.abs(h) / 2,
        });
        canvas.renderAll();
      };
      const onUp = (opt: any) => {
        if (!st.isDrawing) return;
        st.isDrawing = false;
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        canvas.remove(st.preview); st.preview = null;
        const w = pt.x - st.startX, h = pt.y - st.startY;
        if (Math.abs(w) < 3 && Math.abs(h) < 3) return;
        const ellipse = new Ellipse({
          left: w < 0 ? pt.x : st.startX,
          top: h < 0 ? pt.y : st.startY,
          rx: Math.abs(w) / 2, ry: Math.abs(h) / 2,
          fill: 'transparent', stroke: accent, strokeWidth: 1.5,
          selectable: true, evented: true,
        });
        canvas.add(ellipse);
        saveHistory();
        ellipse.selectable = false; ellipse.evented = false;
        canvas.renderAll();
      };
      canvas.on('mouse:down', onDown);
      canvas.on('mouse:move', onMove);
      canvas.on('mouse:up', onUp);
      return () => {
        canvas.off('mouse:down', onDown);
        canvas.off('mouse:move', onMove);
        canvas.off('mouse:up', onUp);
      };
    }

    // ── TEXT ──────────────────────────────────────────────────
    if (activeTool === 'text') {
      const onDown = (opt: any) => {
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        const text = new IText('Text', {
          left: pt.x, top: pt.y,
          fontSize: 14, fill: accent,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          selectable: true, evented: true,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
        saveHistory();
        canvas.renderAll();
      };
      canvas.on('mouse:down', onDown);
      return () => { canvas.off('mouse:down', onDown); };
    }

    // ── MEASURE ───────────────────────────────────────────────
    if (activeTool === 'measure') {
      const onDown = (opt: any) => {
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        st.isDrawing = true;
        st.startX = pt.x; st.startY = pt.y;
        st.preview = new Line([pt.x, pt.y, pt.x, pt.y], {
          stroke: '#f59e0b99', strokeWidth: 1.5,
          strokeDashArray: [5, 5],
          selectable: false, evented: false,
        });
        canvas.add(st.preview);
      };
      const onMove = (opt: any) => {
        if (!st.isDrawing || !st.preview) return;
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        st.preview.set({ x2: pt.x, y2: pt.y });
        canvas.renderAll();
      };
      const onUp = (opt: any) => {
        if (!st.isDrawing) return;
        st.isDrawing = false;
        const pt = snapPt(canvas.getScenePoint(opt.e), snapEnabled);
        canvas.remove(st.preview); st.preview = null;
        const dx = pt.x - st.startX, dy = pt.y - st.startY;
        const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
        if (dist < 3) return;
        const dimLine = new Line([st.startX, st.startY, pt.x, pt.y], {
          stroke: '#f59e0b', strokeWidth: 1.5,
          strokeDashArray: [5, 5], selectable: true, evented: true,
        });
        const label = new IText(`${dist}`, {
          left: (st.startX + pt.x) / 2 + 4,
          top: (st.startY + pt.y) / 2 - 14,
          fontSize: 11, fill: '#f59e0b',
          fontFamily: "'JetBrains Mono', monospace",
          selectable: true, evented: true,
        });
        canvas.add(dimLine);
        canvas.add(label);
        saveHistory();
        dimLine.selectable = false; dimLine.evented = false;
        label.selectable = false; label.evented = false;
        canvas.renderAll();
      };
      canvas.on('mouse:down', onDown);
      canvas.on('mouse:move', onMove);
      canvas.on('mouse:up', onUp);
      return () => {
        canvas.off('mouse:down', onDown);
        canvas.off('mouse:move', onMove);
        canvas.off('mouse:up', onUp);
      };
    }

    // ── SYMBOL (Phase 2 placeholder) ──────────────────────────
    // No handlers yet — symbol picker will open here in Phase 2

  // historyVersion in deps so selectability is re-applied after undo/redo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, activeTool, snapEnabled, accentColor, historyVersion]);
}
