import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ProfileApi } from '../infrastructure/ProfileApi';

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref([]);
  const currentProfile = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchProfiles() {
    isLoading.value = true;
    error.value = null;
    try {
      profiles.value = await ProfileApi.getAgriculturists();
    } catch (err) {
      error.value = 'Error al cargar los usuarios.';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchProfileById(id) {
    isLoading.value = true;
    error.value = null;
    currentProfile.value = null;
    try {
      currentProfile.value = await ProfileApi.getProfileById(id);
    } catch (err) {
      error.value = 'Usuario no encontrado.';
    } finally {
      isLoading.value = false;
    }
  }

  return { profiles, currentProfile, isLoading, error, fetchProfiles, fetchProfileById };
});