import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractApiError, type ApiRejectedPayload } from '../shared/apiError';
import { examsApi } from './examsApi';
import type {
  CreateExamPayload,
  ExamRecord,
  ExamsState,
  StudentQuestionRecord,
  TestRecord,
} from './examsTypes';

const initialState: ExamsState = {
  exams: [],
  tests: [],
  studentTest: null,
  studentQuestions: [],
  lastCheckAnswerResult: null,
  loading: {
    exams: false,
    createExam: false,
    tests: false,
    createTest: false,
    updateTestPass: false,
    studentTest: false,
    studentQuestions: false,
    checkStudentAnswer: false,
  },
  errors: {
    exams: null,
    createExam: null,
    tests: null,
    createTest: null,
    updateTestPass: null,
    studentTest: null,
    studentQuestions: null,
    checkStudentAnswer: null,
  },
};

export const fetchExams = createAsyncThunk<
  ExamRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('exams/fetchExams', async (_, { rejectWithValue }) => {
  try {
    const response = await examsApi.getExams();
    if (!Array.isArray(response.data)) {
      return rejectWithValue({
        message: 'Invalid Exam response',
        status: response.status,
      });
    }
    return response.data;
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách kỳ thi. Vui lòng thử lại.')
    );
  }
});

export const createExam = createAsyncThunk<
  { status: number; data: unknown },
  CreateExamPayload,
  { rejectValue: ApiRejectedPayload }
>('exams/createExam', async (payload, { rejectWithValue }) => {
  try {
    const response = await examsApi.createExam(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tạo kỳ thi. Vui lòng kiểm tra lại dữ liệu.')
    );
  }
});

export const fetchTests = createAsyncThunk<
  TestRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('exams/fetchTests', async (_, { rejectWithValue }) => {
  try {
    const response = await examsApi.getTests();
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải kết quả thi lúc này.')
    );
  }
});

export const createTestForExam = createAsyncThunk<
  { status: number; data: unknown },
  number | string,
  { rejectValue: ApiRejectedPayload }
>('exams/createTestForExam', async (examId, { rejectWithValue }) => {
  try {
    const response = await examsApi.createTestForExam(examId);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tạo bài thi.')
    );
  }
});

export const updateTestIsPass = createAsyncThunk<
  { status: number; data: unknown },
  string | number,
  { rejectValue: ApiRejectedPayload }
>('exams/updateTestIsPass', async (studentId, { rejectWithValue }) => {
  try {
    const response = await examsApi.updateTestIsPass(studentId);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể cập nhật trạng thái kết quả thi.')
    );
  }
});

export const fetchTestByStudentId = createAsyncThunk<
  TestRecord | null,
  string | number,
  { rejectValue: ApiRejectedPayload }
>('exams/fetchTestByStudentId', async (studentId, { rejectWithValue }) => {
  try {
    const response = await examsApi.getTestByStudentId(studentId);
    return response.data ?? null;
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải thông tin kỳ kiểm tra lý thuyết. Vui lòng thử lại.')
    );
  }
});

export const fetchStudentQuestions = createAsyncThunk<
  StudentQuestionRecord[],
  string | number,
  { rejectValue: ApiRejectedPayload }
>('exams/fetchStudentQuestions', async (studentId, { rejectWithValue }) => {
  try {
    const response = await examsApi.getStudentQuestions(studentId);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải đề kiểm tra lý thuyết. Vui lòng thử lại.')
    );
  }
});

export const checkStudentAnswer = createAsyncThunk<
  unknown,
  string[],
  { rejectValue: ApiRejectedPayload }
>('exams/checkStudentAnswer', async (answerStrings, { rejectWithValue }) => {
  try {
    const response = await examsApi.checkStudentAnswer(answerStrings);
    return response.data;
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể nộp bài thi. Vui lòng thử lại.')
    );
  }
});

const examsSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: {
    clearExamErrors(state) {
      state.errors = { ...initialState.errors };
    },
    clearExamState() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchExams.pending, (state) => {
        state.loading.exams = true;
        state.errors.exams = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.loading.exams = false;
        state.exams = action.payload;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.loading.exams = false;
        state.errors.exams =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(createExam.pending, (state) => {
        state.loading.createExam = true;
        state.errors.createExam = null;
      })
      .addCase(createExam.fulfilled, (state) => {
        state.loading.createExam = false;
      })
      .addCase(createExam.rejected, (state, action) => {
        state.loading.createExam = false;
        state.errors.createExam =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchTests.pending, (state) => {
        state.loading.tests = true;
        state.errors.tests = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading.tests = false;
        state.tests = action.payload;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading.tests = false;
        state.errors.tests =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(createTestForExam.pending, (state) => {
        state.loading.createTest = true;
        state.errors.createTest = null;
      })
      .addCase(createTestForExam.fulfilled, (state) => {
        state.loading.createTest = false;
      })
      .addCase(createTestForExam.rejected, (state, action) => {
        state.loading.createTest = false;
        state.errors.createTest =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(updateTestIsPass.pending, (state) => {
        state.loading.updateTestPass = true;
        state.errors.updateTestPass = null;
      })
      .addCase(updateTestIsPass.fulfilled, (state) => {
        state.loading.updateTestPass = false;
      })
      .addCase(updateTestIsPass.rejected, (state, action) => {
        state.loading.updateTestPass = false;
        state.errors.updateTestPass =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchTestByStudentId.pending, (state) => {
        state.loading.studentTest = true;
        state.errors.studentTest = null;
      })
      .addCase(fetchTestByStudentId.fulfilled, (state, action) => {
        state.loading.studentTest = false;
        state.studentTest = action.payload;
      })
      .addCase(fetchTestByStudentId.rejected, (state, action) => {
        state.loading.studentTest = false;
        state.studentTest = null;
        state.errors.studentTest =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchStudentQuestions.pending, (state) => {
        state.loading.studentQuestions = true;
        state.errors.studentQuestions = null;
      })
      .addCase(fetchStudentQuestions.fulfilled, (state, action) => {
        state.loading.studentQuestions = false;
        state.studentQuestions = action.payload;
      })
      .addCase(fetchStudentQuestions.rejected, (state, action) => {
        state.loading.studentQuestions = false;
        state.studentQuestions = [];
        state.errors.studentQuestions =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(checkStudentAnswer.pending, (state) => {
        state.loading.checkStudentAnswer = true;
        state.errors.checkStudentAnswer = null;
      })
      .addCase(checkStudentAnswer.fulfilled, (state, action) => {
        state.loading.checkStudentAnswer = false;
        state.lastCheckAnswerResult = action.payload;
      })
      .addCase(checkStudentAnswer.rejected, (state, action) => {
        state.loading.checkStudentAnswer = false;
        state.errors.checkStudentAnswer =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      });
  },
});

export const { clearExamErrors, clearExamState } = examsSlice.actions;

export const selectExamsState = (state: { exams: ExamsState }): ExamsState =>
  state.exams;
export const selectExamsList = (state: { exams: ExamsState }): ExamRecord[] =>
  state.exams.exams;
export const selectTestsList = (state: { exams: ExamsState }): TestRecord[] =>
  state.exams.tests;
export const selectStudentTest = (state: {
  exams: ExamsState;
}): TestRecord | null => state.exams.studentTest;
export const selectStudentQuestions = (state: {
  exams: ExamsState;
}): StudentQuestionRecord[] => state.exams.studentQuestions;
export const selectExamsLoading = (state: {
  exams: ExamsState;
}): ExamsState['loading'] => state.exams.loading;
export const selectExamsErrors = (state: {
  exams: ExamsState;
}): ExamsState['errors'] => state.exams.errors;

export default examsSlice.reducer;
