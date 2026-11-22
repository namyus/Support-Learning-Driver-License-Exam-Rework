import axios, { type AxiosResponse } from 'axios';
import api from '../../config/axios';
import type {
  AddCourseContentPayload,
  ApiRejectedPayload,
  CourseContentRecord,
  CourseDetailRecord,
  CourseMonthQuery,
  CourseRecord,
  CreateCourseDetailsItem,
  CreateCoursePayload,
  UpdateCoursePayload,
} from './coursesTypes';

export function extractCourseApiError(
  error: unknown,
  fallbackMessage = 'Request failed'
): ApiRejectedPayload {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data as { error?: string; message?: string } | undefined;
    const backendError =
      typeof responseData?.error === 'string' && responseData.error.trim().length > 0
        ? responseData.error
        : undefined;
    const message =
      backendError ||
      (typeof responseData?.message === 'string' && responseData.message.trim().length > 0
        ? responseData.message
        : error.message || fallbackMessage);

    return {
      message,
      status,
      error: backendError,
      data: error.response?.data,
    };
  }

  if (error instanceof Error) {
    return { message: error.message || fallbackMessage };
  }

  return { message: fallbackMessage };
}

export const coursesApi = {
  getCourseList(): Promise<AxiosResponse<CourseRecord[]>> {
    return api.get<CourseRecord[]>('Course/list');
  },

  getInactiveCourses(): Promise<AxiosResponse<CourseRecord[]>> {
    return api.get<CourseRecord[]>('Course/inactive-courses');
  },

  getCourseById(courseId: string): Promise<AxiosResponse<CourseRecord>> {
    return api.get<CourseRecord>(`Course/${courseId}`);
  },

  getCoursesByMonth({ month, year }: CourseMonthQuery): Promise<AxiosResponse<CourseRecord[]>> {
    return api.get<CourseRecord[]>('Course/courseMonth?month=' + month + '&year=' + year);
  },

  createCourse(payload: Partial<CreateCoursePayload>): Promise<AxiosResponse<unknown>> {
    return api.post('Course/add', payload);
  },

  updateCourse(payload: UpdateCoursePayload): Promise<AxiosResponse<unknown>> {
    return api.put('Course/update', payload);
  },

  activateCourse(courseId: string): Promise<AxiosResponse<unknown>> {
    return api.patch('Course/activate/' + courseId);
  },

  deactivateCourse(courseId: string): Promise<AxiosResponse<unknown>> {
    return api.delete(`Course/deactivate/${courseId}`);
  },

  getCourseDetailsByMonth(courseMonth?: string | number): Promise<AxiosResponse<CourseDetailRecord[]>> {
    return api.get<CourseDetailRecord[]>(`/CourseDetail?courseMonth=${courseMonth}`);
  },

  getCourseDetailsByCourseId(courseId: string): Promise<AxiosResponse<CourseDetailRecord[]>> {
    return api.get<CourseDetailRecord[]>('CourseDetail/' + courseId);
  },

  addCourseDetails(payload: CreateCourseDetailsItem[]): Promise<AxiosResponse<unknown>> {
    return api.post('CourseDetails/add', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  getCourseContents(): Promise<AxiosResponse<CourseContentRecord[]>> {
    return api.get<CourseContentRecord[]>('CourseContent');
  },

  addCourseContent(payload: AddCourseContentPayload): Promise<AxiosResponse<unknown>> {
    return api.post('CourseContent/add', payload);
  },
};
