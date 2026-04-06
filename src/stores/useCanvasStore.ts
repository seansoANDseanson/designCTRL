import { create } from 'zustand';
import type { Canvas } from 'fabric';

interface CanvasState {
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),
  zoom: 1,
  setZoom: (zoom) => set({ zoom }),
}));
