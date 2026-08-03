import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import {
  createBookingAPI,
  fetchMyBookingsAPI,
  fetchBookingByIdAPI,
  cancelBookingAPI,
} from '../../api/bookingAPI';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const res = await createBookingAPI(bookingData);
      toast.success('🎉 Booking confirmed! Your digital passes are ready.');
      return res.data.data.booking;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to confirm booking';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMyBookings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await fetchMyBookingsAPI(params);
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load booking history';
      return rejectWithValue(msg);
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetchBookingByIdAPI(id);
      return res.data.data.booking;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to retrieve ticket details';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const res = await cancelBookingAPI(id);
      toast.success('Ticket booking has been cancelled and seats restored.');
      return res.data.data.booking;
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not cancel booking';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// ─── Slice & Active Order Draft State ─────────────────────────────────────────

const initialState = {
  // Temporary shopping cart / order draft between seat selection and checkout
  activeOrder: {
    event: null,
    selectedTickets: [], // Array of { ticketTypeId, name, price, quantity, availableSeats }
    subtotal: 0,
    discountAmount: 0,
    promoCode: null,
    finalTotal: 0,
  },
  myBookings: [],
  currentBooking: null, // confirmed order / pass view
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    // Sets initial active event and ticket items from seat selector screen
    setActiveOrder: (state, action) => {
      const { event, selectedTickets } = action.payload;
      const subtotal = selectedTickets.reduce(
        (sum, t) => sum + t.price * t.quantity,
        0
      );
      state.activeOrder = {
        event,
        selectedTickets,
        subtotal,
        discountAmount: 0,
        promoCode: null,
        finalTotal: subtotal,
      };
    },
    // Applies promo code discounting logic on checkout screen
    applyPromoCode: (state, action) => {
      const code = action.payload?.trim().toUpperCase();
      const { subtotal } = state.activeOrder;
      let discount = 0;

      if (code === 'DISTRICT10' || code === 'DISCOUNT10') {
        discount = Math.min(subtotal * 0.1, 500);
      } else if (code === 'WELCOME500' && subtotal >= 1200) {
        discount = 500;
      } else if (code === 'FREEPASS') {
        discount = subtotal;
      }

      state.activeOrder.promoCode = discount > 0 ? code : null;
      state.activeOrder.discountAmount = Math.round(discount * 100) / 100;
      state.activeOrder.finalTotal = Math.max(
        0,
        Math.round((subtotal - state.activeOrder.discountAmount) * 100) / 100
      );
    },
    removePromoCode: (state) => {
      state.activeOrder.promoCode = null;
      state.activeOrder.discountAmount = 0;
      state.activeOrder.finalTotal = state.activeOrder.subtotal;
    },
    clearActiveOrder: (state) => {
      state.activeOrder = initialState.activeOrder;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    // Create Booking
    builder.addCase(createBooking.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(createBooking.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.currentBooking = action.payload;
      // prepend to list if cached
      state.myBookings.unshift(action.payload);
    });
    builder.addCase(createBooking.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    });

    // Fetch My Bookings
    builder.addCase(fetchMyBookings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMyBookings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.myBookings = action.payload.bookings;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchMyBookings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch Booking By ID
    builder.addCase(fetchBookingById.pending, (state) => {
      state.isLoading = true;
      state.currentBooking = null;
    });
    builder.addCase(fetchBookingById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentBooking = action.payload;
    });
    builder.addCase(fetchBookingById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Cancel Booking
    builder.addCase(cancelBooking.fulfilled, (state, action) => {
      const updated = action.payload;
      if (state.currentBooking?._id === updated._id) {
        state.currentBooking = updated;
      }
      const index = state.myBookings.findIndex((b) => b._id === updated._id);
      if (index !== -1) {
        state.myBookings[index] = updated;
      }
    });
  },
});

export const {
  setActiveOrder,
  applyPromoCode,
  removePromoCode,
  clearActiveOrder,
  clearCurrentBooking,
} = bookingSlice.actions;

// Selectors
export const selectActiveOrder = (state) => state.bookings.activeOrder;
export const selectMyBookings = (state) => state.bookings.myBookings;
export const selectCurrentBooking = (state) => state.bookings.currentBooking;
export const selectBookingLoading = (state) => state.bookings.isLoading;
export const selectBookingSubmitting = (state) => state.bookings.isSubmitting;
export const selectBookingPagination = (state) => state.bookings.pagination;

export default bookingSlice.reducer;
