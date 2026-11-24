import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractApiError, type ApiRejectedPayload } from '../shared/apiError';
import { mentorsApi } from './mentorsApi';
import type {
  CreateMentorPayload,
  MentorRecord,
  MentorsState,
  UpdateMentorPayload,
} from './mentorsTypes';

const initialState: MentorsState = {
  list: [],
  theoryList: [],
  currentMentor: null,
  selectedMentor: null,
  mentorsById: {},
  loading: {
    list: false,
    theoryList: false,
    currentMentor: false,
    selectedMentor: false,
    createMentor: false,
    updateMentor: false,
    deleteMentor: false,
  },
  errors: {
    list: null,
    theoryList: null,
    currentMentor: null,
    selectedMentor: null,
    createMentor: null,
    updateMentor: null,
    deleteMentor: null,
  },
};

export const fetchMentors = createAsyncThunk<
  MentorRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('mentors/fetchMentors', async (_, { rejectWithValue }) => {
  try {
    const response = await mentorsApi.getMentorList();
    if (!Array.isArray(response.data)) {
      return rejectWithValue({ message: 'Invalid Mentor response' });
    }
    return response.data;
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách giáo viên. Vui lòng thử lại.')
    );
  }
});

export const fetchTheoryMentors = createAsyncThunk<
  MentorRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('mentors/fetchTheoryMentors', async (_, { rejectWithValue }) => {
  try {
    const response = await mentorsApi.getTheoryMentors();
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách giáo viên lý thuyết.')
    );
  }
});

export const fetchMentorById = createAsyncThunk<
  { mentorId: string; mentor: MentorRecord | null },
  number | string,
  { rejectValue: ApiRejectedPayload }
>('mentors/fetchMentorById', async (mentorId, { rejectWithValue }) => {
  try {
    const response = await mentorsApi.getMentorById(mentorId);
    return {
      mentorId: String(mentorId),
      mentor: response.data ?? null,
    };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải thông tin giáo viên. Vui lòng thử lại.')
    );
  }
});

export const fetchMentorByUserId = createAsyncThunk<
  MentorRecord | null,
  number | string,
  { rejectValue: ApiRejectedPayload }
>('mentors/fetchMentorByUserId', async (userId, { rejectWithValue }) => {
  try {
    const response = await mentorsApi.getMentorByUserId(userId);
    return response.data ?? null;
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải hồ sơ giảng viên từ máy chủ.')
    );
  }
});

export const createMentor = createAsyncThunk<
  { status: number; data: unknown },
  CreateMentorPayload,
  { rejectValue: ApiRejectedPayload }
>('mentors/createMentor', async (payload, { rejectWithValue }) => {
  try {
    const response = await mentorsApi.createMentor(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tạo giáo viên. Vui lòng thử lại.')
    );
  }
});

export const updateMentor = createAsyncThunk<
  { status: number; data: unknown },
  UpdateMentorPayload,
  { rejectValue: ApiRejectedPayload }
>('mentors/updateMentor', async (payload, { rejectWithValue }) => {
  try {
    const response = await mentorsApi.updateMentor(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể cập nhật thông tin giáo viên. Vui lòng thử lại.')
    );
  }
});

export const deleteMentor = createAsyncThunk<
  string,
  number | string,
  { rejectValue: ApiRejectedPayload }
>('mentors/deleteMentor', async (mentorId, { rejectWithValue }) => {
  try {
    await mentorsApi.deleteMentor(mentorId);
    return String(mentorId);
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể xoá giáo viên. Vui lòng thử lại.')
    );
  }
});

const mentorsSlice = createSlice({
  name: 'mentors',
  initialState,
  reducers: {
    clearMentorErrors(state) {
      state.errors = { ...initialState.errors };
    },
    clearSelectedMentor(state) {
      state.selectedMentor = null;
      state.errors.selectedMentor = null;
    },
    clearMentorState() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMentors.pending, (state) => {
        state.loading.list = true;
        state.errors.list = null;
      })
      .addCase(fetchMentors.fulfilled, (state, action) => {
        state.loading.list = false;
        state.list = action.payload;
      })
      .addCase(fetchMentors.rejected, (state, action) => {
        state.loading.list = false;
        state.errors.list =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchTheoryMentors.pending, (state) => {
        state.loading.theoryList = true;
        state.errors.theoryList = null;
      })
      .addCase(fetchTheoryMentors.fulfilled, (state, action) => {
        state.loading.theoryList = false;
        state.theoryList = action.payload;
      })
      .addCase(fetchTheoryMentors.rejected, (state, action) => {
        state.loading.theoryList = false;
        state.errors.theoryList =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchMentorById.pending, (state) => {
        state.loading.selectedMentor = true;
        state.errors.selectedMentor = null;
      })
      .addCase(fetchMentorById.fulfilled, (state, action) => {
        state.loading.selectedMentor = false;
        state.selectedMentor = action.payload.mentor;
        if (action.payload.mentor) {
          state.mentorsById[action.payload.mentorId] = action.payload.mentor;
        }
      })
      .addCase(fetchMentorById.rejected, (state, action) => {
        state.loading.selectedMentor = false;
        state.errors.selectedMentor =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchMentorByUserId.pending, (state) => {
        state.loading.currentMentor = true;
        state.errors.currentMentor = null;
      })
      .addCase(fetchMentorByUserId.fulfilled, (state, action) => {
        state.loading.currentMentor = false;
        state.currentMentor = action.payload;
      })
      .addCase(fetchMentorByUserId.rejected, (state, action) => {
        state.loading.currentMentor = false;
        state.errors.currentMentor =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(createMentor.pending, (state) => {
        state.loading.createMentor = true;
        state.errors.createMentor = null;
      })
      .addCase(createMentor.fulfilled, (state) => {
        state.loading.createMentor = false;
      })
      .addCase(createMentor.rejected, (state, action) => {
        state.loading.createMentor = false;
        state.errors.createMentor =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(updateMentor.pending, (state) => {
        state.loading.updateMentor = true;
        state.errors.updateMentor = null;
      })
      .addCase(updateMentor.fulfilled, (state) => {
        state.loading.updateMentor = false;
      })
      .addCase(updateMentor.rejected, (state, action) => {
        state.loading.updateMentor = false;
        state.errors.updateMentor =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(deleteMentor.pending, (state) => {
        state.loading.deleteMentor = true;
        state.errors.deleteMentor = null;
      })
      .addCase(deleteMentor.fulfilled, (state, action) => {
        state.loading.deleteMentor = false;
        state.list = state.list.filter(
          (mentor) => String(mentor.mentorId) !== action.payload
        );
      })
      .addCase(deleteMentor.rejected, (state, action) => {
        state.loading.deleteMentor = false;
        state.errors.deleteMentor =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      });
  },
});

export const { clearMentorErrors, clearSelectedMentor, clearMentorState } =
  mentorsSlice.actions;

export const selectMentorsState = (state: {
  mentors: MentorsState;
}): MentorsState => state.mentors;
export const selectMentorsList = (state: {
  mentors: MentorsState;
}): MentorRecord[] => state.mentors.list;
export const selectTheoryMentors = (state: {
  mentors: MentorsState;
}): MentorRecord[] => state.mentors.theoryList;
export const selectCurrentMentor = (state: {
  mentors: MentorsState;
}): MentorRecord | null => state.mentors.currentMentor;
export const selectSelectedMentor = (state: {
  mentors: MentorsState;
}): MentorRecord | null => state.mentors.selectedMentor;
export const selectMentorsLoading = (state: {
  mentors: MentorsState;
}): MentorsState['loading'] => state.mentors.loading;
export const selectMentorsErrors = (state: {
  mentors: MentorsState;
}): MentorsState['errors'] => state.mentors.errors;

export default mentorsSlice.reducer;
