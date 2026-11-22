import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosRequestConfig, Method } from 'axios';
import api from '../../config/axios';

export interface FeatureRequest<TBody = unknown> {
  requestKey: string;
  url: string;
  method?: Method;
  data?: TBody;
  params?: Record<string, unknown>;
}

export interface FeatureRequestResult<T = unknown> {
  requestKey: string;
  data: T;
}

export interface FeatureState {
  data: Record<string, unknown>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

const initialState: FeatureState = { data: {}, loading: {}, errors: {} };

export function createFeatureSlice(featureName: string) {
  const request = createAsyncThunk<FeatureRequestResult, FeatureRequest>(
    `${featureName}/request`,
    async ({ requestKey, url, method = 'GET', data, params }) => {
      const config: AxiosRequestConfig = { url, method, data, params };
      const response = await api.request(config);
      return { requestKey, data: response.data };
    }
  );

  const slice = createSlice({
    name: featureName,
    initialState,
    reducers: {
      clearFeatureRequest(state, action: PayloadAction<string>) {
        delete state.data[action.payload];
        delete state.loading[action.payload];
        delete state.errors[action.payload];
      },
      clearFeatureState() {
        return initialState;
      },
    },
    extraReducers(builder) {
      builder
        .addCase(request.pending, (state, action) => {
          const key = action.meta.arg.requestKey;
          state.loading[key] = true;
          state.errors[key] = null;
        })
        .addCase(request.fulfilled, (state, action) => {
          const { requestKey, data } = action.payload;
          state.loading[requestKey] = false;
          state.data[requestKey] = data;
        })
        .addCase(request.rejected, (state, action) => {
          const key = action.meta.arg.requestKey;
          state.loading[key] = false;
          state.errors[key] = action.error.message ?? 'Request failed';
        });
    },
  });

  return { reducer: slice.reducer, request, ...slice.actions };
}
