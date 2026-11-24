import type { AxiosResponse } from 'axios';
import api from '../../config/axios';
import type { StudentRecord } from './studentsTypes';

export const studentsApi = {
  getStudents(): Promise<AxiosResponse<StudentRecord[]>> {
    return api.get<StudentRecord[]>('/Students');
  },

  getStudentByMemberId(memberId: number | string): Promise<AxiosResponse<StudentRecord>> {
    return api.get<StudentRecord>(`Student/${memberId}`);
  },
};
