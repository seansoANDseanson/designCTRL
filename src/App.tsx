import { HeaderBar } from './components/HeaderBar';
import { LeftSidebar } from './components/LeftSidebar';
import { CenterCanvas } from './components/CenterCanvas';
import { RightPanel } from './components/RightPanel';
import { StatusBar } from './components/StatusBar';

export default function App() {
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
