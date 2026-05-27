// src/components/ComponentPalette.jsx
export const ComponentPalette = () => {
  const onDragStart = (event, nodeData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const gates = [
    { label: 'INPUT', inputs: 0 },
    { label: 'AND', icNumber: '7408', inputs: 2 },
    { label: 'OR', icNumber: '7432', inputs: 2 },
    { label: 'NOT', icNumber: '7404', inputs: 1 },
    { label: 'NAND', icNumber: '7400', inputs: 2 },
    { label: 'NOR', icNumber: '7402', inputs: 2 },
    { label: 'XOR', icNumber: '7486', inputs: 2 },
    { label: 'OUTPUT', inputs: 1 }
  ];

  return (
    <div className="panel-section">
      <h2 className="section-title">Hardware (Serie 74xx)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {gates.map((gate) => (
          <div
            key={gate.label}
            draggable
            onDragStart={(e) => onDragStart(e, gate)}
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border-color)',
              padding: '10px',
              cursor: 'grab',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'border-color 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--text-muted)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
              {gate.icNumber ? gate.icNumber : gate.label}
            </span>
            {gate.icNumber && (
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {gate.label}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="help-text" style={{ marginTop: '12px', textAlign: 'center' }}>
        Arrastra hacia el lienzo →
      </p>
    </div>
  );
};