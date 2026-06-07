import { defineStore } from 'pinia';
import { axiosClient } from '@/shared/http/axiosClient';
import { useDeviceStore } from '@/modules/devices/application/useDeviceStore';

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

        // Quitamos los devices que vienen del backend (son los mockeados)
        const nonDeviceResults = data.filter(item => item.type !== 'device');

        // Traemos los devices reales del store
        const deviceStore = useDeviceStore();
        await deviceStore.fetchDevices();

        const realDevices = deviceStore.devicesList
          .filter(d => {
            if (!term) return true;
            const q = term.toLowerCase();
            return (
              String(d.id).toLowerCase().includes(q) ||
              (d.model || '').toLowerCase().includes(q) ||
              (d.status || '').toLowerCase().includes(q)
            );
          })
          .map(d => ({
            id: d.id,
            type: 'device',
            title: `#${d.id}`,
            subtitle: d.model || 'Microcontroller',
            status: d.status ?? 'UNKNOWN',
            lastMaintenance: d.lastMaintenance ?? null
          }));

        // Solo resultados no-device del backend + devices reales del store
        this.results = [...nonDeviceResults, ...realDevices];

      } catch (err) {
        this.error = 'Error';
      } finally {
        this.isLoading = false;
      }
    }
  }
});
