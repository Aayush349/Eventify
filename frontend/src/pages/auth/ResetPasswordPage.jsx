import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetUserPassword, selectIsLoading } from '../../features/auth/authSlice';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectIsLoading);

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
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

    const result = await dispatch(resetUserPassword({ token, ...form }));
    if (resetUserPassword.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => navigate('/auth/login', { replace: true }), 2500);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: '#0f172a', marginBottom: '0.75rem' }}>Password Reset!</h2>
          <p style={{ color: '#64748b' }}>Redirecting you to sign in...</p>
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
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#0f172a', marginBottom: '0.5rem' }}>Set new password</h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem', marginBottom: '2rem' }}>
            Must be at least 6 characters.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '1.125rem' }}>
              <label htmlFor="reset-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>New Password</label>
              <input id="reset-password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" className="input-field" style={errors.password ? { borderColor: '#dc2626' } : {}} autoComplete="new-password" />
              {errors.password && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{errors.password}</p>}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="reset-confirm" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Confirm Password</label>
              <input id="reset-confirm" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" className="input-field" style={errors.confirmPassword ? { borderColor: '#dc2626' } : {}} autoComplete="new-password" />
              {errors.confirmPassword && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{errors.confirmPassword}</p>}
            </div>
            <button id="reset-submit-btn" type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.875rem', background: isLoading ? '#a5b4fc' : '#4f46e5', color: 'white', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
