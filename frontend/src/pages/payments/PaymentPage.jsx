import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { processDemoTransaction } from '../../features/payments/paymentSlice';

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { latestBooking } = useSelector((state) => state.bookings);
  const { loading, error } = useSelector((state) => state.payments);

  // We can also accept booking passed via route navigation state
  const targetBooking = location.state?.booking || latestBooking;

  const [paymentMethod, setPaymentMethod] = useState('UPI (Demo Sandbox)');
  const [upiId, setUpiId] = useState('tester@district.demo');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [simulatedOutcome, setSimulatedOutcome] = useState('SUCCESS');
  const [processingAnimation, setProcessingAnimation] = useState(false);

  useEffect(() => {
    if (!targetBooking) {
      // If no booking draft is loaded, return to events discover
      navigate('/events');
    }
  }, [targetBooking, navigate]);

  const handleExecutePayment = (e) => {
    e.preventDefault();
    setProcessingAnimation(true);

    setTimeout(() => {
      dispatch(processDemoTransaction({
        bookingId: targetBooking._id,
        paymentMethod,
        status: simulatedOutcome === 'SUCCESS' ? 'success' : 'failed',
        simulationDetails: {
          testCardNumber: paymentMethod === 'Card' ? cardNumber : null,
          testUpiId: paymentMethod.includes('UPI') ? upiId : null,
        }
      })).then((res) => {
        setProcessingAnimation(false);
        if (res.meta.requestStatus === 'fulfilled') {
          if (simulatedOutcome === 'SUCCESS') {
            navigate('/payment/success', { state: { booking: targetBooking, transaction: res.payload.payment } });
          } else {
            navigate('/payment/failed', { state: { booking: targetBooking } });
          }
        }
      });
    }, 1500); // Simulate network bank verification delay
  };

  if (!targetBooking) return null;

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '90vh', padding: '3rem 1rem', color: '#ffffff' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* Header Badge */}
        <div style={{ backgroundColor: '#1e293b', border: '2px solid #4f46e5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ backgroundColor: '#4f46e5', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                DISTRICT DEMO PAY SANDBOX
              </span>
              <h1 style={{ fontSize: '1.75rem', margin: '0.5rem 0 0.25rem 0', fontWeight: '800' }}>
                Simulated Financial Checkout
              </h1>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                Evaluate real-time transaction processing without external credit cards or Stripe API keys.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Order Payable Amount</p>
              <h2 style={{ color: '#10b981', margin: '0.25rem 0 0 0', fontSize: '2.2rem', fontWeight: '800' }}>
                ₹{targetBooking.finalAmount?.toLocaleString('en-IN') || targetBooking.totalAmount || 0}
              </h2>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Payment Option Terminal */}
          <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <h3 style={{ borderBottom: '2px solid #334155', paddingBottom: '0.75rem', marginTop: 0, color: '#f8fafc', fontSize: '1.2rem' }}>
              1. Select Payment Channel
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {['UPI (Demo Sandbox)', 'Credit/Debit Card', 'NetBanking (Mock)'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    flex: '1 1 auto',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: paymentMethod === method ? '2px solid #10b981' : '1px solid #475569',
                    backgroundColor: paymentMethod === method ? '#065f46' : '#0f172a',
                    color: '#ffffff',
                    fontWeight: paymentMethod === method ? '700' : '500',
                    cursor: 'pointer',
                  }}
                >
                  {method}
                </button>
              ))}
            </div>

            {paymentMethod === 'UPI (Demo Sandbox)' && (
              <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '6px', border: '1px solid #334155', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.75rem 0', color: '#cbd5e1', fontWeight: '600' }}>📱 Simulated UPI Virtual ID</p>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#ffffff', borderRadius: '4px', boxSizing: 'border-box' }}
                />
                <p style={{ margin: '0.75rem 0 0 0', color: '#10b981', fontSize: '0.8rem' }}>
                  ✓ Live District Validation Active. Any ID ending in @district, @okaxis, or @okhdfc is auto-approved.
                </p>
              </div>
            )}

            {paymentMethod === 'Credit/Debit Card' && (
              <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '6px', border: '1px solid #334155', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '600' }}>💳 Test Card Number (Demo)</p>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#ffffff', borderRadius: '4px', marginBottom: '1rem', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1', fontSize: '0.85rem' }}>Valid Thru</p>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#ffffff', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1', fontSize: '0.85rem' }}>CVV / CVC</p>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#ffffff', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'NetBanking (Mock)' && (
              <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '6px', border: '1px solid #334155', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1' }}>🏦 Select Demo Banking Partner</p>
                <select style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#ffffff', borderRadius: '4px' }}>
                  <option>District Retail Mock Bank (Direct API)</option>
                  <option>HDFC Test Sandbox Bank</option>
                  <option>ICICI Demo Enterprise Portal</option>
                  <option>SBI Simulation Gateway</option>
                </select>
              </div>
            )}
          </div>

          {/* Sandbox Controls & Submit */}
          <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ borderBottom: '2px solid #334155', paddingBottom: '0.75rem', marginTop: 0, color: '#f8fafc', fontSize: '1.2rem' }}>
                2. Evaluation Controls
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                As an evaluator or end user in Demo Mode, you can test how the application handles different payment verification scenarios:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#0f172a', border: simulatedOutcome === 'SUCCESS' ? '2px solid #10b981' : '1px solid #334155', borderRadius: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="simulatedOutcome"
                    value="SUCCESS"
                    checked={simulatedOutcome === 'SUCCESS'}
                    onChange={() => setSimulatedOutcome('SUCCESS')}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <div>
                    <span style={{ color: '#10b981', fontWeight: 'bold', display: 'block' }}>✅ Simulate Approved Transaction</span>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Confirms booking pass & generates digital QR barcode.</span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#0f172a', border: simulatedOutcome === 'FAILED' ? '2px solid #ef4444' : '1px solid #334155', borderRadius: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="simulatedOutcome"
                    value="FAILED"
                    checked={simulatedOutcome === 'FAILED'}
                    onChange={() => setSimulatedOutcome('FAILED')}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <div>
                    <span style={{ color: '#ef4444', fontWeight: 'bold', display: 'block' }}>❌ Simulate Payment Decline / Error</span>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Tests error recovery UI and allows retrying later.</span>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: '#450a0a', border: '1px solid #dc2626', color: '#fca5a5', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                ⚠️ {typeof error === 'string' ? error : JSON.stringify(error)}
              </div>
            )}

            <button
              type="button"
              onClick={handleExecutePayment}
              disabled={loading || processingAnimation}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: processingAnimation ? '#475569' : '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1.1rem',
                fontWeight: '800',
                cursor: processingAnimation ? 'wait' : 'pointer',
                letterSpacing: '0.5px',
              }}
            >
              {processingAnimation ? '⏳ PROCEEDING VIA MOCK GATEWAY...' : `AUTHORIZE & PAY ₹${targetBooking.finalAmount || targetBooking.totalAmount}`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
