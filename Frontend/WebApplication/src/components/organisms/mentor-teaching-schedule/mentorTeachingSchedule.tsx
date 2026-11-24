import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../app/store';
import {
  fetchClassesByMentorId,
  fetchMentorTeachingSchedule,
} from '../../../features/classes/classesSlice';
import { fetchMentorByUserId } from '../../../features/mentors/mentorsSlice';
import { getApiErrorStatus } from '../../../features/shared/apiError';
import './mentor-teaching-schedule.scss';

const formatDate = (date: Date) => {
  return `${date.getDate().toString().padStart(2, '0')}/${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}`;
};

interface DateOptionItem {
  label: string;
  value: number;
}

interface MentorClassItem {
  classId?: number | string;
  courseId?: string;
}

interface ScheduleLessonItem {
  lessonId?: number | string;
  classId: number | string;
  lessonContent?: string;
  date: string;
  location?: string;
  shift?: string;
}

function TeachingSchedule() {
  const dispatch = useAppDispatch();
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [dateOptions, setDateOptions] = useState<DateOptionItem[]>([]);
  const [weekStartDate, setWeekStartDate] = useState<Date | null>(null);
  const [weekEndDate, setWeekEndDate] = useState<Date | null>(null);
  const [mentorClass, setMentorClass] = useState<MentorClassItem[] | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleLessonItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleClassClick = (classId: number | string, date: string) => {
    localStorage.setItem('selectedClassId', String(classId));
    localStorage.setItem('selectedDate', date);
    navigate('diem-danh/' + classId);
  };

  const getClassByMentorID = useCallback(async () => {
    try {
      const rawMentor = sessionStorage.getItem('loginedMentor');
      let activeMentor = rawMentor ? JSON.parse(rawMentor) : null;
      if (!activeMentor || !activeMentor.mentorId) {
        const rawUser = sessionStorage.getItem('loginedUser');
        const parsedUser = rawUser ? JSON.parse(rawUser) : null;
        if (parsedUser?.userID != null) {
          activeMentor = await dispatch(
            fetchMentorByUserId(parsedUser.userID)
          ).unwrap();
          if (activeMentor) {
            sessionStorage.setItem('loginedMentor', JSON.stringify(activeMentor));
          }
        }
      }

      if (!activeMentor || !activeMentor.mentorId) {
        console.error('Mentor data or mentorId is missing');
        setMentorClass([]);
        return;
      }

      const classData = await dispatch(
        fetchClassesByMentorId(activeMentor.mentorId)
      ).unwrap();
      setMentorClass(Array.isArray(classData) ? classData : []);
    } catch (error) {
      console.error('Error fetching mentor class:', error);
      setLoadError('Không thể tải danh sách lớp phụ trách.');
    }
  }, [dispatch]);

  useEffect(() => {
    void getClassByMentorID();
  }, [getClassByMentorID]);

  const renderScheduleData = () => {
    const dateNow = new Date();
    const formattedDateNow = dateNow.toISOString().split('T')[0];
    const dateNowAsDate = new Date(formattedDateNow);
    dateNowAsDate.setHours(0, 0, 0, 0);

    const morningSchedule: ScheduleLessonItem[][] = Array(7)
      .fill(null)
      .map(() => []);
    const afternoonSchedule: ScheduleLessonItem[][] = Array(7)
      .fill(null)
      .map(() => []);

    const filteredClasses = scheduleData.filter((classInfo) => {
      if (!weekStartDate || !weekEndDate) return false;
      const classDate = new Date(classInfo.date);
      return classDate >= weekStartDate && classDate <= weekEndDate;
    });

    filteredClasses.forEach((classInfo) => {
      const classDate = new Date(classInfo.date);
      const dayIndex = (classDate.getDay() + 6) % 7;
      const shift = classInfo.shift;

      const targetSchedule =
        shift === 'Sáng' || shift === 'Sáng'
          ? morningSchedule
          : afternoonSchedule;

      if (targetSchedule[dayIndex]) {
        targetSchedule[dayIndex].push(classInfo);
      }
    });

    return (
      <>
        <tr className="study-slot">
          <td className="shift-cell">
            <span className="shift-badge shift-badge--morning">Ca sáng</span>
            <small className="shift-time">07:30 – 11:30</small>
          </td>
          {morningSchedule.map((morningClasses, morningIndex) => (
            <td key={morningIndex} className="morning-slot schedule-day-cell">
              {morningClasses.length > 0 ? (
                <div className="schedule-slot-stack">
                  {morningClasses.map((classInfo, classIndex) => {
                    const isCompleted =
                      new Date(classInfo.date) <= dateNowAsDate;
                    return (
                      <div
                        key={classIndex}
                        className="schedule-lesson-card"
                        onClick={() =>
                          handleClassClick(classInfo.classId, classInfo.date)
                        }
                      >
                        <div className="schedule-lesson-card__top">
                          <strong className="schedule-lesson-card__title">
                            {classInfo.lessonContent || 'Thực hành'}
                          </strong>
                          <span
                            className={`schedule-status-badge ${
                              isCompleted ? 'is-completed' : 'is-upcoming'
                            }`}
                          >
                            {isCompleted ? 'Đã diễn ra' : 'Chưa diễn ra'}
                          </span>
                        </div>
                        <a
                          href="/"
                          className="schedule-lesson-card__link"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleClassClick(classInfo.classId, classInfo.date);
                          }}
                        >
                          Lớp: #{classInfo.classId} (Điểm danh)
                        </a>
                        <span className="schedule-lesson-card__meta">
                          Địa điểm: {classInfo.location || 'Sân tập trung tâm'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="schedule-empty-slot">—</span>
              )}
            </td>
          ))}
        </tr>
        <tr className="study-slot">
          <td className="shift-cell">
            <span className="shift-badge shift-badge--afternoon">Ca chiều</span>
            <small className="shift-time">13:30 – 17:30</small>
          </td>
          {afternoonSchedule.map((afternoonClasses, afternoonIndex) => (
            <td key={afternoonIndex} className="afternoon-slot schedule-day-cell">
              {afternoonClasses.length > 0 ? (
                <div className="schedule-slot-stack">
                  {afternoonClasses.map((classInfo, classIndex) => {
                    const isCompleted =
                      new Date(classInfo.date) <= dateNowAsDate;
                    return (
                      <div
                        key={classIndex}
                        className="schedule-lesson-card"
                        onClick={() =>
                          handleClassClick(classInfo.classId, classInfo.date)
                        }
                      >
                        <div className="schedule-lesson-card__top">
                          <strong className="schedule-lesson-card__title">
                            {classInfo.lessonContent || 'Thực hành'}
                          </strong>
                          <span
                            className={`schedule-status-badge ${
                              isCompleted ? 'is-completed' : 'is-upcoming'
                            }`}
                          >
                            {isCompleted ? 'Đã diễn ra' : 'Chưa diễn ra'}
                          </span>
                        </div>
                        <a
                          href="/"
                          className="schedule-lesson-card__link"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleClassClick(classInfo.classId, classInfo.date);
                          }}
                        >
                          Lớp: #{classInfo.classId} (Điểm danh)
                        </a>
                        <span className="schedule-lesson-card__meta">
                          Địa điểm: {classInfo.location || 'Sân tập trung tâm'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="schedule-empty-slot">—</span>
              )}
            </td>
          ))}
        </tr>
      </>
    );
  };

  const fetchScheduleData = useCallback(async () => {
    try {
      const rawMentor = sessionStorage.getItem('loginedMentor');
      const currentMentor = rawMentor ? JSON.parse(rawMentor) : null;

      if (
        !mentorClass ||
        mentorClass.length === 0 ||
        !currentMentor?.mentorId ||
        !weekStartDate ||
        !weekEndDate
      ) {
        setScheduleData([]);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      const scheduleRes = await dispatch(
        fetchMentorTeachingSchedule({
          mentorId: currentMentor.mentorId,
          startDate: weekStartDate.toISOString().split('T')[0],
          endDate: weekEndDate.toISOString().split('T')[0],
        })
      ).unwrap();

      setScheduleData(
        Array.isArray(scheduleRes)
          ? (scheduleRes as ScheduleLessonItem[])
          : []
      );
    } catch (error) {
      if (getApiErrorStatus(error) === 404) {
        setScheduleData([]);
        setLoadError(null);
      } else {
        console.error('Error fetching schedule data:', error);
        setScheduleData([]);
        setLoadError('Không thể tải dữ liệu lịch dạy cho tuần đã chọn.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, mentorClass, weekStartDate, weekEndDate]);

  useEffect(() => {
    void fetchScheduleData();
  }, [fetchScheduleData]);

  const generateDateOptions = useCallback((year: number) => {
    const options: DateOptionItem[] = [];

    const startDate = new Date(year, 0, 1);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1);

    for (let week = 1; week <= 52; week++) {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      options.push({
        label: `${formatDate(startDate)} - ${formatDate(endDate)}`,
        value: week,
      });

      startDate.setDate(startDate.getDate() + 7);
    }

    setDateOptions(options);
  }, []);

  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    setSelectedWeek(1);
    generateDateOptions(year);
  };

  useEffect(() => {
    generateDateOptions(selectedYear);
  }, [selectedYear, generateDateOptions]);

  useEffect(() => {
    const currentYear = selectedYear;
    const startDate = new Date(currentYear, 0, 1);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
    startDate.setDate(startDate.getDate() + (selectedWeek - 1) * 7);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    setWeekStartDate(startDate);
    setWeekEndDate(endDate);
  }, [selectedWeek, selectedYear]);

  const updateSelectedTime = () => {
    const currentDate = new Date();
    if (!currentDate) {
      return;
    }

    const currentYear = currentDate.getFullYear();
    const currentWeek = Math.ceil(
      (currentDate.getTime() - new Date(currentYear, 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );

    setSelectedYear(currentYear);
    setSelectedWeek(currentWeek);
  };

  useEffect(() => {
    updateSelectedTime();

    const intervalId = setInterval(() => {
      updateSelectedTime();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const currentYearOption = new Date().getFullYear();
  const availableYears = Array.from(
    new Set([2023, 2024, 2025, 2026, currentYearOption, selectedYear])
  ).sort((a, b) => a - b);

  return (
    <div className="teaching-schedule-container">
      <header className="mentor-page-header">
        <div>
          <span className="mentor-page-eyebrow">Quản lý giảng dạy</span>
          <h1>Lịch dạy trong tuần</h1>
          <p>
            Theo dõi lịch dạy theo từng ca trong tuần và chọn lớp để điểm danh học viên.
          </p>
        </div>
        <div className="mentor-schedule-summary">
          <span className="mentor-count-pill">
            Lớp phụ trách: <strong>{mentorClass ? mentorClass.length : '…'}</strong>
          </span>
          <span className="mentor-count-pill">
            Buổi dạy trong tuần: <strong>{isLoading ? '…' : scheduleData.length}</strong>
          </span>
        </div>
      </header>

      <div className="teaching-schedule">
        <form onSubmit={(e) => e.preventDefault()}>
          <section className="mentor-table-card" aria-label="Bảng lịch dạy trong tuần">
            <div className="mentor-schedule-toolbar">
              <div className="mentor-schedule-filters">
                <div className="mentor-filter-group">
                  <label htmlFor="mentor-schedule-year">Năm</label>
                  <select
                    id="mentor-schedule-year"
                    value={selectedYear}
                    onChange={(e) => void handleYearChange(parseInt(e.target.value, 10))}
                  >
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        Năm {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mentor-filter-group">
                  <label htmlFor="mentor-schedule-week">Tuần</label>
                  <select
                    id="mentor-schedule-week"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value, 10))}
                  >
                    {dateOptions.map((option, index) => (
                      <option key={index} value={option.value}>
                        Tuần {option.value} ({option.label})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {weekStartDate && weekEndDate && (
                <div className="mentor-week-range-badge">
                  Khung tuần: <strong>{formatDate(weekStartDate)} – {formatDate(weekEndDate)}/{selectedYear}</strong>
                </div>
              )}
            </div>

            <div
              className="mentor-schedule-scroll"
              role="region"
              aria-label="Lịch dạy chi tiết trong tuần"
              tabIndex={0}
            >
              <table className="schedule-table">
                <thead className="schedule-header-container">
                  <tr>
                    <th rowSpan={2} className="mini-title shift-column-header">
                      Ca học / Thứ
                    </th>
                    <th>Thứ hai</th>
                    <th>Thứ ba</th>
                    <th>Thứ tư</th>
                    <th>Thứ năm</th>
                    <th>Thứ sáu</th>
                    <th>Thứ bảy</th>
                    <th>Chủ nhật</th>
                  </tr>
                  <tr className="schedule-dates-row">
                    {weekStartDate && weekEndDate
                      ? [...Array(7)].map((_, dayIndex) => {
                          const currentDate = new Date(weekStartDate);
                          currentDate.setDate(currentDate.getDate() + dayIndex);
                          return <th key={dayIndex}>{formatDate(currentDate)}</th>;
                        })
                      : [...Array(7)].map((_, dayIndex) => (
                          <th key={dayIndex}>—</th>
                        ))}
                  </tr>
                </thead>
                <tbody className="schedule-body-container">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="mentor-schedule-state" role="status">
                          Đang tải lịch dạy trong tuần…
                        </div>
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={8}>
                        <div
                          className="mentor-schedule-state mentor-schedule-state--error"
                          role="alert"
                        >
                          <span>{loadError}</span>
                          <button
                            type="button"
                            className="mentor-retry-btn"
                            onClick={() => void fetchScheduleData()}
                          >
                            Thử lại
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : scheduleData.length > 0 ? (
                    renderScheduleData()
                  ) : (
                    <tr>
                      <td colSpan={8}>
                        <div className="mentor-schedule-state" role="status">
                          Hiện không có lịch dạy trong tuần đã chọn.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}

export default TeachingSchedule;
