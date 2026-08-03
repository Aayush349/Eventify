import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  concerts:   { bg: '#fef3c7', color: '#92400e' },
  sports:     { bg: '#dcfce7', color: '#14532d' },
  theatre:    { bg: '#ede9fe', color: '#4c1d95' },
  comedy:     { bg: '#fce7f3', color: '#831843' },
  art:        { bg: '#dbeafe', color: '#1e3a5f' },
  standup:    { bg: '#ffedd5', color: '#7c2d12' },
  conference: { bg: '#e0f2fe', color: '#0c4a6e' },
  festival:   { bg: '#d1fae5', color: '#064e3b' },
  other:      { bg: '#f1f5f9', color: '#475569' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const EventCard = ({ event, compact = false }) => {
  if (!event) return null;

  const { _id, slug, title, category, bannerImage, date, venue, ticketTypes, views } = event;
  const link = `/events/${slug || _id}`;
  const catStyle = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  const minPrice = ticketTypes?.length
    ? Math.min(...ticketTypes.map((t) => t.price))
    : null;

  return (
    <Link
      to={link}
      id={`event-card-${_id}`}
      style={{
        display: 'block',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '1rem',
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'transform 150ms, box-shadow 150ms',
        color: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Banner Image */}
      <div style={{ position: 'relative', aspectRatio: '16/9', background: '#f1f5f9', overflow: 'hidden' }}>
        {bannerImage?.url ? (
          <img
            src={bannerImage.url}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', background: catStyle.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: compact ? '2rem' : '3rem',
          }}>
            {category === 'concerts' ? '🎵' : category === 'sports' ? '⚽' : category === 'theatre' ? '🎭' : category === 'comedy' ? '😂' : category === 'art' ? '🎨' : category === 'festival' ? '🎪' : '🎟️'}
          </div>
        )}
        {/* Category Badge */}
        <span style={{
          position: 'absolute', top: '0.625rem', left: '0.625rem',
          background: catStyle.bg, color: catStyle.color,
          borderRadius: '9999px', padding: '0.2rem 0.625rem',
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize',
        }}>
          {category}
        </span>
      </div>

      {/* Card Body */}
      <div style={{ padding: compact ? '0.875rem' : '1rem' }}>
        {/* Title */}
        <h3 style={{
          fontSize: compact ? '0.9rem' : '1rem', fontWeight: 700,
          color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {title}
        </h3>

        {/* Date */}
        {date?.start && (
          <p style={{ fontSize: '0.8125rem', color: '#4f46e5', fontWeight: 600, marginBottom: '0.25rem' }}>
            📅 {formatDate(date.start)} • {formatTime(date.start)}
          </p>
        )}

        {/* Venue */}
        {venue?.city && (
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.75rem' }}>
            📍 {venue.name ? `${venue.name}, ` : ''}{venue.city}
          </p>
        )}

        {/* Footer: price + views */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
            {minPrice === 0 ? '🎫 Free' : minPrice != null ? `From ₹${minPrice.toLocaleString('en-IN')}` : ''}
          </span>
          {views > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              👁️ {views > 1000 ? `${(views / 1000).toFixed(1)}k` : views}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
