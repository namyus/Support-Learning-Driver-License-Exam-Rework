import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractApiError, type ApiRejectedPayload } from '../shared/apiError';
import { staffApi } from './staffApi';
import type {
  CreateStaffPayload,
  StaffRecord,
  StaffState,
  UpdateStaffPayload,
} from './staffTypes';

const initialState: StaffState = {
  list: [],
  currentStaff: null,
  selectedStaff: null,
  staffById: {},
  loading: {
    list: false,
    currentStaff: false,
    selectedStaff: false,
    createStaff: false,
    updateStaff: false,
    deleteStaff: false,
  },
  errors: {
    list: null,
    currentStaff: null,
    selectedStaff: null,
    createStaff: null,
    updateStaff: null,
    deleteStaff: null,
  },
};

export const fetchStaffList = createAsyncThunk<
  StaffRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('staff/fetchStaffList', async (_, { rejectWithValue }) => {
  try {
    const response = await staffApi.getStaffList();
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách nhân viên. Vui lòng thử lại.')
    );
  }
});

export const fetchStaffById = createAsyncThunk<
  { staffId: string; staff: StaffRecord | null },
  number | string,
  { rejectValue: ApiRejectedPayload }
>('staff/fetchStaffById', async (staffId, { rejectWithValue }) => {
  try {
    const response = await staffApi.getStaffById(staffId);
    return {
      staffId: String(staffId),
      staff: response.data ?? null,
    };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải thông tin nhân viên. Vui lòng thử lại.')
    );
  }
});

export const fetchStaffByUserId = createAsyncThunk<
  StaffRecord | null,
  number | string,
  { rejectValue: ApiRejectedPayload }
>('staff/fetchStaffByUserId', async (userId, { rejectWithValue }) => {
  try {
    const response = await staffApi.getStaffByUserId(userId);
    return response.data ?? null;
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải thông tin nhân viên.')
    );
  }
});

export const createStaff = createAsyncThunk<
  { status: number; data: unknown },
  CreateStaffPayload,
  { rejectValue: ApiRejectedPayload }
>('staff/createStaff', async (payload, { rejectWithValue }) => {
  try {
    const response = await staffApi.createStaff(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tạo nhân viên. Vui lòng thử lại.')
    );
  }
});

export const updateStaff = createAsyncThunk<
  { status: number; data: unknown },
  UpdateStaffPayload,
  { rejectValue: ApiRejectedPayload }
>('staff/updateStaff', async (payload, { rejectWithValue }) => {
  try {
    const response = await staffApi.updateStaff(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể cập nhật thông tin nhân viên. Vui lòng thử lại.')
    );
  }
});

export const deleteStaff = createAsyncThunk<
  string,
  number | string,
  { rejectValue: ApiRejectedPayload }
>('staff/deleteStaff', async (staffId, { rejectWithValue }) => {
  try {
    await staffApi.deleteStaff(staffId);
    return String(staffId);
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể xoá nhân viên. Vui lòng thử lại.')
    );
  }
});

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    clearStaffErrors(state) {
      state.errors = { ...initialState.errors };
    },
    clearSelectedStaff(state) {
      state.selectedStaff = null;
      state.errors.selectedStaff = null;
    },
    clearStaffState() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchStaffList.pending, (state) => {
        state.loading.list = true;
        state.errors.list = null;
      })
      .addCase(fetchStaffList.fulfilled, (state, action) => {
        state.loading.list = false;
        state.list = action.payload;
      })
      .addCase(fetchStaffList.rejected, (state, action) => {
        state.loading.list = false;
        state.errors.list =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchStaffById.pending, (state) => {
        state.loading.selectedStaff = true;
        state.errors.selectedStaff = null;
      })
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.loading.selectedStaff = false;
        state.selectedStaff = action.payload.staff;
        if (action.payload.staff) {
          state.staffById[action.payload.staffId] = action.payload.staff;
        }
      })
      .addCase(fetchStaffById.rejected, (state, action) => {
        state.loading.selectedStaff = false;
        state.errors.selectedStaff =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchStaffByUserId.pending, (state) => {
        state.loading.currentStaff = true;
        state.errors.currentStaff = null;
      })
      .addCase(fetchStaffByUserId.fulfilled, (state, action) => {
        state.loading.currentStaff = false;
        state.currentStaff = action.payload;
      })
      .addCase(fetchStaffByUserId.rejected, (state, action) => {
        state.loading.currentStaff = false;
        state.errors.currentStaff =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(createStaff.pending, (state) => {
        state.loading.createStaff = true;
        state.errors.createStaff = null;
      })
      .addCase(createStaff.fulfilled, (state) => {
        state.loading.createStaff = false;
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading.createStaff = false;
        state.errors.createStaff =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(updateStaff.pending, (state) => {
        state.loading.updateStaff = true;
        state.errors.updateStaff = null;
      })
      .addCase(updateStaff.fulfilled, (state) => {
        state.loading.updateStaff = false;
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.loading.updateStaff = false;
        state.errors.updateStaff =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(deleteStaff.pending, (state) => {
        state.loading.deleteStaff = true;
        state.errors.deleteStaff = null;
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.loading.deleteStaff = false;
        state.list = state.list.filter(
          (staff) => String(staff.staffId) !== action.payload
        );
      })
      .addCase(deleteStaff.rejected, (state, action) => {
        state.loading.deleteStaff = false;
        state.errors.deleteStaff =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      });
  },
});

export const { clearStaffErrors, clearSelectedStaff, clearStaffState } =
  staffSlice.actions;

export const selectStaffState = (state: { staff: StaffState }): StaffState =>
  state.staff;
export const selectStaffList = (state: { staff: StaffState }): StaffRecord[] =>
  state.staff.list;
export const selectCurrentStaff = (state: {
  staff: StaffState;
}): StaffRecord | null => state.staff.currentStaff;
export const selectSelectedStaff = (state: {
  staff: StaffState;
}): StaffRecord | null => state.staff.selectedStaff;
export const selectStaffLoading = (state: {
  staff: StaffState;
}): StaffState['loading'] => state.staff.loading;
export const selectStaffErrors = (state: {
  staff: StaffState;
}): StaffState['errors'] => state.staff.errors;

export default staffSlice.reducer;
