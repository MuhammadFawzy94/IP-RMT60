import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Initiate payment with Midtrans
export const initiatePayment = createAsyncThunk(
  'payment/initiatePayment',
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://localhost:80/payment/initiate',
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate payment');
    }
  }
);

// Check payment status
export const checkPaymentStatus = createAsyncThunk(
  'payment/checkPaymentStatus',
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `http://localhost:80/orders/${orderId}/payment-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check payment status');
    }
  }
);

// Delete order after successful payment
export const deleteOrder = createAsyncThunk(
  'payment/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://localhost:80/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process payment completion');
    }
  }
);

// Payment slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    loading: false,
    error: null,
    snapToken: null,
    transactionId: null,
    paymentStatus: null,
    paymentSuccess: false,
    snapScriptLoaded: false
  },
  reducers: {
    setSnapScriptLoaded: (state, action) => {
      state.snapScriptLoaded = action.payload;
    },
    clearPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.snapToken = null;
      state.transactionId = null;
      state.paymentStatus = null;
      state.paymentSuccess = false;
    },
    setPaymentSuccess: (state) => {
      state.paymentSuccess = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initiate payment
      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.snapToken = action.payload.transactionToken;
        state.transactionId = action.payload.orderId;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Check payment status
      .addCase(checkPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentStatus = action.payload.paymentStatus;
        if (action.payload.paymentStatus === 'paid') {
          state.paymentSuccess = true;
        }
      })
      .addCase(checkPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete order after payment
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state) => {
        state.loading = false;
        state.paymentSuccess = true;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Even if deletion fails, we still mark payment as successful
        // since this is just a database cleanup operation
        state.paymentSuccess = true;
      });
  }
});

export const { setSnapScriptLoaded, clearPaymentState, setPaymentSuccess } = paymentSlice.actions;
export default paymentSlice.reducer;