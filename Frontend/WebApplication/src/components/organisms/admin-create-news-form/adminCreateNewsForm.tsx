import { useCallback, useEffect, useState } from 'react';
import './admin-create-news-form.scss';
import api from '../../../config/axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function CreateNewsForm() {
    const user = sessionStorage.getItem('loginedUser') ? JSON.parse(sessionStorage.getItem('loginedUser')) : null;
    const userID = Number(user.userID);

    const [error, setError] = useState(null);
    const [staff, setStaff] = useState(null);
    const [inputData, setInputData] = useState({
        title: '',
        description: '',
        content: '',
        staffId: 0,
        status: true,
    });

    const getStaffByUserID = useCallback(async () => {
        try {
            const response = await api.get('Staff/user/' + userID);
            setStaff(response.data);
        } catch (err) {
            console.log(err);
        }
    }, [userID]);

    const getAllNews = useCallback(async () => {
        try {
            const response = await api.get('News/list');
            const res = response.data;

            setInputData((prevInputData) => ({
                ...prevInputData,
                newsId: Number(res.length + 1),
            }));

        } catch (err) {
            console.log(err);
        }
    }, []);

    useEffect(() => {
        getAllNews();
    }, [getAllNews]);

    useEffect(() => {
        getStaffByUserID();
    }, [getStaffByUserID]);

    useEffect(() => {
        if (staff) {
            setInputData((prevInputData) => ({
                ...prevInputData,
                staffId: staff.staffId, // Set the staffId from the staff state
            }));
        }
    }, [staff]);

    const navigate = useNavigate();

    const createNewCourse = async () => {
        try {
            if (inputData.description.length > 50) {
                setError('Mô tả không được dài quá 50 ký tự.');
                return;
            }

            await api.post('News/add', inputData);
            console.log(inputData);
            toast.success('Tạo tin tức thành công');
            setError(null);
            navigate('/quan-ly-tin-tuc');
        } catch (err) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            }
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (validateForm()) {
            createNewCourse();
        }
    }

    const validateForm = () => {
        if (
            inputData.title === '' ||
            inputData.content === ''
        ) {
            setError('Vui lòng nhập đủ thông tin.');
            return false;
        }
        return true;
    }

    return (
        <div className='create-news-container'>
            <Link className="create-news-back-link" to="/quan-ly-tin-tuc">
                <span aria-hidden="true">←</span> Quay lại danh sách tin tức
            </Link>
            <header className='create-news-title'>
                <h1>Tạo tin tức mới</h1>
                <p>Soạn thảo và đăng tải thông tin mới của trung tâm.</p>
            </header>
            <section className="create-news-card" aria-labelledby="create-news-heading">
                <div className="create-news-card-heading">
                    <h2 id="create-news-heading">Thông tin tin tức</h2>
                    <p>Các trường có dấu * là bắt buộc.</p>
                </div>
                {error && <p className="create-news-error" role="alert">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="create-news-field">
                        <label htmlFor="title">Tiêu đề <span aria-hidden="true">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            id="title"
                            placeholder="Tiêu đề"
                            name='title'
                            value={inputData.title}
                            onChange={e => setInputData({ ...inputData, title: e.target.value })}
                        />
                    </div>
                    <div className="create-news-field">
                        <label htmlFor="description">Mô tả</label>
                        <input
                            type="text"
                            className="form-control"
                            id="description"
                            placeholder="Mô tả"
                            name='description'
                            value={inputData.description}
                            onChange={e => setInputData({ ...inputData, description: e.target.value })}
                        />
                    </div>
                    <div className="create-news-field create-news-field--content">
                        <label htmlFor="content">Nội dung <span aria-hidden="true">*</span></label>
                        <textarea
                            className="form-control create-news-textarea"
                            id="content"
                            placeholder="Nội dung"
                            name='content'
                            value={inputData.content}
                            onChange={e => setInputData({ ...inputData, content: e.target.value })}
                        />
                    </div>
                    <div className="create-news-actions">
                        <Link className="create-news-cancel-button" to="/quan-ly-tin-tuc">Hủy</Link>
                        <button className="create-news-submit-button" type='submit'>Tạo tin tức</button>
                    </div>
                </form>
            </section>
        </div>
    );
}


export default CreateNewsForm;
