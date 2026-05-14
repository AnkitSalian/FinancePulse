import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const storedToken = localStorage.getItem('fp_token');
const storedUser = localStorage.getItem('fp_user');

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? (JSON.parse(storedUser) as User) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,

  login: (user, token) => {
    localStorage.setItem('fp_token', token);
    localStorage.setItem('fp_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (updates) =>
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...updates };
      localStorage.setItem('fp_user', JSON.stringify(updated));
      return { user: updated };
    }),
}));
