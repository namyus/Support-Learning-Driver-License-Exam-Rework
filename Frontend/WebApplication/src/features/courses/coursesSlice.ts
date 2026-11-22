import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { coursesApi, extractCourseApiError } from './coursesApi';
import type {
  AddCourseContentPayload,
  ApiRejectedPayload,
  CourseContentRecord,
  CourseDetailRecord,
  CourseMonthQuery,
  CourseRecord,
  CoursesState,
  CreateCourseDetailsItem,
  CreateCoursePayload,
  UpdateCoursePayload,
} from './coursesTypes';

const initialState: CoursesState = {
  list: [],
  inactiveList: [],
  monthCourses: [],
  currentCourse: null,
  courseDetailsByMonth: [],
  courseDetailsByCourseId: {},
  courseContents: [],
  loading: {
    list: false,
    inactiveList: false,
    monthCourses: false,
    currentCourse: false,
    courseDetailsByMonth: false,
    courseDetailsByCourseId: false,
    courseContents: false,
    createCourse: false,
    updateCourse: false,
    activateCourse: false,
    deactivateCourse: false,
    addCourseContent: false,
    addCourseDetails: false,
  },
  errors: {
    list: null,
    inactiveList: null,
    monthCourses: null,
    currentCourse: null,
    courseDetailsByMonth: null,
    courseDetailsByCourseId: null,
    courseContents: null,
    createCourse: null,
    updateCourse: null,
    activateCourse: null,
    deactivateCourse: null,
    addCourseContent: null,
    addCourseDetails: null,
  },
};

export const fetchCourseList = createAsyncThunk<
  CourseRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('courses/fetchCourseList', async (_, { rejectWithValue }) => {
  try {
    const response = await coursesApi.getCourseList();
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Không thể tải danh sách khóa học.'));
  }
});

export const fetchInactiveCourses = createAsyncThunk<
  CourseRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('courses/fetchInactiveCourses', async (_, { rejectWithValue }) => {
  try {
    const response = await coursesApi.getInactiveCourses();
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Không thể tải danh sách khoá học chưa mở.'));
  }
});

export const fetchCourseById = createAsyncThunk<
  CourseRecord,
  string,
  { rejectValue: ApiRejectedPayload }
>('courses/fetchCourseById', async (courseId, { rejectWithValue }) => {
  try {
    const response = await coursesApi.getCourseById(courseId);
    return response.data;
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Không thể tải thông tin khoá học.'));
  }
});

export const fetchCoursesByMonth = createAsyncThunk<
  CourseRecord[],
  CourseMonthQuery,
  { rejectValue: ApiRejectedPayload }
>('courses/fetchCoursesByMonth', async (query, { rejectWithValue }) => {
  try {
    const response = await coursesApi.getCoursesByMonth(query);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Không thể tải thông tin khóa học.'));
  }
});

export const createCourse = createAsyncThunk<
  { status: number; data: unknown },
  Partial<CreateCoursePayload>,
  { rejectValue: ApiRejectedPayload }
>('courses/createCourse', async (payload, { rejectWithValue }) => {
  try {
    const response = await coursesApi.createCourse(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Không thể tạo khoá học.'));
  }
});

export const updateCourse = createAsyncThunk<
  { status: number; data: unknown },
  UpdateCoursePayload,
  { rejectValue: ApiRejectedPayload }
>('courses/updateCourse', async (payload, { rejectWithValue }) => {
  try {
    const response = await coursesApi.updateCourse(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Cập nhật khoá học thất bại.'));
  }
});

export const activateCourse = createAsyncThunk<
  { courseId: string; status: number },
  string,
  { rejectValue: ApiRejectedPayload }
>('courses/activateCourse', async (courseId, { rejectWithValue }) => {
  try {
    const response = await coursesApi.activateCourse(courseId);
    return { courseId, status: response.status };
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Kích hoạt khoá học thất bại'));
  }
});

export const deactivateCourse = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiRejectedPayload }
>('courses/deactivateCourse', async (courseId, { rejectWithValue }) => {
  try {
    await coursesApi.deactivateCourse(courseId);
    return courseId;
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Ngưng kích hoạt khoá học thất bại.'));
  }
});

export const fetchCourseDetailsByMonth = createAsyncThunk<
  CourseDetailRecord[],
  string | number | undefined,
  { rejectValue: ApiRejectedPayload }
>('courses/fetchCourseDetailsByMonth', async (courseMonth, { rejectWithValue }) => {
  try {
    const response = await coursesApi.getCourseDetailsByMonth(courseMonth);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Không thể tải chi tiết khóa học.'));
  }
});

export const fetchCourseDetailsByCourseId = createAsyncThunk<
  { courseId: string; details: CourseDetailRecord[] },
  string,
  { rejectValue: ApiRejectedPayload }
>('courses/fetchCourseDetailsByCourseId', async (courseId, { rejectWithValue }) => {
  try {
    const response = await coursesApi.getCourseDetailsByCourseId(courseId);
    return {
      courseId,
      details: Array.isArray(response.data) ? response.data : [],
    };
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Không thể tải chi tiết khóa học.'));
  }
});

export const addCourseDetails = createAsyncThunk<
  { status: number; data: unknown },
  CreateCourseDetailsItem[],
  { rejectValue: ApiRejectedPayload }
>('courses/addCourseDetails', async (payload, { rejectWithValue }) => {
  try {
    const response = await coursesApi.addCourseDetails(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Không thể lưu chi tiết khoá học.'));
  }
});

export const fetchCourseContents = createAsyncThunk<
  CourseContentRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('courses/fetchCourseContents', async (_, { rejectWithValue }) => {
  try {
    const response = await coursesApi.getCourseContents();
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Không thể tải danh mục nội dung khoá học.'));
  }
});

export const addCourseContent = createAsyncThunk<
  { status: number; data: unknown },
  AddCourseContentPayload,
  { rejectValue: ApiRejectedPayload }
>('courses/addCourseContent', async (payload, { rejectWithValue }) => {
  try {
    const response = await coursesApi.addCourseContent(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(extractCourseApiError(err, 'Không thể thêm nội dung khoá học.'));
  }
});

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCourseErrors(state) {
      state.errors = { ...initialState.errors };
    },
    clearCourseState() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCourseList.pending, (state) => {
        state.loading.list = true;
        state.errors.list = null;
      })
      .addCase(fetchCourseList.fulfilled, (state, action) => {
        state.loading.list = false;
        state.list = action.payload;
      })
      .addCase(fetchCourseList.rejected, (state, action) => {
        state.loading.list = false;
        state.errors.list = action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchInactiveCourses.pending, (state) => {
        state.loading.inactiveList = true;
        state.errors.inactiveList = null;
      })
      .addCase(fetchInactiveCourses.fulfilled, (state, action) => {
        state.loading.inactiveList = false;
        state.inactiveList = action.payload;
      })
      .addCase(fetchInactiveCourses.rejected, (state, action) => {
        state.loading.inactiveList = false;
        state.errors.inactiveList =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchCourseById.pending, (state) => {
        state.loading.currentCourse = true;
        state.errors.currentCourse = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading.currentCourse = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading.currentCourse = false;
        state.errors.currentCourse =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchCoursesByMonth.pending, (state) => {
        state.loading.monthCourses = true;
        state.errors.monthCourses = null;
      })
      .addCase(fetchCoursesByMonth.fulfilled, (state, action) => {
        state.loading.monthCourses = false;
        state.monthCourses = action.payload;
      })
      .addCase(fetchCoursesByMonth.rejected, (state, action) => {
        state.loading.monthCourses = false;
        state.errors.monthCourses =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(createCourse.pending, (state) => {
        state.loading.createCourse = true;
        state.errors.createCourse = null;
      })
      .addCase(createCourse.fulfilled, (state) => {
        state.loading.createCourse = false;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading.createCourse = false;
        state.errors.createCourse =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(updateCourse.pending, (state) => {
        state.loading.updateCourse = true;
        state.errors.updateCourse = null;
      })
      .addCase(updateCourse.fulfilled, (state) => {
        state.loading.updateCourse = false;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading.updateCourse = false;
        state.errors.updateCourse =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(activateCourse.pending, (state) => {
        state.loading.activateCourse = true;
        state.errors.activateCourse = null;
      })
      .addCase(activateCourse.fulfilled, (state) => {
        state.loading.activateCourse = false;
      })
      .addCase(activateCourse.rejected, (state, action) => {
        state.loading.activateCourse = false;
        state.errors.activateCourse =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(deactivateCourse.pending, (state) => {
        state.loading.deactivateCourse = true;
        state.errors.deactivateCourse = null;
      })
      .addCase(deactivateCourse.fulfilled, (state, action) => {
        state.loading.deactivateCourse = false;
        state.list = state.list.filter((course) => course.courseId !== action.payload);
      })
      .addCase(deactivateCourse.rejected, (state, action) => {
        state.loading.deactivateCourse = false;
        state.errors.deactivateCourse =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchCourseDetailsByMonth.pending, (state) => {
        state.loading.courseDetailsByMonth = true;
        state.errors.courseDetailsByMonth = null;
      })
      .addCase(fetchCourseDetailsByMonth.fulfilled, (state, action) => {
        state.loading.courseDetailsByMonth = false;
        state.courseDetailsByMonth = action.payload;
      })
      .addCase(fetchCourseDetailsByMonth.rejected, (state, action) => {
        state.loading.courseDetailsByMonth = false;
        state.errors.courseDetailsByMonth =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchCourseDetailsByCourseId.pending, (state) => {
        state.loading.courseDetailsByCourseId = true;
        state.errors.courseDetailsByCourseId = null;
      })
      .addCase(fetchCourseDetailsByCourseId.fulfilled, (state, action) => {
        state.loading.courseDetailsByCourseId = false;
        state.courseDetailsByCourseId[action.payload.courseId] = action.payload.details;
      })
      .addCase(fetchCourseDetailsByCourseId.rejected, (state, action) => {
        state.loading.courseDetailsByCourseId = false;
        state.errors.courseDetailsByCourseId =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(addCourseDetails.pending, (state) => {
        state.loading.addCourseDetails = true;
        state.errors.addCourseDetails = null;
      })
      .addCase(addCourseDetails.fulfilled, (state) => {
        state.loading.addCourseDetails = false;
      })
      .addCase(addCourseDetails.rejected, (state, action) => {
        state.loading.addCourseDetails = false;
        state.errors.addCourseDetails =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchCourseContents.pending, (state) => {
        state.loading.courseContents = true;
        state.errors.courseContents = null;
      })
      .addCase(fetchCourseContents.fulfilled, (state, action) => {
        state.loading.courseContents = false;
        state.courseContents = action.payload;
      })
      .addCase(fetchCourseContents.rejected, (state, action) => {
        state.loading.courseContents = false;
        state.errors.courseContents =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(addCourseContent.pending, (state) => {
        state.loading.addCourseContent = true;
        state.errors.addCourseContent = null;
      })
      .addCase(addCourseContent.fulfilled, (state) => {
        state.loading.addCourseContent = false;
      })
      .addCase(addCourseContent.rejected, (state, action) => {
        state.loading.addCourseContent = false;
        state.errors.addCourseContent =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      });
  },
});

export const { clearCourseErrors, clearCourseState } = coursesSlice.actions;

export const selectCoursesState = (state: { courses: CoursesState }): CoursesState =>
  state.courses;
export const selectCourseList = (state: { courses: CoursesState }): CourseRecord[] =>
  state.courses.list;
export const selectInactiveCourseList = (state: { courses: CoursesState }): CourseRecord[] =>
  state.courses.inactiveList;
export const selectCurrentCourse = (state: { courses: CoursesState }): CourseRecord | null =>
  state.courses.currentCourse;
export const selectCourseContents = (state: { courses: CoursesState }): CourseContentRecord[] =>
  state.courses.courseContents;

export default coursesSlice.reducer;
