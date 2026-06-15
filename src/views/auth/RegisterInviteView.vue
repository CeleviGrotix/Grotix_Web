<template>
  <div class="auth-layout">
    <div class="register-card">
      <div class="logo-placeholder">Grotix</div>

      <template v-if="isValidLink">
        <h2>Complete your registration</h2>
        <p>Set your password to join the platform.</p>

        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label>Email (Invited)</label>
            <input type="email" class="dark-input" v-model="form.email" disabled />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" class="dark-input" v-model="form.password" required />
          </div>

          <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" class="dark-input" v-model="form.confirmPassword" required />
          </div>

          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

          <GtxButton
            variant="primary"
            style="width: 100%; margin-top: 1rem;"
            type="submit"
            :disabled="authStore.isLoading"
          >
            {{ authStore.isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT' }}
          </GtxButton>
        </form>
      </template>

      <template v-else>
        <h2>Invalid invite link</h2>
        <p>This link is missing required information. Please request a new invitation.</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/application/useAuthStore';
import GtxButton from '@/shared/ui/GtxButton.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const form = ref({ email: '', password: '', confirmPassword: '', inviteToken: '' });
const errorMessage = ref('');

const isValidLink = computed(() => !!form.value.email && !!form.value.inviteToken);

onMounted(() => {
  if (route.query.email) form.value.email = route.query.email;
  if (route.query.token) form.value.inviteToken = route.query.token;
});

const handleRegister = async () => {
  errorMessage.value = '';

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Las contraseñas no coinciden.';
    return;
  }

  try {
    await authStore.register(form.value.email, form.value.password, form.value.inviteToken);
    router.push({ name: 'login', query: { registered: 'true' } });
  } catch (error) {
    errorMessage.value = error.message;
  }
};
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-dark);
  padding: 1rem;
}

.register-card {
  background-color: #161819;
  padding: 3rem;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.logo-placeholder {
  font-size: 2rem;
  font-weight: 800;
  color: var(--emerald-green);
  margin-bottom: 1rem;
}

.register-card h2 { color: white; margin-bottom: 0.5rem; }
.register-card p { color: gray; margin-bottom: 2rem; font-size: 0.9rem; }

.form-group { margin-bottom: 1.2rem; text-align: left; }

.form-group label {
  display: block;
  color: var(--blue-cerulean);
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
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
  color: var(--red-coral, #FF5757);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  text-align: left;
}

.dark-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ============================================================
   MÓVIL (≤ 480px)
   ============================================================ */
@media (max-width: 480px) {
  .register-card {
    padding: 2rem 1.5rem;
    border-radius: 12px;
  }

  .logo-placeholder { font-size: 1.75rem; }
  .register-card h2 { font-size: 1.25rem; }
}
</style>