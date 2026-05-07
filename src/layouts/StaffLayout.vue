<template>
  <div class="layout-wrapper">
    <aside class="sidebar">
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-icon" title="Home">
          <img src="@/assets/icons/home.svg" alt="Home" />
        </router-link>
        <router-link to="/search" class="nav-icon" title="Search">
          <img src="@/assets/icons/search.svg" alt="Search" />
        </router-link>
        <router-link to="/clients" class="nav-icon" title="Clients">
          <img src="@/assets/icons/user.svg" alt="Clients" />
        </router-link>
        <router-link to="/contracts" class="nav-icon" title="Contracts">
          <img src="@/assets/icons/log.svg" alt="Contracts" />
        </router-link>
        <router-link to="/devices" class="nav-icon" title="Devices">
          <img src="@/assets/icons/chip.svg" alt="Devices" />
        </router-link>
        <router-link to="/crops" class="nav-icon" title="Crops">
          <img src="@/assets/icons/plant.svg" alt="Crops" />
        </router-link>
        <router-link to="/settings" class="nav-icon" title="Settings">
          <img src="@/assets/icons/gear.svg" alt="Settings" />
        </router-link>
      </nav>
      
      <div class="logo-bottom">
        <span class="logo-icon">
          <img src="@/assets/icons/bar-icon.svg" alt="Grotix Logo" />
        </span>
      </div>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-dark);
  color: var(--white);
  font-family: sans-serif;
  overflow: hidden;
}

.sidebar {
  width: 80px;
      background: radial-gradient(
             circle at 30% 20%,
             rgba(1, 160, 112, 0.35), /* emerald green */
             transparent 40%
     ),
     radial-gradient(
             circle at 70% 80%,
             rgba(87, 219, 255, 0.35),  /* bright cyan */
             transparent 40%
     );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 2.5rem 0 1.5rem 0;
  border-right: none;
  height: 100vh;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly; 
  align-items: center;
  width: 100%;
  flex-grow: 1;
  padding-bottom: 2rem; 
}

.nav-icon {
  text-decoration: none;
  opacity: 0.6;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.nav-icon img {
  width: 24px; 
  height: 24px;
  filter: invert(1) brightness(2); 
}

.nav-icon:hover,
.router-link-active {
  opacity: 1; 
  transform: scale(1.1);
}

.logo-bottom {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.logo-icon img {
  max-width: 50px; 
  height: auto;
  object-fit: contain;
}

.main-content {
  flex: 1;
  padding: 2rem 4rem;
  overflow-y: auto;
}
</style>