import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { faCheck, faWrench, faOilCan, faBolt } from "@fortawesome/free-solid-svg-icons";

// Predefined service packages
const initialServicePackages = [
  {
    id: 1,
    namePackage: "Full Service",
    description: "Complete vehicle checkup including engine, transmission, brakes, and electrical systems",
    price: 500_000,
    imgUrl: "https://images.unsplash.com/photo-1486684228390-9f819d87e6b6?q=80&w=2070&auto=format&fit=crop",
    icon: faWrench,
    PackageId: 1
  },
  {
    id: 2,
    namePackage: "Daily Service",
    description: "Basic maintenance service for everyday vehicle performance",
    price: 150_000,
    imgUrl: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2070&auto=format&fit=crop",
    icon: faCheck,
    PackageId: 2
  },
  {
    id: 3,
    namePackage: "Change Oil",
    description: "Oil change service with premium quality oil and filter replacement",
    price: 200_000,
    imgUrl: "https://images.unsplash.com/photo-1601028918541-a808527eec98?q=80&w=2070&auto=format&fit=crop",
    icon: faOilCan,
    PackageId: 3
  },
  {
    id: 4,
    namePackage: "Electrical Service",
    description: "Comprehensive electrical system diagnosis and repair",
    price: 350_000,
    imgUrl: "https://images.unsplash.com/photo-1565043589221-23593a91389e?q=80&w=2070&auto=format&fit=crop",
    icon: faBolt,
    PackageId: 4
  }
];

// Async thunk for creating orders
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://localhost:80/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create booking");
    }
  }
);

// Order slice
export const orderSlice = createSlice({
  name: 'order',
  initialState: {
    servicePackages: initialServicePackages,
    selectedPackage: null,
    orderDate: "",
    orderNote: "",
    loading: false,
    error: null,
    orderCreated: null
  },
  reducers: {
    // Select package
    selectPackage: (state, action) => {
      state.selectedPackage = action.payload;
    },
    // Set order date
    setOrderDate: (state, action) => {
      state.orderDate = action.payload;
    },
    // Set order note
    setOrderNote: (state, action) => {
      state.orderNote = action.payload;
    },
    // Reset order form
    resetOrderForm: (state) => {
      state.selectedPackage = null;
      state.orderDate = "";
      state.orderNote = "";
      state.error = null;
      state.orderCreated = null;
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderCreated = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create booking";
      });
  }
});

// Export actions and reducer
export const { 
  selectPackage, 
  setOrderDate, 
  setOrderNote, 
  resetOrderForm, 
  clearError 
} = orderSlice.actions;

export default orderSlice.reducer;