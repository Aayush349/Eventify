import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Explore: [
      { label: 'All Events', to: '/events' },
      { label: 'Concerts', to: '/events?category=concerts' },
      { label: 'Sports', to: '/events?category=sports' },
      { label: 'Theatre', to: '/events?category=theatre' },
    ],
    Company: [
      { label: 'Careers', to: '/careers' },
      { label: 'Blog', to: '/blog' },
      { label: 'Contact', to: '/contact' },
    ],
    Support: [
      { label: 'Help Center', to: '/help' },
      { label: 'Refund Policy', to: '/refunds' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  };

  return (
    <footer
      id="main-footer"
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1535 100%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '3rem 0 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        {/* Top Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.5rem',
                color: 'white',
                marginBottom: '1rem',
              }}
            >
              <span>🎟️</span>
              <span className="gradient-text">TicketHub</span>
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '280px' }}>
              Your one-stop platform for discovering and booking tickets to the best events — concerts, sports, theatre, and more.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {['🐦', '📘', '📸', '💼'].map((icon, i) => (
                <button
                  key={i}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                style={{
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '1rem',
                }}
              >
                {category}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.9rem',
                        transition: 'color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', margin: 0 }}>
              © {currentYear} TicketHub. All rights reserved.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', margin: 0 }}>
              Made by aayush
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', transition: 'color var(--transition-fast)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
