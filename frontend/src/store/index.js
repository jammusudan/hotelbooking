import { configureStore } from '@reduxjs/toolkit';
import managerReducer from './slices/managerSlice';

export const store = configureStore({
  reducer: {
    manager: managerReducer,
  },
});

export default store;
