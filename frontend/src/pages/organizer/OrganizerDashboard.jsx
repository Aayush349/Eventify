import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizerEvents, publishEvent, deleteEvent, selectOrganizerEvents } from '../../features/events/eventSlice';
import { selectUser } from '../../features/auth/authSlice';

const STATUS_STYLE = {
  draft:      { bg: '#f1f5f9', color: '#475569' },
  published:  { bg: '#dcfce7', color: '#14532d' },
  cancelled:  { bg: '#fee2e2', color: '#7f1d1d' },
  completed:  { bg: '#e0e7ff', color: '#1e1b4b' },
};

const OrganizerDashboard = () => {
  const dispatch = useDispatch();
  const events = useSelector(selectOrganizerEvents);
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchOrganizerEvents({ limit: 5 }));
  }, []);

  const stats = {
    total: events.length,
    published: events.filter((e) => e.status === 'published').length,
    draft: events.filter((e) => e.status === 'draft').length,
    views: events.reduce((s, e) => s + (e.views || 0), 0),
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div style={{ paddingTop: '5.5rem', minHeight: '100vh', background: '#f8fafc', paddingBottom: '3rem' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
              Organizer Dashboard
            </h1>
            <p style={{ color: '#64748b' }}>Welcome back, {user?.name}</p>
          </div>
          <Link
            to="/organizer/events/create"
            id="create-event-btn"
            style={{ padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', borderRadius: '0.75rem', fontWeight: 700, textDecoration: 'none', fontSize: '0.9375rem' }}
          >
            + Create New Event
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Events', value: stats.total, icon: '🎟️', bg: '#eef2ff', color: '#4f46e5' },
            { label: 'Published', value: stats.published, icon: '🟢', bg: '#dcfce7', color: '#14532d' },
            { label: 'Drafts', value: stats.draft, icon: '📝', bg: '#fef9c3', color: '#713f12' },
            { label: 'Total Views', value: stats.views.toLocaleString('en-IN'), icon: '👁️', bg: '#f0f9ff', color: '#0369a1' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                <span style={{ background: s.bg, color: s.color, borderRadius: '9999px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>
                  {s.label}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Events */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', color: '#0f172a' }}>Recent Events</h2>
            <Link to="/organizer/events" style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.875rem' }}>View All →</Link>
          </div>

          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎪</div>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>No events yet. Create your first one!</p>
              <Link to="/organizer/events/create" style={{ padding: '0.625rem 1.5rem', background: '#4f46e5', color: 'white', borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                Create Event
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                    {['Event', 'Category', 'Date', 'Status', 'Views', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 5).map((event, i) => {
                    const st = STATUS_STYLE[event.status] || STATUS_STYLE.draft;
                    return (
                      <tr key={event._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.875rem 1.25rem', maxWidth: '200px' }}>
                          <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {event.title}
                          </p>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: '9999px', padding: '0.2rem 0.625rem', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                            {event.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: '#64748b', fontSize: '0.875rem' }}>
                          {formatDate(event.date?.start)}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span style={{ background: st.bg, color: st.color, borderRadius: '9999px', padding: '0.2rem 0.625rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                            {event.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: '#64748b', fontSize: '0.875rem' }}>
                          {event.views || 0}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <Link to={`/organizer/events/${event._id}/edit`} style={{ padding: '0.3rem 0.625rem', background: '#f1f5f9', color: '#374151', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                              Edit
                            </Link>
                            {event.status === 'draft' && (
                              <button onClick={() => dispatch(publishEvent(event._id))} style={{ padding: '0.3rem 0.625rem', background: '#dcfce7', color: '#14532d', border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                                Publish
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
