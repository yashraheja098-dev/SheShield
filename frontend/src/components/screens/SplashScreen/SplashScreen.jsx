import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import './SplashScreen.css';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to Login Screen after 2.5 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <div className="splash-background-glow" />
      
      <div className="splash-content">
        <div className="splash-logo-container">
          <Shield className="splash-logo" size={64} strokeWidth={2} />
        </div>
        
        <h1 className="splash-title">SheShield</h1>
        
        <div className="splash-tagline">
          <div>Travel Safe.</div>
          <div>Stay Connected.</div>
          <div>Stay Protected.</div>
        </div>
      </div>
      
      <div className="splash-loader" />
    </div>
  );
};

export default SplashScreen;
