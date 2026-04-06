import { useEffect, useRef } from 'react';
import { Canvas, Line, PencilBrush } from 'fabric';
import { useCanvasStore } from '../stores/useCanvasStore';
import { useDesignStore } from '../stores/useDesignStore';

const GRID_SIZE = 20;

function drawGrid(canvas: Canvas) {
  const width = canvas.getWidth();
  const height = canvas.getHeight();
  for (let i = 0; i <= width / GRID_SIZE; i++) {
    const x = i * GRID_SIZE;
    const line = new Line([x, 0, x, height], { stroke: 'rgba(255,255,255,0.04)', selectable: false, evented: false, excludeFromExport: true });
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }
  for (let j = 0; j <= height / GRID_SIZE; j++) {
    const y = j * GRID_SIZE;
    const line = new Line([0, y, width, y], { stroke: 'rgba(255,255,255,0.04)', selectable: false, evented: false, excludeFromExport: true });
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }
}

export function CenterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCanvas, setZoom } = useCanvasStore();
  const { gridEnabled, setCursorPosition } = useDesignStore();

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
    fabricCanvas.on('mouse:move', (opt) => {
      const pointer = fabricCanvas.getScenePoint(opt.e);
      setCursorPosition({ x: Math.round(pointer.x), y: Math.round(pointer.y) });
    });
    fabricCanvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let zoom = fabricCanvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(zoom, 0.1), 20);
      fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      setZoom(zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
    setCanvas(fabricCanvas);
    const resizeObserver = new ResizeObserver(() => {
      fabricCanvas.setDimensions({ width: container.clientWidth, height: container.clientHeight });
      fabricCanvas.renderAll();
    });
    resizeObserver.observe(container);
    return () => { resizeObserver.disconnect(); fabricCanvas.dispose(); setCanvas(null); };
  }, [gridEnabled, setCanvas, setCursorPosition, setZoom]);

  return (
    <main className="center-canvas" ref={containerRef}>
      <canvas ref={canvasRef} />
    </main>
  );
      }
