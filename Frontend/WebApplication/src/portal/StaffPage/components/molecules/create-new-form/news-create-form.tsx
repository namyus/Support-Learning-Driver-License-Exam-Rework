import { useEffect, useState } from 'react';
import './news-create-form.scss';
import api from '../../../../../config/axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function CreateNewsForm() {
    const user = sessionStorage.getItem('loginedUser') ? JSON.parse(sessionStorage.getItem('loginedUser')) : null;
    const userID = Number(user.userID);

    const [error, setError] = useState(null);
    const [staff, setStaff] = useState(null);
    const [numberOfNews, setNumberOfNews] = useState([]);
    const [inputData, setInputData] = useState({
        title: '',
        description: '',
        content: '',
        staffId: 0,
        status: true,
    });

    useEffect(() => {
        getAllNews()
    }, [])

    useEffect(() => {
        getStaffByUserID();
    }, [numberOfNews]);

    useEffect(() => {
        if (staff) {
            setInputData((prevInputData) => ({
                ...prevInputData,
                staffId: staff.staffId, // Set the staffId from the staff state
            }));
        }
    }, [staff]);

    const getStaffByUserID = async () => {
        try {
            const response = await api.get('Staff/user/' + userID);
            setStaff(response.data);
        } catch (err) {
            console.log(err);
        }
    }


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

    const getAllNews = async () => {
        try {
            const response = await api.get('News/list');
            const res = response.data;
            setNumberOfNews(res);

            setInputData((prevInputData) => ({
                ...prevInputData,
                newsId: Number(res.length + 1),
            }));

        } catch (err) {
            console.log(err);
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
                <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                <span>Quay lại danh sách tin tức</span>
            </Link>
            <header className='create-news-title'>
                <h1>Tạo tin tức mới</h1>
                <p>Soạn thảo và đăng tải thông tin mới của trung tâm.</p>
            </header>
            <div className='create-news-form'>
                <section className="news-form-card" aria-labelledby="create-news-heading">
                    <div className="news-form-card-heading">
                        <h2 id="create-news-heading">Thông tin tin tức</h2>
                        <p>Các trường có dấu * là bắt buộc.</p>
                    </div>
                    {error && <p className="error-message" role="alert">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className='news-form-field'>
                            <label htmlFor="title" className="news-form-label">Tiêu đề <span aria-hidden="true">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="title"
                                placeholder="tiêu đề"
                                name='title'
                                value={inputData.title}
                                onChange={e => setInputData({ ...inputData, title: e.target.value })}
                            />
                        </div>
                        <div className='news-form-field'>
                            <label htmlFor="description" className="news-form-label">Mô tả</label>
                            <input
                                type="text"
                                className="form-control"
                                id="description"
                                placeholder="mô tả"
                                name='description'
                                value={inputData.description}
                                onChange={e => setInputData({ ...inputData, description: e.target.value })}
                            />
                        </div>
                        <div className='news-form-field news-form-field--content'>
                            <label htmlFor="content" className="news-form-label">Nội dung <span aria-hidden="true">*</span></label>
                            <textarea
                                className="form-control news-form-textarea"
                                id="content"
                                placeholder="nội dung"
                                name='content'
                                value={inputData.content}
                                onChange={e => setInputData({ ...inputData, content: e.target.value })}
                            />
                        </div>
                        <div className="news-form-actions">
                            <button className="news-cancel-button" type="button" onClick={() => navigate('/quan-ly-tin-tuc')}>Hủy</button>
                            <button className="news-submit-button" type="submit">Tạo tin tức</button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}


export default CreateNewsForm;
