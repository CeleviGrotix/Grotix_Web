import { axiosClient } from '@/shared/http/axiosClient';

export const ZoneApi = {
  async listByFarm(farmId) {
    const response = await axiosClient.get(`/api/v1/farms/${farmId}/zones`);
    return response.data || [];
  },

  async createZone(farmId, payload) {
    const response = await axiosClient.post(`/api/v1/farms/${farmId}/zones`, payload);
    return response.data;
  },

  async getById(zoneId) {
    const response = await axiosClient.get(`/api/v1/zones/${zoneId}`);
    return response.data;
  },

  async updateZone(zoneId, payload) {
    const response = await axiosClient.patch(`/api/v1/zones/${zoneId}`, payload);
    return response.data;
  },
};
