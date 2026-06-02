<template>
  <div class="page-container">
    <header class="page-header">
      <div class="title-section">
        <div class="line-decorator"></div>
        <h1>Associations & Contracts</h1>
        <div class="line-decorator"></div>
      </div>

      <div class="header-actions">
        <div class="search-wrapper">
          <img src="@/shared/assets/icons/search.svg" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search associations by name or email..."
            class="search-input"
          />
        </div>

        <GtxButton variant="primary" @click="$router.push('/contracts/new-association')">
          ADD ASSOCIATION
        </GtxButton>
      </div>
    </header>

    <div v-if="contractsStore.isLoading" class="feedback-msg">Cargando asociaciones...</div>
    <div v-else-if="contractsStore.error" class="feedback-msg error">{{ contractsStore.error }}</div>

    <div v-else class="cards-grid">
      <div
        v-for="assoc in filteredAssociations"
        :key="assoc.id"
        class="assoc-card"
        @click="$router.push(`/contracts/${assoc.id}`)"
      >
        <div class="assoc-icon">🏢</div>
        <div class="assoc-info">
          <h3>{{ assoc.name }}</h3>
          <p>{{ assoc.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useContractsStore } from '@/modules/contracts/application/useContractsStore';
import GtxButton from '@/shared/ui/GtxButton.vue';

const contractsStore = useContractsStore();
const searchQuery = ref('');

const filteredAssociations = computed(() => {
  const associations = contractsStore.associations;
  if (!searchQuery.value) return associations;
  const query = searchQuery.value.toLowerCase();
  return associations.filter(assoc =>
    assoc.name.toLowerCase().includes(query) ||
    assoc.email.toLowerCase().includes(query)
  );
});

onMounted(() => {
  contractsStore.fetchAssociations();
});
</script>

<style scoped>
.page-container {
  padding-bottom: 2rem;
  width: 100%;
}

/* --- HEADER --- */
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

/* --- ACTIONS: search + botón en fila --- */
.header-actions {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
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

.search-input::placeholder {
  color: #8bb8c7;
}

/* --- GRID --- */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.assoc-card {
  display: flex;
  gap: 1rem;
  align-items: center;
  background-color: #161819;
  padding: 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.assoc-card:hover {
  transform: translateY(-3px);
  background-color: #1e2122;
}

.assoc-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.assoc-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--white);
  font-size: 1.2rem;
}

.assoc-info p {
  margin: 0;
  color: var(--light-grey);
  font-size: 0.9rem;
}

.feedback-msg {
  text-align: center;
  color: var(--blue-cerulean);
  margin-top: 3rem;
}

.feedback-msg.error {
  color: var(--red-coral);
}

/* ============================================================
   TABLET (≤ 1024px)
   ============================================================ */
@media (max-width: 1024px) {
  .title-section h1 {
    font-size: 1.75rem;
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

/* ============================================================
   MÓVIL (≤ 768px)
   ============================================================ */
@media (max-width: 768px) {
  .title-section h1 {
    font-size: 1.4rem;
    white-space: normal;
    text-align: center;
  }

  .line-decorator {
    max-width: 60px;
  }

  /* Search y botón se apilan verticalmente */
  .header-actions {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .search-wrapper {
    width: 100%;
  }

  /* Botón ocupa todo el ancho */
  .header-actions :deep(.gtx-btn) {
    width: 100%;
    justify-content: center;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .assoc-card {
    padding: 1.25rem;
  }
}

/* ============================================================
   MÓVIL PEQUEÑO (≤ 480px)
   ============================================================ */
@media (max-width: 480px) {
  .title-section h1 {
    font-size: 1.2rem;
  }

  .line-decorator {
    display: none;
  }

  .search-input {
    font-size: 0.9rem;
    padding: 13px 15px 13px 40px;
  }

  .assoc-info h3 {
    font-size: 1rem;
  }
}
</style>