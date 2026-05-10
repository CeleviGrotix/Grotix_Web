<template>
  <div class="auth-layout">
    <div class="login-card">
      <div class="logo-placeholder">Grotix</div>
      <h2>Welcome Back</h2>
      <p>Sign in to your account</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input type="email" class="dark-input" v-model="form.email" required placeholder="admin@grotix.com" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" class="dark-input" v-model="form.password" required placeholder="••••••••" />
        </div>

        <GtxButton variant="primary" style="width: 100%; margin-top: 1.5rem;" type="submit">
          {{ authStore.isLoading ? 'LOADING...' : 'LOGIN' }}
        </GtxButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/application/useAuthStore';
import GtxButton from '@/shared/ui/GtxButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: ''
});

const handleLogin = async () => {
  try {
    await authStore.login(form.value.email, form.value.password);
    // Si el login es exitoso, lo mandamos al dashboard/pantalla principal
    router.push('/');
  } catch (error) {
    alert('Usuario o contraseña incorrectos. Por favor, verifica.');
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
}

.login-card {
  background-color: #161819;
  padding: 3rem;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  text-align: center;
}

.logo-placeholder { font-size: 2rem; font-weight: 800; color: var(--emerald-green); margin-bottom: 1rem; }
.login-card h2 { color: white; margin-bottom: 0.5rem; }
.login-card p { color: gray; margin-bottom: 2rem; font-size: 0.9rem; }

.form-group { margin-bottom: 1.2rem; text-align: left; }
.form-group label { display: block; color: var(--blue-cerulean); margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; }
.dark-input { width: 100%; padding: 12px; border-radius: 8px; background-color: #2a2e30; border: none; color: white; outline: none; font-family: var(--font-main); }
</style>