<template>
  <div class="page-container" v-if="profile">
    <header class="back-header" @click="$router.back()">
      <h1>&lt; Agriculturist</h1>
    </header>

    <div class="detail-layout">
      <div class="profile-header-card">
        <div class="left-info">
          <img
            :src="profile.profilePicture || 'https://via.placeholder.com/100'"
            :alt="profile.name"
            class="big-avatar"
          />
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
import { useContractsStore } from '@/modules/contracts/application/useContractsStore';

const route = useRoute();
const profileStore = useProfileStore();
const contractsStore = useContractsStore();

const profile = computed(() => profileStore.currentProfile);

const associationName = computed(() => {
  if (!profile.value) return 'Loading...';
  const assocId = profile.value.associationId || profile.value.AssociationId;
  const assoc = contractsStore.associations.find(a => String(a.id) === String(assocId));
  return assoc ? assoc.name : `Asociación ID: ${assocId}`;
});

onMounted(async () => {
  await profileStore.fetchProfileById(route.params.id);
  if (contractsStore.associations.length === 0) {
    await contractsStore.fetchAssociations();
  }
});
</script>

<style scoped>
.page-container {
  padding-bottom: 2rem;
  width: 100%;
  max-width: 900px;
}

.back-header {
  cursor: pointer;
  margin-bottom: 2.5rem;
  display: inline-block;
}

.back-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--white);
  margin: 0;
}

.back-header:hover { opacity: 0.8; }

.detail-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* --- PROFILE HEADER CARD --- */
.profile-header-card {
  background-color: #161819;
  padding: 2rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
}

.left-info {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.big-avatar {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.names h2 {
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
  color: var(--white);
}

.names p {
  margin: 0;
  color: var(--light-grey);
  font-size: 1rem;
}

/* --- INFO FIELDS --- */
.field-group { margin-bottom: 1.5rem; }

.blue-label  { display: block; color: var(--blue-cerulean);  margin-bottom: 0.5rem; font-weight: 600; }
.green-label { display: block; color: var(--emerald-green);  margin-bottom: 0.5rem; font-weight: 600; }
.red-label   { display: block; color: var(--red-coral);      margin-bottom: 0.5rem; font-weight: 600; }

.dark-box {
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  background-color: #2a2e30;
  color: var(--white);
  font-family: var(--font-main);
  box-sizing: border-box;
  word-break: break-word;
}

/* ============================================================
   TABLET (≤ 1024px)
   ============================================================ */
@media (max-width: 1024px) {
  .page-container {
    max-width: 100%;
  }

  .back-header h1 {
    font-size: 1.75rem;
  }

  .names h2 {
    font-size: 1.5rem;
  }
}

/* ============================================================
   MÓVIL (≤ 768px)
   ============================================================ */
@media (max-width: 768px) {
  .back-header h1 {
    font-size: 1.4rem;
  }

  .profile-header-card {
    padding: 1.25rem;
  }

  .big-avatar {
    width: 72px;
    height: 72px;
  }

  .names h2 {
    font-size: 1.25rem;
  }

  .names p {
    font-size: 0.9rem;
  }

  .dark-box {
    padding: 12px;
    font-size: 0.95rem;
  }
}

/* ============================================================
   MÓVIL PEQUEÑO (≤ 480px)
   ============================================================ */
@media (max-width: 480px) {
  .back-header h1 {
    font-size: 1.2rem;
  }

  .left-info {
    gap: 1rem;
  }

  .big-avatar {
    width: 56px;
    height: 56px;
    border-radius: 8px;
  }

  .names h2 {
    font-size: 1.1rem;
  }
}
</style>