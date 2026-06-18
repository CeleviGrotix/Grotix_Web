import { axiosClient } from '@/shared/http/axiosClient';

export default {
  getAllDevices(params = {}) {
    return axiosClient.get('/api/v1/hardware/devices', { params });
  },

  getDevicesByZone(zoneId) {
    return axiosClient.get(`/api/v1/hardware/zones/${zoneId}/devices`);
  },

  getDeviceById(id) {
    return axiosClient.get(`/api/v1/hardware/devices/${id}`);
  },

  getSensorCatalog() {
    return axiosClient.get('/api/v1/hardware/sensors/catalog');
  },

  createDevice(payload) {
    return axiosClient.post('/api/v1/hardware/devices', payload);
  },

  patchDevice(id, payload) {
    return axiosClient.patch(`/api/v1/hardware/devices/${id}`, payload);
  },

  deleteDevice(id) {
    return axiosClient.delete(`/api/v1/hardware/devices/${id}`);
  },

  linkToZone(deviceId, zoneId) {
    return axiosClient.post(`/api/v1/hardware/devices/${deviceId}/link-to-zone/${zoneId}`);
  },

  unlinkFromZone(deviceId, zoneId) {
    return axiosClient.delete(`/api/v1/hardware/devices/${deviceId}/unlink-from-zone/${zoneId}`);
  },

  addSensor(deviceId, payload) {
    return axiosClient.post(`/api/v1/hardware/devices/${deviceId}/sensors`, payload);
  },

  addActuator(deviceId, payload) {
    return axiosClient.post(`/api/v1/hardware/devices/${deviceId}/actuators`, payload);
  },

  deleteSensor(deviceId, sensorId) {
    return axiosClient.delete(`/api/v1/hardware/devices/${deviceId}/sensors/${sensorId}`);
  },

  deleteActuator(deviceId, actuatorId) {
    return axiosClient.delete(`/api/v1/hardware/devices/${deviceId}/actuators/${actuatorId}`);
  },

  getMaintenanceLogs(deviceId) {
    return axiosClient.get(`/api/v1/hardware/devices/${deviceId}/maintenance-logs`);
  },

  createMaintenanceLog(deviceId, logData) {
    return axiosClient.post(`/api/v1/hardware/devices/${deviceId}/maintenance-logs`, logData);
  },

  updateDeviceStatus(id, payload) {
    return axiosClient.patch(`/api/v1/hardware/devices/${id}/status`, payload);
  },
};
