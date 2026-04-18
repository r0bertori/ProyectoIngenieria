'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organization: {
    id: string;
    name: string;
    type: string;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post<{
            accessToken: string;
            refreshToken: string;
            user: User;
          }>('/auth/login', { email, password });

          apiClient.setAccessToken(response.accessToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await apiClient.post('/auth/logout', { refreshToken });
          }
        } catch {
          // Ignore logout errors
        }
        apiClient.setAccessToken(null);
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          set({ user: null, accessToken: null, refreshToken: null });
          return;
        }

        try {
          const response = await apiClient.post<{
            accessToken: string;
            refreshToken: string;
            user: User;
          }>('/auth/refresh', { refreshToken });

          apiClient.setAccessToken(response.accessToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

// Helper hooks
export const useUser = () => useAuth((state) => state.user);
export const useIsAuthenticated = () => useAuth((state) => !!state.user);
export const useUserRole = () => useAuth((state) => state.user?.role);
