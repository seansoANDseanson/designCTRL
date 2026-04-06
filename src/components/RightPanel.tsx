import { useDesignStore } from '../stores/useDesignStore';

export function RightPanel() {
  const { activeTab, setActiveTab, layers, toggleLayerVisibility, toggleLayerLock, selectedObjectIds } = useDesignStore();

  return (
    <aside className="right-panel">
      <div className="panel-tabs">
        <button className={`panel-tab ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>PROPERTIES</button>
        <button className={`panel-tab ${activeTab === 'layers' ? 'active' : ''}`} onClick={() => setActiveTab('layers')}>LAYERS</button>
        <button className={`panel-tab ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}>EQUIPMENT</button>
      </div>
      <div className="panel-content">
        {activeTab === 'properties' && (
          <div className="properties-panel">
            <div className="section-header"><span className="bracket-label">\u2554 OBJECT PROPERTIES \u2557</span></div>
            {selectedObjectIds.length === 0 ? (
              <p className="empty-state">No object selected</p>
            ) : (
              <div className="property-grid">
                <label>X</label><input type="number" defaultValue={0} />
                <label>Y</label><input type="number" defaultValue={0} />
                <label>W</label><input type="number" defaultValue={100} />
                <label>H</label><input type="number" defaultValue={100} />
                <label>Rotation</label><input type="number" defaultValue={0} />
              </div>
            )}
          </div>
        )}
        {activeTab === 'layers' && (
          <div className="layers-panel">
            <div className="section-header"><span className="bracket-label">\u2554 LAYERS \u2557</span></div>
            {layers.map((layer) => (
              <div key={layer.id} className="layer-row" style={{ borderLeftColor: layer.color }}>
                <button className={`layer-toggle ${layer.visible ? 'on' : 'off'}`} onClick={() => toggleLayerVisibility(layer.id)}>{layer.visible ? '\u25C9' : '\u25CB'}</button>
                <span className="layer-name">{layer.name}</span>
                <button className={`layer-lock ${layer.locked ? 'locked' : ''}`} onClick={() => toggleLayerLock(layer.id)}>{layer.locked ? '\uD83D\uDD12' : '\uD83D\uDD13'}</button>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'equipment' && (
          <div className="equipment-panel">
            <div className="section-header"><span className="bracket-label">\u2554 EQUIPMENT SCHEDULE \u2557</span></div>
            <p className="empty-state">No equipment on canvas</p>
          </div>
        )}
      </div>
    </aside>
  );
}
