<template>
  <div class="profile-page-wrapper">
    <div v-if="isLoading && !profile" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando tu perfil Grotix...</p>
    </div>

    <div v-else-if="profile" class="profile-container">
      <header class="profile-header">
        <h1>Mi Perfil</h1>
        <p class="subtitle">Gestiona tu información personal y de cuenta</p>
      </header>

      <div class="profile-layout">
        <aside class="profile-sidebar">
          <div class="main-profile-card">
            <div class="avatar-section">
              <div class="avatar-wrapper" :class="{ 'status-active': profile.isActive }">
                <img
                  v-if="profile.profilePicture"
                  :src="profile.profilePicture"
                  alt="Foto de perfil"
                  class="avatar-img"
                />
                <div v-else class="avatar-placeholder">
                  {{ userInitials }}
                </div>
                <span class="status-indicator" title="Activo"></span>
              </div>
            </div>
            
            <div class="profile-identity">
              <h2>{{ profile.name || 'Usuario Grotix' }}</h2>
              <p class="email">{{ profile.email }}</p>
              <div class="badges-row">
                <GtxBadge :text="profile.isActive ? 'ACTIVE' : 'INACTIVE'" :variant="profile.isActive ? 'success' : 'warning'" />
                <GtxBadge text="STAFF" variant="info" />
              </div>
            </div>

            <div class="sidebar-actions">
              <GtxButton v-if="!isEditing" variant="secondary" @click="startEditing" style="width: 100%;">
                EDIT PROFILE
              </GtxButton>
              <GtxButton variant="danger" @click="handleLogout" style="width: 100%;">
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

            <div v-if="!isEditing" class="info-grid">
              <div class="info-item">
                <label>Correo Electrónico</label>
                <p class="value">{{ profile.email }}</p>
              </div>
              
              <div class="info-item">
                <label>Nombre Completo</label>
                <p class="value">{{ profile.name || 'No establecido' }}</p>
              </div>

              <div class="info-item">
                <label>ID de Usuario</label>
                <p class="value mono">#{{ profile.id }}</p>
              </div>

              <div class="info-item">
                <label>Teléfono</label>
                <p class="value">{{ profile.phone || 'No establecido' }}</p>
              </div>

              <div class="info-item">
                <label>Identificación (Tax ID)</label>
                <p class="value">{{ profile.taxId || 'No establecido' }}</p>
              </div>
            </div>

            <form v-else @submit.prevent="handleSave" class="edit-form">
              <div class="form-grid">
                <div class="form-group readonly">
                  <label>Correo Electrónico (No editable)</label>
                  <GtxInput :model-value="profile.email" disabled />
                </div>

                <div class="form-group">
                  <label for="edit-name">Nombre Completo</label>
                  <GtxInput 
                    id="edit-name"
                    v-model="editableForm.name" 
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div class="form-group">
                  <label for="edit-phone">Teléfono</label>
                  <GtxInput 
                    id="edit-phone"
                    v-model="editableForm.phone" 
                    placeholder="Ej: +51 987 654 321"
                  />
                </div>

                <div class="form-group">
                  <label for="edit-taxid">Identificación Fiscal (Tax ID)</label>
                  <GtxInput 
                    id="edit-taxid"
                    v-model="editableForm.taxId" 
                    placeholder="Tu Tax ID o RUC"
                  />
                </div>
              </div>

              <div class="form-actions">
                <GtxButton variant="secondary" type="button" @click="cancelEditing">CANCEL</GtxButton>
                <GtxButton variant="primary" type="submit" :loading="isLoading">SAVE CHANGES</GtxButton>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>

    <div v-else class="error-container">
      <h2>¡Ups! Algo salió mal.</h2>
      <p>{{ error || 'No pudimos cargar los datos de tu perfil.' }}</p>
      <GtxButton variant="primary" @click="retryLoad">RETRY</GtxButton>
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

const { currentProfile: profile, isLoading, error } = storeToRefs(profileStore);

const isEditing = ref(false);
const editableForm = ref({
  name: '',
  phone: '',
  taxId: '',
  profilePicture: ''
});

const userInitials = computed(() => {
  if (!profile.value || (!profile.value.name && !profile.value.email)) return 'GX';
  const nameSource = profile.value.name || profile.value.email;
  return nameSource
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
});

onMounted(async () => {
  if (!profile.value) {
    await profileStore.fetchMyProfile();
  }
});

<<<<<<< HEAD
const retryLoad = async () => {
  await profileStore.fetchMyProfile();
};

const startEditing = () => {
  editableForm.value = {
    name: profile.value.name || '',
    phone: profile.value.phone || '',
    taxId: profile.value.taxId || '',
    profilePicture: profile.value.profilePicture || ''
  };
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
};

const handleSave = async () => {
  try {
    const dataToSend = { ...editableForm.value };
    // Aseguramos que los campos vacíos se manden como null o string vacío si el backend lo requiere.
    await profileStore.updateCurrentProfile(dataToSend);
    isEditing.value = false;
  } catch (err) {
    alert('Hubo un error al guardar los cambios. Revisa la consola.');
  }
};
=======
const goEdit = () => alert('Edit coming soon');
>>>>>>> 59797d2a683750501ca7f8d11e4a99080e87f930

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
<<<<<<< HEAD
/* --- Layout Base --- */
.profile-page-wrapper {
  min-height: 100vh;
  background-color: #0f111a; 
  color: #e0e6ed;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.profile-container {
  max-width: 1100px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* --- Header --- */
.profile-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #8899a6;
  font-size: 1.1rem;
  margin: 0;
}

/* --- Grid --- */
.profile-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 900px) {
  .profile-layout { grid-template-columns: 1fr; }
}

/* --- Sidebar --- */
.main-profile-card {
  background-color: #1a1d29;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border: 1px solid #2d3748;
}

.avatar-section { margin-bottom: 1.5rem; }

.avatar-wrapper {
  position: relative;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  padding: 5px;
  background: #2d3748;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #1a1d29;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #10b981; 
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  border: 3px solid #1a1d29;
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #718096;
  border: 4px solid #1a1d29;
}

.status-active .status-indicator {
  background-color: #10b981;
}

.profile-identity h2 { font-size: 1.6rem; color: #fff; margin: 0 0 0.2rem 0; font-weight: 700; }
.profile-identity .email { color: #8899a6; font-size: 0.95rem; margin: 0 0 1rem 0; word-break: break-all; }

.badges-row { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 2rem; }

.sidebar-actions { width: 100%; display: flex; flex-direction: column; gap: 0.75rem; }

/* --- Detalles (Derecha) --- */
.details-card {
  background-color: #1a1d29;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border: 1px solid #2d3748;
}

.card-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #2d3748;
}

.card-header h3 { font-size: 1.5rem; color: #fff; margin: 0; font-weight: 700; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
=======
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
>>>>>>> 59797d2a683750501ca7f8d11e4a99080e87f930
  gap: 2rem;
}

.info-item label {
  display: block;
  color: #10b981;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  background-color: #2a2e3f;
  color: #fff;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  font-size: 1.05rem;
  margin: 0;
  border: 1px solid #363c4f;
}

.info-item .value.mono { font-family: monospace; color: #a0aec0; }

/* --- Formulario --- */
.edit-form { display: flex; flex-direction: column; gap: 2rem; }
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

<<<<<<< HEAD
.form-group label {
  display: block;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.7rem;
}

.form-group.readonly :deep(input) {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #1a1d29;
}

.form-actions {
=======
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
>>>>>>> 59797d2a683750501ca7f8d11e4a99080e87f930
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
<<<<<<< HEAD
  margin-top: 1rem;
  padding-top: 2rem;
  border-bottom: 1px solid #2d3748;
=======
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
>>>>>>> 59797d2a683750501ca7f8d11e4a99080e87f930
}

/* --- Estados --- */
.loading-overlay, .error-container {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 4rem; background-color: #1a1d29; border-radius: 20px;
  border: 1px solid #2d3748; margin: auto;
}

.spinner {
  width: 50px; height: 50px; border: 5px solid #2d3748; border-top-color: #10b981;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1.5rem;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>