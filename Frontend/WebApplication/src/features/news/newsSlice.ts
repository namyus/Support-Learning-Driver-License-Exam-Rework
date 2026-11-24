import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractApiError, type ApiRejectedPayload } from '../shared/apiError';
import { newsApi } from './newsApi';
import type {
  CreateNewsPayload,
  NewsRecord,
  NewsState,
  UpdateNewsPayload,
} from './newsTypes';

const initialState: NewsState = {
  activeList: [],
  inactiveList: [],
  selectedNews: null,
  loading: {
    activeList: false,
    inactiveList: false,
    selectedNews: false,
    create: false,
    update: false,
    deactivate: false,
  },
  errors: {
    activeList: null,
    inactiveList: null,
    selectedNews: null,
    create: null,
    update: null,
    deactivate: null,
  },
};

export const fetchNewsList = createAsyncThunk<
  NewsRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('news/fetchNewsList', async (_, { rejectWithValue }) => {
  try {
    const response = await newsApi.getNewsList();
    if (!Array.isArray(response.data)) {
      return rejectWithValue({
        message: 'Không thể tải tin tức. Vui lòng thử lại sau.',
        status: response.status,
      });
    }
    return response.data;
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải tin tức. Vui lòng thử lại sau.')
    );
  }
});

export const fetchInactiveNews = createAsyncThunk<
  NewsRecord[],
  void,
  { rejectValue: ApiRejectedPayload }
>('news/fetchInactiveNews', async (_, { rejectWithValue }) => {
  try {
    const response = await newsApi.getInactiveNews();
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return rejectWithValue(
      extractApiError(
        err,
        'Không thể tải danh sách tin tức chưa kích hoạt. Vui lòng thử lại.'
      )
    );
  }
});

export const fetchNewsById = createAsyncThunk<
  NewsRecord,
  number | string,
  { rejectValue: ApiRejectedPayload }
>('news/fetchNewsById', async (newsId, { rejectWithValue }) => {
  try {
    const response = await newsApi.getNewsById(newsId);
    return response.data;
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tải thông tin tin tức.')
    );
  }
});

export const createNews = createAsyncThunk<
  { status: number; data: unknown },
  CreateNewsPayload,
  { rejectValue: ApiRejectedPayload }
>('news/createNews', async (payload, { rejectWithValue }) => {
  try {
    const response = await newsApi.createNews(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể tạo tin tức mới.')
    );
  }
});

export const updateNews = createAsyncThunk<
  { status: number; data: unknown },
  UpdateNewsPayload,
  { rejectValue: ApiRejectedPayload }
>('news/updateNews', async (payload, { rejectWithValue }) => {
  try {
    const response = await newsApi.updateNews(payload);
    return { status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể cập nhật tin tức.')
    );
  }
});

export const deactivateNews = createAsyncThunk<
  { newsId: number | string; status: number; data: unknown },
  number | string,
  { rejectValue: ApiRejectedPayload }
>('news/deactivateNews', async (newsId, { rejectWithValue }) => {
  try {
    const response = await newsApi.deactivateNews(newsId);
    return { newsId, status: response.status, data: response.data };
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, 'Không thể xoá tin tức.')
    );
  }
});

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    clearNewsErrors(state) {
      state.errors = { ...initialState.errors };
    },
    clearSelectedNews(state) {
      state.selectedNews = null;
    },
    clearNewsState() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchNewsList.pending, (state) => {
        state.loading.activeList = true;
        state.errors.activeList = null;
      })
      .addCase(fetchNewsList.fulfilled, (state, action) => {
        state.loading.activeList = false;
        state.activeList = action.payload;
      })
      .addCase(fetchNewsList.rejected, (state, action) => {
        state.loading.activeList = false;
        state.errors.activeList =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchInactiveNews.pending, (state) => {
        state.loading.inactiveList = true;
        state.errors.inactiveList = null;
      })
      .addCase(fetchInactiveNews.fulfilled, (state, action) => {
        state.loading.inactiveList = false;
        state.inactiveList = action.payload;
      })
      .addCase(fetchInactiveNews.rejected, (state, action) => {
        state.loading.inactiveList = false;
        state.errors.inactiveList =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(fetchNewsById.pending, (state) => {
        state.loading.selectedNews = true;
        state.errors.selectedNews = null;
      })
      .addCase(fetchNewsById.fulfilled, (state, action) => {
        state.loading.selectedNews = false;
        state.selectedNews = action.payload;
      })
      .addCase(fetchNewsById.rejected, (state, action) => {
        state.loading.selectedNews = false;
        state.errors.selectedNews =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(createNews.pending, (state) => {
        state.loading.create = true;
        state.errors.create = null;
      })
      .addCase(createNews.fulfilled, (state) => {
        state.loading.create = false;
      })
      .addCase(createNews.rejected, (state, action) => {
        state.loading.create = false;
        state.errors.create =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(updateNews.pending, (state) => {
        state.loading.update = true;
        state.errors.update = null;
      })
      .addCase(updateNews.fulfilled, (state) => {
        state.loading.update = false;
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.loading.update = false;
        state.errors.update =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      })

      .addCase(deactivateNews.pending, (state) => {
        state.loading.deactivate = true;
        state.errors.deactivate = null;
      })
      .addCase(deactivateNews.fulfilled, (state) => {
        state.loading.deactivate = false;
      })
      .addCase(deactivateNews.rejected, (state, action) => {
        state.loading.deactivate = false;
        state.errors.deactivate =
          action.payload?.message ?? action.error.message ?? 'Request failed';
      });
  },
});

export const { clearNewsErrors, clearSelectedNews, clearNewsState } =
  newsSlice.actions;

export const selectNewsState = (state: { news: NewsState }): NewsState =>
  state.news;
export const selectActiveNewsList = (state: {
  news: NewsState;
}): NewsRecord[] => state.news.activeList;
export const selectInactiveNewsList = (state: {
  news: NewsState;
}): NewsRecord[] => state.news.inactiveList;
export const selectSelectedNews = (state: {
  news: NewsState;
}): NewsRecord | null => state.news.selectedNews;
export const selectNewsLoading = (state: {
  news: NewsState;
}): NewsState['loading'] => state.news.loading;
export const selectNewsErrors = (state: {
  news: NewsState;
}): NewsState['errors'] => state.news.errors;

export default newsSlice.reducer;
