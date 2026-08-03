import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice';
import {
  selectActiveOrder,
  selectBookingSubmitting,
  applyPromoCode,
  removePromoCode,
  createBooking,
  clearActiveOrder,
} from '../../features/bookings/bookingSlice';
import { processDemoTransaction } from '../../features/payments/paymentSlice';

const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const order = useSelector(selectActiveOrder);
  const isSubmitting = useSelector(selectBookingSubmitting);

  const [promoInput, setPromoInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI (Demo Mode)');
  const [attendee, setAttendee] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState({});

  // Protect route if no event order is loaded in draft state
  if (!order || !order.event || order.selectedTickets.length === 0) {
    return (
      <div style={{ paddingTop: '7rem', minHeight: '80vh', textAlign: 'center', background: '#f8fafc' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎟️</div>
        <h2 style={{ fontFamily: 'var(--font-display)', color: '#0f172a', marginBottom: '0.5rem' }}>No Active Ticket Order</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Please select an event and choose your tickets first.</p>
        <Link to="/events" style={{ padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', borderRadius: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
          Explore Events →
        </Link>
      </div>
    );
  }

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput.trim()) {
      dispatch(applyPromoCode(promoInput));
      setPromoInput('');
    }
  };

  const handleRemovePromo = () => {
    dispatch(removePromoCode());
  };

  const validateForm = () => {
    const errs = {};
    if (!attendee.name.trim() || attendee.name.length < 2) errs.name = 'Please enter full attendee name';
    if (!attendee.email.trim() || !/\S+@\S+\.\S+/.test(attendee.email)) errs.email = 'Valid email required for digital ticket delivery';
    if (!attendee.phone.trim() || attendee.phone.length < 8) errs.phone = 'Valid contact phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCompleteBooking = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      eventId: order.event._id,
      tickets: order.selectedTickets.map((t) => ({
        ticketTypeId: t.ticketTypeId,
        name: t.name,
        quantity: t.quantity,
      })),
      promoCode: order.promoCode,
      paymentMethod,
      attendeeDetails: attendee,
    };

    const resultAction = await dispatch(createBooking(payload));
    if (createBooking.fulfilled.match(resultAction)) {
      const confirmedOrder = resultAction.payload;
      dispatch(clearActiveOrder());

      // Automatically complete payment in the background and take user straight to digital ticket!
      await dispatch(
        processDemoTransaction({
          bookingId: confirmedOrder._id,
          paymentMethod,
          status: 'success',
          simulationDetails: { testUpiId: 'instant@tickethub.app' },
        })
      );

      navigate(`/booking/confirmation?id=${confirmedOrder._id}`, { state: { booking: confirmedOrder } });
    }
  };

  const inputStyle = (name) => ({
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.625rem',
    border: `1.5px solid ${errors[name] ? '#dc2626' : '#cbd5e1'}`,
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 150ms',
    background: 'white',
  });

  return (
    <div style={{ paddingTop: '5.5rem', minHeight: '100vh', background: '#f8fafc', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Breadcrumb Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link to={`/events/${order.event._id}/seats`} style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Modify ticket quantities
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', color: '#0f172a', marginTop: '0.5rem', marginBottom: '0.25rem', fontWeight: 800 }}>
            Checkout & Complete Booking
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>Step 2 of 2 • Confirm attendee details and complete demo transaction</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '2.5rem', alignItems: 'flex-start' }} className="checkout-grid">
          {/* LEFT: Attendee Info & Demo Payment Selection */}
          <form onSubmit={handleCompleteBooking}>
            {/* Attendee Card */}
            <div style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '1rem', padding: '1.75rem', marginBottom: '1.75rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#0f172a', marginTop: 0, marginBottom: '1.25rem', fontWeight: 800 }}>
                👤 Attendee Information
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Your digital QR ticket passes and event reminders will be issued to these contact details.
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, color: '#334155', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Full Name *</label>
                <input
                  type="text"
                  value={attendee.name}
                  onChange={(e) => setAttendee({ ...attendee, name: e.target.value })}
                  placeholder="e.g., Rohan Sharma"
                  style={inputStyle('name')}
                />
                {errors.name && <p style={{ color: '#dc2626', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>{errors.name}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, color: '#334155', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Email Address *</label>
                  <input
                    type="email"
                    value={attendee.email}
                    onChange={(e) => setAttendee({ ...attendee, email: e.target.value })}
                    placeholder="rohan@example.com"
                    style={inputStyle('email')}
                  />
                  {errors.email && <p style={{ color: '#dc2626', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>{errors.email}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, color: '#334155', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    value={attendee.phone}
                    onChange={(e) => setAttendee({ ...attendee, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    style={inputStyle('phone')}
                  />
                  {errors.phone && <p style={{ color: '#dc2626', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Demo Payment Gateway Selection */}
            <div style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '1rem', padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#0f172a', margin: 0, fontWeight: 800 }}>
                  💳 Payment Method
                </h2>
                <span style={{ background: '#dcfce7', color: '#14532d', borderRadius: '0.375rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  Demo Mode Active 🟢
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                No actual bank cards or real currency required! Select a mock payment gateway option below to instantly issue your confirmed passes.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { id: 'UPI (Demo Mode)', label: '📱 Instant UPI (GPay, PhonePe, Paytm)', desc: 'Simulated QR payment check' },
                  { id: 'Credit/Debit Card (Demo)', label: '💳 Credit / Debit Card', desc: 'Mock Visa/Mastercard processing' },
                  { id: 'NetBanking (Demo)', label: '🏦 Net Banking & Wallets', desc: 'Direct mock confirmation' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      border: paymentMethod === opt.id ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      borderRadius: '0.75rem',
                      background: paymentMethod === opt.id ? '#f8fafc' : 'white',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                id="complete-booking-btn"
                style={{
                  width: '100%',
                  marginTop: '1.75rem',
                  padding: '1rem',
                  background: isSubmitting ? '#94a3b8' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1.0625rem',
                  fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  transition: 'background 150ms',
                }}
              >
                {isSubmitting ? 'Processing Demo Transaction...' : `✅ Confirm & Pay ${formatCurrency(order.finalTotal)}`}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem', marginBottom: 0 }}>
                🔒 Secure District ticketing protocol • Instant digital delivery
              </p>
            </div>
          </form>

          {/* RIGHT: Order Summary Card */}
          <div style={{ position: 'sticky', top: '6rem' }}>
            <div style={{ background: '#0f172a', color: 'white', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem', padding: '1.5rem' }}>
              <span style={{ background: '#334155', color: '#f8fafc', borderRadius: '0.375rem', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                Event Summary
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, margin: '0.5rem 0 0.25rem', color: 'white' }}>
                {order.event.title}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                📍 {order.event.venue?.name}, {order.event.venue?.city}
              </p>
            </div>

            <div style={{ background: 'white', border: '1px solid #cbd5e1', borderTop: 'none', borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem', padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 0, marginBottom: '1rem' }}>
                Selected Passes
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
                {order.selectedTickets.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                        {item.quantity} × {item.name}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatCurrency(item.price)} each</div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Subtotal</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(order.subtotal)}</span>
                </div>

                {order.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: '#10b981' }}>
                    <span>
                      Coupon ({order.promoCode})
                      <button onClick={handleRemovePromo} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', marginLeft: '0.375rem', fontSize: '0.75rem', fontWeight: 700 }}>
                        [remove]
                      </button>
                    </span>
                    <span style={{ fontWeight: 800 }}>−{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #cbd5e1' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1875rem', fontWeight: 800, color: '#0f172a' }}>Total Due</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: '#4f46e5' }}>
                    {formatCurrency(order.finalTotal)}
                  </span>
                </div>
              </div>

              {/* Promo Code Coupon Section */}
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.8125rem' }}>🏷️ Apply Promo Code</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="e.g. DISTRICT10"
                    style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                  />
                  <button
                    onClick={handleApplyPromo}
                    type="button"
                    style={{ padding: '0.5rem 1rem', background: '#334155', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Apply
                  </button>
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Try <strong style={{ color: '#4f46e5' }}>DISTRICT10</strong> for 10% off or <strong style={{ color: '#4f46e5' }}>WELCOME500</strong> for ₹500 off on ₹1,200+.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 850px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
