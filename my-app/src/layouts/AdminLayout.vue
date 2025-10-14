<template>
  <div class="admin-layout d-flex">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main panel -->
    <div class="content flex-grow-1 d-flex flex-column">
      <!-- Topbar -->
      <header>
        <!-- Mobile toggler (opens the offcanvas sidebar) -->
        <button
          type="button"
          class="btn btn-outline-secondary d-md-none"
          data-bs-toggle="offcanvas"
          data-bs-target="#adminSidebar"
          aria-controls="adminSidebar"
        >
          <i class="bi bi-list"></i> Menu
        </button>
        <div class="ms-auto"></div>
      </header>

      <!-- Content outlet -->
      <main class="flex-grow-1 p-4 bg-light">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import AdminSidebar from '@/components/nav/AdminSidebar.vue'

const router = useRouter()

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push({ name: 'admin.login' })
}
</script>

<style scoped>
:root {
  /* Keep some space for the collapsed sidebar on desktop */
  --sidebar-collapsed-width: 75px;
}

.admin-layout {
  min-height: 100vh;
}

/* Let the main content own the scroll */
.content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Desktop: reserve space for collapsed sidebar so content isn't hidden */
@media (min-width: 768px) {
  .content > main {
    margin-left: var(--sidebar-collapsed-width);
  }
}

/* Mobile: sidebar is offcanvas overlay, content is full width */
@media (max-width: 767.98px) {
  .content > main {
    margin-left: 0;
  }
}
</style>
