import { useDesignStore } from '../stores/useDesignStore';
import { useCanvasStore } from '../stores/useCanvasStore';

export function StatusBar() {
  const { activeTool, cursorPosition, gridEnabled, snapEnabled } = useDesignStore();
  const { zoom } = useCanvasStore();

  return (
    <footer className="status-bar">
      <div className="status-left">
        <span className="status-item">TOOL: <strong>{activeTool.toUpperCase()}</strong></span>
        <span className="status-divider">|</span>
        <span className="status-item">X: <strong>{cursorPosition.x}</strong> Y: <strong>{cursorPosition.y}</strong></span>
      </div>
      <div className="status-center">
        <span className="status-item">designCTRL v0.1.0</span>
      </div>
      <div className="status-right">
        <span className="status-item">ZOOM: <strong>{Math.round(zoom * 100)}%</strong></span>
        <span className="status-divider">|</span>
        <span className={`status-indicator ${gridEnabled ? 'on' : 'off'}`}>GRID</span>
        <span className={`status-indicator ${snapEnabled ? 'on' : 'off'}`}>SNAP</span>
      </div>
    </footer>
  );
}
