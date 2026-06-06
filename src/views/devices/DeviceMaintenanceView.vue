<template>
  <div class="devices-page-wrapper">
    <header class="page-header">
      <div class="header-content">
        <div class="line-decorator reverse"></div>
        <h2>Devices</h2>
        <div class="line-decorator"></div>
      </div>
      
      <div class="tabs-container">
        <button @click="$router.push('/devices')">LIST</button>
        <button @click="$router.push('/devices/logbook')">LOGBOOK</button>
        <button class="active">MAINTENANCE</button>
      </div>
    </header>

    <div v-if="deviceStore.isLoading" class="loading-state"><div class="spinner"></div></div>
    <div v-else-if="deviceStore.errorMessage" class="error-state">{{ deviceStore.errorMessage }}</div>

    <div v-else class="devices-grid">
      <div v-for="device in deviceStore.devicesList" :key="device.id" class="device-card">
        <div class="card-header">
          <h3>#{{ device.id }}</h3>
          <span :class="['badge', device.status.toLowerCase() === 'online' ? 'badge-success' : 'badge-danger']">
            {{ device.status }}
          </span>
        </div>
        <p class="subtitle">{{ device.model || 'Microcontroller' }}</p>
        
        <p class="last-seen">Last maintenance: {{ formatDate(device.lastSeen) || 'N/A' }}</p>
        
        <div class="maintenance-actions">
          <button 
            v-if="device.status.toLowerCase() !== 'maintenance'" 
            class="btn-start"
            @click="toggleMaintenance(device.id, 'MAINTENANCE')">
            START MAINTENANCE
          </button>
          <button 
            v-else 
            class="btn-end"
            @click="toggleMaintenance(device.id, 'ONLINE')">
            END MAINTENANCE
          </button>
        </div>
      </div>
      
      <p v-if="deviceStore.devicesList.length === 0" class="empty-msg">No hay dispositivos registrados.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useDeviceStore } from '@/modules/devices/application/useDeviceStore';

const deviceStore = useDeviceStore();

onMounted(() => {
  deviceStore.fetchDevices();
});

const toggleMaintenance = async (id, newStatus) => {
  try {
    await deviceStore.changeStatus(id, newStatus);
  } catch (error) {
    alert("Hubo un error al cambiar el estado.");
  }
};

const formatDate = (dateString) => {
  if(!dateString) return null;
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.devices-page-wrapper { padding: 2rem; background-color: #0f111a; min-height: 100vh; color: #fff; font-family: 'Inter', sans-serif;}
.page-header { margin-bottom: 2rem; }
.header-content { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-bottom: 1.5rem; }
.header-content h2 { font-size: 2.2rem; font-weight: 800; margin: 0; }
.line-decorator { flex: 1; height: 2px; background: linear-gradient(90deg, #10b981, transparent); opacity: 0.7;}
.line-decorator.reverse { background: linear-gradient(270deg, #10b981, transparent);}
.tabs-container { display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #2d3748; padding-bottom: 20px; position: relative;}
.tabs-container button { background: transparent; border: 1px solid #fff; color: #fff; padding: 8px 24px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.3s;}
.tabs-container button:hover { background: rgba(255,255,255,0.1); }
.tabs-container button.active { background-color: #1a4d4e; border-color: #1a4d4e; color: #20c997; }
.devices-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;}
.device-card { background-color: #161819; border-radius: 12px; padding: 1.5rem; border: 1px solid transparent;}
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-header h3 { margin: 0; font-size: 1.2rem; }
.subtitle { color: #a0aec0; font-size: 0.85rem; margin: 5px 0 25px 0; }
.last-seen { font-size: 0.8rem; color: #a0aec0; margin: 0; }
.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; }
.badge-success { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981;}
.badge-danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444;}
.maintenance-actions { display: flex; justify-content: flex-end; margin-top: 15px; }
.btn-start { background: transparent; border: none; color: #10b981; font-weight: bold; cursor: pointer; }
.btn-end { background: #3182ce; border: none; color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.loading-state, .error-state, .empty-msg { text-align: center; padding: 3rem; color: #a0aec0;}
.spinner { width: 40px; height: 40px; border: 4px solid #2d3748; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;}
@keyframes spin { to { transform: rotate(360deg); } }
</style>