import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchMe } from './features/auth/authSlice';
import { fetchFeaturedEvents } from './features/events/eventSlice';

import Layout from './components/layout/Layout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';

// ── Auth Pages (Phase 2) ──────────────────────────────────────────────────────
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// ── Customer Pages ────────────────────────────────────────────────────────────
import ProfilePage from './pages/customer/ProfilePage';
import CustomerBookingsPage from './pages/customer/CustomerBookingsPage';

// ── Phase 3: Events ───────────────────────────────────────────────────────────
import EventsListPage from './pages/events/EventsListPage';
import EventDetailPage from './pages/events/EventDetailPage';

// ── Phase 3: Organizer & Venue Tools ──────────────────────────────────────────
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerEventsPage from './pages/organizer/OrganizerEventsPage';
import CreateEventPage from './pages/organizer/CreateEventPage';
import EditEventPage from './pages/organizer/EditEventPage';
import OrganizerTicketScannerPage from './pages/organizer/OrganizerTicketScannerPage';

// ── Phase 4: Bookings & Ticketing ─────────────────────────────────────────────
import SeatSelectionPage from './pages/bookings/SeatSelectionPage';
import CheckoutPage from './pages/bookings/CheckoutPage';
import BookingConfirmationPage from './pages/bookings/BookingConfirmationPage';

// ── Phase 5: Demo Payment Sandbox ─────────────────────────────────────────────
import PaymentPage from './pages/payments/PaymentPage';
import PaymentSuccessPage from './pages/payments/PaymentSuccessPage';
import PaymentFailedPage from './pages/payments/PaymentFailedPage';

// ── Phase 6: Admin Management Suite & Customer Onboarding Hub ─────────────────
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore auth session + load featured events on startup
    dispatch(fetchMe());
    dispatch(fetchFeaturedEvents(6));
  }, [dispatch]);

  return (
    <Routes>
      {/* ── Public Routes ─────────────────────────────────────────────────── */}
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
      </Route>

      {/* ── Auth Routes (no layout) ───────────────────────────────────────── */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<LoginPage defaultPortal="admin" />} />
      <Route path="/organizer/login" element={<LoginPage defaultPortal="admin" />} />
      <Route path="/admin/register" element={<RegisterPage defaultPortal="admin" />} />
      <Route path="/organizer/register" element={<RegisterPage defaultPortal="admin" />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />
      {/* ── Customer Routes (with Header Navbar) ───────────────────────── */}
      <Route element={<Layout />}>
        <Route path="/customer/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/customer/bookings" element={<ProtectedRoute><CustomerBookingsPage /></ProtectedRoute>} />
        <Route path="/customer/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/auth/google/success" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
      </Route>

      {/* ── Organizer Routes ──────────────────────────────────────────────── */}
      <Route element={<Layout />}>
        <Route path="/organizer/dashboard" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><OrganizerDashboard /></RoleRoute></ProtectedRoute>} />
        <Route path="/organizer/events" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><OrganizerEventsPage /></RoleRoute></ProtectedRoute>} />
        <Route path="/organizer/events/create" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><CreateEventPage /></RoleRoute></ProtectedRoute>} />
        <Route path="/organizer/events/:id/edit" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><EditEventPage /></RoleRoute></ProtectedRoute>} />
        <Route path="/organizer/verify" element={<ProtectedRoute><RoleRoute roles={['organizer', 'admin']}><OrganizerTicketScannerPage /></RoleRoute></ProtectedRoute>} />
      </Route>

      {/* ── Admin Routes ──────────────────────────────────────────────────── */}
      <Route element={<Layout />}>
        <Route path="/admin/dashboard" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminUsersPage /></RoleRoute></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminEventsPage /></RoleRoute></ProtectedRoute>} />
        <Route path="/admin/events/create" element={<ProtectedRoute><RoleRoute roles={['admin']}><CreateEventPage /></RoleRoute></ProtectedRoute>} />
        <Route path="/admin/events/:id/edit" element={<ProtectedRoute><RoleRoute roles={['admin']}><EditEventPage /></RoleRoute></ProtectedRoute>} />
        <Route path="/admin/verify" element={<ProtectedRoute><RoleRoute roles={['admin']}><OrganizerTicketScannerPage /></RoleRoute></ProtectedRoute>} />
      </Route>

      {/* ── Booking & Payment ─────────────────────────────────────────────── */}
      <Route element={<Layout />}>
        <Route path="/events/:id/seats" element={<ProtectedRoute><SeatSelectionPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/booking/confirmation" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
        <Route path="/payment/failed" element={<ProtectedRoute><PaymentFailedPage /></ProtectedRoute>} />
      </Route>

      {/* ── 404 ───────────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
