export interface CourseRecord {
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  numberOfStudents?: number;
  limitStudent: number;
  courseFee?: number;
  passTheoryLs?: number;
  passKm?: number;
  theoryTeacherId?: string;
  courseMonth?: number;
  courseYear?: number;
  status?: boolean;
}

export interface CourseDetailRecord {
  courseDetailsId?: number | string;
  courseDetailId?: number;
  courseContent: string;
  courseTimeStart: string;
  courseTimeEnd: string;
  courseId: string;
}

export interface CourseContentRecord {
  courseContent1: string;
}

export interface CourseMonthQuery {
  month?: string | number;
  year?: string | number;
}

export interface CreateCoursePayload {
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  numberOfStudents?: number;
  limitStudent: number;
  courseFee?: number;
  passTheoryLs?: number;
  passKm?: number;
  theoryTeacherId?: string;
  status: boolean;
}

export interface UpdateCoursePayload {
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  numberOfStudents: number;
  limitStudent: number;
  status: boolean;
}

export interface AddCourseContentPayload {
  courseContent1: string;
}

export interface CreateCourseDetailsItem {
  courseContent: string;
  courseTimeStart: string;
  courseTimeEnd: string;
  courseId: string;
}

export interface ApiRejectedPayload {
  message: string;
  status?: number;
  error?: string;
  data?: unknown;
}

export interface CoursesState {
  list: CourseRecord[];
  inactiveList: CourseRecord[];
  monthCourses: CourseRecord[];
  currentCourse: CourseRecord | null;
  courseDetailsByMonth: CourseDetailRecord[];
  courseDetailsByCourseId: Record<string, CourseDetailRecord[]>;
  courseContents: CourseContentRecord[];
  loading: {
    list: boolean;
    inactiveList: boolean;
    monthCourses: boolean;
    currentCourse: boolean;
    courseDetailsByMonth: boolean;
    courseDetailsByCourseId: boolean;
    courseContents: boolean;
    createCourse: boolean;
    updateCourse: boolean;
    activateCourse: boolean;
    deactivateCourse: boolean;
    addCourseContent: boolean;
    addCourseDetails: boolean;
  };
  errors: {
    list: string | null;
    inactiveList: string | null;
    monthCourses: string | null;
    currentCourse: string | null;
    courseDetailsByMonth: string | null;
    courseDetailsByCourseId: string | null;
    courseContents: string | null;
    createCourse: string | null;
    updateCourse: string | null;
    activateCourse: string | null;
    deactivateCourse: string | null;
    addCourseContent: string | null;
    addCourseDetails: string | null;
  };
}
