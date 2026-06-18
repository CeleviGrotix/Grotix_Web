<template>
  <div class="devices-page-wrapper">
    <header class="page-header">
      <div class="header-content">
        <div class="line-decorator reverse"></div>
        <h2>Grotix Devices</h2>
        <div class="line-decorator"></div>
      </div>
      
      <div class="tabs-container">
        <button @click="$router.push('/devices')">LIST</button>
        <button @click="$router.push('/devices/logbook')">LOGBOOK</button>
        <button class="active">MAINTENANCE</button>

        <div class="icon-right" @click="toggleFilters" :class="{ 'icon-active': showFilters }">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </div>
      </div>

      <transition name="slide-fade">
        <div v-if="showFilters" class="filters-panel">
          <div class="filter-group">
            <label>Association</label>
            <select v-model="associationFilter" class="filter-select">
              <option value="ALL">All Associations</option>
              <option value="UNASSIGNED">Unassigned</option>
              <option v-for="assoc in deviceStore.associationsForFilter" :key="assoc.id" :value="String(assoc.id)">
                {{ assoc.name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>Search Device</label>
            <input type="text" v-model="searchQuery" placeholder="ID, Model, Association..." class="filter-input">
          </div>
          <div class="filter-group">
            <label>Connection Status</label>
            <select v-model="statusFilter" class="filter-select">
              <option value="ALL">All Statuses</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
          <button class="btn-clear" @click="clearFilters" v-if="searchQuery || statusFilter !== 'ALL' || associationFilter !== 'ALL'">
            Clear
          </button>
        </div>
      </transition>
    </header>

    <div v-if="isPageLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading devices...</p>
    </div>
    <div v-else-if="deviceStore.errorMessage" class="error-state">{{ deviceStore.errorMessage }}</div>

    <div v-else class="devices-grid">
      <div v-for="device in filteredDevices" :key="device.id" class="premium-device-card">
        
        <div class="card-header-premium">
          <div class="identity">
            <div class="icon-container-wrench">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            </div>
            <h3>Device #{{ device.id }}</h3>
          </div>
          <span :class="['premium-badge', getBadgeClass(device.status)]">
            {{ device.status }}
          </span>
        </div>

        <div class="card-divider"></div>

        <div class="card-body-premium">
          <div class="info-row">
            <label>Model</label>
            <p class="model-text">{{ device.model || 'Standard Microcontroller' }}</p>
          </div>
          <div class="info-row">
            <label>Association</label>
            <p class="association-text">{{ device.associationName || 'Unassigned' }}</p>
          </div>
          <div class="info-row">
            <label>Zone</label>
            <p class="zone-text">{{ device.zoneName || (device.zoneId ? `Zone #${device.zoneId}` : 'Unassigned') }}</p>
          </div>
          <div class="info-row last-maintenance">
            <label>Last Sync</label>
            <p>{{ formatDate(device.lastSeen) || 'N/A' }}</p>
          </div>
        </div>
        
        <div class="maintenance-actions">
          <button 
            v-if="device.status.toLowerCase() !== 'maintenance'" 
            class="btn-premium-start"
            @click="openModal(device.id, 'MAINTENANCE')">
            START MAINTENANCE
          </button>
          <button 
            v-else 
            class="btn-premium-end"
            @click="openModal(device.id, 'ONLINE')">
            END MAINTENANCE
          </button>
        </div>
      </div>
      
      <p v-if="filteredDevices.length === 0" class="empty-msg">
        {{ deviceStore.devicesList.length === 0 ? 'No devices registered.' : 'No devices match the current filters.' }}
      </p>
    </div>

    <transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="premium-modal">
          <h3 :class="targetStatus === 'MAINTENANCE' ? 'text-warning' : 'text-success'">
            {{ targetStatus === 'MAINTENANCE' ? 'Start Maintenance' : 'End Maintenance' }}
          </h3>
          <p class="modal-subtitle">Register this action in the device history log.</p>
          
          <div class="form-group">
            <label>Action Description</label>
            <textarea 
              v-model="actionText" 
              rows="4" 
              class="premium-input" 
              placeholder="E.g., Sensor cleaning..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button class="btn-premium-cancel" @click="closeModal" :disabled="isProcessing">CANCEL</button>
            <button 
              :class="targetStatus === 'MAINTENANCE' ? 'btn-premium-warning' : 'btn-premium-success'" 
              @click="confirmMaintenance" 
              :disabled="isProcessing">
              {{ isProcessing ? 'SAVING...' : 'CONFIRM' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/modules/devices/application/useDeviceStore';

const deviceStore = useDeviceStore();

const showFilters = ref(false);
const searchQuery = ref('');
const statusFilter = ref('ALL');
const associationFilter = ref('ALL');

const isPageLoading = computed(
  () => deviceStore.isLoading || !deviceStore.hasLoaded,
);

// Estados del Modal
const showModal = ref(false);
const selectedDeviceId = ref(null);
const targetStatus = ref('');
const actionText = ref('');
const isProcessing = ref(false);

onMounted(() => { deviceStore.fetchDevices(); });

const filteredDevices = computed(() => {
  let list = deviceStore.devicesList;

  if (statusFilter.value !== 'ALL') {
    list = list.filter((d) => {
      const status = d.status ? d.status.toUpperCase() : '';
      return status === statusFilter.value;
    });
  }

  if (associationFilter.value === 'UNASSIGNED') {
    list = list.filter((d) => !d.zoneId || !d.associationId);
  } else if (associationFilter.value !== 'ALL') {
    list = list.filter((d) => String(d.associationId) === associationFilter.value);
  }

  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase().trim();
    list = list.filter((d) => {
      const idMatch = String(d.id).includes(query);
      const modelMatch = d.model && d.model.toLowerCase().includes(query);
      const associationMatch = d.associationName && d.associationName.toLowerCase().includes(query);
      const zoneMatch = d.zoneName && d.zoneName.toLowerCase().includes(query);
      const farmMatch = d.farmName && d.farmName.toLowerCase().includes(query);
      return idMatch || modelMatch || associationMatch || zoneMatch || farmMatch;
    });
  }

  return list;
});

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'ALL';
  associationFilter.value = 'ALL';
};

// Abrir el modal y autocompletar un texto por defecto según la acción
const openModal = (id, status) => {
  selectedDeviceId.value = id;
  targetStatus.value = status;
  actionText.value = status === 'MAINTENANCE' 
    ? 'Scheduled maintenance started.' 
    : 'Maintenance completed successfully. Device operational.';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  actionText.value = '';
};

// Ejecutar la acción completa usando saveLogAndChangeStatus
const confirmMaintenance = async () => {
  if (!actionText.value.trim()) {
    alert("Please provide a description for the log.");
    return;
  }

  isProcessing.value = true;
  try {
    await deviceStore.saveLogAndChangeStatus(selectedDeviceId.value, {
      action: actionText.value.trim(),
      statusAfter: targetStatus.value
    });
    closeModal();
  } catch (error) {
    alert("Error changing status and saving log.");
  } finally {
    isProcessing.value = false;
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
.devices-page-wrapper { padding: 2.5rem; background-color: #0c0e14; min-height: 100vh; color: #f1f1f1; font-family: 'Inter', sans-serif;}
.page-header { margin-bottom: 2.5rem; }
.header-content { display: flex; align-items: center; justify-content: center; gap: 2rem; margin-bottom: 2rem; }
.header-content h2 { font-size: 2.5rem; font-weight: 900; margin: 0; color: #fff; letter-spacing: -1px;}
.line-decorator { flex: 1; height: 3px; background: linear-gradient(90deg, #10b981, transparent); opacity: 0.8; border-radius: 4px; }
.line-decorator.reverse { background: linear-gradient(270deg, #10b981, transparent); }
.tabs-container { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #1f2937; padding-bottom: 25px; position: relative;}
.icon-right {
  position: absolute;
  right: 5px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s;
  padding: 8px;
  border-radius: 50%;
  background: #11131a;
  border: 1px solid #2d3748;
}
.icon-right:hover { color: #20c997; background: #1a4d4e; border-color: #10b981;}
.icon-active { color: #10b981; transform: scale(1.1); background: #1a4d4e; border-color: #10b981;}

.filters-panel {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding: 1.8rem;
  background-color: #11131a;
  border-radius: 0 0 16px 16px;
  border: 2px solid #1f2937;
  border-top: none;
  margin-top: -1px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  flex-wrap: wrap;
}
.filter-group { display: flex; flex-direction: column; gap: 8px; }
.filter-group label { font-size: 0.8rem; color: #20c997; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;}
.filter-input, .filter-select {
  background-color: #1f2937;
  border: 1px solid #374151;
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  min-width: 200px;
}
.filter-input:focus, .filter-select:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
.btn-clear {
  background: transparent;
  color: #ef4444;
  border: 2px solid #ef4444;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  height: 42px;
  transition: all 0.2s;
}
.btn-clear:hover { background: rgba(239, 68, 68, 0.1); }
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-15px); opacity: 0; }

.tabs-container button { background: #11131a; border: 1px solid #374151; color: #a0aec0; padding: 10px 28px; border-radius: 30px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s ease; }
.tabs-container button:hover { background: #1f2937; color: #fff; border-color: #4b5563; }
.tabs-container button.active { background-color: #1a4d4e; border-color: #10b981; color: #20c997; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.2); }

/* Grid & Cards Premium */
.devices-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 25px;}
.premium-device-card { background-color: #11131a; border-radius: 16px; padding: 2rem; border: 2px solid #1f2937; display: flex; flex-direction: column; gap: 1.5rem; transition: border-color 0.3s;}
.premium-device-card:hover { border-color: #4b5563; }
.card-header-premium { display: flex; justify-content: space-between; align-items: center; }
.card-header-premium .identity { display: flex; align-items: center; gap: 12px; }
.icon-container-wrench { background: rgba(234, 179, 8, 0.1); padding: 10px; border-radius: 10px; color: #eab308; }
.card-header-premium h3 { margin: 0; font-size: 1.3rem; font-weight: 800; color: #fff;}
.card-divider { height: 1px; background: linear-gradient(90deg, #1f2937, rgba(31, 41, 55, 0.2)); width: 100%; }

/* Body */
.card-body-premium { display: flex; flex-direction: column; gap: 15px;}
.info-row { display: flex; justify-content: space-between; align-items: center;}
.info-row label { font-size: 0.8rem; font-weight: 800; color: #6b7280; text-transform: uppercase;}
.premium-device-card p { margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem;}
.model-text { color: #e2e8f0; font-weight: 600; }
.association-text { color: #fbbf24; font-weight: 700; }
.zone-text { color: #3182ce; font-weight: 700; background: rgba(49, 130, 206, 0.1); padding: 2px 6px; border-radius: 4px; }
.last-maintenance { flex-direction: column; align-items: flex-start; gap: 6px; background: #0c0e14; padding: 12px; border-radius: 8px; border: 1px solid #1f2937; margin-top: 5px;}
.last-maintenance p { color: #a0aec0; font-size: 0.85rem; }

/* Badges */
.premium-badge { padding: 6px 14px; border-radius: 8px; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-width: 1px; border-style: solid; }
.badge-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.3);}
.badge-warning { background: rgba(234, 179, 8, 0.1); color: #eab308; border-color: rgba(234, 179, 8, 0.3);}
.badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);}

/* Botones de Acción de la Tarjeta */
.maintenance-actions { display: flex; margin-top: 5px; }
.btn-premium-start { width: 100%; background: transparent; border: 2px solid #eab308; color: #eab308; padding: 12px; border-radius: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s;}
.btn-premium-start:hover { background: rgba(234, 179, 8, 0.1); transform: translateY(-2px);}
.btn-premium-end { width: 100%; background: #3b82f6; border: none; color: white; padding: 14px; border-radius: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);}
.btn-premium-end:hover { background: #2563eb; transform: translateY(-2px);}

/* ======== ESTILOS DEL MODAL ======== */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.premium-modal {
  background: #11131a;
  border: 2px solid #1f2937;
  border-radius: 16px;
  padding: 2.5rem;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}
.premium-modal h3 { margin: 0 0 10px 0; font-size: 1.5rem; font-weight: 900;}
.text-warning { color: #eab308; }
.text-success { color: #10b981; }
.modal-subtitle { color: #a0aec0; font-size: 0.9rem; margin-bottom: 1.5rem; }

.form-group { margin-bottom: 2rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 800; color: #6b7280; text-transform: uppercase; margin-bottom: 0.8rem; }
.premium-input { width: 100%; background-color: #1f2937; border: 2px solid #374151; color: white; padding: 14px; border-radius: 10px; font-family: inherit; font-size: 0.95rem; box-sizing: border-box; transition: all 0.3s; resize: none;}
.premium-input:focus { outline: none; border-color: #10b981; }

.modal-actions { display: flex; gap: 15px; }
.btn-premium-cancel { flex: 1; background: transparent; color: #a0aec0; border: 2px solid #4b5563; padding: 12px; border-radius: 30px; font-weight: 800; cursor: pointer; transition: all 0.2s;}
.btn-premium-cancel:hover { background: #374151; color: white;}
.btn-premium-warning { flex: 1; background: #eab308; color: #000; border: none; padding: 12px; border-radius: 30px; font-weight: 800; cursor: pointer; transition: all 0.2s;}
.btn-premium-warning:hover:not(:disabled) { background: #ca8a04; transform: translateY(-2px);}
.btn-premium-success { flex: 1; background: #10b981; color: #000; border: none; padding: 12px; border-radius: 30px; font-weight: 800; cursor: pointer; transition: all 0.2s;}
.btn-premium-success:hover:not(:disabled) { background: #059669; transform: translateY(-2px);}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.loading-state, .error-state, .empty-msg { text-align: center; padding: 5rem; color: #a0aec0; font-weight: 600;}
.loading-state p { margin: 1rem 0 0; font-size: 0.95rem; }
.spinner { width: 50px; height: 50px; border: 5px solid #1f2937; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;}
@keyframes spin { to { transform: rotate(360deg); } }
</style>