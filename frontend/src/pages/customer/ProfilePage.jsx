import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser, selectIsLoading, updateUserProfile, changeUserPassword, logoutUser } from '../../features/auth/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);

  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [activeTab, setActiveTab] = useState('profile');

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateUserProfile({ name: nameForm.name }));
  };

  const validatePw = () => {
    const errs = {};
    if (!pwForm.oldPassword) errs.oldPassword = 'Current password required';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) errs.newPassword = 'Min. 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    const result = await dispatch(changeUserPassword(pwForm));
    if (changeUserPassword.fulfilled.match(result)) {
      await dispatch(logoutUser());
      navigate('/auth/login', { replace: true });
    }
  };

  const roleBadgeColor = { admin: '#7c3aed', organizer: '#0369a1', customer: '#059669' };

  return (
    <div style={{ minHeight: '80vh', background: '#f8fafc', padding: '2rem 1rem', paddingTop: '6rem' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', color: '#0f172a', marginBottom: '0.25rem' }}>
              {user?.name}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{user?.email}</p>
            <span style={{ display: 'inline-block', background: `${roleBadgeColor[user?.role] || '#059669'}1a`, color: roleBadgeColor[user?.role] || '#059669', borderRadius: '9999px', padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.375rem' }}>
          {[{ id: 'profile', label: 'Profile' }, { id: 'password', label: 'Change Password' }].map((tab) => (
            <button key={tab.id} id={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '0.625rem 1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', background: activeTab === tab.id ? '#4f46e5' : 'transparent', color: activeTab === tab.id ? 'white' : '#64748b', transition: 'all 150ms' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#0f172a', marginBottom: '1.5rem' }}>Profile Information</h3>
            <form onSubmit={handleNameSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="profile-name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Full Name</label>
                <input id="profile-name" type="text" value={nameForm.name} onChange={(e) => setNameForm({ name: e.target.value })} className="input-field" placeholder="Your name" />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Email Address</label>
                <input type="email" value={user?.email || ''} disabled className="input-field" style={{ background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.375rem' }}>Email cannot be changed</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Avatar</label>
                <div style={{ padding: '1rem', border: '1.5px dashed #e2e8f0', borderRadius: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                  📷 Image upload available in Phase 3 (Cloudinary)
                </div>
              </div>
              <button id="profile-save-btn" type="submit" disabled={isLoading} style={{ padding: '0.75rem 2rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#0f172a', marginBottom: '0.5rem' }}>Change Password</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>After changing, you'll be logged out and need to sign in again.</p>
            {user?.googleId && !user?.password ? (
              <div style={{ padding: '1rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '0.75rem', color: '#0369a1', fontSize: '0.9rem' }}>
                ℹ️ Your account uses Google Sign-In and doesn't have a password.
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} noValidate>
                {[
                  { id: 'old-pw', name: 'oldPassword', label: 'Current Password', placeholder: '••••••••', value: pwForm.oldPassword },
                  { id: 'new-pw', name: 'newPassword', label: 'New Password', placeholder: 'Min. 6 characters', value: pwForm.newPassword },
                  { id: 'confirm-pw', name: 'confirmPassword', label: 'Confirm New Password', placeholder: '••••••••', value: pwForm.confirmPassword },
                ].map((field) => (
                  <div key={field.id} style={{ marginBottom: '1.125rem' }}>
                    <label htmlFor={field.id} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>{field.label}</label>
                    <input id={field.id} type="password" name={field.name} value={field.value} onChange={(e) => { setPwForm((f) => ({ ...f, [field.name]: e.target.value })); if (pwErrors[field.name]) setPwErrors((er) => ({ ...er, [field.name]: '' })); }} placeholder={field.placeholder} className="input-field" style={pwErrors[field.name] ? { borderColor: '#dc2626' } : {}} autoComplete="off" />
                    {pwErrors[field.name] && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{pwErrors[field.name]}</p>}
                  </div>
                ))}
                <button id="change-pw-btn" type="submit" disabled={isLoading} style={{ padding: '0.75rem 2rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
