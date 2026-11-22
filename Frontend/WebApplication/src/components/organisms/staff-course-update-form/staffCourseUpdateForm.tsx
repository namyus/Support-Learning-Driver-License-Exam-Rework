import React, { useCallback, useState, useEffect } from 'react'
import './staff-course-update-form.scss'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../app/store';
import {
    fetchCourseById,
    updateCourse as updateCourseThunk,
} from '../../../features/courses/coursesSlice';

function UpdateCourseForm() {
    const dispatch = useAppDispatch();
    const { courseId } = useParams();
    const [error, setError] = useState(null);
    const [inputData, setInputData] = useState({
        courseId: '',
        name: '',
        startDate: '',
        endDate: '',
        numberOfStudents: 0,
        limitStudent: 0,
        status: true
    });

    const navigate = useNavigate();

    const getCourseById = useCallback(async () => {
        try {
            if (!courseId) return;
            const data = await dispatch(fetchCourseById(courseId)).unwrap();
            setInputData((prev) => ({ ...prev, ...data }));
        } catch (err) {
            const backendErr = err?.error || err?.response?.data?.error;
            if (backendErr) {
                setError(backendErr);
                return;
            }
        }
    }, [courseId, dispatch]);

    const updateCourse = async () => {
        try {
            if (!/^(\d{4})B2$/.test(inputData.courseId)) {
                setError('Mã khoá học phải có định dạng XXXXB2 với X là số.');
                return;
            } else if (!/^(\d{3})B2$/.test(inputData.name)) {
                setError('Tên khoá học phải có định dạng XXXB2 với X là số.');
                return;
            }

            await dispatch(updateCourseThunk(inputData)).unwrap();
            toast.success("Cập nhật khoá học thành công");
            setError(null);
            navigate('/quan-ly-khoa-hoc');

        } catch (err) {
            const backendErr = err?.error || err?.response?.data?.error;
            if (backendErr) {
                setError(backendErr);
                return;
            }
        }
        window.scroll( {
            top: 0,
            behavior: 'instant'
        });
    }

    const formatDateToInputValue = (dateString) => {
        const date = new Date(dateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return ''; // Handle invalid dates by returning an empty string
        }

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateCourse();
    }

    useEffect(() => {
        getCourseById();
    }, [getCourseById])

    return (
        <div className='update-course-container'>
            <div className='update-course-title'>
                <h1 className='text-center text-uppercase'>Cập nhật khoá học</h1>
            </div>
            {
                inputData != null ? (
                    <div className='update-course-form'>
                        {error && <h5 className="error-message mb-3 text-danger">{error}</h5>}
                        <form onSubmit={handleSubmit}>
                            <div className='form-group row'>
                                <label htmlFor="courseId" className="col-sm-3 col-form-label">Mã khoá học: </label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" id="courseId" placeholder="courseId"
                                        name='courseId'
                                        value={inputData.courseId}
                                        onChange={e => setInputData({ ...inputData, courseId: e.target.value })} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label htmlFor="name" className="col-sm-3 col-form-label">Tên khoá học: </label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" id="name" placeholder="name"
                                        name='name'
                                        value={inputData.name}
                                        onChange={e => setInputData({ ...inputData, name: e.target.value })} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label htmlFor="startDate" className="col-sm-3 col-form-label">Ngày khai giảng: </label>
                                <div className="col-sm-9">
                                    <input type="date" className="form-control" id="startDate" placeholder="start date"
                                        name='startDate'
                                        value={formatDateToInputValue(inputData.startDate)}
                                        onChange={e => setInputData({ ...inputData, startDate: e.target.value })} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label htmlFor="endDate" className="col-sm-3 col-form-label">Ngày bế giảng: </label>
                                <div className="col-sm-9">
                                    <input type="date" className="form-control" id="endDate" placeholder="end date"
                                        name='endDate'
                                        value={formatDateToInputValue(inputData.endDate)}
                                        onChange={e => setInputData({ ...inputData, endDate: e.target.value })} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label htmlFor="limitStudent" className="col-sm-3 col-form-label">Số học viên tối đa: </label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control" id="limitStudent" placeholder="limit student"
                                        name='limitStudent'
                                        value={inputData.limitStudent}
                                        onChange={e => setInputData({ ...inputData, limitStudent: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <button className='btn btn-primary w-25 justify-self-center' type='submit'>Tạo</button>
                        </form>
                    </div>
                ) : (
                    <h1>no</h1>
                )
            }
        </div>
    )
}

export default UpdateCourseForm