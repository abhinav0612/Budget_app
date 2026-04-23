import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = isLogin ? 'https://budget-app-1-6ias.onrender.com/login' : 'https://budget-app-1-6ias.onrender.com/register';
      const payload = isLogin ? { email: formData.email, password: formData.password } : formData;
      const response = await axios.post(url, payload);
      
      if (response.data && response.data.userId) {
        localStorage.setItem('userId', response.data.userId);
        navigate('/dashboard');
      } else {
        alert('Authentication succeeded but userId missing in response.');
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background Shapes */}
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>
      
      <div className="auth-glass-panel">
        {/* Left Side Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="logo-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1>Budget Advisor</h1>
            <p>Manage your finances smartly</p>
            <div className="branding-visual">
              <div className="glass-card mock-card-1"></div>
              <div className="glass-card mock-card-2"></div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="auth-form-section">
          <div className={`form-transition-wrapper ${isLogin ? 'is-login' : 'is-register'}`}>
            <h2 className="fade-in-up">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="auth-subtitle fade-in-up delay-1">{isLogin ? 'Please enter your details to sign in.' : 'Join us to start managing your budget.'}</p>
            
            <form onSubmit={handleSubmit} className="fade-in-up delay-2">
              {!isLogin && (
                <div className="auth-input-group">
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required={!isLogin} 
                    placeholder="Full Name"
                    className="floating-input"
                  />
                </div>
              )}
              
              <div className="auth-input-group">
                <div className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="Email Address"
                  className="floating-input"
                />
              </div>
              
              <div className="auth-input-group">
                <div className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  placeholder="Password"
                  className="floating-input"
                />
              </div>
              
              <button type="submit" disabled={isLoading} className="gradient-btn">
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  isLogin ? 'Sign In' : 'Sign Up'
                )}
              </button>
            </form>
            
            <p className="toggle-text fade-in-up delay-3">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="toggle-btn" 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: '', email: '', password: '' });
                }}
              >
                {isLogin ? "Register here" : "Login here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
