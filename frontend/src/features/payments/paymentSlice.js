import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentAPI from '../../api/paymentAPI';

export const processDemoTransaction = createAsyncThunk(
  'payments/process',
  async (paymentData, { rejectWithValue }) => {
    try {
      const data = await paymentAPI.processPayment(paymentData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Demo Transaction Processing Failed');
    }
  }
);

export const fetchMyPayments = createAsyncThunk(
  'payments/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const data = await paymentAPI.getMyPayments();
      return data.data.payments;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to retrieve transaction logs');
    }
  }
);

const initialState = {
  history: [],
  latestTransaction: null,
  loading: false,
  error: null,
  successMessage: null,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentError: (state) => { state.error = null; },
    resetTransactionState: (state) => {
      state.latestTransaction = null;
      state.successMessage = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // processDemoTransaction
      .addCase(processDemoTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processDemoTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.latestTransaction = action.payload.payment;
        state.successMessage = 'Transaction approved via District Sandbox!';
      })
      .addCase(processDemoTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchMyPayments
      .addCase(fetchMyPayments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchMyPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearPaymentError, resetTransactionState } = paymentSlice.actions;
export default paymentSlice.reducer;
