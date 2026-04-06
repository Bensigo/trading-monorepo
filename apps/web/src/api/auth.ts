import { apiClient } from './client';
import type { LoginResponse, User } from '@repo/shared';

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>('/auth/logout', { method: 'POST' });
}

export function getMe(): Promise<{ user: User }> {
  return apiClient<{ user: User }>('/auth/me');
}
