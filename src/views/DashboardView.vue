<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Main Dashboard</h1>
    </header>

    <div class="dashboard-grid">

      <div class="column">
        <h3 class="col-title">Active Clients</h3>
        <div v-if="profileStore.isLoading" class="loading-text">Cargando...</div>
        <div v-else class="cards-stack">
          <GtxCard
            v-for="client in profileStore.profiles"
            :key="client.id"
            @click="router.push({ name: 'profile-detail', params: { id: client.id } })"
          >
            <template #title>{{ client.name }}</template>
            <template #subtitle>Agriculturist</template>
            <template #badge>
              <GtxBadge :text="client.isActive ? 'ACTIVE' : 'INACTIVE'" :variant="client.isActive ? 'success' : 'danger'" />
            </template>
          </GtxCard>
          <div v-if="profileStore.profiles.length === 0" class="empty-text">No hay clientes activos.</div>
        </div>
      </div>

      <div class="column">
        <h3 class="col-title">Contracts</h3>
        <div v-if="contractStore.isLoading" class="loading-text">Cargando...</div>
        <div v-else class="cards-stack">
          <GtxCard
            v-for="assoc in orderedContracts"
            :key="assoc.id"
            @click="router.push({ name: 'contract-detail', params: { id: assoc.id } })"
          >
            <template #title>{{ assoc.name }}</template>
            <template #subtitle>Duration: {{ assoc.getFormattedDateRange() }}</template>
          </GtxCard>
          <div v-if="orderedContracts.length === 0" class="empty-text">No hay contratos activos.</div>
        </div>
      </div>

      <div class="column">
        <h3 class="col-title">Devices</h3>
        <div v-if="deviceStore.isLoading" class="loading-text">Cargando...</div>
        <div v-else class="cards-stack">
          <GtxCard 
            v-for="device in deviceStore.devicesList" 
            :key="device.id"
            @click="router.push(`/devices/${device.id}`)"
            style="cursor: pointer;"
          >
            <template #title>#{{ device.id }}</template>
            <template #subtitle>{{ device.model || 'Microcontroller' }}</template>
            <template #badge>
              <GtxBadge :text="device.status" :variant="getDeviceVariant(device.status)" />
            </template>
          </GtxCard>
          <div v-if="deviceStore.devicesList.length === 0" class="empty-text">No hay dispositivos registrados.</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/modules/profiles/application/useProfileStore';
import { useContractsStore } from '@/modules/contracts/application/useContractsStore';
import { useDeviceStore } from '@/modules/devices/application/useDeviceStore'; // 1. Importamos el Store de Devices

import GtxCard from '@/shared/ui/GtxCard.vue';
import GtxBadge from '@/shared/ui/GtxBadge.vue';

const router = useRouter();
const profileStore = useProfileStore();
const contractStore = useContractsStore();
const deviceStore = useDeviceStore(); // 2. Inicializamos el Store

const orderedContracts = computed(() => {
  return contractStore.associations
    .filter(a => a.hasActiveContract)
    .sort((a, b) => new Date(b.contractStart) - new Date(a.contractStart));
});

// 3. Función para darle color al GtxBadge dependiendo del estado del dispositivo
const getDeviceVariant = (status) => {
  const s = status ? status.toLowerCase() : '';
  if (s === 'online') return 'success';
  if (s === 'maintenance') return 'warning';
  return 'danger';
};

onMounted(async () => {
  // 4. Agregamos el fetchDevices a la promesa principal para que cargue todo en paralelo
  await Promise.all([
    profileStore.fetchProfiles(),
    contractStore.fetchAssociations(),
    deviceStore.fetchDevices()
  ]);
});
</script>

<style scoped>
.dashboard-container {
  padding-bottom: 4rem;
}

/* --- HEADER --- */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  gap: 1.5rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  white-space: nowrap;
}

.dashboard-header::before,
.dashboard-header::after {
  content: '';
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--blue-cerulean), transparent);
  opacity: 0.5;
  max-width: 350px;
}

/* --- GRID 3 COLUMNAS --- */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  align-items: start;
}

.col-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.cards-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-text, .error-text, .empty-text {
  text-align: center;
  font-size: 0.9rem;
  padding: 2rem;
  border-radius: 8px;
  background-color: rgba(255,255,255,0.05);
}

.error-text { color: var(--red-coral); border: 1px solid rgba(255, 87, 87, 0.3); }
.empty-text { color: var(--light-grey); opacity: 0.7; }

/* ============================================================
   TABLET (≤ 1024px): 2 columnas
   ============================================================ */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }
}

/* ============================================================
   MÓVIL (≤ 768px): 1 columna, header compacto
   ============================================================ */
@media (max-width: 768px) {
  .dashboard-container {
    padding-bottom: 2rem;
  }

  .dashboard-header {
    margin-bottom: 2rem;
    gap: 0.75rem;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
    white-space: normal;
    text-align: center;
  }

  .dashboard-header::before,
  .dashboard-header::after {
    max-width: 60px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .col-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
}

/* ============================================================
   MÓVIL PEQUEÑO (≤ 480px)
   ============================================================ */
@media (max-width: 480px) {
  .dashboard-header h1 {
    font-size: 1.25rem;
  }

  .dashboard-header::before,
  .dashboard-header::after {
    display: none;
  }
}
</style>