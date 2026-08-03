import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchMyBookings,
  cancelBooking,
  selectMyBookings,
  selectBookingLoading,
} from '../../features/bookings/bookingSlice';

const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const CustomerBookingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bookings = useSelector(selectMyBookings);
  const isLoading = useSelector(selectBookingLoading);

  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, cancelled

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const now = new Date();

  // Filter bookings by active tab
  const filteredBookings = (bookings || []).filter((b) => {
    const isCancelled = b.bookingStatus === 'cancelled' || b.bookingStatus === 'refunded';
    const eventDate = b.event?.date?.start ? new Date(b.event.date.start) : now;

    if (activeTab === 'cancelled') {
      return isCancelled;
    }
    if (activeTab === 'past') {
      return !isCancelled && eventDate < now;
    }
    // upcoming
    return !isCancelled && eventDate >= now;
  });

  const handleCancelOrder = async (id, title) => {
    if (window.confirm(`Are you sure you want to cancel your pass for "${title || 'this event'}"? Seats will be returned to inventory.`)) {
      await dispatch(cancelBooking(id));
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'TBD';

  return (
    <div style={{ paddingTop: '5.5rem', minHeight: '100vh', background: '#f8fafc', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.375rem' }}>
              🎟️ My Ticket Passes
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9375rem' }}>
              Manage your upcoming event registrations and digital verification passes.
            </p>
          </div>
          <Link
            to="/events"
            style={{ padding: '0.75rem 1.25rem', background: '#4f46e5', color: 'white', textDecoration: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem' }}
          >
            + Browse Live Events
          </Link>
        </div>

        {/* District-style Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #cbd5e1', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
          {[
            { id: 'upcoming', label: '⏳ Upcoming Events' },
            { id: 'past', label: '🏁 Past / Completed' },
            { id: 'cancelled', label: '🚫 Cancelled & Refunded' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.625rem 1.25rem',
                background: activeTab === tab.id ? '#0f172a' : 'white',
                color: activeTab === tab.id ? 'white' : '#475569',
                border: activeTab === tab.id ? '2px solid #0f172a' : '1px solid #cbd5e1',
                borderRadius: '0.625rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List Content */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b', fontWeight: 600 }}>
            Loading your booking tickets...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '1rem', padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎫</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 800 }}>
              No {activeTab} passes found
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {activeTab === 'upcoming'
                ? "You don't have any upcoming live event tickets booked yet."
                : `You have no records in your ${activeTab} ticket history.`}
            </p>
            {activeTab === 'upcoming' && (
              <Link to="/events" style={{ padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', borderRadius: '0.75rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Explore Trending Events →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredBookings.map((b) => {
              const eventTitle = b.event?.title || 'Unnamed Event';
              const eventCity = b.event?.venue?.city || b.event?.venue?.name || 'Venue TBA';
              const isCancelled = b.bookingStatus === 'cancelled';
              const ticketCount = (b.tickets || []).reduce((sum, item) => sum + item.quantity, 0);

              return (
                <div
                  key={b._id}
                  style={{
                    background: isCancelled ? '#f1f5f9' : 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flex: '1 1 320px' }}>
                    <img
                      src={b.event?.bannerImage?.url || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&q=80'}
                      alt="Event banner"
                      style={{ width: '90px', height: '90px', borderRadius: '0.75rem', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#1e293b', color: 'white', borderRadius: '0.375rem', padding: '0.15rem 0.5rem', textTransform: 'uppercase' }}>
                          Ref: {b.bookingReference || 'DST-TICKET'}
                        </span>
                        {isCancelled && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#fee2e2', color: '#b91c1c', borderRadius: '0.375rem', padding: '0.15rem 0.5rem', textTransform: 'uppercase' }}>
                            Cancelled
                          </span>
                        )}
                        {!isCancelled && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#dcfce7', color: '#16a34a', borderRadius: '0.375rem', padding: '0.15rem 0.5rem', textTransform: 'uppercase' }}>
                            Confirmed
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.375rem' }}>
                        {eventTitle}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
                        📅 {formatDate(b.event?.date?.start)} • 📍 {eventCity}
                      </p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#334155', fontWeight: 700 }}>
                        {ticketCount} Pass{ticketCount > 1 ? 'es' : ''} • Paid {formatCurrency(b.finalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      onClick={() => navigate(`/booking/confirmation?id=${b._id}&ref=${b.bookingReference || b._id}`)}
                      style={{
                        padding: '0.625rem 1.25rem',
                        background: '#0f172a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.625rem',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'background 150ms',
                      }}
                    >
                      🎟️ View QR Pass
                    </button>

                    {activeTab === 'upcoming' && !isCancelled && (
                      <button
                        onClick={() => handleCancelOrder(b._id, eventTitle)}
                        style={{
                          padding: '0.625rem 1rem',
                          background: 'white',
                          color: '#dc2626',
                          border: '1.5px solid #fca5a5',
                          borderRadius: '0.625rem',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'background 150ms',
                        }}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBookingsPage;
