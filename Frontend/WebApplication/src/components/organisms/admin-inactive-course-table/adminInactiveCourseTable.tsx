import React, { useCallback, useEffect, useState } from 'react';
import './admin-inactive-course-table.scss';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    BsArrowClockwise,
    BsCheckCircle,
    BsJournalBookmark,
    BsPlusLg,
    BsSearch,
} from 'react-icons/bs';
import { useAppDispatch } from '../../../app/store';
import { activateCourse, fetchInactiveCourses } from '../../../features/courses/coursesSlice';
import type { ApiRejectedPayload } from '../../../features/courses/coursesTypes';

interface InactiveCourseItem {
    courseId: string;
    name: string;
    startDate: string;
    endDate: string;
    limitStudent: number;
    courseMonth: number;
    courseYear: number;
    status: boolean;
}

function InactiveCourseTable() {
    const dispatch = useAppDispatch();
    const [data, setData] = useState<InactiveCourseItem[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Pagination variables
    const [currentPage, setCurrentPage] = useState(1);
    const recordPage = 10;
    const lastIndex = currentPage * recordPage;
    const firsIndex = lastIndex - recordPage;

    // Fetch all inactive courses
    const getAllCourse = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const res = (await dispatch(fetchInactiveCourses()).unwrap()) as InactiveCourseItem[];
            setData(res);
        } catch (err) {
            const rejected = err as ApiRejectedPayload | undefined;
            if (rejected?.status === 404) {
                setData([]);
                setErrorMessage(null);
            } else {
                console.error(err);
                setErrorMessage('Không thể tải danh sách khoá học chưa mở. Vui lòng thử lại.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    // Apply filtering and sorting to data before pagination slicing
    const filteredData = data.filter(
        (course) =>
            course.courseId?.toLowerCase().includes(searchValue) ||
            course.name?.toLowerCase().includes(searchValue)
    );

    const sortedData = [...filteredData].sort((a, b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    // Pagination
    const records = sortedData.slice(firsIndex, lastIndex);
    const npage = Math.ceil(sortedData.length / recordPage);
    const numbers = Array.from({ length: npage }, (_, i) => i + 1);
    const overallIndex = (currentPage - 1) * recordPage;

    // Handle page navigation
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

    useEffect(() => {
        void getAllCourse();
    }, [getAllCourse]);

    const updateBtn = async (courseId: string) => {
        try {
            const response = await dispatch(activateCourse(courseId)).unwrap();
            if (response.status !== 200) {
                toast.error('Kích hoạt khoá học thất bại');
                return;
            }
            localStorage.setItem('notification', 'Kích hoạt khoá học thành công');
            window.location.reload();
        } catch (err) {
            console.error(err);
            toast.error('Kích hoạt khoá học thất bại');
        }
    };

    // Filtering function
    const filter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setSearchValue(value);
        setCurrentPage(1); // Reset to the first page when filtering
    };

    const formatDate = (dbDate: string) => {
        if (!dbDate) return '—';
        const date = new Date(dbDate);
        if (Number.isNaN(date.getTime())) return '—';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        const notification = localStorage.getItem('notification');
        if (notification) {
            toast.success(notification);
            localStorage.removeItem('notification');
        }
    }, []);

    return (
        <div className='inactive-courses-table-container courses-table-container'>
            <div className='admin-page-header'>
                <div className='admin-page-header__left'>
                    <span className='admin-page-header__eyebrow'>Quản lý đào tạo</span>
                    <div className='inactive-courses-table-title courses-table-title'>
                        <h1>Danh sách khoá học chưa mở</h1>
                    </div>
                    <p className='admin-page-header__subtitle'>
                        Kiểm tra và kích hoạt các khoá học đã khởi tạo để mở đăng ký cho học viên.
                    </p>
                </div>
                <div className='admin-page-header__actions'>
                    <Link to='/quan-ly-khoa-hoc' className='admin-btn admin-btn--secondary'>
                        Khoá học đang mở
                    </Link>
                    <Link
                        to='/quan-ly-khoa-hoc/tao-khoa-hoc'
                        className='btn btn-success admin-btn admin-btn--primary'
                    >
                        <BsPlusLg aria-hidden='true' />
                        <span>Thêm khoá học</span>
                    </Link>
                </div>
            </div>

            <div className='inactive-courses-table-content courses-table-content'>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className='admin-table-toolbar'>
                        <div className='search-input admin-toolbar-filters'>
                            <div className='admin-input-group'>
                                <label htmlFor='inactive-course-search' className='visually-hidden'>
                                    Tìm kiếm theo mã hoặc tên khoá học chưa mở
                                </label>
                                <BsSearch className='admin-input-group__icon' aria-hidden='true' />
                                <input
                                    id='inactive-course-search'
                                    type='text'
                                    name='courseId'
                                    placeholder='Tìm theo mã hoặc tên khoá học...'
                                    onChange={filter}
                                    autoComplete='off'
                                />
                            </div>
                        </div>

                        <div className='admin-toolbar-meta'>
                            <span className='admin-count-pill'>
                                Chưa mở: <strong>{sortedData.length}</strong> khoá học
                            </span>
                            <button
                                type='button'
                                className='admin-btn admin-btn--ghost'
                                onClick={() => void getAllCourse()}
                                title='Làm mới dữ liệu'
                            >
                                <BsArrowClockwise aria-hidden='true' />
                                <span>Làm mới</span>
                            </button>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className='admin-table-alert' role='alert'>
                            <span>{errorMessage}</span>
                            <button
                                type='button'
                                className='admin-btn admin-btn--secondary'
                                onClick={() => void getAllCourse()}
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    <div className='admin-table-wrapper'>
                        <table className='table table-hover table-striped'>
                            <thead className='table-primary'>
                                <tr>
                                    <th scope='col'>#</th>
                                    <th scope='col'>Mã khoá học</th>
                                    <th scope='col'>Tên khoá học</th>
                                    <th scope='col'>Ngày khai giảng</th>
                                    <th scope='col'>Ngày bế giảng</th>
                                    <th className='text-center' scope='col'>
                                        Chỉ tiêu tối đa
                                    </th>
                                    <th scope='col' className='text-center'>
                                        Tháng
                                    </th>
                                    <th scope='col' className='text-center'>
                                        Năm
                                    </th>
                                    <th scope='col' className='text-center'>
                                        Trạng thái
                                    </th>
                                    <th scope='col' className='text-center'>
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='table-group-divider align-middle'>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={10} className='admin-table-state-cell'>
                                            <div className='admin-table-state' role='status' aria-live='polite'>
                                                <div className='admin-spinner' aria-hidden='true' />
                                                <p>Đang tải danh sách khoá học chưa mở...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : records.length > 0 ? (
                                    records.map((course, i) => (
                                        <tr key={course.courseId || i}>
                                            <td className='cell-index'>{overallIndex + i + 1}</td>
                                            <td>
                                                <span className='admin-code-chip'>{course.courseId}</span>
                                            </td>
                                            <td className='cell-strong'>{course.name}</td>
                                            <td className='cell-date'>{formatDate(course.startDate)}</td>
                                            <td className='cell-date'>{formatDate(course.endDate)}</td>
                                            <td className='text-center cell-muted-num'>
                                                {course.limitStudent}
                                            </td>
                                            <td className='text-center cell-date'>{course.courseMonth}</td>
                                            <td className='text-center cell-date'>{course.courseYear}</td>
                                            <td className='text-center'>
                                                <span
                                                    className={`admin-status-badge ${
                                                        course.status
                                                            ? 'admin-status-badge--active'
                                                            : 'admin-status-badge--inactive'
                                                    }`}
                                                >
                                                    {course.status ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                                                </span>
                                            </td>
                                            <td className='button text-center'>
                                                <div className='admin-row-actions'>
                                                    <button
                                                        className='btn btn-primary admin-action-btn admin-action-btn--activate'
                                                        type='button'
                                                        onClick={() => void updateBtn(course.courseId)}
                                                    >
                                                        <BsCheckCircle aria-hidden='true' />
                                                        <span>Kích hoạt</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className='admin-table-state-cell'>
                                            <div className='admin-table-state admin-table-state--empty'>
                                                <BsJournalBookmark
                                                    className='admin-table-state__icon'
                                                    aria-hidden='true'
                                                />
                                                <h2>Không tìm thấy khoá học chưa mở</h2>
                                                <p>
                                                    Hiện không có khoá học chờ kích hoạt khớp với tìm kiếm của bạn.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className='admin-table-footer'>
                        <span className='admin-table-footer__info'>
                            {sortedData.length > 0
                                ? `Hiển thị ${firsIndex + 1}–${Math.min(
                                      lastIndex,
                                      sortedData.length
                                  )} trên tổng số ${sortedData.length} khoá học`
                                : 'Không có dữ liệu hiển thị'}
                        </span>
                        <nav aria-label='Phân trang khoá học chưa mở'>
                            <ul className='pagination'>
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        type='button'
                                        className='page-link'
                                        onClick={prePage}
                                        disabled={currentPage === 1}
                                    >
                                        Trước
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
                                            onClick={() => changeCPage(n)}
                                        >
                                            {n}
                                        </button>
                                    </li>
                                ))}
                                <li
                                    className={`page-item ${
                                        currentPage >= npage || npage === 0 ? 'disabled' : ''
                                    }`}
                                >
                                    <button
                                        type='button'
                                        className='page-link'
                                        onClick={nextPage}
                                        disabled={currentPage >= npage || npage === 0}
                                    >
                                        Sau
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InactiveCourseTable;
