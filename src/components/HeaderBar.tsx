import { useDesignStore } from '../stores/useDesignStore';

export function HeaderBar() {
  const { accentColor, appearanceMode, setAppearanceMode } = useDesignStore();

  return (
    <header className="header-bar" data-accent={accentColor}>
      <div className="header-left">
        <div className="header-logo">
          <span className="logo-bracket">[</span>
          <span className="logo-text">designCTRL</span>
          <span className="logo-bracket">]</span>
        </div>
        <nav className="header-nav">
          <button className="nav-btn active">DESIGN</button>
          <button className="nav-btn">SCHEDULE</button>
          <button className="nav-btn">SUBMITTAL</button>
          <button className="nav-btn">COMMISSION</button>
        </nav>
      </div>
      <div className="header-center">
        <span className="project-name">UNTITLED PROJECT</span>
      </div>
      <div className="header-right">
        <div className="mode-switcher">
          <button className={`mode-btn ${appearanceMode === 'classic' ? 'active' : ''}`} onClick={() => setAppearanceMode('classic')} title="Classic Depth">CLS</button>
          <button className={`mode-btn ${appearanceMode === 'glassmorphism' ? 'active' : ''}`} onClick={() => setAppearanceMode('glassmorphism')} title="Glassmorphism Depth">GLS</button>
          <button className={`mode-btn ${appearanceMode === 'cyberpunk' ? 'active' : ''}`} onClick={() => setAppearanceMode('cyberpunk')} title="Neon Cyberpunk">NEO</button>
        </div>
      </div>
    </header>
  );
}
