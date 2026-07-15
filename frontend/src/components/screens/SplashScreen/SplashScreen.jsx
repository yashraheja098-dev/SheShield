import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';
import sheShieldLogo from '../../../assets/sheshield-logo.png';

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
        <div className="splash-brand-image-container">
          <img 
            src={sheShieldLogo} 
            alt="SheShield Logo" 
            className="splash-brand-image" 
          />
        </div>
        <p className="splash-tagline">Navigate Safer. Stay Connected.</p>
      </div>
      
      <div className="splash-loader" />
    </div>
  );
};

export default SplashScreen;
