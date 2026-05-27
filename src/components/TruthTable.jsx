// src/components/TruthTable.jsx
import { useState, useEffect } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';

export const TruthTable = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const variables = useSimulatorStore(state => state.variables) || [];
  const truthTable = useSimulatorStore(state => state.truthTable) || [];
  const subExpressions = useSimulatorStore(state => state.subExpressions) || [];
  // Extraemos la ecuación original escrita por el usuario (con 'F' como respaldo por si acaso)
  const equation = useSimulatorStore(state => state.equation) || 'F';

  // Efecto para cerrar la ventana modal si se presiona la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!variables || variables.length === 0) return null;

  return (
    <div className="panel-section" style={{ borderBottom: 'none' }}>
      
      {/* BOTÓN EN EL PANEL LATERAL */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          width: '100%',
          background: 'var(--bg-surface)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)',
          padding: '12px',
          fontFamily: 'JetBrains Mono',
          fontSize: '0.8rem',
          fontWeight: '600',
          cursor: 'pointer',
          borderRadius: '6px',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = 'var(--text-muted)';
          e.currentTarget.style.background = 'var(--bg-surface-hover)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.background = 'var(--bg-surface)';
        }}
      >
        [ VER TABLA DE VERDAD ]
      </button>

      {/* VENTANA MODAL (OVERLAY) */}
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(9, 9, 11, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999
        }}>
          
          {/* CAJA DE LA TABLA */}
          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            width: '90%', maxWidth: '1000px',
            maxHeight: '85vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
            overflow: 'hidden'
          }}>
            
            {/* CABECERA DEL MODAL */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-surface)'
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>
                TABLA DE VERDAD ANALÍTICA
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-muted)',
                  fontSize: '1.2rem', cursor: 'pointer', padding: '4px', lineHeight: '1',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                ✕
              </button>
            </div>

            {/* CONTENEDOR CON SCROLL PARA LA TABLA */}
            <div style={{ overflow: 'auto', padding: '24px' }}>
              <table className="truth-table" style={{ width: '100%', minWidth: '400px' }}>
                <thead>
                  <tr>
                    {/* Variables Base */}
                    {variables.map((v, i) => (
                      <th key={`var-head-${i}`} style={{ padding: '12px', textAlign: 'center', fontSize: '0.9rem' }}>
                        {v}
                      </th>
                    ))}
                    
                    {/* Sub-Operaciones Limpias */}
                    {subExpressions.map((sub, i) => (
                      <th key={`sub-head-${i}`} style={{ 
                        color: '#a1a1aa', fontSize: '0.85rem', fontStyle: 'italic',
                        padding: '12px 20px', whiteSpace: 'nowrap', textAlign: 'center'
                      }}>
                        {sub}
                      </th>
                    ))}
                    
                    {/* Resultado Final (Ahora muestra la ecuación completa) */}
                    <th style={{ 
                      color: 'var(--true-text)', 
                      borderBottom: '2px solid var(--true-text)', 
                      padding: '12px 20px', 
                      fontSize: '0.95rem',
                      whiteSpace: 'nowrap' /* Evita que ecuaciones largas rompan el diseño */
                    }}>
                      {equation}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {truthTable.map((row, rowIndex) => (
                    <tr key={`row-${rowIndex}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      
                      {row.inputs.map((val, colIndex) => (
                        <td key={`val-${rowIndex}-${colIndex}`} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '12px', fontSize: '0.9rem' }}>
                          {val}
                        </td>
                      ))}
                      
                      {row.subEvaluations && row.subEvaluations.map((subEval, subIndex) => (
                        <td 
                          key={`se-${rowIndex}-${subIndex}`} 
                          className={subEval.val === 1 ? 'cell-true' : 'cell-false'}
                          style={{ opacity: 0.85, fontSize: '0.9rem', textAlign: 'center', padding: '12px' }}
                        >
                          {subEval.val !== null ? subEval.val : '-'}
                        </td>
                      ))}
                      
                      <td 
                        className={row.result === 1 ? 'cell-true' : 'cell-false'}
                        style={{ fontWeight: '700', borderLeft: '1px solid var(--border-color)', textAlign: 'center', padding: '12px', fontSize: '1rem' }}
                      >
                        {row.result !== null ? row.result : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};