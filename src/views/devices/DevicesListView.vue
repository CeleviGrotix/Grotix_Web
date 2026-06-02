<template>
  <div class="devices-page-wrapper">
    <header class="page-header">
      <div class="header-content">
        <div class="line-decorator reverse"></div>
        <h2>Devices</h2>
        <div class="line-decorator"></div>
      </div>
      
      <div class="tabs-container">
        <button :class="{ active: currentTab === 'LIST' }" @click="currentTab = 'LIST'">LIST</button>
        <button :class="{ active: currentTab === 'LOGBOOK' }" @click="currentTab = 'LOGBOOK'">LOGBOOK</button>
        <button :class="{ active: currentTab === 'MAINTENANCE' }" @click="currentTab = 'MAINTENANCE'">MAINTENANCE</button>
        <div class="icon-right">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6M9 8h6M17 16h6"></path></svg>
        </div>
      </div>
    </header>

    <div v-if="deviceStore.isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="deviceStore.errorMessage" class="error-state">
      {{ deviceStore.errorMessage }}
    </div>

    <div v-else-if="currentTab === 'LIST' || currentTab === 'MAINTENANCE'" class="devices-grid">
      <div v-for="device in deviceStore.devicesList" :key="device.id" class="device-card" @click="goToDetail(device.id)">
        <div class="card-header">
          <h3>#{{ device.id }}</h3>
          <span :class="['badge', device.status.toLowerCase() === 'online' ? 'badge-success' : 'badge-danger']">
            {{ device.status }}
          </span>
        </div>
        <p class="subtitle">{{ device.model || 'Microcontroller' }}</p>
        
        <p class="last-seen">Last maintenance: {{ formatDate(device.lastMaintenanceDate) || 'N/A' }}</p>
        
        <div v-if="currentTab === 'MAINTENANCE'" class="maintenance-actions">
          <button 
            v-if="device.status.toLowerCase() !== 'maintenance'" 
            class="btn-start"
            @click.stop="toggleMaintenance(device.id, 'MAINTENANCE')">
            START MAINTENANCE
          </button>
          <button 
            v-else 
            class="btn-end"
            @click.stop="toggleMaintenance(device.id, 'ONLINE')">
            END MAINTENANCE
          </button>
        </div>
      </div>
      
      <p v-if="deviceStore.devicesList.length === 0" class="empty-msg">No hay dispositivos registrados.</p>
    </div>

    <div v-else-if="currentTab === 'LOGBOOK'" class="logbook-section">
      <div class="logbook-card">
        <div class="form-group">
          <label>Device ID</label>
          <input type="text" v-model="logForm.deviceId" placeholder="Ej: 1" class="dark-input">
        </div>
        
        <div class="form-group">
          <label class="green-text">Action</label>
          <textarea v-model="logForm.action" rows="4" placeholder="Limpieza de sensor..." class="dark-input"></textarea>
        </div>

        <div class="form-group">
          <label class="green-text">Status After</label>
          <div class="status-selector">
             <span 
               :class="['badge', logForm.statusAfter === 'ONLINE' ? 'badge-success' : 'badge-outline']"
               @click="logForm.statusAfter = 'ONLINE'" style="cursor:pointer;">
               ONLINE
             </span>
             <span 
               :class="['badge', logForm.statusAfter === 'OFFLINE' ? 'badge-danger' : 'badge-outline']"
               @click="logForm.statusAfter = 'OFFLINE'" style="cursor:pointer;">
               OFFLINE
             </span>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-save" @click="submitLog">SAVE</button>
          <button class="btn-cancel" @click="resetForm">CANCEL</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDeviceStore } from '@/modules/devices/application/useDeviceStore';

const router = useRouter();
const deviceStore = useDeviceStore();
const currentTab = ref('LIST');

// Variables renombradas exactamente igual al Swagger
const logForm = ref({ deviceId: '', action: '', statusAfter: 'ONLINE' });

onMounted(() => {
  deviceStore.fetchDevices();
});

const goToDetail = (id) => {
  router.push(`/devices/${id}`);
};

const toggleMaintenance = async (id, newStatus) => {
  try {
    await deviceStore.changeStatus(id, newStatus);
  } catch (error) {
    alert("Hubo un error al cambiar el estado.");
  }
};

const resetForm = () => {
  logForm.value = { deviceId: '', action: '', statusAfter: 'ONLINE' };
};

const submitLog = async () => {
  if (!logForm.value.deviceId || !logForm.value.action) {
    return alert("Llena el ID del dispositivo y la acción realizada");
  }
  
  try {
    // ARMAMOS EL JSON EXACTO QUE PIDE TU SWAGGER (Elegante y limpio)
    const payload = {
      action: logForm.value.action,
      statusAfter: logForm.value.statusAfter
    };

    // Se lo pasamos al Store
    await deviceStore.saveLog(logForm.value.deviceId, payload);
    
    alert("¡Guardado exitoso!");
    resetForm();
  } catch (error) {
    alert("Error al guardar.");
    console.error(error);
  }
};

const formatDate = (dateString) => {
  if(!dateString) return null;
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.devices-page-wrapper {
  padding: 2rem;
  background-color: #0f111a;
  min-height: 100vh;
  color: #fff;
  font-family: 'Inter', sans-serif;
}

/* Header and Decorators */
.page-header {
  margin-bottom: 2rem;
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.header-content h2 {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
}
.line-decorator {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, #10b981, transparent);
  opacity: 0.7;
}
.line-decorator.reverse {
  background: linear-gradient(270deg, #10b981, transparent);
}

/* Tabs */
.tabs-container {
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #2d3748;
  padding-bottom: 20px;
  position: relative;
}
.tabs-container button {
  background: transparent;
  border: 1px solid #fff;
  color: #fff;
  padding: 8px 24px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}
.tabs-container button:hover {
  background: rgba(255,255,255,0.1);
}
.tabs-container button.active {
  background-color: #1a4d4e;
  border-color: #1a4d4e;
  color: #20c997;
}
.icon-right {
  position: absolute;
  right: 10px;
  color: #fff;
  cursor: pointer;
}

/* Grid and Cards */
.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.device-card {
  background-color: #161819;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: border-color 0.3s;
}
.device-card:hover {
  border-color: #2d3748;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
}
.subtitle {
  color: #a0aec0;
  font-size: 0.85rem;
  margin: 5px 0 25px 0;
}
.last-seen {
  font-size: 0.8rem;
  color: #a0aec0;
  margin: 0;
}

/* Badges */
.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: bold;
}
.badge-success { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981;}
.badge-danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444;}
.badge-outline { border: 1px solid #fff; color: #fff; }

/* Maintenance Buttons */
.maintenance-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
.btn-start { background: transparent; border: none; color: #10b981; font-weight: bold; cursor: pointer; }
.btn-end { background: #3182ce; border: none; color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; }

/* Logbook Form */
.logbook-section {
  max-width: 800px;
}
.logbook-card {
  background-color: #161819;
  border-radius: 12px;
  padding: 2rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  color: #3182ce;
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.green-text { color: #10b981 !important; }
.dark-input {
  width: 100%;
  background-color: #2d3748;
  border: none;
  color: white;
  padding: 12px;
  border-radius: 6px;
  font-family: inherit;
}
.status-selector { display: flex; gap: 10px;}
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 2rem;
}
.btn-save { background-color: #1a4d4e; color: #20c997; border: none; padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; }
.btn-cancel { background-color: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; }

/* Utils */
.loading-state, .error-state, .empty-msg { text-align: center; padding: 3rem; color: #a0aec0;}
.spinner { width: 40px; height: 40px; border: 4px solid #2d3748; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;}
@keyframes spin { to { transform: rotate(360deg); } }
</style>