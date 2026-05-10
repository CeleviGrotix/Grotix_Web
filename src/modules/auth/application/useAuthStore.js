import { defineStore } from 'pinia';
import { ref } from 'vue';
import { axiosClient } from '@/shared/http/axiosClient';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const isLoading = ref(false);

  async function login(email, password) {
    isLoading.value = true;
    try {
      // Apuntamos al endpoint de tu Swagger
      const response = await axiosClient.post('/api/v1/auth/sign-in', { email, password });
      
      // OJO: Ajusta "response.data.token" si tu backend lo llama distinto (ej: accessToken)
      const newToken = response.data.token || response.data; 
      
      // Guardamos en la memoria del navegador y en la variable reactiva
      localStorage.setItem('token', newToken);
      token.value = newToken;
      
    } catch (error) {
      console.error("Error en login:", error);
      throw new Error("Credenciales inválidas");
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    localStorage.removeItem('token');
    token.value = null;
    // Aquí normalmente haríamos un router.push('/login')
  }

  return { token, isLoading, login, logout };
});