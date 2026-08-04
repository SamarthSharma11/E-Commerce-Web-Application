import { create } from 'zustand';
import api, { setAccessToken } from '../api/axios';
import type { User, LoginCredentials, RegisterCredentials, ApiResponse } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // true on initial app mount while checking refresh cookie
  error: null,

  clearError: () => set({ error: null }),

  /**
   * Login user with email & password
   */
  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<
        ApiResponse<{ user: User; accessToken: string }>
      >('/auth/login', credentials);

      const { user, accessToken } = response.data.data!;

      setAccessToken(accessToken);

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Login failed. Please check your credentials.';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * Register a new account
   */
  register: async (credentials: RegisterCredentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<
        ApiResponse<{ user: User; accessToken: string }>
      >('/auth/register', {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });

      const { user, accessToken } = response.data.data!;

      setAccessToken(accessToken);

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Registration failed. Please try again.';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * Logout current session
   */
  logout: async () => {
    try {
      set({ isLoading: true });
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Check authentication on initial page load (silent token refresh)
   */
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      // 1. Attempt token refresh using httpOnly cookie
      const refreshRes = await api.post<ApiResponse<{ accessToken: string }>>(
        '/auth/refresh-token'
      );
      const newAccessToken = refreshRes.data.data?.accessToken;

      if (newAccessToken) {
        setAccessToken(newAccessToken);

        // 2. Fetch user profile
        const meRes = await api.get<ApiResponse<{ user: User }>>('/auth/me');
        const user = meRes.data.data?.user;

        if (user) {
          set({
            user,
            accessToken: newAccessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }

      setAccessToken(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch {
      setAccessToken(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

// Export alias for consistency
export default useAuthStore;
