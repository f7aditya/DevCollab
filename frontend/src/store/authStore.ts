// @ts-nocheck
import { create } from 'zustand';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (token: string, user: User) => {
    Cookies.set('token', token, { expires: 7 }); // 7 days
    set({ user, isAuthenticated: true, isLoading: false });
  },

  setUser: (user: User) => {
    set({ user });
  },

  logout: () => {
    Cookies.remove('token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    const token = Cookies.get('token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await api.get('/users/me');
      if (response.success && response.data?.user) {
        set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      Cookies.remove('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
