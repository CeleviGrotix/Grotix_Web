import { axiosClient } from '@/shared/http/axiosClient';

export default {
  // 1. Obtener todos los dispositivos
  getAllDevices() {
    return axiosClient.get('/api/v1/hardware/devices'); 
  },
  
  // 2. Obtener un dispositivo específico por ID
  getDeviceById(id) {
    return axiosClient.get(`/api/v1/hardware/devices/${id}`);
  },

  // 3. Obtener el historial de bitácoras (CORREGIDO según tu Swagger)
  getMaintenanceLogs(deviceId) {
    return axiosClient.get(`/api/v1/hardware/devices/${deviceId}/maintenance-logs`);
  },

  // 4. Crear una nueva bitácora (CORREGIDO según tu Swagger)
  createMaintenanceLog(deviceId, logData) {
    return axiosClient.post(`/api/v1/hardware/devices/${deviceId}/maintenance-logs`, logData);
  },

  // 5. Actualizar el estado del dispositivo (CORREGIDO según tu Swagger)
  updateDeviceStatus(id, payload) {
    return axiosClient.patch(`/api/v1/hardware/devices/${id}/status`, payload);
  }
};
