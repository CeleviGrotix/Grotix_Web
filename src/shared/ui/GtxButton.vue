<template>
  <button type="button" :class="['gtx-btn', variant]">
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary'
  }
});
</script>

<style scoped>
/* Tus estilos se mantienen exactamente iguales */
.gtx-btn {
  padding: 8px 24px;
  border-radius: 8px;
  font-family: var(--font-main);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.9rem;
}

.gtx-btn.primary {
  background-color: #1e3a45;
  color: var(--bright-cyan);
  border: 1px solid var(--blue-cerulean);
}

.gtx-btn.primary:hover {
  background-color: var(--blue-cerulean);
  color: var(--bg-dark);
}

.gtx-btn.outline {
  background-color: transparent;
  color: var(--white);
  border: 1px solid var(--white);
}

.gtx-btn.danger {
  background-color: transparent;
  color: var(--red-coral);
  border: 1px solid var(--red-coral);
}
</style>