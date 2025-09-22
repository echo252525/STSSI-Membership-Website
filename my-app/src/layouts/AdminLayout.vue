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

/* FIXED main content wrapper (kept as-is)
   We'll override left/width below so that MAIN handles the offset. */
.content {
  margin-left: var(--sidebar-collapsed-width);
  transition: margin-left 220ms cubic-bezier(0.4, 0, 0.2, 1);

  /* fixed layout */
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: var(--sidebar-collapsed-width);

  /* computed width */
  width: calc(100vw - var(--sidebar-collapsed-width));

  /* keep column layout inside the fixed panel */
  display: flex;
  flex-direction: column;

  /* ensure inner <main> owns the scroll, not the body */
  overflow: hidden;
  z-index: 1; /* keep below the sidebar overlay */
}

/* ======================= OVERRIDES =======================
   Move the sidebar offset responsibility from .content to MAIN.
   We keep the original block above (not removed), then override here.
*/
.content {
  /* Let content occupy the full viewport; MAIN will offset itself. */
  margin-left: 0;              /* override */
  left: 0;                     /* override */
  width: 100vw;                /* override */
}

/* MAIN handles the left offset equal to collapsed sidebar width */
.content > main {
  /* scroll area */
  overflow: auto;
  height: 100%;
  -webkit-overflow-scrolling: touch;

  width: calc(100vw - var(--sidebar-collapsed-width)); /* fill remaining width */
  margin-left: var(--sidebar-collapsed-width);          /* offset next to collapsed sidebar */
  box-sizing: border-box;
}

/* On small screens (offcanvas), MAIN should be full width (no reserve) */
@media (max-width: 1600px) {
  .content {
    /* full-screen wrapper */
    margin-left: 0; /* override stays */
    left: 0;
    width: 100vw;
  }

  .content > main {
    margin-left: 0;       /* no reserve in off-canvas mode */
    width: 100vw;         /* full width */
  }
}

/* OPTIONAL: Guarantees the sidebar overlays the content */
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
