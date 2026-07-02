import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginScreen = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '100dvh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)'
    }}>
      <h1 style={{ marginBottom: '1rem' }}>Login Placeholder</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
        This screen is not yet implemented.
      </p>
      <button 
        onClick={() => navigate('/map')}
        style={{
          padding: '12px 24px',
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--r-md)',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Go to Map
      </button>
    </div>
  );
};

export default LoginScreen;
