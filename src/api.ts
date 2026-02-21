import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}
export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, 
});


api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


let isRefreshing = false;
let pending: Array<(token: string | null) => void> = [];

function notify(token: string | null) {
  pending.forEach((cb) => cb(token));
  pending = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err?.response?.status !== 401 || original?._retry) {
      throw err;
    }

    original._retry = true;

    if (isRefreshing) {
      const token = await new Promise<string | null>((resolve) => pending.push(resolve));
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      throw err;
    }

    isRefreshing = true;

    try {
      const r = await api.post("/api/auth/refresh");
      const newToken = r.data?.accessToken;
      if (!newToken) throw err;

      setAccessToken(newToken);
      notify(newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (e) {
      notify(null);
      clearAccessToken();
      throw err;
    } finally {
      isRefreshing = false;
    }
  }
);