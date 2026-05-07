<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Main Dashboard</h1>
      <div class="divider"></div>
    </header>
    
    <div class="content-placeholder">
      <p>Aquí irá nuestro grid de 3 columnas...</p>
    </div>
  </div>
</template>

<style scoped>
.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700; /* Gabarito Bold */
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.divider {
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, transparent, var(--blue-cerulean), transparent);
  opacity: 0.5;
}
</style>