<template>
  <div>
    <!-- Sidebar (desktop = sticky, mobile = offcanvas) -->
    <div
      :id="mobileId"
      class="sidebar offcanvas offcanvas-start offcanvas-md bg-white border-end d-flex flex-column p-3 shadow-sm"
      tabindex="-1"
      :class="{ collapsed: isRail }"
      :style="{ width: isRail ? collapsedWidth : '280px' }"
    >
      <!-- Header: badge + desktop collapse + mobile close (X) -->
      <div class="d-flex align-items-center justify-content-between mb-3">
        <div class="d-flex align-items-center gap-2 overflow-hidden header-meta">
          <span
            class="tier-icon rounded-circle d-inline-flex align-items-center justify-content-center"
            :style="{ backgroundColor: adminMeta.bg, color: adminMeta.fg, boxShadow: adminMeta.ring }"
            :title="adminMeta.label"
            aria-hidden="true"
          >
            <i class="bi" :class="adminMeta.icon"></i>
          </span>

          <span class="brand-text fw-semibold text-truncate d-flex align-items-center gap-2">
            <span class="badge text-bg-light border small fw-normal">{{ adminMeta.label }}</span>
          </span>
        </div>

        <!-- Desktop collapse toggle -->
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm rounded-circle d-none d-md-inline-flex"
          @click="toggle()"
          :aria-label="isRail ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <i class="bi" :class="isRail ? 'bi-chevron-double-right' : 'bi-chevron-double-left'"></i>
        </button>

        <!-- Mobile close (lets Bootstrap remove the backdrop) -->
        <button
          type="button"
          class="btn-close d-inline-flex d-md-none ms-2"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>

      <!-- Profile (hidden when collapsed via CSS) -->
      <div class="text-center mb-4 profile">
        <div
          class="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary text-white mb-2"
          style="width: 56px; height: 56px; font-weight: 700"
        >
          {{ initials }}
        </div>
        <div class="profile-text">
          <div class="fw-semibold small text-truncate">{{ displayName }}</div>
          <div class="text-muted small text-truncate">{{ adminEmail }}</div>
        </div>
      </div>

      <!-- Nav -->
      <ul class="nav nav-pills flex-column gap-1 mb-auto">
        <li class="nav-item" v-if="has('admin.dashboard')">
          <RouterLink
            :to="{ name: 'admin.dashboard' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            exact-active-class="active"
            :title="isRail ? 'Dashboard' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-speedometer2 fs-5"></i>
            <span class="link-text">Dashboard</span>
          </RouterLink>
        </li>

        <li class="nav-item" v-if="has('admin.users')">
          <RouterLink
            :to="{ name: 'admin.users' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'Users' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-people fs-5"></i>
            <span class="link-text">Users</span>
          </RouterLink>
        </li>

        <li class="nav-item" v-if="has('admin.minigames')">
          <RouterLink
            :to="{ name: 'admin.minigames' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'Mini Games' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-joystick fs-5"></i>
            <span class="link-text">Mini Games</span>
          </RouterLink>
        </li>

        <li class="nav-item" v-if="has('admin.products')">
          <RouterLink
            :to="{ name: 'admin.products' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'Products' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-bag fs-5"></i>
            <span class="link-text">Products</span>
          </RouterLink>
        </li>

        <li class="nav-item" v-if="has('admin.orders')">
          <RouterLink
            :to="{ name: 'admin.orders' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'Orders' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-basket fs-5"></i>
            <span class="link-text">Orders</span>
          </RouterLink>
        </li>

        <li class="nav-item" v-if="has('admin.transactions')">
          <RouterLink
            :to="{ name: 'admin.transactions' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'Transactions' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-receipt fs-5"></i>
            <span class="link-text">Transactions</span>
          </RouterLink>
        </li>

        <!-- ⭐️ NEW: Memberships -->
        <li class="nav-item" v-if="has('admin.memberships')">
          <RouterLink
            :to="{ name: 'admin.memberships' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'Memberships' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-award fs-5"></i>
            <span class="link-text">Memberships</span>
          </RouterLink>
        </li>

        <li class="nav-item" v-if="has('admin.settings')">
          <RouterLink
            :to="{ name: 'admin.settings' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'Settings' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-gear fs-5"></i>
            <span class="link-text">Settings</span>
          </RouterLink>
        </li>
      </ul>

      <!-- Logout -->
      <div class="pt-3 border-top">
        <button
          type="button"
          class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          :class="{ 'icon-only': isRail }"
          @click="logout"
          :title="isRail ? 'Logout' : ''"
        >
          <i class="bi bi-box-arrow-right"></i>
          <span class="link-text">Logout</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* IMPORTANT: Ensure you import Bootstrap bundle once (e.g. in main.ts)
   import 'bootstrap/dist/js/bootstrap.bundle.min.js'
*/
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { currentUser } from '@/lib/authState'

/* ---------- config ---------- */
const collapsedWidth = '75px'
const mobileId = 'adminSidebar'

/* ---------- router ---------- */
const router = useRouter()

/* ---------- collapse state ---------- */
const isCollapsed = ref(localStorage.getItem('adminSidebarCollapsed') === '1')
const toggle = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('adminSidebarCollapsed', isCollapsed.value ? '1' : '0')
}

// Allow the icon-only "rail" only on md and up
const mqMd = window.matchMedia('(min-width: 768px)')
const isMdUp = ref(mqMd.matches)
const onMqChange = (e: MediaQueryListEvent) => (isMdUp.value = e.matches)
onMounted(() => mqMd.addEventListener('change', onMqChange))
onBeforeUnmount(() => mqMd.removeEventListener('change', onMqChange))
const isRail = computed(() => isMdUp.value && isCollapsed.value)

/* ---------- route guard helper ---------- */
const has = (name: string) => router.hasRoute(name)

/* ---------- identity ---------- */
const adminEmail = ref<string>('')
const fullName = ref<string>('')

const initials = computed(() => {
  const name = (fullName.value || adminEmail.value || '').trim()
  if (!name) return 'A'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})
const displayName = computed(() => fullName.value || 'Admin')

const adminMeta = {
  label: 'Admin',
  icon: 'bi-shield-lock',
  bg: '#EAF4FF',
  fg: '#0D6EFD',
  ring: '0 0 0 6px rgba(13,110,253,.12)',
}

/* ---------- logout ---------- */
const hardBlockBackToAuthed = () => {
  window.history.replaceState(null, '', window.location.href)
  const handler = () => router.replace({ name: 'admin.login' })
  window.addEventListener('popstate', handler, { once: true })
}
const logout = async () => {
  try {
    await supabase.auth.signOut()
  } catch (_) {}
  currentUser.value = null
  hardBlockBackToAuthed()
  router.replace({ name: 'admin.login' })
  closeOffcanvasIfMobile()
}

/* ---------- bootstrap offcanvas mgmt ---------- */
const oc = ref<any>(null) // Bootstrap Offcanvas instance

const killBackdrops = () => {
  document.querySelectorAll('.offcanvas-backdrop').forEach((el) => el.remove())
  document.body.classList.remove('offcanvas-open')
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('paddingRight')
}

const closeOffcanvasIfMobile = () => {
  oc.value?.hide?.()
}

onMounted(async () => {
  if (currentUser.value) {
    adminEmail.value = currentUser.value.email
    const { data } = await supabase.auth.getUser()
    const metaName = (data.user?.user_metadata?.full_name as string) || ''
    if (metaName) {
      fullName.value = metaName
    } else {
      const { data: row } = await supabase
        .from('admins')
        .select('full_name')
        .eq('id', currentUser.value.id)
        .single()
      if (row?.full_name) fullName.value = String(row.full_name)
    }
  }

  // init bootstrap offcanvas
  // @ts-ignore
  const bs = window.bootstrap
  const el = document.getElementById(mobileId)
  if (bs && el) {
    oc.value = bs.Offcanvas.getOrCreateInstance(el, { backdrop: true, scroll: true })
    el.addEventListener('hidden.bs.offcanvas', killBackdrops)
  }

  // keep profile in sync with auth changes
  watch(
    () => currentUser.value,
    async (u) => {
      adminEmail.value = u?.email ?? ''
      fullName.value = ''
      if (u) {
        const { data: userData } = await supabase.auth.getUser()
        const metaName = (userData.user?.user_metadata?.full_name as string) || ''
        if (metaName) fullName.value = metaName
        else {
          const { data: row } = await supabase.from('admins').select('full_name').eq('id', u.id).single()
          if (row?.full_name) fullName.value = String(row.full_name)
        }
      }
    },
    { immediate: false },
  )

  // hide sidebar on every route change (prevents stuck backdrop)
  router.afterEach(() => {
    oc.value?.hide?.()
    killBackdrops()
  })
})

onBeforeUnmount(() => {
  oc.value?.hide?.()
  killBackdrops()
})
</script>

<style scoped>
/* Base layout */
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  transition: width 200ms ease, padding 160ms ease;
  z-index: 2045; /* above content and backdrop */
}

/* Mobile: offcanvas takes over; force fixed width */
@media (max-width: 767.98px) {
  .sidebar {
    width: 280px !important;
    position: fixed;
    height: 100%;
  }
}

/* ⬆️ Make the offcanvas behave like a normal sidebar on ≥ md */
@media (min-width: 768px) {
  /* show it */
  .sidebar.offcanvas {
    transform: none !important;
    visibility: visible !important;
  }
  /* make it sticky and full height */
  .sidebar.offcanvas.offcanvas-start {
    position: sticky !important;
    top: 0;
    height: 100vh;
    box-shadow: none;
  }
  /* ensure the body doesn't keep offcanvas state on desktop */
  :global(body.offcanvas-open) { overflow: auto !important; }
  :global(.offcanvas-backdrop) { display: none !important; }
}


/* Collapsed width */
.collapsed {
  width: v-bind(collapsedWidth);
}

/* Hide meta & profile when collapsed */
.collapsed .header-meta,
.collapsed .profile {
  display: none !important;
}

/* Badge icon size */
.tier-icon {
  width: 24px;
  height: 24px;
  font-size: 14px;
}

/* Nav links */
.nav-link {
  color: #495057;
  border-radius: 12px;
  padding: 0.5rem 0.75rem;
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.12s ease;
  display: flex;
  align-items: center;
}
.nav-link:hover {
  background-color: #f1f3f5;
  color: #212529;
  transform: translateX(2px);
}
.nav-link.active {
  background-color: #0d6efd;
  color: #fff !important;
}

/* Icons only (collapsed) */
.icon-only {
  width: 44px;
  height: 44px;
  padding: 0 !important;
  border-radius: 12px;
  display: flex !important;
  align-items: center;
  justify-content: center;
  gap: 0 !important;
}
.icon-only .link-text {
  display: none !important;
}
.icon-only:hover {
  transform: none !important;
}

/* Logout in collapsed look */
.icon-only.btn.btn-outline-danger {
  border-color: #e9ecef;
  color: #dc3545;
  background: #fff;
}
.icon-only.btn.btn-outline-danger:hover {
  background: #fff5f5;
  border-color: #f1c2c2;
}
</style>
