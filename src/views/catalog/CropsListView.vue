<template>
  <div class="page-container">
    <header class="page-header">
      <div class="title-section">
        <div class="line-decorator"></div>
        <h1>Crops</h1>
        <div class="line-decorator"></div>
      </div>

      <div class="header-actions">
        <div class="search-wrapper">
          <img src="@/shared/assets/icons/search.svg" class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by common or scientific name"
            class="search-input"
          />
        </div>

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
const searchQuery = ref('');

const filteredCrops = computed(() => {
  if (!searchQuery.value) return catalogStore.crops;
  const lowerQuery = searchQuery.value.toLowerCase();
  return catalogStore.crops.filter(crop =>
    crop.commonName.toLowerCase().includes(lowerQuery) ||
    crop.scientificName.toLowerCase().includes(lowerQuery)
  );
});

onMounted(() => catalogStore.fetchCrops());

const goToDetail = (crop) => router.push(`/crops/${crop.id}`);
</script>

<style scoped>
.page-container {
  padding-bottom: 2rem;
  width: 100%;
}

/* --- TITLE --- */
.title-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.title-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--white);
  margin: 0;
  white-space: nowrap;
}

.line-decorator {
  flex-grow: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 87, 87, 0.5), transparent);
  max-width: 250px;
}

/* --- SEARCH + BOTÓN EN FILA --- */
.header-actions {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: center;
  width: 100%;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 15px;
  width: 20px;
  filter: invert(60%) sepia(20%) saturate(500%) hue-rotate(150deg);
}

.search-input {
  width: 100%;
  padding: 16px 20px 16px 45px;
  border-radius: 8px;
  background-color: #1e3a45;
  border: none;
  color: white;
  font-family: var(--font-main);
  font-size: 1rem;
  outline: none;
}

.search-input::placeholder { color: #8bb8c7; }

/* --- GRID --- */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.feedback-msg { text-align: center; color: var(--blue-cerulean); margin-top: 3rem; }
.feedback-msg.error { color: var(--red-coral); }

/* ============================================================
   TABLET (≤ 1024px)
   ============================================================ */
@media (max-width: 1024px) {
  .title-section h1 { font-size: 1.75rem; }

  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

/* ============================================================
   MÓVIL (≤ 768px)
   ============================================================ */
@media (max-width: 768px) {
  .title-section h1 {
    font-size: 1.5rem;
    white-space: normal;
    text-align: center;
  }

  .line-decorator { max-width: 60px; }

  /* Search y botón se apilan */
  .header-actions {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .search-wrapper { width: 100%; }

  .header-actions :deep(.gtx-btn) {
    width: 100%;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* ============================================================
   MÓVIL PEQUEÑO (≤ 480px)
   ============================================================ */
@media (max-width: 480px) {
  .title-section h1 { font-size: 1.25rem; }
  .line-decorator { display: none; }

  .search-input {
    font-size: 0.9rem;
    padding: 13px 15px 13px 40px;
  }
}
</style>