import { create } from 'zustand';
import { User, Business } from '../types';
import { ApiClient } from '../services/api';

interface AuthState {
  user: User | null;
  business: Business | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, businessData: Business, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('shelfsense_user') || 'null'),
  business: JSON.parse(localStorage.getItem('shelfsense_business') || 'null'),
  isAuthenticated: !!localStorage.getItem('shelfsense_access_token'),
  isLoading: false,

  login: (user, business, tokens) => {
    localStorage.setItem('shelfsense_access_token', tokens.accessToken);
    localStorage.setItem('shelfsense_refresh_token', tokens.refreshToken);
    localStorage.setItem('shelfsense_user', JSON.stringify(user));
    localStorage.setItem('shelfsense_business', JSON.stringify(business));
    set({ user, business, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('shelfsense_access_token');
    localStorage.removeItem('shelfsense_refresh_token');
    localStorage.removeItem('shelfsense_user');
    localStorage.removeItem('shelfsense_business');
    set({ user: null, business: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('shelfsense_access_token');
    if (!token) {
      set({ user: null, business: null, isAuthenticated: false });
      return;
    }
    try {
      const data = await ApiClient.get<{ user: User; business: Business }>('/auth/me');
      set({ user: data.user, business: data.business, isAuthenticated: true });
      localStorage.setItem('shelfsense_user', JSON.stringify(data.user));
      localStorage.setItem('shelfsense_business', JSON.stringify(data.business));
    } catch {
      localStorage.removeItem('shelfsense_access_token');
      localStorage.removeItem('shelfsense_refresh_token');
      localStorage.removeItem('shelfsense_user');
      localStorage.removeItem('shelfsense_business');
      set({ user: null, business: null, isAuthenticated: false });
    }
  },
}));
