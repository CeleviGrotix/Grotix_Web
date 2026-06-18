import { defineStore } from 'pinia';
import DeviceApi from '../infrastructure/DeviceApi';
import { ContractsApi } from '@/modules/contracts/infrastructure/ContractsApi';
import { FarmApi } from '@/modules/farms/infrastructure/FarmApi';
import { ZoneApi } from '@/modules/farms/infrastructure/ZoneApi';

const StatusMap = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  MAINTENANCE: 'Maintenance',
};

export const useDeviceStore = defineStore('devices', {
  state: () => ({
    devicesList: [],
    associationsForFilter: [],
    currentDevice: null,
    currentLogs: [],
    logsError: null,
    isLoading: false,
    isUpdatingStatus: false,
    errorMessage: null,
  }),

  actions: {
    normalizeDevice(raw) {
      return {
        ...raw,
        id: raw.deviceId ?? raw.id,
      };
    },

    normalizeLog(raw) {
      return {
        ...raw,
        id: raw.logId ?? raw.id,
      };
    },

    enrichDevice(device, zoneById) {
      if (!device.zoneId) {
        return {
          ...device,
          associationId: null,
          associationName: null,
          zoneName: null,
          farmName: null,
        };
      }

      const placement = zoneById.get(String(device.zoneId));
      return {
        ...device,
        associationId: placement?.associationId ?? null,
        associationName: placement?.associationName ?? null,
        zoneName: placement?.zoneName ?? null,
        farmName: placement?.farmName ?? null,
      };
    },

    async buildDevicePlacementContext() {
      const [associations, farms] = await Promise.all([
        ContractsApi.getAssociations(),
        FarmApi.listAll(),
      ]);

      const associationNameById = new Map(
        associations.map((a) => [String(a.id), a.name]),
      );

      const zoneGroups = await Promise.all(
        farms.map(async (farm) => {
          const zones = await ZoneApi.listByFarm(farm.id);
          const associationId = farm.associationId ?? farm.associationID;
          const associationName =
            associationNameById.get(String(associationId)) ??
            (associationId ? `Association #${associationId}` : null);

          return zones.map((zone) => ({
            zoneId: zone.id,
            zoneName: zone.name,
            farmId: farm.id,
            farmName: farm.name,
            associationId,
            associationName,
          }));
        }),
      );

      const zoneById = new Map();
      zoneGroups.flat().forEach((entry) => {
        zoneById.set(String(entry.zoneId), entry);
      });

      return {
        associations: associations
          .map((a) => ({ id: a.id, name: a.name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        zoneById,
      };
    },

    async fetchDevices() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const [devicesRes, context] = await Promise.all([
          DeviceApi.getAllDevices(),
          this.buildDevicePlacementContext(),
        ]);
        const list = devicesRes.data.items ?? devicesRes.data ?? [];
        this.associationsForFilter = context.associations;
        this.devicesList = list
          .map((d) => this.normalizeDevice(d))
          .map((d) => this.enrichDevice(d, context.zoneById));
      } catch (error) {
        this.errorMessage = 'Error al conectar con el servidor.';
        console.error('[fetchDevices]', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDeviceDetails(id) {
      const deviceId = Number(id);
      if (!Number.isFinite(deviceId) || deviceId <= 0) {
        this.errorMessage = 'Invalid device id.';
        return;
      }

      this.isLoading = true;
      this.errorMessage = null;
      this.logsError = null;
      this.currentDevice = null;
      this.currentLogs = [];
      try {
        const [deviceRes, logsRes] = await Promise.allSettled([
          DeviceApi.getDeviceById(deviceId),
          DeviceApi.getMaintenanceLogs(deviceId),
        ]);

        if (deviceRes.status === 'fulfilled') {
          const data = deviceRes.value.data;
          this.currentDevice = {
            ...data,
            id: data.deviceId ?? data.id,
            sensors: data.sensors ?? [],
            actuators: data.actuators ?? [],
          };
        } else {
          throw deviceRes.reason;
        }

        if (logsRes.status === 'fulfilled') {
          const logs = logsRes.value.data.items ?? logsRes.value.data ?? [];
          this.currentLogs = logs.map((l) => this.normalizeLog(l));
        } else {
          this.logsError = 'Could not load maintenance logs.';
          console.warn('[fetchDeviceDetails] maintenance logs failed', logsRes.reason);
        }
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
