// src/modules/profiles/application/useProfileStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ProfileApi } from '../infrastructure/ProfileApi';

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchProfiles() {
    isLoading.value = true;
    error.value = null;
    try {
      profiles.value = await ProfileApi.getAgriculturists();
    } catch (err) {
      error.value = 'Error al cargar los perfiles. Revisa tu conexión.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  // Puedes ir agregando más casos de uso (ej. toggleStatus) aquí luego

  return { profiles, isLoading, error, fetchProfiles };
});