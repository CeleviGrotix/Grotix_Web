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

  async function fetchMyProfile() {
    isLoading.value = true;
    error.value = null;
    currentProfile.value = null;
    try {
      currentProfile.value = await ProfileApi.getMyProfile();
    } catch (err) {
      error.value = 'No se pudo cargar tu perfil.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  // ¡NUEVA ACCIÓN PARA ACTUALIZAR!
  async function updateCurrentProfile(profileData) {
    if (!currentProfile.value || !currentProfile.value.id) return;
    
    isLoading.value = true;
    error.value = null;
    try {
      const updatedProfile = await ProfileApi.updateProfile(currentProfile.value.id, profileData);
      currentProfile.value = updatedProfile;
      return updatedProfile; 
    } catch (err) {
      error.value = 'Error al actualizar el perfil.';
      console.error(err);
      throw err; 
    } finally {
      isLoading.value = false;
    }
  }

  return { 
    profiles, 
    currentProfile, 
    isLoading, 
    error, 
    fetchProfiles, 
    fetchProfileById, 
    fetchMyProfile,
    updateCurrentProfile
  };
});