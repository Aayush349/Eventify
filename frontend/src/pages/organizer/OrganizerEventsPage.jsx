import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizerEvents, publishEvent, deleteEvent, selectOrganizerEvents } from '../../features/events/eventSlice';

const STATUS_STYLE = {
  draft:      { bg: '#f1f5f9', color: '#475569' },
  published:  { bg: '#dcfce7', color: '#14532d' },
  cancelled:  { bg: '#fee2e2', color: '#7f1d1d' },
  completed:  { bg: '#e0e7ff', color: '#1e1b4b' },
};

const OrganizerEventsPage = () => {
  const dispatch = useDispatch();
  const events = useSelector(selectOrganizerEvents);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchOrganizerEvents({ status: statusFilter || undefined, limit: 50 }));
  }, [statusFilter]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const handleDelete = (id, title) => {
    if (window.confirm(`Cancel "${title}"? This cannot be undone.`)) {
      dispatch(deleteEvent(id));
    }
  };

  return (
    <div style={{ paddingTop: '5.5rem', minHeight: '100vh', background: '#f8fafc', paddingBottom: '3rem' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', color: '#0f172a' }}>My Events</h1>
          <Link
            to="/organizer/events/create"
            id="new-event-link"
            style={{ padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', borderRadius: '0.75rem', fontWeight: 700, textDecoration: 'none' }}
          >
            + New Event
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['', 'draft', 'published', 'cancelled', 'completed'].map((s) => (
            <button
              key={s}
              id={`status-tab-${s || 'all'}`}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '0.4rem 0.875rem', borderRadius: '9999px', border: '1.5px solid',
                borderColor: statusFilter === s ? '#4f46e5' : '#e2e8f0',
                background: statusFilter === s ? '#4f46e5' : 'white',
                color: statusFilter === s ? 'white' : '#374151',
                fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {/* Events Table */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden' }}>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎪</div>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>No events found.</p>
              <Link to="/organizer/events/create" style={{ padding: '0.625rem 1.5rem', background: '#4f46e5', color: 'white', borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Event', 'Category', 'Date', 'Status', 'Seats', 'Views', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', textAlign: 'left', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const st = STATUS_STYLE[event.status] || STATUS_STYLE.draft;
                    const totalSeats = event.ticketTypes?.reduce((s, t) => s + t.totalSeats, 0) || 0;
                    const availSeats = event.ticketTypes?.reduce((s, t) => s + t.availableSeats, 0) || 0;
                    return (
                      <tr key={event._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.875rem 1.25rem', maxWidth: '220px' }}>
                          <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {event.title}
                          </p>
                          {event.isFeatured && <span style={{ fontSize: '0.7rem', color: '#b45309', background: '#fef3c7', borderRadius: '9999px', padding: '0.1rem 0.4rem', fontWeight: 700 }}>⭐ Featured</span>}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: '9999px', padding: '0.2rem 0.625rem', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                            {event.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: '#64748b', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                          {formatDate(event.date?.start)}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span style={{ background: st.bg, color: st.color, borderRadius: '9999px', padding: '0.2rem 0.625rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                            {event.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: '#64748b', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                          {availSeats}/{totalSeats}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: '#64748b', fontSize: '0.875rem' }}>
                          {event.views || 0}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'nowrap' }}>
                            <Link to={`/organizer/events/${event._id}/edit`} style={{ padding: '0.3rem 0.625rem', background: '#f1f5f9', color: '#374151', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                              Edit
                            </Link>
                            {event.status === 'draft' && (
                              <button onClick={() => dispatch(publishEvent(event._id))} style={{ padding: '0.3rem 0.625rem', background: '#dcfce7', color: '#14532d', border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                Publish
                              </button>
                            )}
                            {event.status !== 'cancelled' && (
                              <button onClick={() => handleDelete(event._id, event.title)} style={{ padding: '0.3rem 0.625rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                Cancel
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

export default OrganizerEventsPage;
