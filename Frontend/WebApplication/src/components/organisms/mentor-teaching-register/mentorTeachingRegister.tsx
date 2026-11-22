import React, { useCallback, useEffect, useState } from 'react';
import './mentor-teaching-register.scss';
import api from '../../../config/axios';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface CheckboxTableState {
  checkboxes: {
    [key: string]: boolean;
  };
}

interface MentorRecord {
  mentorId: number | string;
  fullName?: string;
}

const MentorTeachingRegister: React.FC = () => {
  const user = sessionStorage.getItem('loginedUser')
    ? JSON.parse(sessionStorage.getItem('loginedUser')!)
    : null;
  const userId = user?.userID;
  const [mentor, setMentor] = useState<MentorRecord | null>(null);
  const { courseId } = useParams();
  const [checkboxes, setCheckboxes] = useState<CheckboxTableState['checkboxes']>({
    'sáng-2': false,
    'sáng-3': false,
    'sáng-4': false,
    'sáng-5': false,
    'sáng-6': false,
    'chiều-2': false,
    'chiều-3': false,
    'chiều-4': false,
    'chiều-5': false,
    'chiều-6': false,
  });

  const [hoveredCheckbox, setHoveredCheckbox] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckboxChange = (key: string) => {
    setErrorMessage(null);
    setCheckboxes((prevCheckboxes) => ({
      ...prevCheckboxes,
      [key]: !prevCheckboxes[key],
    }));
  };

  const getMentorByUID = useCallback(async () => {
    try {
      if (userId == null) return;
      const response = await api.get('Mentor/user/' + userId);
      setMentor(response.data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  const handleMouseEnter = (key: string) => {
    setHoveredCheckbox(key);
  };

  const handleMouseLeave = () => {
    setHoveredCheckbox(null);
  };

  const getDayOfWeekNumber = (dayOfWeek: string) => {
    const daysOfWeek = ['2', '3', '4', '5', '6'];
    return daysOfWeek.indexOf(dayOfWeek.toLowerCase()) + 2;
  };

  const capitalizeFirstLetter = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const selectedCount = Object.keys(checkboxes).filter(
    (key) => checkboxes[key]
  ).length;

  const handleSubmit = async () => {
    const selectedDays = Object.keys(checkboxes).filter(
      (key) => checkboxes[key]
    );

    const listObjects = selectedDays
      .map((selectedDay) => {
        const [shift, dayOfWeek] = selectedDay.split('-');
        if (mentor) {
          return {
            mentorId: mentor.mentorId,
            courseId: courseId,
            dayOfWeek: getDayOfWeekNumber(dayOfWeek),
            shift: capitalizeFirstLetter(shift),
            status: true,
          };
        }
        return undefined;
      })
      .filter(
        (
          item
        ): item is {
          mentorId: number | string;
          courseId: string | undefined;
          dayOfWeek: number;
          shift: string;
          status: boolean;
        } => item !== undefined
      );

    const formattedListObjects = listObjects.map(
      ({ mentorId, courseId, dayOfWeek, shift, status }) => ({
        mentorId,
        courseId,
        dayOfWeek,
        shift,
        status,
      })
    );

    try {
      const response = await api.post(
        'Class/addClassPracticeByMentor',
        formattedListObjects,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
        toast.success('Lịch đã được đặt thành công!');
        window.history.back();
      }
    } catch (error) {
      console.error('Error:', error);
      const apiErr = (
        error as { response?: { data?: { error?: string } } } | null
      )?.response?.data?.error;
      setErrorMessage(
        apiErr || 'Không thể đăng ký lịch dạy lúc này. Vui lòng kiểm tra và thử lại.'
      );
    }
  };

  useEffect(() => {
    void getMentorByUID();
  }, [getMentorByUID]);

  return (
    <div className="mentor-teaching-register-page">
      <Link to="/danh-sach-khoa-hoc-giao-vien" className="mentor-back-link">
        <span aria-hidden="true">←</span>
        <span>Quay lại danh sách khóa học B2</span>
      </Link>

      <header className="title mentor-register-header">
        <div>
          <span className="mentor-page-eyebrow">Phân bổ ca dạy thực hành</span>
          <h1>Đăng kí lịch dạy thực hành khóa {courseId}</h1>
          <p>
            Chọn các ca sáng và ca chiều từ Thứ hai đến Thứ sáu mà bạn có thể phụ trách giảng dạy cho khóa{' '}
            <strong>{courseId}</strong>.
          </p>
        </div>
        <div className="mentor-selected-badge">
          Đã chọn: <strong>{selectedCount}</strong> / 10 ca trong tuần
        </div>
      </header>

      <div className="register-form-container">
        <div className="register-table-container">
          <section className="mentor-register-card" aria-label="Bảng chọn ca dạy thực hành">
            <div className="mentor-register-card__header">
              <h2>Bảng chọn ca dạy trong tuần</h2>
              <p>Nhấn vào từng ô Thứ / Ca học để chọn hoặc bỏ chọn ca giảng dạy.</p>
            </div>

            {errorMessage && (
              <p className="mentor-register-error" role="alert">
                {errorMessage}
              </p>
            )}

            <form
              onSubmit={(e) => e.preventDefault()}
              id="teaching-register-form"
            >
              <div
                className="mentor-register-scroll"
                role="region"
                aria-label="Lưới chọn ca dạy từ Thứ hai đến Thứ sáu"
                tabIndex={0}
              >
                <table className="register-table">
                  <thead className="register-header">
                    <tr>
                      <th scope="col">Ca dạy / Thứ</th>
                      <th scope="col" className="tw-text-center">
                        Thứ hai
                      </th>
                      <th scope="col" className="tw-text-center">
                        Thứ ba
                      </th>
                      <th scope="col" className="tw-text-center">
                        Thứ tư
                      </th>
                      <th scope="col" className="tw-text-center">
                        Thứ năm
                      </th>
                      <th scope="col" className="tw-text-center">
                        Thứ sáu
                      </th>
                    </tr>
                  </thead>
                  <tbody className="register-body">
                    <tr>
                      <td className="shift-label-cell">
                        <strong>Ca sáng</strong>
                        <span>07:30 – 11:30</span>
                      </td>
                      {[2, 3, 4, 5, 6].map((day) => {
                        const key = `sáng-${day}`;
                        const isChecked = checkboxes[key];
                        const isHovered = hoveredCheckbox === key;
                        return (
                          <td
                            key={key}
                            align="center"
                            className={`custom-checkbox ${
                              isChecked ? 'checked' : ''
                            } ${isHovered ? 'hovered' : ''}`}
                            onClick={() => handleCheckboxChange(key)}
                            onMouseEnter={() => handleMouseEnter(key)}
                            onMouseLeave={handleMouseLeave}
                            role="checkbox"
                            aria-checked={isChecked}
                            aria-label={`Ca sáng Thứ ${day}`}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                handleCheckboxChange(key);
                              }
                            }}
                          >
                            <div className="custom-checkbox-inner">
                              {isChecked ? (
                                <span className="checkmark">✓ Đã chọn</span>
                              ) : (
                                <span className="unselected-label">Chọn ca</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="shift-label-cell">
                        <strong>Ca chiều</strong>
                        <span>13:30 – 17:30</span>
                      </td>
                      {[2, 3, 4, 5, 6].map((day) => {
                        const key = `chiều-${day}`;
                        const isChecked = checkboxes[key];
                        const isHovered = hoveredCheckbox === key;
                        return (
                          <td
                            key={key}
                            align="center"
                            className={`custom-checkbox ${
                              isChecked ? 'checked' : ''
                            } ${isHovered ? 'hovered' : ''}`}
                            onClick={() => handleCheckboxChange(key)}
                            onMouseEnter={() => handleMouseEnter(key)}
                            onMouseLeave={handleMouseLeave}
                            role="checkbox"
                            aria-checked={isChecked}
                            aria-label={`Ca chiều Thứ ${day}`}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                handleCheckboxChange(key);
                              }
                            }}
                          >
                            <div className="custom-checkbox-inner">
                              {isChecked ? (
                                <span className="checkmark">✓ Đã chọn</span>
                              ) : (
                                <span className="unselected-label">Chọn ca</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mentor-register-actions">
                <button
                  type="button"
                  className="mentor-cancel-button"
                  onClick={() => window.history.back()}
                >
                  Hủy
                </button>
                <button
                  onClick={() => void handleSubmit()}
                  className="submit-button"
                  type="button"
                >
                  Xác nhận đăng ký
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MentorTeachingRegister;
