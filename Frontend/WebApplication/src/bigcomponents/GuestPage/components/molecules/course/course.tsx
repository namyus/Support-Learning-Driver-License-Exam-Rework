import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import api from '../../../../../config/axios';
import './course.scss';

interface CourseItem {
    courseId?: string;
    courseMonth: number;
    courseYear: number;
    startDate: string;
}

function Course() {
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [courses, setCourses] = useState<CourseItem[]>([]);

    // Pagination part
    const [currentPage, setCurrentPage] = useState(1);
    const recordPage = 3;

    const currentDate = new Date();

    // Filter courses based on the upcoming month/year condition
    const filteredCourses = courses.filter((course) => {
        const currentMonth = currentDate.getMonth() + 1; // Adding 1 because months are zero-indexed
        const currentYear = currentDate.getFullYear();

        // Compare courseMonth and courseYear (greater than or equal)
        return (
            course.courseYear > currentYear ||
            (course.courseYear === currentYear && course.courseMonth >= currentMonth)
        );
    });

    const npage = Math.ceil(filteredCourses.length / recordPage);
    const lastIndex = currentPage * recordPage;
    const firstIndex = lastIndex - recordPage;
    const records = filteredCourses.slice(firstIndex, lastIndex);
    const numbers = npage > 0 ? [...Array(npage + 1).keys()].slice(1) : [];

    const getCourseData = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await api.get('Course/list');
            const allCourses = response.data;

            if (!Array.isArray(allCourses)) {
                setCourses([]);
                setErrorMessage('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
                setIsLoading(false);
                return;
            }

            // Group courses by courseMonth and courseYear to display unique courses
            const uniqueCourses: CourseItem[] = [];
            const seen = new Set<string>();

            allCourses.forEach((course: CourseItem) => {
                const courseKey = `${course.courseMonth}/${course.courseYear}`;
                if (!seen.has(courseKey)) {
                    seen.add(courseKey);
                    uniqueCourses.push(course);
                }
            });

            // Sort the unique courses based on courseYear and courseMonth
            uniqueCourses.sort((a, b) => {
                if (a.courseYear === b.courseYear) {
                    return a.courseMonth - b.courseMonth;
                }
                return a.courseYear - b.courseYear;
            });

            setCourses(uniqueCourses);
            setCurrentPage(1);
            setIsLoading(false);
        } catch (error) {
            console.error(error);

            const isKnownNoCourse404 =
                axios.isAxiosError(error) &&
                error.response?.status === 404 &&
                (error.response?.data as { error?: string } | undefined)?.error === 'Không tìm thấy khóa học!';

            if (isKnownNoCourse404) {
                setCourses([]);
                setErrorMessage(null);
            } else {
                setCourses([]);
                setErrorMessage('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
            }

            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getCourseData();
    }, [getCourseData]);

    const formatDate = (dbDate: string) => {
        const date = new Date(dbDate);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const prePage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const changeCPage = (id: number) => {
        setCurrentPage(id);
    };

    const nextPage = () => {
        if (currentPage < npage) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <section
            className='course-container gh-course-section'
            id='course-section'
            aria-labelledby='gh-course-heading'
        >
            <div className='gh-section-header'>
                <h2 id='gh-course-heading' className='gh-section-title'>
                    Các khoá học
                </h2>
            </div>

            {isLoading ? (
                <div className='gh-course-state gh-course-state--loading' role='status' aria-live='polite'>
                    <div className='gh-course-state__spinner' aria-hidden='true' />
                    <p className='gh-course-state__text'>Đang tải danh sách khóa học...</p>
                </div>
            ) : errorMessage ? (
                <div className='gh-course-state gh-course-state--error' role='alert'>
                    <p className='gh-course-state__text'>{errorMessage}</p>
                    <button
                        type='button'
                        className='gh-course-state__retry'
                        onClick={getCourseData}
                    >
                        Thử lại
                    </button>
                </div>
            ) : records.length > 0 ? (
                <div className='course-list gh-course-grid'>
                    {records.map((course, i) => (
                        <article
                            className='course-section-1 gh-course-card'
                            key={`${course.courseMonth}-${course.courseYear}-${i}`}
                        >
                            <div className='upperbox gh-course-card__header'>
                                <h3 className='gh-course-card__title'>
                                    Khóa học tháng {course.courseMonth}/{course.courseYear}
                                </h3>
                            </div>
                            <div className='course-content gh-course-card__body'>
                                <ul className='course-content-list gh-course-card__list'>
                                    <li>1. Khai giảng ngày {formatDate(course.startDate)}</li>
                                    <li>2. Cam kết học phí trọn gói - hợp lý</li>
                                    <li>3. Lịch thi chuẩn - không chậm trễ</li>
                                    <li>4. Dịch vụ 1 kèm 1</li>
                                    <li>5. Đội ngũ giáo viên chất lượng</li>
                                    <li>6. Sau 4 tháng bế giảng khoá</li>
                                </ul>
                            </div>
                            <div className='underbox gh-course-card__footer'>
                                <Link
                                    to={`/khoahoc/${course.courseMonth}/${course.courseYear}`}
                                    className='gh-course-card__cta'
                                >
                                    Xem khoá học
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className='gh-course-state gh-course-state--empty' role='status'>
                    <p className='gh-course-state__text'>Hiện chưa có khóa học sắp khai giảng.</p>
                </div>
            )}

            {!isLoading && !errorMessage && filteredCourses.length > recordPage && (
                <nav className='gh-course-pagination' aria-label='Phân trang khóa học'>
                    <ul className='pagination'>
                        <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                            <button
                                type='button'
                                className='page-link'
                                onClick={prePage}
                                disabled={currentPage <= 1}
                            >
                                Prev
                            </button>
                        </li>
                        {numbers.map((n) => (
                            <li
                                className={`page-item ${currentPage === n ? 'active' : ''}`}
                                key={n}
                            >
                                <button
                                    type='button'
                                    className='page-link'
                                    aria-current={currentPage === n ? 'page' : undefined}
                                    onClick={() => changeCPage(n)}
                                >
                                    {n}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage >= npage ? 'disabled' : ''}`}>
                            <button
                                type='button'
                                className='page-link'
                                onClick={nextPage}
                                disabled={currentPage >= npage}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </section>
    );
}

export default Course;
