<template>
  <div>
    <!-- Sidebar (desktop = sticky, mobile = offcanvas) -->
    <div
      :id="mobileId"
      class="sidebar offcanvas-md offcanvas-start bg-white border-end d-flex flex-column h-100% p-3 shadow-sm"
      tabindex="-1"
      :class="{ collapsed: isCollapsed }"
      :style="{ width: isCollapsed ? collapsedWidth : '280px' }"
    >
      <!-- Top: admin badge + collapse toggle -->
      <div class="d-flex align-items-center justify-content-between mb-3">
        <div class="d-flex align-items-center gap-2 overflow-hidden header-meta">
          <!-- Admin badge icon -->
          <span
            class="tier-icon rounded-circle d-inline-flex align-items-center justify-content-center"
            :style="{
              backgroundColor: adminMeta.bg,
              color: adminMeta.fg,
              boxShadow: adminMeta.ring,
            }"
            :title="adminMeta.label"
            aria-hidden="true"
          >
            <i class="bi" :class="adminMeta.icon"></i>
          </span>

          <!-- Admin label -->
          <span class="brand-text fw-semibold text-truncate d-flex align-items-center gap-2">
            <span class="badge text-bg-light border small fw-normal">
              {{ adminMeta.label }}
            </span>
          </span>
        </div>

        <!-- Desktop collapse toggle -->
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm rounded-circle toggle-btn d-none d-md-inline-flex"
          @click="toggle()"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <i
            class="bi"
            :class="isCollapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'"
          ></i>
        </button>
      </div>

      <!-- Profile (hidden by CSS when collapsed) -->
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
            :class="{ 'icon-only': isCollapsed }"
            active-class="active"
            exact-active-class="active"
            :title="isCollapsed ? 'Dashboard' : ''"
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
            :class="{ 'icon-only': isCollapsed }"
            active-class="active"
            :title="isCollapsed ? 'Users' : ''"
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
            :class="{ 'icon-only': isCollapsed }"
            active-class="active"
            :title="isCollapsed ? 'Mini Games' : ''"
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
            :class="{ 'icon-only': isCollapsed }"
            active-class="active"
            :title="isCollapsed ? 'Products' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-bag fs-5"></i>
            <span class="link-text">Products</span>
          </RouterLink>
        </li>
        <!-- Add inside your admin sidebar nav list (kept out of your file to avoid edits) -->
        <li class="nav-item" v-if="has('admin.orders')">
          <RouterLink
            :to="{ name: 'admin.orders' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isCollapsed }"
            active-class="active"
            :title="isCollapsed ? 'Orders' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-basket fs-5"></i>
            <span class="link-text">Orders</span>
          </RouterLink>
        </li>

        <!-- 🔹 NEW: Transactions link (added above Settings) -->
        <li class="nav-item" v-if="has('admin.transactions')">
          <RouterLink
            :to="{ name: 'admin.transactions' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isCollapsed }"
            active-class="active"
            :title="isCollapsed ? 'Transactions' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-receipt fs-5"></i>
            <span class="link-text">Transactions</span>
          </RouterLink>
        </li>
        <!-- 🔹 END NEW -->

        <li class="nav-item" v-if="has('admin.settings')">
          <RouterLink
            :to="{ name: 'admin.settings' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isCollapsed }"
            active-class="active"
            :title="isCollapsed ? 'Settings' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-gear fs-5"></i>
            <span class="link-text">Settings</span>
          </RouterLink>
        </li>
      </ul>

      <!-- Logout at bottom -->
      <div class="pt-3 border-top">
        <button
          type="button"
          class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          :class="{ 'icon-only': isCollapsed }"
          @click="logout"
          :title="isCollapsed ? 'Logout' : ''"
        >
          <i class="bi bi-box-arrow-right"></i>
          <span class="link-text">Logout</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { currentUser } from '@/lib/authState' // <-- use your authState.ts

// ------- config -------
const collapsedWidth = '75px'
const mobileId = 'adminSidebar' // your topbar button should target #adminSidebar

// ------- state & router -------
const router = useRouter()
const isCollapsed = ref(localStorage.getItem('adminSidebarCollapsed') === '1')

const toggle = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('adminSidebarCollapsed', isCollapsed.value ? '1' : '0')
}

// Helper: show link only if route exists
const has = (name: string) => router.hasRoute(name)

// ------- identity (admin) -------
const adminEmail = ref<string>('')
const fullName = ref<string>('')

// initials from name/email
const initials = computed(() => {
  const name = (fullName.value || adminEmail.value || '').trim()
  if (!name) return 'A'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})
const displayName = computed(() => fullName.value || 'Admin')

// admin badge visuals
const adminMeta = {
  label: 'Admin',
  icon: 'bi-shield-lock',
  bg: '#EAF4FF',
  fg: '#0D6EFD',
  ring: '0 0 0 6px rgba(13,110,253,.12)',
}

// Prevent going back to a protected page after logout
const hardBlockBackToAuthed = () => {
  // Replace current history entry so Back won't return to the authed page
  window.history.replaceState(null, '', window.location.href)
  // On immediate back attempt, force to login (one-shot)
  const handler = () => router.replace({ name: 'admin.login' })
  window.addEventListener('popstate', handler, { once: true })
}

// Logout
const logout = async () => {
  try {
    await supabase.auth.signOut()
  } catch (_) {}

  // Clear in-memory auth immediately
  currentUser.value = null

  // Harden against "Back" to dashboard
  hardBlockBackToAuthed()

  // Replace so the authed page isn't in history
  router.replace({ name: 'admin.login' })

  closeOffcanvasIfMobile()
}

// If opened as Bootstrap offcanvas on mobile, hide after clicking
const closeOffcanvasIfMobile = () => {
  // Only attempt if Bootstrap is present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  if (!w?.bootstrap) return
  const el = document.getElementById(mobileId)
  if (!el) return
  const oc = w.bootstrap.Offcanvas.getInstance(el) || new w.bootstrap.Offcanvas(el)
  oc?.hide?.()
}

// Keep profile info in sync with your auth state
watch(
  () => currentUser.value,
  async (u) => {
    adminEmail.value = u?.email ?? ''
    fullName.value = '' // reset; will load below

    if (u) {
      // Prefer auth metadata's full_name when available
      const { data: userData } = await supabase.auth.getUser()
      const metaName = (userData.user?.user_metadata?.full_name as string) || ''
      if (metaName) {
        fullName.value = metaName
      } else {
        // Fallback to admins table
        const { data: row } = await supabase
          .from('admins')
          .select('full_name')
          .eq('id', u.id)
          .single()
        if (row?.full_name) fullName.value = String(row.full_name)
      }
    }
  },
  { immediate: true },
)

onMounted(async () => {
  // Initialize from currentUser if already set by initAuth()
  if (currentUser.value) {
    adminEmail.value = currentUser.value.email
    // Try to read full name from auth metadata first
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
})
</script>

<style scoped>
/* Base layout */
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  transition:
    width 200ms ease,
    padding 160ms ease;
  z-index: 2045; /* over content when used as offcanvas */
}

/* Offcanvas adjustments (mobile) */
@media (max-width: 767.98px) {
  .sidebar {
    width: 280px !important;
    position: fixed;
    height: 100%;
  }
}

/* Collapsed width */
.collapsed {
  width: v-bind(collapsedWidth);
}

/* Hide header meta (badge + label) & profile when collapsed */
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
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.12s ease;
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

/* When collapsed, show icons only */
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

/* Logout button style in collapsed mode */
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
