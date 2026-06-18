<template>
  <div class="page-container">
    <div v-if="isLoadingPage" class="loading-msg">Loading zone...</div>

    <template v-else-if="zone">
      <header class="back-header" @click="goBack">
        <h1>Zone: {{ zone.name }}</h1>
      </header>

      <div class="header-card">
        <div class="zone-icon">🌱</div>
        <div>
          <h2 class="zone-title">{{ zone.name }}</h2>
          <p class="zone-subtitle">
            {{ cropLabel(zone.cropId) }} · {{ zone.irrigationMode || 'AUTOMATIC' }}
          </p>
          <p class="zone-coords">{{ zone.latitude }}, {{ zone.longitude }}</p>
        </div>
      </div>

      <div class="dashboard-column">
        <div class="form-card">
          <h3 class="section-title">1. Zone Settings</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Name</label>
              <input type="text" class="dark-input" v-model="zoneForm.name" />
            </div>
            <div class="form-group">
              <label>Crop</label>
              <select class="dark-input" v-model.number="zoneForm.cropId">
                <option :value="0" disabled>Select crop</option>
                <option v-for="crop in crops" :key="crop.id" :value="crop.id">
                  {{ crop.commonName }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Irrigation Mode</label>
              <select class="dark-input" v-model="zoneForm.irrigationMode">
                <option value="AUTOMATIC">Automatic</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
          </div>
          <p v-if="zoneSaveError" class="error-text">{{ zoneSaveError }}</p>
          <GtxButton class="mt-3" :disabled="isSavingZone" @click="saveZoneSettings">
            {{ isSavingZone ? 'SAVING...' : 'SAVE ZONE' }}
          </GtxButton>
        </div>

        <div class="form-card">
          <h3 class="section-title">2. Microcontrollers</h3>
          <p class="subtitle">
            Click a device to manage sensors and actuators.
            <span v-if="mcuLimitLabel"> ({{ mcuLimitLabel }})</span>
          </p>

          <div v-if="isLoadingDevices" class="devices-loading">
            <div class="spinner"></div>
            <p>Loading devices...</p>
          </div>
          <div v-else-if="devices.length === 0" class="empty-msg">
            No microcontrollers in this zone yet.
          </div>
          <div v-else class="devices-list">
            <div
              v-for="device in devices"
              :key="device.id"
              class="device-row"
              @click="goToDevice(device)"
            >
              <div>
                <p class="device-title">#{{ device.id }} · {{ device.model || 'MCU' }}</p>
                <p class="device-meta">
                  {{ device.macAddress }} ·
                  <span :class="statusClass(device.status)">{{ device.status || 'UNKNOWN' }}</span>
                  · {{ device.sensorCount ?? 0 }} sensors · {{ device.actuatorCount ?? 0 }} actuators
                </p>
              </div>
              <span class="arrow">→</span>
            </div>
          </div>

          <div v-if="!canAddDevice" class="limit-msg">{{ mcuLimitMessage }}</div>

          <div v-else class="add-device-section">
            <h4 class="admin-title">Register new microcontroller</h4>
            <div class="form-grid register-form-grid">
              <div class="form-group">
                <label>Model</label>
                <input type="text" class="dark-input" v-model="newDevice.model" placeholder="ESP32" />
              </div>
              <div class="form-group">
                <label>MAC Address</label>
                <input type="text" class="dark-input" v-model="newDevice.macAddress" placeholder="AA:BB:CC:DD:EE:FF" />
              </div>
            </div>
            <p v-if="deviceError" class="error-text">{{ deviceError }}</p>
            <div class="form-actions">
              <GtxButton :disabled="isCreatingDevice" @click="registerDevice">
                {{ isCreatingDevice ? 'REGISTERING...' : 'REGISTER MCU IN ZONE' }}
              </GtxButton>
            </div>

            <div v-if="unassignedDevices.length" class="assign-block">
              <h4 class="admin-title">Or assign existing unassigned device</h4>
              <div class="assign-row">
                <select class="dark-input" v-model.number="assignDeviceId">
                  <option :value="0">Select device</option>
                  <option v-for="d in unassignedDevices" :key="d.id" :value="d.id">
                    #{{ d.id }} · {{ d.model }} · {{ d.macAddress }}
                  </option>
                </select>
              </div>
              <div class="form-actions">
                <GtxButton :disabled="!assignDeviceId || isLinking" @click="linkExistingDevice">
                  {{ isLinking ? 'LINKING...' : 'ASSIGN TO ZONE' }}
                </GtxButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="loading-msg">Zone not found.</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useContractsStore } from '@/modules/contracts/application/useContractsStore';
import { CatalogApi } from '@/modules/catalog/infrastructure/CatalogApi';
import { ZoneApi } from '@/modules/farms/infrastructure/ZoneApi';
import DeviceApi from '@/modules/devices/infrastructure/DeviceApi';
import GtxButton from '@/shared/ui/GtxButton.vue';

const route = useRoute();
const router = useRouter();
const contractsStore = useContractsStore();

let loadGeneration = 0;

const associationId = computed(() => route.params.id);
const zoneId = computed(() => {
  const parsed = Number(route.params.zoneId);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});

const zone = ref(null);
const crops = ref([]);
const devices = ref([]);
const unassignedDevices = ref([]);
const orgDeviceCount = ref(0);

const isLoadingPage = ref(true);
const isLoadingDevices = ref(false);
const isSavingZone = ref(false);
const isCreatingDevice = ref(false);
const isLinking = ref(false);
const zoneSaveError = ref(null);
const deviceError = ref(null);

const assignDeviceId = ref(0);
const newDevice = ref({ model: 'ESP32', macAddress: '' });

const zoneForm = ref({
  name: '',
  cropId: 0,
  irrigationMode: 'AUTOMATIC',
});

const association = computed(() => contractsStore.currentAssociation);

const maxMcusAllowed = computed(() => {
  if (!association.value?.hasActiveContract) return null;
  return Number(association.value.maxMicrocontrollers) || 0;
});

const mcuLimitLabel = computed(() => {
  if (maxMcusAllowed.value == null) return null;
  return `${orgDeviceCount.value} / ${maxMcusAllowed.value} MCUs (association)`;
});

const canAddDevice = computed(() => {
  if (maxMcusAllowed.value == null) return true;
  return orgDeviceCount.value < maxMcusAllowed.value;
});

const mcuLimitMessage = computed(() => {
  if (maxMcusAllowed.value == null) return '';
  if (orgDeviceCount.value >= maxMcusAllowed.value) {
    return `Microcontroller limit reached (${maxMcusAllowed.value}). Update the contract to allow more.`;
  }
  return '';
});

const cropLabel = (cropId) => {
  const crop = crops.value.find((c) => String(c.id) === String(cropId));
  return crop?.commonName || `Crop #${cropId}`;
};

const statusClass = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'ONLINE') return 'status-online';
  if (s === 'OFFLINE') return 'status-offline';
  return 'status-unknown';
};

const normalizeDevice = (raw) => ({
  id: raw.deviceId ?? raw.id,
  zoneId: raw.zoneId,
  model: raw.model,
  macAddress: raw.macAddress,
  status: raw.status,
  lastSeen: raw.lastSeen,
  sensorCount: raw.sensorCount,
  actuatorCount: raw.actuatorCount,
});

const loadOrgDeviceStats = async (farmId) => {
  if (!farmId) return;
  const zones = await ZoneApi.listByFarm(farmId);
  const zoneIds = new Set(zones.map((z) => z.id));
  const { data } = await DeviceApi.getAllDevices();
  const list = (data.items ?? data ?? []).map(normalizeDevice);
  orgDeviceCount.value = list.filter((d) => d.zoneId && zoneIds.has(d.zoneId)).length;
  unassignedDevices.value = list.filter((d) => !d.zoneId);
};

const loadZoneDevices = async (targetZoneId) => {
  if (!targetZoneId) return;
  isLoadingDevices.value = true;
  deviceError.value = null;
  try {
    const { data } = await DeviceApi.getDevicesByZone(targetZoneId);
    devices.value = (data.items ?? data ?? []).map(normalizeDevice);
  } catch (err) {
    deviceError.value = err.response?.data?.message || 'Failed to load devices.';
  } finally {
    isLoadingDevices.value = false;
  }
};

const loadPage = async () => {
  const generation = ++loadGeneration;
  const currentAssociationId = route.params.id;
  const currentZoneId = Number(route.params.zoneId);

  if (!Number.isFinite(currentZoneId) || currentZoneId <= 0) {
    zone.value = null;
    isLoadingPage.value = false;
    return;
  }

  isLoadingPage.value = true;
  try {
    await contractsStore.loadAssociationById(currentAssociationId);
    if (generation !== loadGeneration) return;

    await contractsStore.loadFarmForAssociation(currentAssociationId);
    if (generation !== loadGeneration) return;

    if (contractsStore.currentFarm?.id) {
      await contractsStore.loadZonesForFarm(contractsStore.currentFarm.id);
    }
    if (generation !== loadGeneration) return;

    const [zoneData, cropData] = await Promise.all([
      ZoneApi.getById(currentZoneId),
      CatalogApi.getCrops().catch(() => []),
    ]);
    if (generation !== loadGeneration) return;

    zone.value = zoneData;
    crops.value = cropData;
    zoneForm.value = {
      name: zoneData.name || '',
      cropId: zoneData.cropId || 0,
      irrigationMode: zoneData.irrigationMode || 'AUTOMATIC',
    };

    await Promise.all([
      loadZoneDevices(currentZoneId),
      loadOrgDeviceStats(contractsStore.currentFarm?.id),
    ]);
  } catch {
    if (generation === loadGeneration) zone.value = null;
  } finally {
    if (generation === loadGeneration) isLoadingPage.value = false;
  }
};

onMounted(loadPage);

onUnmounted(() => {
  loadGeneration += 1;
});

const goBack = () => {
  router.push({ name: 'contract-detail', params: { id: associationId.value } });
};

const goToDevice = (device) => {
  const id = device.deviceId ?? device.id;
  if (!id) return;
  router.push({
    name: 'device-detail',
    params: { deviceId: String(id) },
    query: {
      from: 'zone',
      associationId: String(associationId.value),
      zoneId: String(zoneId.value),
    },
  });
};

const saveZoneSettings = async () => {
  if (!zoneId.value) return;
  zoneSaveError.value = null;
  isSavingZone.value = true;
  try {
    const updated = await ZoneApi.updateZone(zoneId.value, {
      name: zoneForm.value.name.trim(),
      cropId: zoneForm.value.cropId || undefined,
      irrigationMode: zoneForm.value.irrigationMode,
    });
    zone.value = updated;
  } catch (err) {
    zoneSaveError.value = err.response?.data?.message || 'Failed to update zone.';
  } finally {
    isSavingZone.value = false;
  }
};

const registerDevice = async () => {
  if (!zoneId.value) return;
  const model = newDevice.value.model.trim();
  const macAddress = newDevice.value.macAddress.trim();
  if (!model || !macAddress) {
    deviceError.value = 'Model and MAC address are required.';
    return;
  }
  if (!canAddDevice.value) return;

  isCreatingDevice.value = true;
  deviceError.value = null;
  try {
    await DeviceApi.createDevice({ zoneId: zoneId.value, model, macAddress });
    newDevice.value.macAddress = '';
    await Promise.all([
      loadZoneDevices(zoneId.value),
      loadOrgDeviceStats(contractsStore.currentFarm?.id),
    ]);
  } catch (err) {
    deviceError.value = err.response?.data?.message || 'Failed to register device.';
  } finally {
    isCreatingDevice.value = false;
  }
};

const linkExistingDevice = async () => {
  if (!zoneId.value || !assignDeviceId.value || !canAddDevice.value) return;
  isLinking.value = true;
  deviceError.value = null;
  try {
    await DeviceApi.linkToZone(assignDeviceId.value, zoneId.value);
    assignDeviceId.value = 0;
    await Promise.all([
      loadZoneDevices(zoneId.value),
      loadOrgDeviceStats(contractsStore.currentFarm?.id),
    ]);
  } catch (err) {
    deviceError.value = err.response?.data?.message || 'Failed to assign device.';
  } finally {
    isLinking.value = false;
  }
};
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 960px;
  margin: 0 auto;
}

.back-header {
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.back-header h1 {
  color: #e5e7eb;
  font-size: 1.25rem;
  margin: 0;
}

.header-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #252a2d;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
}

.zone-icon { font-size: 2rem; }
.zone-title { color: white; margin: 0 0 0.25rem; }
.zone-subtitle, .zone-coords { color: #9ca3af; margin: 0; font-size: 0.9rem; }

.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-card {
  background: #1a1d1f;
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title { color: white; margin: 0 0 0.5rem; }
.subtitle { color: #9ca3af; margin: 0 0 1.25rem; font-size: 0.9rem; }

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.form-group label {
  display: block;
  color: #9ca3af;
  font-size: 0.8rem;
  margin-bottom: 0.35rem;
}

.dark-input {
  width: 100%;
  background: #252a2d;
  border: 1px solid #374151;
  border-radius: 8px;
  color: white;
  padding: 0.6rem 0.75rem;
}

.error-text { color: #f87171; font-size: 0.85rem; margin-top: 0.75rem; }
.loading-msg, .empty-msg { color: #9ca3af; padding: 0.5rem 0; }
.limit-msg { color: #fbbf24; margin: 1rem 0; font-size: 0.9rem; }

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.device-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: #252a2d;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.device-row:hover { background: #2a2f32; }

.device-title { color: white; font-weight: 600; margin: 0 0 0.25rem; }
.device-meta { color: #9ca3af; margin: 0; font-size: 0.85rem; }
.arrow { color: #60a5fa; font-size: 1.1rem; }

.admin-title { color: #e5e7eb; font-size: 0.95rem; margin: 0 0 1rem; }
.add-device-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #374151;
}
.register-form-grid { margin-bottom: 0.25rem; }
.form-actions { margin-top: 1.25rem; }
.assign-block { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px dashed #374151; }
.assign-row { display: flex; flex-wrap: wrap; align-items: center; }
.assign-row .dark-input { flex: 1; min-width: 200px; }

.devices-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 0 2rem;
  color: #9ca3af;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #374151;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.status-online { color: #4ade80; }
.status-offline { color: #f87171; }
.status-unknown { color: #9ca3af; }
.mt-3 { margin-top: 1rem; }
</style>
