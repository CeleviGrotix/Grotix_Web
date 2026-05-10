import { defineStore } from 'pinia';
import { axiosClient } from '@/shared/http/axiosClient';

export const useSearchStore = defineStore('search', {
  state: () => ({
    results: [],
    isLoading: false,
    error: null,
    query: ''
  }),
actions: {
    async performSearch(term = '') {
      this.query = term;
      this.isLoading = true;
      try {
        const { data } = await axiosClient.get(`/api/v1/search?q=${term}`);
        
        // --- HARDCODE PARA LA ENTREGA ---
        const mockDevices = [
          {
            id: 999,
            type: 'device',
            title: '#HF32A1',
            subtitle: 'Microcontroller',
            status: 'ONLINE'
          },
          {
            id: 1000,
            type: 'device',
            title: '#S23W1D',
            subtitle: 'Microcontroller',
            status: 'OFFLINE'
          }
        ];

        // Combinamos lo real con lo de mentira
        this.results = [...data, ...mockDevices];
        // --------------------------------
        
      } catch (err) {
        this.error = 'Error';
      } finally {
        this.isLoading = false;
      }
    }
  }
});