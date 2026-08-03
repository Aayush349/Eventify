import { useNavigate, useLocation, Link } from 'react-router-dom';

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, transaction } = location.state || {};

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '85vh', padding: '4rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#1e293b', border: '2px solid #10b981', borderRadius: '8px', padding: '3rem 2rem', maxWidth: '600px', width: '100%', color: '#ffffff', textAlign: 'center' }}>
        
        <div style={{ width: '80px', height: '80px', backgroundColor: '#065f46', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '4px solid #10b981', fontSize: '2.5rem' }}>
          ✓
        </div>
        
        <span style={{ backgroundColor: '#10b981', color: '#0f172a', padding: '0.25rem 0.75rem', borderRadius: '4px', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '1px' }}>
          PAYMENT CONFIRMED • DEMO AUDITED
        </span>

        <h1 style={{ fontSize: '2rem', margin: '1rem 0 0.5rem 0', fontWeight: '800', color: '#ffffff' }}>
          Transaction Approved!
        </h1>
        
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          Your simulated demo payment has been successfully recorded in the financial audit logs and your digital event entry pass has been generated.
        </p>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', padding: '1.25rem', borderRadius: '6px', textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Transaction ID</span>
            <span style={{ color: '#f8fafc', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {transaction?.transactionId || 'TXN-DST-989421'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Booking Reference</span>
            <span style={{ color: '#10b981', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {booking?.bookingReference || 'DST-7K9A2M'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Payment Channel</span>
            <span style={{ color: '#f8fafc' }}>{transaction?.paymentMethod || 'UPI (Demo Sandbox)'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '0.75rem' }}>
            <span style={{ color: '#cbd5e1', fontWeight: '600' }}>Amount Settled</span>
            <span style={{ color: '#10b981', fontWeight: '800', fontSize: '1.1rem' }}>
              ₹{booking?.finalAmount?.toLocaleString('en-IN') || '2,499'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <button
            type="button"
            onClick={() => navigate('/booking/confirmation', { state: { booking } })}
            style={{
              padding: '1rem',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1.1rem',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            🎟️ ACCESS DIGITAL QR ENTRY PASS
          </button>
          
          <Link
            to="/customer/bookings"
            style={{
              padding: '0.75rem',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid #475569',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '600',
            }}
          >
            View My Bookings Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}

export default PaymentSuccessPage;
