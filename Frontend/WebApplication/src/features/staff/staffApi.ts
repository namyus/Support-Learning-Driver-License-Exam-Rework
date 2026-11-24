import type { AxiosResponse } from 'axios';
import api from '../../config/axios';
import type {
  CreateStaffPayload,
  StaffRecord,
  UpdateStaffPayload,
} from './staffTypes';

export const staffApi = {
  getStaffList(): Promise<AxiosResponse<StaffRecord[]>> {
    return api.get<StaffRecord[]>('Staff/list');
  },

  getStaffById(staffId: number | string): Promise<AxiosResponse<StaffRecord>> {
    return api.get<StaffRecord>(`Staff/${staffId}`);
  },

  getStaffByUserId(userId: number | string): Promise<AxiosResponse<StaffRecord>> {
    return api.get<StaffRecord>(`Staff/user/${userId}`);
  },

  createStaff(payload: CreateStaffPayload): Promise<AxiosResponse<unknown>> {
    return api.post('Staff/add', payload);
  },

  updateStaff(payload: UpdateStaffPayload): Promise<AxiosResponse<unknown>> {
    return api.put('Staff/update', payload);
  },

  deleteStaff(staffId: number | string): Promise<AxiosResponse<unknown>> {
    return api.delete(`Staff/delete/${staffId}`);
  },
};
