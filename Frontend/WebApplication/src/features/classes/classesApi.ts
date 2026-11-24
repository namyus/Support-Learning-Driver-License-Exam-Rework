import type { AxiosResponse } from 'axios';
import api from '../../config/axios';
import type {
  AddCurriculumPayload,
  AttendanceStudentRecord,
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

export const classesApi = {
  getClasses(): Promise<AxiosResponse<ClassRecord[]>> {
    return api.get<ClassRecord[]>('Class');
  },

  getClassesByMentorId(mentorId: number | string): Promise<AxiosResponse<ClassRecord[]>> {
    return api.get<ClassRecord[]>(`/Class/${mentorId}`);
  },

  getClassDates(classId: number | string): Promise<AxiosResponse<string[]>> {
    return api.get<string[]>(`Class/${classId}/dates`);
  },

  getPracticeClassesByCourseAndMentor({
    courseId,
    mentorId,
  }: PracticeClassQuery): Promise<AxiosResponse<ClassRecord[]>> {
    return api.get<ClassRecord[]>(
      `Class/course/mentor/practice?courseId=${courseId}&mentorId=${mentorId}`
    );
  },

  addPracticeClassesByMentor(
    payload: PracticeClassByMentorItem[]
  ): Promise<AxiosResponse<unknown>> {
    return api.post('Class/addClassPracticeByMentor', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  registerClassStudent(
    payload: RegisterClassStudentPayload
  ): Promise<AxiosResponse<unknown>> {
    return api.post('ClassStudent', payload);
  },

  getCurriculumList(): Promise<AxiosResponse<CurriculumRecord[]>> {
    return api.get<CurriculumRecord[]>('Curriculum/list');
  },

  addCurriculum(payload: AddCurriculumPayload): Promise<AxiosResponse<unknown>> {
    return api.post('Curriculum/add', payload);
  },

  getLessonsByClassId(classId: number | string): Promise<AxiosResponse<LessonRecord[]>> {
    return api.get<LessonRecord[]>(`Lesson/class/${classId}`);
  },

  getTheoryLessonsByStudentId(
    studentId: number | string
  ): Promise<AxiosResponse<LessonRecord[]>> {
    return api.get<LessonRecord[]>(`Lesson/theory/student/${studentId}`);
  },

  getPracticeLessonsByStudentId(
    studentId: number | string
  ): Promise<AxiosResponse<LessonRecord[]>> {
    return api.get<LessonRecord[]>(`Lesson/practice/student/${studentId}`);
  },

  getMentorTeachingSchedule({
    mentorId,
    startDate,
    endDate,
  }: TeachingScheduleQuery): Promise<AxiosResponse<LessonRecord[]>> {
    return api.get<LessonRecord[]>(`Lesson/teaching-schedule/${mentorId}`, {
      params: { startDate, endDate },
    });
  },

  getLessonAttendance({
    classId,
    date,
  }: LessonAttendanceQuery): Promise<AxiosResponse<AttendanceStudentRecord[]>> {
    return api.get<AttendanceStudentRecord[]>(`/Lesson/attendance/${classId}/${date}`);
  },

  updateLessonAttendance(
    payload: UpdateAttendanceItem[]
  ): Promise<AxiosResponse<unknown>> {
    return api.patch('/Lesson/attendance', payload);
  },

  updateStudentAttendance(studentId: number | string): Promise<AxiosResponse<unknown>> {
    return api.patch(`Lesson/attendance/${studentId}`);
  },

  createTheoryLesson({
    courseId,
    lessons,
  }: CreateTheoryLessonPayload): Promise<AxiosResponse<unknown>> {
    return api.post(`Lesson/createTheoryLesson?courseId=${courseId}`, lessons);
  },

  createPracticeLesson({
    classId,
    lessons,
  }: CreatePracticeLessonPayload): Promise<AxiosResponse<unknown>> {
    return api.post(`Lesson/createPracticeLesson?classId=${classId}`, lessons);
  },

  createPracticeLessonAuto(courseId: string): Promise<AxiosResponse<unknown>> {
    return api.post(`Lesson/createPracticeLessonAuto?courseId=${courseId}`);
  },
};
