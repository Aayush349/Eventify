import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyAttendeePass, resetScannerResult } from '../../features/admin/adminSlice';

function OrganizerTicketScannerPage() {
  const dispatch = useDispatch();
  const { scannerResult, scannerError, loading } = useSelector((state) => state.admin);

  const [referenceInput, setReferenceInput] = useState('');

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!referenceInput.trim()) return;
    dispatch(resetScannerResult());
    dispatch(verifyAttendeePass(referenceInput.trim()));
  };

  const handleClear = () => {
    setReferenceInput('');
    dispatch(resetScannerResult());
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '88vh', padding: '3rem 1rem', color: '#ffffff' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#1e293b', border: '2px solid #4f46e5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ backgroundColor: '#4f46e5', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>
              DISTRICT VENUE GATE TERMINAL
            </span>
            <h1 style={{ fontSize: '1.8rem', margin: '0.5rem 0 0.25rem 0', fontWeight: '800' }}>
              QR Ticket Pass Verification
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
              Scan or enter customer booking reference IDs (e.g., DST-XXXXXX) at stadium entrances to authorize entry and prevent doublecheck-ins.
            </p>
          </div>
        </div>

        {/* Input Terminal Box */}
        <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '8px', border: '1px solid #334155', marginBottom: '2rem' }}>
          <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ color: '#f8fafc', fontWeight: '700', fontSize: '1.1rem' }}>
              🔍 Enter Ticket Reference Code or Scan Barcode String
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Paste reference code (e.g. DST-8X4N9M)..."
                value={referenceInput}
                onChange={(e) => setReferenceInput(e.target.value.toUpperCase())}
                style={{
                  flex: '1 1 300px',
                  padding: '1rem',
                  backgroundColor: '#0f172a',
                  border: '2px solid #475569',
                  color: '#10b981',
                  borderRadius: '6px',
                  fontSize: '1.2rem',
                  fontFamily: 'monospace',
                  fontWeight: '700',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={loading || !referenceInput}
                style={{
                  padding: '0 2rem',
                  backgroundColor: loading ? '#475569' : '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1.05rem',
                  fontWeight: '800',
                  cursor: loading ? 'wait' : 'pointer',
                  minHeight: '52px',
                }}
              >
                {loading ? '⏳ SCANNING...' : '⚡ AUTHORIZE ENTRY'}
              </button>
            </div>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>
              💡 Hint: You can find valid reference codes inside any confirmed order on the Customer Bookings page!
            </p>
          </form>
        </div>

        {/* Verification Outcome Cards */}
        {scannerResult && (
          <div style={{ backgroundColor: '#064e3b', border: '3px solid #10b981', borderRadius: '8px', padding: '2rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ backgroundColor: '#10b981', color: '#0f172a', display: 'inline-block', padding: '0.4rem 1.25rem', borderRadius: '50px', fontWeight: '900', fontSize: '1rem', marginBottom: '1rem', letterSpacing: '1px' }}>
              ✅ GATE ENTRY APPROVED • CHECK-IN LOGGED
            </div>
            <h2 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0', fontWeight: '900', color: '#ffffff' }}>
              {scannerResult.attendeeDetails?.name || 'Authorized Guest'}
            </h2>
            <p style={{ color: '#d1fae5', fontSize: '1.1rem', margin: '0 0 1.5rem 0' }}>
              Event: <strong>{scannerResult.event?.title || 'Live Show'}</strong>
            </p>

            <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '6px', textAlign: 'left', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Pass Reference Code</span>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem' }}>{scannerResult.bookingReference}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Check-In Timestamp</span>
                <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{new Date(scannerResult.checkedInAt || Date.now()).toLocaleTimeString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Tickets Authorized</span>
                <span style={{ color: '#f8fafc', fontWeight: '800' }}>
                  {scannerResult.tickets?.map((t) => `${t.quantity} × ${t.name}`).join(', ') || '1 × General Pass'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              Scan Next Attendee Pass →
            </button>
          </div>
        )}

        {scannerError && (
          <div style={{ backgroundColor: '#450a0a', border: '3px solid #ef4444', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#ef4444', color: '#ffffff', display: 'inline-block', padding: '0.4rem 1.25rem', borderRadius: '50px', fontWeight: '900', fontSize: '1rem', marginBottom: '1rem', letterSpacing: '1px' }}>
              🚫 ACCESS DENIED • INVALID OR DUPLICATE SCAN
            </div>
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#fca5a5' }}>
              Verification Failed
            </h3>
            <p style={{ color: '#fecaca', fontSize: '1.1rem', backgroundColor: '#0f172a', padding: '1rem', borderRadius: '6px', fontFamily: 'monospace', border: '1px solid #dc2626', marginBottom: '1.5rem', textAlign: 'left' }}>
              {typeof scannerError === 'string' ? scannerError : JSON.stringify(scannerError)}
            </p>
            
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#334155',
                color: '#ffffff',
                border: '1px solid #64748b',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Reset Terminal & Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default OrganizerTicketScannerPage;
