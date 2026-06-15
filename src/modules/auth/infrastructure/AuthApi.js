// src/modules/auth/infrastructure/AuthApi.js
import { axiosClient } from '@/shared/http/axiosClient';

export const AuthApi = {
  login(email, password) {
    return axiosClient.post('/api/v1/auth/sign-in', { email, password });
  },

  register(email, password, inviteToken) {
    return axiosClient.post('/api/v1/auth/register', { email, password, inviteToken });
  }
};