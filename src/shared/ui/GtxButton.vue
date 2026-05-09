<template>
  <button :class="['gtx-btn', variant]" @click="$emit('click')">
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary' // primary, secondary, danger, outline
  }
});
</script>

<style scoped>
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
  background-color: #1e3a45; /* Fondo azul oscuro que usaste en tus botones ADD/LIST */
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