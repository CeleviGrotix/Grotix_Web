import { createRouter, createWebHistory } from 'vue-router'

// Importamos el Layout Principal
import StaffLayout from '@/shared/layouts/StaffLayout.vue'

// Importamos las Vistas
import DashboardView from '@/views/DashboardView.vue'
import AgriculturistsListView from '@/views/profiles/AgriculturistsListView.vue.vue'
import CropsListView from '@/views/catalog/CropsListView.vue'
import CropDetailView from '@/views/catalog/CropDetailView.vue'
import CropCreateView from '@/views/catalog/CropCreateView.vue'
import AgriculturistDetailView from '@/views/profiles/AgriculturistDetailView.vue'
import ContractsListView from '@/views/contracts/ContractsListView.vue'
import AssociationCreateView from '@/views/contracts/AssociationCreateView.vue'
import ContractDetailView from '@/views/contracts/ContractDetailView.vue'
import RegisterInviteView from '@/views/auth/RegisterInviteView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import SearchView from '@/views/SearchView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: StaffLayout, 
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'profile',
          name: 'my-profile',
          component: () => import('@/views/auth/MyProfileView.vue'),
          meta: { title: 'My Profile | Grotix' }
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { title: 'Main Dashboard | Grotix' }
        },
        {
          path: 'profiles/:id', 
          name: 'profile-detail',
          component: AgriculturistDetailView,
          meta: { title: 'Agriculturist Detail | Grotix' }
        },        
        {
          path: 'profiles', 
          name: 'profiles',
          component: AgriculturistsListView,
          meta: { title: 'Agriculturists | Grotix' }
        },
        {
          path: 'search', 
          name: 'search',
          component: SearchView,
          meta: { title: 'Global Search | Grotix' }
        },
        {
          path: 'crops',
          name: 'crops',
          component: CropsListView,
          meta: { title: 'Crops Catalog | Grotix' }
        },
        {
          path: 'crops/new',
          name: 'crop-create',
          component: CropCreateView,
          meta: { title: 'Add Crop | Grotix' }
        },
        {
          path: 'crops/:id',
          name: 'crop-detail',
          component: CropDetailView,
          meta: { title: 'Crop Details | Grotix' }
        },
        {
          path: 'contracts',
          name: 'contracts',
          component: ContractsListView,
          meta: { title: 'Contracts | Grotix' }
        },
        {
          path: 'contracts/new-association',
          name: 'association-create',
          component: AssociationCreateView,
          meta: { title: 'New Association | Grotix' }
        },
        {
          path: 'contracts/:id',
          name: 'contract-detail',
          component: ContractDetailView,
          meta: { title: 'Association Details | Grotix' }
        },
        {
          path: 'contracts/:id/zones/:zoneId',
          name: 'zone-detail',
          component: () => import('@/views/contracts/ZoneDetailView.vue'),
          meta: { title: 'Zone Hardware | Grotix' }
        },
        // --- RUTAS NUEVAS DE DISPOSITIVOS ---
        {
          path: 'devices',
          name: 'devices',
          component: () => import('@/views/devices/DevicesListView.vue'), // Lista
          meta: { title: 'Hardware Devices | Grotix' }
        },
        {
          path: 'devices/logbook',
          name: 'device-logbook',
          component: () => import('@/views/devices/DeviceLogbookView.vue'), // Logbook
          meta: { title: 'Logbook | Grotix' }
        },
        {
          path: 'devices/maintenance',
          name: 'device-maintenance',
          component: () => import('@/views/devices/DeviceMaintenanceView.vue'), // Maintenance
          meta: { title: 'Maintenance | Grotix' }
        },
        {
          path: 'devices/:deviceId',
          name: 'device-detail',
          component: () => import('@/views/devices/DeviceDetailView.vue'),
          meta: { title: 'Device Detail | Grotix' }
        }
      ]
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterInviteView,
      meta: { title: 'Register | Grotix' }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Login | Grotix' }
    }
  ]
})

// Actualizar el título de la pestaña del navegador dinámicamente
router.beforeEach((to) => {
  document.title = to.meta.title || 'Grotix Web';

  const publicRoutes = ['login', 'register'];
  const isPublic = publicRoutes.includes(to.name);
  const token = localStorage.getItem('grotix_token');

  if (!isPublic && !token) {
    return { name: 'login' };
  }

  if (isPublic && token) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router
