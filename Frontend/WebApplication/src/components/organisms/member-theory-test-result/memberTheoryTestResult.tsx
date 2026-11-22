import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineFileSearch,
} from 'react-icons/ai';
import './member-theory-test-result.scss';

const TOTAL_QUESTIONS = 35;

interface StudentAnswerResult {
  numberOfCorrectAnswer: number;
  numberOfWrongKeyQuestion: number;
  result: string;
}

function readStoredResult(): StudentAnswerResult | null {
  try {
    const raw = localStorage.getItem('studentAnswer');
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const candidate = parsed as Partial<StudentAnswerResult>;
    if (
      typeof candidate.numberOfCorrectAnswer !== 'number' ||
      Number.isNaN(candidate.numberOfCorrectAnswer) ||
      typeof candidate.numberOfWrongKeyQuestion !== 'number' ||
      Number.isNaN(candidate.numberOfWrongKeyQuestion) ||
      typeof candidate.result !== 'string' ||
      candidate.result.trim().length === 0
    ) {
      return null;
    }

    return {
      numberOfCorrectAnswer: candidate.numberOfCorrectAnswer,
      numberOfWrongKeyQuestion: candidate.numberOfWrongKeyQuestion,
      result: candidate.result,
    };
  } catch {
    return null;
  }
}

function TheoryTestResult() {
  const navigate = useNavigate();
  const studentAnswer = useMemo(() => readStoredResult(), []);

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({
      top: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  };

  if (!studentAnswer) {
    return (
      <section className="theory-result-container mh-exam-result-section">
        <div className="theory-result-title mh-exam-result-header">
          <h1 className="result-title mh-section-title">
            Kết quả Kỳ kiểm tra lý thuyết GPLX B2
          </h1>
        </div>

        <div className="mh-result-empty" role="status">
          <AiOutlineFileSearch className="mh-result-empty__icon" aria-hidden="true" />
          <h2 className="mh-result-empty__title">Chưa có dữ liệu kết quả bài thi</h2>
          <p className="mh-result-empty__text">
            Không tìm thấy kết quả bài kiểm tra lý thuyết hợp lệ trên trình duyệt này. Vui lòng quay
            lại trang kiểm tra hoặc trang chủ.
          </p>
          <div className="mh-result-actions">
            <button
              type="button"
              className="mh-result-secondary-btn"
              onClick={() => handleNavigate('/kiem-tra')}
            >
              Trang kiểm tra
            </button>
            <button
              type="button"
              className="back-btn mh-result-primary-btn"
              onClick={() => handleNavigate('/')}
            >
              Trang chủ
            </button>
          </div>
        </div>
      </section>
    );
  }

  const isNotPass = studentAnswer.result === 'Not Pass';
  const wrongCount = Math.max(0, TOTAL_QUESTIONS - studentAnswer.numberOfCorrectAnswer);

  return (
    <section className="theory-result-container mh-exam-result-section">
      <div className="theory-result-title mh-exam-result-header">
        <h1 className="result-title mh-section-title">
          Kết quả Kỳ kiểm tra lý thuyết GPLX B2
        </h1>
      </div>

      <div className="theory-result-box">
        <div
          className={`explanation-box mh-result-card ${
            isNotPass ? 'mh-result-card--fail' : 'mh-result-card--pass'
          }`}
        >
          <div className="mh-result-banner">
            {isNotPass ? (
              <AiOutlineCloseCircle
                className="mh-result-banner__icon mh-result-banner__icon--fail"
                aria-hidden="true"
              />
            ) : (
              <AiOutlineCheckCircle
                className="mh-result-banner__icon mh-result-banner__icon--pass"
                aria-hidden="true"
              />
            )}
            <span className="mh-result-banner__eyebrow">Kết quả làm bài</span>
            <h2 className={`mh-result-verdict ${isNotPass ? 'result-fail' : 'result-pass'}`}>
              {isNotPass ? 'KHÔNG ĐẠT' : 'ĐẠT'}
            </h2>
          </div>

          <dl className="explanation-list mh-result-metrics">
            <div className="mh-result-metric">
              <dt>Số câu đúng</dt>
              <dd className="mh-metric-correct">
                {studentAnswer.numberOfCorrectAnswer} / {TOTAL_QUESTIONS}
              </dd>
            </div>
            <div className="mh-result-metric">
              <dt>Số câu sai</dt>
              <dd className="mh-metric-wrong">{wrongCount}</dd>
            </div>
            <div className="mh-result-metric">
              <dt>Số câu điểm liệt sai</dt>
              <dd className="mh-metric-wrong">{studentAnswer.numberOfWrongKeyQuestion}</dd>
            </div>
            <div className="mh-result-metric">
              <dt>Kết quả</dt>
              <dd className={isNotPass ? 'result-fail' : 'result-pass'}>
                {isNotPass ? 'KHÔNG ĐẠT' : 'ĐẠT'}
              </dd>
            </div>
          </dl>

          {isNotPass ? (
            <div className="mh-result-note mh-result-note--fail" role="note">
              Kết quả của bạn không đạt, bạn cần đợi đợt thi lý thuyết tiếp theo!
            </div>
          ) : (
            <div className="mh-result-note mh-result-note--pass" role="note">
              Chúc mừng bạn đã vượt qua kỳ kiểm tra lý thuyết GPLX B2!
            </div>
          )}

          <div className="mh-result-actions">
            <button
              type="button"
              className="mh-result-secondary-btn"
              onClick={() => handleNavigate('/kiem-tra')}
            >
              Trang kiểm tra
            </button>
            <button
              type="button"
              className="back-btn mh-result-primary-btn"
              onClick={() => handleNavigate('/')}
            >
              Trang chủ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TheoryTestResult;
