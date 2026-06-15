// src/modules/profiles/infrastructure/InviteApi.js
import { axiosClient } from '@/shared/http/axiosClient';

export const InviteApi = {
  createInvite(associationId, email, roleId, expiresAt = null) {
    return axiosClient.post(`/api/v1/associations/${associationId}/invites`, {
      email,
      roleId,
      expiresAt
    });
  }
};