// src/components/AuthScreen.jsx
import { useState, useEffect } from 'react';

export const AuthScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [expectedPassword, setExpectedPassword] = useState('');

  // Generador dinámico de contraseña basado en la hora actual
  useEffect(() => {
    const updatePassword = () => {
      const now = new Date();
      // Obtiene la hora en formato 24h y asegura que tenga 2 dígitos (ej. 09, 14, 22)
      const currentHour = now.getHours().toString().padStart(2, '0');
      setExpectedPassword(`LOGIC-${currentHour}`);
    };

    updatePassword(); // Calcula al montar la pantalla
    
    // Configura un intervalo invisible para recalcular si el usuario deja la pestaña abierta
    const interval = setInterval(updatePassword, 60000); // Chequea cada minuto
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Limpiamos espacios accidentales y convertimos todo a mayúsculas para comparar
    const userPassword = password.trim().toUpperCase();
    
    if (userPassword === expectedPassword) {
      onLogin(); // Desbloquea la aplicación
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#09090b',
      backgroundImage: 'radial-gradient(circle at 50% -20%, #1a1a2e 0%, #09090b 80%)',
      fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* Contenedor Glassmorphism Premium */}
      <div style={{
        background: 'rgba(24, 24, 27, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // Animación de temblor si hay error
        transform: error ? 'translateX(10px)' : 'translateX(0)',
        transition: error ? 'transform 0.1s cubic-bezier(0.36, 0.07, 0.19, 0.97)' : 'all 0.3s ease',
      }}>
        
        {/* Logo / Título */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ 
            fontFamily: 'JetBrains Mono, monospace', 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            color: '#ffffff',
            letterSpacing: '-0.05em',
            margin: '0 0 8px 0'
          }}>
            Logic<span style={{ color: 'var(--accent, #3b82f6)' }}>Core</span>
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.875rem', margin: 0 }}>
            Simulador Analítico de Circuitos Digitales
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ position: 'relative', width: '100%' }}>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Credencial de Acceso
            </label>
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la clave dinámica"
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: `1px solid ${error ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '8px',
                  padding: '12px 48px 12px 16px', // Espacio extra a la derecha para el icono
                  color: '#ffffff',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxShadow: error ? '0 0 0 1px #ef4444' : 'none'
                }}
                onFocus={(e) => { if(!error) e.target.style.borderColor = 'var(--accent, #3b82f6)' }}
                onBlur={(e) => { if(!error) e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)' }}
              />
              
              {/* Botón para alternar visibilidad (El "Ojito") */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#a1a1aa',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#a1a1aa'}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  // Icono de Ojo Abierto
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  // Icono de Ojo Cerrado (con barra diagonal)
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
            
            {/* Mensaje de error sutil */}
            {error && (
              <span style={{ position: 'absolute', color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontFamily: 'Inter' }}>
                Credencial incorrecta o expirada.
              </span>
            )}
          </div>

          <button 
            type="submit"
            style={{
              width: '100%',
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '12px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 255, 255, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.1)';
            }}
          >
            INICIAR SESIÓN
          </button>
        </form>

        {/* Explicación sutil de seguridad para que el usuario no se pierda */}
        <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', width: '100%' }}>
          <p style={{ color: '#52525b', fontSize: '0.7rem', margin: 0, fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}>
            Protocolo de Seguridad Activo
          </p>
          <p style={{ color: '#71717a', fontSize: '0.75rem', margin: '4px 0 0 0' }}>
            La clave rota cada hora exacta. <br/>
            (Ej: Si son las 14:20, la clave es <b>LOGIC-14</b>)
          </p>
        </div>

      </div>
    </div>
  );
};