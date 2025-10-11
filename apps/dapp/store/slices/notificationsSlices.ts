import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { AppState } from '../store';
import { getUserNotifications } from '../../services/notificationsAPI';
import { NotificationType } from 'apps/dapp/types';

export interface NotificationsState {
  value: NotificationType[] | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: NotificationsState = {
  value: null,
  status: 'idle',
};

export const fetchNotificationsState = createAsyncThunk(
  'notifications/fetchNotificationsState',
  async () => {
    const response = await getUserNotifications();
    return response;
  }
);

export const notificationsSlice = createSlice({
  name: 'notificationsServices',
  initialState,
  reducers: {
    setNotificationsState: (state, action) => {
      state.value = action.payload;
      fetchNotificationsState();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsState.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotificationsState.fulfilled, (state, action) => {
        state.status = 'idle';
        state.value = action.payload;
      });
  },
});

export const { setNotificationsState } = notificationsSlice.actions;

export const selectNotifications = (state: AppState) =>
  state.notifications.value;

export default notificationsSlice.reducer;
