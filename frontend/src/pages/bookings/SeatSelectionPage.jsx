import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventById, selectCurrentEvent, selectDetailLoading } from '../../features/events/eventSlice';
import { setActiveOrder } from '../../features/bookings/bookingSlice';

const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const SeatSelectionPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const event = useSelector(selectCurrentEvent);
  const isLoading = useSelector(selectDetailLoading);

  // Map ticketTypeId -> quantity selected
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (!event || (event._id !== id && event.slug !== id)) {
      dispatch(fetchEventById(id));
    }
  }, [id, event, dispatch]);

  if (isLoading || !event) {
    return (
      <div style={{ paddingTop: '6rem', minHeight: '100vh', background: '#f8fafc', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '1.125rem', fontWeight: 600 }}>Loading ticket tiers...</p>
      </div>
    );
  }

  const handleQtyChange = (tierId, delta, maxAvailable) => {
    setQuantities((prev) => {
      const current = prev[tierId] || 0;
      const next = Math.max(0, Math.min(maxAvailable, Math.min(10, current + delta)));
      return { ...prev, [tierId]: next };
    });
  };

  const selectedTickets = (event.ticketTypes || [])
    .filter((tier) => (quantities[tier._id] || 0) > 0)
    .map((tier) => ({
      ticketTypeId: tier._id.toString(),
      name: tier.name,
      price: tier.price,
      quantity: quantities[tier._id],
      availableSeats: tier.availableSeats,
      description: tier.description,
    }));

  const totalQty = selectedTickets.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = selectedTickets.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProceed = () => {
    if (totalQty === 0) return;
    dispatch(
      setActiveOrder({
        event: {
          _id: event._id,
          title: event.title,
          slug: event.slug,
          bannerImage: event.bannerImage,
          date: event.date,
          venue: event.venue,
          category: event.category,
        },
        selectedTickets,
      })
    );
    navigate('/checkout');
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

  return (
    <div style={{ paddingTop: '4.5rem', minHeight: '100vh', background: '#f8fafc', paddingBottom: '7rem' }}>
      {/* District-style Dark Header */}
      <div style={{ background: '#0f172a', padding: '2.5rem 0', color: 'white' }}>
        <div className="container">
          <Link
            to={`/events/${event.slug || event._id}`}
            style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: '0.75rem' }}
          >
            ← Back to Event
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ background: '#334155', color: '#e2e8f0', borderRadius: '0.375rem', padding: '0.25rem 0.625rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step 1 of 2 • Select Tickets
              </span>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: 'white', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                {event.title}
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9375rem', margin: 0 }}>
                📍 {event.venue?.name}, {event.venue?.city} • 📅 {formatDate(event.date?.start)}
              </p>
            </div>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem 1.25rem' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Order Limit</p>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Max 10 passes per tier</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Tier Cards */}
      <div className="container" style={{ maxWidth: '800px', margin: '2.5rem auto 0' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.25rem', fontWeight: 800 }}>
          Choose Ticket Tiers
        </h2>

        {(!event.ticketTypes || event.ticketTypes.length === 0) ? (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', margin: 0, fontWeight: 600 }}>No ticket tiers are currently open for this event.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {event.ticketTypes.map((tier) => {
              const qty = quantities[tier._id] || 0;
              const isSoldOut = tier.availableSeats === 0;

              return (
                <div
                  key={tier._id}
                  style={{
                    background: isSoldOut ? '#f1f5f9' : 'white',
                    border: qty > 0 ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1.5rem',
                    transition: 'all 150ms ease',
                    boxShadow: qty > 0 ? '0 8px 20px rgba(79, 70, 229, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                    opacity: isSoldOut ? 0.7 : 1,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                      <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {tier.name}
                      </h3>
                      {tier.availableSeats > 0 && tier.availableSeats <= 15 && (
                        <span style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: '0.375rem', padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>
                          ⚡ Only {tier.availableSeats} Left!
                        </span>
                      )}
                      {isSoldOut && (
                        <span style={{ background: '#cbd5e1', color: '#334155', borderRadius: '0.375rem', padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          Sold Out
                        </span>
                      )}
                    </div>

                    <p style={{ color: '#475569', fontSize: '0.875rem', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                      {tier.description || 'Standard entry access for one attendee.'}
                    </p>

                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>
                      {tier.price === 0 ? 'Free Entry' : formatCurrency(tier.price)}
                    </span>
                    {tier.price > 0 && <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.375rem' }}>+ applicable demo taxes</span>}
                  </div>

                  {/* Quantity Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isSoldOut ? (
                      <button disabled style={{ background: '#e2e8f0', color: '#64748b', border: 'none', borderRadius: '0.5rem', padding: '0.625rem 1.25rem', fontWeight: 700, cursor: 'not-allowed' }}>
                        Closed
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleQtyChange(tier._id, -1, tier.availableSeats)}
                          disabled={qty === 0}
                          aria-label={`Decrease ${tier.name} quantity`}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '0.5rem',
                            border: '1.5px solid #cbd5e1',
                            background: qty === 0 ? '#f8fafc' : 'white',
                            color: qty === 0 ? '#cbd5e1' : '#0f172a',
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            cursor: qty === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 100ms',
                          }}
                        >
                          −
                        </button>

                        <span style={{ width: '32px', textAlign: 'center', fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>
                          {qty}
                        </span>

                        <button
                          onClick={() => handleQtyChange(tier._id, 1, tier.availableSeats)}
                          disabled={qty >= tier.availableSeats || qty >= 10}
                          aria-label={`Increase ${tier.name} quantity`}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '0.5rem',
                            border: '1.5px solid #cbd5e1',
                            background: (qty >= tier.availableSeats || qty >= 10) ? '#f8fafc' : 'white',
                            color: (qty >= tier.availableSeats || qty >= 10) ? '#cbd5e1' : '#0f172a',
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            cursor: (qty >= tier.availableSeats || qty >= 10) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 100ms',
                          }}
                        >
                          +
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* District-style Bottom Sticky Action Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #cbd5e1',
          padding: '1rem 0',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
          zIndex: 40,
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
              {totalQty === 0 ? 'No tickets selected yet' : `${totalQty} pass${totalQty > 1 ? 'es' : ''} selected`}
            </p>
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {formatCurrency(subtotal)}
            </p>
          </div>

          <button
            onClick={handleProceed}
            disabled={totalQty === 0}
            id="proceed-to-checkout"
            style={{
              padding: '0.875rem 2rem',
              background: totalQty === 0 ? '#cbd5e1' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: totalQty === 0 ? 'not-allowed' : 'pointer',
              transition: 'background 150ms',
              boxShadow: totalQty > 0 ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
            }}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
