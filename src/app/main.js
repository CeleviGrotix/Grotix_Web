// Importamos el CSS global desde el Kernel Compartido
import '@/shared/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from '@/shared/http/axiosClient'
import { useAuthStore } from '@/modules/auth/application/useAuthStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

setUnauthorizedHandler(() => {
  const authStore = useAuthStore(pinia)
  authStore.logout()

  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login', query: { sessionExpired: '1' } })
  }
})

// Montamos la aplicación
app.mount('#app')