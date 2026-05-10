<template>
  <div class="page-container">
    <header class="page-header">
      <div class="title-section">
        <div class="line-decorator"></div>
        <h1>Crops</h1>
        <div class="line-decorator"></div>
      </div>
      
      <div class="search-bar">
        <div class="search-wrapper">
          <img src="@/shared/assets/icons/search.svg" class="search-icon" />
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search by common or scientific name" 
            class="search-input"
          />
        </div>
      </div>

      <div class="action-container">
        <GtxButton variant="primary" @click="$router.push('/crops/new')">ADD CROP</GtxButton>
      </div>
    </header>

    <div v-if="catalogStore.isLoading" class="feedback-msg">Cargando catálogo desde el servidor...</div>
    <div v-else-if="catalogStore.error" class="feedback-msg error">{{ catalogStore.error }}</div>
    
    <div v-else class="cards-grid">
      <CropCard 
        v-for="crop in filteredCrops" 
        :key="crop.id" 
        :crop="crop" 
        @select="goToDetail"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCatalogStore } from '@/modules/catalog/application/useCatalogStore';
import CropCard from '@/modules/catalog/ui/components/CropCard.vue';
import GtxButton from '@/shared/ui/GtxButton.vue';
const catalogStore = useCatalogStore();
const router = useRouter();

// Variable para el buscador
const searchQuery = ref('');

// Computed Property que filtra automáticamente en vivo
const filteredCrops = computed(() => {
  if (!searchQuery.value) return catalogStore.crops;
  const lowerQuery = searchQuery.value.toLowerCase();
  
  return catalogStore.crops.filter(crop => 
    crop.commonName.toLowerCase().includes(lowerQuery) || 
    crop.scientificName.toLowerCase().includes(lowerQuery)
  );
});

onMounted(() => {
  catalogStore.fetchCrops();
});

const goToDetail = (crop) => {
  router.push(`/crops/${crop.id}`);
};
</script>

<style scoped>
/* Pega tus estilos exactamente como los tenías antes, no cambian */
.header-actions {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  align-items: center;
  width: 100%;
}
.action-container {
  display: flex;
  justify-content: flex-start; /* Tira el botón hacia la derecha */
  margin-bottom: 2rem; /* Separa el botón de las tarjetas de abajo */
}
.page-container { padding-bottom: 2rem; width: 100%; }
.title-section { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 2rem; }
.title-section h1 { font-size: 2rem; font-weight: 700; color: var(--white); margin:0; }
.line-decorator { flex-grow: 1; height: 2px; background: linear-gradient(90deg, transparent, rgba(255, 87, 87, 0.5), transparent); max-width: 250px; }
.search-bar { 
  margin-bottom: 1.5rem; /* Le da el espacio de separación hacia abajo */
}
.search-wrapper { 
  position: relative; 
  display: flex; 
  align-items: center; 
}
.search-icon { position: absolute; left: 15px; width: 20px; filter: invert(60%) sepia(20%) saturate(500%) hue-rotate(150deg); }
.search-input { width: 100%; padding: 16px 20px 16px 45px; border-radius: 8px; background-color: #1e3a45; border: none; color: white; font-family: var(--font-main); font-size: 1rem; outline: none; }
.search-input::placeholder { color: #8bb8c7; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.feedback-msg { text-align: center; color: var(--blue-cerulean); margin-top: 3rem; }
.feedback-msg.error { color: var(--red-coral); }
</style>