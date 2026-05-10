<template>
  <div class="gtx-card">
    <div class="card-info">
      <h4 class="card-title">
        <slot name="title"></slot>
      </h4>
      <p class="card-subtitle">
        <slot name="subtitle"></slot>
      </p>
    </div>
    <div class="card-badge">
      <slot name="badge"></slot>
    </div>
  </div>
</template>

<script setup>
// No requiere lógica, es un componente puramente visual (Dumb Component)
</script>

<style scoped>
.gtx-card {
  /* Fondo verde oscuro de la tarjeta basado en tu diseño */
  background-color: #152b24; 
  border-radius: 8px;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.gtx-card:hover {
  background-color: #1a352d;
  transform: translateY(-2px);
  cursor: pointer;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600; /* Gabarito Semibold */
  color: var(--white, #ffffff);
  margin: 0;
}

.card-subtitle {
  font-size: 0.75rem;
  color: #a0b2ac; /* Gris verdoso claro para el texto secundario */
  margin: 0;
}

.card-badge {
  display: flex;
  align-items: center;
}
</style>