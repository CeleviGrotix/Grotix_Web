import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { axiosClient } from '@/shared/http/axiosClient';

export const useAuthStore = defineStore('auth', () => {
  // Usamos 'grotix_token' para que coincida con tu axiosClient.js
  const token = ref(localStorage.getItem('grotix_token') || null);
  const user = ref(JSON.parse(localStorage.getItem('grotix_user')) || null);
  const isLoading = ref(false);

  // Getter para saber si está autenticado
  const isAuthenticated = computed(() => !!token.value);

  async function login(email, password) {
    isLoading.value = true;
    try {
      // Llamada al Gateway (puerto 5100)
      const response = await axiosClient.post('/api/v1/auth/sign-in', { email, password });
      
      // Extraemos la info según el LoginResponse que vimos antes
      const { token: newToken, identityId, email: userEmail } = response.data;

      // Guardamos Token
      localStorage.setItem('grotix_token', newToken);
      token.value = newToken;

      // Guardamos info básica del usuario (útil para el Dashboard)
      const userData = { identityId, email: userEmail };
      localStorage.setItem('grotix_user', JSON.stringify(userData));
      user.value = userData;

    } catch (error) {
      console.error("Error en login:", error);
      // Solución al error de ESLint: adjuntamos el 'cause'
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
    // Aquí puedes redirigir al login: router.push('/login')
  }

  return { 
    token, 
    user, 
    isLoading, 
    isAuthenticated, 
    login, 
    logout 
  };
});