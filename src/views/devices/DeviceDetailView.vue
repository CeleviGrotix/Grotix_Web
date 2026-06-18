<template>
  <div class="device-detail-wrapper">
    <div v-if="deviceStore.isLoading" class="loading-state"><div class="spinner"></div></div>
    <div v-else-if="deviceStore.errorMessage" class="error-state">{{ deviceStore.errorMessage }}</div>

    <div v-else-if="deviceStore.currentDevice" class="detail-container">
      <header class="detail-header">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M15 18l-6-6 6-6"></path></svg>
          Device #{{ deviceStore.currentDevice.id }}
        </button>
        <div class="line-decorator"></div>
      </header>

      <div class="content-layout">
        <!-- Columna izquierda: info general + mantenimiento -->
        <div class="left-column">
          <div class="premium-panel hardware-info">
            <div class="panel-header mb-4">
              <h2 class="device-title">{{ deviceStore.currentDevice.model || 'Microcontroller' }}</h2>
              <span :class="['premium-badge', getBadgeClass(deviceStore.currentDevice.status)]">
                {{ deviceStore.currentDevice.status || 'UNKNOWN' }}
              </span>
            </div>

            <div class="specs-grid">
              <div class="spec-item">
                <label>Zone ID</label>
                <div class="dark-box accent-blue">{{ deviceStore.currentDevice.zoneId || 'Unassigned' }}</div>
              </div>
              <div class="spec-item full-width">
                <label>MAC Address</label>
                <div class="dark-box mono-text">{{ deviceStore.currentDevice.macAddress || 'N/A' }}</div>
              </div>
              <div class="spec-item full-width">
                <label>Last Seen</label>
                <div class="dark-box accent-green">{{ formatDate(deviceStore.currentDevice.lastSeen) }}</div>
              </div>
            </div>

            <div class="edit-block">
              <h3 class="block-title">Edit device</h3>
              <div class="edit-grid">
                <div class="spec-item">
                  <label>Model</label>
                  <input type="text" class="field-input" v-model="editForm.model" />
                </div>
                <div class="spec-item">
                  <label>MAC Address</label>
                  <input type="text" class="field-input mono-text" v-model="editForm.macAddress" />
                </div>
              </div>
              <button class="action-btn" :disabled="isSavingDevice" @click="saveDeviceEdit">
                {{ isSavingDevice ? 'Saving...' : 'Save changes' }}
              </button>
              <button
                v-if="deviceStore.currentDevice.zoneId"
                class="action-btn danger-outline"
                :disabled="isUnlinking"
                @click="unlinkFromZone"
              >
                {{ isUnlinking ? 'Removing...' : 'Remove from zone' }}
              </button>
            </div>
          </div>

          <div class="premium-panel logs-panel">
            <div class="logs-header">
              <h3>Maintenance History</h3>
              <div class="badge-count">{{ deviceStore.currentLogs.length }} Logs</div>
            </div>
            <p v-if="logsError" class="logs-error">{{ logsError }}</p>

            <div class="logs-list">
              <div v-for="log in deviceStore.currentLogs" :key="log.id" class="premium-log-card">
                <div class="log-top">
                  <h4 class="log-date">{{ formatDate(log.timestamp || log.createdAt) }}</h4>
                  <span v-if="log.statusAfter" class="badge-mini">Target: {{ log.statusAfter }}</span>
                </div>
                <p class="log-desc">{{ log.action || log.description || 'No action recorded' }}</p>
              </div>
              <p v-if="!logsError && deviceStore.currentLogs.length === 0" class="empty-logs">
                No maintenance logs found for this device.
              </p>
            </div>
          </div>
        </div>

        <!-- Columna derecha: sensores y actuadores -->
        <div class="right-column">
          <div class="premium-panel hw-panel">
            <h3 class="block-title">Sensors</h3>
            <div v-if="deviceStore.currentDevice.sensors?.length" class="hw-list">
              <div
                v-for="sensor in deviceStore.currentDevice.sensors"
                :key="sensor.sensorId"
                class="hw-item"
              >
                <div>
                  <span class="hw-name">{{ sensor.type }}</span>
                  <span class="hw-detail">{{ sensor.model }} · Pin {{ sensor.pin }} · {{ sensor.unit }}</span>
                </div>
                <button class="remove-btn" @click="removeSensor(sensor.sensorId)">×</button>
              </div>
            </div>
            <p v-else class="empty-hw">No sensors registered.</p>

            <div class="add-block">
              <p class="add-label">Add sensor</p>
              <div class="edit-grid">
                <div class="spec-item">
                  <label>Model</label>
                  <select class="field-input" v-model="sensorForm.model" @change="onSensorModelChange">
                    <option value="">Select model</option>
                    <option v-for="m in catalogModels" :key="m.model" :value="m.model">{{ m.model }}</option>
                  </select>
                </div>
                <div class="spec-item">
                  <label>Type</label>
                  <select class="field-input" v-model="sensorForm.type">
                    <option value="">Select type</option>
                    <option v-for="t in typesForModel(sensorForm.model)" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div class="spec-item">
                  <label>Unit</label>
                  <input type="text" class="field-input" v-model="sensorForm.unit" />
                </div>
                <div class="spec-item">
                  <label>Pin</label>
                  <input type="number" class="field-input" v-model.number="sensorForm.pin" />
                </div>
              </div>
              <button class="action-btn" :disabled="hwSaving === 'sensor'" @click="addSensor">
                Add sensor
              </button>
            </div>
          </div>

          <div class="premium-panel hw-panel">
            <h3 class="block-title">Actuators</h3>
            <div v-if="deviceStore.currentDevice.actuators?.length" class="hw-list">
              <div
                v-for="actuator in deviceStore.currentDevice.actuators"
                :key="actuator.actuatorId"
                class="hw-item"
              >
                <div>
                  <span class="hw-name">{{ actuator.type }}</span>
                  <span class="hw-detail">Pin {{ actuator.pin }}</span>
                </div>
                <button class="remove-btn" @click="removeActuator(actuator.actuatorId)">×</button>
              </div>
            </div>
            <p v-else class="empty-hw">No actuators registered.</p>

            <div class="add-block">
              <p class="add-label">Add actuator</p>
              <div class="edit-grid">
                <div class="spec-item">
                  <label>Type</label>
                  <select class="field-input" v-model="actuatorForm.type">
                    <option value="">Select type</option>
                    <option v-for="t in actuatorTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div class="spec-item">
                  <label>Pin</label>
                  <input type="number" class="field-input" v-model.number="actuatorForm.pin" />
                </div>
              </div>
              <button class="action-btn" :disabled="hwSaving === 'actuator'" @click="addActuator">
                Add actuator
              </button>
            </div>
          </div>

          <p v-if="hwError" class="hw-error">{{ hwError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDeviceStore } from '@/modules/devices/application/useDeviceStore';
import DeviceApi from '@/modules/devices/infrastructure/DeviceApi';

const route = useRoute();
const router = useRouter();
const deviceStore = useDeviceStore();

const catalogModels = ref([]);
const editForm = ref({ model: '', macAddress: '' });
const sensorForm = ref({ model: '', type: '', unit: '', pin: 0 });
const actuatorForm = ref({ type: '', pin: 0 });

const isSavingDevice = ref(false);
const isUnlinking = ref(false);
const hwSaving = ref(null);
const hwError = ref(null);
const logsError = ref(null);

const actuatorTypes = ['VALVE', 'PUMP', 'IRRIGATION'];

const UNIT_BY_TYPE = {
  SOIL_MOISTURE: '%',
  AIR_TEMPERATURE: 'C',
  AIR_HUMIDITY: '%',
  LIGHT_INTENSITY: 'lux',
};

const resolvedDeviceId = computed(() => {
  const raw = route.params.deviceId ?? route.params.id;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});

const syncEditForm = () => {
  const d = deviceStore.currentDevice;
  if (!d) return;
  editForm.value = {
    model: d.model || '',
    macAddress: d.macAddress || '',
  };
};

const loadCatalog = async () => {
  try {
    const { data } = await DeviceApi.getSensorCatalog();
    catalogModels.value = data.models ?? [];
  } catch {
    catalogModels.value = [];
  }
};

const loadDevice = async () => {
  const id = resolvedDeviceId.value;
  if (!id) {
    deviceStore.errorMessage = 'Invalid device id.';
    return;
  }
  await deviceStore.fetchDeviceDetails(id);
  logsError.value = deviceStore.logsError;
  syncEditForm();
};

const refreshDevice = async () => {
  const id = resolvedDeviceId.value;
  if (!id) return;
  await deviceStore.fetchDeviceDetails(id);
  logsError.value = deviceStore.logsError;
  syncEditForm();
};

onMounted(async () => {
  await loadDevice();
  await loadCatalog();
});

watch(resolvedDeviceId, (id, prev) => {
  if (id && id !== prev) loadDevice();
});

watch(() => deviceStore.currentDevice, syncEditForm);

const typesForModel = (model) => {
  const entry = catalogModels.value.find((m) => m.model === model);
  return entry?.types ?? [];
};

const goBack = () => {
  const { from, associationId, zoneId } = route.query;
  if (from === 'zone' && associationId && zoneId) {
    router.push({
      name: 'zone-detail',
      params: { id: associationId, zoneId },
    });
    return;
  }
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/devices');
  }
};

const getBadgeClass = (status) => {
  const s = status ? status.toLowerCase() : '';
  if (s === 'online') return 'badge-success';
  if (s === 'maintenance') return 'badge-warning';
  return 'badge-danger';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const safeDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const d = new Date(safeDateString);
  return !isNaN(d)
    ? d.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : 'N/A';
};

const saveDeviceEdit = async () => {
  const id = resolvedDeviceId.value;
  if (!id) return;
  isSavingDevice.value = true;
  hwError.value = null;
  try {
    await DeviceApi.patchDevice(id, {
      model: editForm.value.model.trim(),
      macAddress: editForm.value.macAddress.trim(),
    });
    await refreshDevice();
  } catch (err) {
    hwError.value = err.response?.data?.message || 'Failed to update device.';
  } finally {
    isSavingDevice.value = false;
  }
};

const unlinkFromZone = async () => {
  const id = resolvedDeviceId.value;
  const zoneId = deviceStore.currentDevice?.zoneId;
  if (!id || !zoneId || !confirm('Remove this device from its zone?')) return;
  isUnlinking.value = true;
  hwError.value = null;
  try {
    await DeviceApi.unlinkFromZone(id, zoneId);
    await refreshDevice();
  } catch (err) {
    hwError.value = err.response?.data?.message || 'Failed to unlink device.';
  } finally {
    isUnlinking.value = false;
  }
};

const onSensorModelChange = () => {
  const types = typesForModel(sensorForm.value.model);
  sensorForm.value.type = types[0] || '';
  sensorForm.value.unit = UNIT_BY_TYPE[sensorForm.value.type] || '';
};

const addSensor = async () => {
  const id = resolvedDeviceId.value;
  const form = sensorForm.value;
  if (!id || !form.model || !form.type || !form.unit || !form.pin) {
    hwError.value = 'Complete all sensor fields.';
    return;
  }
  hwSaving.value = 'sensor';
  hwError.value = null;
  try {
    await DeviceApi.addSensor(id, {
      model: form.model,
      type: form.type,
      unit: form.unit,
      pin: form.pin,
    });
    sensorForm.value = { model: '', type: '', unit: '', pin: 0 };
    await refreshDevice();
  } catch (err) {
    hwError.value = err.response?.data?.message || 'Failed to add sensor.';
  } finally {
    hwSaving.value = null;
  }
};

const addActuator = async () => {
  const id = resolvedDeviceId.value;
  const form = actuatorForm.value;
  if (!id || !form.type || !form.pin) {
    hwError.value = 'Actuator type and pin are required.';
    return;
  }
  hwSaving.value = 'actuator';
  hwError.value = null;
  try {
    await DeviceApi.addActuator(id, { type: form.type, pin: form.pin });
    actuatorForm.value = { type: '', pin: 0 };
    await refreshDevice();
  } catch (err) {
    hwError.value = err.response?.data?.message || 'Failed to add actuator.';
  } finally {
    hwSaving.value = null;
  }
};

const removeSensor = async (sensorId) => {
  const id = resolvedDeviceId.value;
  if (!id || !confirm('Remove this sensor?')) return;
  hwError.value = null;
  try {
    await DeviceApi.deleteSensor(id, sensorId);
    await refreshDevice();
  } catch (err) {
    hwError.value = err.response?.data?.message || 'Failed to remove sensor.';
  }
};

const removeActuator = async (actuatorId) => {
  const id = resolvedDeviceId.value;
  if (!id || !confirm('Remove this actuator?')) return;
  hwError.value = null;
  try {
    await DeviceApi.deleteActuator(id, actuatorId);
    await refreshDevice();
  } catch (err) {
    hwError.value = err.response?.data?.message || 'Failed to remove actuator.';
  }
};
</script>

<style scoped>
.device-detail-wrapper { padding: 2.5rem; background-color: #0c0e14; min-height: 100vh; color: #f1f1f1; font-family: 'Inter', sans-serif;}

.detail-header { display: flex; align-items: center; gap: 2rem; margin-bottom: 3rem;}
.back-btn { background: none; border: none; color: white; font-size: 2.2rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: color 0.2s;}
.back-btn:hover { color: #10b981; }
.line-decorator { flex: 1; height: 3px; background: linear-gradient(90deg, #10b981, transparent); opacity: 0.8; border-radius: 4px; }

.content-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
.left-column, .right-column { display: flex; flex-direction: column; gap: 24px; }

.premium-panel { background-color: #11131a; border-radius: 16px; padding: 2rem; border: 2px solid #1f2937; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.mb-4 { margin-bottom: 2rem; }

.device-title { font-size: 2.5rem; margin: 0 0 15px 0; font-weight: 900; color: #fff; letter-spacing: -1px;}
.specs-grid, .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.full-width { grid-column: 1 / -1; }
.spec-item label { display: block; font-size: 0.75rem; font-weight: 800; color: #6b7280; text-transform: uppercase; margin-bottom: 0.5rem; }
.dark-box { background-color: #0c0e14; border: 1px solid #2d3748; border-radius: 10px; padding: 14px 16px; color: #e2e8f0; font-weight: 600; font-size: 0.95rem;}
.mono-text { font-family: 'JetBrains Mono', monospace; }
.accent-blue { color: #60a5fa; border-color: rgba(96, 165, 250, 0.3); background: rgba(96, 165, 250, 0.05);}
.accent-green { color: #10b981; border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05);}

.block-title { margin: 0 0 1rem; font-size: 1.1rem; color: #fff; font-weight: 800; }
.edit-block { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #1f2937; }
.field-input {
  width: 100%;
  background-color: #0c0e14;
  border: 1px solid #2d3748;
  border-radius: 10px;
  padding: 12px 14px;
  color: #e2e8f0;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.action-btn {
  margin-top: 1rem;
  margin-right: 0.75rem;
  background: #1e3a45;
  color: #5eead4;
  border: 1px solid #2dd4bf;
  border-radius: 8px;
  padding: 8px 18px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.85rem;
}
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.danger-outline { background: transparent; color: #fca5a5; border-color: #7f1d1d; }

.hw-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1rem; }
.hw-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0c0e14;
  border: 1px solid #2d3748;
  border-radius: 10px;
  padding: 12px 14px;
}
.hw-name { display: block; color: #fff; font-weight: 700; font-size: 0.9rem; }
.hw-detail { display: block; color: #9ca3af; font-size: 0.8rem; margin-top: 2px; }
.remove-btn {
  background: none;
  border: 1px solid #7f1d1d;
  color: #fca5a5;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
}
.empty-hw { color: #6b7280; font-style: italic; margin: 0 0 1rem; font-size: 0.9rem; }
.add-block { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed #2d3748; }
.add-label { color: #9ca3af; font-size: 0.85rem; margin: 0 0 0.75rem; }
.hw-error { color: #f87171; font-size: 0.9rem; margin: 0; }

.logs-panel { display: flex; flex-direction: column; max-height: 480px; }
.logs-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1f2937; padding-bottom: 1.5rem; margin-bottom: 1.5rem;}
.logs-header h3 { margin: 0; font-size: 1.4rem; color: #fff; font-weight: 800;}
.badge-count { background: #1f2937; color: #a0aec0; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 800;}
.logs-error { color: #fbbf24; font-size: 0.85rem; margin: 0 0 1rem; }
.logs-list { overflow-y: auto; padding-right: 10px; display: flex; flex-direction: column; gap: 15px; flex: 1; }
.premium-log-card { background-color: #0c0e14; border-radius: 12px; padding: 1.5rem; border: 1px solid #2d3748; }
.log-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;}
.log-date { color: #20c997; margin: 0; font-size: 1rem; font-weight: 700;}
.log-desc { color: #e2e8f0; font-size: 0.95rem; line-height: 1.6; margin: 0;}
.empty-logs { color: #6b7280; font-style: italic; text-align: center; padding: 2rem;}

.premium-badge { padding: 6px 14px; border-radius: 8px; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-width: 1px; border-style: solid; display: inline-block;}
.badge-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.3);}
.badge-warning { background: rgba(234, 179, 8, 0.1); color: #eab308; border-color: rgba(234, 179, 8, 0.3);}
.badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);}
.badge-mini { border: 1px solid #4b5563; color: #9ca3af; padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;}

.logs-list::-webkit-scrollbar { width: 8px; }
.logs-list::-webkit-scrollbar-thumb { background-color: #2d3748; border-radius: 10px; }

.loading-state, .error-state { text-align: center; padding: 5rem; color: #a0aec0; font-weight: 600;}
.spinner { width: 50px; height: 50px; border: 5px solid #1f2937; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1024px) {
  .content-layout { grid-template-columns: 1fr; }
  .logs-panel { max-height: none; }
}
</style>
