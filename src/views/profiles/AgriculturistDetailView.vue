<template>
  <div class="page-container" v-if="profile">
    <header class="back-header" @click="$router.back()">
      <h1>&lt; Agriculturist</h1>
    </header>

    <div class="detail-layout">
      <div class="profile-header-card">
        <div class="left-info">
          <img :src="profile.profilePicture || 'https://via.placeholder.com/100'" :alt="profile.name" class="big-avatar" />
          <div class="names">
            <h2>{{ profile.name }}</h2>
            <p>{{ profile.roleName }}</p>
          </div>
        </div>
        
        </div>

      <div class="info-fields">
        <div class="field-group">
          <label class="blue-label">Association</label>
          <div class="dark-box">{{ associationName }}</div>
        </div>

        <div class="field-group">
          <label class="green-label">Email</label>
          <div class="dark-box">{{ profile.email }}</div>
        </div>

        <div class="field-group">
          <label class="red-label">Phone</label>
          <div class="dark-box">{{ profile.phone }}</div>
        </div>

        <div class="field-group">
          <label class="green-label">Role</label>
          <div class="dark-box">{{ profile.roleName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProfileStore } from '@/modules/profiles/application/useProfileStore';
import { useContractsStore } from '@/modules/contracts/application/useContractsStore'; // Importamos el de contratos

const route = useRoute();
const profileStore = useProfileStore();
const contractsStore = useContractsStore();

const profile = computed(() => profileStore.currentProfile);

// Buscamos el nombre de la asociación usando el ID
const associationName = computed(() => {
  if (!profile.value) return 'Loading...';
  
  // Extraemos el ID (manejando posibles variaciones de mayúsculas/minúsculas)
  const assocId = profile.value.associationId || profile.value.AssociationId;
  
  // Buscamos en la lista de asociaciones del store de contratos
  const assoc = contractsStore.associations.find(a => String(a.id) === String(assocId));
  
  return assoc ? assoc.name : `Asociación ID: ${assocId}`;
});

onMounted(async () => {
  await profileStore.fetchProfileById(route.params.id);
  if (contractsStore.associations.length === 0) {
    await contractsStore.fetchAssociations(); // ← mismo nombre que en el dashboard
  }
});
</script>

<style scoped>
.page-container { padding-bottom: 2rem; width: 100%; max-width: 900px; }
.back-header { cursor: pointer; margin-bottom: 2.5rem; display: inline-block; }
.back-header h1 { font-size: 2rem; font-weight: 700; color: var(--white); margin: 0; }
.back-header:hover { opacity: 0.8; }

.detail-layout { display: flex; flex-direction: column; gap: 2rem; }

/* HEADER DEL PERFIL */
.profile-header-card {
  background-color: #161819;
  padding: 2rem;
  border-radius: 16px;
  display: flex;
  align-items: center; /* Simplificado ya que no hay toggle a la derecha */
}

.left-info { display: flex; gap: 1.5rem; align-items: center; }
.big-avatar { width: 100px; height: 100px; border-radius: 12px; object-fit: cover; }
.names h2 { font-size: 1.8rem; margin: 0 0 0.5rem 0; color: var(--white); }
.names p { margin: 0; color: var(--light-grey); font-size: 1rem; }

.right-status { display: flex; align-items: center; gap: 1rem; }
.status-text { font-weight: 600; font-size: 1.1rem; color: var(--red-coral); }
.status-text.active { color: var(--emerald-green); }

/* CAMPOS DE INFORMACIÓN */
.field-group { margin-bottom: 1.5rem; }
.blue-label { display: block; color: var(--blue-cerulean); margin-bottom: 0.5rem; font-weight: 600; }
.green-label { display: block; color: var(--emerald-green); margin-bottom: 0.5rem; font-weight: 600; }
.red-label { display: block; color: var(--red-coral); margin-bottom: 0.5rem; font-weight: 600; }

.dark-box {
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  background-color: #2a2e30;
  color: var(--white);
  font-family: var(--font-main);
}


</style>