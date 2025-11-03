<template>
  <div class="admin-layout d-flex">
    <!-- Desktop: fixed sidebar layer -->
    <aside class="admin-sidebar-shell bg-white border-end">
      <AdminSidebar />
    </aside>

    <!-- Main panel -->
    <div class="content flex-grow-1 d-flex flex-column">
      <!-- Topbar -->
      <header>
        <!-- Mobile toggler (opens the offcanvas sidebar inside AdminSidebar) -->
        <button
          type="button"
          class="btnMenu btn btn-outline-secondary d-md-none ms-4 m-3"
          data-bs-toggle="offcanvas"
          data-bs-target="#adminSidebar"
          aria-controls="adminSidebar"
        >
          <i class="bi bi-list"></i> Menu
        </button>
        <div class="ms-auto"></div>
      </header>

      <!-- Content outlet -->
      <main class="flex-grow-1 p-4 ps-5 ms-5 bg-light">
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
  /* Match this to your collapsed rail width (icons-only) */
  --admin-rail: 84px; /* use 75px if that’s what your AdminSidebar uses */
}

.admin-layout {
  min-height: 100vh;
}

/* ===== Fixed desktop sidebar layer ===== */
.admin-sidebar-shell {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1040;
  background: #fff;
  border-right: 1px solid rgba(0,0,0,0.125);
}

/* Let the main content own the scroll; reserve rail space */
.content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
  padding-left: var(--admin-rail); /* keeps content from moving on desktop */
}

/* Mobile: overlay drawer (offcanvas) handles the sidebar; no reserved gap */
@media (max-width: 767.98px) {
  /* keep the shell in the DOM so #adminSidebar can open */
  .admin-sidebar-shell {
    width: 0 !important;
    border-right: 0;
    pointer-events: none;      /* ignore clicks on the invisible shell */
  }
  /* but allow interaction with the offcanvas when it opens */
  .admin-sidebar-shell :deep(.offcanvas) {
    pointer-events: auto;
  }

  .content {
    padding-left: 0;          /* full width content on mobile */
  }
}


/* Optional: tighten padding on very small screens */
@media (max-width: 450px) {
  main {
    padding: 0.6rem !important;
  }
}
</style>
