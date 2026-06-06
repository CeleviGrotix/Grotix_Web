<template>
  <div class="device-detail-wrapper">
    <div v-if="deviceStore.isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="deviceStore.errorMessage" class="error-state">
      {{ deviceStore.errorMessage }}
    </div>

    <div v-else-if="deviceStore.currentDevice" class="detail-container">
      <header class="detail-header">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 18l-6-6 6-6"></path></svg>
          Device #{{ deviceStore.currentDevice.id }}
        </button>
        <div class="line-decorator"></div>
      </header>

      <div class="content-layout">
        <div class="hardware-info-card">
          <h2 class="device-id">#{{ deviceStore.currentDevice.id }}</h2>
          <p class="subtitle">{{ deviceStore.currentDevice.model || 'Microcontroller' }}</p>
          <div class="info-group"><label class="blue-text">Zone ID</label><div class="dark-box">{{ deviceStore.currentDevice.zoneId || 'Unassigned' }}</div></div>
          <div class="info-group"><label class="green-text">Model</label><div class="dark-box">{{ deviceStore.currentDevice.model || 'N/A' }}</div></div>
          <div class="info-group"><label class="red-text">MAC Address</label><div class="dark-box">{{ deviceStore.currentDevice.macAddress || 'N/A' }}</div></div>
          
          <div class="info-group"><label class="green-text">Last Seen</label><div class="dark-box">{{ formatDate(deviceStore.currentDevice.lastSeen) }}</div></div>
          
          <div class="info-group">
            <label class="blue-text">Status</label>
            <div><span :class="['badge', getBadgeClass(deviceStore.currentDevice.status)]">{{ deviceStore.currentDevice.status || 'UNKNOWN' }}</span></div>
          </div>
        </div>

        <div class="logs-container">
          <h3 class="red-text mb-title">Maintenance Logs</h3>
          <div v-for="log in deviceStore.currentLogs" :key="log.id" class="log-card">
            <h4 class="log-date">{{ formatDate(log.createdAt || log.timestamp) }}</h4>
            <p class="log-desc">{{ log.action || log.description || 'No action recorded' }}</p>
            <span v-if="log.statusAfter" class="badge badge-outline mt-2">Status Set: {{ log.statusAfter }}</span>
          </div>
          <p v-if="deviceStore.currentLogs.length === 0" class="empty-logs">No maintenance logs found.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDeviceStore } from '@/modules/devices/application/useDeviceStore';

const route = useRoute();
const router = useRouter();
const deviceStore = useDeviceStore();

onMounted(() => {
  const deviceId = route.params.id;
  if (deviceId) deviceStore.fetchDeviceDetails(deviceId);
});

const goBack = () => router.push('/devices');

// Función unificada para los colores de estado
const getBadgeClass = (status) => {
  const s = status ? status.toLowerCase() : '';
  if (s === 'online') return 'badge-success';
  if (s === 'maintenance') return 'badge-warning';
  return 'badge-danger';
};

const formatDate = (dateString) => {
  if(!dateString) return 'N/A';
  const d = new Date(dateString);
  return !isNaN(d) ? d.toLocaleString() : 'N/A';
};
</script>

<style scoped>
.device-detail-wrapper { padding: 2rem; background-color: #0f111a; min-height: 100vh; color: #fff; font-family: 'Inter', sans-serif;}
.detail-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem;}
.back-btn { background: none; border: none; color: white; font-size: 1.8rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;}
.line-decorator { flex: 1; height: 2px; background: linear-gradient(90deg, #10b981, transparent); opacity: 0.7;}
.content-layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 30px;}
.hardware-info-card { background-color: #161819; border-radius: 12px; padding: 2rem; height: fit-content;}
.device-id { font-size: 2.2rem; margin: 0; font-weight: 800;}
.subtitle { color: #a0aec0; margin-bottom: 2rem; }
.info-group { margin-bottom: 1.5rem; }
.info-group label { display: block; font-size: 0.9rem; font-weight: bold; margin-bottom: 0.5rem; }
.blue-text { color: #3182ce; } .green-text { color: #10b981; } .red-text { color: #ef4444; }
.dark-box { background-color: #2d3748; border-radius: 6px; padding: 12px 16px; color: #e2e8f0; font-family: inherit;}
.mb-title { margin-top: 0; margin-bottom: 1.5rem; font-size: 1.2rem;}
.log-card { background-color: #161819; border-radius: 12px; padding: 1.5rem; margin-bottom: 15px; border: 1px solid #2d3748;}
.log-date { color: white; margin: 0 0 10px 0; font-size: 1rem;}
.log-desc { color: #a0aec0; font-size: 0.9rem; line-height: 1.6; margin: 0;}
.empty-logs { color: #a0aec0; font-style: italic; }

/* Estilos de Badges mejorados */
.badge { padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; }
.badge-success { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981;}
.badge-warning { background: rgba(234, 179, 8, 0.2); color: #eab308; border: 1px solid #eab308;}
.badge-danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444;}
.badge-outline { border: 1px solid #fff; color: #fff; font-size: 0.7rem;}

.mt-2 { margin-top: 10px; display: inline-block; }
.loading-state, .error-state { text-align: center; padding: 3rem; color: #a0aec0;}
.spinner { width: 40px; height: 40px; border: 4px solid #2d3748; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;}
@keyframes spin { to { transform: rotate(360deg); } }
</style>