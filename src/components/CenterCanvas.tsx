import { useEffect, useRef } from 'react';
import { Canvas, Line, PencilBrush } from 'fabric';
import { useCanvasStore } from '../stores/useCanvasStore';
import { useDesignStore } from '../stores/useDesignStore';
import { useCanvasTools } from '../hooks/useCanvasTools';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useLayerSync } from '../hooks/useLayerSync';

const GRID_SIZE = 20;

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
  const gridLines = canvas.getObjects().filter(obj => (obj as any).excludeFromExport);
  gridLines.forEach(obj => canvas.remove(obj));
}

export function CenterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCanvas, setZoom, saveHistory, historyVersion } = useCanvasStore();
  const { gridEnabled, setCursorPosition } = useDesignStore();

  // Activate tool behaviors and keyboard shortcuts
  useCanvasTools();
  useKeyboardShortcuts();
  useLayerSync();

  // --- Canvas initialization ---
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
        (fabricCanvas as any)._lastPanX = opt.e.clientX;
        (fabricCanvas as any)._lastPanY = opt.e.clientY;
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

    // Capture initial empty state in history
    useCanvasStore.getState().saveHistory();

    const ro = new ResizeObserver(() => {
      fabricCanvas.setDimensions({
        width: container.clientWidth,
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
    // gridEnabled intentionally excluded — handled by the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Grid redraw when toggled or after undo/redo ---
  useEffect(() => {
    const canvas = useCanvasStore.getState().canvas;
    if (!canvas) return;
    clearGrid(canvas);
    if (gridEnabled) drawGrid(canvas);
    canvas.renderAll();
  }, [gridEnabled, historyVersion]);

  return (
    <main className="center-canvas" ref={containerRef}>
      <canvas ref={canvasRef} />
    </main>
  );
}
