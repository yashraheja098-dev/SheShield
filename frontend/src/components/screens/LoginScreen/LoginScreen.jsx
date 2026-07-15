import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../../../services/api/axiosInstance';
import useUserStore from '../../../stores/userStore';
import sheShieldLogo from '../../../assets/sheshield-logo.png';
import './LoginScreen.css';

const LoginScreen = () => {
  const navigate = useNavigate();

  // UI State
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const setToken = useUserStore((s) => s.setToken);
  const setProfile = useUserStore((s) => s.setProfile);

  const getErrorMessage = (err, defaultMsg) => {
    if (err.response?.data) {
      const data = err.response.data;
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.map(e => e.message).join(' • ');
      }
      if (data.message && data.message !== 'Validation failed') {
        return data.message;
      }
    }
    return defaultMsg;
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      setToken(res.data.token);
      setProfile(res.data.user);
      navigate('/location');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // 1. Register the user
      await axiosInstance.post('/auth/register', { name, email, phone, password });

      // 2. Switch to login view and show success message
      setIsRegistering(false);
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setSuccessMessage('Account created successfully. Please log in.');
      setIsLoading(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccessMessage('');
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-background-glow" />

      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <div className="login-logo-container">
            <img src={sheShieldLogo} alt="SheShield Logo" className="login-brand-image" />
          </div>
          <h1 className="login-title">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="login-subtitle">
            {isRegistering ? 'Join SheShield for a safer journey.' : 'Navigate Safer. Stay Connected.'}
          </p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={isRegistering ? handleRegister : handleLogin}>

          {isRegistering && (
            <>
              <div className="login-input-group">
                <label className="login-label">Full Name</label>
                <div className="login-input-wrapper">
                  <input
                    type="text"
                    className="login-input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isRegistering}
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label className="login-label">Phone Number</label>
                <div className="login-input-wrapper">
                  <input
                    type="tel"
                    className="login-input"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={isRegistering}
                  />
                </div>
              </div>
            </>
          )}

          <div className="login-input-group">
            <label className="login-label">Email</label>
            <div className="login-input-wrapper">
              <input
                type="email"
                className="login-input"
                placeholder="Enter your email"
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

          {!isRegistering && (
            <div className="login-links">
              <button type="button" className="login-link">Forgot Password?</button>
            </div>
          )}

          {error && (
            <p style={{ color: 'var(--color-danger, #ff4d4d)', fontSize: '0.8rem', marginBottom: '0.5rem', textAlign: 'center', marginTop: isRegistering ? '1rem' : '0' }}>
              {error}
            </p>
          )}

          {successMessage && !isRegistering && (
            <p style={{ color: 'var(--color-success, #4ade80)', fontSize: '0.8rem', marginBottom: '0.5rem', textAlign: 'center' }}>
              {successMessage}
            </p>
          )}

          <div className="login-actions" style={{ marginTop: (isRegistering && !error) || (!isRegistering && !error && !successMessage) ? '1.5rem' : '0.5rem' }}>
            <button type="submit" className="login-btn-primary" disabled={isLoading}>
              {isLoading ? (isRegistering ? 'Creating Account…' : 'Signing in…') : (isRegistering ? 'Sign Up' : 'Login')}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="login-footer">
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <button type="button" className="login-link" onClick={toggleMode}>
            {isRegistering ? 'Log In' : 'Sign Up'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginScreen;
