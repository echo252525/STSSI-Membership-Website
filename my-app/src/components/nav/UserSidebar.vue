<template>
  <div>
    <!-- Sidebar (desktop = sticky, mobile = offcanvas) -->
    <div
      id="mobileSidebar"
      ref="sidebarEl"
      class="sidebar bg-white border-end d-flex flex-column h-100 p-3 shadow-sm"
      tabindex="-1"
      :class="{ collapsed: isRail }"
      :style="{ width: isRail ? collapsedWidth : '280px' }"
    >
      <!-- Top: tier icon + toggle -->
      <div class="d-flex align-items-center justify-content-between mb-3">
        <div class="d-flex align-items-center gap-2 overflow-hidden">
          <!-- Dynamic tier icon -->
          <span
            v-if="showTier"
            class="tier-icon rounded-circle d-inline-flex align-items-center justify-content-center"
            :style="{
              backgroundColor: membershipMeta.bg,
              color: membershipMeta.fg,
              boxShadow: membershipMeta.ring,
            }"
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
          class="btn btn-outline-secondary btn-sm rounded-circle toggle-btn d-none d-lg-inline-flex"
          @click="toggle()"
          :aria-label="isRail ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <i
            class="bi"
            :class="isRail ? 'bi-chevron-double-right' : 'bi-chevron-double-left'"
          ></i>
        </button>
      </div>

      <!-- Profile (hidden when collapsed) -->
      <div
        class="text-center mb-4 profile cursor-pointer profile-card"
        :title="displayName"
        v-show="!isRail"
        role="link"
        tabindex="0"
        @click="goSettings"
        @keydown.enter.prevent="goSettings"
        @keydown.space.prevent="goSettings"
        aria-label="Open Settings"
      >
        <div
          class="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary text-white mb-2 ring-ambient"
          style="width: 56px; height: 56px; font-weight: 700; position: relative; overflow: hidden"
        >
          <!-- ✅ Profile photo (keeps initials as fallback) -->
          <img v-if="avatarUrl" :src="avatarUrl" alt="Profile" class="profile-avatar-img" />
          {{ initials }}
        </div>
        <div class="profile-text">
          <div class="fw-semibold small text-truncate text-primary name-link">
            {{ displayName }}
          </div>
          <div class="text-muted small text-truncate email-link">
            {{ userEmail }}
          </div>
          <div v-if="membershipType" class="text-muted small text-truncate">
            {{ membershipMeta.label }} member
          </div>
        </div>
      </div>

      <!-- ✅ Rail-only avatar shown when collapsed (above Dashboard) -->
      <div
        class="text-center mb-3 cursor-pointer profile-card--rail"
        v-show="isRail"
        :title="displayName"
        role="link"
        tabindex="0"
        @click="goSettings"
        @keydown.enter.prevent="goSettings"
        @keydown.space.prevent="goSettings"
        aria-label="Open Settings"
      >
        <div
          class="rail-avatar rounded-circle d-inline-flex align-items-center justify-content-center bg-primary text-white ring-ambient"
          style="width:35px;height:35px;font-size:32px;"
        >
          <img v-if="avatarUrl" :src="avatarUrl" alt="Profile" class="profile-avatar-img" />
          {{ initials }}
        </div>
      </div>

      <!-- Nav -->
      <ul class="nav nav-pills flex-column gap-1 mb-auto">
        <li class="nav-item">
          <RouterLink
            :to="{ name: 'user.dashboard' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            exact-active-class="active"
            :title="isRail ? 'Dashboard' : ''"
            @click="closeMenu"
          >
            <i class="bi bi-house-door fs-5"></i>
            <span class="link-text" v-show="!isRail">Dashboard</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink
            :to="{ name: 'user.membership' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'Membership' : ''"
            @click="closeMenu"
          >
            <i class="bi bi-card-checklist fs-5"></i>
            <span class="link-text" v-show="!isRail">Membership</span>
          </RouterLink>
        </li>

        <!-- Deals & Rewards -->
        <li class="nav-item">
          <RouterLink
            :to="{ name: 'user.deals' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'Deals & Rewards' : ''"
            @click="closeMenu"
          >
            <i class="bi bi-gift fs-5"></i>
            <span class="link-text" v-show="!isRail">Deals & Rewards</span>
          </RouterLink>
        </li>

        <!-- 🆕 Shop -->
        <li class="nav-item">
          <RouterLink
            :to="{ name: 'user.shop' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'Shop' : ''"
            @click="closeMenu"
          >
            <i class="bi bi-bag fs-5"></i>
            <span class="link-text" v-show="!isRail">Shop</span>
          </RouterLink>
        </li>
        <!-- INSERT THIS BLOCK DIRECTLY BELOW THE SHOP NAV ITEM -->
        <li class="nav-item">
          <RouterLink
            :to="{ name: 'user.mypurchase' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'My Purchases' : ''"
            @click="closeMenu"
          >
            <i class="bi bi-receipt fs-5"></i>
            <span class="link-text" v-show="!isRail">My Purchases</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink
            :to="{ name: 'user.minigames' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'Mini Games' : ''"
            @click="closeMenu"
          >
            <i class="bi bi-controller fs-5"></i>
            <span class="link-text" v-show="!isRail">Mini Games</span>
          </RouterLink>
        </li>

        <!-- E-Wallet -->
        <li class="nav-item">
          <RouterLink
            :to="{ name: 'user.ewallet' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'E-Wallet' : ''"
            @click="closeMenu"
          >
            <i class="bi bi-wallet2 fs-5"></i>
            <span class="link-text" v-show="!isRail">E-Wallet</span>
          </RouterLink>
        </li>

        <li class="nav-item">
          <RouterLink
            :to="{ name: 'user.settings' }"
            class="nav-link d-flex align-items-center gap-2"
            :class="{ 'icon-only': isRail }"
            active-class="active"
            :title="isRail ? 'Settings' : ''"
            @click="closeMenu"
          >
            <i class="bi bi-gear fs-5"></i>
            <span class="link-text" v-show="!isRail">Settings</span>
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
          <span class="link-text" v-show="!isRail">Logout</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { currentUser } from '@/lib/authState'

const router = useRouter()
const collapsedWidth = '75px'

//collapse sidebar when clicked
const emit = defineEmits<{ (e: 'nav'): void }>()
const closeMenu = () => emit('nav')

const isCollapsed = ref(localStorage.getItem('sidebarCollapsed') === '1')
const toggle = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebarCollapsed', isCollapsed.value ? '1' : '0')
}

const userEmail = ref<string>('')
const fullName = ref<string>('')
const membershipType = ref<string>('') // regular | silver | gold | diamond | platinum
const avatarUrl = ref<string | null>(null)

/* ===== Offcanvas instance management (FIX) ===== */
const sidebarEl = ref<HTMLElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let offcanvasInst: any | null = null
let removeAfterEach: (() => void) | null = null // ⭐ keep route hook unsub

function isMobile() {
  return window.matchMedia('(max-width: 767.98px)').matches
}

function ensureOffcanvas() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  if (!w?.bootstrap || !sidebarEl.value) return null
  if (offcanvasInst) return offcanvasInst
  const { Offcanvas } = w.bootstrap
  // Only instantiate on mobile; on md+ it acts like a static sidebar
  if (!isMobile()) return null // ⭐ keep
  offcanvasInst =
    Offcanvas.getInstance(sidebarEl.value) ||
    new Offcanvas(sidebarEl.value, { backdrop: true, scroll: false })
  return offcanvasInst
}

function cleanupBodyOffcanvasArtifacts() {
  // Defensive cleanup in case Bootstrap left artifacts on fast route changes
  document.body.classList.remove('offcanvas-open') // ⭐ class Bootstrap adds to body
  // Remove any stray backdrops
  document.querySelectorAll('.offcanvas-backdrop').forEach((el) => el.remove())
  // Remove inline scroll locks
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('paddingRight')
}

const closeOffcanvasIfMobile = () => {
  const inst = ensureOffcanvas()
  try {
    inst?.hide?.()
  } catch {}
  cleanupBodyOffcanvasArtifacts()
}

/* ⭐⭐⭐ ADDED: Force reload exactly when leaving Mini Games to any other page (throttled) */
const RELOAD_THROTTLE_MS = 3000
function maybeForceReloadWhenLeavingMiniGames(to: any, from: any) {
  if (from?.name === 'user.minigames' && to?.name !== 'user.minigames') {
    const key = 'minigamesReloadAt'
    const last = Number(sessionStorage.getItem(key) || '0')
    const now = Date.now()
    if (now - last > RELOAD_THROTTLE_MS) {
      sessionStorage.setItem(key, String(now))
      // reload into the destination route (keeps the intended nav)
      setTimeout(() => {
        try {
          const href = router.resolve(to).href
          // Use assign so history records the target page after reload
          window.location.assign(href)
        } catch {
          // Fallback to full reload if resolve fails
          window.location.reload()
        }
      }, 0)
    }
  }
}

onMounted(() => {
  ensureOffcanvas()

  // Auto-close offcanvas on ANY route change to avoid stuck backdrops/focus traps
  removeAfterEach = router.afterEach((to, from) => {
    closeOffcanvasIfMobile()
    // 🔁 only when leaving Mini Games
    maybeForceReloadWhenLeavingMiniGames(to, from)
  })
})

onUnmounted(() => {
  try {
    offcanvasInst?.hide?.()
  } catch {}
  try {
    offcanvasInst?.dispose?.()
  } catch {}
  offcanvasInst = null
  cleanupBodyOffcanvasArtifacts()
  if (removeAfterEach) {
    removeAfterEach()
    removeAfterEach = null
  }
})
/* ===== end offcanvas fix ===== */

const initials = computed(() => {
  const name = (fullName.value || userEmail.value || '').trim()
  if (!name) return 'U'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})
const displayName = computed(() => fullName.value || 'User')

/** Only show membership tier UI when expanded */
const showTier = computed(() => !isRail.value && !!membershipType.value)

/** Dynamic UI metadata for membership tier */
const membershipMeta = computed(() => {
  const t = (membershipType.value || 'regular').toLowerCase()
  switch (t) {
    case 'gold':
      return {
        label: 'Gold',
        icon: 'bi-gem',
        bg: '#FFF7E0',
        fg: '#A67C00',
        ring: '0 0 0 6px rgba(217,164,6,.18)',
      }
    case 'silver':
      return {
        label: 'Silver',
        icon: 'bi-gem',
        bg: '#F4F6F8',
        fg: '#6C757D',
        ring: '0 0 0 6px rgba(108,117,125,.18)',
      }
    case 'diamond':
      return {
        label: 'Diamond',
        icon: 'bi-diamond',
        bg: '#E8F9FF',
        fg: '#0AA2C0',
        ring: '0 0 0 6px rgba(13,202,240,.18)',
      }
    case 'platinum':
      return {
        label: 'Platinum',
        icon: 'bi-gem',
        bg: '#EEF1F8',
        fg: '#6F42C1',
        ring: '0 0 0 6px rgba(111,66,193,.16)',
      }
    case 'regular':
    default:
      return {
        label: 'Regular',
        icon: 'bi-person',
        bg: '#E9ECEF',
        fg: '#6C757D',
        ring: '0 0 0 0 rgba(0,0,0,0)',
      }
  }
})

/** Harden against "Back" to a protected page after logout */
const hardBlockBackToAuthed = () => {
  window.history.replaceState(null, '', window.location.href)
  const handler = () => router.replace({ name: 'login' })
  window.addEventListener('popstate', handler, { once: true })
}

const logout = async () => {
  try {
    await supabase.auth.signOut()
  } catch {}
  currentUser.value = null
  hardBlockBackToAuthed()
  router.replace({ name: 'login' })
  emit('nav')
}

/* ===== load user info & avatar ===== */
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

    // avatar
    try {
      const { data: urow } = await supabase
        .from('users')
        .select('profile_url')
        .eq('id', user.id)
        .single()

      const objectPath = urow?.profile_url as string | null
      if (objectPath) {
        const { data: signed } = await supabase.storage
          .from('user_profile')
          .createSignedUrl(objectPath, 3600)
        if (signed?.signedUrl) {
          avatarUrl.value = `${signed.signedUrl}&cb=${Date.now()}`
        }
      }
    } catch {
      /* ignore */
    }
  }
})

// add after your other refs
const mqLg = window.matchMedia('(min-width: 992px)')
const isLgUp = ref(mqLg.matches)

// keep this listener alive
const onMqChange = (e: MediaQueryListEvent) => {
  isLgUp.value = e.matches
}
onMounted(() => mqLg.addEventListener('change', onMqChange))
onUnmounted(() => mqLg.removeEventListener('change', onMqChange))

// IMPORTANT: "rail" (icon-only) is allowed ONLY on lg+
// On md and below, the sidebar is always expanded inside the drawer
const isRail = computed(() => isLgUp.value && isCollapsed.value)

/* ✅ Added: go to Settings (used by clickable profile blocks) */
function goSettings() {
  try {
    router.push({ name: 'user.settings' })
  } finally {
    closeMenu()
    // if offcanvas is open on mobile, close it as well
    closeOffcanvasIfMobile()
  }
}
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
  padding: 0.5rem 0.75rem;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.12s ease;
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

/* Hide tier icon if collapsed */
.collapsed .tier-icon {
  display: none !important;
}

/* Avatar image fill */
.profile-avatar-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ✅ ADDED: small avatar for rail/collapsed mode */
.rail-avatar {
  width: 44px;
  height: 44px;
  font-weight: 700;
  position: relative;
  overflow: hidden;
}

/* ✅ ADDED: hand cursor for clickable profile blocks */
.cursor-pointer {
  cursor: pointer;
}

/* === Aesthetic upgrades (add-only) === */

/* Aesthetic card feel for the profile block */
.profile-card {
  border-radius: 16px;
  padding: 10px 8px;
  transition: transform .15s ease, box-shadow .2s ease, background .2s ease;
  background:
    radial-gradient(400px 200px at 10% -10%, rgba(67,97,238,.06), transparent 50%),
    radial-gradient(300px 180px at 110% 0%, rgba(124,58,237,.05), transparent 50%);
}
.profile-card:hover,
.profile-card:focus-visible {
  background:
    radial-gradient(420px 220px at 10% -10%, rgba(67,97,238,.08), transparent 55%),
    radial-gradient(320px 200px at 110% 0%, rgba(124,58,237,.07), transparent 55%);
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.06);
  transform: translateY(-1px);
  outline: none;
}

/* Subtle ring around avatar for depth */
.ring-ambient {
  box-shadow:
    0 0 0 2px rgba(255,255,255,1),
    0 6px 16px rgba(67, 97, 238, .18);
}

/* Name & email look like buttons—no underlines */
.name-link,
.email-link {
  cursor: pointer;
  transition: color .15s ease, opacity .15s ease, transform .15s ease;
  text-decoration: none; /* ensure no underline */
}
.profile-card:hover .name-link,
.profile-card:focus-visible .name-link {
  color: #0a58ca; /* slightly deeper primary on hover/focus */
}
.profile-card:hover .email-link,
.profile-card:focus-visible .email-link {
  opacity: .9;
}

/* Rail version: tiny hover lift so it feels tappable */
.profile-card--rail .rail-avatar {
  transition: transform .15s ease, box-shadow .2s ease;
}
.profile-card--rail:hover .rail-avatar,
.profile-card--rail:focus-visible .rail-avatar {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 6px 16px rgba(67, 97, 238, .22);
  outline: none;
}

/* Keyboard focus ring for accessibility (no underline) */
.profile-card:focus-visible,
.profile-card--rail:focus-visible {
  box-shadow:
    0 0 0 3px rgba(67,97,238,.18),
    0 8px 24px rgba(16, 24, 40, 0.06);
}
</style>
