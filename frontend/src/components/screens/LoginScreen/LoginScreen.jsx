import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import './LoginScreen.css';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      navigate('/location');
    }
  };

  const handleGuest = (e) => {
    e.preventDefault();
    navigate('/location');
  };

  return (
    <div className="login-container">
      <div className="login-background-glow" />
      
      <div className="login-card">
        
        {/* Header */}
        <div className="login-header">
          <div className="login-logo-container">
            <Shield size={36} strokeWidth={2.5} />
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Navigate Safer. Stay Connected.</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleLogin}>
          
          <div className="login-input-group">
            <label className="login-label">Email or Phone</label>
            <div className="login-input-wrapper">
              <input 
                type="text"
                className="login-input"
                placeholder="Enter your email or phone"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-links">
            <button type="button" className="login-link">Forgot Password?</button>
          </div>

          <div className="login-actions">
            <button type="submit" className="login-btn-primary">
              Login
            </button>
            <button type="button" className="login-btn-secondary" onClick={handleGuest}>
              Continue as Guest
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="login-footer">
          Don't have an account? <button type="button" className="login-link">Sign Up</button>
        </div>

      </div>
    </div>
  );
};

export default LoginScreen;
