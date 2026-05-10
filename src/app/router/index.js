import { createRouter, createWebHistory } from 'vue-router'

// 1. Importamos el Layout Principal
import StaffLayout from '@/shared/layouts/StaffLayout.vue'

// 2. Importamos las Vistas (Views)
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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: StaffLayout, // El layout envuelve a las páginas
      children: [
        {
          path: '',
          redirect: '/dashboard'
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
          // Esta ruta coincide con el <router-link to="/profiles"> de tu menú lateral
          path: 'profiles', 
          name: 'profiles',
          component: AgriculturistsListView,
          meta: { title: 'Agriculturists | Grotix' }
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
        }
        // En el futuro agregarás aquí:
        // { path: 'contracts', component: ContractsListView... }
        // { path: 'devices', component: DevicesListView... }
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
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Grotix Web'
  next()
})

export default router