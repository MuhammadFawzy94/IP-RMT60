import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all orders
export const fetchOrders = createAsyncThunk(
  'orderById/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        return rejectWithValue("Authentication required. Please log in.");
      }
      
      const response = await axios.get(
        `http://localhost:80/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load orders.");
    }
  }
);

// Delete an order
export const deleteOrder = createAsyncThunk(
  'orderById/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(
        `http://localhost:80/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete order");
    }
  }
);

// Complete an order
export const completeOrder = createAsyncThunk(
  'orderById/completeOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `http://localhost:80/orders/complete/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to complete order");
    }
  }
);

// Create the slice
const orderByIdSlice = createSlice({
  name: 'orderById',
  initialState: {
    orders: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(order => order.id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Complete order
      .addCase(completeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.map(order => 
          order.id === action.payload 
            ? { ...order, status: "completed" } 
            : order
        );
      })
      .addCase(completeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

export const { clearError } = orderByIdSlice.actions;
export default orderByIdSlice.reducer;