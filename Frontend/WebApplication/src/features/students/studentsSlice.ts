import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractApiError, type ApiRejectedPayload } from '../shared/apiError';
import { studentsApi } from './studentsApi';
import type { StudentRecord, StudentsState } from './studentsTypes';

const initialState: StudentsState = {
  list: [],
  currentStudent: null,
  studentsByMemberId: {},
  loading: {
    list: false,
    currentStudent: false,
  },
  errors: {
    list: null,
    currentStudent: null,
  },
};

export const fetchStudents = createAsyncThunk<
  StudentRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('students/fetchStudents', async (_, { rejectWithValue }) => {
  try {
    const response = await studentsApi.getStudents();
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách học viên. Vui lòng thử lại.')
    );
  }
});

export const fetchStudentByMemberId = createAsyncThunk<
  { memberId: string; student: StudentRecord | null },
  number | string,
  { rejectValue: ApiRejectedPayload }
>('students/fetchStudentByMemberId', async (memberId, { rejectWithValue }) => {
  try {
    const response = await studentsApi.getStudentByMemberId(memberId);
    return {
      memberId: String(memberId),
      student: response.data ?? null,
    };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải thông tin học viên.')
    );
  }
});

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearStudentErrors(state) {
      state.errors = { ...initialState.errors };
    },
    clearStudentState() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading.list = true;
        state.errors.list = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading.list = false;
        state.list = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading.list = false;
        state.errors.list =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchStudentByMemberId.pending, (state) => {
        state.loading.currentStudent = true;
        state.errors.currentStudent = null;
      })
      .addCase(fetchStudentByMemberId.fulfilled, (state, action) => {
        state.loading.currentStudent = false;
        state.currentStudent = action.payload.student;
        if (action.payload.student) {
          state.studentsByMemberId[action.payload.memberId] = action.payload.student;
        }
      })
      .addCase(fetchStudentByMemberId.rejected, (state, action) => {
        state.loading.currentStudent = false;
        state.errors.currentStudent =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      });
  },
});

export const { clearStudentErrors, clearStudentState } = studentsSlice.actions;

export const selectStudentsState = (state: {
  students: StudentsState;
}): StudentsState => state.students;
export const selectStudentsList = (state: {
  students: StudentsState;
}): StudentRecord[] => state.students.list;
export const selectCurrentStudent = (state: {
  students: StudentsState;
}): StudentRecord | null => state.students.currentStudent;
export const selectStudentsLoading = (state: {
  students: StudentsState;
}): StudentsState['loading'] => state.students.loading;
export const selectStudentsErrors = (state: {
  students: StudentsState;
}): StudentsState['errors'] => state.students.errors;

export default studentsSlice.reducer;
