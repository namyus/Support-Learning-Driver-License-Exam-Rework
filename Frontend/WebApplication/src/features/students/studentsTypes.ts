export interface StudentRecord {
  studentId?: string | number;
  studentID?: string | number;
  memberId?: number | string;
  memberID?: number | string;
  courseId?: string | null;
  fullName?: string;
  totalHour?: number | null;
  totalKm?: number | null;
  pass?: boolean | null;
  isPaid?: boolean | null;
}

export interface StudentsState {
  list: StudentRecord[];
  currentStudent: StudentRecord | null;
  studentsByMemberId: Record<string, StudentRecord>;
  loading: {
    list: boolean;
    currentStudent: boolean;
  };
  errors: {
    list: string | null;
    currentStudent: string | null;
  };
}
