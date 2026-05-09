// Importamos el CSS global desde el Kernel Compartido
import '@/shared/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Activamos el estado global y el enrutamiento
app.use(createPinia())
app.use(router)

// Montamos la aplicación
app.mount('#app')