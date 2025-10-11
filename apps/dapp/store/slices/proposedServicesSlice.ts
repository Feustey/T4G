import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { AppState } from '../store';
import {
  getProposedServices,
  updateProposedServices,
} from '../../services/proposedServicesAPI';

export interface ProposedServicesState {
  value: string[] | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: ProposedServicesState = {
  value: null,
  status: 'idle',
};

export const fetchProposedServicesState = createAsyncThunk(
  'proposedServices/fetchProposedServicesState',
  async () => {
    const response = await getProposedServices();
    return response;
  }
);

export const proposedServicesSlice = createSlice({
  name: 'proposedServices',
  initialState,
  reducers: {
    setProposedServicesState: (state, action) => {
      state.value = action.payload;
      updateProposedServices(state.value);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProposedServicesState.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProposedServicesState.fulfilled, (state, action) => {
        state.status = 'idle';
        state.value = action.payload;
      });
  },
});

export const { setProposedServicesState } = proposedServicesSlice.actions;

export const selectProposedServices = (state: AppState) =>
  state.proposedServices.value;

export default proposedServicesSlice.reducer;
