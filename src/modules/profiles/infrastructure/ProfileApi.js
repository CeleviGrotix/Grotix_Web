import { axiosClient } from '@/shared/http/axiosClient';
import { Profile } from '../domain/Profile';

export const ProfileApi = {
  async getAgriculturists() {
    const response = await axiosClient.get('/api/v1/users');
    const items = response.data.items || response.data || [];
    return items.map(dto => new Profile(dto));
  },

  async getProfileById(id) {
    const response = await axiosClient.get(`/api/v1/users/${id}`);
    return new Profile(response.data);
  },

  async getMyProfile() {
    // ¡CORREGIDO! Adiós al localhost. Ahora pasará por el Gateway de Azure.
    const response = await axiosClient.get('/api/v1/profile/me');
    return new Profile(response.data);
  },

  async updateProfile(userId, profileData) {
    // Si userId viene como "1:1" en lugar de "1", el backend se rompe.
    // Asegurémonos de limpiar el ID por si acaso:
    const cleanId = String(userId).split(':')[0]; 
    
    // ¡CORREGIDO! Ruta relativa limpia.
    const response = await axiosClient.patch(`/api/v1/profile/${cleanId}`, profileData);
    return new Profile(response.data);
  }
};