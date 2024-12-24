import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        const { user } = await authService.login({ email, password });
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false });
      },
      register: async (email: string, password: string, name: string) => {
        const { user } = await authService.register({ username: name, email, password });
        set({ user, isAuthenticated: true });
      },
      updateProfile: async (data: Partial<User>) => {
        const updatedUser = await authService.updateProfile(data);
        set((state) => ({
          ...state,
          user: {
            ...state.user,
            ...updatedUser
          }
        }));
      },
      deleteAccount: async () => {
        await authService.deleteAccount();
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);