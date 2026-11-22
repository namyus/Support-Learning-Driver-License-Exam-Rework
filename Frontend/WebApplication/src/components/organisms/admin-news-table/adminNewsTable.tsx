import { useEffect, useMemo, useState } from 'react';
import api from '../../../config/axios';
import './admin-news-table.scss';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface NewsRecord {
    newsId: number;
    title: string;
    description: string;
    content: string;
    status: boolean;
    createdTime?: string;
}

const isExpectedEmptyNewsResponse = (error: unknown) => {
    const response = (error as { response?: { status?: number; data?: { error?: string } } } | null)?.response;
    return response?.status === 404 && response.data?.error === 'Không tìm thấy tin tức!';
};

function NewsTable() {
    const [data, setData] = useState<NewsRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoadError, setHasLoadError] = useState(false);

    const getAllNews = async () => {
        setIsLoading(true);
        try {
            const [activeResult, inactiveResult] = await Promise.allSettled([
                api.get('News/list'),
                api.get('News/inactive-news')
            ]);
            const getRecords = (result: PromiseSettledResult<{ data: NewsRecord[] }>) => {
                if (result.status === 'fulfilled') return result.value.data as NewsRecord[];
                if (isExpectedEmptyNewsResponse(result.reason)) return [];
                throw result.reason;
            };
            const allNews = [...getRecords(activeResult), ...getRecords(inactiveResult)];
            allNews.sort((left, right) => new Date(left.createdTime ?? 0).getTime() - new Date(right.createdTime ?? 0).getTime());
            setData(allNews);
            setHasLoadError(false);
        } catch (err) {
            setHasLoadError(true);
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const navigate = useNavigate();

    // Pagination part
    const [currentPage, setCurrentPage] = useState(1);
    const recordPage = 10;
    const filteredData = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLocaleLowerCase('vi');

        return data.filter((news) => {
            const matchesSearch = !normalizedSearch || [news.newsId, news.title, news.description, news.content, news.status, news.createdTime]
                .some((value) => String(value ?? '').toLocaleLowerCase('vi').includes(normalizedSearch));
            return matchesSearch && (statusFilter === 'all' || String(news.status) === statusFilter);
        });
    }, [data, searchTerm, statusFilter]);
    const lastIndex = currentPage * recordPage;
    const firsIndex = lastIndex - recordPage;
    const records = filteredData.slice(firsIndex, lastIndex);
    const npage = Math.ceil(filteredData.length / recordPage);
    const numbers = Array.from({ length: npage }, (_, index) => index + 1);
    const overallIndex = (currentPage - 1) * recordPage;
    const firstRecord = records.length > 0 ? overallIndex + 1 : 0;
    const lastRecord = Math.min(overallIndex + recordPage, filteredData.length);

    useEffect(() => {
        getAllNews();
    }, []);

    useEffect(() => {
        if (npage === 0 && currentPage !== 1) {
            setCurrentPage(1);
        } else if (npage > 0 && currentPage > npage) {
            setCurrentPage(npage);
        }
    }, [currentPage, npage]);

    const prePage = () => {
        if (currentPage !== 1) {
            setCurrentPage(currentPage - 1);
        }
    }

    const changeCPage = (id: number) => {
        setCurrentPage(id);
    }

    const nextPage = () => {
        if (currentPage < npage) {
            setCurrentPage(currentPage + 1);
        }
    }

    const handleDelete = async (newsId: number) => {
        try {
            // Perform the deletion
            await api.delete('News/deactivate/' + newsId);
            toast.success("Xóa thành công!")

            await getAllNews();

        } catch (err) {
            console.log(err);
        }
    }

    const updateBtn = (newsId) => {
        navigate(`cap-nhat-tin-tuc/${newsId}`);
        window.scroll( {
            top: 0,
            behavior: 'instant'
        });
    }

    return (
        <div className='news-table-container'>
            <header className="news-table-heading">
                <div>
                    <h1>Danh sách tin tức</h1>
                    <p>Quản lý và cập nhật các tin tức của trung tâm.</p>
                </div>
                <Link to='tao-tin-tuc' className='news-add-button'>
                    <span aria-hidden="true">+</span> Thêm tin tức
                </Link>
            </header>
            <section className="news-summary-grid" aria-label="Tổng quan tin tức">
                <article className="news-summary-card"><p>Tổng tin tức đã tải</p><strong>{isLoading || hasLoadError ? '—' : data.length}</strong></article>
                <article className="news-summary-card"><p>Đang hoạt động</p><strong className="is-active">{isLoading || hasLoadError ? '—' : data.filter((news) => news.status).length}</strong></article>
                <article className="news-summary-card"><p>Ngừng hoạt động</p><strong className="is-inactive">{isLoading || hasLoadError ? '—' : data.filter((news) => !news.status).length}</strong></article>
                <p className="news-summary-note">Số liệu trên toàn bộ tin tức tải được, không phụ thuộc tìm kiếm, bộ lọc hay trang hiện tại.</p>
            </section>

            <section className='news-table-card' aria-labelledby="news-table-title">
                <div className="news-table-toolbar">
                    <div>
                        <h2 id="news-table-title">Nội dung tin tức</h2>
                        <p>{filteredData.length} / {data.length} tin tức phù hợp</p>
                    </div>
                    <div className="news-table-controls">
                    <label className="news-search-field" htmlFor="news-search">
                        <span className="sr-only">Tìm tin tức</span>
                        <input
                            id="news-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Tìm theo mã hoặc từ khóa"
                        />
                    </label>
                    <label className="news-filter-field" htmlFor="news-status-filter">Trạng thái
                        <select id="news-status-filter" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }}>
                            <option value="all">Tất cả</option>
                            <option value="true">Đang hoạt động</option>
                            <option value="false">Ngừng hoạt động</option>
                        </select>
                    </label>
                    </div>
                </div>
                <div className='news-table-scroll'>
                    <table className='news-table'>
                        <thead>
                            <tr>
                                <th scope='col'>#</th>
                                <th scope='col'>Mã tin tức</th>
                                <th scope='col'>Tiêu đề</th>
                                <th scope='col'>Mô tả</th>
                                <th scope='col'>Nội dung</th>
                                <th scope='col' className='text-center'>Trạng thái</th>
                                <th scope='col' className='text-center'>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={7}><p className="news-table-empty">Đang tải danh sách tin tức…</p></td></tr>
                            ) : hasLoadError ? (
                                <tr><td colSpan={7}><p className="news-table-empty" role="alert">Không thể tải danh sách tin tức lúc này.</p></td></tr>
                            ) : records.length > 0 ? (
                                records.map((news, i) => (
                                    <tr key={i}>
                                        <td>{overallIndex + i + 1}</td>
                                        <td>{news.newsId}</td>
                                        <td className="news-title-cell"><span title={news.title}>{news.title}</span></td>
                                        <td><div className="news-cell-clamp" title={news.description}>{news.description}</div></td>
                                        <td><div className="news-cell-clamp" title={news.content}>{news.content}</div></td>
                                        <td className='text-center'>
                                            <span className={`news-status-badge ${news.status ? 'is-active' : 'is-inactive'}`}>
                                                {news.status ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                            </span>
                                        </td>
                                        <td className='news-row-actions text-center'>
                                            <button className="news-action-button news-action-button--edit" type="button" onClick={() => updateBtn(news.newsId)}>Cập nhật</button>
                                            <button className="news-action-button news-action-button--delete" type="button" onClick={() => handleDelete(news.newsId)}>Xoá</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7}>
                                        <p className='news-table-empty'>
                                            {searchTerm.trim() || statusFilter !== 'all' ? 'Không tìm thấy tin tức phù hợp.' : 'Không tìm thấy thông tin. Vui lòng kiểm tra lại!'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <nav className="news-pagination" aria-label="Phân trang tin tức">
                    <p className="news-pagination-count">
                        Hiển thị {firstRecord}–{lastRecord} trong {filteredData.length} tin tức
                    </p>
                    <ul className='pagination'>
                        <li className='page-item'>
                            <button type='button' className='page-link' onClick={prePage} disabled={currentPage <= 1}>Trước</button>
                        </li>
                        {
                            numbers.map((n, i) => (
                                <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={i}>
                                    <button type='button' className='page-link' onClick={() => changeCPage(n)} aria-current={currentPage === n ? 'page' : undefined}>{n}</button>
                                </li>
                            ))
                        }

                        <li className='page-item'>
                            <button type='button' className='page-link' onClick={nextPage} disabled={npage === 0 || currentPage >= npage}>Sau</button>
                        </li>
                    </ul>
                </nav>
            </section>
        </div>
    );
}

export default NewsTable;
