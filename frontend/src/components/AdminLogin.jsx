import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const config = useSelector(state => state.config);

  const siteName = config.branding?.brand_name || "Sidra's Brushes N Ink";
  const tagline = config.branding?.brand_tagline || 'Management Portal';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Login attempt:', email);

      // Use raw fetch instead of axios to avoid interceptor issues
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      console.log('Fetching from:', `${apiBase}/admin/login`);

      // Create a timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${apiBase}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('Fetch completed. Status:', response.status);

      const data = await response.json();
      console.log('=== LOGIN RESPONSE ===', data);

      if (!response.ok) {
        console.error('Login failed. Response status:', response.status);
        setError(data?.message || `Login failed (${response.status})`);
        setLoading(false);
        return;
      }

      const token = data?.token;
      const user = data?.user;

      console.log('Token received:', !!token);
      console.log('User received:', !!user);

      if (token && user) {
        console.log('✅ Storing credentials');
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        console.log('✅ Credentials stored. Navigating to /admin/dashboard');
        // Use a small delay to ensure state updates
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 100);
      } else {
        console.error('Missing token or user:', { token: !!token, user: !!user });
        setError('Login failed: Missing token or user data');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.name === 'AbortError') {
        setError('Request timeout. Please check your connection.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-warm flex items-center justify-center p-4 relative overflow-hidden">
      {/* Hand-drawn Doodle Background Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url("/login-bg.jpg")',
          backgroundSize: '400px', // Proper size for doodle pattern
          backgroundRepeat: 'repeat',
        }}
      ></div>

      {/* Decorative Overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-50/30 via-transparent to-gold-calligraphy/10 pointer-events-none"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10 animate-fade-in-up">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden border border-white/50">
          {/* Header Section */}
          <div className="p-10 text-center pb-6">
            <div className="mb-6">
              <div className="inline-block p-5 bg-paper-warm rounded-full shadow-inner border border-ink-100/10">
                <svg className="w-10 h-10 text-gold-calligraphy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl font-script text-ink-900 mb-2 tracking-tight">
              {siteName}
            </h1>
            <p className="text-gold-calligraphy font-subheading uppercase tracking-[0.2em] text-xs font-bold">
              Management Portal
            </p>
          </div>

          {/* Form Section */}
          <div className="px-10 pb-10">
            <div className="w-12 h-0.5 bg-gold-calligraphy/30 mx-auto mb-8 rounded-full"></div>

            <h2 className="text-2xl font-body font-light text-ink-800 mb-8 text-center italic">
              Welcome Back
            </h2>

            {error && (
              <div className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-400 rounded-r-xl">
                <p className="text-rose-700 text-sm font-body">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="group">
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-2 px-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-ink-300 group-focus-within:text-gold-calligraphy transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 bg-paper-warm/50 border border-ink-100 rounded-2xl focus:border-gold-calligraphy focus:bg-white focus:ring-4 focus:ring-gold-calligraphy/5 transition-all outline-none font-body text-ink-900"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-2 px-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-ink-300 group-focus-within:text-gold-calligraphy transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 bg-paper-warm/50 border border-ink-100 rounded-2xl focus:border-gold-calligraphy focus:bg-white focus:ring-4 focus:ring-gold-calligraphy/5 transition-all outline-none font-body text-ink-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink-900 hover:bg-gold-calligraphy text-white font-body font-bold py-4 px-4 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(197,165,114,0.4)]"
              >
                {loading ? (
                  <span className="flex items-center justify-center tracking-widest">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    VERIFYING...
                  </span>
                ) : (
                  'SIGN IN'
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[10px] text-ink-400 font-bold uppercase tracking-widest opacity-50 underline decoration-gold-calligraphy/30 underline-offset-8">
                SECURE ACCESS ONLY
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-ink-400 font-subheading tracking-widest opacity-60">
            &copy; {new Date().getFullYear()} {siteName.toUpperCase()} &bull; HANDCRAFTED WITH CARE
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
