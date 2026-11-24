import type { AxiosResponse } from 'axios';
import api from '../../config/axios';
import type {
  CreateMemberPayload,
  MemberRecord,
  UserRecord,
} from './membersTypes';

export const membersApi = {
  getMembers(): Promise<AxiosResponse<MemberRecord[]>> {
    return api.get<MemberRecord[]>('Members');
  },

  getMemberByUserId(userId: number | string): Promise<AxiosResponse<MemberRecord>> {
    return api.get<MemberRecord>(`Member/${userId}`);
  },

  getMemberById(memberId: number | string): Promise<AxiosResponse<MemberRecord>> {
    return api.get<MemberRecord>(`Member?memberId=${memberId}`);
  },

  getMemberByUserIdQuery(userId: number | string): Promise<AxiosResponse<MemberRecord>> {
    return api.get<MemberRecord>(`/Member?userID=${userId}`);
  },

  createMember(payload: CreateMemberPayload): Promise<AxiosResponse<MemberRecord>> {
    return api.post<MemberRecord>('/Member/add', payload);
  },

  getUsers(): Promise<AxiosResponse<UserRecord[]>> {
    return api.get<UserRecord[]>('Users');
  },
};
