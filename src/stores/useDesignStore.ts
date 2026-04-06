import { create } from 'zustand';

export type Tool = 'select' | 'line' | 'rect' | 'circle' | 'symbol' | 'measure' | 'text' | 'pan';
export type AccentColor = 'cyan' | 'indigo' | 'violet' | 'green' | 'rose' | 'amber' | 'steel';
export type AppearanceMode = 'classic' | 'glassmorphism' | 'cyberpunk';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
}

interface DesignState {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  gridEnabled: boolean;
  toggleGrid: () => void;
  snapEnabled: boolean;
  toggleSnap: () => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  appearanceMode: AppearanceMode;
  setAppearanceMode: (mode: AppearanceMode) => void;
  activeTab: 'properties' | 'layers' | 'equipment';
  setActiveTab: (tab: 'properties' | 'layers' | 'equipment') => void;
  cursorPosition: { x: number; y: number };
  setCursorPosition: (pos: { x: number; y: number }) => void;
  layers: Layer[];
  addLayer: (layer: Layer) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  selectedObjectIds: string[];
  setSelectedObjectIds: (ids: string[]) => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
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
    { id: 'mechanical', name: 'MECHANICAL', visible: true, locked: false, color: '#00d4ff' },
    { id: 'electrical', name: 'ELECTRICAL', visible: true, locked: false, color: '#ff6b6b' },
    { id: 'plumbing', name: 'PLUMBING', visible: true, locked: false, color: '#51cf66' },
    { id: 'fire-protection', name: 'FIRE PROTECTION', visible: true, locked: false, color: '#ff922b' },
    { id: 'controls', name: 'CONTROLS', visible: true, locked: false, color: '#cc5de8' },
  ],
  addLayer: (layer) => set((s) => ({ layers: [...s.layers, layer] })),
  toggleLayerVisibility: (id) => set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)) })),
  toggleLayerLock: (id) => set((s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)) })),
  selectedObjectIds: [],
  setSelectedObjectIds: (ids) => set({ selectedObjectIds: ids }),
}));
