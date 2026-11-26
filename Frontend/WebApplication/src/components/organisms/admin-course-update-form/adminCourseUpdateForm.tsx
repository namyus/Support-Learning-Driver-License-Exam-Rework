import React, { useState, useEffect, useCallback, useRef } from 'react';
import './admin-course-update-form.scss';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { BsArrowLeft, BsExclamationCircle } from 'react-icons/bs';
import { useAppDispatch } from '../../../app/store';
import { fetchCourseById, updateCourse as updateCourseThunk } from '../../../features/courses/coursesSlice';
import type { ApiRejectedPayload, UpdateCoursePayload } from '../../../features/courses/coursesTypes';

const MISSING_MENTOR_MESSAGE =
    'Khóa học này chưa được phân công giáo viên lý thuyết (Mentor). Backend hiện yêu cầu MentorID hợp lệ để cập nhật. Vui lòng liên hệ quản trị viên để kiểm tra hoặc phân công giáo viên trước khi tiếp tục.';

const MISSING_MENTOR_ID_MESSAGE =
    'Khóa học này chưa có mã giáo viên lý thuyết (MentorID) hợp lệ từ hệ thống. Backend hiện yêu cầu MentorID hợp lệ để cập nhật. Vui lòng liên hệ quản trị viên để kiểm tra hoặc phân công giáo viên trước khi tiếp tục.';

function getApiErrorMessage(err: unknown, fallback: string): string {
    if (typeof err === 'object' && err !== null) {
        const rejected = err as ApiRejectedPayload & {
            response?: { status?: number; data?: { error?: string; message?: string } };
        };
        const status = rejected.status ?? rejected.response?.status;
        if (typeof status === 'number' && status >= 500) {
            return 'Lỗi hệ thống máy chủ. Vui lòng thử lại sau.';
        }
        if (typeof rejected.error === 'string' && rejected.error.trim().length > 0) {
            return rejected.error.trim();
        }
        if (
            typeof rejected.response?.data?.error === 'string' &&
            rejected.response.data.error.trim().length > 0
        ) {
            return rejected.response.data.error.trim();
        }
        if (
            typeof rejected.response?.data?.message === 'string' &&
            rejected.response.data.message.trim().length > 0
        ) {
            return rejected.response.data.message.trim();
        }
        if (
            typeof rejected.message === 'string' &&
            rejected.message.trim().length > 0 &&
            rejected.message.trim() !== '[object Object]'
        ) {
            return rejected.message.trim();
        }
    }
    return fallback;
}

function formatDateToInputValue(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseValidMentorId(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

interface CourseFormState {
    courseId: string;
    name: string;
    startDate: string;
    endDate: string;
    numberOfStudents: number;
    limitStudent: number;
    status: boolean;
}

function normalizeFormState(data: Partial<CourseFormState>): CourseFormState {
    return {
        courseId: (data.courseId ?? '').trim(),
        name: (data.name ?? '').trim(),
        startDate: formatDateToInputValue(data.startDate ?? ''),
        endDate: formatDateToInputValue(data.endDate ?? ''),
        numberOfStudents: Number(data.numberOfStudents ?? 0),
        limitStudent: Number(data.limitStudent ?? 0),
        status: data.status ?? true,
    };
}

function hasFormChanges(current: CourseFormState, initial: CourseFormState | null): boolean {
    if (!initial) return true;
    const normalizedCurrent = normalizeFormState(current);
    const normalizedInitial = normalizeFormState(initial);
    return (
        normalizedCurrent.courseId !== normalizedInitial.courseId ||
        normalizedCurrent.name !== normalizedInitial.name ||
        normalizedCurrent.startDate !== normalizedInitial.startDate ||
        normalizedCurrent.endDate !== normalizedInitial.endDate ||
        normalizedCurrent.limitStudent !== normalizedInitial.limitStudent ||
        normalizedCurrent.status !== normalizedInitial.status
    );
}

function UpdateCourseForm() {
    const dispatch = useAppDispatch();
    const { courseId } = useParams();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);
    const [initialData, setInitialData] = useState<CourseFormState | null>(null);
    const [theoryTeacherId, setTheoryTeacherId] = useState<number | null>(null);
    const [theoryTeacherName, setTheoryTeacherName] = useState<string | null>(null);
    const [mentorModalMessage, setMentorModalMessage] = useState<string | null>(null);
    const [inputData, setInputData] = useState<CourseFormState>({
        courseId: '',
        name: '',
        startDate: '',
        endDate: '',
        numberOfStudents: 0,
        limitStudent: 0,
        status: true,
    });

    const navigate = useNavigate();

    const getCourseById = useCallback(async () => {
        if (!courseId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await dispatch(fetchCourseById(courseId)).unwrap();
            if (data) {
                const normalized = normalizeFormState({
                    courseId: data.courseId,
                    name: data.name,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    numberOfStudents: data.numberOfStudents ?? 0,
                    limitStudent: data.limitStudent,
                    status: data.status ?? true,
                });
                setInputData(normalized);
                setInitialData(normalized);
                setTheoryTeacherId(parseValidMentorId(data.theoryTeacherId));
                setTheoryTeacherName(
                    typeof data.theoryTeacher === 'string' && data.theoryTeacher.trim().length > 0
                        ? data.theoryTeacher.trim()
                        : null
                );
            }
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Không thể tải thông tin khoá học.');
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, [courseId, dispatch]);

    const updateCourse = async () => {
        if (isSubmittingRef.current) {
            return;
        }

        if (!hasFormChanges(inputData, initialData)) {
            setError(null);
            toast.info('Không có thay đổi để cập nhật.');
            return;
        }

        if (!/^(\d{4})B2$/.test(inputData.courseId.trim())) {
            const msg = 'Mã khoá học phải có định dạng XXXXB2 với X là số.';
            setError(msg);
            toast.error(msg);
            return;
        } else if (!/^(\d{3})B2$/.test(inputData.name.trim())) {
            const msg = 'Tên khoá học phải có định dạng XXXB2 với X là số.';
            setError(msg);
            toast.error(msg);
            return;
        } else if (
            formatDateToInputValue(inputData.endDate) &&
            formatDateToInputValue(inputData.startDate) &&
            formatDateToInputValue(inputData.endDate) <
                formatDateToInputValue(inputData.startDate)
        ) {
            const msg = 'Ngày bế giảng phải sau ngày khai giảng.';
            setError(msg);
            toast.error(msg);
            return;
        } else if (
            Number.isNaN(inputData.limitStudent) ||
            inputData.limitStudent <= 0
        ) {
            const msg = 'Số học viên tối đa phải lớn hơn 0.';
            setError(msg);
            toast.error(msg);
            return;
        }

        // Safety check: block PUT before reaching Backend when no valid Theory Mentor ID exists
        // to avoid partial database writes followed by Backend MentorID 400 validation failure.
        if (theoryTeacherId === null) {
            setError(null);
            setMentorModalMessage(
                theoryTeacherName ? MISSING_MENTOR_ID_MESSAGE : MISSING_MENTOR_MESSAGE
            );
            return;
        }

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setError(null);

        try {
            const normalized = normalizeFormState(inputData);
            const payload: UpdateCoursePayload = {
                ...normalized,
                theoryTeacherId,
            };
            await dispatch(updateCourseThunk(payload)).unwrap();
            toast.success('Cập nhật khoá học thành công');
            setError(null);
            navigate('/quan-ly-khoa-hoc');
            window.scroll({
                top: 0,
                behavior: 'instant',
            });
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Cập nhật khoá học thất bại.');
            setError(msg);
            toast.error(msg);
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void updateCourse();
    };

    useEffect(() => {
        void getCourseById();
    }, [getCourseById]);

    return (
        <div className='update-course-container'>
            <div className='admin-form-header'>
                <div className='admin-form-header__left'>
                    <span className='admin-form-header__eyebrow'>Quản lý đào tạo</span>
                    <div className='update-course-title'>
                        <h1>Cập nhật khoá học</h1>
                    </div>
                    <p className='admin-form-header__subtitle'>
                        Chỉnh sửa thông tin, thời gian đào tạo và chỉ tiêu học viên cho khoá học{' '}
                        <strong>{inputData.courseId || courseId}</strong>.
                    </p>
                </div>
                <div className='admin-form-header__actions'>
                    <Link to='/quan-ly-khoa-hoc' className='admin-form-back-btn'>
                        <BsArrowLeft aria-hidden='true' />
                        <span>Quay lại danh sách</span>
                    </Link>
                </div>
            </div>

            {inputData != null ? (
                <div className='update-course-form'>
                    {error && (
                        <div className='error-message admin-form-alert' role='alert'>
                            <BsExclamationCircle aria-hidden='true' />
                            <span>{error}</span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className='admin-form-loading' role='status'>
                            <p>Đang tải thông tin khoá học...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className='admin-form-grid'>
                                <div className='form-group'>
                                    <label htmlFor='courseId' className='col-form-label'>
                                        Mã khoá học
                                    </label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='courseId'
                                        placeholder='Ví dụ: 1024B2'
                                        name='courseId'
                                        value={inputData.courseId}
                                        onChange={(e) =>
                                            setInputData({
                                                ...inputData,
                                                courseId: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className='form-group'>
                                    <label htmlFor='name' className='col-form-label'>
                                        Tên khoá học
                                    </label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='name'
                                        placeholder='Ví dụ: 241B2'
                                        name='name'
                                        value={inputData.name}
                                        onChange={(e) =>
                                            setInputData({ ...inputData, name: e.target.value })
                                        }
                                    />
                                </div>

                                <div className='form-group'>
                                    <label htmlFor='startDate' className='col-form-label'>
                                        Ngày khai giảng
                                    </label>
                                    <input
                                        type='date'
                                        className='form-control'
                                        id='startDate'
                                        name='startDate'
                                        value={formatDateToInputValue(inputData.startDate)}
                                        onChange={(e) =>
                                            setInputData({
                                                ...inputData,
                                                startDate: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className='form-group'>
                                    <label htmlFor='endDate' className='col-form-label'>
                                        Ngày bế giảng
                                    </label>
                                    <input
                                        type='date'
                                        className='form-control'
                                        id='endDate'
                                        name='endDate'
                                        value={formatDateToInputValue(inputData.endDate)}
                                        onChange={(e) =>
                                            setInputData({
                                                ...inputData,
                                                endDate: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className='form-group form-group--full'>
                                    <label htmlFor='limitStudent' className='col-form-label'>
                                        Số học viên tối đa
                                    </label>
                                    <input
                                        type='number'
                                        className='form-control'
                                        id='limitStudent'
                                        placeholder='Số học viên tối đa'
                                        name='limitStudent'
                                        value={
                                            Number.isNaN(inputData.limitStudent)
                                                ? ''
                                                : inputData.limitStudent
                                        }
                                        onChange={(e) =>
                                            setInputData({
                                                ...inputData,
                                                limitStudent:
                                                    e.target.value === ''
                                                        ? 0
                                                        : parseInt(e.target.value, 10),
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className='admin-form-actions'>
                                <Link to='/quan-ly-khoa-hoc' className='btn admin-btn-cancel'>
                                    Huỷ bỏ
                                </Link>
                                <button
                                    className='btn btn-primary admin-btn-submit'
                                    type='submit'
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu cập nhật'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : (
                <div className='update-course-form'>
                    <p>Không tìm thấy thông tin khoá học.</p>
                </div>
            )}

            <Modal
                show={mentorModalMessage !== null}
                onHide={() => setMentorModalMessage(null)}
                centered
                aria-labelledby='mentor-missing-modal-title'
            >
                <Modal.Header closeButton>
                    <Modal.Title id='mentor-missing-modal-title'>
                        Không thể cập nhật khóa học
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ marginBottom: 0, lineHeight: 1.6 }}>
                        {mentorModalMessage}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='primary'
                        onClick={() => setMentorModalMessage(null)}
                    >
                        Đã hiểu
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default UpdateCourseForm;
