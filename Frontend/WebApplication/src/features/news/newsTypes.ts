export interface NewsRecord {
  newsId: number;
  title?: string;
  description?: string;
  content?: string | null;
  staffId?: number;
  status: boolean;
  createdTime?: string;
}

export interface CreateNewsPayload {
  newsId?: number;
  title: string;
  description: string;
  content: string;
  staffId: number;
  status: boolean;
}

export interface UpdateNewsPayload {
  newsId?: number;
  title: string;
  description: string;
  content: string;
  staffId?: number;
  status: boolean;
  createdTime?: string;
}

export interface NewsState {
  activeList: NewsRecord[];
  inactiveList: NewsRecord[];
  selectedNews: NewsRecord | null;
  loading: {
    activeList: boolean;
    inactiveList: boolean;
    selectedNews: boolean;
    create: boolean;
    update: boolean;
    deactivate: boolean;
  };
  errors: {
    activeList: string | null;
    inactiveList: string | null;
    selectedNews: string | null;
    create: string | null;
    update: string | null;
    deactivate: string | null;
  };
}
