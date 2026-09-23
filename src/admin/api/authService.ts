import { adminApi, setStoredToken, clearStoredToken } from './adminHttpClient';
import type { AuthenticatedAdmin } from '../models';

interface LoginResponse {
  accessToken: string;
  user: AuthenticatedAdmin;
}

export async function login(email: string, password: string): Promise<AuthenticatedAdmin> {
  const result = await adminApi.post<LoginResponse>('/auth/login', { email, password });
  setStoredToken(result.accessToken);
  return result.user;
}

export async function fetchCurrentAdmin(): Promise<AuthenticatedAdmin> {
  return adminApi.get<AuthenticatedAdmin>('/auth/me');
}

export function logout(): void {
  clearStoredToken();
}