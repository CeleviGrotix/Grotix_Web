<template>
  <div class="page-container">
    <header class="page-header">
      <div class="title-section">
        <div class="line-decorator"></div>
        <h1>Agriculturists</h1>
        <div class="line-decorator"></div>
      </div>
      
      <div class="action-buttons">
        <GtxButton variant="primary">LIST</GtxButton>
        <GtxButton variant="outline" @click="openAddModal">ADD</GtxButton>
      </div>
    </header>

    <div v-if="profileStore.isLoading" class="feedback-msg">
      Cargando agricultores...
    </div>
    <div v-else-if="profileStore.error" class="feedback-msg error">
      {{ profileStore.error }}
    </div>

    <div v-else class="cards-grid">
      <ProfileCard 
        v-for="agriculturist in profileStore.profiles" 
        :key="agriculturist.id" 
        :profile="agriculturist" 
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProfileStore } from '@/modules/profiles/application/useProfileStore';
import ProfileCard from '@/modules/profiles/ui/components/ProfileCard.vue';
import GtxButton from '@/shared/ui/GtxButton.vue';

// Inicializamos el orquestador (Store)
const profileStore = useProfileStore();

onMounted(() => {
  // Al montar la vista, le decimos a la capa de Aplicación que haga su trabajo
  profileStore.fetchProfiles();
});

const openAddModal = () => {
  console.log('Aquí abriremos el formulario para un nuevo agricultor en el futuro');
};
</script>

<style scoped>
.page-container {
  width: 100%;
  padding-bottom: 2rem;
}

.page-header {
  margin-bottom: 2.5rem;
}

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
  margin: 0;
  color: var(--white);
}

.line-decorator {
  flex-grow: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 87, 87, 0.5), transparent); /* Línea roja que vi en tu Figma */
  max-width: 250px;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.cards-grid {
  display: grid;
  /* Grid responsivo: 1 columna en móvil, 2 en tablet, 3 en pantallas grandes */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feedback-msg {
  text-align: center;
  font-size: 1.2rem;
  color: var(--blue-cerulean);
  margin-top: 3rem;
}

.feedback-msg.error {
  color: var(--red-coral);
}
</style>