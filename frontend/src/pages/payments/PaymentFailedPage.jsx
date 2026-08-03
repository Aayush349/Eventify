import { useNavigate, useLocation } from 'react-router-dom';

function PaymentFailedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking } = location.state || {};

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '85vh', padding: '4rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#1e293b', border: '2px solid #ef4444', borderRadius: '8px', padding: '3rem 2rem', maxWidth: '600px', width: '100%', color: '#ffffff', textAlign: 'center' }}>
        
        <div style={{ width: '80px', height: '80px', backgroundColor: '#450a0a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '4px solid #ef4444', fontSize: '2.5rem', color: '#ef4444', fontWeight: 'bold' }}>
          ✕
        </div>
        
        <span style={{ backgroundColor: '#ef4444', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '4px', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '1px' }}>
          SIMULATED DECLINE • TEST RECORDED
        </span>

        <h1 style={{ fontSize: '2rem', margin: '1rem 0 0.5rem 0', fontWeight: '800', color: '#fca5a5' }}>
          Payment Unsuccessful
        </h1>
        
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          Your transaction evaluation was intentionally terminated as a declined or timed-out bank verification. Your reserved seats remain temporarily protected in your cart draft!
        </p>

        <div style={{ backgroundColor: '#0f172a', border: '1px solid #475569', padding: '1.25rem', borderRadius: '6px', textAlign: 'left', marginBottom: '2rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontWeight: 'bold' }}>💡 Why test this screen?</p>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            This confirms our platform cleanly catches gateway failure signals, prevents issuing unverified tickets, and empowers users to retry authorization without needing to re-enter attendee details from scratch.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <button
            type="button"
            onClick={() => navigate('/payment', { state: { booking } })}
            style={{
              padding: '1rem',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1.1rem',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            🔄 RETRY PAYMENT AUTHORIZATION
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/events')}
            style={{
              padding: '0.75rem',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid #475569',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Cancel and Return to Events Directory
          </button>
        </div>

      </div>
    </div>
  );
}

export default PaymentFailedPage;
