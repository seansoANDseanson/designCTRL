import { create } from 'zustand';

export type Tool = 'select' | 'line' | 'rect' | 'circle' | 'symbol' | 'measure' | 'text' | 'pan';
export type AccentColor = 'cyan' | 'indigo' | 'violet' | 'green' | 'rose' | 'amber' | 'steel';
export type AppearanceMode = 'classic' | 'glassmorphism' | 'cyberpunk';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
}

interface DesignState {
  // Tools
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;

  // Active symbol (set when symbol tool is active)
  activeSymbolId: string | null;
  setActiveSymbolId: (id: string | null) => void;

  // Active layer — new objects are tagged with this
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;

  // Canvas options
  gridEnabled: boolean;
  toggleGrid: () => void;
  snapEnabled: boolean;
  toggleSnap: () => void;

  // Appearance
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  appearanceMode: AppearanceMode;
  setAppearanceMode: (mode: AppearanceMode) => void;

  // Right panel
  activeTab: 'properties' | 'layers' | 'equipment';
  setActiveTab: (tab: 'properties' | 'layers' | 'equipment') => void;

  // Canvas state
  cursorPosition: { x: number; y: number };
  setCursorPosition: (pos: { x: number; y: number }) => void;

  // Layers
  layers: Layer[];
  addLayer: (layer: Layer) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;

  // Selection
  selectedObjectIds: string[];
  setSelectedObjectIds: (ids: string[]) => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),

  activeSymbolId: null,
  setActiveSymbolId: (id) => set({ activeSymbolId: id }),

  activeLayerId: 'mechanical',
  setActiveLayerId: (id) => set({ activeLayerId: id }),

  gridEnabled: true,
  toggleGrid: () => set((s) => ({ gridEnabled: !s.gridEnabled })),
  snapEnabled: true,
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),

  accentColor: 'cyan',
  setAccentColor: (color) => set({ accentColor: color }),
  appearanceMode: 'glassmorphism',
  setAppearanceMode: (mode) => set({ appearanceMode: mode }),

  activeTab: 'properties',
  setActiveTab: (tab) => set({ activeTab: tab }),

  cursorPosition: { x: 0, y: 0 },
  setCursorPosition: (pos) => set({ cursorPosition: pos }),

  layers: [
    { id: 'mechanical',      name: 'MECHANICAL',      visible: true, locked: false, color: '#00d4ff' },
    { id: 'electrical',      name: 'ELECTRICAL',      visible: true, locked: false, color: '#f43f5e' },
    { id: 'plumbing',        name: 'PLUMBING',        visible: true, locked: false, color: '#22c55e' },
    { id: 'fire-protection', name: 'FIRE PROTECTION', visible: true, locked: false, color: '#f59e0b' },
    { id: 'controls',        name: 'CONTROLS',        visible: true, locked: false, color: '#8b5cf6' },
  ],
  addLayer: (layer) => set((s) => ({ layers: [...s.layers, layer] })),
  toggleLayerVisibility: (id) =>
    set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)) })),
  toggleLayerLock: (id) =>
    set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)) })),

  selectedObjectIds: [],
  setSelectedObjectIds: (ids) => set({ selectedObjectIds: ids }),
}));
