import React, { useCallback, useEffect, useState } from 'react'
import './guest-course-table.scss'
import { Link, useParams } from 'react-router-dom'
import { CircularProgress } from '@mui/material';
import { useAppDispatch } from '../../../app/store';
import {
    fetchCourseDetailsByMonth,
    fetchCoursesByMonth,
} from '../../../features/courses/coursesSlice';
import type { ApiRejectedPayload } from '../../../features/courses/coursesTypes';

interface CourseDetailItem {
    courseDetailId?: number;
    courseContent: string;
    courseTimeStart: string;
    courseTimeEnd: string;
    courseId: string;
}

interface CourseItem {
    courseId: string;
    name: string;
    startDate: string;
    endDate: string;
    limitStudent: number;
    courseFee: number;
}

interface CourseRowItem extends CourseItem {
    details: CourseDetailItem[];
}

function CourseTable() {
    const dispatch = useAppDispatch();
    const { month } = useParams();
    const { year } = useParams();
    const [data, setData] = useState<CourseRowItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }

    const formatDate = (dbDate: string) => {
        const date = new Date(dbDate);
        const day = date.getDate().toString().padStart(2, '0');
        const formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        const formattedYear = date.getFullYear();
        return `${day}/${formattedMonth}/${formattedYear}`;
    }

    const getCourseData = useCallback(async (targetMonth?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const courses = (await dispatch(
                fetchCoursesByMonth({ month: targetMonth, year })
            ).unwrap()) as CourseItem[];
            const courseDetails = (await dispatch(
                fetchCourseDetailsByMonth(targetMonth)
            ).unwrap()) as CourseDetailItem[];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const validCourse = courses.filter(course => {
                const courseEndDate = new Date(course.endDate);
                courseEndDate.setHours(0, 0, 0, 0);

                return courseEndDate >= today;
            });

            const tempCourseData: CourseRowItem[] = validCourse.map(course => {
                const detailsForCourse = courseDetails.filter(detail => detail.courseId === course.courseId);
                return { ...course, details: detailsForCourse };
            });

            setData(tempCourseData);
        } catch (err) {
            console.log(err);
            const rejected = err as ApiRejectedPayload | undefined;
            if (rejected?.status === 404) {
                setData([]);
            } else {
                setError('Không thể tải thông tin khóa học. Vui lòng thử lại sau.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, year]);

    useEffect(() => {
        getCourseData(month);
    }, [getCourseData, month, year])

    return (
        <section className='course-table-container' id='course-nav' aria-labelledby='gh-course-page-title'>
            <div className='gh-course-header'>
                <div className='gh-course-breadcrumb'>
                    <Link to='/#course-section' className='gh-course-back-link'>
                        ← Quay lại danh sách khóa học
                    </Link>
                </div>
                <h1 id='gh-course-page-title' className='text-center course-title gh-section-title'>
                    Thông tin khoá học
                </h1>
            </div>

            <div className='course-table'>
                <form onSubmit={handleSubmit}>
                    <table>
                        <caption className='table-title'>
                            <h2>Các khoá học tháng {month}/{year}</h2>
                        </caption>
                        <thead>
                            <tr className='content-title'>
                                <th scope='col'>Thứ tự</th>
                                <th scope='col' className='course-course'>Khoá học</th>
                                <th scope='col'>Số lượng</th>
                                <th scope='col'>Nội dung đào tạo</th>
                                <th scope='col'>Thời gian</th>
                                <th scope='col'><span className='gh-sr-only'>Đăng ký</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr className='gh-course-state-row'>
                                    <td colSpan={6}>
                                        <div className='gh-course-state' role='status' aria-live='polite'>
                                            <CircularProgress size={32} className='gh-course-spinner' />
                                            <p className='gh-course-state-text'>Đang tải thông tin khóa học...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr className='gh-course-state-row'>
                                    <td colSpan={6}>
                                        <div className='gh-course-state gh-course-state--error' role='alert'>
                                            <p className='gh-course-state-text'>{error}</p>
                                            <button
                                                type='button'
                                                className='gh-course-retry-btn'
                                                onClick={() => getCourseData(month)}
                                            >
                                                Thử lại
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length > 0 ? (
                                data.map((course, i) => (
                                    <tr key={course.courseId || i} className='gh-course-row'>
                                        <td className='course-no' data-label='Thứ tự'>
                                            <p className='gh-course-index'>{i + 1}</p>
                                        </td>
                                        <td className='course-date' data-label='Khoá học'>
                                            <p className='gh-course-name'>Khoá {course.name}</p>
                                            <p className='gh-course-meta'>
                                                <span className='gh-meta-label'>KG:</span> {formatDate(course.startDate)}
                                            </p>
                                            <p className='gh-course-meta'>
                                                <span className='gh-meta-label'>BG:</span> {formatDate(course.endDate)}
                                            </p>
                                            <p className='gh-course-fee'>
                                                Học phí: <strong>{course.courseFee.toLocaleString()} VNĐ</strong>
                                            </p>
                                        </td>
                                        <td className='course-mem' data-label='Số lượng'>
                                            <p className='gh-course-limit'>
                                                {course.limitStudent} <span className='gh-limit-unit'>học viên</span>
                                            </p>
                                        </td>
                                        <td className='course-training-content' data-label='Nội dung đào tạo'>
                                            <ol>
                                                {course.details.map((detail, j) => (
                                                    <li key={detail.courseDetailId ?? j}>
                                                        <span className='gh-detail-content'>{detail.courseContent}</span>
                                                        <span className='gh-detail-time-mobile'>
                                                            {formatDate(detail.courseTimeStart)} - {formatDate(detail.courseTimeEnd)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </td>
                                        <td className='course-training-time' data-label='Thời gian'>
                                            <ol>
                                                {course.details.map((detail, j) => (
                                                    <li key={detail.courseDetailId ?? j}>
                                                        {formatDate(detail.courseTimeStart)} - {formatDate(detail.courseTimeEnd)}
                                                    </li>
                                                ))}
                                            </ol>
                                        </td>
                                        <td className='course-register' data-label='Đăng ký'>
                                            <Link to='/dang-nhap' className='btnRegister btn btn-primary gh-course-register-btn'>
                                                Đăng ký
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className='gh-course-state-row'>
                                    <td colSpan={6}>
                                        <div className='gh-course-state gh-course-state--empty' role='status'>
                                            <h3 className='gh-course-state-title'>Hiện chưa có lịch khai giảng</h3>
                                            <p className='gh-course-state-text'>
                                                Chưa có khóa học sắp khai giảng trong tháng {month}/{year}. Vui lòng chọn tháng khác hoặc quay lại trang chủ.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </form>
            </div>
        </section>
    )
}

export default CourseTable

