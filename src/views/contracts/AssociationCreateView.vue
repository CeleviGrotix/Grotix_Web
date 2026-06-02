<template>
  <div class="page-container">
    <header class="back-header" @click="$router.back()">
      <h1>&lt; New Association</h1>
    </header>

    <div class="form-card">
      <h2 class="form-title">Register Organization</h2>

      <div class="form-group">
        <label>Association Name</label>
        <input type="text" class="dark-input" v-model="form.name" placeholder="Ej: Asociación del Norte" />
      </div>

      <div class="form-group">
        <label>Contact Email</label>
        <input type="email" class="dark-input" v-model="form.email" placeholder="contacto@asociacion.com" />
      </div>

      <div class="actions">
        <GtxButton variant="primary" @click="handleCreate">CREATE ASSOCIATION</GtxButton>
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

const form = ref({ name: '', email: '' });

const handleCreate = async () => {
  if (!form.value.name || !form.value.email) {
    alert('Todos los campos son obligatorios');
    return;
  }
  try {
    await contractsStore.addAssociation(form.value);
    alert('Asociación creada. Ahora podrás crearle un contrato o usuarios.');
    router.push('/contracts');
  } catch {
    alert('Hubo un error al crear la asociación.');
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

.back-header:hover { opacity: 0.8; }

.form-card {
  background-color: #161819;
  padding: 2.5rem;
  border-radius: 16px;
}

.form-title {
  color: white;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.form-group { margin-bottom: 1.5rem; }

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

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

/* ============================================================
   MÓVIL (≤ 768px)
   ============================================================ */
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

  /* Botón ocupa todo el ancho en móvil */
  .actions {
    justify-content: stretch;
  }

  .actions :deep(.gtx-btn) {
    width: 100%;
  }
}

/* ============================================================
   MÓVIL PEQUEÑO (≤ 480px)
   ============================================================ */
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