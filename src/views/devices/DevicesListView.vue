<template>
  <div class="devices-page-wrapper">
    <header class="page-header">
      <div class="header-content">
        <div class="line-decorator reverse"></div>
        <h2>Devices</h2>
        <div class="line-decorator"></div>
      </div>
      
      <div class="tabs-container">
        <button class="active">LIST</button>
        <button @click="$router.push('/devices/logbook')">LOGBOOK</button>
        <button @click="$router.push('/devices/maintenance')">MAINTENANCE</button>
        
        <div class="icon-right" @click="toggleFilters" :class="{ 'icon-active': showFilters }" title="Filtrar dispositivos">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </div>
      </div>

      <transition name="slide-fade">
        <div v-if="showFilters" class="filters-panel">
          <div class="filter-group">
            <label>Buscar</label>
            <input type="text" v-model="searchQuery" placeholder="ID o Modelo..." class="filter-input">
          </div>
          <div class="filter-group">
            <label>Estado</label>
            <select v-model="statusFilter" class="filter-select">
              <option value="ALL">Todos</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
          <button class="btn-clear" @click="clearFilters" v-if="searchQuery || statusFilter !== 'ALL'">
            Limpiar Filtros
          </button>
        </div>
      </transition>
    </header>

    <div v-if="deviceStore.isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="deviceStore.errorMessage" class="error-state">
      {{ deviceStore.errorMessage }}
    </div>

    <div v-else class="devices-grid">
      <div v-for="device in filteredDevices" :key="device.id" class="device-card" @click="goToDetail(device.id)">
        <div class="card-header">
          <h3>#{{ device.id }}</h3>
          
          <span :class="['badge', getBadgeClass(device.status)]">
            {{ device.status }}
          </span>
        </div>
        <p class="subtitle">{{ device.model || 'Microcontroller' }}</p>
        
        <p class="last-seen">Last maintenance: {{ formatDate(device.lastSeen) || 'N/A' }}</p>
      </div>
      
      <div class="empty-msg-container" v-if="filteredDevices.length === 0">
        <p v-if="deviceStore.devicesList.length === 0" class="empty-msg">No hay dispositivos registrados en el sistema.</p>
        <p v-else class="empty-msg">No se encontraron dispositivos con esos filtros.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDeviceStore } from '@/modules/devices/application/useDeviceStore';

const router = useRouter();
const deviceStore = useDeviceStore();

// --- ESTADOS PARA LOS FILTROS ---
const showFilters = ref(false);
const searchQuery = ref('');
const statusFilter = ref('ALL');

onMounted(() => {
  deviceStore.fetchDevices();
});

// --- LÓGICA DE FILTRADO (Propiedad Computada) ---
const filteredDevices = computed(() => {
  let list = deviceStore.devicesList;

  // 1. Filtrar por Estado (si no es 'ALL')
  if (statusFilter.value !== 'ALL') {
    list = list.filter(d => {
      const status = d.status ? d.status.toUpperCase() : '';
      return status === statusFilter.value;
    });
  }

  // 2. Filtrar por Texto (ID o Modelo)
  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase().trim();
    list = list.filter(d => {
      const idMatch = String(d.id).includes(query);
      const modelMatch = d.model && d.model.toLowerCase().includes(query);
      return idMatch || modelMatch;
    });
  }

  return list;
});

// --- MÉTODOS ---
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'ALL';
};

const goToDetail = (id) => {
  router.push(`/devices/${id}`);
};

const getBadgeClass = (status) => {
  const s = status ? status.toLowerCase() : '';
  if (s === 'online') return 'badge-success';
  if (s === 'maintenance') return 'badge-warning';
  return 'badge-danger'; 
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
.page-header { margin-bottom: 2rem; }
.header-content { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-bottom: 1.5rem; }
.header-content h2 { font-size: 2.2rem; font-weight: 800; margin: 0; }
.line-decorator { flex: 1; height: 2px; background: linear-gradient(90deg, #10b981, transparent); opacity: 0.7; }
.line-decorator.reverse { background: linear-gradient(270deg, #10b981, transparent); }

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
.tabs-container button:hover { background: rgba(255,255,255,0.1); }
.tabs-container button.active { background-color: #1a4d4e; border-color: #1a4d4e; color: #20c997; }

/* Filter Icon */
.icon-right {
  position: absolute;
  right: 10px;
  color: #a0aec0;
  cursor: pointer;
  transition: color 0.3s, transform 0.3s;
  padding: 5px;
  border-radius: 50%;
}
.icon-right:hover { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.icon-active { color: #10b981; transform: scale(1.1); }

/* Filter Panel */
.filters-panel {
  display: flex;
  align-items: flex-end;
  gap: 15px;
  padding: 1.5rem;
  background-color: #161819;
  border-radius: 0 0 12px 12px;
  border: 1px solid #2d3748;
  border-top: none;
  margin-top: -1px; /* Para solapar el borde del tab */
}
.filter-group { display: flex; flex-direction: column; gap: 5px; }
.filter-group label { font-size: 0.8rem; color: #a0aec0; font-weight: bold; text-transform: uppercase; }
.filter-input, .filter-select {
  background-color: #2d3748;
  border: 1px solid #4a5568;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
  min-width: 150px;
}
.filter-input:focus, .filter-select:focus { outline: 1px solid #10b981; }
.btn-clear {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  height: 36px;
  transition: all 0.2s;
}
.btn-clear:hover { background: rgba(239, 68, 68, 0.1); }

/* Transición para ocultar/mostrar panel */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }

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
.device-card:hover { border-color: #2d3748; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-header h3 { margin: 0; font-size: 1.2rem; }
.subtitle { color: #a0aec0; font-size: 0.85rem; margin: 5px 0 25px 0; }
.last-seen { font-size: 0.8rem; color: #a0aec0; margin: 0; }

/* Badges */
.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; }
.badge-success { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981;}
.badge-warning { background: rgba(234, 179, 8, 0.2); color: #eab308; border: 1px solid #eab308;}
.badge-danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444;}

/* Utils */
.empty-msg-container { grid-column: 1 / -1; }
.loading-state, .error-state, .empty-msg { text-align: center; padding: 3rem; color: #a0aec0;}
.spinner { width: 40px; height: 40px; border: 4px solid #2d3748; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;}
@keyframes spin { to { transform: rotate(360deg); } }
</style>