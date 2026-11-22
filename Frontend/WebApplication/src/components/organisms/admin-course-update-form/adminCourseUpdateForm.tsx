import React, { useState, useEffect, useCallback } from 'react';
import './admin-course-update-form.scss';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BsArrowLeft, BsExclamationCircle } from 'react-icons/bs';
import { useAppDispatch } from '../../../app/store';
import { fetchCourseById, updateCourse as updateCourseThunk } from '../../../features/courses/coursesSlice';
import type { ApiRejectedPayload, UpdateCoursePayload } from '../../../features/courses/coursesTypes';

function getApiErrorMessage(err: unknown, fallback: string): string {
    if (typeof err === 'object' && err !== null) {
        if ('error' in err && typeof (err as ApiRejectedPayload).error === 'string') {
            return (err as ApiRejectedPayload).error!;
        }
        if ('message' in err && typeof (err as ApiRejectedPayload).message === 'string' && (err as ApiRejectedPayload).message) {
            return (err as ApiRejectedPayload).message;
        }
        if (
            'response' in err &&
            typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error ===
                'string'
        ) {
            return (err as { response: { data: { error: string } } }).response.data.error;
        }
    }
    return fallback;
}

function UpdateCourseForm() {
    const dispatch = useAppDispatch();
    const { courseId } = useParams();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [inputData, setInputData] = useState<UpdateCoursePayload>({
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
        try {
            const data = await dispatch(fetchCourseById(courseId)).unwrap();
            if (data) {
                setInputData(data as UpdateCoursePayload);
            }
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Không thể tải thông tin khoá học.');
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [courseId, dispatch]);

    const formatDateToInputValue = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const updateCourse = async () => {
        try {
            if (!/^(\d{4})B2$/.test(inputData.courseId)) {
                setError('Mã khoá học phải có định dạng XXXXB2 với X là số.');
                return;
            } else if (!/^(\d{3})B2$/.test(inputData.name)) {
                setError('Tên khoá học phải có định dạng XXXB2 với X là số.');
                return;
            } else if (
                formatDateToInputValue(inputData.endDate) &&
                formatDateToInputValue(inputData.startDate) &&
                formatDateToInputValue(inputData.endDate) <
                    formatDateToInputValue(inputData.startDate)
            ) {
                setError('Ngày bế giảng phải sau ngày khai giảng.');
                return;
            } else if (
                Number.isNaN(inputData.limitStudent) ||
                inputData.limitStudent <= 0
            ) {
                setError('Số học viên tối đa phải lớn hơn 0.');
                return;
            }

            await dispatch(updateCourseThunk(inputData)).unwrap();
            toast.success('Cập nhật khoá học thành công');
            setError(null);
            navigate('/quan-ly-khoa-hoc');
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Cập nhật khoá học thất bại.');
            setError(msg);
            return;
        }
        window.scroll({
            top: 0,
            behavior: 'instant',
        });
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
                                >
                                    Lưu cập nhật
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
        </div>
    );
}

export default UpdateCourseForm;
