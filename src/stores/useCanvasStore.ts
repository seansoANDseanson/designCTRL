import { create } from 'zustand';
import type { Canvas } from 'fabric';

const MAX_HISTORY = 50;

interface CanvasState {
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;
  zoom: number;
  setZoom: (zoom: number) => void;

  // Undo/redo
  history: string[];
  historyIndex: number;
  historyVersion: number; // increments after undo/redo so CenterCanvas can react
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),
  zoom: 1,
  setZoom: (zoom) => set({ zoom }),

  history: [],
  historyIndex: -1,
  historyVersion: 0,

  saveHistory: () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas) return;
    // Serialize canvas, excluding grid lines (excludeFromExport: true)
    const json = JSON.stringify(canvas.toJSON([
      'layerId', 'symbolId', 'tagPrefix', 'tag', 'uid',
      'equipDesc', 'equipMfr', 'equipModel', 'equipSpecs', 'equipNotes',
    ]));
    const sliced = history.slice(0, historyIndex + 1);
    sliced.push(json);
    const trimmed = sliced.length > MAX_HISTORY ? sliced.slice(sliced.length - MAX_HISTORY) : sliced;
    set({ history: trimmed, historyIndex: trimmed.length - 1 });
  },

  undo: () => {
    const { canvas, history, historyIndex, historyVersion } = get();
    if (!canvas || historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    canvas.loadFromJSON(JSON.parse(history[newIndex])).then(() => {
      canvas.renderAll();
      set({ historyIndex: newIndex, historyVersion: historyVersion + 1 });
    });
  },

  redo: () => {
    const { canvas, history, historyIndex, historyVersion } = get();
    if (!canvas || historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    canvas.loadFromJSON(JSON.parse(history[newIndex])).then(() => {
      canvas.renderAll();
      set({ historyIndex: newIndex, historyVersion: historyVersion + 1 });
    });
  },
}));
