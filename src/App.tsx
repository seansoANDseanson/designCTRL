import { useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { LeftSidebar } from './components/LeftSidebar';
import { CenterCanvas } from './components/CenterCanvas';
import { RightPanel } from './components/RightPanel';
import { StatusBar } from './components/StatusBar';
import { useDesignStore } from './stores/useDesignStore';

export default function App() {
  const { appearanceMode, accentColor } = useDesignStore();

  // Bind appearance mode and accent color to the root element so
  // CSS selectors like [data-mode="glassmorphism"] and [data-accent="cyan"] work
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', appearanceMode);
  }, [appearanceMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor);
  }, [accentColor]);

  // Set initial attributes on mount
  useEffect(() => {
    const { appearanceMode: m, accentColor: a } = useDesignStore.getState();
    document.documentElement.setAttribute('data-mode', m);
    document.documentElement.setAttribute('data-accent', a);
  }, []);

  return (
    <div className="app-shell">
      <HeaderBar />
      <div className="app-body">
        <LeftSidebar />
        <CenterCanvas />
        <RightPanel />
      </div>
      <StatusBar />
    </div>
  );
}
