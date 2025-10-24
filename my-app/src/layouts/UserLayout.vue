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

      <div class="container-fluid">
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

    <!-- ✅ Floating notification icon (slides out on scroll down, in on scroll up) -->
    <button
      class="notify-fab btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center"
      :class="{ 'notify-hidden': !isNotifVisible || (!isDesktop && isMenuOpen) }"
      type="button"
      :aria-label="notifCount ? `Notifications: ${displayNotifCount} new` : 'Notifications'"
      @click="openNotifModal"
    >
      <i class="bi bi-bell fs-5"></i>
      <!-- 🔴 Count badge -->
      <span
        v-if="notifCount > 0"
        class="notif-badge"
        aria-live="polite"
        :title="`${displayNotifCount} new notifications`"
      >{{ displayNotifCount }}</span>
    </button>
  </div>

  <!-- ✅ Lightweight small modal for Notifications.vue -->
  <teleport to="body">
    <div
      v-if="isNotifModalOpen"
      class="notif-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      @click.self="closeNotifModal"
    >
      <transition name="notif-zoom">
        <div class="notif-modal" v-show="isNotifModalOpen">
          <div class="d-flex align-items-center justify-content-between border-bottom px-3 py-2">
            <div class="fw-semibold">Notifications</div>
            <button type="button" class="btn btn-light btn-sm" aria-label="Close notifications" @click="closeNotifModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="notif-body">
            <!-- Lazy-load Notifications.vue to keep this shell light -->
            <Suspense>
              <template #default>
                <!-- child will emit update:count -->
                <Notifications @update:count="onNotifCount" />
              </template>
              <template #fallback>
                <div class="p-3 text-muted small d-flex align-items-center gap-2">
                  <span class="spinner-border spinner-border-sm"></span>
                  Loading…
                </div>
              </template>
            </Suspense>
          </div>

          <div class="border-top px-3 py-2 text-end">
            <button class="btn btn-primary btn-sm" @click="closeNotifModal">Close</button>
          </div>
        </div>
      </transition>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, defineAsyncComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import UserSidebar from '@/components/nav/UserSidebar.vue';
/* 🆕 Supabase for realtime */
import { supabase } from '@/lib/supabaseClient';

/* 🔹 Notifications component (as requested: access ../user/Notifications.vue) */
const Notifications = defineAsyncComponent(() => import('../pages/user/Notifications.vue'));

const isDesktop = ref(window.matchMedia('(min-width: 992px)').matches);
const isMenuOpen = ref(false);
const router = useRouter();
let removeHook: null | (() => void) = null;

const mq = window.matchMedia('(min-width: 992px)');
const onMQChange = (e: MediaQueryListEvent) => { isDesktop.value = e.matches; if (e.matches) isMenuOpen.value = false; };
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isMenuOpen.value = false;
    isNotifModalOpen.value = false; /* 🔹 also close notifications modal via ESC */
  }
};

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

/* 👉 Also lock scroll when notifications modal is open */
const isNotifModalOpen = ref(false);

/* Keep body scroll locked when either drawer or notif modal is open */
watch([isMenuOpen, isNotifModalOpen], ([menuOpen, modalOpen]) => {
  const lock = menuOpen || modalOpen;
  document.body.style.overflow = lock ? 'hidden' : '';
});

/* ✅ Scroll-direction reveal for the floating notification button */
const isNotifVisible = ref(true);
let lastScrollY = window.scrollY;
let lastToggleTs = 0;

const onScroll = () => {
  const now = performance.now();
  // throttle a bit for performance
  if (now - lastToggleTs < 80) return;

  const current = window.scrollY;
  const delta = current - lastScrollY;

  // Only react when movement is significant enough
  if (Math.abs(delta) > 6) {
    // scrolling down -> hide, up -> show
    isNotifVisible.value = delta < 0;
    lastScrollY = current;
    lastToggleTs = now;
  }
};

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  // 🔔 Optional: allow global updates via event bus
  window.addEventListener('notif:count', onNotifCountEvent as EventListener);
  /* 🆕 Load last known count so FAB isn't 0 before Notifications mounts */
  try {
    const raw = localStorage.getItem(NOTIF_COUNT_KEY);
    if (raw) {
      const n = Number(raw);
      if (!Number.isNaN(n) && n >= 0) notifCount.value = n;
    }
  } catch {}
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('notif:count', onNotifCountEvent as EventListener);
});

/* 🔔 Open/Close notifications modal */
const openNotifModal = () => {
  if (!isDesktop.value) isMenuOpen.value = false; // ensure drawer closed on mobile
  isNotifModalOpen.value = true;
};
const closeNotifModal = () => {
  isNotifModalOpen.value = false;
};

/* 🔴 Notif count state + helpers */
const NOTIF_COUNT_KEY = 'notif:lastCount';
const notifCount = ref<number>(0);
const displayNotifCount = computed(() => (notifCount.value > 99 ? '99+' : String(notifCount.value)));

/* 🆕 persist count on change (nice-to-have for reloads) */
watch(notifCount, (n) => {
  try { localStorage.setItem(NOTIF_COUNT_KEY, String(n)); } catch {}
});

// child emit handler (from Notifications.vue -> emit('update:count', n))
const onNotifCount = (n: number) => {
  if (typeof n === 'number' && n >= 0) notifCount.value = n;
};

// global event handler (from Notifications.vue -> window.dispatchEvent('notif:count', {detail:n}))
const onNotifCountEvent = (e: CustomEvent<number> | Event) => {
  const evt = e as CustomEvent<number>;
  const n = Number(evt.detail);
  if (!Number.isNaN(n) && n >= 0) notifCount.value = n;
};

/* ──────────────────────────────────────────────────────────────
   🆕 Realtime FAB count (Supabase → ewallet.transactions)
   - Increments on INSERT for current user
   - Ignores IDs already marked "seen" (same storage key as child)
   - Primes an initial count from latest TXs (approx) until child overrides
   ────────────────────────────────────────────────────────────── */
const userId = ref<string | null>(null);
let rtNotifChannel: ReturnType<typeof supabase.channel> | null = null;

/* Same seen storage key format as Notifications.vue */
const seenIds = ref<Set<string>>(new Set());
const storageKey = () => (userId.value ? `notif:seen:${userId.value}` : 'notif:seen');
function loadSeen() {
  try {
    const raw = localStorage.getItem(storageKey());
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) seenIds.value = new Set(arr as string[]);
    }
  } catch {}
}
const isSeenId = (id: string) => seenIds.value.has(id);

/* Prime approximate count from recent transactions (child will override with full, grouped logic) */
async function primeCountFromTransactions() {
  if (!userId.value) return;
  try {
    const { data, error } = await supabase
      .schema('ewallet')
      .from('transactions')
      .select('id')
      .eq('user_id', userId.value)
      .order('updated_at', { ascending: false })
      .limit(50);
    if (!error && Array.isArray(data)) {
      const unseen = (data as { id: string }[]).filter(r => !isSeenId(r.id)).length;
      if (unseen > notifCount.value) notifCount.value = unseen; // don't undercut persisted higher count
    }
  } catch {}
}

/* Bind realtime inserts on ewallet.transactions for current user */
function bindNotifRealtime() {
  if (rtNotifChannel || !userId.value) return;
  rtNotifChannel = supabase
    .channel('rt-ewallet-transactions-fab-' + userId.value)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'ewallet', table: 'transactions', filter: `user_id=eq.${userId.value}` },
      payload => {
        const tx = payload.new as { id: string; user_id: string };
        // If not already marked seen, bump the FAB
        if (!isSeenId(tx.id)) {
          notifCount.value = Math.max(0, (notifCount.value || 0) + 1);
          // Optionally broadcast to keep other listeners (if any) in sync
          try { window.dispatchEvent(new CustomEvent('notif:count', { detail: notifCount.value })); } catch {}
        }
      }
    )
    .subscribe();
}

/* Auth → load seen → prime count → bind realtime */
onMounted(async () => {
  try {
    const { data: auth } = await supabase.auth.getUser();
    userId.value = auth?.user?.id ?? null;
  } catch {}
  loadSeen();
  await primeCountFromTransactions();
  bindNotifRealtime();
});

onBeforeUnmount(() => {
  if (rtNotifChannel) supabase.removeChannel(rtNotifChannel);
});
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

/* ✅ Floating notification button */
.notify-fab {
  position: fixed;
  right: 16px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  z-index: 1090; /* above drawer (1080) */
  transition: transform .25s ease, opacity .25s ease;
  will-change: transform, opacity;
}
.notify-hidden {
  transform: translateX(140%);
  opacity: .35;
  pointer-events: none;
}

/* Slightly lift on hover for desktop */
@media (hover: hover) {
  .notify-fab:hover { transform: translateY(-2px); }
  .notify-hidden:hover { transform: translateX(140%); }
}

/* 🔴 Count badge */
.notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #dc3545;
  color: #fff;
  font-size: 12px;
  line-height: 20px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px #fff;
  animation: badge-pop .2s ease-out;
}
@keyframes badge-pop {
  0% { transform: scale(.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.notify-hidden .notif-badge { opacity: 0; }

/* 🔔 Notifications modal backdrop */
.notif-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  z-index: 1100; /* above FAB */
  display: grid;
  place-items: center;
  padding: 12px;
}

/* 🔔 Notifications modal — anchored above the FAB, bottom-right */
.notif-modal {
  position: fixed;
  right: 16px;
  /* 24px (FAB bottom offset) + 56px (FAB height) + 12px (gap) = 92px */
  bottom: calc(24px + 56px + 12px);
  width: 420px;
  max-width: min(92vw, 420px);
  background: #fff;
  border-radius: .75rem;
  box-shadow: 0 1rem 2.5rem rgba(0,0,0,.25);
  overflow: hidden;
  z-index: 1101;                 /* ensure above backdrop */
  transform-origin: bottom right; /* zoom from the FAB corner */
}

/* Optional little pointer "caret" from panel toward FAB */
.notif-modal::after {
  content: "";
  position: absolute;
  right: 24px;
  bottom: -8px;
  border-width: 8px;
  border-style: solid;
  border-color: #fff transparent transparent transparent;
  filter: drop-shadow(0 -1px 2px rgba(0,0,0,.15));
}

.notif-body {
  max-height: min(70vh, 540px);
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

/* Modal animation */
.notif-zoom-enter-active,
.notif-zoom-leave-active { transition: transform .18s ease, opacity .18s ease; }
.notif-zoom-enter-from,
.notif-zoom-leave-to { transform: scale(.96); opacity: 0; }

/* ——————————————————————————————— */
/* ✅ Make collapsed-mode icons same height as expanded */
/* Adjust --sb-icon-h if your expanded icon size differs */
.sidebar-shell :deep(.sidebar.collapsed .nav-link .bi),
.drawer-panel :deep(.sidebar.collapsed .nav-link .bi) {
  height: var(--sb-icon-h);
  width: var(--sb-icon-h);
  font-size: var(--sb-icon-h);
  line-height: var(--sb-icon-h);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* If you use custom wrappers for icons (optional, harmless if absent) */
.sidebar-shell :deep(.sidebar.collapsed .tier-icon),
.drawer-panel :deep(.sidebar.collapsed .tier-icon),
.sidebar-shell :deep(.sidebar.collapsed .icon-ring),
.drawer-panel :deep(.sidebar.collapsed .icon-ring) {
  height: calc(var(--sb-icon-h) * 1.6);
  width: calc(var(--sb-icon-h) * 1.6);
  min-height: calc(var(--sb-icon-h) * 1.6);
  min-width: calc(var(--sb-icon-h) * 1.6);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>

<!-- 🌿 Global minimalist scrollbar (no layout changes) -->
<style>
/* Reserve scrollbar space to avoid layout shift when locking body scroll */
html { scrollbar-gutter: stable; }

:root {
  /* 🔧 Set your expanded icon height once; collapsed will match this */
  --sb-icon-h: 1.5rem;

  --sb-track: transparent;
  --sb-thumb: rgba(0, 0, 0, 0.28);
  --sb-thumb-hover: rgba(0, 0, 0, 0.45);
  --sb-thumb-active: rgba(0, 0, 0, 0.55);
}

@media (prefers-color-scheme: dark) {
  :root {
    --sb-track: transparent;
    --sb-thumb: rgba(255, 255, 255, 0.25);
    --sb-thumb-hover: rgba(255, 255, 255, 0.4);
    --sb-thumb-active: rgba(255, 255, 255, 0.55);
  }
}

/* Firefox */
* {
  scrollbar-width: auto;                /* keep default width to avoid size changes */
  scrollbar-color: var(--sb-thumb) var(--sb-track);
}

/* WebKit (Chrome/Edge/Safari/Opera) */
*::-webkit-scrollbar {
  /* no width/height here to avoid altering layout */
  background: var(--sb-track);
}

*::-webkit-scrollbar-thumb {
  background-color: var(--sb-thumb);
  border-radius: 999px;
  border: 3px solid transparent;       /* makes the thumb look thinner without changing layout */
  background-clip: padding-box;
}

*::-webkit-scrollbar-thumb:hover {
  background-color: var(--sb-thumb-hover);
}

*::-webkit-scrollbar-thumb:active {
  background-color: var(--sb-thumb-active);
}

*::-webkit-scrollbar-track {
  background: var(--sb-track);
}

*::-webkit-scrollbar-corner {
  background: var(--sb-track);
}

/* Optional: hide scrollbar buttons for a cleaner look (doesn't affect size) */
*::-webkit-scrollbar-button { display: none; }
</style>
