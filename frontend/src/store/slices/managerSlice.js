import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../context/AuthContext';

export const fetchDashboardStats = createAsyncThunk(
  'manager/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/manager/dashboard-stats');
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

export const fetchManagerHotels = createAsyncThunk(
  'manager/fetchHotels',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/manager/hotels');
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

export const fetchManagerRooms = createAsyncThunk(
  'manager/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/manager/rooms');
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

export const fetchManagerBookings = createAsyncThunk(
  'manager/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/manager/bookings');
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

export const fetchManagerReviews = createAsyncThunk(
  'manager/fetchReviews',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/manager/reviews');
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

const initialState = {
  stats: null,
  hotels: [],
  rooms: [],
  bookings: [],
  reviews: [],
  loading: false,
  error: null,
};

const managerSlice = createSlice({
  name: 'manager',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchManagerHotels.fulfilled, (state, action) => {
        state.hotels = action.payload;
      })
      .addCase(fetchManagerRooms.fulfilled, (state, action) => {
        state.rooms = action.payload;
      })
      .addCase(fetchManagerBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
      })
      .addCase(fetchManagerReviews.fulfilled, (state, action) => {
        state.reviews = action.payload;
      });
  },
});

export const { clearError } = managerSlice.actions;
export default managerSlice.reducer;
