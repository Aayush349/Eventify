import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendForgotPassword, selectIsLoading } from '../../features/auth/authSlice';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');

    const result = await dispatch(sendForgotPassword(email));
    if (sendForgotPassword.fulfilled.match(result)) {
      setSent(true);
      // TODO Phase 5: Use EmailJS here to send email with result.payload.resetToken
      // emailjs.send(serviceId, templateId, { to_email: email, reset_link: `${window.location.origin}/auth/reset-password/${result.payload.resetToken}` })
    }
  };

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>✅</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#0f172a', marginBottom: '0.75rem' }}>Check your email</h1>
          <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '2rem' }}>
            If an account with <strong>{email}</strong> exists, a password reset link has been sent.
          </p>
          <Link to="/auth/login" style={{ display: 'inline-block', padding: '0.75rem 2rem', background: '#4f46e5', color: 'white', borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎟️</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>TicketHub</span>
        </Link>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#0f172a', marginBottom: '0.5rem' }}>Reset your password</h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Enter your email address and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="forgot-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="input-field"
                style={error ? { borderColor: '#dc2626' } : {}}
                autoComplete="email"
              />
              {error && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{error}</p>}
            </div>

            <button
              id="forgot-submit-btn"
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', padding: '0.875rem', background: isLoading ? '#a5b4fc' : '#4f46e5', color: 'white', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            Remembered it?{' '}
            <Link to="/auth/login" style={{ color: '#4f46e5', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
