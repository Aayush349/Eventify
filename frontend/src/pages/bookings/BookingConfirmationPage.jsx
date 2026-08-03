import { useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import { selectCurrentBooking, fetchBookingById, selectBookingLoading } from '../../features/bookings/bookingSlice';

const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const BookingConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bookingRef = searchParams.get('ref') || searchParams.get('id');
  const booking = useSelector(selectCurrentBooking);
  const isLoading = useSelector(selectBookingLoading);

  useEffect(() => {
    // If we have an ID in URL and it doesn't match current booking in state, fetch it
    if (bookingRef && (!booking || (booking._id !== bookingRef && booking.bookingReference !== bookingRef))) {
      // Note: if bookingRef is an ObjectId, fetchById will get it directly from backend
      if (/^[0-9a-fA-F]{24}$/.test(bookingRef)) {
        dispatch(fetchBookingById(bookingRef));
      }
    }
  }, [bookingRef, booking, dispatch]);

  if (isLoading) {
    return (
      <div style={{ paddingTop: '7rem', minHeight: '100vh', background: '#f8fafc', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '1.125rem', fontWeight: 600 }}>Locating your digital ticket pass...</p>
      </div>
    );
  }

  if (!booking && !isLoading) {
    return (
      <div style={{ paddingTop: '7rem', minHeight: '80vh', textAlign: 'center', background: '#f8fafc' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontFamily: 'var(--font-display)', color: '#0f172a', marginBottom: '0.5rem' }}>Pass Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>We could not display the requested ticket pass at this time.</p>
        <Link to="/customer/bookings" style={{ padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', borderRadius: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
          View My Bookings →
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
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
    <div style={{ paddingTop: '5.5rem', minHeight: '100vh', background: '#f8fafc', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '680px', margin: '0 auto' }}>
        
        {/* Success Banner */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }} className="no-print">
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem' }}>
            ✓
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', color: '#0f172a', margin: '0 0 0.5rem', fontWeight: 800 }}>
            You're All Set! 🎉
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.0625rem', margin: 0 }}>
            We have dispatched your verified digital pass to <strong style={{ color: '#0f172a' }}>{booking.attendeeDetails?.email || 'your email'}</strong>.
          </p>
        </div>

        {/* District-style Digital Pass Card */}
        <div
          style={{
            background: 'white',
            borderRadius: '1.25rem',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
            border: '1px solid #cbd5e1',
            overflow: 'hidden',
          }}
          id="digital-pass-card"
        >
          {/* Top Header Section */}
          <div style={{ background: '#0f172a', padding: '2rem', color: 'white', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ background: '#10b981', color: 'white', borderRadius: '0.375rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Confirmed Pass
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', marginTop: '0.75rem', marginBottom: '0.375rem' }}>
                  {booking.event?.title || 'Live Event Ticket'}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9375rem', margin: 0 }}>
                  📍 {booking.event?.venue?.name}, {booking.event?.venue?.city}
                </p>
                <p style={{ color: '#e2e8f0', fontSize: '0.9375rem', fontWeight: 600, margin: '0.25rem 0 0' }}>
                  📅 {formatDate(booking.event?.date?.start)}
                </p>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', padding: '0.75rem 1rem', textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Booking Ref</p>
                <p style={{ margin: '0.25rem 0 0', fontFamily: 'var(--font-display)', fontSize: '1.1875rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.05em' }}>
                  {booking.bookingReference || 'DST-TICKET'}
                </p>
              </div>
            </div>
          </div>

          {/* Perforated Divider */}
          <div style={{ position: 'relative', height: '30px', background: 'white', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: '-15px', width: '30px', height: '30px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #cbd5e1' }} />
            <div style={{ width: '100%', borderTop: '2px dashed #cbd5e1', margin: '0 20px' }} />
            <div style={{ position: 'absolute', right: '-15px', width: '30px', height: '30px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #cbd5e1' }} />
          </div>

          {/* Ticket Stub & QR Validation Code */}
          <div style={{ padding: '0 2rem 2rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'center' }} className="ticket-stub-grid">
            <div>
              <h3 style={{ fontSize: '0.8125rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 0.75rem' }}>
                Attendee Details
              </h3>
              <p style={{ margin: '0 0 0.25rem', fontWeight: 800, color: '#0f172a', fontSize: '1.125rem' }}>
                {booking.attendeeDetails?.name || 'Authorized Attendee'}
              </p>
              <p style={{ margin: '0 0 1.25rem', color: '#475569', fontSize: '0.875rem' }}>
                📱 {booking.attendeeDetails?.phone || 'On File'} • {booking.attendeeDetails?.email}
              </p>

              <h3 style={{ fontSize: '0.8125rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 0.75rem' }}>
                Ticket Breakdown
              </h3>
              <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.875rem', border: '1px solid #e2e8f0' }}>
                {(booking.tickets || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i === (booking.tickets?.length - 1) ? 0 : '0.5rem', fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                    <span>{item.quantity} × {item.name}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #cbd5e1', marginTop: '0.75rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: '#4f46e5' }}>
                  <span>Total Paid</span>
                  <span>{formatCurrency(booking.finalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Dynamic QR Code Pass */}
            <div style={{ textAlign: 'center', background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', marginBottom: '0.75rem', display: 'inline-block' }}>
                <QRCodeSVG
                  value={`https://district-tickets.app/verify/${booking.bookingReference || booking._id}`}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  level="H"
                  includeMargin={false}
                />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                Scan for Venue Entry
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                Valid for {booking.tickets?.reduce((s, t) => s + t.quantity, 0) || 1} Person(s)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }} className="no-print">
          <button
            onClick={handlePrint}
            style={{ padding: '0.875rem 1.5rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 150ms' }}
          >
            🖨️ Download / Print Ticket
          </button>

          <Link
            to="/customer/bookings"
            style={{ padding: '0.875rem 1.5rem', background: '#4f46e5', color: 'white', textDecoration: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9375rem', transition: 'background 150ms' }}
          >
            🎟️ View All My Bookings
          </Link>

          <Link
            to="/events"
            style={{ padding: '0.875rem 1.5rem', background: 'white', color: '#0f172a', border: '1.5px solid #cbd5e1', textDecoration: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9375rem', transition: 'background 150ms' }}
          >
            Explore More Events
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 650px) {
          .ticket-stub-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
        }
        @media print {
          .no-print, header, nav, footer { display: none !important; }
          body, html { background: white !important; padding: 0 !important; }
          #digital-pass-card { box-shadow: none !important; border: 1px solid #000 !important; }
        }
      `}</style>
    </div>
  );
};

export default BookingConfirmationPage;
