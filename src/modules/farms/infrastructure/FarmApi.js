import { axiosClient } from '@/shared/http/axiosClient';

export const FarmApi = {
  async listAll() {
    const response = await axiosClient.get('/api/v1/farms');
    return response.data || [];
  },

  async getByAssociationId(associationId) {
    const farms = await this.listAll();
    return farms.filter(
      (farm) => String(farm.associationId) === String(associationId),
    );
  },

  async createFarm({ associationId, name, location }) {
    const response = await axiosClient.post('/api/v1/farms', {
      associationId,
      name,
      location,
    });
    return response.data;
  },
};
