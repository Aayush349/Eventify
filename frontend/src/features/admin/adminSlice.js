import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminAPI from '../../api/adminAPI';

export const fetchAdminAnalytics = createAsyncThunk(
  'admin/analytics',
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminAPI.getAnalytics();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to retrieve platform statistics');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'admin/users',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await adminAPI.getUsers(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch users table');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const res = await adminAPI.updateUserRole(id, role);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to modify user role');
    }
  }
);

export const fetchAllEventsAdmin = createAsyncThunk(
  'admin/events',
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminAPI.getEvents();
      return res.data.events;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load master event list');
    }
  }
);

export const updateEventStatusAdmin = createAsyncThunk(
  'admin/updateEventStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await adminAPI.updateEventStatus(id, status);
      return res.data.event;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to override event status');
    }
  }
);

export const verifyAttendeePass = createAsyncThunk(
  'admin/verifyPass',
  async (referenceCode, { rejectWithValue }) => {
    try {
      const res = await adminAPI.verifyTicketGate(referenceCode);
      return res.data.booking;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Verification Failed: Ticket access denied');
    }
  }
);

const initialState = {
  stats: null,
  users: [],
  events: [],
  pagination: null,
  loading: false,
  error: null,
  scannerResult: null,
  scannerError: null,
  actionSuccess: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminMessages: (state) => {
      state.error = null;
      state.actionSuccess = null;
      state.scannerError = null;
    },
    resetScannerResult: (state) => {
      state.scannerResult = null;
      state.scannerError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminAnalytics
      .addCase(fetchAdminAnalytics.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchAllUsers
      .addCase(fetchAllUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateUserRole
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) { state.users[index] = action.payload; }
        state.actionSuccess = `Role changed successfully to ${action.payload.role}`;
      })
      // fetchAllEventsAdmin
      .addCase(fetchAllEventsAdmin.pending, (state) => { state.loading = true; })
      .addCase(fetchAllEventsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      // updateEventStatusAdmin
      .addCase(updateEventStatusAdmin.fulfilled, (state, action) => {
        const index = state.events.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) { state.events[index] = action.payload; }
        state.actionSuccess = `Event moderation status updated to ${action.payload.status}`;
      })
      // verifyAttendeePass
      .addCase(verifyAttendeePass.pending, (state) => {
        state.loading = true;
        state.scannerError = null;
      })
      .addCase(verifyAttendeePass.fulfilled, (state, action) => {
        state.loading = false;
        state.scannerResult = action.payload;
      })
      .addCase(verifyAttendeePass.rejected, (state, action) => {
        state.loading = false;
        state.scannerError = action.payload;
      });
  }
});

export const { clearAdminMessages, resetScannerResult } = adminSlice.actions;
export default adminSlice.reducer;
