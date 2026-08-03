import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchAllUsers, updateUserRole, clearAdminMessages } from '../../features/admin/adminSlice';

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function AdminUsersPage() {
  const dispatch = useDispatch();
  const { users, loading, error, actionSuccess } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllUsers({ search: searchTerm }));
  }, [dispatch, searchTerm]);

  const handleRoleChange = (userId, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to '${newRole.toUpperCase()}'?`)) {
      dispatch(updateUserRole({ id: userId, role: newRole }));
    }
  };

  return (
    <div style={{ overflowX: 'hidden', background: 'var(--color-surface-2)', minHeight: '100vh' }}>
      
      {/* ──── Hero Banner Section ──────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '6rem',
          paddingBottom: '5rem',
        }}
      >
        {/* Animated ambient glowing orbs */}
        <div style={{
          position: 'absolute', width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)',
          top: '-80px', right: '8%', animation: 'orbFloat 9s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: '380px', height: '380px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          bottom: '-60px', left: '4%', animation: 'orbFloat 11s ease-in-out infinite reverse',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Pill Badge */}
            <motion.div variants={fadeUp}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#fcd34d', borderRadius: '9999px', padding: '0.375rem 1.25rem',
                fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                marginBottom: '1.25rem', backdropFilter: 'blur(4px)'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', animation: 'pulse 2s infinite' }} />
                Admin User Governance
              </span>
            </motion.div>

            {/* Title & Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
              <motion.div variants={fadeUp} style={{ maxWidth: '680px' }}>
                <h1 style={{ color: '#ffffff', fontSize: '2.65rem', marginBottom: '0.85rem', fontWeight: 800, lineHeight: 1.15 }}>
                  User Account &{' '}
                  <span className="gradient-text">Access Management</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', margin: 0, lineHeight: 1.6 }}>
                  Inspect registered members, monitor signups, and securely elevate user access privileges to Organizer or Admin supervisor roles.
                </p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Link
                  to="/admin/dashboard"
                  className="btn btn-lg"
                  style={{
                    background: 'rgba(255,255,255,0.12)', color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)',
                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none',
                    fontWeight: 700
                  }}
                >
                  <span>←</span> Back to Dashboard
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Wave separator */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
            <path d="M0 60L480 15L960 45L1440 0V60H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ──── Users Governance Section ─────────────────────────────────── */}
      <section className="section" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <div className="container">

          {actionSuccess && (
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
              <span>✅ {actionSuccess}</span>
              <button type="button" onClick={() => dispatch(clearAdminMessages())} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>✕</button>
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '2rem', fontWeight: 600 }}>
              ⚠️ {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          {/* Search Input Box */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            style={{ marginBottom: '2.5rem' }}
          >
            <div style={{ position: 'relative', maxWidth: '600px' }}>
              <input
                type="text"
                placeholder="🔍 Search accounts by name or email address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1.1rem 1.5rem 1.1rem 3rem',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  color: '#0f172a',
                  borderRadius: '9999px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  outline: 'none',
                  boxShadow: '0 4px 15px -2px rgba(0,0,0,0.05)',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = '0 4px 15px -2px rgba(0,0,0,0.05)'; }}
              />
              <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', opacity: 0.6 }}>
                🔍
              </span>
            </div>
          </motion.div>

          {/* Table Container Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>👥</span> Registered Users Directory
              </h3>
              <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #e2e8f0' }}>
                Total Directory • {users?.length || 0} Accounts
              </span>
            </div>

            {loading && !users.length ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
                <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Fetching registered users table...</p>
              </div>
            ) : !users.length ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <p style={{ color: '#475569', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>No accounts found matching your query.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                      <th style={{ padding: '1.25rem 2rem' }}>User Full Name</th>
                      <th style={{ padding: '1.25rem 1.5rem' }}>Email Address</th>
                      <th style={{ padding: '1.25rem 1.5rem' }}>Current Role</th>
                      <th style={{ padding: '1.25rem 1.5rem' }}>Registration Date</th>
                      <th style={{ padding: '1.25rem 2rem' }}>Action (Change Access Role)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => {
                      const isAdmin = user.role === 'admin';
                      const isOrg = user.role === 'organizer';
                      return (
                        <tr
                          key={user._id}
                          style={{
                            borderBottom: idx === users.length - 1 ? 'none' : '1px solid #f1f5f9',
                            backgroundColor: '#ffffff',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                        >
                          <td style={{ padding: '1.5rem 2rem', fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                            {user.name}
                          </td>
                          <td style={{ padding: '1.5rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>
                            {user.email}
                          </td>
                          <td style={{ padding: '1.5rem 1.5rem' }}>
                            <span style={{
                              backgroundColor: isAdmin ? '#fef2f2' : isOrg ? '#ecfdf5' : '#e0e7ff',
                              color: isAdmin ? '#b91c1c' : isOrg ? '#047857' : '#3730a3',
                              padding: '0.35rem 0.85rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              border: `1px solid ${isAdmin ? '#fca5a5' : isOrg ? '#6ee7b7' : '#a5b4fc'}`
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: '1.5rem 1.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                            {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td style={{ padding: '1.5rem 2rem' }}>
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              style={{
                                padding: '0.6rem 1rem',
                                backgroundColor: '#f8fafc',
                                border: '1.5px solid #cbd5e1',
                                color: '#0f172a',
                                borderRadius: '0.6rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                fontSize: '0.9rem'
                              }}
                              onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                              onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                            >
                              <option value="customer">Customer (Standard Member)</option>
                              <option value="organizer">Organizer (Event Host)</option>
                              <option value="admin">Admin (System Supervisor)</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

        </div>
      </section>
    </div>
  );
}

export default AdminUsersPage;
