import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { AppState } from '../store';
import { getUserBalance } from 'apps/dapp/services';

export interface UserBalanceState {
  value: number | 0;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: UserBalanceState = {
  value: null,
  status: 'idle',
};

export const fetchUserBalanceState = createAsyncThunk(
  'userBalance/fetchUserBalanceState',
  async () => {
    const response = await getUserBalance();
    return response;
  }
);

export const userBalanceSlice = createSlice({
  name: 'userBalance',
  initialState,
  reducers: {
    setUserBalanceState: (state, action) => {
      state.value = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBalanceState.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserBalanceState.fulfilled, (state, action) => {
        state.status = 'idle';
        state.value = action.payload;
      });
  },
});

export const { setUserBalanceState } = userBalanceSlice.actions;

export const selectUserBalance = (state: AppState) => state.userBalance.value;

export default userBalanceSlice.reducer;
