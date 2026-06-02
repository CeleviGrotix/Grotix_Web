<template>
  <div class="profile-page-wrapper">
    <div v-if="isLoading && !profile" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando tu perfil Grotix...</p>
    </div>

    <div v-else-if="profile" class="profile-container">
      <header class="profile-header">
        <h1>Mi Perfil</h1>
        <p class="subtitle">
          Gestiona tu información personal y de cuenta
        </p>
      </header>

      <div class="profile-layout">
        <aside class="profile-sidebar">
          <div class="main-profile-card">
            <div class="avatar-section">
              <div
                class="avatar-wrapper"
                :class="{ 'status-active': profile.isActive }"
              >
                <img
                  v-if="profile.profilePicture"
                  :src="profile.profilePicture"
                  alt="Foto de perfil"
                  class="avatar-img"
                />

                <div v-else class="avatar-placeholder">
                  {{ userInitials }}
                </div>

                <span
                  class="status-indicator"
                  title="Activo"
                ></span>
              </div>
            </div>

            <div class="profile-identity">
              <h2>{{ profile.name || 'Usuario Grotix' }}</h2>

              <p class="email">
                {{ profile.email }}
              </p>

              <div class="badges-row">
                <GtxBadge
                  :text="profile.isActive ? 'ACTIVE' : 'INACTIVE'"
                  :variant="profile.isActive ? 'success' : 'warning'"
                />

                <GtxBadge
                  text="STAFF"
                  variant="info"
                />
              </div>
            </div>

            <div class="sidebar-actions">
              <GtxButton
                v-if="!isEditing"
                variant="secondary"
                @click="startEditing"
                style="width: 100%;"
              >
                EDIT PROFILE
              </GtxButton>

              <GtxButton
                variant="danger"
                @click="handleLogout"
                style="width: 100%;"
              >
                LOG OUT
              </GtxButton>
            </div>
          </div>
        </aside>

        <section class="profile-details-section">
          <div class="details-card">
            <div class="card-header">
              <h3>Información Personal</h3>
            </div>

            <div
              v-if="!isEditing"
              class="info-grid"
            >
              <div class="info-item">
                <label>Correo Electrónico</label>
                <p class="value">
                  {{ profile.email }}
                </p>
              </div>

              <div class="info-item">
                <label>Nombre Completo</label>
                <p class="value">
                  {{ profile.name || 'No establecido' }}
                </p>
              </div>

              <div class="info-item">
                <label>ID de Usuario</label>
                <p class="value mono">
                  #{{ profile.id }}
                </p>
              </div>

              <div class="info-item">
                <label>Teléfono</label>
                <p class="value">
                  {{ profile.phone || 'No establecido' }}
                </p>
              </div>

              <div class="info-item">
                <label>Identificación (Tax ID)</label>
                <p class="value">
                  {{ profile.taxId || 'No establecido' }}
                </p>
              </div>
            </div>

            <form
              v-else
              class="edit-form"
              @submit.prevent="handleSave"
            >
              <div class="form-grid">
                <div class="form-group readonly">
                  <label>
                    Correo Electrónico (No editable)
                  </label>

                  <GtxInput
                    :model-value="profile.email"
                    disabled
                  />
                </div>

                <div class="form-group">
                  <label for="edit-name">
                    Nombre Completo
                  </label>

                  <GtxInput
                    id="edit-name"
                    v-model="editableForm.name"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div class="form-group">
                  <label for="edit-phone">
                    Teléfono
                  </label>

                  <GtxInput
                    id="edit-phone"
                    v-model="editableForm.phone"
                    placeholder="Ej: +51 987 654 321"
                  />
                </div>

                <div class="form-group">
                  <label for="edit-taxid">
                    Identificación Fiscal (Tax ID)
                  </label>

                  <GtxInput
                    id="edit-taxid"
                    v-model="editableForm.taxId"
                    placeholder="Tu Tax ID o RUC"
                  />
                </div>
              </div>

              <div class="form-actions">
                <GtxButton
                  type="button"
                  variant="secondary"
                  @click="cancelEditing"
                >
                  CANCEL
                </GtxButton>

                <GtxButton
                  type="submit"
                  variant="primary"
                  :loading="isLoading"
                >
                  SAVE CHANGES
                </GtxButton>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>

    <div v-else class="error-container">
      <h2>¡Ups! Algo salió mal.</h2>

      <p>
        {{ error || 'No pudimos cargar los datos de tu perfil.' }}
      </p>

      <GtxButton
        variant="primary"
        @click="retryLoad"
      >
        RETRY
      </GtxButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useAuthStore } from '@/modules/auth/application/useAuthStore';
import { useProfileStore } from '@/modules/profiles/application/useProfileStore';

import GtxBadge from '@/shared/ui/GtxBadge.vue';
import GtxButton from '@/shared/ui/GtxButton.vue';
import GtxInput from '@/shared/ui/GtxInput.vue';

const router = useRouter();

const authStore = useAuthStore();
const profileStore = useProfileStore();

const {
  currentProfile: profile,
  isLoading,
  error
} = storeToRefs(profileStore);

const isEditing = ref(false);

const editableForm = ref({
  name: '',
  phone: '',
  taxId: '',
  profilePicture: ''
});

const userInitials = computed(() => {
  if (!profile.value) return 'GX';

  const source =
    profile.value.name ||
    profile.value.email ||
    'GX';

  return source
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
});

onMounted(async () => {
  if (!profile.value) {
    await profileStore.fetchMyProfile();
  }
});

const retryLoad = async () => {
  await profileStore.fetchMyProfile();
};

const startEditing = () => {
  editableForm.value = {
    name: profile.value?.name || '',
    phone: profile.value?.phone || '',
    taxId: profile.value?.taxId || '',
    profilePicture:
      profile.value?.profilePicture || ''
  };

  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
};

const handleSave = async () => {
  try {
    await profileStore.updateCurrentProfile({
      ...editableForm.value
    });

    isEditing.value = false;
  } catch (err) {
    console.error(err);
    alert('Hubo un error al guardar los cambios.');
  }
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.profile-page-wrapper {
  min-height: 100vh;
  background: #0f111a;
  color: #e0e6ed;
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.profile-container {
  width: 100%;
  max-width: 1100px;
}

.profile-header {
  margin-bottom: 2rem;
}

.profile-header h1 {
  margin: 0;
  color: #fff;
  font-size: 2.5rem;
}

.subtitle {
  margin-top: 0.5rem;
  color: #8899a6;
}

.profile-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
}

.main-profile-card,
.details-card {
  background: #1a1d29;
  border: 1px solid #2d3748;
  border-radius: 20px;
}

.main-profile-card {
  padding: 2rem;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  width: 130px;
  height: 130px;
  margin: auto;
}

.avatar-img,
.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-img {
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #10b981;
  color: white;
  font-size: 3rem;
  font-weight: 800;
}

.status-indicator {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6b7280;
}

.status-active .status-indicator {
  background: #10b981;
}

.profile-identity h2 {
  color: white;
  margin: 1rem 0 0.5rem;
}

.email {
  color: #8899a6;
}

.badges-row {
  display: flex;
  justify-content: center;
  gap: .5rem;
  margin-top: 1rem;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.details-card {
  padding: 2rem;
}

.card-header {
  padding-bottom: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #2d3748;
}

.card-header h3 {
  margin: 0;
  color: white;
}

.info-grid,
.form-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(
    auto-fit,
    minmax(260px, 1fr)
  );
}

.info-item label {
  display: block;
  margin-bottom: .5rem;
  color: #8899a6;
  font-size: .85rem;
  text-transform: uppercase;
}

.value {
  margin: 0;
  padding: 1rem;
  background: #111827;
  border: 1px solid #2d3748;
  border-radius: 10px;
  color: white;
}

.mono {
  font-family: monospace;
}

.form-group label {
  display: block;
  margin-bottom: .5rem;
  color: white;
}

.form-group.readonly :deep(input) {
  opacity: .6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #2d3748;
}

.loading-overlay,
.error-container {
  margin: auto;
  text-align: center;
  padding: 4rem;
  background: #1a1d29;
  border-radius: 20px;
  border: 1px solid #2d3748;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
  border: 4px solid #2d3748;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-page-wrapper {
    padding: 1rem;
  }
}
</style>