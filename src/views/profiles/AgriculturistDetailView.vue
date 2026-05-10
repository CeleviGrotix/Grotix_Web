<template>
  <div class="page-container" v-if="profile">
    <header class="back-header" @click="$router.back()">
      <h1>&lt; Agriculturist</h1>
    </header>

    <div class="detail-layout">
      <div class="profile-header-card">
        <div class="left-info">
          <img :src="profile.profilePicture" :alt="profile.name" class="big-avatar" />
          <div class="names">
            <h2>{{ profile.name }}</h2>
            <p>{{ profile.roleName }}</p>
          </div>
        </div>
        
        <div class="right-status">
          <span class="status-text" :class="{ active: profile.isActive }">
            {{ profile.isActive ? 'Active' : 'Inactive' }}
          </span>
          <label class="switch">
            <input type="checkbox" v-model="profile.isActive">
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <div class="info-fields">
        <div class="field-group">
          <label class="blue-label">Association</label>
          <div class="dark-box">{{ profile.association }}</div>
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

const route = useRoute();
const profileStore = useProfileStore();

const profile = computed(() => profileStore.currentProfile);

onMounted(() => {
  profileStore.fetchProfileById(route.params.id);
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
  justify-content: space-between;
  align-items: center;
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

/* TOGGLE SWITCH (Reutilizado) */
.switch { position: relative; display: inline-block; width: 50px; height: 26px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--red-coral); transition: .4s; }
.slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: var(--emerald-green); }
input:checked + .slider:before { transform: translateX(24px); }
.slider.round { border-radius: 24px; }
.slider.round:before { border-radius: 50%; }
</style>