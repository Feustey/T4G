import { createSlice } from '@reduxjs/toolkit';

import type { AppState } from '../store';
import { UserNotificationType } from 'apps/dapp/types';

export interface UserNotificationsState {
  value: UserNotificationType[];
}

const initialState: UserNotificationsState = {
  value: null,
};

export const userNotificationsSlice = createSlice({
  name: 'userNotifications',
  initialState,
  reducers: {
    setUserNotificationsState: (state, action) => {
      state.value = action.payload;
    },
    addUserNotificationsState: (state, action) => {
      if (state.value === null) {
        state.value = [action.payload];
      } else {
        state.value = [action.payload, ...state.value];
      }
    },
  },
});

export const { setUserNotificationsState, addUserNotificationsState } =
  userNotificationsSlice.actions;

export const selectUserNotifications = (state: AppState) =>
  state.userNotifications.value;

export default userNotificationsSlice.reducer;
