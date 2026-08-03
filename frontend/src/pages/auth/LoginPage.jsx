import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectIsLoading } from '../../features/auth/authSlice';
import { initiateGoogleLogin } from '../../api/authAPI';

const LoginPage = ({ defaultPortal = 'customer' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoading = useSelector(selectIsLoading);

  // 'customer' or 'admin'
  const [activePortal, setActivePortal] = useState(defaultPortal);

  const [form, setForm] = useState(
    defaultPortal === 'admin'
      ? { email: 'admin@admin.com', password: 'admin123' }
      : { email: '', password: '' }
  );
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handlePortalSwitch = (portal) => {
    setActivePortal(portal);
    if (portal === 'admin') {
      setForm({ email: 'admin@admin.com', password: 'admin123' });
    } else {
      setForm({ email: '', password: '' });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const userRole = result.payload?.role || 'customer';
      if (activePortal === 'admin') {
        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userRole === 'organizer') {
          navigate('/organizer/dashboard', { replace: true });
        } else {
          // If customer logged in via admin portal, route to organizer dashboard gracefully
          navigate('/organizer/dashboard', { replace: true });
        }
      } else {
        const from = location.state?.from?.pathname || '/customer/dashboard';
        navigate(from, { replace: true });
      }
    }
  };

  const isAdminPortal = activePortal === 'admin';
  const themeColor = isAdminPortal ? '#7c3aed' : '#4f46e5';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      {/* Left Panel — Branding */}
      <div
        style={{
          flex: '0 0 45%',
          background: isAdminPortal
            ? 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
            : '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem',
          transition: 'background 0.3s ease',
        }}
        className="auth-left-panel"
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>{isAdminPortal ? '👑' : '🎟️'}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', color: 'white' }}>
            TicketHub
          </span>
        </Link>

        {isAdminPortal ? (
          <>
            <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.75rem', textAlign: 'center', marginBottom: '1rem' }}>
              Admin & Organizer Command Center
            </h2>
            <p style={{ color: '#a5b4fc', textAlign: 'center', maxWidth: '340px', lineHeight: 1.7 }}>
              Manage master event listings, moderate user permissions, monitor simulated revenue, and publish live experiences.
            </p>
            <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '320px' }}>
              {[
                { icon: '🎪', text: 'Create & Edit Event Listings' },
                { icon: '👥', text: 'User Access & Role Governance' },
                { icon: '📈', text: 'Real-Time Ticketing Analytics' },
              ].map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem', width: '32px', textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ color: '#cbd5e1', fontSize: '0.9375rem' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.75rem', textAlign: 'center', marginBottom: '1rem' }}>
              Book experiences you'll never forget.
            </h2>
            <p style={{ color: '#94a3b8', textAlign: 'center', maxWidth: '320px', lineHeight: 1.7 }}>
              Join millions of attendees discovering concerts, sports, theatre, and EDM festivals all in one place.
            </p>
            <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '320px' }}>
              {[
                { icon: '🔒', text: 'Secure Token Authentication' },
                { icon: '⚡', text: 'Instant Pass Issuance' },
                { icon: '📱', text: 'Digital QR Tickets on Phone' },
              ].map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem', width: '32px', textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ color: '#cbd5e1', fontSize: '0.9375rem' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right Panel — Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {/* Portal Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#e2e8f0',
            padding: '0.25rem',
            borderRadius: '0.85rem',
            marginBottom: '2rem'
          }}>
            <button
              type="button"
              onClick={() => handlePortalSwitch('customer')}
              style={{
                padding: '0.65rem 0.5rem',
                border: 'none',
                borderRadius: '0.65rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: !isAdminPortal ? '#ffffff' : 'transparent',
                color: !isAdminPortal ? '#4f46e5' : '#64748b',
                boxShadow: !isAdminPortal ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <span>🎟️</span> Customer Portal
            </button>

            <button
              type="button"
              onClick={() => handlePortalSwitch('admin')}
              style={{
                padding: '0.65rem 0.5rem',
                border: 'none',
                borderRadius: '0.65rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: isAdminPortal ? '#ffffff' : 'transparent',
                color: isAdminPortal ? '#7c3aed' : '#64748b',
                boxShadow: isAdminPortal ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <span>👑</span> Admin / Organizer
            </button>
          </div>

          {/* Portal Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '0.35rem', color: '#0f172a', fontWeight: 800 }}>
              {isAdminPortal ? 'Admin & Organizer Login' : 'Customer Sign In'}
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
              {isAdminPortal
                ? 'Sign in with your organizer or administrator credentials to manage events & settings.'
                : 'Sign in to browse live events, purchase passes, and view your digital tickets.'}
            </p>
          </div>

          {/* Google Login (Shown for Customer Portal) */}
          {!isAdminPortal && (
            <>
              <button
                id="google-login-btn"
                type="button"
                onClick={initiateGoogleLogin}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  marginBottom: '1.5rem',
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#f8f7ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ color: '#94a3b8', fontSize: '0.8125rem', fontWeight: 500 }}>or sign in with email</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                {isAdminPortal ? 'Admin / Organizer Email' : 'Customer Email Address'}
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={isAdminPortal ? 'admin@tickethub.com' : 'you@example.com'}
                className="input-field"
                style={errors.email ? { borderColor: '#dc2626' } : {}}
                autoComplete="email"
              />
              {errors.email && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor="login-password" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  Password
                </label>
                <Link to="/auth/forgot-password" style={{ fontSize: '0.8125rem', color: themeColor, fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingRight: '3rem', ...(errors.password ? { borderColor: '#dc2626' } : {}) }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.125rem' }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: isLoading ? '#a5b4fc' : themeColor,
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background 150ms',
                marginTop: '0.5rem',
              }}
            >
              {isLoading
                ? 'Authenticating...'
                : isAdminPortal
                ? 'Sign In to Command Center'
                : 'Sign In to Customer Account'}
            </button>
          </form>

          {/* Footer Toggle Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            {isAdminPortal ? (
              <p>
                Need an Organizer or Admin account?{' '}
                <Link to="/auth/register" state={{ portal: 'admin' }} style={{ color: '#7c3aed', fontWeight: 700 }}>
                  Register as Organizer
                </Link>
              </p>
            ) : (
              <p>
                New to TicketHub?{' '}
                <Link to="/auth/register" style={{ color: '#4f46e5', fontWeight: 600 }}>
                  Create Customer Account
                </Link>
              </p>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
