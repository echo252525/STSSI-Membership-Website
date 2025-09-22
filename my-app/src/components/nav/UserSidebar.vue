<template>
  <div>
    <!-- Sidebar (desktop = sticky, mobile = offcanvas) -->
    <div
      id="mobileSidebar"
      class="sidebar offcanvas-md offcanvas-start bg-white border-end d-flex flex-column h-100 p-3 shadow-sm"
      tabindex="-1"
      :class="{ collapsed: isCollapsed }"
      :style="{ width: isCollapsed ? collapsedWidth : '280px' }"
    >
      <!-- Top: tier icon + toggle -->
      <div class="d-flex align-items-center justify-content-between mb-3">
        <div class="d-flex align-items-center gap-2 overflow-hidden">
          <!-- Dynamic tier icon -->
          <span
            v-if="showTier"
            class="tier-icon rounded-circle d-inline-flex align-items-center justify-content-center"
            :style="{ backgroundColor: membershipMeta.bg, color: membershipMeta.fg, boxShadow: membershipMeta.ring }"
            :title="membershipMeta.label + ' Membership'"
          >
            <i class="bi" :class="membershipMeta.icon"></i>
          </span>

          <!-- Tier label -->
          <span
            v-if="showTier"
            class="brand-text fw-semibold text-truncate d-flex align-items-center gap-2"
          >
            <span class="badge text-bg-light border small fw-normal">
              {{ membershipMeta.label }} Membership
            </span>
          </span>
        </div>

        <button
          type="button"
          class="btn btn-outline-secondary btn-sm rounded-circle toggle-btn d-none d-md-inline-flex"
          @click="toggle()"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <i class="bi" :class="isCollapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'"></i>
        </button>
      </div>

      <!-- Profile (hidden when collapsed) -->
      <div class="text-center mb-4 profile" :title="displayName" v-show="!isCollapsed">
        <div
          class="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary text-white mb-2"
          style="width: 56px; height: 56px; font-weight: 700;"
        >
          {{ initials }}
        </div>
        <div class="profile-text">
          <div class="fw-semibold small text-truncate">{{ displayName }}</div>
          <div class="text-muted small text-truncate">{{ userEmail }}</div>
          <div v-if="membershipType" class="text-muted small text-truncate">
            {{ membershipMeta.label }} member
          </div>
        </div>
      </div>

      <!-- Nav -->
      <ul class="nav nav-pills flex-column gap-1 mb-auto">
        <li class="nav-item">
          <RouterLink
            :to="{ name: 'user.dashboard' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isCollapsed }"
            active-class="active"
            exact-active-class="active"
            :title="isCollapsed ? 'Dashboard' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-house-door fs-5"></i>
            <span class="link-text" v-show="!isCollapsed">Dashboard</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink
            :to="{ name: 'user.membership' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isCollapsed }"
            active-class="active"
            :title="isCollapsed ? 'Membership' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-card-checklist fs-5"></i>
            <span class="link-text" v-show="!isCollapsed">Membership</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink
            :to="{ name: 'user.minigames' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isCollapsed }"
            active-class="active"
            :title="isCollapsed ? 'Mini Games' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-controller fs-5"></i>
            <span class="link-text" v-show="!isCollapsed">Mini Games</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink
            :to="{ name: 'user.settings' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isCollapsed }"
            active-class="active"
            :title="isCollapsed ? 'Settings' : ''"
            @click="closeOffcanvasIfMobile"
          >
            <i class="bi bi-gear fs-5"></i>
            <span class="link-text" v-show="!isCollapsed">Settings</span>
          </RouterLink>
        </li>
      </ul>

      <!-- Logout -->
      <div class="pt-3 border-top">
        <button
          type="button"
          class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          :class="{ 'icon-only': isCollapsed }"
          @click="logout"
          :title="isCollapsed ? 'Logout' : ''"
        >
          <i class="bi bi-box-arrow-right"></i>
          <span class="link-text" v-show="!isCollapsed">Logout</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { currentUser } from '@/lib/authState' // <-- use your shared auth state

const router = useRouter()
const collapsedWidth = '75px'

const isCollapsed = ref(localStorage.getItem('sidebarCollapsed') === '1')
const toggle = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebarCollapsed', isCollapsed.value ? '1' : '0')
}

const userEmail = ref<string>('')
const fullName = ref<string>('')
const membershipType = ref<string>('') // regular | silver | gold | diamond | platinum

const initials = computed(() => {
  const name = (fullName.value || userEmail.value || '').trim()
  if (!name) return 'U'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})
const displayName = computed(() => fullName.value || 'User')

/** Only show membership tier UI when expanded */
const showTier = computed(() => !isCollapsed.value && !!membershipType.value)

/** Dynamic UI metadata for membership tier */
const membershipMeta = computed(() => {
  const t = (membershipType.value || 'regular').toLowerCase()
  switch (t) {
    case 'gold':
      return { label: 'Gold', icon: 'bi-gem', bg: '#FFF7E0', fg: '#A67C00', ring: '0 0 0 6px rgba(217,164,6,.18)' }
    case 'silver':
      return { label: 'Silver', icon: 'bi-gem', bg: '#F4F6F8', fg: '#6C757D', ring: '0 0 0 6px rgba(108,117,125,.18)' }
    case 'diamond':
      return { label: 'Diamond', icon: 'bi-diamond', bg: '#E8F9FF', fg: '#0AA2C0', ring: '0 0 0 6px rgba(13,202,240,.18)' }
    case 'platinum':
      return { label: 'Platinum', icon: 'bi-gem', bg: '#EEF1F8', fg: '#6F42C1', ring: '0 0 0 6px rgba(111,66,193,.16)' }
    case 'regular':
    default:
      return { label: 'Regular', icon: 'bi-person', bg: '#E9ECEF', fg: '#6C757D', ring: '0 0 0 0 rgba(0,0,0,0)' }
  }
})

/** Close Bootstrap offcanvas if opened on mobile */
const closeOffcanvasIfMobile = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  if (!w?.bootstrap) return
  const el = document.getElementById('mobileSidebar')
  if (!el) return
  const oc = w.bootstrap.Offcanvas.getInstance(el) || new w.bootstrap.Offcanvas(el)
  oc?.hide?.()
}

/** Harden against "Back" to a protected page after logout */
const hardBlockBackToAuthed = () => {
  // Replace current entry so the previous authed page isn't in the stack
  window.history.replaceState(null, '', window.location.href)
  // If user presses Back immediately, push them to login
  const handler = () => router.replace({ name: 'login' })
  window.addEventListener('popstate', handler, { once: true })
}

const logout = async () => {
  try {
    await supabase.auth.signOut()
  } catch (_) {
    // ignore
  }

  // Clear in-memory user immediately (so UI & guards react)
  currentUser.value = null

  // Prevent navigating back to protected pages
  hardBlockBackToAuthed()

  // Replace (not push) so authed page isn't in history
  router.replace({ name: 'login' })

  closeOffcanvasIfMobile()
}

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  const user = data?.user
  if (user) {
    userEmail.value = user.email || ''
    fullName.value = (user.user_metadata?.full_name as string) || ''

    let { data: row, error } = await supabase
      .from('users')
      .select('membership_type')
      .eq('id', user.id)
      .single()

    if (error || !row) {
      const { data: rowByEmail } = await supabase
        .from('users')
        .select('membership_type')
        .eq('email', user.email)
        .single()
      row = rowByEmail ?? row
    }

    if (row?.membership_type) membershipType.value = String(row.membership_type)
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
  transition: width 200ms ease, padding 160ms ease;
}

/* Offcanvas adjustments (mobile) */
@media (max-width: 767.98px) {
  .sidebar {
    width: 280px !important;
    position: fixed;
    height: 100%;
  }
}

/* Tier icon size */
.tier-icon {
  width: 24px;
  height: 24px;
  font-size: 14px;
}

/* Nav links */
.nav-link {
  color: #495057;
  border-radius: 12px;
  padding: .5rem .75rem;
  transition: background-color .15s ease, color .15s ease, transform .12s ease;
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

/* Icon-only square style when collapsed */
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
.icon-only:hover { transform: none !important; }

/* Logout button style in collapsed mode */
.icon-only.btn.btn-outline-danger {
  border-color: #e9ecef; color: #dc3545; background: #fff;
}
.icon-only.btn.btn-outline-danger:hover {
  background: #fff5f5; border-color: #f1c2c2;
}

/* Hide tier icon if collapsed */
.collapsed .tier-icon { display: none !important; }
</style>
