export interface ExamRecord {
  examId: number | string;
  examID?: number | string;
  staffId?: number | string;
  courseId?: string | null;
  courseID?: string | null;
  examName?: string | null;
  examTime?: string | null;
  description?: string | null;
  duration?: number | string | null;
  limitQuestion?: number | string | null;
  limitKeyQuestion?: number | string | null;
  minimumCorrectAnswer?: number | string | null;
  status: boolean;
}

export interface CreateExamPayload {
  staffId: number | string;
  courseId: string;
  examName: string;
  examTime: string;
  description: string;
  duration: number;
  limitQuestion: number;
  limitKeyQuestion: number;
  minimumCorrectAnswer: number;
  status: boolean;
}

export interface TestRecord {
  testId: number;
  studentId: string;
  examId: number;
  score: number | null;
  pass: boolean | null;
  createTime?: string | null;
  examTime?: string | null;
}

export interface StudentQuestionRecord {
  studentAnswerId?: number;
  testId?: number;
  questionId: number;
  optionId?: number | null;
  image?: string | null;
}

export interface ExamsState {
  exams: ExamRecord[];
  tests: TestRecord[];
  studentTest: TestRecord | null;
  studentQuestions: StudentQuestionRecord[];
  lastCheckAnswerResult: unknown;
  loading: {
    exams: boolean;
    createExam: boolean;
    tests: boolean;
    createTest: boolean;
    updateTestPass: boolean;
    studentTest: boolean;
    studentQuestions: boolean;
    checkStudentAnswer: boolean;
  };
  errors: {
    exams: string | null;
    createExam: string | null;
    tests: string | null;
    createTest: string | null;
    updateTestPass: string | null;
    studentTest: string | null;
    studentQuestions: string | null;
    checkStudentAnswer: string | null;
  };
}
