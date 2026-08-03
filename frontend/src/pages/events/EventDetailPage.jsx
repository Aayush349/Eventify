import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventById, selectCurrentEvent, selectRelatedEvents, selectDetailLoading, clearCurrentEvent } from '../../features/events/eventSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import EventCard from '../../components/events/EventCard';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
const formatCurrency = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const STATUS_BADGE = {
  published: { bg: '#dcfce7', color: '#14532d', label: 'Live' },
  cancelled:  { bg: '#fee2e2', color: '#7f1d1d', label: 'Cancelled' },
  completed:  { bg: '#e0e7ff', color: '#1e1b4b', label: 'Completed' },
  draft:      { bg: '#f1f5f9', color: '#475569', label: 'Draft' },
};

const EventDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const event = useSelector(selectCurrentEvent);
  const related = useSelector(selectRelatedEvents);
  const isLoading = useSelector(selectDetailLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    dispatch(fetchEventById(id));
  }, [id]);

  if (isLoading) return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ height: '400px', background: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div className="container" style={{ paddingTop: '2rem' }}>
        {[80, 60, 40, 80].map((w, i) => (
          <div key={i} style={{ height: '16px', background: '#e2e8f0', borderRadius: '4px', width: `${w}%`, marginBottom: '1rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }`}</style>
    </div>
  );

  if (!event) return (
    <div style={{ paddingTop: '8rem', textAlign: 'center', minHeight: '60vh' }}>
      <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</p>
      <h2 style={{ color: '#0f172a' }}>Event not found</h2>
      <Link to="/events" style={{ color: '#4f46e5', fontWeight: 600 }}>← Back to Events</Link>
    </div>
  );

  const statusStyle = STATUS_BADGE[event.status] || STATUS_BADGE.draft;
  const minPrice = event.ticketTypes?.length
    ? Math.min(...event.ticketTypes.map((t) => t.price))
    : null;
  const totalAvailable = event.ticketTypes?.reduce((s, t) => s + t.availableSeats, 0) || 0;
  const isSoldOut = totalAvailable === 0;

  return (
    <div style={{ paddingTop: '4.5rem', minHeight: '100vh', background: '#f8fafc' }}>

      {/* Hero Banner */}
      <div style={{ height: '400px', background: '#1e293b', position: 'relative', overflow: 'hidden' }}>
        {event.bannerImage?.url ? (
          <img src={event.bannerImage.url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', opacity: 0.2 }}>🎟️</div>
        )}
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(transparent, rgba(15,23,42,0.9))' }} />
        {/* Status badge */}
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: statusStyle.bg, color: statusStyle.color, borderRadius: '9999px', padding: '0.25rem 0.875rem', fontWeight: 700, fontSize: '0.75rem' }}>
          {statusStyle.label}
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 0' }}>
        <div className="container" style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          <Link to="/" style={{ color: '#64748b' }}>Home</Link> {' › '}
          <Link to="/events" style={{ color: '#64748b' }}>Events</Link> {' › '}
          <span style={{ color: '#0f172a', fontWeight: 500 }}>{event.title}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>

          {/* LEFT COLUMN */}
          <div>
            {/* Category + Title */}
            <span style={{ display: 'inline-block', background: '#eef2ff', color: '#4f46e5', borderRadius: '9999px', padding: '0.25rem 0.875rem', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'capitalize', marginBottom: '0.75rem' }}>
              {event.category}
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', color: '#0f172a', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              {event.title}
            </h1>

            {/* Key Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { icon: '📅', label: 'Date', value: formatDate(event.date?.start) },
                { icon: '🕐', label: 'Time', value: `${formatTime(event.date?.start)} — ${formatTime(event.date?.end)}` },
                { icon: '📍', label: 'Venue', value: `${event.venue?.name || ''}, ${event.venue?.city}` },
                { icon: '👁️', label: 'Views', value: event.views?.toLocaleString('en-IN') || '0' },
              ].map((item) => (
                <div key={item.label} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.875rem' }}>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{item.icon} {item.label}</p>
                  <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                {event.tags.map((t) => (
                  <span key={t} style={{ background: '#f1f5f9', color: '#64748b', borderRadius: '9999px', padding: '0.25rem 0.75rem', fontSize: '0.8125rem', fontWeight: 500 }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', color: '#0f172a', marginBottom: '1rem' }}>About this Event</h2>
              <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{event.description}</p>
            </div>

            {/* Venue */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', color: '#0f172a', marginBottom: '0.75rem' }}>Venue</h2>
              <p style={{ fontWeight: 600, color: '#0f172a' }}>{event.venue?.name}</p>
              {event.venue?.address && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{event.venue.address}</p>}
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{event.venue?.city}, {event.venue?.state} {event.venue?.country}</p>
              {event.venue?.coordinates?.lat && (
                <a
                  href={`https://maps.google.com/?q=${event.venue.coordinates.lat},${event.venue.coordinates.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.875rem', marginTop: '0.5rem', display: 'inline-block' }}
                >
                  📌 View on Google Maps →
                </a>
              )}
            </div>

            {/* Organizer */}
            {event.organizer && (
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {event.organizer.avatar ? <img src={event.organizer.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" /> : event.organizer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Organized by</p>
                  <p style={{ fontWeight: 700, color: '#0f172a' }}>{event.organizer.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Ticket Panel (Sticky) */}
          <div style={{ position: 'sticky', top: '5.5rem' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ background: '#0f172a', padding: '1.25rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Tickets from</p>
                <p style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
                  {minPrice === 0 ? 'Free' : minPrice != null ? formatCurrency(minPrice) : 'TBA'}
                </p>
              </div>

              {/* Ticket Types */}
              <div style={{ padding: '1rem' }}>
                {event.ticketTypes?.map((t, i) => (
                  <div key={t._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i < event.ticketTypes.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div>
                      <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{t.name}</p>
                      {t.description && <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t.description}</p>}
                      <p style={{ fontSize: '0.75rem', color: t.availableSeats < 20 ? '#dc2626' : '#64748b' }}>
                        {t.availableSeats} left
                      </p>
                    </div>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      {t.price === 0 ? 'Free' : formatCurrency(t.price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
                {event.status === 'cancelled' ? (
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#fef2f2', borderRadius: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
                    This event has been cancelled
                  </div>
                ) : isSoldOut ? (
                  <button disabled style={{ width: '100%', padding: '0.875rem', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'not-allowed' }}>
                    Sold Out
                  </button>
                ) : (
                  <Link
                    to={isAuthenticated ? `/events/${id}/seats` : `/auth/login?redirect=/events/${id}/seats`}
                    id="book-now-btn"
                    style={{
                      display: 'block', textAlign: 'center', padding: '0.875rem',
                      background: '#4f46e5', color: 'white', borderRadius: '0.75rem',
                      fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#3730a3'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#4f46e5'; }}
                  >
                    Book Now →
                  </Link>
                )}
                {!isAuthenticated && event.status === 'published' && (
                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Sign in to book tickets</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Events */}
        {related?.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.25rem' }}>
              More {event.category} Events
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {related.map((r) => <EventCard key={r._id} event={r} compact />)}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
        @media (max-width: 768px) {
          .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default EventDetailPage;
