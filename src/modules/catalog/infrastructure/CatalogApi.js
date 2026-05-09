// src/modules/catalog/infrastructure/CatalogApi.js
import { axiosClient } from '@/shared/http/axiosClient';
import { Crop } from '../domain/Crop';

export const CatalogApi = {
  async getCrops() {
    const response = await axiosClient.get('http://localhost:5102/api/v1/catalog/crops');
    const items = response.data.items || response.data || [];

    return items.map(dto => new Crop({
      id: dto.id || dto.cropId, // Ajusta si tu backend le llama distinto al ID
      commonName: dto.commonName,
      scientificName: dto.scientificName,
      optimalTemperature: dto.optimalTemperature,
      optimalHumidity: dto.optimalHumidity,
      optimalLight: dto.optimalLight,
      maxStressTime: dto.maxStressTime,
      // Como tu JSON no tiene foto, le ponemos un placeholder generico verde
      photoUrl: dto.photoUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150&q=80' 
    }));
  },

  async getCropById(id) {
    const response = await axiosClient.get(`http://localhost:5102/api/v1/catalog/crops/${id}`);
    
    return new Crop({
      id: response.data.id || response.data.cropId,
      commonName: response.data.commonName,
      scientificName: response.data.scientificName,
      optimalTemperature: response.data.optimalTemperature,
      optimalHumidity: response.data.optimalHumidity,
      optimalLight: response.data.optimalLight,
      maxStressTime: response.data.maxStressTime,
      photoUrl: response.data.photoUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150&q=80'
    });
  }
};