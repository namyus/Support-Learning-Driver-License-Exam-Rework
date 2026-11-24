import api from '../../config/axios';
import type {
  CreateNewsPayload,
  NewsRecord,
  UpdateNewsPayload,
} from './newsTypes';

export const newsApi = {
  getNewsList() {
    return api.get<NewsRecord[]>('News/list');
  },

  getInactiveNews() {
    return api.get<NewsRecord[]>('News/inactive-news');
  },

  getNewsById(newsId: number | string) {
    return api.get<NewsRecord>(`News/${newsId}`);
  },

  createNews(payload: CreateNewsPayload) {
    return api.post('News/add', payload);
  },

  updateNews(payload: UpdateNewsPayload) {
    return api.put('News/update', payload);
  },

  deactivateNews(newsId: number | string) {
    return api.delete(`News/deactivate/${newsId}`);
  },
};
