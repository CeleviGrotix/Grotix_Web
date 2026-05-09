<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Main Dashboard</h1>
      <div class="divider"></div>
    </header>
    
    <div class="dashboard-grid">
      <div class="column">
        <h3>Active Clients</h3>
        <p class="subtitle">Módulo: Profiles</p>
        </div>
      
      <div class="column">
        <h3>Contracts</h3>
        <p class="subtitle">Módulo: Contracts</p>
        </div>

      <div class="column">
        <h3>Devices</h3>
        <p class="subtitle">Módulo: Devices</p>
        </div>
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
  font-weight: 700;
}

.divider {
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, transparent, var(--blue-cerulean), transparent);
  opacity: 0.5;
  margin-top: 1rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.column h3 {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: var(--light-grey);
  font-size: 0.9rem;
  margin-bottom: 2rem;
}
</style>