import { configureStore } from '@reduxjs/toolkit';
import mechanicReducer from './feature/home.slice';
import orderReducer from './feature/order.slice';
import orderByIdReducer from './feature/orderBYId.slice';
import paymentReducer from './feature/payment.slice';
import articleReducer from './feature/article.slice';

export const store = configureStore({
  reducer: {
    mechanic: mechanicReducer,
    order: orderReducer,
    orderById: orderByIdReducer,
    payment: paymentReducer,
    article: articleReducer
  }
});