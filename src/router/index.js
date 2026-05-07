import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard' 
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'Main Dashboard | Grotix' }
    },
    {
      path: '/clients',
      name: 'clients',
      component: () => import('../views/PlaceholderView.vue'), 
      meta: { title: 'Clients | Grotix' }
    },
    {
      path: '/contracts',
      name: 'contracts',
      component: () => import('../views/PlaceholderView.vue'),
      meta: { title: 'Contracts | Grotix' }
    },
    {
      path: '/devices',
      name: 'devices',
      component: () => import('../views/PlaceholderView.vue'),
      meta: { title: 'Devices | Grotix' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Grotix Staff'
  next()
})

export default router