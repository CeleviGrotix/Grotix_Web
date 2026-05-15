<template>
  <div class="page-container" v-if="profile">
    <header class="page-header">
      <div class="line-decorator"></div>
      <h1>Profile</h1>
      <div class="line-decorator"></div>
    </header>

    <div class="profile-card">
      <div class="profile-top">
        <img
          :src="profile.profilePicture || logoFallback"
          alt="Profile picture"
          class="avatar"
        />
        <div class="profile-names">
          <h2>{{ profile.name ?? profile.email }}</h2>
          <p>{{ profile.email }}</p>
          <GtxBadge :text="profile.isActive ? 'ACTIVE' : 'INACTIVE'" />
        </div>
      </div>

      <div class="info-fields">
        <div class="field-group">
          <label class="green-label">Email</label>
          <div class="dark-box">{{ profile.email }}</div>
        </div>

        <div class="field-group">
          <label class="green-label">Role</label>
          <div class="dark-box">Staff</div>
        </div>
      </div>

      <div class="actions">
        <GtxButton variant="primary" @click="goEdit">EDIT</GtxButton>
        <GtxButton variant="danger" @click="handleLogout">LOG OUT</GtxButton>
      </div>
    </div>
  </div>

  <div v-else class="feedback-msg">
    {{ isLoading ? 'Loading profile...' : 'Could not load profile.' }}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/application/useAuthStore';
import { axiosClient } from '@/shared/http/axiosClient';
import GtxBadge from '@/shared/ui/GtxBadge.vue';
import GtxButton from '@/shared/ui/GtxButton.vue';
import logoFallback from '@/shared/assets/icons/bar-icon.svg';

const router = useRouter();
const authStore = useAuthStore();

const profile = ref(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await axiosClient.get('/api/v1/profile/me');
    profile.value = response.data;
  } catch (e) {
    console.error('Error cargando perfil:', e);
  } finally {
    isLoading.value = false;
  }
});

const goEdit = () => alert('Edit coming soon');

const handleLogout = () => {
  authStore.logout();
  window.location.href = '/login';
};
</script>

<style scoped>
.page-container {
  max-width: 700px;
  width: 100%;
  padding-bottom: 2rem;
}

/* --- HEADER --- */
.page-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  white-space: nowrap;
}

.line-decorator {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--blue-cerulean), transparent);
  opacity: 0.5;
  max-width: 200px;
}

/* --- CARD --- */
.profile-card {
  background-color: #161819;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  background-color: #2a2e30;
  padding: 10px;
  flex-shrink: 0;
}

.profile-names h2 {
  margin: 0 0 0.3rem 0;
  font-size: 1.6rem;
  color: var(--white);
  word-break: break-word;
}

.profile-names p {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  color: var(--light-grey);
  word-break: break-word;
}

/* --- FIELDS --- */
.field-group { margin-bottom: 1.2rem; }

.green-label {
  display: block;
  color: var(--emerald-green);
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.dark-box {
  width: 100%;
  padding: 14px 16px;
  border-radius: 8px;
  background-color: #2a2e30;
  color: var(--white);
  font-family: var(--font-main);
  box-sizing: border-box;
  word-break: break-word;
}

/* --- ACTIONS --- */
.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.feedback-msg {
  text-align: center;
  color: var(--blue-cerulean);
  margin-top: 3rem;
}

/* ============================================================
   TABLET (≤ 1024px)
   ============================================================ */
@media (max-width: 1024px) {
  .page-container { max-width: 100%; }
  .page-header h1 { font-size: 1.75rem; }
}

/* ============================================================
   MÓVIL (≤ 768px)
   ============================================================ */
@media (max-width: 768px) {
  .page-header h1 { font-size: 1.5rem; }
  .line-decorator { max-width: 80px; }

  .profile-card { padding: 1.25rem; gap: 1.5rem; }

  .avatar {
    width: 72px;
    height: 72px;
    padding: 8px;
  }

  .profile-names h2 { font-size: 1.25rem; }

  /* Botones al ancho completo */
  .actions { flex-direction: column; }
  .actions :deep(.gtx-btn) { width: 100%; }
}

/* ============================================================
   MÓVIL PEQUEÑO (≤ 480px)
   ============================================================ */
@media (max-width: 480px) {
  .page-header h1 { font-size: 1.25rem; }
  .line-decorator { display: none; }

  .profile-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .avatar {
    width: 64px;
    height: 64px;
  }
}
</style>