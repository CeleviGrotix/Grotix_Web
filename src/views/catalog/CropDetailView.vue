<template>
  <div class="page-container" v-if="crop">
    <header class="back-header" @click="$router.back()">
      <h1>&lt; Crop</h1>
    </header>

    <div class="detail-layout">
      <div class="crop-main-card">
        <div class="crop-header-info">
          <img :src="crop.photoUrl" :alt="crop.commonName" class="big-image" />
          <div class="names">
            <h2>{{ crop.commonName }}</h2>
            <p>{{ crop.scientificName }}</p>
          </div>
        </div>
        
        <div class="form-group">
          <label>Maximum Stress Time</label>
          <select class="dark-select" v-model="crop.maxStressTime">
            <option :value="0">0 min</option>
            <option :value="30">30 min</option>
            <option :value="60">60 min</option>
            <option :value="120">120 min</option>
          </select>
        </div>

        <div class="actions">
          <GtxButton variant="primary">SAVE</GtxButton>
          <GtxButton variant="outline" style="border-color: var(--red-coral); color: var(--red-coral)">DELETE</GtxButton>
        </div>
      </div>

      <div class="statistics-section">
        <h2 class="stats-title">Statistics</h2>
        
        <div class="stat-row">
          <label class="stat-label">Optimal Temperature</label>
          <div class="slider-wrapper">
            <span class="pct">0 %</span>
            <div class="range-container">
              <input type="range" min="0" max="100" v-model="crop.optimalTemperature" class="gtx-slider" />
              <span class="thumb-value" :style="{ left: crop.optimalTemperature + '%' }">{{ crop.optimalTemperature }}%</span>
            </div>
            <span class="pct">100%</span>
          </div>
        </div>

        <div class="stat-row">
          <label class="stat-label">Optimal Humidity</label>
          <div class="slider-wrapper">
            <span class="pct">0 %</span>
            <div class="range-container">
              <input type="range" min="0" max="100" v-model="crop.optimalHumidity" class="gtx-slider" />
              <span class="thumb-value" :style="{ left: crop.optimalHumidity + '%' }">{{ crop.optimalHumidity }}%</span>
            </div>
            <span class="pct">100%</span>
          </div>
        </div>

        <div class="stat-row">
          <label class="stat-label">Optimal Light</label>
          <div class="slider-wrapper">
            <span class="pct">0 %</span>
            <div class="range-container">
              <input type="range" min="0" max="100" v-model="crop.optimalLight" class="gtx-slider" />
              <span class="thumb-value" :style="{ left: crop.optimalLight + '%' }">{{ crop.optimalLight }}%</span>
            </div>
            <span class="pct">100%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCatalogStore } from '@/modules/catalog/application/useCatalogStore';
import GtxButton from '@/shared/ui/GtxButton.vue';

const route = useRoute();
const catalogStore = useCatalogStore();

const crop = computed(() => catalogStore.currentCrop);

onMounted(() => {
  catalogStore.fetchCropById(route.params.id);
});
</script>

<style scoped>
.page-container { padding-bottom: 2rem; width: 100%; }
.back-header { cursor: pointer; margin-bottom: 2.5rem; display: inline-block; }
.back-header h1 { font-size: 2rem; font-weight: 700; color: var(--white); margin: 0; }
.back-header:hover { opacity: 0.8; }

.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

/* Tarjeta Izquierda */
.crop-main-card { background-color: #161819; padding: 2rem; border-radius: 16px; }
.crop-header-info { display: flex; gap: 1.5rem; margin-bottom: 3rem; align-items: center;}
.big-image { width: 120px; height: 120px; border-radius: 12px; object-fit: cover; }
.names h2 { font-size: 1.8rem; margin: 0 0 0.5rem 0; color: var(--white); }
.names p { margin: 0; color: var(--light-grey); font-size: 0.9rem; font-style: italic; }

.form-group { margin-bottom: 3rem; }
.form-group label { display: block; color: var(--emerald-green, #01A070); margin-bottom: 0.8rem; font-weight: 600;}
.dark-select {
  width: 100%; max-width: 200px; padding: 12px; border-radius: 8px;
  background-color: #2a2e30; border: none; color: white; outline: none; font-family: var(--font-main);
}
.actions { display: flex; gap: 1rem; }

/* Sección Derecha: Estadísticas */
.statistics-section { padding-top: 1rem; }
.stats-title { font-size: 1.8rem; color: var(--white); margin-bottom: 3rem; text-align: center;}

.stat-row { margin-bottom: 3rem; }
.stat-label { display: block; color: var(--blue-cerulean, #40BFE2); margin-bottom: 1rem; font-weight: 600; }

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}
.pct { font-size: 1rem; color: var(--white); font-weight: 600; min-width: 40px;}

/* Magia del Slider de Figma */
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
</style>