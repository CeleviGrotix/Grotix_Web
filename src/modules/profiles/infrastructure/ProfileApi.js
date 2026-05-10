import { axiosClient } from '@/shared/http/axiosClient';
import { Profile } from '../domain/Profile';

export const ProfileApi = {
  async getAgriculturists() {
    // Apuntamos al endpoint de Users
    const response = await axiosClient.get('/api/v1/users');
    const items = response.data.items || response.data || [];
    return items.map(dto => new Profile(dto));
  },

  async getProfileById(id) {
    const response = await axiosClient.get(`/api/v1/users/${id}`);
    return new Profile(response.data);
  }
};