import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import Countdown, { CountdownRenderProps } from 'react-countdown';
import { Spinner } from 'react-bootstrap';
import {
  AiFillClockCircle,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle,
} from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../config/axios';
import './member-theory-test-paper.scss';

const EXAM_DURATION_MS = 20 * 60 * 1000;
const LOW_TIME_WARNING_MS = 5 * 60 * 1000;
const CRITICAL_TIME_WARNING_MS = 60 * 1000;
const ANSWER_OPTIONS = [1, 2, 3, 4] as const;

interface LoginedUser {
  userID?: number;
  userId?: number;
}

interface MemberRecord {
  memberID: number;
  courseId?: string | null;
}

interface StudentRecord {
  studentId: string;
}

interface ExamQuestion {
  studentAnswerId?: number;
  testId?: number;
  questionId: number;
  optionId?: number | null;
  image?: string | null;
}

type AnswerArray = Array<number | string>;

function readSessionJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function TheoryTestPaper() {
  const navigate = useNavigate();

  const [start, setStart] = useState<boolean>(false);
  const [question, setQuestion] = useState<ExamQuestion[]>([]);
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<AnswerArray>(() => new Array<number | string>(36).fill(0));
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(() =>
    new Array<boolean>(36).fill(false)
  );
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const answerRef = useRef<AnswerArray>(answer);
  const isSubmittingRef = useRef<boolean>(false);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  const loadExamData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let memberData = readSessionJson<MemberRecord>('loginedMember');

      if (!memberData?.memberID) {
        const user = readSessionJson<LoginedUser>('loginedUser');
        const userId = user?.userID ?? user?.userId;

        if (!userId) {
          setErrorMessage('Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.');
          setIsLoading(false);
          return;
        }

        const memberResponse = await api.get<MemberRecord>(`Member/${userId}`);
        memberData = memberResponse.data ?? null;
        if (memberData) {
          sessionStorage.setItem('loginedMember', JSON.stringify(memberData));
        }
      }

      if (!memberData?.memberID) {
        setErrorMessage('Không tìm thấy hồ sơ học viên cho tài khoản này.');
        setIsLoading(false);
        return;
      }

      const studentResponse = await api.get<StudentRecord>(`Student/${memberData.memberID}`);
      const studentData = studentResponse.data ?? null;

      if (!studentData?.studentId) {
        setErrorMessage('Không tìm thấy mã học viên để tải đề kiểm tra.');
        setIsLoading(false);
        return;
      }

      setStudent(studentData);

      const questionResponse = await api.get<ExamQuestion[]>(
        `GetStudentQuestion/${encodeURIComponent(studentData.studentId)}`
      );
      const loadedQuestions = Array.isArray(questionResponse.data) ? questionResponse.data : [];

      setQuestion(loadedQuestions);
      setAnswer((prev) => {
        const updatedAnswer = [...prev];
        updatedAnswer[35] = studentData.studentId.toString();
        answerRef.current = updatedAnswer;
        return updatedAnswer;
      });
    } catch (err) {
      console.error(err);
      if (isAxiosError(err) && err.response?.status === 404) {
        setQuestion([]);
        setErrorMessage(
          'Chưa có bộ câu hỏi kiểm tra nào được gán cho mã học viên của bạn.'
        );
      } else {
        setErrorMessage('Không thể tải đề kiểm tra lý thuyết. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExamData();
  }, [loadExamData]);

  const submitExam = useCallback(
    async (isAutoSubmit: boolean) => {
      if (isSubmittingRef.current) {
        return;
      }
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      try {
        const currentAnswers = [...answerRef.current];
        if (student?.studentId && !currentAnswers[35]) {
          currentAnswers[35] = student.studentId.toString();
        }
        const answerStrings = currentAnswers.map((val) => val.toString());
        const answerJSON = JSON.stringify(answerStrings);

        const response = await api.put('CheckStudentAnswer', answerJSON, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        localStorage.setItem('studentAnswer', JSON.stringify(response.data));

        toast.success(
          isAutoSubmit ? 'Hết thời gian làm bài! Hệ thống đã tự động nộp bài.' : 'Nộp bài thành công!',
          {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
          }
        );

        window.scrollTo({
          top: 0,
          behavior: 'instant' as ScrollBehavior,
        });

        navigate('/kiem-tra/ket-qua');
      } catch (error) {
        console.error(error);
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        toast.error('Không thể nộp bài thi. Vui lòng thử lại.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
        });
      }
    },
    [navigate, student]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitExam(false);
  };

  const handleTimerComplete = useCallback(() => {
    void submitExam(true);
  }, [submitExam]);

  const handleStart = () => {
    if (!start && question.length > 0) {
      setTargetTime(Date.now() + EXAM_DURATION_MS);
      setStart(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (question.length === 0) return;
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setCurrentQuestionIndex(question.length - 1);
    }
  };

  const handleNextQuestion = () => {
    if (question.length === 0) return;
    if (currentQuestionIndex < question.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
  };

  const handleAnswerSelection = (selectedOption: number) => {
    if (isSubmitting) return;
    setAnswer((prev) => {
      const updatedAnswer = [...prev];
      updatedAnswer[currentQuestionIndex] = selectedOption;
      answerRef.current = updatedAnswer;
      return updatedAnswer;
    });

    setAnsweredQuestions((prev) => {
      const updatedAnswered = [...prev];
      updatedAnswered[currentQuestionIndex] = true;
      return updatedAnswered;
    });
  };

  const renderer = useCallback(
    ({ minutes, seconds, completed, total }: CountdownRenderProps) => {
      if (completed) {
        return <span className="mh-timer-digits mh-timer-digits--critical">00:00</span>;
      }

      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(seconds).padStart(2, '0');
      const stateClass =
        total <= CRITICAL_TIME_WARNING_MS
          ? 'mh-timer-digits--critical'
          : total <= LOW_TIME_WARNING_MS
          ? 'mh-timer-digits--warning'
          : '';

      return (
        <span className={`mh-timer-digits ${stateClass}`.trim()}>
          {formattedMinutes}:{formattedSeconds}
        </span>
      );
    },
    []
  );

  const totalQuestions = question.length;
  const answeredCount = answeredQuestions.slice(0, totalQuestions).filter(Boolean).length;
  const activeQuestion = question[currentQuestionIndex];

  return (
    <section className="theory-paper-container mh-exam-paper-section">
      <div className="theory-paper-title mh-exam-paper-header">
        <h1 className="paper-title mh-section-title">Kỳ kiểm tra lý thuyết GPLX B2</h1>
        {student?.studentId ? (
          <p className="mh-exam-paper-meta">
            Mã học viên: <strong>{student.studentId}</strong>
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mh-exam-paper-state" role="status" aria-live="polite">
          <Spinner animation="border" className="mh-exam-spinner" />
          <p className="mh-exam-paper-state__text">Đang tải bộ câu hỏi kiểm tra lý thuyết...</p>
        </div>
      ) : errorMessage ? (
        <div className="mh-exam-paper-state mh-exam-paper-state--error" role="alert">
          <AiOutlineExclamationCircle className="mh-exam-paper-state__icon" aria-hidden="true" />
          <h2 className="mh-exam-paper-state__title">Không thể mở bài kiểm tra</h2>
          <p className="mh-exam-paper-state__text">{errorMessage}</p>
          <div className="mh-exam-paper-state__actions">
            <button
              type="button"
              className="mh-exam-secondary-btn"
              onClick={() => navigate('/kiem-tra')}
            >
              Quay lại
            </button>
            <button
              type="button"
              className="mh-exam-primary-btn"
              onClick={() => void loadExamData()}
            >
              Thử lại
            </button>
          </div>
        </div>
      ) : (
        <div className="theory-paper-box">
          {!start ? (
            <div className="start-btn mh-exam-start-banner">
              <div className="mh-exam-start-banner__copy">
                <h2>Sẵn sàng bắt đầu bài thi ({totalQuestions} câu hỏi)</h2>
                <p>
                  Đồng hồ 20:00 sẽ bắt đầu đếm ngược ngay khi bạn nhấn nút bắt đầu. Hệ thống sẽ tự
                  động nộp bài khi hết giờ.
                </p>
              </div>
              <button
                type="button"
                className="mh-exam-primary-btn"
                onClick={handleStart}
                disabled={totalQuestions === 0}
              >
                Bắt đầu làm bài
              </button>
            </div>
          ) : null}

          <form id="theory-paper-form" className="mh-exam-grid" onSubmit={handleSubmit}>
            <aside className="mh-exam-sidebar" aria-label="Điều hướng câu hỏi và thời gian">
              <div className="question-number-container mh-timer-card">
                <div className="countdown-timer">
                  <AiFillClockCircle className="clock-icon" aria-hidden="true" />
                  <span className="mh-timer-label">Thời gian còn lại:</span>
                  {start && targetTime !== null ? (
                    <Countdown
                      date={targetTime}
                      renderer={renderer}
                      onComplete={handleTimerComplete}
                    />
                  ) : (
                    <span className="mh-timer-digits">20:00</span>
                  )}
                </div>

                <div className="mh-exam-progress">
                  <span>
                    Đã trả lời: <strong>{answeredCount}</strong> / {totalQuestions}
                  </span>
                  <div className="mh-exam-progress__bar" aria-hidden="true">
                    <div
                      className="mh-exam-progress__fill"
                      style={{
                        width: totalQuestions > 0 ? `${(answeredCount / totalQuestions) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="questions-circle mh-question-nav-card">
                <div className="mh-question-nav-header">
                  <span>Danh sách câu hỏi</span>
                  <div className="mh-question-legend">
                    <span className="mh-legend-item">
                      <i className="mh-legend-dot mh-legend-dot--current" /> Đang xem
                    </span>
                    <span className="mh-legend-item">
                      <i className="mh-legend-dot mh-legend-dot--answered" /> Đã chọn
                    </span>
                  </div>
                </div>

                <ul className="mh-question-grid">
                  {question.map((item, index) => {
                    const isAnswered = answeredQuestions[index];
                    const isCurrent = index === currentQuestionIndex;
                    return (
                      <li key={item.questionId ?? index}>
                        <button
                          type="button"
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`mh-question-pill ${isAnswered ? 'answered' : ''} ${
                            isCurrent ? 'current' : ''
                          }`.trim()}
                          aria-label={`Câu hỏi ${index + 1}${isAnswered ? ', đã trả lời' : ''}`}
                          aria-current={isCurrent ? 'step' : undefined}
                        >
                          {index + 1}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>

            <div className="mh-exam-main">
              {start && activeQuestion ? (
                <div className="question-content-container" key={activeQuestion.questionId}>
                  <div className="content-box">
                    <div className="question-title mh-question-header">
                      <h2 className="question-num">
                        Câu hỏi {currentQuestionIndex + 1} / {totalQuestions}
                      </h2>
                      <span
                        className={`mh-question-status ${
                          answeredQuestions[currentQuestionIndex]
                            ? 'mh-question-status--done'
                            : 'mh-question-status--pending'
                        }`}
                      >
                        {answeredQuestions[currentQuestionIndex] ? (
                          <>
                            <AiOutlineCheckCircle aria-hidden="true" /> Đã chọn đáp án{' '}
                            {answer[currentQuestionIndex]}
                          </>
                        ) : (
                          'Chưa chọn đáp án'
                        )}
                      </span>
                    </div>

                    <div className="img-container">
                      {activeQuestion.image ? (
                        <img
                          src={activeQuestion.image}
                          alt={`Nội dung câu hỏi ${currentQuestionIndex + 1}`}
                        />
                      ) : (
                        <div className="mh-img-placeholder">Không có hình ảnh cho câu hỏi này.</div>
                      )}
                    </div>
                  </div>

                  <fieldset className="answer-box" disabled={isSubmitting}>
                    <legend className="mh-sr-only">
                      Chọn đáp án cho câu hỏi {currentQuestionIndex + 1}
                    </legend>
                    {ANSWER_OPTIONS.map((optionValue) => {
                      const isChecked = answer[currentQuestionIndex] === optionValue;
                      return (
                        <label
                          key={optionValue}
                          className={`answer mh-answer-option ${isChecked ? 'is-selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`answer-content-${currentQuestionIndex}`}
                            value={optionValue}
                            checked={isChecked}
                            onChange={() => handleAnswerSelection(optionValue)}
                          />
                          <span className="mh-answer-option__label">Đáp án {optionValue}</span>
                        </label>
                      );
                    })}
                  </fieldset>

                  <div className="button-box mh-question-controls">
                    <button
                      type="button"
                      className="previous-btn mh-nav-btn"
                      onClick={handlePreviousQuestion}
                      disabled={isSubmitting}
                    >
                      <AiOutlineArrowLeft aria-hidden="true" />
                      <span>Câu trước</span>
                    </button>
                    <button
                      type="button"
                      className="next-btn mh-nav-btn mh-nav-btn--primary"
                      onClick={handleNextQuestion}
                      disabled={isSubmitting}
                    >
                      <span>Câu tiếp theo</span>
                      <AiOutlineArrowRight aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="question-content-container mh-question-placeholder">
                  <div className="mh-question-placeholder__inner">
                    <AiFillClockCircle className="mh-question-placeholder__icon" aria-hidden="true" />
                    <h3>Nội dung câu hỏi sẽ hiển thị sau khi bắt đầu</h3>
                    <p>
                      Nhấn <strong>&ldquo;Bắt đầu làm bài&rdquo;</strong> ở phía trên để mở câu hỏi
                      đầu tiên và kích hoạt đồng hồ đếm ngược 20 phút.
                    </p>
                  </div>
                </div>
              )}

              {start ? (
                <div className="submit-btn mh-submit-bar">
                  <span className="mh-submit-bar__note">
                    {answeredCount < totalQuestions
                      ? `Còn ${totalQuestions - answeredCount} câu chưa chọn đáp án.`
                      : 'Bạn đã chọn đáp án cho tất cả các câu hỏi.'}
                  </span>
                  <button
                    className="mh-exam-submit-btn"
                    type="submit"
                    form="theory-paper-form"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài thi'}
                  </button>
                </div>
              ) : null}
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default TheoryTestPaper;
