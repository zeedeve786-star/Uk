import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthenticatedAdmin } from '../models';
import { fetchCurrentAdmin, login as loginRequest, logout as logoutRequest } from '../api/authService';
import { getStoredToken } from '../api/adminHttpClient';

interface AdminAuthContextValue {
  admin: AuthenticatedAdmin | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AuthenticatedAdmin | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    if (!getStoredToken()) {
      setStatus('unauthenticated');
      return;
    }
    fetchCurrentAdmin()
      .then((user) => {
        setAdmin(user);
        setStatus('authenticated');
      })
      .catch(() => {
        setStatus('unauthenticated');
      });
  }, []);

  async function login(email: string, password: string) {
    const user = await loginRequest(email, password);
    setAdmin(user);
    setStatus('authenticated');
  }

  function logout() {
    logoutRequest();
    setAdmin(null);
    setStatus('unauthenticated');
  }

  return <AdminAuthContext.Provider value={{ admin, status, login, logout }}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}