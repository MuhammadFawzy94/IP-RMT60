import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching mechanics
export const fetchMechanics = createAsyncThunk(
  'mechanic/fetchMechanics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:80/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch mechanics");
    }
  }
);

// Async thunk for fetching packages
export const fetchPackages = createAsyncThunk(
  'mechanic/fetchPackages',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("https://api.muhammadfawzy.web.id/packages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch packages");
    }
  }
);

// Slice definition
export const mechanicSlice = createSlice({
  name: 'mechanic',
  initialState: {
    mechanics: [],
    filteredMechanics: [],
    packages: [],
    searchTerm: '',
    isLoadingMechanics: false,
    isLoadingPackages: false,
    error: null
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      
      // Filter mechanics based on search term
      state.filteredMechanics = state.mechanics.filter(
        (item) =>
          item.fullName.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          item.speciality.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          item.location.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Handle mechanics fetch
    builder
      .addCase(fetchMechanics.pending, (state) => {
        state.isLoadingMechanics = true;
        state.error = null;
      })
      .addCase(fetchMechanics.fulfilled, (state, action) => {
        state.isLoadingMechanics = false;
        state.mechanics = action.payload;
        state.filteredMechanics = action.payload;
      })
      .addCase(fetchMechanics.rejected, (state, action) => {
        state.isLoadingMechanics = false;
        state.error = action.payload || "Failed to fetch mechanics. Please try again.";
      })
    
    // Handle packages fetch
      .addCase(fetchPackages.pending, (state) => {
        state.isLoadingPackages = true;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.isLoadingPackages = false;
        state.packages = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.isLoadingPackages = false;
        state.error = action.payload || "Failed to fetch packages. Please try again.";
      });
  }
});

// Export actions and reducer
export const { setSearchTerm, clearError } = mechanicSlice.actions;
export default mechanicSlice.reducer;