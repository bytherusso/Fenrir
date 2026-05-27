// src/components/LogicNode.jsx
import { Handle, Position, useReactFlow } from 'reactflow';

const getAccentColor = (label) => {
  if (!label) return '#10b981';
  if (label.includes('AND')) return '#3b82f6';
  if (label.includes('OR')) return '#f59e0b';
  if (label.includes('XOR')) return '#a855f7';
  if (label === 'NOT') return '#ec4899';
  return '#10b981';
};

export const LogicNode = ({ id, data }) => {
  const { setNodes } = useReactFlow();

  const inputCount = data.inputs !== undefined ? data.inputs : 2;
  const isInput = data.inputs === 0;
  const isOutput = data.label === 'OUTPUT';
  const isActive = data.value === 1;
  
  const accentColor = getAccentColor(data.label);

  const handleNameChange = (e) => {
    const newName = e.target.value.toUpperCase();
    setNodes((nds) => 
      nds.map((node) => 
        node.id === id ? { ...node, data: { ...node.data, customName: newName } } : node
      )
    );
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: `1px solid ${isActive ? accentColor : 'var(--border-color)'}`,
      padding: '14px 18px',
      minWidth: '110px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: isActive ? `0 0 20px ${accentColor}40` : '0 4px 12px rgba(0,0,0,0.3)',
      borderRadius: '6px',
      transition: 'all 0.3s ease',
    }}>
      
      {isInput ? (
        <input 
          type="text" 
          value={data.customName || 'A'} 
          maxLength={3} 
          onChange={handleNameChange}
          style={{ 
            background: 'transparent', border: 'none', borderBottom: `1px solid ${isActive ? accentColor : 'var(--border-color)'}`, 
            color: isActive ? accentColor : 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace', 
            fontSize: '1rem', fontWeight: '600', width: '45px', textAlign: 'center', outline: 'none', transition: 'all 0.3s' 
          }}
        />
      ) : (
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', fontWeight: '600', color: isActive ? accentColor : 'var(--text-main)', letterSpacing: '0.05em', transition: 'color 0.3s' }}>
          {data.icNumber || data.label}
        </div>
      )}
      
      {isInput ? (
        <div 
          onClick={() => data.onToggle && data.onToggle(id)}
          style={{ marginTop: '12px', background: isActive ? accentColor : 'var(--bg-surface-hover)', color: isActive ? '#ffffff' : 'var(--text-muted)', border: `1px solid ${isActive ? accentColor : 'var(--border-color)'}`, borderRadius: '4px', padding: '4px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          {isActive ? '1' : '0'}
        </div>
      ) : isOutput ? (
        <div style={{ marginTop: '8px', fontSize: '1.2rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: '600', color: isActive ? accentColor : 'var(--text-muted)' }}>
          [{isActive ? '1' : '0'}]
        </div>
      ) : (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase' }}>
          {data.label} GATE
        </div>
      )}

      {/* ENTRADAS POR LA IZQUIERDA */}
      {Array.from({ length: inputCount }).map((_, i) => (
        <Handle 
          key={`in-${i}`} 
          type="target" 
          position={Position.Left} 
          id={`in-${i}`} 
          style={{ 
            top: `${(100 / (inputCount + 1)) * (i + 1)}%`, 
            left: '-5px', 
            background: 'var(--bg-surface)', border: '2px solid var(--text-muted)', width: '10px', height: '10px' 
          }} 
        />
      ))}

      {/* SALIDA POR LA DERECHA */}
      {!isOutput && (
        <Handle 
          type="source" 
          position={Position.Right} 
          id="out" 
          style={{ 
            right: '-5px', 
            background: isActive ? accentColor : 'var(--bg-surface)', border: `2px solid ${isActive ? accentColor : 'var(--text-muted)'}`, width: '10px', height: '10px', transition: 'all 0.3s' 
          }} 
        />
      )}
    </div>
  );
};