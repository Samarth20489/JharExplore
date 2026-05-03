import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AdminState {
  admin: AdminUser | null;
  token: string | null;
  isAdminAuthenticated: boolean;
  setAdmin: (admin: AdminUser, token: string) => void;
  clearAdmin: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAdminAuthenticated: false,
      setAdmin: (admin, token) => set({ admin, token, isAdminAuthenticated: true }),
      clearAdmin: () => set({ admin: null, token: null, isAdminAuthenticated: false }),
    }),
    { name: 'admin-storage', storage: { getItem: (name) => { const v = sessionStorage.getItem(name); return v ? JSON.parse(v) : null; }, setItem: (name, value) => sessionStorage.setItem(name, JSON.stringify(value)), removeItem: (name) => sessionStorage.removeItem(name) } }
  )
);
