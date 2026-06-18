<template>
  <div class="page-container">
    <header class="back-header" @click="$router.back()">
      <h1>&lt; New Association</h1>
    </header>

    <div class="form-card">
      <h2 class="form-title">Register Organization</h2>
      <p class="form-hint">
        Each association gets exactly one farm, created automatically with the same name.
      </p>

      <div class="form-group">
        <label>Association Name</label>
        <input
          type="text"
          class="dark-input"
          v-model="form.name"
          placeholder="Ej: Asociación del Norte"
        />
      </div>

      <div class="form-group">
        <label>Contact Email</label>
        <input
          type="email"
          class="dark-input"
          v-model="form.email"
          placeholder="contacto@asociacion.com"
        />
      </div>

      <div class="form-group">
        <label>Farm Location</label>
        <input
          type="text"
          class="dark-input"
          v-model="form.location"
          placeholder="Ej: Cajamarca, Perú"
        />
      </div>

      <p v-if="contractsStore.error" class="error-text">{{ contractsStore.error }}</p>

      <div class="actions">
        <GtxButton
          variant="primary"
          :disabled="contractsStore.isSaving"
          @click="handleCreate"
        >
          {{ contractsStore.isSaving ? 'CREATING...' : 'CREATE ASSOCIATION & FARM' }}
        </GtxButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useContractsStore } from '@/modules/contracts/application/useContractsStore';
import GtxButton from '@/shared/ui/GtxButton.vue';

const router = useRouter();
const contractsStore = useContractsStore();

const form = ref({ name: '', email: '', location: '' });

const handleCreate = async () => {
  const name = form.value.name.trim();
  const email = form.value.email.trim();
  const location = form.value.location.trim();

  if (!name || !email || !location) {
    alert('Name, email and location are required.');
    return;
  }

  try {
    await contractsStore.addAssociation({ name, email, location });
    alert('Association and farm created successfully.');
    router.push('/contracts');
  } catch {
    alert(contractsStore.error || 'Failed to create association and farm.');
  }
};
</script>

<style scoped>
.page-container {
  padding-bottom: 2rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
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

.back-header:hover {
  opacity: 0.8;
}

.form-card {
  background-color: #161819;
  padding: 2.5rem;
  border-radius: 16px;
}

.form-title {
  color: white;
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
}

.form-hint {
  color: #9ca3af;
  margin: 0 0 2rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: var(--emerald-green);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.dark-input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background-color: #2a2e30;
  border: none;
  color: white;
  outline: none;
  font-family: var(--font-main);
  box-sizing: border-box;
  font-size: 1rem;
}

.error-text {
  color: #ff5757;
  margin-bottom: 1rem;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .page-container {
    max-width: 100%;
  }

  .back-header h1 {
    font-size: 1.5rem;
  }

  .form-card {
    padding: 1.5rem;
  }

  .actions {
    justify-content: stretch;
  }

  .actions :deep(.gtx-btn) {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .back-header h1 {
    font-size: 1.25rem;
  }

  .form-card {
    padding: 1.25rem;
  }

  .dark-input {
    font-size: 0.95rem;
    padding: 10px;
  }
}
</style>
