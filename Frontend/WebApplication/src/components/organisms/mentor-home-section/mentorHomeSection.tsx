import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BsArrowClockwise,
  BsCalendarCheckFill,
  BsCalendarWeekFill,
  BsClockHistory,
  BsEnvelopeFill,
  BsGeoAltFill,
  BsJournalBookmarkFill,
  BsPersonBadgeFill,
  BsTelephoneFill,
} from 'react-icons/bs';
import { useAppDispatch } from '../../../app/store';
import {
  fetchClassesByMentorId,
  fetchMentorTeachingSchedule,
} from '../../../features/classes/classesSlice';
import { fetchCourseList } from '../../../features/courses/coursesSlice';
import type { CourseRecord } from '../../../features/courses/coursesTypes';
import { fetchMentorByUserId } from '../../../features/mentors/mentorsSlice';
import { getApiErrorStatus } from '../../../features/shared/apiError';
import './mentor-home-section.scss';

interface MentorSessionUser {
  userID?: number | string;
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface MentorProfileRecord {
  mentorId?: number | string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  residenceAddress?: string | null;
  isTeachingTheory?: boolean | null;
  isTeachingPractice?: boolean | null;
}

interface MentorClassRecord {
  classId?: number | string;
  courseId?: string | null;
  dayOfWeek?: number | string | null;
  shift?: string | null;
  status?: boolean | null;
}

interface TeachingLessonRecord {
  lessonId?: number | string;
  classId?: number | string;
  lessonContent?: string | null;
  date?: string | null;
  location?: string | null;
  shift?: string | null;
}

function readSessionUser(): MentorSessionUser | null {
  try {
    const raw = sessionStorage.getItem('loginedUser');
    return raw ? (JSON.parse(raw) as MentorSessionUser) : null;
  } catch {
    return null;
  }
}

function readStoredMentor(): MentorProfileRecord | null {
  try {
    const raw = sessionStorage.getItem('loginedMentor');
    return raw ? (JSON.parse(raw) as MentorProfileRecord) : null;
  } catch {
    return null;
  }
}

function getCurrentWeekRange(): { startDate: Date; endDate: Date; startIso: string; endIso: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const toIso = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
      .getDate()
      .toString()
      .padStart(2, '0')}`;

  return {
    startDate: monday,
    endDate: sunday,
    startIso: toIso(monday),
    endIso: toIso(sunday),
  };
}

function formatDateVi(dbDate?: string | Date | null): string {
  if (!dbDate) return '—';
  const date = dbDate instanceof Date ? dbDate : new Date(dbDate);
  if (Number.isNaN(date.getTime())) return '—';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function HomePage() {
  const dispatch = useAppDispatch();
  const [user] = useState(readSessionUser);
  const [mentor, setMentor] = useState<MentorProfileRecord | null>(readStoredMentor);
  const [classes, setClasses] = useState<MentorClassRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [weekLessons, setWeekLessons] = useState<TeachingLessonRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [classesError, setClassesError] = useState<string | null>(null);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [lessonsError, setLessonsError] = useState<string | null>(null);

  const weekRange = useMemo(() => getCurrentWeekRange(), []);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setProfileError(null);
    setClassesError(null);
    setCoursesError(null);
    setLessonsError(null);

    let resolvedMentor = readStoredMentor();

    if (user?.userID != null) {
      try {
        const mentorData = await dispatch(
          fetchMentorByUserId(user.userID)
        ).unwrap();
        if (mentorData) {
          resolvedMentor = mentorData as MentorProfileRecord;
          setMentor(resolvedMentor);
          sessionStorage.setItem('loginedMentor', JSON.stringify(resolvedMentor));
        }
      } catch {
        if (!resolvedMentor) {
          setProfileError('Không thể tải hồ sơ giảng viên từ máy chủ.');
        }
      }
    }

    const coursesPromise = dispatch(fetchCourseList())
      .unwrap()
      .then((list) => {
        setCourses(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setCourses([]);
        setCoursesError('Không thể tải danh sách khóa học.');
      });

    if (resolvedMentor?.mentorId != null) {
      const mentorId = resolvedMentor.mentorId;
      let loadedClasses: MentorClassRecord[] = [];

      try {
        const classData = await dispatch(
          fetchClassesByMentorId(mentorId)
        ).unwrap();
        loadedClasses = Array.isArray(classData)
          ? (classData as MentorClassRecord[])
          : [];
        setClasses(loadedClasses);
      } catch {
        setClasses([]);
        setClassesError('Không thể tải danh sách lớp thực hành phụ trách.');
      }

      if (loadedClasses.length > 0) {
        try {
          const scheduleData = await dispatch(
            fetchMentorTeachingSchedule({
              mentorId,
              startDate: weekRange.startIso,
              endDate: weekRange.endIso,
            })
          ).unwrap();
          const rawLessons: TeachingLessonRecord[] = Array.isArray(scheduleData)
            ? [...scheduleData]
            : [];
          rawLessons.sort(
            (a, b) =>
              new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime()
          );
          setWeekLessons(rawLessons);
        } catch (err) {
          if (getApiErrorStatus(err) === 404) {
            setWeekLessons([]);
          } else {
            setWeekLessons([]);
            setLessonsError('Không thể tải lịch dạy trong tuần hiện tại.');
          }
        }
      } else {
        setWeekLessons([]);
      }
    }

    await coursesPromise;
    setIsLoading(false);
  }, [dispatch, user?.userID, weekRange.endIso, weekRange.startIso]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const registeredCourseIds = useMemo(
    () =>
      new Set(
        classes
          .map((item) => item.courseId)
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      ),
    [classes]
  );

  const unregisteredCoursesCount = useMemo(
    () =>
      courses.filter((course) => !registeredCourseIds.has(course.courseId)).length,
    [courses, registeredCourseIds]
  );

  const displayName =
    mentor?.fullName?.trim() ||
    user?.fullName?.trim() ||
    user?.username?.trim() ||
    'Giảng viên';

  const todayMidnight = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const upcomingWeekLessons = useMemo(
    () =>
      weekLessons.filter((item) => {
        if (!item.date) return false;
        const d = new Date(item.date);
        d.setHours(0, 0, 0, 0);
        return d >= todayMidnight;
      }),
    [todayMidnight, weekLessons]
  );

  return (
    <div className="mentor-home-container">
      <header className="mentor-dashboard-header">
        <div>
          <span className="mentor-dashboard-eyebrow">FDriving Mentor Portal</span>
          <h1>Tổng quan giảng dạy</h1>
          <p>
            Xin chào <strong>{displayName}</strong> — theo dõi thông tin phân công, lịch dạy trong tuần và đăng ký lịch dạy thực hành.
          </p>
        </div>
        <div className="mentor-dashboard-header__actions">
          <button
            type="button"
            className="mentor-refresh-btn"
            onClick={() => void loadDashboard()}
            disabled={isLoading}
          >
            <BsArrowClockwise aria-hidden="true" />
            <span>{isLoading ? 'Đang tải...' : 'Làm mới'}</span>
          </button>
        </div>
      </header>

      <p className="mentor-dashboard-note">
        Số liệu được tổng hợp trực tiếp từ hồ sơ giảng viên, danh sách lớp phụ trách và các khóa học đã tải từ máy chủ.
      </p>

      <section className="mentor-summary-grid" aria-label="Thống kê giảng dạy">
        <article className="mentor-summary-card">
          <div className="mentor-summary-card__top">
            <div>
              <h2>Lớp thực hành phụ trách</h2>
              <span>Từ API /Class/{mentor?.mentorId ?? '—'}</span>
            </div>
            <span className="mentor-summary-card__icon" aria-hidden="true">
              <BsCalendarCheckFill />
            </span>
          </div>
          <strong className="mentor-summary-card__value">
            {isLoading ? '…' : classesError ? '—' : classes.length}
          </strong>
          <div className="mentor-summary-card__meta">
            <div>
              <span>Khóa đã đăng ký</span>
              <strong>{isLoading ? '…' : classesError ? '—' : registeredCourseIds.size}</strong>
            </div>
            <div>
              <span>Trạng thái hoạt động</span>
              <strong>
                {isLoading
                  ? '…'
                  : classesError
                  ? '—'
                  : classes.filter((c) => c.status !== false).length}
              </strong>
            </div>
          </div>
          {classesError && (
            <p className="mentor-summary-card__error" role="alert">
              {classesError}
            </p>
          )}
        </article>

        <article className="mentor-summary-card mentor-summary-card--teal">
          <div className="mentor-summary-card__top">
            <div>
              <h2>Khóa học B2 trong hệ thống</h2>
              <span>Từ API Course/list</span>
            </div>
            <span className="mentor-summary-card__icon" aria-hidden="true">
              <BsJournalBookmarkFill />
            </span>
          </div>
          <strong className="mentor-summary-card__value">
            {isLoading ? '…' : coursesError ? '—' : courses.length}
          </strong>
          <div className="mentor-summary-card__meta">
            <div>
              <span>Đã đăng ký dạy</span>
              <strong>
                {isLoading || coursesError || classesError
                  ? '—'
                  : courses.length - unregisteredCoursesCount}
              </strong>
            </div>
            <div>
              <span>Có thể đăng ký</span>
              <strong>
                {isLoading || coursesError || classesError
                  ? '—'
                  : unregisteredCoursesCount}
              </strong>
            </div>
          </div>
          {coursesError && (
            <p className="mentor-summary-card__error" role="alert">
              {coursesError}
            </p>
          )}
        </article>

        <article className="mentor-summary-card mentor-summary-card--sky">
          <div className="mentor-summary-card__top">
            <div>
              <h2>Buổi dạy tuần hiện tại</h2>
              <span>
                {formatDateVi(weekRange.startDate)} – {formatDateVi(weekRange.endDate)}
              </span>
            </div>
            <span className="mentor-summary-card__icon" aria-hidden="true">
              <BsCalendarWeekFill />
            </span>
          </div>
          <strong className="mentor-summary-card__value">
            {isLoading ? '…' : lessonsError ? '—' : weekLessons.length}
          </strong>
          <div className="mentor-summary-card__meta">
            <div>
              <span>Sắp diễn ra / hôm nay</span>
              <strong>
                {isLoading ? '…' : lessonsError ? '—' : upcomingWeekLessons.length}
              </strong>
            </div>
            <div>
              <span>Đã diễn ra</span>
              <strong>
                {isLoading
                  ? '…'
                  : lessonsError
                  ? '—'
                  : weekLessons.length - upcomingWeekLessons.length}
              </strong>
            </div>
          </div>
          {lessonsError && (
            <p className="mentor-summary-card__error" role="alert">
              {lessonsError}
            </p>
          )}
        </article>
      </section>

      <div className="mentor-dashboard-columns">
        <section className="mentor-panel-card" aria-labelledby="mentor-profile-heading">
          <header className="mentor-panel-card__header">
            <div>
              <h2 id="mentor-profile-heading">Thông tin giảng viên</h2>
              <p>Hồ sơ tài khoản và phân công chuyên môn hiện tại.</p>
            </div>
            {mentor?.mentorId != null && (
              <span className="mentor-id-pill">Mã GV: #{mentor.mentorId}</span>
            )}
          </header>

          {profileError ? (
            <div className="mentor-panel-state mentor-panel-state--error" role="alert">
              <span>{profileError}</span>
              <button
                type="button"
                className="mentor-retry-btn"
                onClick={() => void loadDashboard()}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="mentor-profile-summary">
              <div className="mentor-profile-summary__identity">
                <span className="mentor-profile-summary__avatar" aria-hidden="true">
                  <BsPersonBadgeFill />
                </span>
                <div>
                  <h3>{displayName}</h3>
                  <div className="mentor-role-badges">
                    <span
                      className={`mentor-status-badge ${
                        mentor?.isTeachingTheory
                          ? 'mentor-status-badge--active'
                          : 'mentor-status-badge--inactive'
                      }`}
                    >
                      Lý thuyết: {mentor?.isTeachingTheory ? 'Đang phụ trách' : 'Không phụ trách'}
                    </span>
                    <span
                      className={`mentor-status-badge ${
                        mentor?.isTeachingPractice
                          ? 'mentor-status-badge--active'
                          : 'mentor-status-badge--inactive'
                      }`}
                    >
                      Thực hành: {mentor?.isTeachingPractice ? 'Đang phụ trách' : 'Không phụ trách'}
                    </span>
                  </div>
                </div>
              </div>

              <dl className="mentor-profile-summary__list">
                <div>
                  <dt>
                    <BsTelephoneFill aria-hidden="true" /> Điện thoại
                  </dt>
                  <dd>{mentor?.phone || user?.phone || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt>
                    <BsEnvelopeFill aria-hidden="true" /> Email
                  </dt>
                  <dd>{mentor?.email || user?.email || 'Chưa cập nhật'}</dd>
                </div>
                {mentor?.residenceAddress && (
                  <div className="mentor-profile-summary__full">
                    <dt>
                      <BsGeoAltFill aria-hidden="true" /> Địa chỉ
                    </dt>
                    <dd>{mentor.residenceAddress}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </section>

        <section className="mentor-panel-card" aria-labelledby="mentor-upcoming-heading">
          <header className="mentor-panel-card__header">
            <div>
              <h2 id="mentor-upcoming-heading">Lịch dạy trong tuần này</h2>
              <p>
                Tuần {formatDateVi(weekRange.startDate)} – {formatDateVi(weekRange.endDate)}
              </p>
            </div>
            <Link to="/lich-day" className="mentor-panel-link">
              Xem toàn bộ lịch tuần →
            </Link>
          </header>

          {isLoading ? (
            <div className="mentor-panel-state" role="status">
              Đang tải lịch dạy tuần hiện tại…
            </div>
          ) : lessonsError ? (
            <div className="mentor-panel-state mentor-panel-state--error" role="alert">
              <span>{lessonsError}</span>
              <button
                type="button"
                className="mentor-retry-btn"
                onClick={() => void loadDashboard()}
              >
                Thử lại
              </button>
            </div>
          ) : weekLessons.length > 0 ? (
            <ul className="mentor-upcoming-list">
              {weekLessons.slice(0, 5).map((lesson, idx) => {
                const lessonDate = lesson.date ? new Date(lesson.date) : null;
                if (lessonDate) lessonDate.setHours(0, 0, 0, 0);
                const isCompleted =
                  lessonDate != null && lessonDate <= todayMidnight;

                return (
                  <li
                    key={lesson.lessonId ?? `${lesson.classId}-${lesson.date}-${idx}`}
                    className="mentor-upcoming-item"
                  >
                    <div className="mentor-upcoming-item__main">
                      <div className="mentor-upcoming-item__title">
                        <strong>{lesson.lessonContent || 'Buổi học thực hành'}</strong>
                        <span className="mentor-code-chip">Lớp #{lesson.classId}</span>
                      </div>
                      <div className="mentor-upcoming-item__sub">
                        <span>
                          <BsClockHistory aria-hidden="true" /> {formatDateVi(lesson.date)} • Ca{' '}
                          {lesson.shift || '—'}
                        </span>
                        {lesson.location && (
                          <span>
                            <BsGeoAltFill aria-hidden="true" /> {lesson.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`mentor-status-badge ${
                        isCompleted
                          ? 'mentor-status-badge--completed'
                          : 'mentor-status-badge--upcoming'
                      }`}
                    >
                      {isCompleted ? 'Đã diễn ra' : 'Chưa diễn ra'}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mentor-panel-state" role="status">
              Hiện chưa có buổi dạy nào được xếp trong tuần này.
            </div>
          )}
        </section>
      </div>

      <section className="mentor-quick-actions" aria-labelledby="mentor-quick-actions-heading">
        <div className="mentor-quick-actions__header">
          <h2 id="mentor-quick-actions-heading">Truy cập nhanh</h2>
          <p>Mở các chức năng chính dành cho giảng viên đào tạo.</p>
        </div>
        <div className="mentor-quick-actions__grid">
          <Link to="/lich-day" className="mentor-action-card">
            <span className="mentor-action-card__icon" aria-hidden="true">
              <BsCalendarWeekFill />
            </span>
            <div className="mentor-action-card__body">
              <h3>Lịch dạy trong tuần</h3>
              <p>Theo dõi lịch giảng dạy theo năm/tuần và điểm danh học viên theo từng lớp.</p>
            </div>
            <span className="mentor-action-card__arrow" aria-hidden="true">
              →
            </span>
          </Link>

          <Link to="/danh-sach-khoa-hoc-giao-vien" className="mentor-action-card">
            <span className="mentor-action-card__icon" aria-hidden="true">
              <BsCalendarCheckFill />
            </span>
            <div className="mentor-action-card__body">
              <h3>Đăng kí lịch dạy</h3>
              <p>Xem danh sách các khóa học B2 và đăng ký ca dạy thực hành theo thứ trong tuần.</p>
            </div>
            <span className="mentor-action-card__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
