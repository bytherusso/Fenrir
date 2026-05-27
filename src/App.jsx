// src/App.jsx
import { ReactFlowProvider } from 'reactflow';
import { CircuitVisualizer } from './components/CircuitVisualizer';
import { ControlPanel } from './components/ControlPanel';
import { TruthTable } from './components/TruthTable';
import { ComponentPalette } from './components/ComponentPalette';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#09090b', 
      color: '#ffffff',
      overflow: 'hidden' 
    }}>
      
      {/* PANEL LATERAL (Sidebar) */}
      <div style={{ 
        width: '340px', 
        height: '100%', 
        borderRight: '1px solid rgba(255,255,255,0.05)', 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: '#09090b',
        zIndex: 10
      }}>
        {/* Título de la App */}
        <div style={{ padding: '24px 24px 12px 24px' }}>
          <h1 style={{ 
            fontFamily: 'JetBrains Mono, monospace', 
            fontSize: '1.5rem', 
            margin: 0,
            fontWeight: '700',
            letterSpacing: '-0.05em'
          }}>
            FEN<span style={{ color: 'var(--accent, #ff5031)' }}>RIR</span>
          </h1>
        </div>

        {/* Contenedor scrolleable para los controles */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '24px' }}>
          <ControlPanel />
          <ComponentPalette />
          <TruthTable />
        </div>
      </div>

      {/* ÁREA DEL LIENZO */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <ReactFlowProvider>
          <CircuitVisualizer />
        </ReactFlowProvider>
      </div>
      
    </div>
  );
}

export default App;