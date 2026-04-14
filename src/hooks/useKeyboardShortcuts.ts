import { useEffect } from 'react';
import { useCanvasStore } from '../stores/useCanvasStore';
import { useDesignStore, type Tool } from '../stores/useDesignStore';

const TOOL_KEYS: Record<string, Tool> = {
  s: 'select',
  l: 'line',
  r: 'rect',
  c: 'circle',
  t: 'text',
  p: 'pan',
  m: 'measure',
};

export function useKeyboardShortcuts() {
  const { setActiveTool, toggleGrid, toggleSnap } = useDesignStore();
  const { undo, redo, saveHistory } = useCanvasStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack keys while typing in an input or a Fabric IText is active
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) return;

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && key === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if ((ctrl && key === 'y') || (ctrl && e.shiftKey && key === 'z')) {
        e.preventDefault();
        redo();
        return;
      }

      if (key === 'escape') {
        setActiveTool('select');
        const canvas = useCanvasStore.getState().canvas;
        if (canvas) { canvas.discardActiveObject(); canvas.renderAll(); }
        return;
      }

      if (key === 'delete' || key === 'backspace') {
        const canvas = useCanvasStore.getState().canvas;
        if (!canvas) return;
        const active = canvas.getActiveObjects();
        if (active.length > 0) {
          active.forEach(obj => canvas.remove(obj));
          canvas.discardActiveObject();
          canvas.renderAll();
          saveHistory();
        }
        return;
      }

      if (!ctrl) {
        if (key === 'g') { toggleGrid(); return; }
        if (key === 'x') { toggleSnap(); return; }
        if (TOOL_KEYS[key]) { setActiveTool(TOOL_KEYS[key]); return; }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setActiveTool, toggleGrid, toggleSnap, undo, redo, saveHistory]);
}
