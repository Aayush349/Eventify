import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import {
  loginAPI,
  registerAPI,
  logoutAPI,
  getMeAPI,
  refreshTokenAPI,
  forgotPasswordAPI,
  resetPasswordAPI,
  changePasswordAPI,
  updateProfileAPI,
} from '../../api/authAPI';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await registerAPI(data);
      toast.success('Account created successfully!');
      return res.data.data.user;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await loginAPI(data);
      toast.success(`Welcome back, ${res.data.data.user.name}!`);
      return res.data.data.user;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutAPI();
      toast.success('Logged out successfully');
    } catch (err) {
      // Clear state anyway even if request fails
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMeAPI();
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const res = await refreshTokenAPI();
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const sendForgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const res = await forgotPasswordAPI(email);
      return res.data.data; // Contains resetToken + userName + userEmail for EmailJS
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to process request';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const res = await resetPasswordAPI(token, { password, confirmPassword });
      toast.success('Password reset successful!');
      return res.data.message;
    } catch (err) {
      const message = err.response?.data?.message || 'Reset failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'auth/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      const res = await changePasswordAPI(data);
      toast.success('Password changed! Please log in again.');
      return res.data.message;
    } catch (err) {
      const message = err.response?.data?.message || 'Change password failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const res = await updateProfileAPI(data);
      toast.success('Profile updated!');
      return res.data.data.user;
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true, // True while checking if user is logged in on app load
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setInitializing: (state, action) => {
      state.isInitializing = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Helper to set loading state
    const setPending = (state) => { state.isLoading = true; state.error = null; };
    const setError = (state, action) => { state.isLoading = false; state.error = action.payload; };

    // Register
    builder.addCase(registerUser.pending, setPending);
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(registerUser.rejected, setError);

    // Login
    builder.addCase(loginUser.pending, setPending);
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, setError);

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      // Clear state even on failure
      state.user = null;
      state.isAuthenticated = false;
    });

    // Fetch Me
    builder.addCase(fetchMe.pending, (state) => { state.isInitializing = true; });
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitializing = false;
    });
    builder.addCase(fetchMe.rejected, (state) => {
      state.isInitializing = false;
    });

    // Refresh Token
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    });

    // Update Profile
    builder.addCase(updateUserProfile.pending, setPending);
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
    });
    builder.addCase(updateUserProfile.rejected, setError);

    // Change Password → clear user (force re-login)
    builder.addCase(changeUserPassword.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setUser, clearUser, setInitializing, clearError } = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectIsInitializing = (state) => state.auth.isInitializing;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
