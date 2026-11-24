import type { AxiosResponse } from 'axios';
import api from '../../config/axios';
import type {
  CreateMentorPayload,
  MentorRecord,
  UpdateMentorPayload,
} from './mentorsTypes';

export const mentorsApi = {
  getMentorList(): Promise<AxiosResponse<MentorRecord[]>> {
    return api.get<MentorRecord[]>('Mentor/list');
  },

  getTheoryMentors(): Promise<AxiosResponse<MentorRecord[]>> {
    return api.get<MentorRecord[]>('Mentor/theory');
  },

  getMentorById(mentorId: number | string): Promise<AxiosResponse<MentorRecord>> {
    return api.get<MentorRecord>(`Mentor/${mentorId}`);
  },

  getMentorByUserId(userId: number | string): Promise<AxiosResponse<MentorRecord>> {
    return api.get<MentorRecord>(`Mentor/user/${userId}`);
  },

  createMentor(payload: CreateMentorPayload): Promise<AxiosResponse<unknown>> {
    return api.post('Mentor/add', payload);
  },

  updateMentor(payload: UpdateMentorPayload): Promise<AxiosResponse<unknown>> {
    return api.put('Mentor/update', payload);
  },

  deleteMentor(mentorId: number | string): Promise<AxiosResponse<unknown>> {
    return api.delete(`/Mentor/delete/${mentorId}`);
  },
};
