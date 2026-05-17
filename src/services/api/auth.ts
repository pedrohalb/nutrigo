import { api } from './client';

export const authApi = {
  signup(email: string, password: string) {
    return api.post<{ token: string; user: { id: string; email: string } }>(
      '/auth/signup',
      { email, password }
    );
  },

  login(email: string, password: string) {
    return api.post<{
      token: string;
      user: { id: string; email: string };
      hasProfile: boolean;
    }>('/auth/login', { email, password });
  },

  forgotPassword(email: string) {
    return api.post<{ ok: true }>('/auth/forgot-password', { email });
  },

  resetPassword(email: string, newPassword: string) {
    return api.post<{ ok: true }>('/auth/reset-password', { email, newPassword });
  },

  logout() {
    return api.post<{ ok: true }>('/auth/logout', {});
  },
};
