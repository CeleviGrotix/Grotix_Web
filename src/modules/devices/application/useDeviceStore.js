import { defineStore } from 'pinia';
import DeviceApi from '../infrastructure/DeviceApi';

const StatusMap = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  MAINTENANCE: 'Maintenance',
};

export const useDeviceStore = defineStore('devices', {
  state: () => ({
    devicesList: [],
    currentDevice: null,
    currentLogs: [],
    isLoading: false,
    isUpdatingStatus: false,
    errorMessage: null,
  }),

  actions: {
    async fetchDevices() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const { data } = await DeviceApi.getAllDevices();
        this.devicesList = data.items ?? data ?? [];
      } catch (error) {
        this.errorMessage = 'Error al conectar con el servidor.';
        console.error('[fetchDevices]', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDeviceDetails(id) {
      this.isLoading = true;
      this.errorMessage = null;
      this.currentDevice = null;
      this.currentLogs = [];
      try {
        const [deviceRes, logsRes] = await Promise.allSettled([
          DeviceApi.getDeviceById(id),
          DeviceApi.getMaintenanceLogs(id),
        ]);

        if (deviceRes.status === 'fulfilled') {
          this.currentDevice = deviceRes.value.data;
        } else {
          throw deviceRes.reason;
        }

        this.currentLogs =
          logsRes.status === 'fulfilled'
            ? (logsRes.value.data.items ?? logsRes.value.data ?? [])
            : [];
      } catch (error) {
        this.errorMessage = 'Error al cargar los detalles del dispositivo.';
        console.error('[fetchDeviceDetails]', error);
      } finally {
        this.isLoading = false;
      }
    },

    async changeStatus(id, newStatus) {
      const idStr = String(id);
      const formatted = StatusMap[String(newStatus).toUpperCase()] ?? StatusMap.OFFLINE;
      const payload = {
        status: formatted,
        lastSeen: new Date().toISOString(),
      };

      console.log('[changeStatus] Enviando PATCH | id:', idStr, '| status:', formatted);

      this.isUpdatingStatus = true;
      try {
        await DeviceApi.updateDeviceStatus(idStr, payload);
        console.log('[changeStatus] PATCH exitoso, refrescando lista...');
        await this.fetchDevices();
        console.log('[changeStatus] Lista refrescada OK');
      } catch (error) {
        console.error('[changeStatus] ERROR:', error?.response?.data ?? error.message ?? error);
        throw error;
      } finally {
        this.isUpdatingStatus = false;
      }
    },

    // ── LA CORRECCIÓN ESTÁ AQUÍ 👇 ──
    async saveLogAndChangeStatus(deviceId, logPayload) {
      const idStr = String(deviceId);
      
      // Traducimos de "OFFLINE" a "Offline"
      const formatted = StatusMap[String(logPayload.statusAfter).toUpperCase()] ?? StatusMap.OFFLINE;

      console.log('[saveLogAndChangeStatus] INICIO | device:', idStr, '| status:', formatted);

      try {
        // PASO 1: Crear el log
        console.log('[saveLogAndChangeStatus] Creando log...');
        
        // ¡OJO AQUÍ! Creamos un nuevo objeto asegurándonos de usar la palabra formateada ("Offline")
        const formattedLogPayload = {
            action: logPayload.action,
            statusAfter: formatted 
        };
        
        // Enviamos el objeto ya formateado
        await DeviceApi.createMaintenanceLog(idStr, formattedLogPayload);
        console.log('[saveLogAndChangeStatus] Log creado OK');

        // PASO 2: Cambiar el estado
        console.log('[saveLogAndChangeStatus] Enviando PATCH...');
        const patchPayload = {
          status: formatted,
          lastSeen: new Date().toISOString(),
        };
        await DeviceApi.updateDeviceStatus(idStr, patchPayload);
        console.log('[saveLogAndChangeStatus] PATCH exitoso');

        // PASO 3: Refrescar lista
        await this.fetchDevices();
        console.log('[saveLogAndChangeStatus] Lista refrescada OK');

      } catch (error) {
        console.error('[saveLogAndChangeStatus] ERROR:', error?.response?.data ?? error.message ?? error);
        throw error;
      }
    },

    async saveLog(deviceId, payload) {
      try {
        // En caso de que se llame por separado, también curamos en salud el texto aquí
        if (payload.statusAfter) {
            payload.statusAfter = StatusMap[String(payload.statusAfter).toUpperCase()] ?? StatusMap.OFFLINE;
        }
        await DeviceApi.createMaintenanceLog(String(deviceId), payload);
        console.log('[saveLog] Log creado OK');
      } catch (error) {
        console.error('[saveLog] ERROR:', error?.response?.data ?? error.message ?? error);
        throw error;
      }
    },
  },
});
