<template>
  <div class="page-container">
    <header class="back-header" @click="$router.back()">
      <h1>&lt; New Crop</h1>
    </header>

    <div class="detail-layout">
      <!-- FORM -->
      <div class="crop-main-card">
        <h2 class="form-title">Create a new Crop</h2>

        <div class="form-group">
          <label>Common Name</label>
          <input type="text" class="dark-input" v-model="newCrop.commonName" placeholder="Ej: Manzana" />
        </div>

        <div class="form-group">
          <label>Scientific Name</label>
          <input type="text" class="dark-input" v-model="newCrop.scientificName" placeholder="Ej: Malus domestica" />
        </div>

        <div class="form-group">
          <label>Image URL</label>
          <input type="text" class="dark-input" v-model="newCrop.imageUrl" placeholder="https://..." />
        </div>

        <div class="form-group">
          <label>Maximum Stress Time (min)</label>
          <input type="number" class="dark-input" v-model="newCrop.maxStressTime" />
        </div>

        <div class="actions">
          <GtxButton variant="primary" @click="handleCreate">CREATE CROP</GtxButton>
        </div>
      </div>

      <!-- SLIDERS -->
      <div class="statistics-section">
        <h2 class="stats-title">Optimal Statistics</h2>

        <div class="stat-row">
          <label class="stat-label">Temperature</label>
          <div class="slider-wrapper">
            <span class="pct">0%</span>
            <div class="range-container">
              <input type="range" min="0" max="100" v-model="newCrop.optimalTemperature" class="gtx-slider" />
              <span class="thumb-value" :style="{ left: newCrop.optimalTemperature + '%' }">{{ newCrop.optimalTemperature }}%</span>
            </div>
            <span class="pct">100%</span>
          </div>
        </div>

        <div class="stat-row">
          <label class="stat-label">Humidity</label>
          <div class="slider-wrapper">
            <span class="pct">0%</span>
            <div class="range-container">
              <input type="range" min="0" max="100" v-model="newCrop.optimalHumidity" class="gtx-slider" />
              <span class="thumb-value" :style="{ left: newCrop.optimalHumidity + '%' }">{{ newCrop.optimalHumidity }}%</span>
            </div>
            <span class="pct">100%</span>
          </div>
        </div>

        <div class="stat-row">
          <label class="stat-label">Light</label>
          <div class="slider-wrapper">
            <span class="pct">0%</span>
            <div class="range-container">
              <input type="range" min="0" max="100" v-model="newCrop.optimalLight" class="gtx-slider" />
              <span class="thumb-value" :style="{ left: newCrop.optimalLight + '%' }">{{ newCrop.optimalLight }}%</span>
            </div>
            <span class="pct">100%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCatalogStore } from '@/modules/catalog/application/useCatalogStore';
import GtxButton from '@/shared/ui/GtxButton.vue';

const router = useRouter();
const catalogStore = useCatalogStore();

const newCrop = ref({
  commonName: '',
  scientificName: '',
  imageUrl: '',
  maxStressTime: 0,
  optimalTemperature: 50,
  optimalHumidity: 50,
  optimalLight: 50
});

const handleCreate = async () => {
  if (!newCrop.value.commonName) {
    alert('El nombre común es obligatorio');
    return;
  }
  try {
    await catalogStore.addCrop(newCrop.value);
    alert('¡Cultivo creado con éxito!');
    router.push('/crops');
  } catch {
    alert('Hubo un error al crear. Revisa la consola.');
  }
};
</script>

<style scoped>
.page-container {
  padding-bottom: 2rem;
  width: 100%;
}

.back-header {
  cursor: pointer;
  margin-bottom: 2.5rem;
  display: inline-block;
}

.back-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--white);
  margin: 0;
}

.back-header:hover { opacity: 0.8; }

.form-title {
  color: white;
  margin-bottom: 2rem;
  font-size: 1.4rem;
}

/* --- GRID 2 COLUMNAS --- */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.crop-main-card {
  background-color: #161819;
  padding: 2rem;
  border-radius: 16px;
}

.form-group { margin-bottom: 1.5rem; }

.form-group label {
  display: block;
  color: var(--emerald-green);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.dark-input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background-color: #2a2e30;
  border: none;
  color: white;
  outline: none;
  font-family: var(--font-main);
  box-sizing: border-box;
}

.dark-input::placeholder { color: #777; }

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

/* --- STATISTICS --- */
.statistics-section { padding-top: 1rem; }

.stats-title {
  font-size: 1.8rem;
  color: var(--white);
  margin-bottom: 3rem;
  text-align: center;
}

.stat-row { margin-bottom: 3rem; }

.stat-label {
  display: block;
  color: var(--blue-cerulean);
  margin-bottom: 1rem;
  font-weight: 600;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.pct {
  font-size: 0.9rem;
  color: var(--white);
  font-weight: 600;
  min-width: 36px;
  flex-shrink: 0;
}

.range-container {
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.gtx-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(to right, #FF5757 0%, #E29140 50%, #4FD16C 100%);
  outline: none;
  margin: 0;
}

.gtx-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
}

.thumb-value {
  position: absolute;
  top: 20px;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: var(--light-grey);
}

/* ============================================================
   TABLET (≤ 1024px)
   ============================================================ */
@media (max-width: 1024px) {
  .back-header h1 { font-size: 1.75rem; }
  .detail-layout { gap: 2rem; }
}

/* ============================================================
   MÓVIL (≤ 768px): 1 columna
   ============================================================ */
@media (max-width: 768px) {
  .back-header h1 { font-size: 1.4rem; }

  .detail-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .crop-main-card { padding: 1.25rem; }

  .stats-title { font-size: 1.4rem; margin-bottom: 2rem; }
  .stat-row { margin-bottom: 2rem; }

  .actions {
    flex-direction: column;
  }

  .actions :deep(.gtx-btn) {
    width: 100%;
  }
}

/* ============================================================
   MÓVIL PEQUEÑO (≤ 480px)
   ============================================================ */
@media (max-width: 480px) {
  .back-header h1 { font-size: 1.2rem; }
  .pct { font-size: 0.75rem; min-width: 28px; }
}
</style>