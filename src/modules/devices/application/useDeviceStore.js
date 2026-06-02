import { defineStore } from 'pinia';
import DeviceApi from '../infrastructure/DeviceApi';

export const useDeviceStore = defineStore('devices', {
  state: () => ({
    devicesList: [],
    currentDevice: null,
    currentLogs: [],
    isLoading: false,
    errorMessage: null,
  }),
  
  actions: {
    async fetchDevices() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await DeviceApi.getAllDevices();
        // Ajustamos al formato típico de listas en .NET
        this.devicesList = response.data.items || response.data || []; 
      } catch (error) {
        this.errorMessage = "Error al conectar con la base de datos.";
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDeviceDetails(id) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const deviceRes = await DeviceApi.getDeviceById(id);
        this.currentDevice = deviceRes.data;
        
        try {
            const logsRes = await DeviceApi.getMaintenanceLogs(id);
            this.currentLogs = logsRes.data.items || logsRes.data || [];
        } catch (e) {
            this.currentLogs = [];
        }
      } catch (error) {
        this.errorMessage = "Error al cargar los detalles.";
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },

    // AQUI ESTA LA MAGIA CORREGIDA 👇
    async saveLog(deviceId, payload) {
      try {
        // Pasamos el payload directamente, ¡sin envolverlo!
        await DeviceApi.createMaintenanceLog(deviceId, payload);
        await this.fetchDeviceDetails(deviceId); 
      } catch (error) {
        console.error("Error en el Store al guardar el log:", error);
        throw error;
      }
    },

    async changeStatus(id, newStatus) {
      try {
        // En base a tu swagger, enviamos el status
        await DeviceApi.updateDeviceStatus(id, { status: newStatus });
        await this.fetchDevices(); 
      } catch (error) {
        console.error("Error en el Store al cambiar status:", error);
        throw error;
      }
    }
  }
});