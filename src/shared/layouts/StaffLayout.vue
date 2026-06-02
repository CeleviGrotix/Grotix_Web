<template>
  <div class="layout-wrapper">
    <!-- Sidebar: visible en desktop -->
    <aside class="sidebar">
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-icon" title="Home">
          <img src="@/shared/assets/icons/home.svg" alt="Home" />
        </router-link>
        <router-link to="/search" class="nav-icon" title="Search">
          <img src="@/shared/assets/icons/search.svg" alt="Search" />
        </router-link>
        <router-link to="/profiles" class="nav-icon" title="Clients">
          <img src="@/shared/assets/icons/user.svg" alt="Clients" />
        </router-link>
        <router-link to="/contracts" class="nav-icon" title="Contracts">
          <img src="@/shared/assets/icons/log.svg" alt="Contracts" />
        </router-link>
        <router-link to="/devices" class="nav-icon" title="Devices">
          <img src="@/shared/assets/icons/chip.svg" alt="Devices" />
        </router-link>
        <router-link to="/crops" class="nav-icon" title="Crops">
          <img src="@/shared/assets/icons/plant.svg" alt="Crops" />
        </router-link>
        <router-link to="/profile" class="nav-icon" title="My Profile">
          <img src="@/shared/assets/icons/gear.svg" alt="My Profile" />
        </router-link>
      </nav>

      <div class="logo-bottom">
        <span class="logo-icon">
          <img src="@/shared/assets/icons/bar-icon.svg" alt="Grotix Logo" />
        </span>
      </div>
    </aside>

    <!-- Contenido principal -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Bottom nav: visible solo en móvil -->
    <nav class="bottom-nav">
      <router-link to="/dashboard" class="nav-icon" title="Home">
        <img src="@/shared/assets/icons/home.svg" alt="Home" />
      </router-link>
      <router-link to="/search" class="nav-icon" title="Search">
        <img src="@/shared/assets/icons/search.svg" alt="Search" />
      </router-link>
      <router-link to="/profiles" class="nav-icon" title="Clients">
        <img src="@/shared/assets/icons/user.svg" alt="Clients" />
      </router-link>
      <router-link to="/contracts" class="nav-icon" title="Contracts">
        <img src="@/shared/assets/icons/log.svg" alt="Contracts" />
      </router-link>
      <router-link to="/devices" class="nav-icon" title="Devices">
        <img src="@/shared/assets/icons/chip.svg" alt="Devices" />
      </router-link>
      <router-link to="/crops" class="nav-icon" title="Crops">
        <img src="@/shared/assets/icons/plant.svg" alt="Crops" />
      </router-link>
      <router-link to="/profile" class="nav-icon" title="My Profile">
        <img src="@/shared/assets/icons/gear.svg" alt="My Profile" />
      </router-link>
    </nav>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* ============================================================
   LAYOUT BASE (Desktop-first, sidebar lateral)
   ============================================================ */
.layout-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-dark);
  color: var(--white);
  font-family: var(--font-main);
  overflow: hidden;
}

/* --- SIDEBAR (desktop) --- */
.sidebar {
  width: 80px;
  flex-shrink: 0;
  background: radial-gradient(
      circle at 30% 20%,
      rgba(1, 160, 112, 0.35),
      transparent 40%
    ),
    radial-gradient(
      circle at 70% 80%,
      rgba(87, 219, 255, 0.35),
      transparent 40%
    );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 2.5rem 0 1.5rem 0;
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
  opacity: 0.5;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
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
  flex-direction: column;
  align-items: center;
}

.logo-icon img {
  max-width: 50px;
  height: auto;
  object-fit: contain;
}

/* --- MAIN CONTENT --- */
.main-content {
  flex: 1;
  padding: 2rem 4rem;
  overflow-y: auto;
  /* Permite scroll solo en el contenido */
  height: 100vh;
}

/* --- BOTTOM NAV (oculto en desktop) --- */
.bottom-nav {
  display: none;
}

/* ============================================================
   TABLET (≤ 1024px): sidebar más estrecho
   ============================================================ */
@media (max-width: 1024px) {
  .main-content {
    padding: 1.5rem 2rem;
  }
}

/* ============================================================
   MÓVIL (≤ 768px): sidebar desaparece, aparece bottom nav
   ============================================================ */
@media (max-width: 768px) {
  .layout-wrapper {
    flex-direction: column;
    overflow: visible;
    height: auto;
    min-height: 100vh;
  }

  /* Ocultar sidebar lateral */
  .sidebar {
    display: none;
  }

  /* El contenido ocupa todo el ancho */
  .main-content {
    flex: 1;
    padding: 1.25rem 1rem;
    padding-bottom: 5rem; /* Espacio para el bottom nav */
    height: auto;
    min-height: 100vh;
    overflow-y: visible;
  }

  /* Mostrar bottom nav */
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: radial-gradient(
        circle at 20% 50%,
        rgba(1, 160, 112, 0.3),
        transparent 60%
      ),
      radial-gradient(
        circle at 80% 50%,
        rgba(87, 219, 255, 0.3),
        transparent 60%
      ),
      rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    padding: 0.5rem 0.25rem;
    justify-content: space-around;
    align-items: center;
    height: 64px;
  }

  .bottom-nav .nav-icon {
    padding: 8px;
    flex-direction: column;
    gap: 2px;
    border-radius: 8px;
  }

  .bottom-nav .nav-icon img {
    width: 22px;
    height: 22px;
  }

  .bottom-nav .router-link-active {
    opacity: 1;
    transform: scale(1.15);
    background-color: rgba(64, 191, 226, 0.1);
  }
}

/* ============================================================
   MÓVIL PEQUEÑO (≤ 480px)
   ============================================================ */
@media (max-width: 480px) {
  .main-content {
    padding: 1rem 0.75rem;
    padding-bottom: 5rem;
  }

  .bottom-nav .nav-icon img {
    width: 20px;
    height: 20px;
  }
}
</style>