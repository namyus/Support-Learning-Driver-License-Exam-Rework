export interface MentorRecord {
  mentorId?: number | string;
  userId?: number | string;
  userID?: number | string;
  fullName?: string | null;
  dob?: string | null;
  gender?: string | null;
  nationality?: string | null;
  residenceAddress?: string | null;
  identityCardNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  isTeachingTheory?: boolean | null;
  isTeachingPractice?: boolean | null;
  currentCourse?: string | null;
  courseId?: string | null;
  memberID?: number | string;
}

export interface CreateMentorPayload {
  username: string;
  password: string;
  fullName: string;
  residenceAddress: string;
  phone: string;
  email: string;
  isTeachingTheory: boolean;
  isTeachingPractice: boolean;
}

export interface UpdateMentorPayload {
  mentorId: number;
  fullName: string;
  email: string;
  phone: string;
  residenceAddress: string;
  isTeachingTheory: boolean;
  isTeachingPractice: boolean;
}

export interface MentorsState {
  list: MentorRecord[];
  theoryList: MentorRecord[];
  currentMentor: MentorRecord | null;
  selectedMentor: MentorRecord | null;
  mentorsById: Record<string, MentorRecord>;
  loading: {
    list: boolean;
    theoryList: boolean;
    currentMentor: boolean;
    selectedMentor: boolean;
    createMentor: boolean;
    updateMentor: boolean;
    deleteMentor: boolean;
  };
  errors: {
    list: string | null;
    theoryList: string | null;
    currentMentor: string | null;
    selectedMentor: string | null;
    createMentor: string | null;
    updateMentor: string | null;
    deleteMentor: string | null;
  };
}
