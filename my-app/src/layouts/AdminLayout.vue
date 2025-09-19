<template>
  <div class="admin-layout d-flex">
    <!-- Sidebar (overlays when open) -->
    <AdminSidebar />

    <!-- Main content -->
    <div class="content flex-grow-1 d-flex flex-column">
      <!-- Topbar (optional) -->

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
/* Collapsed width must match your AdminSidebar collapsedWidth */
:root {
  --sidebar-collapsed-width: 75px;
}

/* Make the layout occupy full height */
.admin-layout {
  min-height: 100vh;
  position: relative;
}

/* FIXED main content panel:
   - Anchored to the collapsed sidebar width on the left
   - Fills the viewport (top/right/bottom)
   - Sidebar can overlap it when opened (higher z-index on sidebar)
*/
.content {
  margin-left: var(--sidebar-collapsed-width);
  transition: margin-left 220ms cubic-bezier(0.4, 0, 0.2, 1);

  /* new: fixed layout */
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: var(--sidebar-collapsed-width);

  /* keep column layout inside the fixed panel */
  display: flex;
  flex-direction: column;

  /* ensure inner <main> owns the scroll, not the body */
  overflow: hidden;
  z-index: 1; /* keep below the sidebar overlay */
}

/* Make <main> scrollable while the header/topbar area could remain static if you add one */
.content > main {
  /* account for safe areas and ensure smooth scroll within */
  overflow: auto;
  height: 100%;
  -webkit-overflow-scrolling: touch;
}

/* On small screens (offcanvas), don't reserve space at all */
@media (max-width: 1600px) {
  .content {
    margin-left: 0;

    /* fixed to full screen when sidebar is offcanvas */
    left: 0;
  }
}

/* OPTIONAL: If your AdminSidebar exposes a root class, this helps guarantee overlap.
   Remove if your sidebar already handles this internally.
*/
:deep(.admin-sidebar),
:deep(.sidebar-shell),
:deep(.sidebar) {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1040; /* above .content (z-index:1) */
}
</style>
