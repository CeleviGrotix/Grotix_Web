import { createRouter, createWebHistory } from 'vue-router'

// 1. Importamos el Layout Principal
import StaffLayout from '@/shared/layouts/StaffLayout.vue'

// 2. Importamos las Vistas (Views)
import DashboardView from '@/views/DashboardView.vue'
import AgriculturistsListView from '@/views/profiles/AgriculturistsListView.vue.vue'
import CropsListView from '@/views/catalog/CropsListView.vue'
import CropDetailView from '@/views/catalog/CropDetailView.vue'
import CropCreateView from '@/views/catalog/CropCreateView.vue'
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
        }
        // En el futuro agregarás aquí:
        // { path: 'contracts', component: ContractsListView... }
        // { path: 'devices', component: DevicesListView... }
      ]
    }
  ]
})

// Actualizar el título de la pestaña del navegador dinámicamente
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Grotix Web'
  next()
})

export default router