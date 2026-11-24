import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractApiError, type ApiRejectedPayload } from '../shared/apiError';
import { invoicesApi } from './invoicesApi';
import type {
  CreateInvoicePayload,
  InvoiceRecord,
  InvoicesState,
} from './invoicesTypes';

const initialState: InvoicesState = {
  list: [],
  loading: {
    list: false,
    create: false,
  },
  errors: {
    list: null,
    create: null,
  },
};

export const fetchInvoices = createAsyncThunk<
  InvoiceRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('invoices/fetchInvoices', async (_, { rejectWithValue }) => {
  try {
    const response = await invoicesApi.getInvoices();
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách thanh toán lúc này.')
    );
  }
});

export const createInvoice = createAsyncThunk<
  { status: number; data: unknown },
  CreateInvoicePayload,
  { rejectValue: ApiRejectedPayload }
>('invoices/createInvoice', async (payload, { rejectWithValue }) => {
  try {
    const response = await invoicesApi.createInvoice(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(
        err,
        'Không thể xác nhận thanh toán. Vui lòng kiểm tra thông tin và thử lại.'
      )
    );
  }
});

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearInvoiceErrors(state) {
      state.errors = { ...initialState.errors };
    },
    clearInvoiceState() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading.list = true;
        state.errors.list = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading.list = false;
        state.list = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading.list = false;
        state.errors.list =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(createInvoice.pending, (state) => {
        state.loading.create = true;
        state.errors.create = null;
      })
      .addCase(createInvoice.fulfilled, (state) => {
        state.loading.create = false;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading.create = false;
        state.errors.create =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      });
  },
});

export const { clearInvoiceErrors, clearInvoiceState } = invoicesSlice.actions;

export const selectInvoicesState = (state: {
  invoices: InvoicesState;
}): InvoicesState => state.invoices;
export const selectInvoicesList = (state: {
  invoices: InvoicesState;
}): InvoiceRecord[] => state.invoices.list;
export const selectInvoicesLoading = (state: {
  invoices: InvoicesState;
}): InvoicesState['loading'] => state.invoices.loading;
export const selectInvoicesErrors = (state: {
  invoices: InvoicesState;
}): InvoicesState['errors'] => state.invoices.errors;

export default invoicesSlice.reducer;
