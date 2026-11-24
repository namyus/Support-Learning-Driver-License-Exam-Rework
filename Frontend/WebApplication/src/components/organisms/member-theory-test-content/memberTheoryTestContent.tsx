import { useCallback, useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineExclamationCircle,
  AiOutlineFileText,
  AiOutlineWarning,
} from 'react-icons/ai';
import { useAppDispatch } from '../../../app/store';
import { fetchTestByStudentId } from '../../../features/exams/examsSlice';
import { fetchMemberByUserId } from '../../../features/members/membersSlice';
import type { MemberRecord } from '../../../features/members/membersTypes';
import { fetchStudentByMemberId } from '../../../features/students/studentsSlice';
import type { StudentRecord } from '../../../features/students/studentsTypes';
import { getApiErrorStatus } from '../../../features/shared/apiError';
import './member-theory-test-content.scss';

interface LoginedUser {
  userID?: number;
  userId?: number;
}

interface TheoryTestRecord {
  testId?: number;
  studentId?: string;
  examId?: number;
  score?: number | null;
  pass?: boolean | null;
  createTime?: string | null;
  examTime?: string | null;
}

function readSessionJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function TheoryTestContent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [member, setMember] = useState<MemberRecord | null>(null);
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [theoryTest, setTheoryTest] = useState<TheoryTestRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadExamEntryData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const user = readSessionJson<LoginedUser>('loginedUser');
    const userId = user?.userID ?? user?.userId;

    if (!userId) {
      setMember(null);
      setStudent(null);
      setTheoryTest(null);
      setErrorMessage('Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.');
      setIsLoading(false);
      return;
    }

    try {
      let memberData: MemberRecord | null = null;
      try {
        memberData = await dispatch(fetchMemberByUserId(userId)).unwrap();
        if (memberData) {
          sessionStorage.setItem('loginedMember', JSON.stringify(memberData));
        }
      } catch (err) {
        if (getApiErrorStatus(err) === 404) {
          setMember(null);
          setStudent(null);
          setTheoryTest(null);
          setIsLoading(false);
          return;
        }
        throw err;
      }

      setMember(memberData);

      if (!memberData?.memberID) {
        setStudent(null);
        setTheoryTest(null);
        setIsLoading(false);
        return;
      }

      let studentData: StudentRecord | null = null;
      try {
        const studentResponse = await dispatch(
          fetchStudentByMemberId(memberData.memberID)
        ).unwrap();
        studentData = studentResponse.student;
      } catch (err) {
        if (getApiErrorStatus(err) === 404) {
          setStudent(null);
          setTheoryTest(null);
          setIsLoading(false);
          return;
        }
        throw err;
      }

      setStudent(studentData);

      if (!studentData?.studentId) {
        setTheoryTest(null);
        setIsLoading(false);
        return;
      }

      try {
        const testData = await dispatch(
          fetchTestByStudentId(studentData.studentId)
        ).unwrap();
        setTheoryTest(testData ?? null);
      } catch (err) {
        if (getApiErrorStatus(err) === 404) {
          setTheoryTest(null);
          setIsLoading(false);
          return;
        }
        throw err;
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Không thể tải thông tin kỳ kiểm tra lý thuyết. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void loadExamEntryData();
  }, [loadExamEntryData]);

  const isCompleted =
    theoryTest !== null && (theoryTest.pass === true || theoryTest.pass === false);
  const isAvailable = theoryTest !== null && !isCompleted;

  const handleClick = () => {
    if (!isAvailable) return;
    toast.success('Chúc bạn làm bài tốt!', {
      position: 'top-right',
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
    });
    navigate('bai-lam');
    window.scroll({
      top: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  };

  const renderEligibilityDetail = () => {
    if (!member) {
      return 'Bạn chưa có hồ sơ học viên để tham gia kỳ kiểm tra lý thuyết.';
    }
    if (!student) {
      return 'Bạn chưa được cấp mã học viên cho khóa học hiện tại.';
    }
    if (theoryTest === null) {
      return 'Hiện chưa có bài kiểm tra lý thuyết nào được mở cho mã học viên của bạn.';
    }
    if (theoryTest.pass === true) {
      return 'Bạn đã hoàn thành và đạt bài kiểm tra lý thuyết trong đợt thi này.';
    }
    if (theoryTest.pass === false) {
      return 'Bạn đã hoàn thành lượt kiểm tra lý thuyết này. Vui lòng đợi đợt kiểm tra tiếp theo.';
    }
    return 'Bài kiểm tra lý thuyết đã sẵn sàng. Nhấn "Làm bài" để bắt đầu vào phòng thi.';
  };

  return (
    <section className="theory-test-container mh-exam-entry-section">
      <div className="theory-title-box mh-exam-entry-header">
        <h1 className="theory-test-title mh-section-title">Kiểm tra Lý Thuyết</h1>
        {member?.courseId ? (
          <p className="theory-test-subtitle mh-exam-course-badge">
            Kỳ kiểm tra lý thuyết bằng B2 khoá {member.courseId}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mh-exam-state" role="status" aria-live="polite">
          <Spinner animation="border" className="mh-exam-spinner" />
          <p className="mh-exam-state__text">Đang kiểm tra trạng thái kỳ thi của bạn...</p>
        </div>
      ) : errorMessage ? (
        <div className="mh-exam-state mh-exam-state--error" role="alert">
          <AiOutlineExclamationCircle className="mh-exam-state__icon" aria-hidden="true" />
          <h2 className="mh-exam-state__title">Không thể tải dữ liệu</h2>
          <p className="mh-exam-state__text">{errorMessage}</p>
          <button
            type="button"
            className="mh-exam-primary-btn"
            onClick={() => void loadExamEntryData()}
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="mh-exam-entry-card">
          <div className="theory-content mh-exam-rules">
            <div className="mh-exam-highlights">
              <div className="mh-exam-highlight-item">
                <AiOutlineFileText className="mh-exam-highlight-item__icon" aria-hidden="true" />
                <div>
                  <span className="mh-exam-highlight-item__label">Cấu trúc đề thi</span>
                  <strong className="mh-exam-highlight-item__value">35 câu hỏi trắc nghiệm</strong>
                </div>
              </div>
              <div className="mh-exam-highlight-item">
                <AiOutlineCheckCircle className="mh-exam-highlight-item__icon" aria-hidden="true" />
                <div>
                  <span className="mh-exam-highlight-item__label">Điểm đạt yêu cầu</span>
                  <strong className="mh-exam-highlight-item__value">Từ 32/35 câu đúng</strong>
                </div>
              </div>
              <div className="mh-exam-highlight-item">
                <AiOutlineClockCircle className="mh-exam-highlight-item__icon" aria-hidden="true" />
                <div>
                  <span className="mh-exam-highlight-item__label">Thời gian làm bài</span>
                  <strong className="mh-exam-highlight-item__value">20 phút</strong>
                </div>
              </div>
            </div>

            <div className="mh-exam-description">
              <h2 className="mh-exam-subhead">Thông tin đề thi sát hạch lý thuyết B2</h2>
              <p className="first-part">
                Trong đề thi trắc nghiệm B2 do Trung tâm đào tạo bằng lái xe B2 FDRIVING biên soạn
                sẽ gồm 35 câu hỏi và chỉ có 1 đáp án đúng duy nhất ở từng câu. Dựa theo cấu trúc đề
                thi lý thuyết B2 chính thức, mỗi đề thi sát hạch lý thuyết B2 sẽ bao gồm: 1 câu hỏi
                phần khái niệm; 7 câu hỏi về quy tắc giao thông; 1 câu hỏi nghiệp vụ vận tải; 1 câu
                về tốc độ khoảng cách; 1 câu hỏi về văn hóa &amp; đạo đức người lái xe; 2 câu hỏi về
                kỹ thuật lái xe; 1 câu hỏi về cấu tạo sửa chữa; 10 câu hỏi biển báo; 10 câu hỏi sa
                hình kèm theo câu hỏi điểm liệt (tình huống gây mất an toàn giao thông nghiêm
                trọng). Học viên ôn tập cần đáp ứng các yêu cầu sau:
              </p>

              <ul className="demand-list">
                <li>Số câu trả lời phải đúng từ 32/35 câu trở lên</li>
                <li>Thời gian làm bài trực tuyến: 20 phút (tự động nộp bài khi hết giờ)</li>
                <li className="important-element">KHÔNG LÀM SAI NHỮNG CÂU ĐIỂM LIỆT</li>
              </ul>
            </div>

            <div className="second-part mh-exam-notice" role="note">
              <AiOutlineWarning className="mh-exam-notice__icon" aria-hidden="true" />
              <p>
                <strong>Lưu ý:</strong> Để có thể đăng ký và tham gia lớp học thực hành sau này,
                học viên cần vượt qua bài kiểm tra này. Những học viên có kết quả không đạt trong
                đợt kiểm tra lý thuyết này sẽ phải đợi lượt kiểm tra tiếp theo.
              </p>
            </div>
          </div>

          <div
            className={`btn-test mh-exam-eligibility ${
              isAvailable ? 'mh-exam-eligibility--available' : 'mh-exam-eligibility--unavailable'
            }`}
          >
            <div className="mh-exam-eligibility__info">
              <div className="mh-exam-eligibility__top">
                <span className="mh-exam-eligibility__label">Trạng thái bài kiểm tra:</span>
                <span
                  className={`mh-status-pill ${
                    isAvailable ? 'mh-status-pill--success' : 'mh-status-pill--muted'
                  }`}
                >
                  {isAvailable ? 'Khả dụng' : 'Không khả dụng'}
                </span>
              </div>
              <p className="mh-exam-eligibility__desc">{renderEligibilityDetail()}</p>
              {student?.studentId ? (
                <p className="mh-exam-eligibility__meta">
                  Mã học viên: <strong>{student.studentId}</strong>
                </p>
              ) : null}
            </div>

            <button
              type="button"
              className="theory-test-btn mh-exam-primary-btn"
              onClick={handleClick}
              disabled={!isAvailable}
            >
              Làm bài
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default TheoryTestContent;
