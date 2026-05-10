<template>
  <div class="page-container">
    <header class="page-header">
      <div class="title-section">
        <div class="line-decorator"></div>
        <h1>Agriculturists</h1>
        <div class="line-decorator"></div>
      </div>
      
      <div class="action-container">
        <GtxButton variant="primary">LIST</GtxButton>
      </div>
    </header>

    <div v-if="profileStore.isLoading" class="feedback-msg">Cargando agricultores...</div>
    <div v-else-if="profileStore.error" class="feedback-msg error">{{ profileStore.error }}</div>
    
    <div v-else class="cards-grid">
      <ProfileCard 
        v-for="profile in agriculturists" 
        :key="profile.id" 
        :profile="profile" 
        @select="goToDetail"
      />
      
      <div v-if="agriculturists.length === 0" class="feedback-msg">
        No se encontraron usuarios con rol de Agricultor.
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/modules/profiles/application/useProfileStore';
import ProfileCard from '@/modules/profiles/ui/components/ProfileCard.vue';
import GtxButton from '@/shared/ui/GtxButton.vue';

const profileStore = useProfileStore();
const router = useRouter();

// FILTRO MÁGICO: Solo dejamos pasar roleId 4 y 5
const agriculturists = computed(() => {
  return profileStore.profiles.filter(user => user.roleId === 4 || user.roleId === 5);
});

onMounted(() => {
  profileStore.fetchProfiles();
});

const goToDetail = (profile) => {
  router.push(`/profiles/${profile.id}`);
};
</script>

<style scoped>
/* Tus estilos se mantienen iguales */
.page-container { padding-bottom: 2rem; width: 100%; }
.title-section { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 2rem; }
.title-section h1 { font-size: 2rem; font-weight: 700; color: var(--white); margin:0; }
.line-decorator { flex-grow: 1; height: 2px; background: linear-gradient(90deg, transparent, rgba(255, 87, 87, 0.5), transparent); max-width: 250px; }
.action-container { margin-bottom: 2.5rem; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.feedback-msg { text-align: center; color: var(--blue-cerulean); margin-top: 3rem; grid-column: 1 / -1; }
.feedback-msg.error { color: var(--red-coral); }
</style>