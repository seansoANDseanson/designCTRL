import { useCallback, useEffect, useRef, useState } from 'react';
import type { FabricObject } from 'fabric';
import { useCanvasStore } from '../stores/useCanvasStore';
import { useDesignStore } from '../stores/useDesignStore';
import { getSymbol } from '../symbols/index';
import { exportEquipmentCSV, type EquipRow } from '../utils/csvExport';

// ─── Geometry properties ───────────────────────────────────────────────────
interface ObjProps {
  x: number; y: number; w: number; h: number; angle: number;
  stroke: string; fill: string;
}

function readGeom(obj: FabricObject): ObjProps {
  return {
    x:     Math.round(obj.left ?? 0),
    y:     Math.round(obj.top ?? 0),
    w:     Math.round(obj.getScaledWidth()),
    h:     Math.round(obj.getScaledHeight()),
    angle: Math.round(obj.angle ?? 0),
    stroke: (obj.stroke as string) ?? '#ffffff',
    fill:   (obj.fill   as string) === 'transparent' ? 'transparent' : ((obj.fill as string) ?? 'transparent'),
  };
}

// ─── Equipment fields ──────────────────────────────────────────────────────
interface EquipFields {
  tag: string; equipDesc: string; equipMfr: string;
  equipModel: string; equipSpecs: string; equipNotes: string;
}

function readEquip(obj: any): EquipFields {
  return {
    tag:        obj.tag        ?? '',
    equipDesc:  obj.equipDesc  ?? '',
    equipMfr:   obj.equipMfr   ?? '',
    equipModel: obj.equipModel ?? '',
    equipSpecs: obj.equipSpecs ?? '',
    equipNotes: obj.equipNotes ?? '',
  };
}

// ─── Equipment schedule hook ───────────────────────────────────────────────
function useEquipmentList() {
  const canvas   = useCanvasStore(s => s.canvas);
  const histVer  = useCanvasStore(s => s.historyVersion);
  const [rows, setRows] = useState<(EquipRow & { obj: FabricObject })[]>([]);

  const refresh = useCallback(() => {
    if (!canvas) { setRows([]); return; }
    const list = canvas.getObjects()
      .filter(o => (o as any).symbolId)
      .map(o => {
        const a = o as any;
        const sym = getSymbol(a.symbolId);
        return {
          tag:      a.tag      ?? '—',
          category: sym?.category ?? '—',
          desc:     a.equipDesc  ?? sym?.name ?? '—',
          mfr:      a.equipMfr   ?? '',
          model:    a.equipModel ?? '',
          specs:    a.equipSpecs ?? '',
          notes:    a.equipNotes ?? '',
          obj: o,
        };
      })
      .sort((a, b) => a.tag.localeCompare(b.tag, undefined, { numeric: true }));
    setRows(list);
  }, [canvas]);

  useEffect(() => { refresh(); }, [refresh, histVer]);

  useEffect(() => {
    if (!canvas) return;
    canvas.on('object:added',    refresh);
    canvas.on('object:removed',  refresh);
    canvas.on('object:modified', refresh);
    return () => {
      canvas.off('object:added',    refresh);
      canvas.off('object:removed',  refresh);
      canvas.off('object:modified', refresh);
    };
  }, [canvas, refresh]);

  return rows;
}

// ─── Main component ────────────────────────────────────────────────────────
export function RightPanel() {
  const { activeTab, setActiveTab, layers, toggleLayerVisibility, toggleLayerLock } = useDesignStore();
  const canvas      = useCanvasStore(s => s.canvas);
  const saveHistory = useCanvasStore(s => s.saveHistory);
  const equipRows   = useEquipmentList();

  const [geom,  setGeom]  = useState<ObjProps | null>(null);
  const [equip, setEquip] = useState<EquipFields | null>(null);
  const selectedRef = useRef<FabricObject | null>(null);

  const isSymbol = equip !== null;

  // Subscribe to Fabric selection events
  useEffect(() => {
    if (!canvas) return;

    const onSelect = () => {
      const obj = canvas.getActiveObject();
      if (obj) {
        selectedRef.current = obj;
        setGeom(readGeom(obj));
        setEquip((obj as any).symbolId ? readEquip(obj) : null);
      }
    };
    const onClear = () => {
      selectedRef.current = null;
      setGeom(null);
      setEquip(null);
    };
    const onModify = () => {
      const obj = canvas.getActiveObject();
      if (obj) {
        setGeom(readGeom(obj));
        setEquip((obj as any).symbolId ? readEquip(obj) : null);
      }
    };

    canvas.on('selection:created', onSelect);
    canvas.on('selection:updated', onSelect);
    canvas.on('selection:cleared', onClear);
    canvas.on('object:modified',   onModify);
    canvas.on('object:scaling',    onModify);
    canvas.on('object:moving',     onModify);
    canvas.on('object:rotating',   onModify);

    return () => {
      canvas.off('selection:created', onSelect);
      canvas.off('selection:updated', onSelect);
      canvas.off('selection:cleared', onClear);
      canvas.off('object:modified',   onModify);
      canvas.off('object:scaling',    onModify);
      canvas.off('object:moving',     onModify);
      canvas.off('object:rotating',   onModify);
    };
  }, [canvas]);

  // Write geometry prop back to canvas object
  const applyGeom = (field: keyof ObjProps, value: string) => {
    const obj = selectedRef.current;
    if (!obj || !canvas) return;
    const n = Number(value);
    switch (field) {
      case 'x':     obj.set({ left: n }); break;
      case 'y':     obj.set({ top: n }); break;
      case 'w':     if (n > 0) obj.set({ scaleX: n / (obj.width || 1) }); break;
      case 'h':     if (n > 0) obj.set({ scaleY: n / (obj.height || 1) }); break;
      case 'angle': obj.set({ angle: n }); break;
      case 'stroke': obj.set({ stroke: value }); break;
      case 'fill':   obj.set({ fill: value }); break;
    }
    obj.setCoords();
    canvas.renderAll();
    setGeom(readGeom(obj));
    saveHistory();
  };

  // Write equipment field back to canvas object
  const applyEquip = (field: keyof EquipFields, value: string) => {
    const obj = selectedRef.current as any;
    if (!obj || !canvas) return;
    obj[field] = value;
    canvas.renderAll();
    setEquip(readEquip(obj));
    saveHistory();
  };

  // Select object from schedule table
  const selectFromTable = (obj: FabricObject) => {
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.renderAll();
    setActiveTab('properties');
  };

  return (
    <aside className="right-panel">
      <div className="panel-tabs">
        <button className={`panel-tab ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>PROPS</button>
        <button className={`panel-tab ${activeTab === 'layers'     ? 'active' : ''}`} onClick={() => setActiveTab('layers')}>LAYERS</button>
        <button className={`panel-tab ${activeTab === 'equipment'  ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}>
          EQUIP {equipRows.length > 0 && <span className="equip-badge">{equipRows.length}</span>}
        </button>
      </div>

      <div className="panel-content">

        {/* ── PROPERTIES ── */}
        {activeTab === 'properties' && (
          <div className="properties-panel">

            {/* Equipment identity block — shown when a symbol is selected */}
            {isSymbol && equip && (
              <div className="equip-identity">
                <div className="section-header">
                  <span className="bracket-label">╔ EQUIPMENT ╗</span>
                </div>
                <div className="prop-grid">
                  {(
                    [
                      { label: 'TAG',   field: 'tag',        placeholder: 'AHU-1'         },
                      { label: 'DESC',  field: 'equipDesc',  placeholder: 'Air Handler'   },
                      { label: 'MFR',   field: 'equipMfr',   placeholder: 'Carrier'       },
                      { label: 'MODEL', field: 'equipModel', placeholder: '39MN'          },
                      { label: 'SPECS', field: 'equipSpecs', placeholder: '5 tons, 2000 CFM' },
                      { label: 'NOTES', field: 'equipNotes', placeholder: ''              },
                    ] as const
                  ).map(({ label, field, placeholder }) => (
                    <div className="prop-row" key={field}>
                      <label className="prop-label">{label}</label>
                      <input
                        className={`prop-input ${field === 'tag' ? 'prop-input--tag' : ''}`}
                        type="text"
                        value={(equip as any)[field]}
                        placeholder={placeholder}
                        onChange={e => applyEquip(field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Geometry block */}
            <div className="section-header" style={{ marginTop: isSymbol ? 12 : 0 }}>
              <span className="bracket-label">╔ GEOMETRY ╗</span>
            </div>
            {!geom ? (
              <p className="empty-state">No object selected</p>
            ) : (
              <div className="prop-grid">
                {(
                  [
                    { label: 'X',   field: 'x',     type: 'number' },
                    { label: 'Y',   field: 'y',     type: 'number' },
                    { label: 'W',   field: 'w',     type: 'number' },
                    { label: 'H',   field: 'h',     type: 'number' },
                    { label: 'ROT', field: 'angle', type: 'number' },
                  ] as const
                ).map(({ label, field }) => (
                  <div className="prop-row" key={field}>
                    <label className="prop-label">{label}</label>
                    <input
                      className="prop-input"
                      type="number"
                      value={geom[field]}
                      onChange={e => applyGeom(field, e.target.value)}
                    />
                  </div>
                ))}
                <div className="prop-divider" />
                <div className="prop-row">
                  <label className="prop-label">STROKE</label>
                  <div className="prop-color-row">
                    <input type="color" className="prop-color"
                      value={geom.stroke?.startsWith('#') ? geom.stroke : '#ffffff'}
                      onChange={e => applyGeom('stroke', e.target.value)} />
                    <span className="prop-color-hex">{geom.stroke}</span>
                  </div>
                </div>
                <div className="prop-row">
                  <label className="prop-label">FILL</label>
                  <div className="prop-color-row">
                    <input type="color" className="prop-color"
                      value={geom.fill?.startsWith('#') ? geom.fill : '#000000'}
                      onChange={e => applyGeom('fill', e.target.value)} />
                    <span className="prop-color-hex">{geom.fill}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LAYERS ── */}
        {activeTab === 'layers' && (
          <div className="layers-panel">
            <div className="section-header">
              <span className="bracket-label">╔ MEP LAYERS ╗</span>
            </div>
            {layers.map(layer => (
              <div key={layer.id} className="layer-row" style={{ borderLeftColor: layer.color }}>
                <button className={`layer-toggle ${layer.visible ? 'on' : 'off'}`}
                  onClick={() => toggleLayerVisibility(layer.id)}
                  title={layer.visible ? 'Hide' : 'Show'}>
                  {layer.visible ? '◉' : '○'}
                </button>
                <span className="layer-name">{layer.name}</span>
                <button className={`layer-lock ${layer.locked ? 'locked' : ''}`}
                  onClick={() => toggleLayerLock(layer.id)}
                  title={layer.locked ? 'Unlock' : 'Lock'}>
                  {layer.locked ? '■' : '□'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── EQUIPMENT SCHEDULE ── */}
        {activeTab === 'equipment' && (
          <div className="equipment-panel">
            <div className="section-header equip-schedule-header">
              <span className="bracket-label">╔ EQUIPMENT SCHEDULE ╗</span>
              {equipRows.length > 0 && (
                <button
                  className="csv-btn"
                  onClick={() => exportEquipmentCSV(equipRows)}
                  title="Export to CSV"
                >
                  CSV ↓
                </button>
              )}
            </div>

            {equipRows.length === 0 ? (
              <p className="empty-state">Place symbols on canvas<br/>to build the schedule</p>
            ) : (
              <div className="equip-table-wrap">
                <table className="equip-table">
                  <thead>
                    <tr>
                      <th>TAG</th>
                      <th>TYPE</th>
                      <th>DESC</th>
                      <th>SPECS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipRows.map((row, i) => (
                      <tr
                        key={i}
                        className="equip-row"
                        onClick={() => selectFromTable(row.obj)}
                        title={`${row.mfr} ${row.model} — ${row.notes}`}
                      >
                        <td className="equip-tag">{row.tag}</td>
                        <td className="equip-cat">{row.category}</td>
                        <td className="equip-desc">{row.desc || '—'}</td>
                        <td className="equip-specs">{row.specs || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </aside>
  );
}
