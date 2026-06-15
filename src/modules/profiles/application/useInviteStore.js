// src/modules/profiles/application/useInviteStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { InviteApi } from '@/modules/profiles/infrastructure/InviteApi';

export const useInviteStore = defineStore('invite', () => {
  const isLoading = ref(false);
  const errorMessage = ref('');

  async function createInvite(associationId, email, roleId, expiresAt = null) {
    isLoading.value = true;
    errorMessage.value = '';
    try {
      const response = await InviteApi.createInvite(associationId, email, roleId, expiresAt);
      return response.data; // { inviteId, token, expiresAt }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al generar la invitación.';
      errorMessage.value = message;
      throw new Error(message, { cause: error });
    } finally {
      isLoading.value = false;
    }
  }

  return { isLoading, errorMessage, createInvite };
});