<template>
  <div class="page-container">
    <header class="page-header">
      <div class="title-section">
        <div class="line-decorator"></div>
        <h1>Crops</h1>
        <div class="line-decorator"></div>
      </div>
      
      <div class="search-bar">
        <input type="text" placeholder="Search by common or scientific name" class="search-input"/>
      </div>
    </header>

    <div v-if="catalogStore.isLoading" class="feedback-msg">Cargando cultivos...</div>
    
    <div v-else class="cards-grid">
      <CropCard 
        v-for="crop in catalogStore.crops" 
        :key="crop.id" 
        :crop="crop" 
        @select="goToDetail"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCatalogStore } from '@/modules/catalog/application/useCatalogStore';
import CropCard from '@/modules/catalog/ui/components/CropCard.vue';

const catalogStore = useCatalogStore();
const router = useRouter();

onMounted(() => {
  catalogStore.fetchCrops();
});

const goToDetail = (crop) => {
  router.push(`/crops/${crop.id}`);
};
</script>

<style scoped>
/* Reutilizamos los mismos estilos base de agricultores */
.page-container { padding-bottom: 2rem; }
.title-section { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 2rem; }
.title-section h1 { font-size: 2rem; font-weight: 700; color: var(--white); margin:0; }
.line-decorator { flex-grow: 1; height: 2px; background: linear-gradient(90deg, transparent, rgba(255, 87, 87, 0.5), transparent); max-width: 250px; }

.search-bar { margin-bottom: 2rem; }
.search-input {
  width: 100%; padding: 16px 20px; border-radius: 8px;
  background-color: #1e3a45; border: none; color: white;
  font-family: var(--font-main); font-size: 1rem; outline: none;
}
.search-input::placeholder { color: #8bb8c7; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}
.feedback-msg { text-align: center; color: var(--blue-cerulean); margin-top: 3rem; }
</style>