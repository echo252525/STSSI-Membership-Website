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
      <!-- TOP when EXPANDED -->
      <div v-if="!isRail" class="d-flex align-items-center justify-content-between mb-3">
        <!-- 🔸 Skeleton state -->
        <template v-if="isSidebarBooting">
          <div class="d-flex align-items-center gap-2 flex-grow-1">
            <div class="skel-avatar rounded-circle"></div>
            <div class="flex-grow-1">
              <div class="skel-line w-75 mb-1"></div>
              <div class="skel-line w-50 skel-sm"></div>
            </div>
          </div>
          <div class="skel-icon"></div>
        </template>

        <!-- ✅ Original block (unchanged) -->
        <template v-else>
          <div
            class="profile-card cursor-pointer gap-2 d-flex align-items-center"
            :title="displayName"
            role="link"
            tabindex="0"
            @click="goSettings"
            @keydown.enter.prevent="goSettings"
            @keydown.space.prevent="goSettings"
          >
            <div
              class="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary text-white ring-ambient"
              style="width: 36px; height: 36px; font-weight: 700; position: relative; overflow: hidden"
            >
              <img v-if="avatarUrl" :src="avatarUrl" alt="Profile" class="profile-avatar-img" />
              {{ initials }}
            </div>
            <div class="profile-text">
              <div class="fw-semibold small text-truncate text-primary">
                {{ displayName }}
              </div>
              <!-- ✅ Changed: show tier name from membership.tiers (with fallback) -->
              <div class="text-muted small text-truncate">
                {{ displayTierName }} member
              </div>
            </div>
          </div>

          <button
            type="button"
            class="btn btn-outline-secondary btn-sm rounded-circle d-none d-lg-inline-flex"
            @click="toggle()"
            aria-label="Collapse sidebar"
          >
            <i class="bi bi-chevron-double-left"></i>
          </button>
        </template>
      </div>

      <!-- TOP when COLLAPSED -->
      <div v-else class="d-flex align-items-center justify-content-end mb-3">
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm rounded-circle d-none d-lg-inline-flex"
          @click="toggle()"
          aria-label="Expand sidebar"
        >
          <i class="bi bi-chevron-double-right"></i>
        </button>
      </div>

      <!-- Profile (hidden when collapsed) -->
      <div
        class="d-flex align-items-center justify-content-center m-3 my-5 gap-2"
        role="link"
        tabindex="0"
        @click="goAbout"
        @keydown.enter.prevent="goAbout"
        @keydown.space.prevent="goAbout"
        :title="'About Us'"
        style="cursor: pointer"
      >
        <img
          src="/STSSI_logo.png"
          class="m-0"
          style="width: 40px">
        </img>
        <h5 class="fw-bold" v-if="!isRail">STEQ ONLINE</h5>
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

        <!-- Shop -->
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

        <!-- my purchases -->
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

        <!-- mini-games -->
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

        <!-- settings -->
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
import { onMounted, onUnmounted, ref, computed, reactive } from 'vue'
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
const showTier = computed(() => !isRail.value)

/** Dynamic UI metadata for membership tier (legacy fallback) */
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
  ;(currentUser as any).value = null
  hardBlockBackToAuthed()
  router.replace({ name: 'login' })
  emit('nav')
}

/* ===== load user info & avatar ===== */
const userLoaded = ref(false) // 🔸 new: track user block loading

onMounted(async () => {
  try {
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
  } finally {
    userLoaded.value = true // ✅ end skeleton for top row
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

/* ✅ NEW: go to About Us when logo clicked */
/* ✅ NEW: go to About Us (user scope) when logo clicked */
function goAbout() {
  try {
    router.push({ name: 'user.about' }) // <-- now points to /app/about
  } finally {
    closeMenu()
    closeOffcanvasIfMobile()
  }
}


/* --------------------------------------------------------------------
   🔽 ADDED: Use membership.tiers + users.membership_id to get live tier
-------------------------------------------------------------------- */
const users = computed(() => currentUser.value)

/* Types */
type TierKey = 'regular' | 'silver' | 'gold' | 'platinum' | 'diamond'
type Tier = {
  key: TierKey
  name: string
  purchasesRequired: number
  referralsRequired: number
  benefits: string[]
  iconSignedUrl?: string | null
  id?: string
  order?: number
}

/* Fallback tiers (UI never breaks) */
const staticTiers: Tier[] = [
  { key: 'regular', name: 'Regular Member', purchasesRequired: 0, referralsRequired: 0, benefits: ['Free Membership', '₱2,000 discount credits per month', 'Enjoy <strong>5%</strong> discount on all purchases'] },
  { key: 'silver', name: 'Silver Member', purchasesRequired: 10_000, referralsRequired: 10, benefits: ['Made ₱10,000 worth of purchases', '10 Referrals with ₱5,000 purchases', '₱10,000 discount credits per month', 'Enjoy <strong>6%</strong> discount on all purchases'] },
  { key: 'gold', name: 'Gold Member', purchasesRequired: 20_000, referralsRequired: 20, benefits: ['Made ₱20,000 worth of purchases', '20 Referrals with ₱10,000 purchases', '₱20,000 discount credits per month', 'Enjoy <strong>7%</strong> discount on all purchases', 'Free Delivery for Val. Order worth ₱10,000'] },
  { key: 'platinum', name: 'Platinum Member', purchasesRequired: 50_000, referralsRequired: 50, benefits: ['Made ₱50,000 worth of purchases', '50 Referrals with ₱20,000 purchases', '₱50,000 discount credits per month', 'Enjoy <strong>8%</strong> discount on all purchases', 'Free delivery for GMA orders worth ₱10,000'] },
  { key: 'diamond', name: 'Diamond Member', purchasesRequired: 100_000, referralsRequired: 100, benefits: ['Made ₱100,000 worth of purchases', '100 Referrals with ₱50,000 purchases', '₱100,000 discount credits per month', 'Enjoy <strong>10%</strong> discount on all purchases', 'Free delivery for GMA orders worth ₱10,000', 'Exclusive Discount Offers'] },
]

/* Live state */
const tiersLive = ref<Tier[]>(staticTiers)
const currentTier = ref<Tier | null>(staticTiers[0])
const nextTier = ref<Tier | null>(null)
const isLoading = ref(true) // 🔸 your existing tiers loader

const userState = reactive({
  id: '' as string,
  tierKey: 'regular' as TierKey,
  lifetimePurchases: 0,
  referrals: 0,
})

const badgeIcon = computed(() => currentTier.value?.iconSignedUrl || null)

/* NEW: Combined boot flag for the top skeleton */
const isSidebarBooting = computed(() => !userLoaded.value || isLoading.value)

const nameToKey = (name: string): TierKey => {
  const k = (name || '').trim().toLowerCase()
  if (k.includes('silver')) return 'silver'
  if (k.includes('gold')) return 'gold'
  if (k.includes('platinum')) return 'platinum'
  if (k.includes('diamond')) return 'diamond'
  return 'regular'
}

function composeBenefits(row: any): string[] {
  const out: string[] = []
  if (row.discount_credits && Number(row.discount_credits) > 0) {
    out.push(`₱${Number(row.discount_credits).toLocaleString('en-PH')} discount credits per month`)
  }
  if (row.discount_per_purchase && Number(row.discount_per_purchase) > 0) {
    out.push(`Enjoy <strong>${Number(row.discount_per_purchase).toFixed(0)}%</strong> discount on all purchases`)
  }
  if (row.is_free_delivery) {
    if (row.purchase_requirements_for_free_delivery && Number(row.purchase_requirements_for_free_delivery) > 0) {
      out.push(`Free delivery for orders worth ₱${Number(row.purchase_requirements_for_free_delivery).toLocaleString('en-PH')}`)
    } else {
      out.push('Free delivery on eligible orders')
    }
  }
  if (row.referral_count_requirements && Number(row.referral_count_requirements) > 0) {
    out.push(`${row.referral_count_requirements} referral${row.referral_count_requirements > 1 ? 's' : ''} required`)
  }
  return out.length ? out : ['Free Membership']
}

const BUCKET = 'tier_icons'
async function signedUrlOrNull(path: string | null | undefined): Promise<string | null> {
  try {
    const p = (path || '').replace(/^\/+/, '')
    if (!p) return null
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(p, 60 * 60)
    if (error) return null
    return data?.signedUrl || null
  } catch {
    return null
  }
}

/* Loaders */
async function loadLiveTiers() {
  const { data, error } = await supabase
    .schema('membership')
    .from('tiers')
    .select(
      'id, membership_name, membership_tier_order, purchases_count, referral_count_requirements, discount_credits, discount_per_purchase, is_free_delivery, purchase_requirements_for_free_delivery, icon_url'
    )
    .order('membership_tier_order', { ascending: true })

  if (error || !data) return

  const mapped: Tier[] = []
  for (const row of data) {
    const key = nameToKey(row.membership_name)
    const iconSignedUrl = await signedUrlOrNull(row.icon_url)
    mapped.push({
      id: row.id,
      key,
      name: row.membership_name,
      order: row.membership_tier_order,
      purchasesRequired: Number(row.purchases_count || 0),
      referralsRequired: Number(row.referral_count_requirements || 0),
      benefits: composeBenefits(row),
      iconSignedUrl,
    })
  }
  if (mapped.length) tiersLive.value = mapped
}

async function loadUserAndMembership() {
  let uid: string | null = null
  if (!users.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return router.push({ name: 'login' })
    uid = data.user.id
  } else {
    uid = (users.value as any).id
  }

  userState.id = uid!

  const { data: userRow } = await supabase
    .from('users')
    .select('id, membership_id, purchases_per_month')
    .eq('id', uid)
    .maybeSingle()

  const { data: refRow } = await supabase
    .from('referral_stats')
    .select('referrals_count')
    .eq('referrer_id', uid)
    .maybeSingle()

  userState.referrals = Number(refRow?.referrals_count || 0)
  userState.lifetimePurchases = Number(userRow?.purchases_per_month || 0)

  let tier: Tier | undefined
  if (userRow?.membership_id) {
    tier = tiersLive.value.find((t) => t.id === userRow.membership_id)
  }

  currentTier.value = tier || tiersLive.value[0] || staticTiers[0]

  if (currentTier.value) {
    const ordered = [...tiersLive.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const idx = ordered.findIndex((t) => t.id === currentTier.value!.id)
    nextTier.value = idx >= 0 ? ordered[idx + 1] || null : null
  } else {
    nextTier.value = null
  }

  userState.tierKey = (currentTier.value?.key || 'regular') as TierKey
}

async function loadAll() {
  await loadLiveTiers()
  await loadUserAndMembership()
  isLoading.value = false
}

/* Kick off live tier load */
onMounted(async () => {
  await loadAll()
})

/* Expose a safe display name for the tier line */
const displayTierName = computed(() => currentTier.value?.name || membershipMeta.value.label)
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
.profile-card {
  border-radius: 16px;
  transition: transform .15s ease, box-shadow .2s ease, background .2s ease;
}

/* Subtle ring around avatar for depth */
.ring-ambient {
  box-shadow:
    0 0 0 2px rgba(255,255,255,1),
    0 6px 16px rgba(67, 97, 238, .18);
}

.name-link,
.email-link {
  cursor: pointer;
  transition: color .15s ease, opacity .15s ease, transform .15s ease;
  text-decoration: none;
}
.profile-card:hover .name-link,
.profile-card:focus-visible .name-link {
  color: #0a58ca;
}
.profile-card:hover .email-link,
.profile-card:focus-visible .email-link {
  opacity: .9;
}

.profile-card--rail .rail-avatar {
  transition: transform .15s ease, box-shadow .2s ease;
}
.profile-card--rail:hover .rail-avatar,
.profile-card--rail:focus-visible .rail-avatar {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 6px 16px rgba(67, 97, 238, .22);
  outline: none;
}

.profile-card:focus-visible,
.profile-card--rail:focus-visible {
  box-shadow:
    0 0 0 3px rgba(67,97,238,.18),
    0 8px 24px rgba(16, 24, 40, 0.06);
}

/* ─────────────────────────────── */
/* 🔸 Skeleton styles (added)      */
/* ─────────────────────────────── */
@keyframes skel-shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
.skel {
  animation: skel-shimmer 1.2s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    #e9ecef 25%,
    #f8f9fa 37%,
    #e9ecef 63%
  );
  background-size: 200px 100%;
}
.skel-line {
  height: 12px;
  border-radius: 6px;
  width: 100%;
}
.skel-sm { height: 10px; }
.skel-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}
.skel-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}
.skel-line,
.skel-avatar,
.skel-icon {
  /* apply shimmer */
  animation: skel-shimmer 1.2s ease-in-out infinite;
  background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 37%, #e9ecef 63%);
  background-size: 200px 100%;
}
</style>
