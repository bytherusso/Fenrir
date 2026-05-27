// src/components/MaterialList.jsx
import { useSimulatorStore } from '../store/useSimulatorStore';

export const MaterialList = () => {
  const { requiredChips } = useSimulatorStore();

  if (!requiredChips || requiredChips.length === 0) return null;

  return (
    <div className="panel-section">
      <h2 className="section-title">Lista de Materiales (BOM)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {requiredChips.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', color: 'var(--text-main)' }}>
                SN{item.code}N
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {item.name}
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--text-main)' }}>
                x{item.chipsNeeded}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Sobran {item.unusedGates} compuertas
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};