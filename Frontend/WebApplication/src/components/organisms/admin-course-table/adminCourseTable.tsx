import React, { useCallback, useEffect, useState } from 'react';
import './admin-course-table.scss';
import { Link, useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/esm/Button';
import {
    BsPlusLg,
    BsSearch,
    BsPencilSquare,
    BsTrash,
    BsArrowClockwise,
    BsJournalBookmark,
    BsPeople,
    BsCalendar3,
} from 'react-icons/bs';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
    deactivateCourse,
    fetchCourseById,
    fetchCourseList,
} from '../../../features/courses/coursesSlice';
import {
    fetchMembers,
    selectMembersList,
} from '../../../features/members/membersSlice';
import type { MemberRecord } from '../../../features/members/membersTypes';

interface CourseItem {
    courseId: string;
    name: string;
    startDate: string;
    endDate: string;
    numberOfStudents?: number;
    limitStudent: number;
    courseMonth: number;
    courseYear: number;
    status: boolean;
}

function CourseTable() {
    const dispatch = useAppDispatch();
    const allMembers = useAppSelector(selectMembersList);
    const [data, setData] = useState<CourseItem[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [courseMonthList, setCourseMonthList] = useState<number[]>([]);
    const [mapRecord, setMapRecord] = useState<Map<string, MemberRecord[]>>(new Map());
    const [memberList, setMemberList] = useState<MemberRecord[]>([]);
    const [specificCourse, setSpecificCourse] = useState<CourseItem | null>(null);
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isModalLoading, setIsModalLoading] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [currentPage, setCurrentPage] = useState(1);
    const recordPage = 10;
    const lastIndex = currentPage * recordPage;
    const firstIndex = lastIndex - recordPage;

    const filteredData = data.filter((course) =>
        (course.courseId?.toLowerCase().includes(searchValue) ||
            course.name?.toLowerCase().includes(searchValue)) &&
        (course.courseMonth === parseInt(selectedMonth, 10) || selectedMonth === '')
    );

    // Fix BUG-ADM-07: Sort filteredData BEFORE pagination slicing so page order is globally consistent
    const sortedData = [...filteredData].sort((a, b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    const sortedRecords = sortedData.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(sortedData.length / recordPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    const overallIndex = (currentPage - 1) * recordPage;

    const navigate = useNavigate();

    const getAllCourse = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const rawList = (await dispatch(fetchCourseList()).unwrap()) as CourseItem[];
            const activeCourses = rawList.filter((course) => course.status === true);
            const courseMonthSet = new Set(
                activeCourses
                    .map((course) => course.courseMonth)
                    .filter((m): m is number => typeof m === 'number' && !Number.isNaN(m))
            );
            setCourseMonthList(Array.from(courseMonthSet).sort((a, b) => a - b));
            setData(activeCourses);
        } catch (err) {
            console.error(err);
            setErrorMessage('Không thể tải danh sách khóa học. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    const getMember = useCallback(async () => {
        try {
            const res = await dispatch(fetchMembers()).unwrap();
            setMemberList(res);
        } catch (err) {
            console.error(err);
        }
    }, [dispatch]);

    useEffect(() => {
        void getAllCourse();
        void getMember();
    }, [getAllCourse, getMember]);

    // Fix BUG-ADM-07: Populate mapRecord whenever course data or allMembers updates
    useEffect(() => {
        const nextMap = new Map<string, MemberRecord[]>();
        for (const course of data) {
            const enrolled = allMembers.filter(
                (member) => String(member.courseId) === String(course.courseId)
            );
            nextMap.set(String(course.courseId), enrolled);
        }
        setMapRecord(nextMap);
    }, [data, allMembers]);

    const prePage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const changeCPage = (id: number) => {
        setCurrentPage(id);
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const updateBtn = (courseId: string) => {
        navigate(`cap-nhat-khoa-hoc/${courseId}`);
        window.scroll({
            top: 0,
            behavior: 'instant',
        });
    };

    const filter = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value.toLowerCase();
        if (e.target.name === 'courseId') {
            setSearchValue(value);
        } else if (e.target.name === 'courseMonth') {
            setSelectedMonth(value === 'tháng' || value === 'tất cả' ? '' : value);
        }
        setCurrentPage(1);
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

    const handleDelete = async (courseId: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn ngưng kích hoạt khoá học ${courseId}?`)) {
            return;
        }
        try {
            await dispatch(deactivateCourse(courseId)).unwrap();
            await getAllCourse();
        } catch (err) {
            console.error(err);
        }
    };

    const showInfo = async (courseId: string) => {
        setIsModalLoading(true);
        setSpecificCourse(null);
        try {
            const [res1, res2] = await Promise.all([
                dispatch(fetchCourseById(courseId)).unwrap(),
                dispatch(fetchMembers()).unwrap(),
            ]);
            setSpecificCourse(res1 as CourseItem);
            const membersInCourse = res2.filter((member) => member.courseId === courseId);
            setMemberList(membersInCourse);
        } catch (err) {
            console.error(err);
        } finally {
            setIsModalLoading(false);
        }
    };

    return (
        <div className='courses-table-container'>
            <div className='admin-page-header'>
                <div className='admin-page-header__left'>
                    <span className='admin-page-header__eyebrow'>Quản lý đào tạo</span>
                    <div className='courses-table-title'>
                        <h1>Danh sách khoá học</h1>
                    </div>
                    <p className='admin-page-header__subtitle'>
                        Theo dõi quy mô học viên, thời gian đào tạo và trạng thái các khoá học đang mở.
                    </p>
                </div>
                <div className='admin-page-header__actions'>
                    <Link to='/quan-ly-khoa-hoc/chua-mo' className='admin-btn admin-btn--secondary'>
                        Khoá học chưa mở
                    </Link>
                    <Link to='tao-khoa-hoc' className='btn btn-success admin-btn admin-btn--primary'>
                        <BsPlusLg aria-hidden='true' />
                        <span>Thêm khoá học</span>
                    </Link>
                </div>
            </div>

            <div className='courses-table-content'>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className='admin-table-toolbar'>
                        <div className='search-input admin-toolbar-filters'>
                            <div className='admin-input-group'>
                                <label htmlFor='active-course-search' className='visually-hidden'>
                                    Tìm kiếm theo mã hoặc tên khoá học
                                </label>
                                <BsSearch className='admin-input-group__icon' aria-hidden='true' />
                                <input
                                    id='active-course-search'
                                    type='text'
                                    name='courseId'
                                    placeholder='Tìm theo mã hoặc tên khoá học...'
                                    onChange={filter}
                                    autoComplete='off'
                                />
                            </div>
                            <div className='admin-select-group'>
                                <label htmlFor='active-course-month' className='visually-hidden'>
                                    Lọc theo tháng khai giảng
                                </label>
                                <select
                                    name='courseMonth'
                                    id='active-course-month'
                                    onChange={filter}
                                    value={selectedMonth}
                                    className='admin-filter-select'
                                >
                                    <option value='' disabled>
                                        Tháng khai giảng
                                    </option>
                                    <option value='Tất cả'>Tất cả các tháng</option>
                                    {courseMonthList.map((month) => (
                                        <option key={month} value={month}>
                                            Tháng {month}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='admin-toolbar-meta'>
                            <span className='admin-count-pill'>
                                Tổng số: <strong>{sortedData.length}</strong> khoá học
                            </span>
                            <button
                                type='button'
                                className='admin-btn admin-btn--ghost'
                                onClick={() => {
                                    void getAllCourse();
                                    void getMember();
                                }}
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
                                        Số học viên
                                    </th>
                                    <th className='text-center' scope='col'>
                                        Chỉ tiêu tối đa
                                    </th>
                                    <th scope='col' className='text-center'>
                                        Tháng / Năm
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
                                                <p>Đang tải danh sách khoá học...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : sortedRecords.length > 0 ? (
                                    sortedRecords.map((course, i) => {
                                        const mapKey = mapRecord.get(String(course.courseId));
                                        const enrolledFromMembers = mapKey ? mapKey.length : 0;
                                        const mapValue =
                                            enrolledFromMembers > 0
                                                ? enrolledFromMembers
                                                : Number(course.numberOfStudents ?? 0);

                                        return (
                                            <tr key={course.courseId}>
                                                <td className='cell-index'>{overallIndex + i + 1}</td>
                                                <td>
                                                    <a
                                                        href='/'
                                                        className='admin-entity-link'
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleShow();
                                                            void showInfo(course.courseId);
                                                        }}
                                                        aria-label={`Xem chi tiết khoá học ${course.courseId}`}
                                                    >
                                                        {course.courseId}
                                                    </a>
                                                </td>
                                                <td className='cell-strong'>{course.name}</td>
                                                <td className='cell-date'>{formatDate(course.startDate)}</td>
                                                <td className='cell-date'>{formatDate(course.endDate)}</td>
                                                <td className='text-center'>
                                                    <span className='admin-metric-badge'>
                                                        <BsPeople aria-hidden='true' />
                                                        {mapValue}
                                                    </span>
                                                </td>
                                                <td className='text-center cell-muted-num'>
                                                    {course.limitStudent}
                                                </td>
                                                <td className='text-center cell-date'>
                                                    {course.courseMonth}/{course.courseYear}
                                                </td>
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
                                                            className='btn btn-primary admin-action-btn admin-action-btn--edit'
                                                            type='button'
                                                            onClick={() => updateBtn(course.courseId)}
                                                        >
                                                            <BsPencilSquare aria-hidden='true' />
                                                            <span>Cập nhật</span>
                                                        </button>
                                                        <button
                                                            className='btn btn-danger admin-action-btn admin-action-btn--delete'
                                                            type='button'
                                                            onClick={() => void handleDelete(course.courseId)}
                                                        >
                                                            <BsTrash aria-hidden='true' />
                                                            <span>Xoá</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={10} className='admin-table-state-cell'>
                                            <div className='admin-table-state admin-table-state--empty'>
                                                <BsJournalBookmark
                                                    className='admin-table-state__icon'
                                                    aria-hidden='true'
                                                />
                                                <h2>Không tìm thấy thông tin khoá học</h2>
                                                <p>
                                                    Không có khoá học nào khớp với bộ lọc hiện tại. Vui lòng kiểm tra lại!
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
                                ? `Hiển thị ${firstIndex + 1}–${Math.min(
                                      lastIndex,
                                      sortedData.length
                                  )} trên tổng số ${sortedData.length} khoá học`
                                : 'Không có dữ liệu hiển thị'}
                        </span>
                        <nav aria-label='Phân trang danh sách khoá học'>
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
                                {pageNumbers.map((n) => (
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
                                        currentPage >= totalPages || totalPages === 0 ? 'disabled' : ''
                                    }`}
                                >
                                    <button
                                        type='button'
                                        className='page-link'
                                        onClick={nextPage}
                                        disabled={currentPage >= totalPages || totalPages === 0}
                                    >
                                        Sau
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    <Modal
                        show={show}
                        onHide={handleClose}
                        backdrop='static'
                        keyboard={true}
                        backdropClassName='backdrop'
                        dialogClassName='admin-course-detail-modal'
                        centered
                        size='lg'
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Chi tiết khoá học</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className='course-information-container'>
                                {isModalLoading ? (
                                    <div className='admin-modal-loading' role='status'>
                                        <p>Đang tải thông tin chi tiết khoá học...</p>
                                    </div>
                                ) : specificCourse !== null ? (
                                    <>
                                        <div className='course-modal-summary'>
                                            <div className='course-modal-summary__item'>
                                                <span className='course-modal-summary__label'>Mã khoá học</span>
                                                <strong className='course-modal-summary__value'>
                                                    {specificCourse.courseId}
                                                </strong>
                                            </div>
                                            <div className='course-modal-summary__item'>
                                                <span className='course-modal-summary__label'>Tên khoá học</span>
                                                <strong className='course-modal-summary__value'>
                                                    {specificCourse.name}
                                                </strong>
                                            </div>
                                            <div className='course-modal-summary__item'>
                                                <span className='course-modal-summary__label'>
                                                    <BsCalendar3 aria-hidden='true' /> Ngày khai giảng
                                                </span>
                                                <strong className='course-modal-summary__value'>
                                                    {formatDate(specificCourse.startDate)}
                                                </strong>
                                            </div>
                                            <div className='course-modal-summary__item'>
                                                <span className='course-modal-summary__label'>
                                                    <BsCalendar3 aria-hidden='true' /> Ngày bế giảng
                                                </span>
                                                <strong className='course-modal-summary__value'>
                                                    {formatDate(specificCourse.endDate)}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className='course-modal-members'>
                                            <div className='course-modal-members__header'>
                                                <h3>Danh sách học viên trong khoá</h3>
                                                <span className='course-modal-members__badge'>
                                                    {memberList.length} học viên
                                                </span>
                                            </div>
                                            {memberList.length > 0 ? (
                                                <ol className='member-items-container'>
                                                    {memberList.map((member, i) => (
                                                        <li
                                                            className='member-items'
                                                            key={member.memberId || i}
                                                        >
                                                            <span className='member-items__index'>
                                                                {i + 1}.
                                                            </span>
                                                            <span className='member-items__name'>
                                                                {member.fullName}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ol>
                                            ) : (
                                                <p className='course-modal-members__empty'>
                                                    Chưa có học viên đăng ký trong khoá học này.
                                                </p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className='course-modal-members__empty'>
                                        Không thể tải thông tin khoá học.
                                    </p>
                                )}
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant='secondary' onClick={handleClose}>
                                Đóng
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </form>
            </div>
        </div>
    );
}

export default CourseTable;
