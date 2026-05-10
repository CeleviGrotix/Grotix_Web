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
              <GtxBadge :text="client.isActive ? 'ACTIVE' : 'INACTIVE'" />
            </template>
          </GtxCard>
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
        <div class="cards-stack">
          <GtxCard v-for="device in mockDevices" :key="device.id">
            <template #title>{{ device.code }}</template>
            <template #subtitle>Microcontroller</template>
            <template #badge><GtxBadge :text="device.status" /></template>
          </GtxCard>
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
import GtxCard from '@/shared/ui/GtxCard.vue';
import GtxBadge from '@/shared/ui/GtxBadge.vue';

const router = useRouter();
const profileStore = useProfileStore();
const contractStore = useContractsStore();

// Lógica para filtrar solo los que tienen contrato y ordenar por los más recientes arriba
const orderedContracts = computed(() => {
  return contractStore.associations
    .filter(a => a.hasActiveContract)
    .sort((a, b) => new Date(b.contractStart) - new Date(a.contractStart));
});

const mockDevices = [
  { id: 1, code: '#HF32A1', status: 'ONLINE' },
  { id: 2, code: '#S23W1D', status: 'OFFLINE' }
];

onMounted(async () => {
  await Promise.all([
    profileStore.fetchProfiles(),
    contractStore.fetchAssociations()
  ]);
});
</script>

<style scoped>
.dashboard-container {
  /* Añade padding extra abajo para que no se pegue al fondo al hacer scroll */
  padding-bottom: 4rem; 
}

/* --- HEADER Y LÍNEAS CIAN --- */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  gap: 1.5rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 800; /* Gabarito Extrabold */
  margin: 0;
  white-space: nowrap;
}

/* El truco para hacer las líneas degradadas a los lados del título */
.dashboard-header::before,
.dashboard-header::after {
  content: '';
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--blue-cerulean), transparent);
  opacity: 0.5;
  max-width: 350px;
}

/* --- GRID DE 3 COLUMNAS --- */
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

/* Textos de estado */
.loading-text, .error-text, .empty-text {
  text-align: center;
  font-size: 0.9rem;
  padding: 2rem;
  border-radius: 8px;
  background-color: rgba(255,255,255,0.05);
}

.error-text {
  color: var(--red-coral);
  border: 1px solid rgba(255, 87, 87, 0.3);
}

.empty-text {
  color: var(--light-grey);
  opacity: 0.7;
}

/* Responsive básico para pantallas pequeñas */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>