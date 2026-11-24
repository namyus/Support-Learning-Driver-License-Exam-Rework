import axios, { AxiosRequestConfig } from "axios";

const LOCAL_DEV_API_BASE_URL = "http://localhost:8080/api/";

export function resolveApiBaseUrl(
  rawEnvUrl: string | undefined = import.meta.env.VITE_API_BASE_URL,
  isProd: boolean = import.meta.env.PROD
): string {
  const configuredUrl = rawEnvUrl?.trim();
  if (configuredUrl) {
    return configuredUrl.endsWith("/") ? configuredUrl : `${configuredUrl}/`;
  }

  if (isProd) {
    throw new Error(
      "Missing required environment variable VITE_API_BASE_URL for production build. Set VITE_API_BASE_URL (e.g., https://<api-domain>/api/) before building."
    );
  }

  return LOCAL_DEV_API_BASE_URL;
}

const config: AxiosRequestConfig = {
  baseURL: resolveApiBaseUrl(),
};

const api = axios.create(config);

export default api;
