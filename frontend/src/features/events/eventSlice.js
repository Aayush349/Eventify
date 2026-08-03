import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import {
  fetchEventsAPI, fetchFeaturedEventsAPI, searchEventsAPI,
  fetchEventByIdAPI, fetchOrganizerEventsAPI, createEventAPI,
  updateEventAPI, deleteEventAPI, publishEventAPI, uploadEventBannerAPI,
} from '../../api/eventAPI';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchEvents = createAsyncThunk('events/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await fetchEventsAPI(params);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch events');
  }
});

export const fetchFeaturedEvents = createAsyncThunk('events/fetchFeatured', async (limit, { rejectWithValue }) => {
  try {
    const res = await fetchFeaturedEventsAPI(limit);
    return res.data.data.events;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const searchEvents = createAsyncThunk('events/search', async ({ q, page, limit }, { rejectWithValue }) => {
  try {
    const res = await searchEventsAPI(q, page, limit);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchEventById = createAsyncThunk('events/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await fetchEventByIdAPI(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Event not found');
  }
});

export const fetchOrganizerEvents = createAsyncThunk('events/fetchOrganizer', async (params, { rejectWithValue }) => {
  try {
    const res = await fetchOrganizerEventsAPI(params);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createEvent = createAsyncThunk('events/create', async (data, { rejectWithValue }) => {
  try {
    const res = await createEventAPI(data);
    toast.success('Event created as draft!');
    return res.data.data.event;
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to create event';
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const updateEvent = createAsyncThunk('events/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await updateEventAPI(id, data);
    toast.success('Event updated!');
    return res.data.data.event;
  } catch (err) {
    const msg = err.response?.data?.message || 'Update failed';
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const deleteEvent = createAsyncThunk('events/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteEventAPI(id);
    toast.success('Event cancelled');
    return id;
  } catch (err) {
    const msg = err.response?.data?.message || 'Delete failed';
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const publishEvent = createAsyncThunk('events/publish', async (id, { rejectWithValue }) => {
  try {
    const res = await publishEventAPI(id);
    toast.success('Event is now live! 🎉');
    return res.data.data.event;
  } catch (err) {
    const msg = err.response?.data?.message || 'Publish failed';
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const uploadEventBanner = createAsyncThunk('events/uploadBanner', async ({ id, file }, { rejectWithValue }) => {
  try {
    const res = await uploadEventBannerAPI(id, file);
    toast.success('Banner uploaded!');
    return { id, ...res.data.data };
  } catch (err) {
    const msg = err.response?.data?.message || 'Upload failed';
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const initialState = {
  events: [],
  featuredEvents: [],
  organizerEvents: [],
  currentEvent: null,
  relatedEvents: [],
  pagination: { page: 1, totalPages: 1, total: 0 },
  filters: { category: '', city: '', dateFrom: '', dateTo: '', priceMin: '', priceMax: '', sortBy: 'date_asc' },
  isLoading: false,
  isDetailLoading: false,
  error: null,
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
      state.relatedEvents = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all events
    builder.addCase(fetchEvents.pending, (state) => { state.isLoading = true; });
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.isLoading = false;
      state.events = action.payload.events;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchEvents.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });

    // Featured events
    builder.addCase(fetchFeaturedEvents.fulfilled, (state, action) => {
      state.featuredEvents = action.payload;
    });

    // Search
    builder.addCase(searchEvents.pending, (state) => { state.isLoading = true; });
    builder.addCase(searchEvents.fulfilled, (state, action) => {
      state.isLoading = false;
      state.events = action.payload.events;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(searchEvents.rejected, (state) => { state.isLoading = false; });

    // Event detail
    builder.addCase(fetchEventById.pending, (state) => { state.isDetailLoading = true; state.currentEvent = null; });
    builder.addCase(fetchEventById.fulfilled, (state, action) => {
      state.isDetailLoading = false;
      state.currentEvent = action.payload.event;
      state.relatedEvents = action.payload.related;
    });
    builder.addCase(fetchEventById.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload; });

    // Organizer events
    builder.addCase(fetchOrganizerEvents.fulfilled, (state, action) => {
      state.organizerEvents = action.payload.events;
    });

    // Create
    builder.addCase(createEvent.fulfilled, (state, action) => {
      state.organizerEvents.unshift(action.payload);
    });

    // Update — patch in organizerEvents array
    builder.addCase(updateEvent.fulfilled, (state, action) => {
      const idx = state.organizerEvents.findIndex((e) => e._id === action.payload._id);
      if (idx !== -1) state.organizerEvents[idx] = action.payload;
      if (state.currentEvent?._id === action.payload._id) state.currentEvent = action.payload;
    });

    // Delete — remove from array
    builder.addCase(deleteEvent.fulfilled, (state, action) => {
      state.organizerEvents = state.organizerEvents.filter((e) => e._id !== action.payload);
    });

    // Publish — update status
    builder.addCase(publishEvent.fulfilled, (state, action) => {
      const idx = state.organizerEvents.findIndex((e) => e._id === action.payload._id);
      if (idx !== -1) state.organizerEvents[idx] = action.payload;
    });

    // Upload banner
    builder.addCase(uploadEventBanner.fulfilled, (state, action) => {
      const idx = state.organizerEvents.findIndex((e) => e._id === action.payload.id);
      if (idx !== -1) state.organizerEvents[idx].bannerImage = { url: action.payload.url, publicId: action.payload.publicId };
      if (state.currentEvent?._id === action.payload.id) {
        state.currentEvent.bannerImage = { url: action.payload.url, publicId: action.payload.publicId };
      }
    });
  },
});

export const { setFilters, clearFilters, clearCurrentEvent, clearError } = eventSlice.actions;

// Selectors
export const selectEvents = (s) => s.events.events;
export const selectFeaturedEvents = (s) => s.events.featuredEvents;
export const selectOrganizerEvents = (s) => s.events.organizerEvents;
export const selectCurrentEvent = (s) => s.events.currentEvent;
export const selectRelatedEvents = (s) => s.events.relatedEvents;
export const selectPagination = (s) => s.events.pagination;
export const selectFilters = (s) => s.events.filters;
export const selectEventsLoading = (s) => s.events.isLoading;
export const selectDetailLoading = (s) => s.events.isDetailLoading;

export default eventSlice.reducer;
