import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import eventReducer from '../features/events/eventSlice';
import bookingReducer from '../features/bookings/bookingSlice';
import paymentReducer from '../features/payments/paymentSlice';
import adminReducer from '../features/admin/adminSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    bookings: bookingReducer,
    payments: paymentReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (if needed for non-serializable data)
        ignoredActions: [],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
