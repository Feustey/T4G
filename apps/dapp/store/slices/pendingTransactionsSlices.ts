import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { AppState } from '../store';
import { PendingTransactionType } from 'apps/dapp/types';
import { getUserPendingTransactions } from 'apps/dapp/services';

export interface PendingTransactionsState {
  value: PendingTransactionType[] | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: PendingTransactionsState = {
  value: null,
  status: 'idle',
};

export const fetchPendingTransactionsState = createAsyncThunk(
  'pendingTransactions/fetchPendingTransactionsState',
  async () => {
    const response = await getUserPendingTransactions();
    return response;
  }
);

export const pendingTransactionsSlice = createSlice({
  name: 'pendingTransactionsServices',
  initialState,
  reducers: {
    setPendingTransactionsState: (state, action) => {
      state.value = action.payload;
      fetchPendingTransactionsState();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingTransactionsState.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPendingTransactionsState.fulfilled, (state, action) => {
        state.status = 'idle';
        state.value = action.payload;
      });
  },
});

export const { setPendingTransactionsState } = pendingTransactionsSlice.actions;

export const selectPendingTransactions = (state: AppState) =>
  state.pendingTransactions.value;

export default pendingTransactionsSlice.reducer;
