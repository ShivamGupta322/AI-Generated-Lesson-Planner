'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        if (email === 'demouser' && password === 'demopass') {
          set({
            user: { email, name: 'Demo User' },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);