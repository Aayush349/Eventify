// Placeholder page generator — Phase 2 will replace these with real UI
const PlaceholderPage = ({ title, icon, phase, description }) => (
  <div
    style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '2rem',
    }}
  >
    <div style={{ textAlign: 'center', maxWidth: '500px' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{icon}</div>
      <h1 style={{ marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>{title}</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        {description || `This page is coming in ${phase}.`}
      </p>
      <span
        style={{
          display: 'inline-block',
          background: 'rgba(99, 102, 241, 0.12)',
          color: 'var(--color-primary)',
          borderRadius: '9999px',
          padding: '0.375rem 1rem',
          fontSize: '0.8125rem',
          fontWeight: 600,
        }}
      >
        🚧 {phase}
      </span>
    </div>
  </div>
);

// ─── Auth Pages (Phase 2) ─────────────────────────────────────────────────────
export const LoginPage = () => <PlaceholderPage title="Sign In" icon="🔐" phase="Phase 2" description="JWT login with email/password and Google OAuth." />;
export const RegisterPage = () => <PlaceholderPage title="Create Account" icon="📝" phase="Phase 2" description="Register with email verification OTP." />;
export const VerifyEmailPage = () => <PlaceholderPage title="Verify Your Email" icon="📧" phase="Phase 2" description="Enter your 6-digit OTP to verify your email." />;
export const ForgotPasswordPage = () => <PlaceholderPage title="Forgot Password" icon="🔑" phase="Phase 2" description="Receive a password reset link via email." />;
export const ResetPasswordPage = () => <PlaceholderPage title="Reset Password" icon="🛡️" phase="Phase 2" description="Set your new secure password." />;

// ─── Event Pages (Phase 3) ────────────────────────────────────────────────────
export const EventsListPage = () => <PlaceholderPage title="All Events" icon="🎪" phase="Phase 3" description="Browse and filter thousands of events." />;
export const EventDetailPage = () => <PlaceholderPage title="Event Details" icon="🎟️" phase="Phase 3" description="Full event details with seat map and booking CTA." />;

// ─── Customer Pages ───────────────────────────────────────────────────────────
export const CustomerDashboard = () => <PlaceholderPage title="My Dashboard" icon="📊" phase="Phase 6" description="Your upcoming bookings and quick actions." />;
export const CustomerBookings = () => <PlaceholderPage title="My Bookings" icon="📋" phase="Phase 4" description="View and manage all your bookings." />;
export const CustomerProfile = () => <PlaceholderPage title="My Profile" icon="👤" phase="Phase 2" description="Update your profile and change password." />;

// ─── Organizer Pages ──────────────────────────────────────────────────────────
export const OrganizerDashboard = () => <PlaceholderPage title="Organizer Dashboard" icon="📈" phase="Phase 6" description="Revenue, bookings, and event analytics." />;
export const OrganizerEvents = () => <PlaceholderPage title="My Events" icon="🗓️" phase="Phase 3" description="Manage all your events." />;
export const CreateEventPage = () => <PlaceholderPage title="Create Event" icon="✨" phase="Phase 3" description="Multi-step event creation with image upload." />;
export const EditEventPage = () => <PlaceholderPage title="Edit Event" icon="✏️" phase="Phase 3" description="Update event details." />;

// ─── Admin Pages ──────────────────────────────────────────────────────────────
export const AdminDashboard = () => <PlaceholderPage title="Admin Dashboard" icon="🛡️" phase="Phase 6" description="Platform-wide analytics and management." />;
export const AdminUsers = () => <PlaceholderPage title="Manage Users" icon="👥" phase="Phase 6" description="View, suspend, and manage all users." />;
export const AdminEvents = () => <PlaceholderPage title="Manage Events" icon="🎭" phase="Phase 6" description="Oversee all events on the platform." />;

// ─── Booking Pages ────────────────────────────────────────────────────────────
export const SeatSelectionPage = () => <PlaceholderPage title="Select Seats" icon="💺" phase="Phase 4" description="Interactive seat map with real-time availability." />;
export const CheckoutPage = () => <PlaceholderPage title="Checkout" icon="🛒" phase="Phase 4" description="Review booking and apply coupon." />;
export const BookingConfirmationPage = () => <PlaceholderPage title="Booking Confirmed!" icon="✅" phase="Phase 4" description="Your ticket is ready!" />;

// ─── Payment Pages ────────────────────────────────────────────────────────────
export const PaymentPage = () => <PlaceholderPage title="Payment" icon="💳" phase="Phase 5" description="Demo payment gateway." />;
export const PaymentSuccessPage = () => <PlaceholderPage title="Payment Successful" icon="🎉" phase="Phase 5" description="Confetti! Payment done." />;
export const PaymentFailedPage = () => <PlaceholderPage title="Payment Failed" icon="❌" phase="Phase 5" description="Something went wrong. Retry." />;
