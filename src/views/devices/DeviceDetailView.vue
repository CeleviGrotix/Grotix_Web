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
        <div class="premium-panel hardware-info">
          <div class="panel-header mb-4">
            <h2 class="device-id">#{{ deviceStore.currentDevice.id }}</h2>
            <p class="subtitle">{{ deviceStore.currentDevice.model || 'Microcontroller' }}</p>
            <span :class="['premium-badge', getBadgeClass(deviceStore.currentDevice.status)]">{{ deviceStore.currentDevice.status || 'UNKNOWN' }}</span>
          </div>

          <div class="specs-grid">
            <div class="spec-item">
              <label>Zone ID</label>
              <div class="dark-box accent-blue">{{ deviceStore.currentDevice.zoneId || 'Unassigned' }}</div>
            </div>
            <div class="spec-item">
              <label>Model Name</label>
              <div class="dark-box">{{ deviceStore.currentDevice.model || 'N/A' }}</div>
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
        </div>

        <div class="premium-panel logs-panel">
          <div class="logs-header">
            <h3>Maintenance History</h3>
            <div class="badge-count">{{ deviceStore.currentLogs.length }} Logs</div>
          </div>
          
          <div class="logs-list">
            <div v-for="log in deviceStore.currentLogs" :key="log.id" class="premium-log-card">
              <div class="log-top">
                <h4 class="log-date">{{ formatDate(log.createdAt || log.timestamp) }}</h4>
                <span v-if="log.statusAfter" class="badge-mini">Target: {{ log.statusAfter }}</span>
              </div>
              <p class="log-desc">{{ log.action || log.description || 'No action recorded' }}</p>
            </div>
            <p v-if="deviceStore.currentLogs.length === 0" class="empty-logs">No maintenance logs found for this device.</p>
          </div>
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

const getBadgeClass = (status) => {
  const s = status ? status.toLowerCase() : '';
  if (s === 'online') return 'badge-success';
  if (s === 'maintenance') return 'badge-warning';
  return 'badge-danger';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  // 1. Si la fecha de Azure viene sin la "Z" de UTC, se la agregamos a la fuerza
  const safeDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const d = new Date(safeDateString);
  
  // 2. Formateamos a tu hora local de Perú (es-PE)
  return !isNaN(d) 
    ? d.toLocaleString('es-PE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true // Para que salga a.m. / p.m.
      }) 
    : 'N/A';
};
</script>

<style scoped>
.device-detail-wrapper { padding: 2.5rem; background-color: #0c0e14; min-height: 100vh; color: #f1f1f1; font-family: 'Inter', sans-serif;}

/* Header */
.detail-header { display: flex; align-items: center; gap: 2rem; margin-bottom: 3rem;}
.back-btn { background: none; border: none; color: white; font-size: 2.2rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: color 0.2s;}
.back-btn:hover { color: #10b981; }
.line-decorator { flex: 1; height: 3px; background: linear-gradient(90deg, #10b981, transparent); opacity: 0.8; border-radius: 4px; }

/* Layout Grid */
.content-layout { display: grid; grid-template-columns: 1fr 1.8fr; gap: 40px;}

/* Paneles Premium */
.premium-panel { background-color: #11131a; border-radius: 16px; padding: 2.5rem; border: 2px solid #1f2937; box-shadow: 0 10px 30px rgba(0,0,0,0.2); height: fit-content;}
.mb-4 { margin-bottom: 2.5rem; }

/* Info Card */
.device-id { font-size: 3rem; margin: 0 0 5px 0; font-weight: 900; color: #fff; letter-spacing: -1px;}
.subtitle { color: #a0aec0; margin: 0 0 15px 0; font-size: 1.1rem;}
.specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: 1 / -1; }
.spec-item label { display: block; font-size: 0.8rem; font-weight: 800; color: #6b7280; text-transform: uppercase; margin-bottom: 0.5rem; }
.dark-box { background-color: #0c0e14; border: 1px solid #2d3748; border-radius: 10px; padding: 14px 16px; color: #e2e8f0; font-weight: 600; font-size: 0.95rem;}
.mono-text { font-family: 'JetBrains Mono', monospace; }
.accent-blue { color: #60a5fa; border-color: rgba(96, 165, 250, 0.3); background: rgba(96, 165, 250, 0.05);}
.accent-green { color: #10b981; border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05);}

/* Logs Card */
.logs-panel { display: flex; flex-direction: column; max-height: 80vh; }
.logs-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1f2937; padding-bottom: 1.5rem; margin-bottom: 1.5rem;}
.logs-header h3 { margin: 0; font-size: 1.4rem; color: #fff; font-weight: 800;}
.badge-count { background: #1f2937; color: #a0aec0; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 800;}
.logs-list { overflow-y: auto; padding-right: 10px; display: flex; flex-direction: column; gap: 15px;}
.premium-log-card { background-color: #0c0e14; border-radius: 12px; padding: 1.5rem; border: 1px solid #2d3748; transition: border-color 0.2s;}
.premium-log-card:hover { border-color: #4b5563; }
.log-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;}
.log-date { color: #20c997; margin: 0; font-size: 1rem; font-weight: 700;}
.log-desc { color: #e2e8f0; font-size: 0.95rem; line-height: 1.6; margin: 0;}
.empty-logs { color: #6b7280; font-style: italic; text-align: center; padding: 2rem;}

/* Badges */
.premium-badge { padding: 6px 14px; border-radius: 8px; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-width: 1px; border-style: solid; display: inline-block;}
.badge-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.3);}
.badge-warning { background: rgba(234, 179, 8, 0.1); color: #eab308; border-color: rgba(234, 179, 8, 0.3);}
.badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);}
.badge-mini { border: 1px solid #4b5563; color: #9ca3af; padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;}

/* Scrollbar para los logs */
.logs-list::-webkit-scrollbar { width: 8px; }
.logs-list::-webkit-scrollbar-track { background: transparent; }
.logs-list::-webkit-scrollbar-thumb { background-color: #2d3748; border-radius: 10px; }

.loading-state, .error-state { text-align: center; padding: 5rem; color: #a0aec0; font-weight: 600;}
.spinner { width: 50px; height: 50px; border: 5px solid #1f2937; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;}
@keyframes spin { to { transform: rotate(360deg); } }
</style>