<template>
  <div class="min-vh-100 d-flex bg-body-tertiary">
    <!-- Desktop: fixed sidebar -->
    <aside v-if="isDesktop" class="sidebar-shell bg-white border-end" aria-label="User navigation">
      <UserSidebar />
    </aside>

    <!-- Main content -->
    <main class="flex-grow-1 main-content">
      <!-- Mobile top menu button -->
      <nav v-if="!isDesktop" class="navbar navbar-light bg-white border-bottom">
        <div class="container-fluid">
          <button type="button" class="btn btn-outline-secondary d-flex align-items-center gap-2" @click="openMenu">
            <i class="bi bi-list fs-5"></i><span>Menu</span>
          </button>
          <span class="navbar-brand ms-auto">Member Area</span>
        </div>
      </nav>

      <div class="container-fluid py-4">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>
    </main>

    <!-- Mobile overlay + sliding nav -->
    <div
      v-if="!isDesktop && isMenuOpen"
      class="mobile-drawer"
      @click.self="closeMenu"
      role="dialog"
      aria-modal="true"
      aria-label="User navigation"
    >
      <transition name="drawer">
        <div class="drawer-panel" v-show="isMenuOpen">
          <div class="d-flex justify-content-end p-2 border-bottom">
            <button type="button" class="btn btn-light btn-sm" @click="closeMenu" aria-label="Close menu">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="drawer-content">
            <UserSidebar />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import UserSidebar from '@/components/nav/UserSidebar.vue';

const isDesktop = ref(window.matchMedia('(min-width: 992px)').matches);
const isMenuOpen = ref(false);
const router = useRouter();
let removeHook: null | (() => void) = null;

const mq = window.matchMedia('(min-width: 992px)');
const onMQChange = (e: MediaQueryListEvent) => { isDesktop.value = e.matches; if (e.matches) isMenuOpen.value = false; };
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') isMenuOpen.value = false; };

const openMenu = () => { isMenuOpen.value = true; };
const closeMenu = () => { isMenuOpen.value = false; };

onMounted(() => {
  mq.addEventListener('change', onMQChange);
  window.addEventListener('keydown', onKey);
  removeHook = router.afterEach(() => { isMenuOpen.value = false; });
});
onBeforeUnmount(() => {
  mq.removeEventListener('change', onMQChange);
  window.removeEventListener('keydown', onKey);
  removeHook?.();
});

watch(isMenuOpen, (open) => { document.body.style.overflow = open ? 'hidden' : ''; });
</script>

<style scoped>
/* Desktop offset (collapsed rail width = 84px) */
.main-content { padding-left: 84px; min-height: 100vh; }
@media (max-width: 991.98px) { .main-content { padding-left: 0; } }

/* Fixed desktop shell */
.sidebar-shell {
  position: fixed; top: 0; left: 0; height: 100vh; width: auto; z-index: 1040;
  background: #fff; border-right: 1px solid rgba(0,0,0,.125);
}

/* Page fade */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Mobile overlay */
.mobile-drawer {
  position: fixed; inset: 0; background: rgba(0,0,0,.25);
  z-index: 1080; /* above navbar & content */
  display: flex;
}

/* Sliding panel */
.drawer-panel {
  width: 320px; max-width: 88%; height: 100%; background: #fff;
  border-right: 1px solid rgba(0,0,0,.125); box-shadow: 0 0.5rem 1rem rgba(0,0,0,.15);
  display: flex; flex-direction: column;
}
.drawer-content { flex: 1 1 auto; overflow-y: auto; -webkit-overflow-scrolling: touch; }

/* Slide in/out — start fully off-canvas for a clear reveal */
.drawer-enter-active, .drawer-leave-active { transition: transform .22s ease, opacity .22s ease; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(-100%); opacity: 0; }

/* Make sidebar behave normally inside drawer */
.drawer-panel :deep(.sidebar) {
  position: relative !important; top: auto !important; left: auto !important;
  height: 100% !important; width: 100% !important; max-width: none !important;
  border-right: 0 !important; box-shadow: none !important;
}
.drawer-panel :deep(.sidebar .sidebar-inner) { width: 100% !important; }

/* Ensure navs are visible in mobile drawer (override hidden/collapsed rules) */
.drawer-panel :deep(.sidebar nav),
.drawer-panel :deep(.sidebar .nav),
.drawer-panel :deep(.sidebar .navbar-nav),
.drawer-panel :deep(.sidebar .collapse) {
  display: block !important;
  visibility: visible !important;
  height: auto !important;
  opacity: 1 !important;
}

/* If UserSidebar uses a 'collapsed' class for desktop rail, neutralize it in drawer */
.drawer-panel :deep(.sidebar.collapsed) { width: 100% !important; }
.drawer-panel :deep(.sidebar.collapsed .nav-link .label),
.drawer-panel :deep(.sidebar.collapsed .tier-label) {
  display: inline !important;
  opacity: 1 !important;
}

/* 🔧 EXTRA UN-HIDE for Bootstrap utility classes often used on sidebars */

.drawer-panel :deep(.d-lg-none) { display: block !important; }             /* safety */
.drawer-panel :deep(.d-md-none) { display: block !important; }
.drawer-panel :deep(.d-sm-none) { display: block !important; }

/* Some sidebars hide via [hidden] or aria flags */
.drawer-panel :deep([hidden]) { display: block !important; }
.drawer-panel :deep([aria-hidden="true"]) { display: block !important; visibility: visible !important; }

/* Keep the desktop collapse chevron hidden inside the drawer */
.drawer-panel :deep(.toggle-btn) {
  display: none !important;
}

/* If the root .sidebar itself is hidden on mobile by media queries */
@media (max-width: 991.98px) {
  .drawer-panel :deep(.sidebar) { display: block !important; }
}
</style>
