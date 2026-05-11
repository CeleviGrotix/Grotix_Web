<template>
  <div class="page-container">
    <header class="page-header">
      <div class="title-section">
        <div class="line-decorator"></div>
        <h1>Search</h1>
        <div class="line-decorator"></div>
      </div>

      <div class="search-box-container">
        <div class="search-wrapper">
          <img src="@/shared/assets/icons/search.svg" class="search-icon" />
          <input
            v-model="searchStore.query"
            type="text"
            placeholder="Search agriculturist, contract or device"
            class="search-input"
            @input="debouncedSearch"
          />
        </div>
      </div>
    </header>

    //potoooooooooooooooo

    <div v-if="searchStore.isLoading" class="feedback-msg">Searching...</div>

    <div v-else class="results-grid">
      <template v-for="item in searchStore.results" :key="item.type + '-' + item.id">

        <div
          v-if="item.type === 'agriculturist'"
          class="res-card profile-card clickable-result"
          @click="router.push(`/profiles/${item.id}`)"
        >
          <img :src="item.imageUrl || 'https://via.placeholder.com/60'" class="res-avatar" />
          <div class="res-info">
            <h3>{{ item.title }}</h3>
            <p>{{ item.subtitle }}</p>
          </div>
        </div>

        <div
          v-else-if="item.type === 'association'"
          class="res-card assoc-card clickable-result"
          @click="router.push(`/contracts/${item.id}`)"
        >
          <div class="res-info">
            <h3>{{ item.title }}</h3>
            <p>{{ item.subtitle }}</p>
            <p class="status-line">
              Status:
              <span :style="{ color: getStatusDisplay(item.status).color, fontWeight: 'bold' }">
                {{ getStatusDisplay(item.status).text }}
              </span>
            </p>
          </div>
        </div>

        <div v-else-if="item.type === 'device'" class="res-card device-card">
          <div class="res-info">
            <h3 class="device-id">{{ item.title }}</h3>
            <p>{{ item.subtitle }}</p>
            <span class="timestamp">Last maintenance: {{ item.lastMaintenance ?? '—' }}</span>
          </div>
          <GtxBadge :text="item.status ?? 'UNKNOWN'" />
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useSearchStore } from '@/modules/search/application/useSearchStore';
import GtxBadge from '@/shared/ui/GtxBadge.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchStore = useSearchStore();

onMounted(() => {
  searchStore.performSearch('');
});

let timeout = null;
onUnmounted(() => {
  clearTimeout(timeout);
});

const debouncedSearch = (event) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    searchStore.performSearch(event.target.value);
  }, 400);
};

const getStatusDisplay = (status) => {
  if (!status || status === 'NoContract') return { text: 'NO CONTRACT', color: '#FFC107' };
  if (status === 'Active') return { text: 'ACTIVE', color: '#4FD16C' };
  if (['Suspended', 'Expired', 'Cancelled'].includes(status)) return { text: 'INACTIVE', color: '#FF5757' };
  return { text: status, color: '#8bb8c7' };
};
</script>

<style scoped>
.search-box-container { margin-bottom: 3rem; }
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 20px;
  width: 24px;
  height: 24px;
  pointer-events: none;
  filter: invert(60%) sepia(20%) saturate(500%) hue-rotate(150deg);
}

.search-input {
  width: 100%;
  padding: 16px 20px 16px 55px;
  border-radius: 8px;
  background-color: #1e3a45;
  border: none;
  color: white;
  font-family: var(--font-main);
  font-size: 1rem;
  outline: none;
}
.search-input:focus {
  border-color: var(--azul-ceruleo);
  outline: none;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.res-card {
  background-color: #161819;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: background 0.2s;
}
.res-card:hover { background-color: #1e2122; }

.res-avatar { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
.res-info { flex: 1; }
.res-info h3 { margin: 0; font-size: 1.1rem; color: white; }
.res-info p { margin: 4px 0 0; font-size: 0.85rem; color: #8bb8c7; }

.timestamp { display: block; font-size: 0.7rem; color: #555; margin-top: 8px; }
.status-val { color: var(--verde-pasto); font-weight: bold; }

.clickable-result {
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}
.clickable-result:hover {
  background-color: #1e2122;
  transform: translateX(5px);
  border-left: 4px solid #40BFE2;
}
.clickable-result:active {
  transform: scale(0.98);
}
</style>
