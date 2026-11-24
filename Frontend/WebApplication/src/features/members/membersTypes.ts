export interface MemberRecord {
  memberID?: number | string;
  memberId?: number | string;
  userID?: number | string;
  userId?: number | string;
  fullName?: string | null;
  dob?: string | null;
  gender?: string | null;
  nationality?: string | null;
  nation?: string | null;
  phone?: string | null;
  email?: string | null;
  residenceAddress?: string | null;
  temporaryAddress?: string | null;
  identityCardNumber?: string | null;
  cardProvidedDate?: string | null;
  cardProvidedLocation?: string | null;
  drivingLicenseNumber?: string | null;
  drivingLicenseTier?: string | null;
  drivingLicenseProvider?: string | null;
  drivingLicenseProvidedDate?: string | null;
  drivingTestTier?: string | null;
  integratedDrivingLicense?: boolean;
  revokedDrivingLicense?: boolean;
  isPaid?: boolean | null;
  courseId?: string | null;
}

export interface UserRecord {
  userID?: number | string;
  username?: string;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: boolean;
  roleId?: number | string;
}

export interface CreateMemberPayload {
  dob: string;
  gender: string;
  nationality: string;
  nation: string;
  temporaryAddress: string;
  residenceAddress: string;
  identityCardNumber: string;
  cardProvidedDate: string;
  cardProvidedLocation: string;
  isPaid: boolean;
  courseId: string | number | null;
  userId: string | number | null;
  fullName: string;
  phone: string;
  email: string;
}

export interface MembersState {
  list: MemberRecord[];
  users: UserRecord[];
  currentMember: MemberRecord | null;
  selectedMember: MemberRecord | null;
  membersById: Record<string, MemberRecord>;
  loading: {
    list: boolean;
    users: boolean;
    currentMember: boolean;
    selectedMember: boolean;
    createMember: boolean;
  };
  errors: {
    list: string | null;
    users: string | null;
    currentMember: string | null;
    selectedMember: string | null;
    createMember: string | null;
  };
}
