import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractApiError, type ApiRejectedPayload } from '../shared/apiError';
import { classesApi } from './classesApi';
import type {
  AddCurriculumPayload,
  AttendanceStudentRecord,
  ClassesState,
  ClassRecord,
  CreatePracticeLessonPayload,
  CreateTheoryLessonPayload,
  CurriculumRecord,
  LessonAttendanceQuery,
  LessonRecord,
  PracticeClassByMentorItem,
  PracticeClassQuery,
  RegisterClassStudentPayload,
  TeachingScheduleQuery,
  UpdateAttendanceItem,
} from './classesTypes';

const initialState: ClassesState = {
  list: [],
  mentorClasses: [],
  practiceClasses: [],
  classDates: [],
  curriculumList: [],
  lessonsByClassId: {},
  theoryLessons: [],
  practiceLessons: [],
  teachingSchedule: [],
  attendanceList: [],
  loading: {
    list: false,
    mentorClasses: false,
    practiceClasses: false,
    classDates: false,
    curriculumList: false,
    lessonsByClassId: false,
    theoryLessons: false,
    practiceLessons: false,
    teachingSchedule: false,
    attendanceList: false,
    addPracticeClasses: false,
    registerClassStudent: false,
    addCurriculum: false,
    updateAttendance: false,
    updateStudentAttendance: false,
    createTheoryLesson: false,
    createPracticeLesson: false,
    createPracticeLessonAuto: false,
  },
  errors: {
    list: null,
    mentorClasses: null,
    practiceClasses: null,
    classDates: null,
    curriculumList: null,
    lessonsByClassId: null,
    theoryLessons: null,
    practiceLessons: null,
    teachingSchedule: null,
    attendanceList: null,
    addPracticeClasses: null,
    registerClassStudent: null,
    addCurriculum: null,
    updateAttendance: null,
    updateStudentAttendance: null,
    createTheoryLesson: null,
    createPracticeLesson: null,
    createPracticeLessonAuto: null,
  },
};

export const fetchClasses = createAsyncThunk<
  ClassRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('classes/fetchClasses', async (_, { rejectWithValue }) => {
  try {
    const response = await classesApi.getClasses();
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách lớp học. Vui lòng thử lại.')
    );
  }
});

export const fetchClassesByMentorId = createAsyncThunk<
  ClassRecord[],
  number | string,
  { rejectValue: ApiRejectedPayload }
>('classes/fetchClassesByMentorId', async (mentorId, { rejectWithValue }) => {
  try {
    const response = await classesApi.getClassesByMentorId(mentorId);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách lớp phụ trách.')
    );
  }
});

export const fetchClassDates = createAsyncThunk<
  string[],
  number | string,
  { rejectValue: ApiRejectedPayload }
>('classes/fetchClassDates', async (classId, { rejectWithValue }) => {
  try {
    const response = await classesApi.getClassDates(classId);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách ngày học của lớp.')
    );
  }
});

export const fetchPracticeClassesByCourseAndMentor = createAsyncThunk<
  ClassRecord[],
  PracticeClassQuery,
  { rejectValue: ApiRejectedPayload }
>(
  'classes/fetchPracticeClassesByCourseAndMentor',
  async (query, { rejectWithValue }) => {
    try {
      const response = await classesApi.getPracticeClassesByCourseAndMentor(query);
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      return rejectWithValue(
        extractApiError(err, 'Không thể tải danh sách ca học thực hành.')
      );
    }
  }
);

export const addPracticeClassesByMentor = createAsyncThunk<
  { status: number; data: unknown },
  PracticeClassByMentorItem[],
  { rejectValue: ApiRejectedPayload }
>('classes/addPracticeClassesByMentor', async (payload, { rejectWithValue }) => {
  try {
    const response = await classesApi.addPracticeClassesByMentor(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(
        err,
        'Không thể đăng ký lịch dạy lúc này. Vui lòng kiểm tra và thử lại.'
      )
    );
  }
});

export const registerClassStudent = createAsyncThunk<
  { status: number; data: unknown },
  RegisterClassStudentPayload,
  { rejectValue: ApiRejectedPayload }
>('classes/registerClassStudent', async (payload, { rejectWithValue }) => {
  try {
    const response = await classesApi.registerClassStudent(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(
        err,
        'Không thể đăng ký lớp thực hành này. Vui lòng kiểm tra thông tin hoặc liên hệ trung tâm.'
      )
    );
  }
});

export const fetchCurriculumList = createAsyncThunk<
  CurriculumRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('classes/fetchCurriculumList', async (_, { rejectWithValue }) => {
  try {
    const response = await classesApi.getCurriculumList();
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách chương trình học.')
    );
  }
});

export const addCurriculum = createAsyncThunk<
  { status: number; data: unknown },
  AddCurriculumPayload,
  { rejectValue: ApiRejectedPayload }
>('classes/addCurriculum', async (payload, { rejectWithValue }) => {
  try {
    const response = await classesApi.addCurriculum(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể thêm nội dung mới.')
    );
  }
});

export const fetchLessonsByClassId = createAsyncThunk<
  { classId: string; lessons: LessonRecord[] },
  number | string,
  { rejectValue: ApiRejectedPayload }
>('classes/fetchLessonsByClassId', async (classId, { rejectWithValue }) => {
  try {
    const response = await classesApi.getLessonsByClassId(classId);
    return {
      classId: String(classId),
      lessons: Array.isArray(response.data) ? response.data : [],
    };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách buổi học của lớp.')
    );
  }
});

export const fetchTheoryLessonsByStudentId = createAsyncThunk<
  LessonRecord[],
  number | string,
  { rejectValue: ApiRejectedPayload }
>(
  'classes/fetchTheoryLessonsByStudentId',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await classesApi.getTheoryLessonsByStudentId(studentId);
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      return rejectWithValue(
        extractApiError(err, 'Không thể tải lịch học lý thuyết. Vui lòng thử lại sau.')
      );
    }
  }
);

export const fetchPracticeLessonsByStudentId = createAsyncThunk<
  LessonRecord[],
  number | string,
  { rejectValue: ApiRejectedPayload }
>(
  'classes/fetchPracticeLessonsByStudentId',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await classesApi.getPracticeLessonsByStudentId(studentId);
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      return rejectWithValue(
        extractApiError(err, 'Không thể tải lịch học thực hành. Vui lòng thử lại sau.')
      );
    }
  }
);

export const fetchMentorTeachingSchedule = createAsyncThunk<
  LessonRecord[],
  TeachingScheduleQuery,
  { rejectValue: ApiRejectedPayload }
>('classes/fetchMentorTeachingSchedule', async (query, { rejectWithValue }) => {
  try {
    const response = await classesApi.getMentorTeachingSchedule(query);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải dữ liệu lịch dạy cho tuần đã chọn.')
    );
  }
});

export const fetchLessonAttendance = createAsyncThunk<
  AttendanceStudentRecord[],
  LessonAttendanceQuery,
  { rejectValue: ApiRejectedPayload }
>('classes/fetchLessonAttendance', async (query, { rejectWithValue }) => {
  try {
    const response = await classesApi.getLessonAttendance(query);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải danh sách điểm danh của lớp học này.')
    );
  }
});

export const updateLessonAttendance = createAsyncThunk<
  { status: number; data: unknown },
  UpdateAttendanceItem[],
  { rejectValue: ApiRejectedPayload }
>('classes/updateLessonAttendance', async (payload, { rejectWithValue }) => {
  try {
    const response = await classesApi.updateLessonAttendance(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể cập nhật điểm danh.')
    );
  }
});

export const updateStudentAttendance = createAsyncThunk<
  { status: number; data: unknown },
  number | string,
  { rejectValue: ApiRejectedPayload }
>('classes/updateStudentAttendance', async (studentId, { rejectWithValue }) => {
  try {
    const response = await classesApi.updateStudentAttendance(studentId);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể cập nhật điểm danh. Vui lòng thử lại.')
    );
  }
});

export const createTheoryLesson = createAsyncThunk<
  { status: number; data: unknown },
  CreateTheoryLessonPayload,
  { rejectValue: ApiRejectedPayload }
>('classes/createTheoryLesson', async (payload, { rejectWithValue }) => {
  try {
    const response = await classesApi.createTheoryLesson(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(
        err,
        'Không thể tạo lịch học lý thuyết. Vui lòng kiểm tra lại dữ liệu.'
      )
    );
  }
});

export const createPracticeLesson = createAsyncThunk<
  { status: number; data: unknown },
  CreatePracticeLessonPayload,
  { rejectValue: ApiRejectedPayload }
>('classes/createPracticeLesson', async (payload, { rejectWithValue }) => {
  try {
    const response = await classesApi.createPracticeLesson(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(
        err,
        'Không thể tạo lịch học thực hành. Vui lòng kiểm tra lại dữ liệu.'
      )
    );
  }
});

export const createPracticeLessonAuto = createAsyncThunk<
  { status: number; data: unknown },
  string,
  { rejectValue: ApiRejectedPayload }
>('classes/createPracticeLessonAuto', async (courseId, { rejectWithValue }) => {
  try {
    const response = await classesApi.createPracticeLessonAuto(courseId);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tự động tạo lịch thực hành.')
    );
  }
});

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    clearClassErrors(state) {
      state.errors = { ...initialState.errors };
    },
    clearClassState() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.loading.list = true;
        state.errors.list = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading.list = false;
        state.list = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading.list = false;
        state.errors.list =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchClassesByMentorId.pending, (state) => {
        state.loading.mentorClasses = true;
        state.errors.mentorClasses = null;
      })
      .addCase(fetchClassesByMentorId.fulfilled, (state, action) => {
        state.loading.mentorClasses = false;
        state.mentorClasses = action.payload;
      })
      .addCase(fetchClassesByMentorId.rejected, (state, action) => {
        state.loading.mentorClasses = false;
        state.errors.mentorClasses =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchClassDates.pending, (state) => {
        state.loading.classDates = true;
        state.errors.classDates = null;
      })
      .addCase(fetchClassDates.fulfilled, (state, action) => {
        state.loading.classDates = false;
        state.classDates = action.payload;
      })
      .addCase(fetchClassDates.rejected, (state, action) => {
        state.loading.classDates = false;
        state.errors.classDates =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchPracticeClassesByCourseAndMentor.pending, (state) => {
        state.loading.practiceClasses = true;
        state.errors.practiceClasses = null;
      })
      .addCase(fetchPracticeClassesByCourseAndMentor.fulfilled, (state, action) => {
        state.loading.practiceClasses = false;
        state.practiceClasses = action.payload;
      })
      .addCase(fetchPracticeClassesByCourseAndMentor.rejected, (state, action) => {
        state.loading.practiceClasses = false;
        state.errors.practiceClasses =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(addPracticeClassesByMentor.pending, (state) => {
        state.loading.addPracticeClasses = true;
        state.errors.addPracticeClasses = null;
      })
      .addCase(addPracticeClassesByMentor.fulfilled, (state) => {
        state.loading.addPracticeClasses = false;
      })
      .addCase(addPracticeClassesByMentor.rejected, (state, action) => {
        state.loading.addPracticeClasses = false;
        state.errors.addPracticeClasses =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(registerClassStudent.pending, (state) => {
        state.loading.registerClassStudent = true;
        state.errors.registerClassStudent = null;
      })
      .addCase(registerClassStudent.fulfilled, (state) => {
        state.loading.registerClassStudent = false;
      })
      .addCase(registerClassStudent.rejected, (state, action) => {
        state.loading.registerClassStudent = false;
        state.errors.registerClassStudent =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchCurriculumList.pending, (state) => {
        state.loading.curriculumList = true;
        state.errors.curriculumList = null;
      })
      .addCase(fetchCurriculumList.fulfilled, (state, action) => {
        state.loading.curriculumList = false;
        state.curriculumList = action.payload;
      })
      .addCase(fetchCurriculumList.rejected, (state, action) => {
        state.loading.curriculumList = false;
        state.errors.curriculumList =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(addCurriculum.pending, (state) => {
        state.loading.addCurriculum = true;
        state.errors.addCurriculum = null;
      })
      .addCase(addCurriculum.fulfilled, (state) => {
        state.loading.addCurriculum = false;
      })
      .addCase(addCurriculum.rejected, (state, action) => {
        state.loading.addCurriculum = false;
        state.errors.addCurriculum =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchLessonsByClassId.pending, (state) => {
        state.loading.lessonsByClassId = true;
        state.errors.lessonsByClassId = null;
      })
      .addCase(fetchLessonsByClassId.fulfilled, (state, action) => {
        state.loading.lessonsByClassId = false;
        state.lessonsByClassId[action.payload.classId] = action.payload.lessons;
      })
      .addCase(fetchLessonsByClassId.rejected, (state, action) => {
        state.loading.lessonsByClassId = false;
        state.errors.lessonsByClassId =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchTheoryLessonsByStudentId.pending, (state) => {
        state.loading.theoryLessons = true;
        state.errors.theoryLessons = null;
      })
      .addCase(fetchTheoryLessonsByStudentId.fulfilled, (state, action) => {
        state.loading.theoryLessons = false;
        state.theoryLessons = action.payload;
      })
      .addCase(fetchTheoryLessonsByStudentId.rejected, (state, action) => {
        state.loading.theoryLessons = false;
        state.errors.theoryLessons =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchPracticeLessonsByStudentId.pending, (state) => {
        state.loading.practiceLessons = true;
        state.errors.practiceLessons = null;
      })
      .addCase(fetchPracticeLessonsByStudentId.fulfilled, (state, action) => {
        state.loading.practiceLessons = false;
        state.practiceLessons = action.payload;
      })
      .addCase(fetchPracticeLessonsByStudentId.rejected, (state, action) => {
        state.loading.practiceLessons = false;
        state.errors.practiceLessons =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchMentorTeachingSchedule.pending, (state) => {
        state.loading.teachingSchedule = true;
        state.errors.teachingSchedule = null;
      })
      .addCase(fetchMentorTeachingSchedule.fulfilled, (state, action) => {
        state.loading.teachingSchedule = false;
        state.teachingSchedule = action.payload;
      })
      .addCase(fetchMentorTeachingSchedule.rejected, (state, action) => {
        state.loading.teachingSchedule = false;
        state.errors.teachingSchedule =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchLessonAttendance.pending, (state) => {
        state.loading.attendanceList = true;
        state.errors.attendanceList = null;
      })
      .addCase(fetchLessonAttendance.fulfilled, (state, action) => {
        state.loading.attendanceList = false;
        state.attendanceList = action.payload;
      })
      .addCase(fetchLessonAttendance.rejected, (state, action) => {
        state.loading.attendanceList = false;
        state.errors.attendanceList =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(updateLessonAttendance.pending, (state) => {
        state.loading.updateAttendance = true;
        state.errors.updateAttendance = null;
      })
      .addCase(updateLessonAttendance.fulfilled, (state) => {
        state.loading.updateAttendance = false;
      })
      .addCase(updateLessonAttendance.rejected, (state, action) => {
        state.loading.updateAttendance = false;
        state.errors.updateAttendance =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(updateStudentAttendance.pending, (state) => {
        state.loading.updateStudentAttendance = true;
        state.errors.updateStudentAttendance = null;
      })
      .addCase(updateStudentAttendance.fulfilled, (state) => {
        state.loading.updateStudentAttendance = false;
      })
      .addCase(updateStudentAttendance.rejected, (state, action) => {
        state.loading.updateStudentAttendance = false;
        state.errors.updateStudentAttendance =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(createTheoryLesson.pending, (state) => {
        state.loading.createTheoryLesson = true;
        state.errors.createTheoryLesson = null;
      })
      .addCase(createTheoryLesson.fulfilled, (state) => {
        state.loading.createTheoryLesson = false;
      })
      .addCase(createTheoryLesson.rejected, (state, action) => {
        state.loading.createTheoryLesson = false;
        state.errors.createTheoryLesson =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(createPracticeLesson.pending, (state) => {
        state.loading.createPracticeLesson = true;
        state.errors.createPracticeLesson = null;
      })
      .addCase(createPracticeLesson.fulfilled, (state) => {
        state.loading.createPracticeLesson = false;
      })
      .addCase(createPracticeLesson.rejected, (state, action) => {
        state.loading.createPracticeLesson = false;
        state.errors.createPracticeLesson =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(createPracticeLessonAuto.pending, (state) => {
        state.loading.createPracticeLessonAuto = true;
        state.errors.createPracticeLessonAuto = null;
      })
      .addCase(createPracticeLessonAuto.fulfilled, (state) => {
        state.loading.createPracticeLessonAuto = false;
      })
      .addCase(createPracticeLessonAuto.rejected, (state, action) => {
        state.loading.createPracticeLessonAuto = false;
        state.errors.createPracticeLessonAuto =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      });
  },
});

export const { clearClassErrors, clearClassState } = classesSlice.actions;

export const selectClassesState = (state: {
  classes: ClassesState;
}): ClassesState => state.classes;
export const selectClassesList = (state: {
  classes: ClassesState;
}): ClassRecord[] => state.classes.list;
export const selectMentorClasses = (state: {
  classes: ClassesState;
}): ClassRecord[] => state.classes.mentorClasses;
export const selectCurriculumList = (state: {
  classes: ClassesState;
}): CurriculumRecord[] => state.classes.curriculumList;
export const selectTeachingSchedule = (state: {
  classes: ClassesState;
}): LessonRecord[] => state.classes.teachingSchedule;
export const selectClassesLoading = (state: {
  classes: ClassesState;
}): ClassesState['loading'] => state.classes.loading;
export const selectClassesErrors = (state: {
  classes: ClassesState;
}): ClassesState['errors'] => state.classes.errors;

export default classesSlice.reducer;
