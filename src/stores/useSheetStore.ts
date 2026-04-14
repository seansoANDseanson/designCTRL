import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// ─── Title block data (project-level) ─────────────────────────────────────
export interface TitleBlockData {
  projectName: string;
  projectNumber: string;
  client: string;
  address: string;
  drawnBy: string;
  checkedBy: string;
  engineer: string;
  scale: string;
  notes: string;
}

// ─── Single drawing sheet ──────────────────────────────────────────────────
export interface Sheet {
  id: string;
  name: string;           // e.g. "L1 — MECHANICAL"
  canvasJson: string | null;
}

function makeSheet(name: string): Sheet {
  return { id: uuidv4(), name, canvasJson: null };
}

// ─── Store ─────────────────────────────────────────────────────────────────
interface SheetState {
  sheets: Sheet[];
  activeSheetId: string;

  titleBlock: TitleBlockData;
  updateTitleBlock: (field: keyof TitleBlockData, value: string) => void;

  // Sheet CRUD
  addSheet: () => void;
  removeSheet: (id: string) => void;
  renameSheet: (id: string, name: string) => void;

  /** Save serialised canvas JSON into the current sheet slot */
  saveSheetJson: (id: string, json: string) => void;

  /** Switch active sheet — caller must save current first */
  setActiveSheet: (id: string) => void;
}

const DEFAULT_SHEET = makeSheet('SHEET 1');

export const useSheetStore = create<SheetState>((set, get) => ({
  sheets: [DEFAULT_SHEET],
  activeSheetId: DEFAULT_SHEET.id,

  titleBlock: {
    projectName:   '',
    projectNumber: '',
    client:        '',
    address:       '',
    drawnBy:       '',
    checkedBy:     '',
    engineer:      '',
    scale:         '1" = 1\'',
    notes:         '',
  },

  updateTitleBlock: (field, value) =>
    set((s) => ({ titleBlock: { ...s.titleBlock, [field]: value } })),

  addSheet: () => {
    const { sheets } = get();
    const newSheet = makeSheet(`SHEET ${sheets.length + 1}`);
    set((s) => ({ sheets: [...s.sheets, newSheet], activeSheetId: newSheet.id }));
  },

  removeSheet: (id) => {
    const { sheets, activeSheetId } = get();
    if (sheets.length === 1) return; // always keep at least one
    const remaining = sheets.filter((s) => s.id !== id);
    const nextActive = activeSheetId === id ? remaining[0].id : activeSheetId;
    set({ sheets: remaining, activeSheetId: nextActive });
  },

  renameSheet: (id, name) =>
    set((s) => ({
      sheets: s.sheets.map((sh) => (sh.id === id ? { ...sh, name } : sh)),
    })),

  saveSheetJson: (id, json) =>
    set((s) => ({
      sheets: s.sheets.map((sh) => (sh.id === id ? { ...sh, canvasJson: json } : sh)),
    })),

  setActiveSheet: (id) => set({ activeSheetId: id }),
}));
