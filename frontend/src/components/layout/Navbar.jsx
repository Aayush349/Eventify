import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser, logoutUser } from '../../features/auth/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await dispatch(logoutUser());
    navigate('/', { replace: true });
  };

  const getDashboardPath = () => {
    if (!user) return '/customer/dashboard';
    return `/${user.role}/dashboard`;
  };

  const navLinks = [
    { label: 'Events', to: '/events' },
  ];

  const navStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 1020,
    transition: 'all 250ms ease',
    background: isScrolled ? 'rgba(15, 18, 41, 0.96)' : 'transparent',
    backdropFilter: isScrolled ? 'blur(20px)' : 'none',
    borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
    padding: isScrolled ? '0.625rem 0' : '1.125rem 0',
  };

  return (
    <nav id="main-navbar" style={navStyle}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

        {/* Logo */}
        <Link to="/" id="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.375rem', color: 'white', flexShrink: 0 }}>
          <span>🎟️</span>
          <span>TicketHub</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }} className="desktop-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              id={`nav-${link.label.toLowerCase()}`}
              style={({ isActive }) => ({
                padding: '0.5rem 0.875rem',
                borderRadius: '0.5rem',
                fontWeight: 500,
                fontSize: '0.9375rem',
                color: isActive ? 'white' : 'rgba(255,255,255,0.72)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 150ms',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Auth Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated && user ? (
            /* User Dropdown */
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                id="nav-user-menu"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '9999px',
                  padding: '0.375rem 0.875rem 0.375rem 0.375rem',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  color: 'white',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                {/* Avatar */}
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', color: 'white', flexShrink: 0 }}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name?.split(' ')[0]}
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>▾</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  minWidth: '200px',
                  overflow: 'hidden',
                  zIndex: 1100,
                }}>
                  {/* User Info */}
                  <div style={{ padding: '1rem 1rem 0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', marginBottom: '0.125rem' }}>{user.name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  {(user.role === 'admin' || user.role === 'organizer'
                    ? [
                        { icon: '📊', label: 'Admin Dashboard', to: '/admin/dashboard' },
                        { icon: '✨', label: 'Create New Event', to: '/admin/events/create' },
                        { icon: '🎪', label: 'Manage Events', to: '/admin/events' },
                        { icon: '📡', label: 'Gate QR Scanner', to: '/admin/verify' },
                        { icon: '👥', label: 'User Governance', to: '/admin/users' },
                        { icon: '👤', label: 'My Profile', to: '/customer/profile' },
                        { icon: '📋', label: 'My Bookings', to: '/customer/bookings' },
                      ]
                    : [
                        { icon: '📊', label: 'Dashboard', to: getDashboardPath() },
                        { icon: '👤', label: 'My Profile', to: '/customer/profile' },
                        { icon: '📋', label: 'My Bookings', to: '/customer/bookings' },
                      ]
                  ).map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      id={`dropdown-${item.label.toLowerCase().replace(/ /g, '-')}`}
                      onClick={() => setIsDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem', color: '#374151', fontSize: '0.875rem', fontWeight: 500, transition: 'background 150ms' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span>{item.icon}</span> {item.label}
                    </Link>
                  ))}

                  {/* Logout */}
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.375rem' }}>
                    <button
                      id="nav-logout-btn"
                      onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.625rem', color: '#dc2626', fontSize: '0.875rem', fontWeight: 600, background: 'transparent', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', transition: 'background 150ms', textAlign: 'left' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/auth/login"
                id="nav-login"
                style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: '0.9375rem', padding: '0.5rem 0.75rem', transition: 'color 150ms' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
              >
                Sign In
              </Link>
              <Link
                to="/auth/register"
                id="nav-register"
                style={{ padding: '0.5rem 1.125rem', background: '#4f46e5', color: 'white', borderRadius: '0.625rem', fontWeight: 600, fontSize: '0.9375rem', transition: 'background 150ms' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#3730a3'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#4f46e5'; }}
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Hamburger */}
          <button
            id="nav-hamburger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-btn"
            style={{ display: 'none', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', color: 'white', fontSize: '1.25rem', cursor: 'pointer' }}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={{ background: 'rgba(15, 18, 41, 0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1rem' }}>
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500, borderRadius: '0.5rem', marginBottom: '0.25rem' }}>
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
              Sign Out
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <Link to="/auth/login" style={{ flex: 1, textAlign: 'center', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '0.75rem', fontWeight: 600 }} onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/auth/register" style={{ flex: 1, textAlign: 'center', padding: '0.75rem', background: '#4f46e5', color: 'white', borderRadius: '0.75rem', fontWeight: 600 }} onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
