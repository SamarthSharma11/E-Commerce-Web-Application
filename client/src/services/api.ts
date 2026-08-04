import axios from 'axios';

// =====================================================
// Axios Instance — pre-configured for the API
// =====================================================
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================================================
// Request Interceptor — attach access token
// =====================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================================
// Response Interceptor — handle 401 token refresh
// =====================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
