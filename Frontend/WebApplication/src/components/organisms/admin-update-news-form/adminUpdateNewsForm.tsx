import { useCallback, useEffect, useState } from 'react';
import './admin-update-news-form.scss';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../app/store';
import { fetchNewsById, updateNews } from '../../../features/news/newsSlice';
import type { ApiRejectedPayload } from '../../../features/shared/apiError';

function UpdateNewsForm() {
    const dispatch = useAppDispatch();
    const { newsId } = useParams();
    const [error, setError] = useState(null);
    const [inputData, setInputData] = useState({
        title: '',
        description: '',
        content: '',
        status: true,
    });
    const navigate = useNavigate();

    const createNewCourse = async () => {
        try {
            if (inputData.title === ''
                || inputData.content === '') {
                setError("Vui lòng nhập đủ thông tin");
                return;
            } else if (inputData.description.length > 50) {
                setError('Mô tả không được dài quá 50 ký tự.');
                return;
            }

            await dispatch(updateNews(inputData)).unwrap();
            toast.success('Cập nhật tin tức thành công');
            setError(null);
            navigate('/quan-ly-tin-tuc');
        } catch (err) {
            const apiErr = (err as ApiRejectedPayload | null)?.error;
            if (apiErr) {
                setError(apiErr);
            }
        }
    }

    const getNewsById = useCallback(async () => {
        if (!newsId) return;
        try {
            const res = await dispatch(fetchNewsById(newsId)).unwrap();
            setInputData({
                ...res,
                title: res.title ?? '',
                description: res.description ?? '',
                content: res.content ?? '',
            });
        } catch (err) {
            console.log(err);
        }
    }, [dispatch, newsId]);

    const handleSubmit = (event) => {
        event.preventDefault();
        createNewCourse();
    }

    useEffect(() => {
        getNewsById();
    }, [getNewsById])

    return (
        <div className='update-news-container'>
            <Link className="update-news-back-link" to="/quan-ly-tin-tuc">
                <span aria-hidden="true">←</span> Quay lại danh sách tin tức
            </Link>
            <header className='update-news-title'>
                <h1>Cập nhật tin tức</h1>
                <p>Chỉnh sửa thông tin và nội dung bài viết.</p>
            </header>
            <div className='update-news-form'>
                <section className="news-form-card" aria-labelledby="update-news-heading">
                    <div className="news-form-card-heading">
                        <h2 id="update-news-heading">Thông tin tin tức</h2>
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
                            <div className="news-content-field">
                            <textarea
                                className="form-control news-form-textarea"
                                id="content"
                                placeholder="nội dung"
                                name='content'
                                value={inputData.content}
                                onChange={e => setInputData({ ...inputData, content: e.target.value })}
                            />
                            <button className='btn btn-warning clear-text-btn' type='button' onClick={() => setInputData({ ...inputData, content: '' })}>
                                Xóa nội dung
                            </button>
                            </div>
                        </div>
                        <div className="news-form-actions">
                            <button className="news-cancel-button" type="button" onClick={() => navigate('/quan-ly-tin-tuc')}>Hủy</button>
                            <button className="news-submit-button" type="submit">Cập nhật</button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}


export default UpdateNewsForm;
