import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './mentor-take-attendance.scss';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../app/store';
import {
  fetchLessonAttendance,
  updateLessonAttendance,
} from '../../../features/classes/classesSlice';
import { getApiErrorStatus } from '../../../features/shared/apiError';

interface Student {
  classStudentId: string;
  lessonId: string;
  studentName: string;
  hours: number;
  kilometers: number;
  attendance: boolean;
}

function StudentsAttendances() {
  const dispatch = useAppDispatch();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { classId } = useParams();

  const storedDate = localStorage.getItem('selectedDate');
  const selectedDate = storedDate ? new Date(storedDate) : new Date();

  const formattedDate = `${selectedDate.getFullYear()}-${(
    selectedDate.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;

  const displayDate = `${selectedDate
    .getDate()
    .toString()
    .padStart(2, '0')}/${(selectedDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${selectedDate.getFullYear()}`;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      if (classId) {
        const attendanceData = await dispatch(
          fetchLessonAttendance({ classId, date: formattedDate })
        ).unwrap();
        setStudents(Array.isArray(attendanceData) ? attendanceData : []);
      }
    } catch (error) {
      if (getApiErrorStatus(error) === 404) {
        setStudents([]);
      } else {
        console.error('Error fetching student data:', error);
        setStudents([]);
        setLoadError('Không thể tải danh sách điểm danh của lớp học này.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [classId, dispatch, formattedDate]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const attendanceData = students.map((student) => ({
        lessonId: student.lessonId,
        hours: student.hours,
        kilometers: student.kilometers,
        attendance: student.attendance,
      }));

      if (classId && formattedDate) {
        await dispatch(updateLessonAttendance(attendanceData)).unwrap();
        toast.success('Điểm danh học viên thành công!');
      } else {
        console.error('ClassId or date is missing from session storage');
      }

      window.history.back();
    } catch (error) {
      console.error('Error sending attendance data:', error);
    }
  };

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.classStudentId === studentId
          ? { ...student, attendance: isPresent }
          : student
      )
    );
  };

  const presentCount = students.filter((s) => s.attendance === true).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="mentor-attendance-page">
      <Link to="/lich-day" className="mentor-back-link">
        <span aria-hidden="true">←</span>
        <span>Quay lại lịch dạy trong tuần</span>
      </Link>

      <header className="student-attendance-title-container">
        <div>
          <span className="mentor-page-eyebrow">Điểm danh buổi học</span>
          <h1>Danh sách học viên lớp #{classId}</h1>
          <p>
            Ngày học: <strong>{displayDate}</strong> — đánh dấu trạng thái có mặt hoặc vắng mặt của từng học viên.
          </p>
        </div>
      </header>

      <section className="mentor-summary-strip" aria-label="Tổng quan điểm danh">
        <div className="mentor-summary-pill">
          <span className="mentor-summary-pill__label">Tổng học viên trong lớp</span>
          <strong className="mentor-summary-pill__value">
            {isLoading || loadError ? '—' : students.length}
          </strong>
        </div>
        <div className="mentor-summary-pill mentor-summary-pill--success">
          <span className="mentor-summary-pill__label">Có mặt</span>
          <strong className="mentor-summary-pill__value">
            {isLoading || loadError ? '—' : presentCount}
          </strong>
        </div>
        <div className="mentor-summary-pill mentor-summary-pill--muted">
          <span className="mentor-summary-pill__label">Vắng mặt</span>
          <strong className="mentor-summary-pill__value">
            {isLoading || loadError ? '—' : absentCount}
          </strong>
        </div>
      </section>

      <div className="students-attendance-container">
        <form onSubmit={handleSubmit} id="take-attendance-form">
          <section className="mentor-table-card" aria-label="Bảng điểm danh học viên">
            <div
              className="mentor-table-scroll"
              role="region"
              aria-label="Danh sách điểm danh học viên"
              tabIndex={0}
            >
              <table className="attendance-table">
                <thead className="attendance-table-header">
                  <tr>
                    <th scope="col">STT</th>
                    <th scope="col">Họ và tên học viên</th>
                    <th scope="col" className="col-center">
                      Trạng thái hiện tại
                    </th>
                    <th scope="col" className="col-center">
                      Điểm danh
                    </th>
                  </tr>
                </thead>
                <tbody className="attendance-table-body">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="mentor-table-state" role="status">
                          Đang tải danh sách học viên…
                        </div>
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={4}>
                        <div
                          className="mentor-table-state mentor-table-state--error"
                          role="alert"
                        >
                          <span>{loadError}</span>
                          <button
                            type="button"
                            className="mentor-retry-btn"
                            onClick={() => void fetchData()}
                          >
                            Thử lại
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : students.length > 0 ? (
                    students.map((student, index) => (
                      <tr key={student.classStudentId || index}>
                        <td className="cell-index">{index + 1}</td>
                        <td className="cell-strong">{student.studentName}</td>
                        <td className="col-center">
                          <span
                            className={`attendance-badge ${
                              student.attendance ? 'is-present' : 'is-absent'
                            }`}
                          >
                            {student.attendance ? 'Có mặt' : 'Vắng mặt'}
                          </span>
                        </td>
                        <td className="col-center">
                          <div className="attendance-radio-group">
                            <label
                              className={`attendance-radio-option ${
                                !student.attendance ? 'is-selected-absent' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name={`attendance-${index}`}
                                value="absent"
                                checked={!student.attendance}
                                onChange={() =>
                                  handleAttendanceChange(
                                    student.classStudentId,
                                    false
                                  )
                                }
                              />
                              <span>Vắng mặt</span>
                            </label>
                            <label
                              className={`attendance-radio-option ${
                                student.attendance ? 'is-selected-present' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name={`attendance-${index}`}
                                value="present"
                                checked={student.attendance}
                                onChange={() =>
                                  handleAttendanceChange(
                                    student.classStudentId,
                                    true
                                  )
                                }
                              />
                              <span>Có mặt</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        <div className="mentor-table-state" role="status">
                          Chưa có danh sách học viên cho buổi học này.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="mentor-attendance-footer">
              <button
                type="button"
                className="mentor-cancel-btn"
                onClick={() => window.history.back()}
              >
                Quay lại
              </button>
              <button
                className="submit-button"
                type="submit"
                form="take-attendance-form"
                disabled={isLoading || students.length === 0}
              >
                Xác nhận điểm danh
              </button>
            </footer>
          </section>
        </form>
      </div>
    </div>
  );
}

export default StudentsAttendances;
