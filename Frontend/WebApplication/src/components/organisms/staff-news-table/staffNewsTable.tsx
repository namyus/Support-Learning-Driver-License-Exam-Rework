import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../app/store';
import {
  deactivateNews,
  fetchInactiveNews,
  fetchNewsList,
} from '../../../features/news/newsSlice';
import type { NewsRecord } from '../../../features/news/newsTypes';
import {
  getApiErrorStatus,
  type ApiRejectedPayload,
} from '../../../features/shared/apiError';
import './staff-news-table.scss';

const isExpectedEmptyNewsResponse = (error: unknown): boolean => {
  return (
    getApiErrorStatus(error) === 404 &&
    (error as ApiRejectedPayload | null)?.error === 'Không tìm thấy tin tức!'
  );
};

function NewsTable() {
  const dispatch = useAppDispatch();
  function truncateText(text: string | null | undefined, maxLength: number) {
    const safeText = String(text ?? '');
    if (safeText.length <= maxLength) {
      return safeText;
    }
    return safeText.slice(0, maxLength) + '...';
  }

  const [data, setData] = useState<NewsRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const getAllNews = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const responseData = await dispatch(fetchNewsList()).unwrap();
      const res: NewsRecord[] = Array.isArray(responseData)
        ? [...responseData]
        : [];
      setData(res.reverse());
    } catch (err) {
      console.log(err);
      if (isExpectedEmptyNewsResponse(err)) {
        setData([]);
        setLoadError(false);
      } else {
        setData([]);
        setLoadError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const recordPage = 10;

  const activeCount = data.filter((news) => news.status === true).length;
  const inactiveCount = data.filter((news) => news.status === false).length;

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi');
    if (!query) return data;
    return data.filter((news) =>
      [news.newsId, news.title, news.description, news.content].some((value) =>
        String(value ?? '').toLocaleLowerCase('vi').includes(query)
      )
    );
  }, [data, searchTerm]);

  const npage = Math.ceil(filteredData.length / recordPage);
  const safePage = npage > 0 ? Math.min(currentPage, npage) : 1;
  const lastIndex = safePage * recordPage;
  const firsIndex = lastIndex - recordPage;
  const records = filteredData.slice(firsIndex, lastIndex);
  const numbers = npage > 0 ? [...Array(npage + 1).keys()].slice(1) : [];

  useEffect(() => {
    void getAllNews();
  }, [getAllNews]);

  const prePage = () => {
    if (safePage > 1) {
      setCurrentPage(safePage - 1);
    }
  };

  const changeCPage = (id: number) => {
    setCurrentPage(id);
  };

  const nextPage = () => {
    if (npage > 0 && safePage < npage) {
      setCurrentPage(safePage + 1);
    }
  };

  const handleDelete = async (newsId: number) => {
    try {
      await dispatch(deactivateNews(newsId)).unwrap();
      toast.success('Xóa thành công!');
      await getAllNews();
    } catch (err) {
      console.log(err);
    }
  };

  const updateBtn = (newsId: number) => {
    navigate(`cap-nhat-tin-tuc/${newsId}`);
    window.scroll({
      top: 0,
      behavior: 'instant',
    });
  };

  return (
    <div className="news-table-container staff-list-page">
      <header className="news-table-title staff-list-header">
        <div>
          <h1>Danh sách tin tức</h1>
          <p>Quản lý và cập nhật các bài viết tin tức đang hoạt động của trung tâm.</p>
        </div>
        <div className="staff-header-actions">
          <Link to="/quan-ly-tin-tuc/chua-kich-hoat" className="staff-secondary-btn">
            Tin tức chưa kích hoạt
          </Link>
          <Link to="/quan-ly-tin-tuc/tao-tin-tuc" className="staff-primary-btn">
            <span aria-hidden="true">+</span>
            <span>Thêm tin tức</span>
          </Link>
        </div>
      </header>

      <section className="staff-summary-strip" aria-label="Tổng quan tin tức đang hoạt động">
        <div className="staff-summary-pill">
          <span className="staff-summary-pill__label">Tổng tin đang hoạt động đã tải</span>
          <strong className="staff-summary-pill__value">
            {isLoading || loadError ? '—' : data.length}
          </strong>
        </div>
        <div className="staff-summary-pill staff-summary-pill--success">
          <span className="staff-summary-pill__label">Đang hoạt động</span>
          <strong className="staff-summary-pill__value">
            {isLoading || loadError ? '—' : activeCount}
          </strong>
        </div>
        <div className="staff-summary-pill staff-summary-pill--muted">
          <span className="staff-summary-pill__label">Chưa kích hoạt trong danh sách này</span>
          <strong className="staff-summary-pill__value">
            {isLoading || loadError ? '—' : inactiveCount}
          </strong>
        </div>
      </section>
      <p className="staff-metrics-note">
        Số liệu tính trên các bản ghi trả về từ API News/list.
      </p>

      <div className="news-table-content">
        <form onSubmit={(event) => event.preventDefault()}>
          <section className="staff-table-card" aria-label="Bảng tin tức">
            <div className="staff-table-toolbar">
              <div className="staff-table-toolbar__search">
                <label className="staff-sr-only" htmlFor="staff-active-news-search">
                  Tìm kiếm tin tức
                </label>
                <input
                  id="staff-active-news-search"
                  className="staff-search-input"
                  type="search"
                  placeholder="Tìm theo mã, tiêu đề, mô tả hoặc nội dung..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  autoComplete="off"
                />
              </div>
              <div className="staff-table-toolbar__meta">
                <span>
                  Phù hợp: <strong>{isLoading || loadError ? '—' : filteredData.length}</strong> tin tức
                </span>
              </div>
            </div>

            <div className="news-table-scroll staff-table-scroll" role="region" aria-label="Bảng tin tức" tabIndex={0}>
              <table className="table staff-data-table">
                <thead>
                  <tr>
                    <th scope="col">Mã tin tức</th>
                    <th scope="col">Tiêu đề</th>
                    <th scope="col">Mô tả</th>
                    <th scope="col">Nội dung</th>
                    <th scope="col" className="col-center">Trạng thái</th>
                    <th scope="col" className="col-actions">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6}>
                        <p className="news-table-state staff-table-state" role="status">
                          Đang tải danh sách tin tức…
                        </p>
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="news-table-state news-table-state--error" role="alert">
                          <span>Không thể tải danh sách tin tức. Vui lòng thử lại.</span>
                          <button
                            className="staff-retry-btn"
                            type="button"
                            onClick={() => void getAllNews()}
                          >
                            Thử lại
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : records.length > 0 ? (
                    records.map((news, i) => (
                      <tr key={news.newsId ?? i}>
                        <td>
                          <span className="staff-id-badge">#{news.newsId}</span>
                        </td>
                        <td className="cell-strong" title={news.title ?? ''}>
                          {truncateText(news.title, 28)}
                        </td>
                        <td className="cell-muted" title={news.description ?? ''}>
                          {truncateText(news.description, 36)}
                        </td>
                        <td className="cell-muted" title={news.content ?? ''}>
                          {truncateText(news.content, 52)}
                        </td>
                        <td className="col-center">
                          <span
                            className={`status-badge ${
                              news.status === true
                                ? 'status-badge--active'
                                : 'status-badge--inactive'
                            }`}
                          >
                            {news.status === true ? 'Kích hoạt' : 'Chưa kích hoạt'}
                          </span>
                        </td>
                        <td className="button col-actions">
                          <div className="row-actions">
                            <button
                              className="action-btn action-btn--edit"
                              type="button"
                              onClick={() => updateBtn(news.newsId)}
                            >
                              Cập nhật
                            </button>
                            <button
                              className="action-btn action-btn--delete"
                              type="button"
                              onClick={() => void handleDelete(news.newsId)}
                            >
                              Xoá
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <div className="news-table-state staff-table-state" role="status">
                          {data.length > 0
                            ? 'Không tìm thấy tin tức phù hợp với từ khóa tìm kiếm.'
                            : 'Hiện chưa có tin tức đang hoạt động.'}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="staff-table-footer">
              <span className="staff-table-footer__info">
                Hiển thị {records.length > 0 ? firsIndex + 1 : 0}–
                {Math.min(lastIndex, filteredData.length)} trong {filteredData.length} tin tức
              </span>
              <nav aria-label="Phân trang danh sách tin tức">
                <ul className="pagination">
                  <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}>
                    <button
                      type="button"
                      className="page-link"
                      onClick={prePage}
                      disabled={safePage === 1}
                    >
                      Trước
                    </button>
                  </li>
                  {numbers.map((n) => (
                    <li
                      className={`page-item ${safePage === n ? 'active' : ''}`}
                      key={n}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => changeCPage(n)}
                      >
                        {n}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      npage === 0 || safePage === npage ? 'disabled' : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={nextPage}
                      disabled={npage === 0 || safePage === npage}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </footer>
          </section>
        </form>
      </div>
    </div>
  );
}

export default NewsTable;

export function InactiveNewsTable() {
  const dispatch = useAppDispatch();
  function truncateText(text: string | null | undefined, maxLength: number) {
    const safeText = String(text ?? '');
    if (safeText.length <= maxLength) {
      return safeText;
    }
    return safeText.slice(0, maxLength) + '...';
  }

  const [data, setData] = useState<NewsRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const getAllNews = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const responseData = await dispatch(fetchInactiveNews()).unwrap();
      const res: NewsRecord[] = Array.isArray(responseData)
        ? [...responseData]
        : [];
      setData(res.reverse());
    } catch (err) {
      console.log(err);
      if (isExpectedEmptyNewsResponse(err)) {
        setData([]);
        setLoadError(false);
      } else {
        setData([]);
        setLoadError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const recordPage = 10;

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi');
    if (!query) return data;
    return data.filter((news) =>
      [news.newsId, news.title, news.description, news.content].some((value) =>
        String(value ?? '').toLocaleLowerCase('vi').includes(query)
      )
    );
  }, [data, searchTerm]);

  const npage = Math.ceil(filteredData.length / recordPage);
  const safePage = npage > 0 ? Math.min(currentPage, npage) : 1;
  const lastIndex = safePage * recordPage;
  const firsIndex = lastIndex - recordPage;
  const records = filteredData.slice(firsIndex, lastIndex);
  const numbers = npage > 0 ? [...Array(npage + 1).keys()].slice(1) : [];

  useEffect(() => {
    void getAllNews();
  }, [getAllNews]);

  const prePage = () => {
    if (safePage > 1) {
      setCurrentPage(safePage - 1);
    }
  };

  const changeCPage = (id: number) => {
    setCurrentPage(id);
  };

  const nextPage = () => {
    if (npage > 0 && safePage < npage) {
      setCurrentPage(safePage + 1);
    }
  };

  const handleDelete = async (newsId: number) => {
    try {
      await dispatch(deactivateNews(newsId)).unwrap();
      toast.success('Xóa thành công!');
      await getAllNews();
    } catch (err) {
      console.log(err);
    }
  };

  const updateBtn = (newsId: number) => {
    navigate(`/quan-ly-tin-tuc/cap-nhat-tin-tuc/${newsId}`);
    window.scroll({
      top: 0,
      behavior: 'instant',
    });
  };

  return (
    <div className="template-container">
      <div className="news-table-container staff-list-page">
        <header className="news-table-title staff-list-header">
          <div>
            <h1>Danh sách tin tức chưa kích hoạt</h1>
            <p>Tra cứu và xử lý các bài viết tin tức đang ở trạng thái ngừng kích hoạt.</p>
          </div>
          <div className="staff-header-actions">
            <Link to="/quan-ly-tin-tuc" className="staff-secondary-btn">
              Tin đang hoạt động
            </Link>
            <Link to="/quan-ly-tin-tuc/tao-tin-tuc" className="staff-primary-btn">
              <span aria-hidden="true">+</span>
              <span>Thêm tin tức</span>
            </Link>
          </div>
        </header>

        <section className="staff-summary-strip" aria-label="Tổng quan tin tức chưa kích hoạt">
          <div className="staff-summary-pill">
            <span className="staff-summary-pill__label">Tổng tin chưa kích hoạt đã tải</span>
            <strong className="staff-summary-pill__value">
              {isLoading || loadError ? '—' : data.length}
            </strong>
          </div>
          <div className="staff-summary-pill staff-summary-pill--muted">
            <span className="staff-summary-pill__label">Chưa kích hoạt</span>
            <strong className="staff-summary-pill__value">
              {isLoading || loadError ? '—' : data.filter((item) => !item.status).length}
            </strong>
          </div>
          <div className="staff-summary-pill staff-summary-pill--info">
            <span className="staff-summary-pill__label">Kết quả theo bộ lọc</span>
            <strong className="staff-summary-pill__value">
              {isLoading || loadError ? '—' : filteredData.length}
            </strong>
          </div>
        </section>
        <p className="staff-metrics-note">
          Số liệu tính trên các bản ghi trả về từ API News/inactive-news.
        </p>

        <div className="news-table-content">
          <form onSubmit={(event) => event.preventDefault()}>
            <section className="staff-table-card" aria-label="Bảng tin chưa kích hoạt">
              <div className="staff-table-toolbar">
                <div className="staff-table-toolbar__search">
                  <label className="staff-sr-only" htmlFor="staff-inactive-news-search">
                    Tìm kiếm tin chưa kích hoạt
                  </label>
                  <input
                    id="staff-inactive-news-search"
                    className="staff-search-input"
                    type="search"
                    placeholder="Tìm theo mã, tiêu đề, mô tả hoặc nội dung..."
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                    autoComplete="off"
                  />
                </div>
                <div className="staff-table-toolbar__meta">
                  <span>
                    Phù hợp: <strong>{isLoading || loadError ? '—' : filteredData.length}</strong> tin tức
                  </span>
                </div>
              </div>

              <div className="news-table-scroll staff-table-scroll" role="region" aria-label="Bảng tin chưa kích hoạt" tabIndex={0}>
                <table className="table staff-data-table">
                  <thead>
                    <tr>
                      <th scope="col">Mã tin tức</th>
                      <th scope="col">Tiêu đề</th>
                      <th scope="col">Mô tả</th>
                      <th scope="col">Nội dung</th>
                      <th scope="col" className="col-center">Trạng thái</th>
                      <th scope="col" className="col-actions">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6}>
                          <p className="news-table-state staff-table-state" role="status">
                            Đang tải danh sách tin tức chưa kích hoạt…
                          </p>
                        </td>
                      </tr>
                    ) : loadError ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="news-table-state news-table-state--error" role="alert">
                            <span>Không thể tải danh sách tin tức chưa kích hoạt. Vui lòng thử lại.</span>
                            <button
                              className="staff-retry-btn"
                              type="button"
                              onClick={() => void getAllNews()}
                            >
                              Thử lại
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : records.length > 0 ? (
                      records.map((news, i) => (
                        <tr key={news.newsId ?? i}>
                          <td>
                            <span className="staff-id-badge">#{news.newsId}</span>
                          </td>
                          <td className="cell-strong" title={news.title ?? ''}>
                            {truncateText(news.title, 28)}
                          </td>
                          <td className="cell-muted" title={news.description ?? ''}>
                            {truncateText(news.description, 36)}
                          </td>
                          <td className="cell-muted" title={news.content ?? ''}>
                            {truncateText(news.content, 52)}
                          </td>
                          <td className="col-center">
                            <span
                              className={`status-badge ${
                                news.status === true
                                  ? 'status-badge--active'
                                  : 'status-badge--inactive'
                              }`}
                            >
                              {news.status === true ? 'Kích hoạt' : 'Chưa kích hoạt'}
                            </span>
                          </td>
                          <td className="button col-actions">
                            <div className="row-actions">
                              <button
                                className="action-btn action-btn--edit"
                                type="button"
                                onClick={() => updateBtn(news.newsId)}
                              >
                                Kích hoạt
                              </button>
                              <button
                                className="action-btn action-btn--delete"
                                type="button"
                                onClick={() => void handleDelete(news.newsId)}
                              >
                                Xoá
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6}>
                          <div className="news-table-state staff-table-state" role="status">
                            {data.length > 0
                              ? 'Không tìm thấy tin tức phù hợp với từ khóa tìm kiếm.'
                              : 'Hiện chưa có tin tức chưa kích hoạt.'}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <footer className="staff-table-footer">
                <span className="staff-table-footer__info">
                  Hiển thị {records.length > 0 ? firsIndex + 1 : 0}–
                  {Math.min(lastIndex, filteredData.length)} trong {filteredData.length} tin tức
                </span>
                <nav aria-label="Phân trang tin tức chưa kích hoạt">
                  <ul className="pagination">
                    <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={prePage}
                        disabled={safePage === 1}
                      >
                        Trước
                      </button>
                    </li>
                    {numbers.map((n) => (
                      <li
                        className={`page-item ${safePage === n ? 'active' : ''}`}
                        key={n}
                      >
                        <button
                          type="button"
                          className="page-link"
                          onClick={() => changeCPage(n)}
                        >
                          {n}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        npage === 0 || safePage === npage ? 'disabled' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={nextPage}
                        disabled={npage === 0 || safePage === npage}
                      >
                        Sau
                      </button>
                    </li>
                  </ul>
                </nav>
              </footer>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
}
