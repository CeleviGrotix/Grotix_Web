<template>
  <div class="devices-page-wrapper">
    <header class="page-header">
      <div class="header-content">
        <div class="line-decorator reverse"></div>
        <h2>Grotix Devices</h2>
        <div class="line-decorator"></div>
      </div>
      
      <div class="tabs-container">
        <button class="active">LIST</button>
        <button @click="$router.push('/devices/logbook')">LOGBOOK</button>
        <button @click="$router.push('/devices/maintenance')">MAINTENANCE</button>
        
        <div class="icon-right" @click="toggleFilters" :class="{ 'icon-active': showFilters }">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </div>
      </div>

      <transition name="slide-fade">
        <div v-if="showFilters" class="filters-panel">
          <div class="filter-group">
            <label>Search Device</label>
            <input type="text" v-model="searchQuery" placeholder="ID, Model, MAC..." class="filter-input">
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
          <button class="btn-clear" @click="clearFilters" v-if="searchQuery || statusFilter !== 'ALL'">
            Clear
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
      <div v-for="device in filteredDevices" :key="device.id" class="premium-device-card" @click="goToDetail(device.id)">
        
        <div class="card-glow"></div>
        
        <div class="card-header-premium">
          <div class="identity">
            <div class="icon-container">
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="9"></line><line x1="15" y1="3" x2="15" y2="9"></line><line x1="9" y1="15" x2="9" y2="21"></line><line x1="15" y1="15" x2="15" y2="21"></line><line x1="3" y1="9" x2="9" y2="9"></line><line x1="15" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="9" y2="15"></line><line x1="15" y1="15" x2="21" y2="15"></line></svg>
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
            <label>Zone ID</label>
            <p class="zone-text">{{ device.zoneId || 'Unassigned' }}</p>
          </div>
          <div class="info-row last-maintenance">
            <label>Last Seen / Sync</label>
            <p>{{ formatDate(device.lastSeen) || 'N/A' }}</p>
          </div>
        </div>
        
        <div class="card-footer-arrow">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M9 18l6-6-6-6"></path></svg>
        </div>
      </div>
      
      <div class="empty-msg-container" v-if="filteredDevices.length === 0">
        <p v-if="deviceStore.devicesList.length === 0" class="empty-msg">No devices registered in the platform.</p>
        <p v-else class="empty-msg">No devices match the current filters.</p>
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

const showFilters = ref(false);
const searchQuery = ref('');
const statusFilter = ref('ALL');

onMounted(() => {
  deviceStore.fetchDevices();
});

const filteredDevices = computed(() => {
  let list = deviceStore.devicesList;

  if (statusFilter.value !== 'ALL') {
    list = list.filter(d => {
      const status = d.status ? d.status.toUpperCase() : '';
      return status === statusFilter.value;
    });
  }

  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase().trim();
    list = list.filter(d => {
      const idMatch = String(d.id).includes(query);
      const modelMatch = d.model && d.model.toLowerCase().includes(query);
      const macMatch = d.macAddress && d.macAddress.toLowerCase().includes(query);
      return idMatch || modelMatch || macMatch;
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
/* Estilos Base Actualizados (Basados en tus wireframes oscuros) */
.devices-page-wrapper {
  padding: 2.5rem; /* Más aire */
  background-color: #0c0e14; /* Tono de negro más profundo */
  min-height: 100vh;
  color: #f1f1f1;
  font-family: 'Inter', sans-serif;
}

/* Header estilizado estilo Wireframe */
.page-header { margin-bottom: 2.5rem; }
.header-content { display: flex; align-items: center; justify-content: center; gap: 2rem; margin-bottom: 2rem; }
.header-content h2 { font-size: 2.5rem; font-weight: 900; margin: 0; color: #fff; letter-spacing: -1px;}
.line-decorator { flex: 1; height: 3px; background: linear-gradient(90deg, #10b981, transparent); opacity: 0.8; border-radius: 4px; }
.line-decorator.reverse { background: linear-gradient(270deg, #10b981, transparent); }

/* Tabs mejoradas */
.tabs-container {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid #1f2937;
  padding-bottom: 25px;
  position: relative;
}
.tabs-container button {
  background: #11131a;
  border: 1px solid #374151;
  color: #a0aec0;
  padding: 10px 28px;
  border-radius: 30px; /* Más redondeado como wireframe móvil */
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tabs-container button:hover { background: #1f2937; color: #fff; border-color: #4b5563; }
.tabs-container button.active { background-color: #1a4d4e; border-color: #10b981; color: #20c997; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.2); }

/* Ícono de filtros interactivo */
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

/* Panel de Filtros Estilizado */
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

/* Grid de Cards Actualizado */
.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); /* Más anchas */
  gap: 25px; /* Más espacio */
}

/* LA NUEVA PREMIUM CARD (Remodelación Visual Completa) */
.premium-device-card {
  position: relative;
  background-color: #11131a;
  border-radius: 16px; /* Súper redondeado */
  padding: 2rem; /* Mucho más aire interno */
  cursor: pointer;
  border: 2px solid #1f2937; /* Borde más visible */
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden; /* Para el efecto glow */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Efecto Glow Turquesa */
.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.premium-device-card:hover {
  transform: translateY(-8px); /* Elevación */
  border-color: #10b981; /* Acento verde */
  box-shadow: 0 15px 40px rgba(0,0,0,0.4), 0 0 15px rgba(16, 185, 129, 0.15);
}

.premium-device-card:hover .card-glow { opacity: 1; }

/* Encabezado Premium */
.card-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.card-header-premium .identity { display: flex; align-items: center; gap: 12px; }

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1f2937;
  padding: 10px;
  border-radius: 10px;
  color: #20c997; /* Acento turquesa en ícono */
}

.card-header-premium h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
}

.card-divider {
  height: 1px;
  background: linear-gradient(90deg, #1f2937, rgba(31, 41, 55, 0.2));
  width: 100%;
}

/* Body Premium con mejor jerarquía */
.card-body-premium {
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
  z-index: 1;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-row label {
  font-size: 0.8rem;
  font-weight: 800;
  color: #6b7280; /* Texto secundario gris */
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.premium-device-card p { margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem;} /* Fuente mono para datos técnicos */

.model-text { color: #e2e8f0; font-weight: 600; }
.zone-text { color: #3182ce; font-weight: 700; background: rgba(49, 130, 206, 0.1); padding: 2px 6px; border-radius: 4px; }

.last-maintenance {
  margin-top: 5px;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  background: #0c0e14;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #1f2937;
}
.last-maintenance label { color: #20c997; } /* Acento turquesa */
.last-maintenance p { color: #a0aec0; font-size: 0.85rem; }

/* Flecha decorativa de detalle */
.card-footer-arrow {
  display: flex;
  justify-content: flex-end;
  color: #4b5563;
  transition: color 0.3s, transform 0.3s;
  position: relative;
  z-index: 1;
  margin-top: -5px;
}
.premium-device-card:hover .card-footer-arrow { color: #10b981; transform: translateX(3px); }

/* Badges Premium */
.premium-badge {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-width: 1px;
  border-style: solid;
}
.badge-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.3);}
.badge-warning { background: rgba(234, 179, 8, 0.1); color: #eab308; border-color: rgba(234, 179, 8, 0.3);}
.badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);}

/* Utils */
.empty-msg-container { grid-column: 1 / -1; }
.loading-state, .error-state, .empty-msg { text-align: center; padding: 5rem; color: #a0aec0; font-weight: 600;}
.spinner { width: 50px; height: 50px; border: 5px solid #1f2937; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px auto;}
@keyframes spin { to { transform: rotate(360deg); } }
</style>