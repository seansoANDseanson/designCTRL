import { useEffect, useRef, useState } from 'react';
import type { FabricObject } from 'fabric';
import { useCanvasStore } from '../stores/useCanvasStore';
import { useDesignStore } from '../stores/useDesignStore';

interface ObjProps {
  x: number; y: number; w: number; h: number; angle: number;
  stroke: string; fill: string;
}

function readProps(obj: FabricObject): ObjProps {
  return {
    x: Math.round(obj.left ?? 0),
    y: Math.round(obj.top ?? 0),
    w: Math.round(obj.getScaledWidth()),
    h: Math.round(obj.getScaledHeight()),
    angle: Math.round(obj.angle ?? 0),
    stroke: (obj.stroke as string) ?? '#ffffff',
    fill: (obj.fill as string) === 'transparent' ? 'transparent' : ((obj.fill as string) ?? 'transparent'),
  };
}

export function RightPanel() {
  const { activeTab, setActiveTab, layers, toggleLayerVisibility, toggleLayerLock } = useDesignStore();
  const canvas = useCanvasStore(s => s.canvas);
  const saveHistory = useCanvasStore(s => s.saveHistory);

  const [objProps, setObjProps] = useState<ObjProps | null>(null);
  const selectedRef = useRef<FabricObject | null>(null);

  // Subscribe to Fabric selection events
  useEffect(() => {
    if (!canvas) return;

    const update = () => {
      const obj = canvas.getActiveObject();
      if (obj && !canvas.getActiveObjects().length) return; // active group edge case
      if (obj) {
        selectedRef.current = obj;
        setObjProps(readProps(obj));
      } else {
        selectedRef.current = null;
        setObjProps(null);
      }
    };

    const onSingle = () => {
      const obj = canvas.getActiveObject();
      if (obj) { selectedRef.current = obj; setObjProps(readProps(obj)); }
    };
    const onClear = () => { selectedRef.current = null; setObjProps(null); };

    canvas.on('selection:created', onSingle);
    canvas.on('selection:updated', onSingle);
    canvas.on('selection:cleared', onClear);
    canvas.on('object:modified', update);
    canvas.on('object:scaling', update);
    canvas.on('object:moving', update);
    canvas.on('object:rotating', update);

    return () => {
      canvas.off('selection:created', onSingle);
      canvas.off('selection:updated', onSingle);
      canvas.off('selection:cleared', onClear);
      canvas.off('object:modified', update);
      canvas.off('object:scaling', update);
      canvas.off('object:moving', update);
      canvas.off('object:rotating', update);
    };
  }, [canvas]);

  const applyProp = (field: keyof ObjProps, value: number | string) => {
    const obj = selectedRef.current;
    if (!obj || !canvas) return;
    switch (field) {
      case 'x': obj.set({ left: Number(value) }); break;
      case 'y': obj.set({ top: Number(value) }); break;
      case 'w': { const n = Number(value); if (n > 0) obj.set({ scaleX: n / (obj.width || 1) }); break; }
      case 'h': { const n = Number(value); if (n > 0) obj.set({ scaleY: n / (obj.height || 1) }); break; }
      case 'angle': obj.set({ angle: Number(value) }); break;
      case 'stroke': obj.set({ stroke: String(value) }); break;
      case 'fill': obj.set({ fill: String(value) }); break;
    }
    obj.setCoords();
    canvas.renderAll();
    setObjProps(readProps(obj));
    saveHistory();
  };

  const hasSelection = objProps !== null;

  return (
    <aside className="right-panel">
      <div className="panel-tabs">
        <button className={`panel-tab ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>PROPS</button>
        <button className={`panel-tab ${activeTab === 'layers' ? 'active' : ''}`} onClick={() => setActiveTab('layers')}>LAYERS</button>
        <button className={`panel-tab ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}>EQUIP</button>
      </div>

      <div className="panel-content">

        {/* ── PROPERTIES ── */}
        {activeTab === 'properties' && (
          <div className="properties-panel">
            <div className="section-header">
              <span className="bracket-label">╔ OBJECT PROPERTIES ╗</span>
            </div>
            {!hasSelection ? (
              <p className="empty-state">No object selected</p>
            ) : (
              <div className="prop-grid">
                {(
                  [
                    { label: 'X', field: 'x', type: 'number' },
                    { label: 'Y', field: 'y', type: 'number' },
                    { label: 'W', field: 'w', type: 'number' },
                    { label: 'H', field: 'h', type: 'number' },
                    { label: 'ROT', field: 'angle', type: 'number' },
                  ] as const
                ).map(({ label, field }) => (
                  <div className="prop-row" key={field}>
                    <label className="prop-label">{label}</label>
                    <input
                      className="prop-input"
                      type="number"
                      value={objProps?.[field] ?? 0}
                      onChange={e => applyProp(field, e.target.value)}
                    />
                  </div>
                ))}
                <div className="prop-divider" />
                <div className="prop-row">
                  <label className="prop-label">STROKE</label>
                  <div className="prop-color-row">
                    <input
                      type="color"
                      className="prop-color"
                      value={objProps?.stroke?.startsWith('#') ? objProps.stroke : '#ffffff'}
                      onChange={e => applyProp('stroke', e.target.value)}
                    />
                    <span className="prop-color-hex">{objProps?.stroke}</span>
                  </div>
                </div>
                <div className="prop-row">
                  <label className="prop-label">FILL</label>
                  <div className="prop-color-row">
                    <input
                      type="color"
                      className="prop-color"
                      value={objProps?.fill?.startsWith('#') ? objProps.fill : '#000000'}
                      onChange={e => applyProp('fill', e.target.value)}
                    />
                    <span className="prop-color-hex">{objProps?.fill}</span>
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
            {layers.map((layer) => (
              <div key={layer.id} className="layer-row" style={{ borderLeftColor: layer.color }}>
                <button
                  className={`layer-toggle ${layer.visible ? 'on' : 'off'}`}
                  onClick={() => toggleLayerVisibility(layer.id)}
                  title={layer.visible ? 'Hide layer' : 'Show layer'}
                >
                  {layer.visible ? '◉' : '○'}
                </button>
                <span className="layer-name">{layer.name}</span>
                <button
                  className={`layer-lock ${layer.locked ? 'locked' : ''}`}
                  onClick={() => toggleLayerLock(layer.id)}
                  title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                >
                  {layer.locked ? '■' : '□'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── EQUIPMENT ── */}
        {activeTab === 'equipment' && (
          <div className="equipment-panel">
            <div className="section-header">
              <span className="bracket-label">╔ EQUIPMENT SCHEDULE ╗</span>
            </div>
            <p className="empty-state">No equipment on canvas</p>
          </div>
        )}

      </div>
    </aside>
  );
}
