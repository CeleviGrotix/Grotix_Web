// src/modules/auth/application/useAuthStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthApi } from '@/modules/auth/infrastructure/AuthApi';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('grotix_token') || null);
  const user = ref(JSON.parse(localStorage.getItem('grotix_user')) || null);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!token.value);

    function getRoleFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // ClaimTypes.Role en .NET genera este claim
      return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    } catch {
      return null;
    }
  }

  async function login(email, password) {
    isLoading.value = true;
    try {
      const response = await AuthApi.login(email, password);
      const { token: newToken, identityId, email: userEmail } = response.data;

      const role = getRoleFromToken(newToken);
      const staffRoles = ['admin', 'staff'];
      if (!role || !staffRoles.includes(role)) {
        throw new Error('No tienes permiso para acceder a esta plataforma.', { cause: null });
      }

      localStorage.setItem('grotix_token', newToken);
      token.value = newToken;

      const userData = { identityId, email: userEmail, role };
      localStorage.setItem('grotix_user', JSON.stringify(userData));
      user.value = userData;

    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Invalid credentials.';
      throw new Error(message, { cause: error });
    } finally {
      isLoading.value = false;
    }
  }

  async function register(email, password, inviteToken) {
    isLoading.value = true;
    try {
      await AuthApi.register(email, password, inviteToken);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create account.';
      throw new Error(message, { cause: error });
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    localStorage.removeItem('grotix_token');
    localStorage.removeItem('grotix_user');
    token.value = null;
    user.value = null;
  }

  return { token, user, isLoading, isAuthenticated, login, logout, register };
});