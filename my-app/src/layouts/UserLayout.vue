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
          <button
            type="button"
            class="btn btn-outline-secondary d-flex align-items-center gap-2"
            @click="openMenu"
          >
            <i class="bi bi-list fs-5"></i><span>Menu</span>
          </button>
          <span class="navbar-brand ms-auto">Member Area</span>
        </div>
      </nav>

      <div class="container-fluid pt-3">
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
            <button
              type="button"
              class="btn btn-light btn-sm"
              @click="closeMenu"
              aria-label="Close menu"
            >
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

      <span
        v-if="notifCount > 0"
        class="notif-badge"
        aria-live="polite"
        :title="`${displayNotifCount} new notifications`"
        >{{ displayNotifCount }}</span
      >
    </button>

    <!-- Quick Tour per nav/page -->
    <div
      v-if="isRouteTourVisible && currentRouteTour"
      class="qt-backdrop"
      role="dialog"
      aria-modal="true"
      :aria-label="currentRouteTour.title"
      @click.self="dismissRouteTour"
    >
      <div class="qt-card shadow-lg border-0 rounded-4">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="small text-uppercase text-muted fw-semibold mb-1">Quick tour</div>
            <h2 class="h6 m-0">{{ currentRouteTour.title }}</h2>
          </div>
          <button
            type="button"
            class="btn btn-light btn-sm"
            aria-label="Close quick tour"
            @click="dismissRouteTour"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <p class="small mb-3">
          {{ currentRouteTour.body }}
        </p>
        <div class="d-flex justify-content-end gap-1">
          <button type="button" class="btn btn-primary btn-sm" @click="dismissRouteTour">
            Got it
          </button>
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            @click="router.push('minigames/tutorial')"
          >
            How to Play
          </button>
        </div>
      </div>
    </div>
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
            <button
              type="button"
              class="btn btn-light btn-sm"
              aria-label="Close notifications"
              @click="closeNotifModal"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="notif-body">
            <Suspense>
              <template #default>
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

  <!-- 🆕 Tier-change modal (LANDSCAPE with big hero; “View benefits” button removed) -->
  <teleport to="body">
    <div
      v-if="isTierModalOpen"
      class="tier-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Membership update"
      @click.self="closeTierModal"
    >
      <transition name="tier-zoom">
        <div class="tier-modal tier-modal-landscape" v-show="isTierModalOpen">
          <!-- Keep your original small header bar (not removed) -->
          <div class="d-flex align-items-center justify-content-between border-bottom px-3 py-2">
            <div class="fw-semibold d-flex align-items-center gap-2">
              <i class="bi bi-stars"></i>
              Membership Update
            </div>
            <button
              type="button"
              class="btn btn-light btn-sm"
              aria-label="Close membership update"
              @click="closeTierModal"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Landscape two-column layout -->
          <div class="tier-content-grid">
            <!-- LEFT: Big hero section -->
            <section
              class="tier-hero-big d-flex flex-column"
              :class="['status-' + (tierChange?.status || 'stayed')]"
            >
              <div class="hero-top d-flex align-items-center gap-3">
                <div class="hero-icon-wrap">
                  <img
                    v-if="tierChange?.neu?.icon_signed_url || tierChange?.neu?.icon_url"
                    :src="
                      tierChange?.neu?.icon_signed_url ?? tierChange?.neu?.icon_url ?? undefined
                    "
                    :alt="(tierChange?.neu?.membership_name || 'Tier') + ' icon'"
                  />
                  <div v-else class="icon-fallback"><i class="bi bi-person-badge"></i></div>
                </div>
                <div>
                  <div class="eyebrow">
                    <span v-if="tierChange?.status === 'promoted'">🎉 Promotion</span>
                    <span v-else-if="tierChange?.status === 'demoted'">🌱 Reset</span>
                    <span v-else>✅ Maintained</span>
                  </div>
                  <h2 class="hero-title display-6 m-0">
                    {{ heroCopy.title }}
                  </h2>
                  <p class="hero-sub lead m-0">
                    {{ heroCopy.subtitle }}
                  </p>
                </div>
              </div>

              <!-- Quick chips for headline perks -->
              <div v-if="heroChips.length" class="hero-chips mt-3">
                <span class="chip" v-for="(c, i) in heroChips" :key="i">{{ c }}</span>
              </div>

              <!-- Large tier name banner -->
              <div class="tier-banner mt-auto">
                <div class="label">Current Tier</div>
                <div class="name">
                  {{ tierChange?.neu?.membership_name || '—' }}
                </div>
              </div>
            </section>

            <!-- RIGHT: Details -->
            <section class="tier-details p-3">
              <div v-if="tierHeadline" class="h6 mb-3">{{ tierHeadline }}</div>

              <!-- Previous → Current small summary -->
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="flex-grow-1">
                  <div class="small text-muted mb-1">Previous tier</div>
                  <div class="d-flex align-items-center gap-2">
                    <img
                      v-if="tierChange?.old?.icon_signed_url || tierChange?.old?.icon_url"
                      :src="
                        tierChange?.old?.icon_signed_url ?? tierChange?.old?.icon_url ?? undefined
                      "
                      :alt="(tierChange?.old?.membership_name || '') + ' icon'"
                      class="rounded"
                      style="width: 28px; height: 28px; object-fit: cover"
                    />
                    <span class="fw-semibold">{{ tierChange?.old?.membership_name || '—' }}</span>
                  </div>
                </div>
                <i class="bi bi-arrow-right fs-5 opacity-75"></i>
                <div class="flex-grow-1">
                  <div class="small text-muted mb-1">Current tier</div>
                  <div class="d-flex align-items-center gap-2">
                    <img
                      v-if="tierChange?.neu?.icon_signed_url || tierChange?.neu?.icon_url"
                      :src="
                        tierChange?.neu?.icon_signed_url ?? tierChange?.neu?.icon_url ?? undefined
                      "
                      :alt="(tierChange?.neu?.membership_name || '') + ' icon'"
                      class="rounded"
                      style="width: 28px; height: 28px; object-fit: cover"
                    />
                    <span class="fw-semibold">{{ tierChange?.neu?.membership_name || '—' }}</span>
                  </div>
                </div>
              </div>

              <!-- What changed -->
              <div v-if="tierDiffs.length" class="diff-block mb-3">
                <div class="small text-muted mb-2">What changed</div>
                <ul class="diff-list">
                  <li v-for="d in tierDiffs" :key="d.label">
                    <div class="label">{{ d.label }}</div>
                    <div class="vals">
                      <span class="before">{{ d.before }}</span>
                      <i class="bi bi-arrow-right-short"></i>
                      <span class="after">{{ d.after }}</span>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Benefits -->
              <div class="benefit-block">
                <div class="small text-muted mb-2">Your current benefits</div>
                <ul class="benefit-list">
                  <li v-for="(b, i) in tierBenefits.neu" :key="'new-' + i">
                    <i class="bi bi-check2-circle"></i>
                    <span v-html="b"></span>
                  </li>
                </ul>
              </div>

              <!-- Status alert -->
              <div
                class="alert mt-3"
                :class="{
                  'alert-success': tierChange?.status === 'promoted',
                  'alert-secondary': tierChange?.status === 'stayed',
                  'alert-warning': tierChange?.status === 'demoted',
                }"
                role="status"
              >
                <template v-if="tierChange?.status === 'promoted'">
                  🎉 Great job! You’ve moved up a tier.
                </template>
                <template v-else-if="tierChange?.status === 'stayed'">
                  ✅ You’re holding steady. Keep it up!
                </template>
                <template v-else-if="tierChange?.status === 'demoted'">
                  ⚠️ It’s okay — you can climb back next month. We believe in you!
                </template>
              </div>
            </section>
          </div>

          <!-- Footer: only OK (removed View benefits) -->
          <div class="border-top px-3 py-2 d-flex justify-content-end gap-2">
            <button class="btn btn-primary btn-sm" @click="closeTierModal">OK</button>
          </div>
        </div>
      </transition>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, defineAsyncComponent, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UserSidebar from '@/components/nav/UserSidebar.vue'
import { supabase } from '@/lib/supabaseClient'

/* 🔹 Notifications component */
const Notifications = defineAsyncComponent(() => import('../pages/user/Notifications.vue'))

const isDesktop = ref(window.matchMedia('(min-width: 992px)').matches)
const isMenuOpen = ref(false)
const router = useRouter()
const route = useRoute()
let removeHook: null | (() => void) = null

const mq = window.matchMedia('(min-width: 992px)')
const onMQChange = (e: MediaQueryListEvent) => {
  isDesktop.value = e.matches
  if (e.matches) isMenuOpen.value = false
}
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isMenuOpen.value = false
    isNotifModalOpen.value = false
    isTierModalOpen.value = false
    isRouteTourVisible.value = false
  }
}
const openMenu = () => {
  isMenuOpen.value = true
}
const closeMenu = () => {
  isMenuOpen.value = false
}

onMounted(() => {
  mq.addEventListener('change', onMQChange)
  window.addEventListener('keydown', onKey)
  removeHook = router.afterEach(() => {
    isMenuOpen.value = false
  })
})
onBeforeUnmount(() => {
  mq.removeEventListener('change', onMQChange)
  window.removeEventListener('keydown', onKey)
  removeHook?.()
})

/* 👉 Lock scroll when drawers/modals are open */
const isNotifModalOpen = ref(false)
watch([isMenuOpen, isNotifModalOpen], ([menuOpen, modalOpen]) => {
  const lock = menuOpen || modalOpen
  document.body.style.overflow = lock ? 'hidden' : ''
})

const isTierModalOpen = ref(false)
watch(isTierModalOpen, (tierOpen) => {
  const lock = tierOpen || isMenuOpen.value || isNotifModalOpen.value
  document.body.style.overflow = lock ? 'hidden' : ''
})

/* ✅ Scroll-direction reveal */
const isNotifVisible = ref(true)
let lastScrollY = window.scrollY
let lastToggleTs = 0
const onScroll = () => {
  const now = performance.now()
  if (now - lastToggleTs < 80) return
  const current = window.scrollY
  const delta = current - lastScrollY
  if (Math.abs(delta) > 6) {
    isNotifVisible.value = delta < 0
    lastScrollY = current
    lastToggleTs = now
  }
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('notif:count', onNotifCountEvent as EventListener)
  try {
    const raw = localStorage.getItem(NOTIF_COUNT_KEY)
    if (raw) {
      const n = Number(raw)
      if (!Number.isNaN(n) && n >= 0) notifCount.value = n
    }
  } catch {}
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('notif:count', onNotifCountEvent as EventListener)
})

/* 🔔 Notifications modal */
const openNotifModal = () => {
  if (!isDesktop.value) isMenuOpen.value = false
  isNotifModalOpen.value = true
}
const closeNotifModal = () => {
  isNotifModalOpen.value = false
}
const NOTIF_COUNT_KEY = 'notif:lastCount'
const notifCount = ref<number>(0)
const displayNotifCount = computed(() => (notifCount.value > 99 ? '99+' : String(notifCount.value)))
watch(notifCount, (n) => {
  try {
    localStorage.setItem(NOTIF_COUNT_KEY, String(n))
  } catch {}
})
const onNotifCount = (n: number) => {
  if (typeof n === 'number' && n >= 0) notifCount.value = n
}
const onNotifCountEvent = (e: CustomEvent<number> | Event) => {
  const evt = e as CustomEvent<number>
  const n = Number(evt.detail)
  if (!Number.isNaN(n) && n >= 0) notifCount.value = n
}

/* ──────────────────────────────────────────────────────────────
   Realtime FAB count (Supabase → ewallet.transactions)
   ────────────────────────────────────────────────────────────── */
const userId = ref<string | null>(null)
let rtNotifChannel: ReturnType<typeof supabase.channel> | null = null

const seenIds = ref<Set<string>>(new Set())
const storageKey = () => (userId.value ? `notif:seen:${userId.value}` : 'notif:seen')
function loadSeen() {
  try {
    const raw = localStorage.getItem(storageKey())
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) seenIds.value = new Set(arr as string[])
    }
  } catch {}
}
const isSeenId = (id: string) => seenIds.value.has(id)

async function primeCountFromTransactions() {
  if (!userId.value) return
  try {
    const { data, error } = await supabase
      .schema('ewallet')
      .from('transactions')
      .select('id')
      .eq('user_id', userId.value)
      .order('updated_at', { ascending: false })
      .limit(50)
    if (!error && Array.isArray(data)) {
      const unseen = (data as { id: string }[]).filter((r) => !isSeenId(r.id)).length
      if (unseen > notifCount.value) notifCount.value = unseen
    }
  } catch {}
}

function bindNotifRealtime() {
  if (rtNotifChannel || !userId.value) return
  rtNotifChannel = supabase
    .channel('rt-ewallet-transactions-fab-' + userId.value)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'ewallet',
        table: 'transactions',
        filter: `user_id=eq.${userId.value}`,
      },
      (payload) => {
        const tx = payload.new as { id: string; user_id: string }
        if (!isSeenId(tx.id)) {
          notifCount.value = Math.max(0, (notifCount.value || 0) + 1)
          try {
            window.dispatchEvent(new CustomEvent('notif:count', { detail: notifCount.value }))
          } catch {}
        }
      },
    )
    .subscribe()
}

onMounted(async () => {
  try {
    const { data: auth } = await supabase.auth.getUser()
    userId.value = auth?.user?.id ?? null
  } catch {}
  loadSeen()
  await primeCountFromTransactions()
  bindNotifRealtime()
  await checkTierChangeAndShow()
  // 🔰 First-time quick tour for current route
  maybeShowRouteTour(route.name)
})
onBeforeUnmount(() => {
  if (rtNotifChannel) supabase.removeChannel(rtNotifChannel)
})

/* ──────────────────────────────────────────────────────────────
   🆕 Quick Tour per nav / page
   ────────────────────────────────────────────────────────────── */
type RouteTourCopy = {
  title: string
  body: string
}

const ROUTE_TOUR_VERSION = 'v1'

// Map your route names → copy
const ROUTE_TOUR_COPY: Record<string, RouteTourCopy> = {
  // Dashboard
  'user.dashboard': {
    title: 'Dashboard Overview',
    body: 'See your membership tier, wallet balances, and quick shortcuts to everything you use most.',
  },
  // Membership
  'user.membership': {
    title: 'Membership & Perks',
    body: 'Check your current tier, see how close you are to the next level, and review all the perks you unlock.',
  },
  // Deals & Rewards
  'user.deals': {
    title: 'Deals & Rewards',
    body: 'Grab active promos, member-only discounts, and limited-time offers before they expire.',
  },
  // Shop
  'user.shop': {
    title: 'Shop Our Products',
    body: 'Browse products, apply your member perks, and checkout using your preferred payment methods.',
  },
  // Purchases
  'user.purchases': {
    title: 'Purchase History',
    body: 'Review all your orders, open receipts, and track delivery or support updates in one place.',
  },
  // 🆕 My Purchases alias
  'user.mypurchases': {
    title: 'Purchase History',
    body: 'Review all your orders, open receipts, and track delivery or support updates in one place.',
  },
  // E-wallet
  'user.ewallet': {
    title: 'E-Wallet & Credits',
    body: 'Check your wallet balance, discount credits, and recent activity so you always know what you can spend.',
  },
  // Settings
  'user.settings': {
    title: 'Account Settings',
    body: 'Update your profile, manage login details, and control the personal information linked to your account.',
  },
  // Mini Games
  'user.minigames': {
    title: 'Mini Games & Events',
    body: 'Join events, spin the wheel, and earn extra bonuses you can use on your next purchases.',
  },
}

const isRouteTourVisible = ref(false)

const currentRouteTour = computed<RouteTourCopy | null>(() => {
  const name = route.name
  if (typeof name !== 'string') return null
  return ROUTE_TOUR_COPY[name] ?? null
})

const routeTourKey = (name: string) => `qt:${ROUTE_TOUR_VERSION}:${name}`

function maybeShowRouteTour(name: typeof route.name) {
  if (typeof name !== 'string') return
  const copy = ROUTE_TOUR_COPY[name]
  if (!copy) return
  try {
    const key = routeTourKey(name)
    const seen = localStorage.getItem(key)
    if (seen === '1') return
    isRouteTourVisible.value = true
  } catch {
    // if localStorage fails, still show tour (no persistence)
    isRouteTourVisible.value = true
  }
}

function dismissRouteTour() {
  const name = route.name
  if (typeof name === 'string') {
    try {
      localStorage.setItem(routeTourKey(name), '1')
    } catch {}
  }
  isRouteTourVisible.value = false
}

// React when navigating between nav pages
watch(
  () => route.name,
  (name) => {
    isRouteTourVisible.value = false
    maybeShowRouteTour(name)
  },
)
/* ──────────────────────────────────────────────────────────────
   🆕 Tier change logic + big hero; landscape layout
   ────────────────────────────────────────────────────────────── */
type TierRow = {
  id: string
  membership_name: string
  membership_tier_order: number
  icon_url: string | null
  discount_credits?: number | null
  discount_per_purchase?: number | null
  is_free_delivery?: boolean | null
  purchase_requirements_for_free_delivery?: number | null
  referral_count_requirements?: number | null
  purchases_count?: number | null
  icon_signed_url?: string | null
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

const tierChange = ref<{
  old?: TierRow
  neu?: TierRow
  status?: 'promoted' | 'demoted' | 'stayed'
} | null>(null)

const tierHeadline = computed(() => {
  const s = tierChange.value?.status
  const newName = tierChange.value?.neu?.membership_name
  const oldName = tierChange.value?.old?.membership_name
  if (!s || !newName) return ''
  if (s === 'promoted') return `Congrats! You’ve been promoted to ${newName}.`
  if (s === 'stayed') return `You stayed in ${newName}.`
  return `Your tier changed from ${oldName || 'previous'} to ${newName}.`
})

const formatPeso = (n: number) =>
  `₱${Number(n || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`

function composeBenefits(row: Partial<TierRow> | undefined): string[] {
  if (!row) return ['Free Membership']
  const out: string[] = []
  if (row.discount_credits && Number(row.discount_credits) > 0) {
    out.push(`${formatPeso(Number(row.discount_credits))} discount credits per month`)
  }
  if (row.discount_per_purchase && Number(row.discount_per_purchase) > 0) {
    out.push(
      `Enjoy <strong>${Number(row.discount_per_purchase).toFixed(0)}%</strong> discount on all purchases`,
    )
  }
  if (row.is_free_delivery) {
    if (
      row.purchase_requirements_for_free_delivery &&
      Number(row.purchase_requirements_for_free_delivery) > 0
    ) {
      out.push(
        `Free delivery for orders from ${formatPeso(Number(row.purchase_requirements_for_free_delivery))}`,
      )
    } else {
      out.push('Free delivery on eligible orders')
    }
  }
  if (row.referral_count_requirements && Number(row.referral_count_requirements) > 0) {
    const r = Number(row.referral_count_requirements)
    out.push(`${r} referral${r > 1 ? 's' : ''} required`)
  }
  return out.length ? out : ['Free Membership']
}

const tierBenefits = computed(() => ({
  old: composeBenefits(tierChange.value?.old),
  neu: composeBenefits(tierChange.value?.neu),
}))

const tierDiffs = computed(() => {
  const old = tierChange.value?.old
  const neu = tierChange.value?.neu
  const diffs: Array<{ label: string; before: string; after: string }> = []
  if (!old || !neu) return diffs

  const oPct = Number(old.discount_per_purchase || 0)
  const nPct = Number(neu.discount_per_purchase || 0)
  if (oPct !== nPct)
    diffs.push({
      label: 'Per-purchase discount',
      before: `${oPct.toFixed(0)}%`,
      after: `${nPct.toFixed(0)}%`,
    })

  const oCred = Number(old.discount_credits || 0)
  const nCred = Number(neu.discount_credits || 0)
  if (oCred !== nCred)
    diffs.push({
      label: 'Monthly discount credits',
      before: formatPeso(oCred),
      after: formatPeso(nCred),
    })

  const oFree = !!old.is_free_delivery
  const nFree = !!neu.is_free_delivery
  const oThr = Number(old.purchase_requirements_for_free_delivery || 0)
  const nThr = Number(neu.purchase_requirements_for_free_delivery || 0)
  if (oFree !== nFree || oThr !== nThr) {
    const before = oFree ? (oThr > 0 ? `Yes — from ${formatPeso(oThr)}` : 'Yes') : 'No'
    const after = nFree ? (nThr > 0 ? `Yes — from ${formatPeso(nThr)}` : 'Yes') : 'No'
    diffs.push({ label: 'Free delivery', before, after })
  }
  return diffs
})

const heroCopy = computed(() => {
  const status = tierChange.value?.status
  const newName = tierChange.value?.neu?.membership_name || 'your tier'
  if (status === 'promoted') {
    return {
      title: 'Congratulations!',
      subtitle: `You’ve been promoted to ${newName}. Enjoy your upgraded perks.`,
    }
  }
  if (status === 'demoted') {
    return {
      title: 'You’re reset to a lower tier',
      subtitle: `You’re now in ${newName}. It’s okay — you can climb back up this month.`,
    }
  }
  return {
    title: 'Nice work!',
    subtitle: `You maintained your ${newName} status. Aim for a promotion next month!`,
  }
})

/* Chips for hero quick glance */
const heroChips = computed(() => {
  const neu = tierChange.value?.neu
  const chips: string[] = []
  if (!neu) return chips
  const pct = Number(neu.discount_per_purchase || 0)
  const cred = Number(neu.discount_credits || 0)
  if (pct > 0) chips.push(`${pct.toFixed(0)}% off`)
  if (cred > 0) chips.push(`${formatPeso(cred)} credits/mo`)
  if (neu.is_free_delivery) chips.push('Free delivery')
  return chips.slice(0, 3)
})

async function markTierShown() {
  if (!userId.value) return
  try {
    await supabase.from('users').update({ isdisplaytiershowed: true }).eq('id', userId.value)
  } catch {}
}

async function checkTierChangeAndShow() {
  if (!userId.value) return
  try {
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('membership_id, isdisplaytiershowed, "lastMembership_id"')
      .eq('id', userId.value)
      .maybeSingle()
    if (userErr || !userRow) return

    const currentId = (userRow as any)['membership_id'] as string | null
    const lastId = (userRow as any)['lastMembership_id'] as string | null
    const alreadyShown = (userRow as any)['isdisplaytiershowed'] as boolean
    if (!lastId || !currentId || alreadyShown) return

    const { data: tiers, error: tiersErr } = await supabase
      .schema('membership')
      .from('tiers')
      .select(
        `
        id,
        membership_name,
        membership_tier_order,
        icon_url,
        discount_credits,
        discount_per_purchase,
        is_free_delivery,
        purchase_requirements_for_free_delivery,
        referral_count_requirements,
        purchases_count
      `,
      )
      .in('id', [lastId, currentId])

    if (tiersErr || !tiers || tiers.length === 0) {
      tierChange.value = { status: currentId === lastId ? 'stayed' : 'promoted' }
      isTierModalOpen.value = true
      await markTierShown()
      return
    }

    const oldTier = tiers.find((t) => t.id === lastId) as TierRow | undefined
    const newTier = tiers.find((t) => t.id === currentId) as TierRow | undefined
    if (oldTier) oldTier.icon_signed_url = await signedUrlOrNull(oldTier.icon_url)
    if (newTier) newTier.icon_signed_url = await signedUrlOrNull(newTier.icon_url)

    let status: 'promoted' | 'demoted' | 'stayed' = 'stayed'
    if (oldTier && newTier) {
      if (oldTier.id === newTier.id) status = 'stayed'
      else if ((newTier.membership_tier_order ?? 0) > (oldTier.membership_tier_order ?? 0))
        status = 'promoted'
      else status = 'demoted'
    }

    tierChange.value = { old: oldTier, neu: newTier, status }
    isTierModalOpen.value = true
    await markTierShown()
  } catch {
    /* swallow */
  }
}

function closeTierModal() {
  isTierModalOpen.value = false
}
</script>

<style scoped>
/* Desktop offset (collapsed rail width = 84px) */
.main-content {
  padding-left: 84px;
  min-height: 100vh;
}
@media (max-width: 991.98px) {
  .main-content {
    padding-left: 0;
  }
}

/* Fixed desktop shell */
.sidebar-shell {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: auto;
  z-index: 1040;
  background: #fff;
  border-right: 1px solid rgba(0, 0, 0, 0.125);
}

/* Page fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile overlay */
.mobile-drawer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 1080;
  display: flex;
}

/* Sliding panel */
.drawer-panel {
  width: 320px;
  max-width: 88%;
  height: 100%;
  background: #fff;
  border-right: 1px solid rgba(0, 0, 0, 0.125);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}
.drawer-content {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.drawer-enter-active,
.drawer-leave-active {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Make sidebar behave normally inside drawer */
.drawer-panel :deep(.sidebar) {
  position: relative !important;
  top: auto !important;
  left: auto !important;
  height: 100% !important;
  width: 100% !important;
  max-width: none !important;
  border-right: 0 !important;
  box-shadow: none !important;
}
.drawer-panel :deep(.sidebar .sidebar-inner) {
  width: 100% !important;
}
.drawer-panel :deep(.sidebar nav),
.drawer-panel :deep(.sidebar .nav),
.drawer-panel :deep(.sidebar .navbar-nav),
.drawer-panel :deep(.sidebar .collapse) {
  display: block !important;
  visibility: visible !important;
  height: auto !important;
  opacity: 1 !important;
}
.drawer-panel :deep(.sidebar.collapsed) {
  width: 100% !important;
}
.drawer-panel :deep(.sidebar.collapsed .nav-link .label),
.drawer-panel :deep(.sidebar.collapsed .tier-label) {
  display: inline !important;
  opacity: 1 !important;
}
.drawer-panel :deep(.toggle-btn) {
  display: none !important;
}
@media (max-width: 991.98px) {
  .drawer-panel :deep(.sidebar) {
    display: block !important;
  }
}

/* ✅ Floating notification button */
.notify-fab {
  position: fixed;
  right: 16px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  z-index: 1090;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
  will-change: transform, opacity;
}
.notify-hidden {
  transform: translateX(140%);
  opacity: 0.35;
  pointer-events: none;
}
@media (hover: hover) {
  .notify-fab:hover {
    transform: translateY(-2px);
  }
  .notify-hidden:hover {
    transform: translateX(140%);
  }
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
  animation: badge-pop 0.2s ease-out;
}
@keyframes badge-pop {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.notify-hidden .notif-badge {
  opacity: 0;
}

/* 🔔 Notifications modal */
.notif-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 1100;
  display: grid;
  place-items: center;
  padding: 12px;
  /* subtle fade-in on mount */
  animation: backdrop-fade 180ms ease-out both;
}
@keyframes backdrop-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.notif-modal {
  position: fixed;
  right: 16px;
  bottom: calc(24px + 56px + 12px);
  width: 420px;
  max-width: min(92vw, 420px);
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.25);
  overflow: hidden;
  z-index: 1101;
  transform-origin: bottom right;
  will-change: transform, opacity, filter;
}
/* ✨ Upgraded modal motion */
.notif-zoom-enter-active,
.notif-zoom-leave-active {
  transition:
    transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.notif-zoom-enter-from {
  transform: translateY(10px) scale(0.96) rotate(0.001deg);
  opacity: 0;
  filter: blur(2px) saturate(0.9);
}
.notif-zoom-leave-to {
  transform: translateY(8px) scale(0.98);
  opacity: 0;
  filter: blur(2px) saturate(0.9);
}
.notif-body {
  max-height: min(70vh, 540px);
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

/* 🔰 Quick Tour per nav */
.qt-backdrop {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1120;
}
.qt-card {
  pointer-events: auto;
  position: fixed;
  right: 16px;
  bottom: calc(24px + 56px + 12px);
  max-width: min(360px, 92vw);
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 12px 14px;
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.25);
  animation: qt-slide-in 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
@keyframes qt-slide-in {
  from {
    transform: translateY(8px);
    opacity: 0;
    filter: blur(2px);
  }
  to {
    transform: translateY(0);
    opacity: 1;
    filter: none;
  }
}
@media (max-width: 575.98px) {
  .qt-card {
    left: 12px;
    right: 12px;
    bottom: 16px;
  }
}

/* ——————————————————————————————— */
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

/* 🆕 Tier modal base */
.tier-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 1110;
  display: grid;
  place-items: center;
  padding: 12px;
  animation: backdrop-fade 190ms ease-out both;
}
.tier-modal {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.25);
  overflow: hidden;
  will-change: transform, opacity, filter;
}

/* 🆕 LANDSCAPE sizing */
.tier-modal-landscape {
  width: 960px;
  max-width: min(96vw, 960px);
}
@media (max-width: 767.98px) {
  .tier-modal-landscape {
    width: 100%;
    max-width: 96vw;
  }
}

/* 🆕 Landscape grid */
.tier-content-grid {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  min-height: 320px;
}
@media (max-width: 767.98px) {
  .tier-content-grid {
    grid-template-columns: 1fr;
  }
}

/* 🆕 Big hero (left) */
.tier-hero-big {
  padding: 18px;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  display: flex;
  min-height: 100%;
}
.tier-hero-big.status-promoted {
  background: linear-gradient(135deg, #e6f7ee, #ffffff);
}
.tier-hero-big.status-demoted {
  background: linear-gradient(135deg, #fff3e6, #ffffff);
}
.tier-hero-big.status-stayed {
  background: linear-gradient(135deg, #eef2ff, #ffffff);
}

.hero-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  /* subtle pop on open */
  animation: rise-in 380ms cubic-bezier(0.2, 0.8, 0.2, 1) both 80ms;
}
.hero-icon-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.icon-fallback {
  font-size: 28px;
  color: #0d6efd;
}

.eyebrow {
  font-size: 12px;
  color: #6c757d;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.hero-title {
  font-weight: 800;
  animation: fade-slide-up 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both 100ms;
}
.hero-sub {
  color: #495057;
  animation: fade-slide-up 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both 160ms;
}

.hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);
  /* cascade-in effect */
  animation: chip-pop 260ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.chip:nth-child(1) {
  animation-delay: 120ms;
}
.chip:nth-child(2) {
  animation-delay: 170ms;
}
.chip:nth-child(3) {
  animation-delay: 220ms;
}

.tier-banner {
  margin-top: 18px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  animation: fade-slide-up 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both 220ms;
}
.tier-banner .label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.tier-banner .name {
  font-size: 20px;
  font-weight: 700;
}

/* 🆕 Details (right) */
.tier-details {
  background: #fff;
}
.diff-block {
  background: #fafbfc;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 10px 12px;
}
.diff-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}
.diff-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  /* stagger diff rows slightly */
  animation: fade-slide-up 360ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.diff-list li:nth-child(1) {
  animation-delay: 80ms;
}
.diff-list li:nth-child(2) {
  animation-delay: 120ms;
}
.diff-list li:nth-child(3) {
  animation-delay: 160ms;
}
.diff-list .label {
  font-weight: 600;
  font-size: 13px;
  color: #212529;
}
.diff-list .vals {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: #495057;
}
.diff-list .before {
  opacity: 0.8;
  text-decoration: line-through;
}
.diff-list .after {
  font-weight: 600;
}

.benefit-block {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 10px 12px;
}
.benefit-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}
.benefit-list li {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 8px;
  align-items: start;
  font-size: 14px;
  color: #212529;
}
.benefit-list i {
  font-size: 16px;
  line-height: 18px;
  color: #198754;
}

/* ✨ Upgraded tier modal motion */
.tier-zoom-enter-active,
.tier-zoom-leave-active {
  transition:
    transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 300ms cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.tier-zoom-enter-from {
  transform: translateY(12px) scale(0.965) rotate(0.001deg);
  opacity: 0;
  filter: blur(3px) saturate(0.92);
}
.tier-zoom-leave-to {
  transform: translateY(8px) scale(0.98);
  opacity: 0;
  filter: blur(3px) saturate(0.92);
}

/* Keyframes for subtle elements */
@keyframes rise-in {
  from {
    transform: translateY(6px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
@keyframes fade-slide-up {
  from {
    transform: translateY(8px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes chip-pop {
  from {
    transform: translateY(6px) scale(0.96);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Respect reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .notif-zoom-enter-active,
  .notif-zoom-leave-active,
  .tier-zoom-enter-active,
  .tier-zoom-leave-active {
    transition: none;
  }
  .notif-zoom-enter-from,
  .notif-zoom-leave-to,
  .tier-zoom-enter-from,
  .tier-zoom-leave-to,
  .hero-icon-wrap,
  .hero-title,
  .hero-sub,
  .chip,
  .tier-banner,
  .diff-list li,
  .notif-backdrop,
  .tier-backdrop,
  .qt-card {
    animation: none !important;
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}
</style>

<!-- 🌿 Global minimalist scrollbar (no layout changes) -->
<style>
html {
  scrollbar-gutter: stable;
}
:root {
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
* {
  scrollbar-width: auto;
  scrollbar-color: var(--sb-thumb) var(--sb-track);
}
*::-webkit-scrollbar {
  background: var(--sb-track);
}
*::-webkit-scrollbar-thumb {
  background-color: var(--sb-thumb);
  border-radius: 999px;
  border: 3px solid transparent;
  background-clip: padding-box;
}
*::-webkit-scrollbar-thumb:hover {
  background-color: var(--sb-thumb-hover);
}
*::-webkit-scrollbar-thumb:active {
  background-color: var(--sb-thumb-active);
}
*::-webkit-scrollbar-track,
*::-webkit-scrollbar-corner {
  background: var(--sb-track);
}
*::-webkit-scrollbar-button {
  display: none;
}
</style>
