import './member-news-section.scss';
import NewsImg from '../../../../assets/imgs/news/news-img.jpeg';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';
import api from '../../../config/axios';

interface NewsItem {
  newsId?: string | number;
  title?: string;
  description?: string;
  content?: string | null;
  createdTime?: string;
}

function News() {
  const [data, setData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const getAllNews = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.get('News/list');
      const payload = response.data;

      if (!Array.isArray(payload)) {
        setData([]);
        setErrorMessage('Không thể tải tin tức. Vui lòng thử lại sau.');
        setIsLoading(false);
        return;
      }

      setData(payload);
      setIsLoading(false);
    } catch (error) {
      console.error(error);

      const isKnownNoNews404 =
        axios.isAxiosError(error) &&
        error.response?.status === 404 &&
        (error.response?.data as { error?: string } | undefined)?.error ===
          'Không tìm thấy tin tức!';

      if (isKnownNoNews404) {
        setData([]);
        setErrorMessage(null);
      } else {
        setData([]);
        setErrorMessage('Không thể tải tin tức. Vui lòng thử lại sau.');
      }

      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void getAllNews();
  }, [getAllNews]);

  const formatDate = (dbDate?: string) => {
    if (!dbDate) {
      return '';
    }
    const date = new Date(dbDate);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const maxNewsDisplayed = 3;
  const displayedNews = Array.isArray(data)
    ? data.slice(0, maxNewsDisplayed)
    : [];

  function truncateText(text: string | null | undefined, maxLength: number) {
    const safeText = typeof text === 'string' ? text : '';
    if (safeText.length <= maxLength) {
      return safeText;
    }
    return safeText.slice(0, maxLength) + '...';
  }

  const handleCloseModal = () => {
    setSelectedNews(null);
  };

  return (
    <>
      <section
        className="news-home-container mh-news-section"
        id="news-section"
        aria-labelledby="mh-news-heading"
      >
        <div className="mh-section-header">
          <h2 id="mh-news-heading" className="mh-section-title">
            Tin tức
          </h2>
        </div>

        {isLoading ? (
          <div
            className="mh-news-state mh-news-state--loading"
            role="status"
            aria-live="polite"
          >
            <div className="mh-news-state__spinner" aria-hidden="true" />
            <p className="mh-news-state__text">Đang tải tin tức...</p>
          </div>
        ) : errorMessage ? (
          <div className="mh-news-state mh-news-state--error" role="alert">
            <p className="mh-news-state__text">{errorMessage}</p>
            <button
              type="button"
              className="mh-news-state__retry"
              onClick={() => void getAllNews()}
            >
              Thử lại
            </button>
          </div>
        ) : displayedNews.length > 0 ? (
          <div className="news-list mh-news-grid">
            {displayedNews.map((newsItem, i) => {
              const formattedDate = formatDate(newsItem.createdTime);
              return (
                <article
                  className={`news-section-${i + 1} mh-news-card`}
                  key={newsItem.newsId ?? `${newsItem.title ?? 'news'}-${i}`}
                >
                  <div className="mh-news-card__media">
                    <img
                      src={NewsImg}
                      alt={
                        newsItem.title ||
                        'Tin tức trung tâm đào tạo lái xe FDriving'
                      }
                      className="mh-news-card__img"
                    />
                    {formattedDate && (
                      <div className="date-container mh-news-card__date">
                        <p className={`news-${i + 1}-date`}>{formattedDate}</p>
                      </div>
                    )}
                  </div>
                  <div className="mh-news-card__body">
                    <h3 className={`news-${i + 1}-title mh-news-card__title`}>
                      {newsItem.title}
                    </h3>
                    {newsItem.description && (
                      <p
                        className={`news-${i + 1}-description mh-news-card__desc`}
                      >
                        {newsItem.description}
                      </p>
                    )}
                    <p
                      className={`news-${i + 1}-content mh-news-card__excerpt`}
                    >
                      {truncateText(newsItem.content, 100)}
                    </p>
                    <button
                      type="button"
                      className="mh-news-card__btn"
                      onClick={() => setSelectedNews(newsItem)}
                    >
                      Đọc thêm
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mh-news-state mh-news-state--empty" role="status">
            <p className="mh-news-state__text">Hiện chưa có tin tức mới.</p>
          </div>
        )}
      </section>

      <Modal
        show={selectedNews !== null}
        onHide={handleCloseModal}
        keyboard={true}
        backdrop={true}
        dialogClassName="mh-news-modal"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <div className="mh-news-modal__header-content">
            {selectedNews?.createdTime &&
              formatDate(selectedNews.createdTime) && (
                <span className="mh-news-modal__date">
                  Ngày đăng: {formatDate(selectedNews.createdTime)}
                </span>
              )}
            <Modal.Title className="mh-news-modal__title">
              {selectedNews?.title}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          {selectedNews?.description && (
            <p className="mh-news-modal__desc">{selectedNews.description}</p>
          )}
          <div className="mh-news-modal__content">
            {selectedNews?.content || ''}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="mh-news-modal__close"
            onClick={handleCloseModal}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default News;
