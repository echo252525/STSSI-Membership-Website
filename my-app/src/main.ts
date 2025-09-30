// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Bootstrap CSS & Icons
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// ⭐ Expose Bootstrap JS to window for global cleanup/helpers
import * as bootstrap from 'bootstrap'
;(window as any).bootstrap = bootstrap

// ⭐ Global UI cleanup on every navigation
import { cleanupBootstrapArtifacts } from '@/lib/uiCleanup'

const app = createApp(App)

// Nuke any lingering offcanvas/modal/dropdown artifacts before & after nav
router.beforeEach((to, from, next) => {
  cleanupBootstrapArtifacts()
  next()
})
router.afterEach(() => {
  cleanupBootstrapArtifacts()
})

// Optional: log router errors and clean again just in case
router.onError((err) => {
  console.error('[Router error]', err)
  try {
    cleanupBootstrapArtifacts()
  } catch {}
})

app.use(router)
app.mount('#app')
