export interface ClassRecord {
  classId: number | string;
  mentorName?: string;
  mentorId?: number | string;
  courseId?: string;
  isTheoryClass?: boolean;
  dayOfWeek?: string | number;
  shift?: number | string;
  status?: boolean;
}

export interface LessonRecord {
  lessonId?: number | string;
  classId?: number | string;
  lessonContent?: string;
  date?: string;
  location?: string;
  dayOfWeek?: string;
  shift?: string;
  attendance?: boolean;
  mentorId?: number | string;
}

export interface AttendanceStudentRecord {
  classStudentId: string;
  lessonId: string;
  studentName: string;
  hours: number;
  kilometers: number;
  attendance: boolean;
}

export interface UpdateAttendanceItem {
  lessonId: string;
  hours: number;
  kilometers: number;
  attendance: boolean;
}

export interface CurriculumRecord {
  content: string;
  isTheory?: boolean;
}

export interface AddCurriculumPayload {
  content: string;
  isTheory: boolean;
}

export interface PracticeClassByMentorItem {
  mentorId: number | string;
  courseId: string | undefined;
  dayOfWeek: number;
  shift: string;
  status: boolean;
}

export interface RegisterClassStudentPayload {
  studentId: string | number;
  classId: string | number;
}

export interface PracticeClassQuery {
  courseId: string;
  mentorId: string | number;
}

export interface TeachingScheduleQuery {
  mentorId: string | number;
  startDate: string;
  endDate: string;
}

export interface LessonAttendanceQuery {
  classId: string | number;
  date: string;
}

export interface TheoryLessonInputRow {
  lessonContent?: string;
  location?: string;
  date?: string;
}

export interface PracticeLessonInputRow {
  courseDetailsId?: string;
  location?: string;
  date?: string;
}

export interface CreateTheoryLessonPayload {
  courseId: string;
  lessons: TheoryLessonInputRow[];
}

export interface CreatePracticeLessonPayload {
  classId: string | number;
  lessons: PracticeLessonInputRow[];
}

export interface ClassesState {
  list: ClassRecord[];
  mentorClasses: ClassRecord[];
  practiceClasses: ClassRecord[];
  classDates: string[];
  curriculumList: CurriculumRecord[];
  lessonsByClassId: Record<string, LessonRecord[]>;
  theoryLessons: LessonRecord[];
  practiceLessons: LessonRecord[];
  teachingSchedule: LessonRecord[];
  attendanceList: AttendanceStudentRecord[];
  loading: {
    list: boolean;
    mentorClasses: boolean;
    practiceClasses: boolean;
    classDates: boolean;
    curriculumList: boolean;
    lessonsByClassId: boolean;
    theoryLessons: boolean;
    practiceLessons: boolean;
    teachingSchedule: boolean;
    attendanceList: boolean;
    addPracticeClasses: boolean;
    registerClassStudent: boolean;
    addCurriculum: boolean;
    updateAttendance: boolean;
    updateStudentAttendance: boolean;
    createTheoryLesson: boolean;
    createPracticeLesson: boolean;
    createPracticeLessonAuto: boolean;
  };
  errors: {
    list: string | null;
    mentorClasses: string | null;
    practiceClasses: string | null;
    classDates: string | null;
    curriculumList: string | null;
    lessonsByClassId: string | null;
    theoryLessons: string | null;
    practiceLessons: string | null;
    teachingSchedule: string | null;
    attendanceList: string | null;
    addPracticeClasses: string | null;
    registerClassStudent: string | null;
    addCurriculum: string | null;
    updateAttendance: string | null;
    updateStudentAttendance: string | null;
    createTheoryLesson: string | null;
    createPracticeLesson: string | null;
    createPracticeLessonAuto: string | null;
  };
}
