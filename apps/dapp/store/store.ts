import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

import {
  proposedServicesSlice,
  userBalanceSlice,
  userNotificationsSlice,
  notificationsSlice,
  pendingTransactionsSlice,
} from './slices/index';

export function makeStore() {
  return configureStore({
    reducer: {
      proposedServices: proposedServicesSlice.reducer,
      userBalance: userBalanceSlice.reducer,
      userNotifications: userNotificationsSlice.reducer,
      notifications: notificationsSlice.reducer,
      pendingTransactions: pendingTransactionsSlice.reducer,
    },
  });
}

const store = makeStore();

export type AppState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;

export default store;
