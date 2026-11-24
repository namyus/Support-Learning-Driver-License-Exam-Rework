import api from '../../config/axios';
import type {
  CreateExamPayload,
  ExamRecord,
  StudentQuestionRecord,
  TestRecord,
} from './examsTypes';

export const examsApi = {
  getExams() {
    return api.get<ExamRecord[]>('Exam/list');
  },

  createExam(payload: CreateExamPayload) {
    return api.post('Exam/add', payload);
  },

  getTests() {
    return api.get<TestRecord[]>('Test/list');
  },

  createTestForExam(examId: number | string) {
    const examIDJson = JSON.stringify(examId);
    return api.post('Test/add', {
      Headers: {
        'Content-Type': 'application/json',
      },
      examId: examIDJson,
    });
  },

  updateTestIsPass(studentId: string | number) {
    return api.put(`Test/editIsPass?studentID=${studentId}`);
  },

  getTestByStudentId(studentId: string | number) {
    return api.get<TestRecord>(
      `TestByStudentId?studentId=${encodeURIComponent(String(studentId))}`
    );
  },

  getStudentQuestions(studentId: string | number) {
    return api.get<StudentQuestionRecord[]>(
      `GetStudentQuestion/${encodeURIComponent(String(studentId))}`
    );
  },

  checkStudentAnswer(answerStrings: string[]) {
    return api.put('CheckStudentAnswer', JSON.stringify(answerStrings), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};
