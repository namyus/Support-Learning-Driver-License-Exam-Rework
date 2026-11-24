import axios from 'axios';

export interface ApiRejectedPayload {
  message: string;
  status?: number;
  error?: string;
  data?: unknown;
}

export function extractApiError(
  error: unknown,
  fallbackMessage = 'Request failed'
): ApiRejectedPayload {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data as
      | { error?: unknown; message?: unknown }
      | undefined;
    const backendError =
      typeof responseData?.error === 'string' && responseData.error.trim().length > 0
        ? responseData.error
        : undefined;
    const message =
      backendError ||
      (typeof responseData?.message === 'string' && responseData.message.trim().length > 0
        ? responseData.message
        : error.message || fallbackMessage);

    return {
      message,
      status,
      error: backendError,
      data: error.response?.data,
    };
  }

  if (error instanceof Error) {
    return { message: error.message || fallbackMessage };
  }

  return { message: fallbackMessage };
}

export function getApiErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}
