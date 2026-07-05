import { axiosClient } from '@/shared/http/axiosClient';
import { Crop } from '../domain/Crop';

export const CatalogApi = {
  async getCrops() {
    const response = await axiosClient.get('/api/v1/catalog/crops');
    const items = response.data.items || response.data || [];
    return items.map(dto => new Crop(dto));
  },

  async getCropById(id) {
    const response = await axiosClient.get(`/api/v1/catalog/crops/${id}`);
    return new Crop(response.data);
  },

  // NUEVO: Método para Crear (POST)
  async createCrop(cropData) {
    const payload = {
      commonName: cropData.commonName,
      scientificName: cropData.scientificName,
      optimalTemperature: cropData.optimalTemperature || 0,
      optimalHumidityAir: cropData.optimalHumidityAir || 0,   // <-- NUEVO
      optimalHumiditySoil: cropData.optimalHumiditySoil || 0, // <-- NUEVO
      optimalLight: cropData.optimalLight || 0,
      maxStressTime: cropData.maxStressTime || 0,
      imageUrl: cropData.imageUrl || ''
    };
    const response = await axiosClient.post('/api/v1/catalog/crops', payload);
    return response.data;
  },

  async updateCrop(id, cropData) {
    const payload = {
      commonName: cropData.commonName,
      scientificName: cropData.scientificName,
      optimalTemperature: Number(cropData.optimalTemperature), // Number() por seguridad (C# es estricto)
      optimalHumidityAir: Number(cropData.optimalHumidityAir),   // <-- NUEVO
      optimalHumiditySoil: Number(cropData.optimalHumiditySoil), // <-- NUEVO
      optimalLight: Number(cropData.optimalLight),
      maxStressTime: Number(cropData.maxStressTime),
      imageUrl: cropData.imageUrl
    };
    const response = await axiosClient.put(`/api/v1/catalog/crops/${id}`, payload);
    return response.data;
  },
  async deleteCrop(id) {
    await axiosClient.delete(`/api/v1/catalog/crops/${id}`);
  }
};