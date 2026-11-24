export interface StaffRecord {
  staffId?: number | string;
  userId?: number | string;
  userID?: number | string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: boolean;
}

export interface CreateStaffPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface UpdateStaffPayload {
  staffId: number;
  fullName: string;
  email: string;
  phone: string;
}

export interface StaffState {
  list: StaffRecord[];
  currentStaff: StaffRecord | null;
  selectedStaff: StaffRecord | null;
  staffById: Record<string, StaffRecord>;
  loading: {
    list: boolean;
    currentStaff: boolean;
    selectedStaff: boolean;
    createStaff: boolean;
    updateStaff: boolean;
    deleteStaff: boolean;
  };
  errors: {
    list: string | null;
    currentStaff: string | null;
    selectedStaff: string | null;
    createStaff: string | null;
    updateStaff: string | null;
    deleteStaff: string | null;
  };
}
