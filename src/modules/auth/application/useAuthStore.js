import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { axiosClient } from '@/shared/http/axiosClient';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('grotix_token') || null);
  const user = ref(JSON.parse(localStorage.getItem('grotix_user')) || null);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!token.value);

  async function login(email, password) {
    isLoading.value = true;
    try {
      const response = await axiosClient.post('/api/v1/auth/sign-in', { email, password });
      const { token: newToken, identityId, email: userEmail } = response.data;

      localStorage.setItem('grotix_token', newToken); // ← fix del bug anterior
      token.value = newToken;

      const userData = { identityId, email: userEmail };
      localStorage.setItem('grotix_user', JSON.stringify(userData));
      user.value = userData;

    } catch (error) {
      throw new Error("Credenciales inválidas", { cause: error });
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    localStorage.removeItem('grotix_token');
    localStorage.removeItem('grotix_user');
    token.value = null;
    user.value = null;
    // sin router aquí
  }

  return { token, user, isLoading, isAuthenticated, login, logout };
});