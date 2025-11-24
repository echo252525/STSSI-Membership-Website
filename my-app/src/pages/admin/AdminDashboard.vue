<template>
  <div class="admin-dashboard d-flex flex-column min-vh-100">
    <!-- ===== Topbar ===== -->
    <header
      class="admin-topbar d-flex align-items-center justify-content-between px-3 px-md-4"
    >
      <div>
        <p class="topbar-eyebrow mb-1">Admin Control Center</p>
        <h1 class="h4 mb-0 fw-semibold">Dashboard</h1>
      </div>

      <div class="d-flex align-items-center gap-2 gap-md-3">
        <!-- Profile only (no notif, no logout) -->
        <div class="topbar-profile d-flex align-items-center gap-2">
          <!-- avatar-circle kept but hidden, so no visible profile pic -->
          <div class="avatar-circle d-none"></div>
          <div class="d-flex flex-column">
            <span class="profile-name">{{ adminName || 'Admin' }}</span>
            <span class="profile-role text-muted">admin</span>
          </div>
        </div>
      </div>
    </header>

    <!-- ===== Content ===== -->
    <main class="admin-content flex-grow-1 px-3 px-md-4 pb-4">
      <!-- ===== Metrics row / Overview ===== -->
      <section class="row g-3 mb-4 breath-in-section">
        <!-- Skeleton while metrics are loading -->
        <template v-if="metricsLoading">
          <div class="col-4 col-md-4" v-for="i in 3" :key="'metric-skel-' + i">
            <div class="card stat-card border-0 rounded-4">
              <div class="card-body d-flex flex-column gap-2">
                <div class="d-flex align-items-center justify-content-between mb-1">
                  <p class="stat-label text-muted mb-0">Metric label</p>
                  <i class="bi bi-dot text-muted"></i>
                </div>
                <div class="skel skel-value w-50"></div>
                <div class="skel skel-line w-75"></div>
              </div>
            </div>
          </div>
        </template>

        <!-- Live metrics -->
        <template v-else>
          <!-- Total users metric -->
          <div class="col-4 col-md-4">
            <div class="card stat-card border-0 rounded-4">
              <div class="card-body d-flex flex-column gap-2">
                <div class="d-flex align-items-center justify-content-between mb-1">
                  <p class="stat-label mb-0">Total users</p>
                  <i class="bi bi-people text-muted"></i>
                </div>
                <div class="stat-value h3 mb-0">
                  {{ formattedUserCount }}
                </div>
              </div>
            </div>
          </div>

          <!-- Pending orders metric -->
          <div class="col-4 col-md-4">
            <div class="card stat-card border-0 rounded-4">
              <div class="card-body d-flex flex-column gap-2">
                <div class="d-flex align-items-center justify-content-between mb-1">
                  <p class="stat-label mb-0">Pending orders</p>
                  <i class="bi bi-bag-check text-muted"></i>
                </div>
                <div class="stat-value h3 mb-0">
                  {{ formattedPendingOrdersCount }}
                </div>
              </div>
            </div>
          </div>

          <!-- Pending transactions metric -->
          <div class="col-4 col-md-4">
            <div class="card stat-card border-0 rounded-4">
              <div class="card-body d-flex flex-column gap-2">
                <div class="d-flex align-items-center justify-content-between mb-1">
                  <p class="stat-label mb-0">Pending transactions</p>
                  <i class="bi bi-wallet2 text-muted"></i>
                </div>
                <div class="stat-value h3 mb-0">
                  {{ formattedPendingTxCount }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </section>

      <!-- ===== Main grid ===== -->
      <section class="row g-3">
        <!-- Left column -->
        <div class="col-lg-8 d-flex flex-column gap-3">
          <!-- ===== Mini Games Hero Section (+ inline icons) ===== -->
          <div
            class="card border-0 rounded-4 mg-hero breath-in-section"
            v-if="featuredGame || eventsLoading"
          >
            <!-- Loading hero skeleton -->
            <div v-if="eventsLoading" class="mg-hero-inner">
              <div class="mg-hero-content">
                <div class="skel skel-line w-25 mb-2"></div>
                <div class="skel skel-value w-75 mb-2"></div>
                <div class="skel skel-line w-50 mb-2"></div>
                <div class="skel skel-line w-50 mb-2"></div>
                <div class="skel skel-line w-25"></div>
              </div>
              <div class="mg-hero-image-wrap">
                <div class="skel skel-hero-img"></div>
              </div>
            </div>

            <!-- Hero with featured game (clickable -> focus on id) -->
            <div
              v-else-if="featuredGame"
              class="mg-hero-inner mg-hero-click"
              role="button"
              tabindex="0"
              @click="goFeaturedMiniGame"
              @keydown.enter.prevent="goFeaturedMiniGame"
              @keydown.space.prevent="goFeaturedMiniGame"
            >
              <div class="mg-hero-content">
                <div class="mg-hero-badge-row d-flex align-items-center gap-2 mb-2">
                  <span class="mg-hero-pill">Featured mini game</span>
                  <span class="mg-hero-status">
                    Open · {{ fillPercent(featuredGame) }}% full
                  </span>
                </div>
                <h3 class="mg-hero-title mb-2" :title="featuredGame.title">
                  {{ featuredGame.title || 'Untitled mini game' }}
                </h3>
                <p class="mg-hero-sub mb-3">
                  Players:
                  <strong>{{ featuredGame.player_count }}</strong>
                  /
                  <span>{{ featuredGame.player_cap || defaultCap }}</span>
                  · {{ capacityLabel(featuredGame) }}
                </p>

                <div class="mg-hero-progress mb-2">
                  <div
                    class="mg-hero-progress-bar"
                    :style="{ width: fillPercent(featuredGame) + '%' }"
                  ></div>
                </div>

                <!-- Joined players avatars -->
                <div v-if="joinedAvatars(featuredGame).length" class="mg-hero-avatars mt-3">
                  <div class="avatar-stack">
                    <div
                      v-for="(av, idx) in joinedAvatars(featuredGame)"
                      :key="av.user_id + '-' + idx"
                      class="avatar-pill-small"
                      :title="av.name || 'Player'"
                    >
                      <img
                        v-if="av.avatarUrl"
                        :src="av.avatarUrl"
                        :alt="av.name || 'Player avatar'"
                      />
                      <span v-else>
                        {{ av.name ? av.name.charAt(0).toUpperCase() : '?' }}
                      </span>
                    </div>
                    <span
                      v-if="featuredGame.player_count > MAX_AVATAR_DISPLAY"
                      class="avatar-more"
                    >
                      +{{ featuredGame.player_count - MAX_AVATAR_DISPLAY }}
                    </span>
                  </div>
                  <p class="mg-hero-meta small text-muted mt-1 mb-0">
                    Recently joined players
                  </p>
                </div>

                <p
                  v-else
                  class="mg-hero-meta small text-muted mt-3 mb-0"
                >
                  No players have joined this game yet.
                </p>
              </div>

              <div class="mg-hero-image-wrap">
                <img
                  v-if="heroImageUrl"
                  :src="heroImageUrl"
                  alt="Prize product"
                  class="mg-hero-img"
                />
                <div v-else class="mg-hero-placeholder">
                  <i class="bi bi-image"></i>
                  <span>No product image</span>
                </div>
              </div>
            </div>

            <!-- 🔹 Inline mini-game icons (below featured, side-by-side) -->
            <div
              v-if="!eventsLoading && openEvents.length"
              class="mg-inline-strip"
            >
              <button
                v-for="ev in openEvents.slice(0, 6)"
                :key="ev.id"
                type="button"
                class="mg-inline-icon"
                :class="{ 'mg-inline-icon-active': featuredGame && ev.id === featuredGame.id }"
                @click.stop="setFeatured(ev)"
                @keydown.enter.prevent.stop="setFeatured(ev)"
                @keydown.space.prevent.stop="setFeatured(ev)"
              >
                <img
                  v-if="eventImageUrl(ev)"
                  :src="eventImageUrl(ev)"
                  :alt="ev.title || 'Mini game'"
                />
                <span v-else class="mg-inline-icon-letter">
                  {{ (ev.title || 'M').charAt(0).toUpperCase() }}
                </span>
              </button>
            </div>
          </div>

          <!-- Generic table template -> now shows recent orders -->
          <div class="card border-0 rounded-4 breath-in-section">
            <div
              class="card-header bg-white border-0 d-flex align-items-center justify-content-between"
            >
              <span class="section-title">Orders</span>
            </div>
            <div class="card-body">
              <!-- Loading skeleton (kept) -->
              <div v-if="ordersLoading" class="table-responsive minimalist-table">
                <table class="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th><span class="skel skel-line w-75"></span></th>
                      <th><span class="skel skel-line w-50"></span></th>
                      <th><span class="skel skel-line w-50"></span></th>
                      <th class="text-end">
                        <span class="skel skel-line w-25 ms-auto d-block"></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="i in 4" :key="'row-skel-' + i">
                      <td><span class="skel skel-line w-75"></span></td>
                      <td><span class="skel skel-line w-50"></span></td>
                      <td><span class="skel skel-line w-50"></span></td>
                      <td class="text-end">
                        <span class="skel skel-pill-inline"></span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Empty state -->
              <div
                v-else-if="recentOrders.length === 0"
                class="text-center text-muted small py-4"
              >
                No recent orders yet.
              </div>

              <!-- Recent orders table (rows clickable -> focus on reference) -->
              <div v-else class="table-responsive minimalist-table">
                <table class="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th class="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="g in recentOrders"
                      :key="g.reference_number"
                      class="table-row-clickable"
                      role="button"
                      tabindex="0"
                      @click="goOrderFromDashboard(g)"
                      @keydown.enter.prevent="goOrderFromDashboard(g)"
                      @keydown.space.prevent="goOrderFromDashboard(g)"
                    >
                      <td>
                        <div class="d-flex flex-column">
                          <span class="fw-semibold">{{ g.reference_number }}</span>
                          <span class="text-muted extra-small">
                            {{ formatDateShort(g.created_at) }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex flex-column">
                          <span class="small fw-medium">{{ g.buyerName || '—' }}</span>
                          <span class="text-muted extra-small">{{ g.itemLabel }}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          class="badge rounded-pill px-2 py-1"
                          :class="statusClass(g.status)"
                        >
                          {{ prettyStatus(g.status) }}
                        </span>
                      </td>
                      <td class="text-end">
                        <div class="d-flex flex-column align-items-end">
                          <span class="fw-semibold">₱{{ number(g.total_amount) }}</span>
                          <span class="text-muted extra-small">
                            {{ g.payment_method || '—' }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="col-lg-4 d-flex flex-column gap-3">
          <!-- Quick actions -->
          <div class="card border-0 rounded-4 breath-in-section">
            <div class="card-body">
              <p class="section-title mb-3">Quick actions</p>
              <div class="d-grid gap-2 quick-actions-grid">
                <!-- Manage users -> /admin/AdminMemberships?focus=openmodal -->
                <button
                  type="button"
                  class="btn btn-outline-secondary text-start quick-action-btn"
                  @click="goManageUsers"
                >
                  <i class="bi bi-person-check me-2"></i>
                  <span class="qa-label">Manage users</span>
                </button>
                <!-- Add event -> /admin/mini-games?focus=openmodal -->
                <button
                  type="button"
                  class="btn btn-outline-secondary text-start quick-action-btn"
                  @click="goAddEvent"
                >
                  <i class="bi bi-joystick me-2"></i>
                  <span class="qa-label">Add an event</span>
                </button>
                <!-- Add product -> /admin/products?focus=openmodal -->
                <button
                  type="button"
                  class="btn btn-outline-secondary text-start quick-action-btn"
                  @click="goAddProduct"
                >
                  <i class="bi bi-box-seam me-2"></i>
                  <span class="qa-label">Add a product</span>
                </button>
                <!-- Add discount -> /admin/discount?focus=openmodal -->
                <button
                  type="button"
                  class="btn btn-outline-secondary text-start quick-action-btn"
                  @click="goAddDiscount"
                >
                  <i class="bi bi-percent me-2"></i>
                  <span class="qa-label">Add a discount</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Notes / reminders template -> now shows latest transactions -->
          <div class="card border-0 rounded-4 breath-in-section">
            <div class="card-body">
              <p class="section-title mb-2">Transactions</p>
              <p class="text-muted small mb-2">
                Pending top ups
              </p>

              <!-- 🔹 Latest transactions snapshot (ewallet.transactions) -->
              <div class="notes-tx-widget mt-2">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="extra-small text-muted d-flex align-items-center gap-1">
                    <i class="bi bi-receipt-cutoff"></i>
                    Latest wallet transactions
                  </span>
                  <span
                    v-if="notesTxLoading"
                    class="badge rounded-pill bg-light text-muted extra-small"
                  >
                    Loading…
                  </span>
                  <span
                    v-else
                    class="badge rounded-pill bg-light text-muted extra-small"
                  >
                    {{ notesTxList.length }} shown
                  </span>
                </div>

                <!-- Skeleton state -->
                <div v-if="notesTxLoading">
                  <div
                    v-for="i in 3"
                    :key="'notes-tx-skel-' + i"
                    class="notes-tx-skel-row"
                  >
                    <div class="skel skel-line w-50 mb-1"></div>
                    <div class="skel skel-line w-25"></div>
                  </div>
                </div>

                <!-- Empty state -->
                <div
                  v-else-if="!notesTxList.length"
                  class="text-muted extra-small py-1"
                >
                  No transactions yet.
                </div>

                <!-- List (items clickable -> focus on transaction) -->
                <ul v-else class="list-unstyled mb-0 notes-tx-list">
                  <li
                    v-for="tx in notesTxList"
                    :key="tx.id"
                    class="notes-tx-item d-flex align-items-center justify-content-between"
                    role="button"
                    tabindex="0"
                    @click="goTransactionFromNotes(tx)"
                    @keydown.enter.prevent="goTransactionFromNotes(tx)"
                    @keydown.space.prevent="goTransactionFromNotes(tx)"
                  >
                    <div class="d-flex align-items-center gap-2 min-w-0">
                      <div class="notes-tx-avatar">
                        <img
                          v-if="notesUserAvatar(tx)"
                          :src="notesUserAvatar(tx)"
                          :alt="tx.user_name || 'User avatar'"
                        />
                        <span v-else>
                          {{ tx.user_name ? tx.user_name.charAt(0).toUpperCase() : '?' }}
                        </span>
                      </div>
                      <div class="min-w-0">
                        <div class="fw-semibold text-truncate extra-small">
                          {{ tx.user_name || 'Unknown user' }}
                        </div>
                        <div class="text-muted extra-small text-truncate font-monospace">
                          {{ tx.reference_number }}
                        </div>
                      </div>
                    </div>

                    <div class="text-end ms-2">
                      <div class="extra-small fw-semibold">
                        ₱{{ number(tx.amount) }}
                      </div>
                      <div class="extra-small mt-1">
                        <span
                          class="badge rounded-pill px-2 py-0 notes-status-pill"
                          :class="notesStatusClass(tx.status)"
                        >
                          {{ capitalizeStatus(tx.status) }}
                        </span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Bottom skeleton lines shown only while loading -->
              <div v-if="notesTxLoading">
                <div class="skel skel-line w-100 mb-1 mt-3"></div>
                <div class="skel skel-line w-75 mb-1"></div>
                <div class="skel skel-line w-50"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { currentUser } from '@/lib/authState'

const router = useRouter()
const user = computed(() => currentUser.value)

/** ===================== ADMIN PROFILE (TOPBAR NAME) ===================== */

const adminName = ref('')

async function loadAdminProfile() {
  try {
    // get current user id (from authState if available, otherwise from supabase auth)
    let uid: string | undefined = user.value?.id as string | undefined

    if (!uid) {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) return
      uid = data.user.id
    }

    const { data: adminRow, error: adminErr } = await supabase
      .from('admins')
      .select('full_name')
      .eq('id', uid)
      .maybeSingle()

    if (!adminErr && adminRow?.full_name) {
      adminName.value = adminRow.full_name
    }
  } catch (e: any) {
    console.error('[dashboard] loadAdminProfile error:', e?.message || e)
  }
}

/** ===================== QUICK ACTIONS NAVIGATION ===================== */

function goManageUsers() {
  router.push({
    path: '/admin/AdminMemberships',
    query: { focus: 'openmodal' },
  })
}

function goAddEvent() {
  router.push({
    path: '/admin/mini-games',
    query: { focus: 'openmodal' },
  })
}

function goAddProduct() {
  router.push({
    path: '/admin/products',
    query: { focus: 'openmodal' },
  })
}

function goAddDiscount() {
  router.push({
    path: '/admin/discounts',
    query: { focus: 'openmodal' },
  })
}

/** ===================== DASHBOARD METRICS (TOP CARDS) ===================== */

const metricsLoading = ref(true)
const userCount = ref(0)
const displayUserCount = ref(0)

const pendingOrdersCount = ref(0)
const displayPendingOrdersCount = ref(0)

const pendingTxCount = ref(0)
const displayPendingTxCount = ref(0)

/** Generic counter animation (0 -> target) */
function animateCount(
  displayRef: { value: number },
  target: number,
  duration = 500,
) {
  const startValue = 0
  let start: number | null = null

  const step = (timestamp: number) => {
    if (start === null) {
      start = timestamp
    }
    const elapsed = timestamp - start
    const progress = Math.min(elapsed / duration, 1)
    displayRef.value = Math.floor(
      startValue + (target - startValue) * progress,
    )
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

const formattedUserCount = computed(() =>
  displayUserCount.value.toLocaleString('en-US'),
)

const formattedPendingOrdersCount = computed(() =>
  displayPendingOrdersCount.value.toLocaleString('en-US'),
)

const formattedPendingTxCount = computed(() =>
  displayPendingTxCount.value.toLocaleString('en-US'),
)

async function loadDashboardMetrics() {
  metricsLoading.value = true
  try {
    // Total users
    const { count: userCountRaw, error: userErr } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (userErr) throw userErr
    const cUsers = typeof userCountRaw === 'number' ? userCountRaw : 0
    userCount.value = cUsers
    displayUserCount.value = 0
    // Users count animation (normal speed)
    animateCount(displayUserCount, cUsers, 500)

    // Pending orders = status 'pending' ONLY
    const { count: pendingRaw, error: pendingErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (pendingErr) throw pendingErr
    const cPending = typeof pendingRaw === 'number' ? pendingRaw : 0
    pendingOrdersCount.value = cPending
    displayPendingOrdersCount.value = 0
    // Pending orders count animation (faster)
    animateCount(displayPendingOrdersCount, cPending, 300)

    // Pending wallet transactions = status 'pending'
    const { count: pendingTxRaw, error: pendingTxErr } = await supabase
      .schema('ewallet')
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (pendingTxErr) throw pendingTxErr
    const cPendingTx = typeof pendingTxRaw === 'number' ? pendingTxRaw : 0
    pendingTxCount.value = cPendingTx
    displayPendingTxCount.value = 0
    // Pending transactions animation (also fast)
    animateCount(displayPendingTxCount, cPendingTx, 300)
  } catch (e: any) {
    console.error('[dashboard] loadDashboardMetrics error:', e?.message || e)
    userCount.value = 0
    displayUserCount.value = 0
    pendingOrdersCount.value = 0
    displayPendingOrdersCount.value = 0
    pendingTxCount.value = 0
    displayPendingTxCount.value = 0
  } finally {
    metricsLoading.value = false
  }
}

/** ===================== MINI GAMES (READ-ONLY) ===================== */

type EventRow = {
  id: string
  title: string
  player_count: number
  player_cap?: number | null
  product_id: string | null
  status: 'draft' | 'open' | 'locked' | 'spun' | 'settled' | 'cancelled'
}

type ProductRow = {
  id: string
  name: string
  price: number | string
  supplier_price: number | string
  product_url: string | string[] | null
}

/* Avatar types for joined players */
type EntryLite = {
  user_id: string
  joined_at: string
}

type AvatarInfo = {
  user_id: string
  name: string | null
  avatarUrl: string | null
}

const events = ref<EventRow[]>([])
const eventsLoading = ref(true)
const defaultCap = 10

const products = ref<ProductRow[]>([])
const productsLoading = ref(false)

/** Map of products by id */
const productMap = computed<Record<string, ProductRow>>(() => {
  const m: Record<string, ProductRow> = {}
  for (const p of products.value) m[p.id] = p
  return m
})

const signedMap = reactive<Record<string, string>>({})
const imgBusy = reactive<Record<string, boolean>>({})

/** Avatars per event */
const avatarsByEvent: Record<string, AvatarInfo[]> = reactive({} as Record<
  string,
  AvatarInfo[]
>)
const MAX_AVATAR_DISPLAY = 5

function isStoragePath(u: string | null | undefined) {
  if (!u) return false
  return !/^https?:\/\//i.test(u)
}

function firstUrl(u: string | string[] | null): string | '' {
  if (!u) return ''
  if (Array.isArray(u)) return (u[0] ?? '') as string
  return u as string
}

/** Signed or direct URL for a product image */
function productImageUrl(p: ProductRow | null): string {
  if (!p || !p.product_url) return ''
  const raw0 = firstUrl(p.product_url)
  if (!raw0) return ''

  const key = p.id
  const raw = raw0

  if (!isStoragePath(raw)) return raw

  if (signedMap[key]) return signedMap[key]

  if (!imgBusy[key]) {
    imgBusy[key] = true
    supabase.storage
      .from('prize_product')
      .createSignedUrl(raw, 60 * 60)
      .then(({ data, error }) => {
        if (error) {
          console.error('signedUrl error:', error.message)
        } else if (data?.signedUrl) {
          signedMap[key] = data.signedUrl
        }
      })
      .finally(() => {
        imgBusy[key] = false
      })
  }

  return ''
}

/** Get image URL for an event via its product_id */
function eventImageUrl(ev: EventRow | null): string {
  if (!ev || !ev.product_id) return ''
  const p = productMap.value[ev.product_id]
  return productImageUrl(p || null)
}

/** Normalize profile path from users.profile_url */
function normalizeToPath(maybePath: string | null | undefined): string | null {
  if (!maybePath) return null
  if (/^https?:\/\//i.test(maybePath)) return maybePath
  return maybePath.replace(/^\/+/, '')
}

async function signUserProfileUrl(path: string): Promise<string | null> {
  if (/^https?:\/\//i.test(path)) return path
  const { data, error } = await supabase.storage
    .from('user_profile')
    .createSignedUrl(path, 60 * 60)
  if (error) {
    console.warn('[AVATAR] sign error:', error.message)
    return null
  }
  const url = data?.signedUrl ?? null
  return url ? `${url}&cb=${Date.now()}` : null
}

/** Fetch up to N avatars for event participants */
async function refreshParticipantAvatars(eventId: string) {
  try {
    const { data: entries, error: entryErr } = await supabase
      .schema('games')
      .from('entry')
      .select('user_id, joined_at')
      .eq('event_id', eventId)
      .order('joined_at', { ascending: false })
      .limit(MAX_AVATAR_DISPLAY * 3)
    if (entryErr) throw entryErr

    const typedEntries = (entries ?? []) as EntryLite[]
    const userIds = Array.from(new Set(typedEntries.map((r) => r.user_id))).filter(
      Boolean,
    )

    if (!userIds.length) {
      avatarsByEvent[eventId] = []
      return
    }

    const { data: users, error: usersErr } = await supabase
      .schema('public')
      .from('users')
      .select('id, full_name, profile_url')
      .in('id', userIds)

    if (usersErr) throw usersErr

    const map = new Map<
      string,
      { full_name: string | null; profile_url: string | null }
    >()
    for (const u of (users ?? []) as Array<{
      id: string
      full_name: string | null
      profile_url: string | null
    }>) {
      map.set(u.id, { full_name: u.full_name ?? null, profile_url: u.profile_url ?? null })
    }

    const list: AvatarInfo[] = []
    for (const e of typedEntries) {
      const user = map.get(e.user_id)
      if (!user) continue
      const path = normalizeToPath(user.profile_url)
      let url: string | null = null
      if (path) url = await signUserProfileUrl(path)
      list.push({
        user_id: e.user_id,
        name: user.full_name,
        avatarUrl: url,
      })
    }
    avatarsByEvent[eventId] = list
  } catch (e: any) {
    console.warn('[AVATAR] refreshParticipantAvatars failed for', eventId, e?.message || e)
    avatarsByEvent[eventId] = avatarsByEvent[eventId] || []
  }
}

/** Helper used by hero template */
function joinedAvatars(ev: EventRow | null): AvatarInfo[] {
  if (!ev) return []
  return (avatarsByEvent[ev.id] || []).slice(0, MAX_AVATAR_DISPLAY)
}

/** Load all published products */
async function loadProducts() {
  productsLoading.value = true
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('products')
      .select('id, name, price, supplier_price, product_url')
      .eq('ispublish', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('loadProducts error:', error.message)
      return
    }
    products.value = (data ?? []) as ProductRow[]
  } finally {
    productsLoading.value = false
  }
}

const openEvents = computed(() => events.value.filter((e) => e.status === 'open'))

/** Track which mini game is featured in the hero */
const selectedFeaturedId = ref<string | null>(null)

const featuredGame = computed<EventRow | null>(() => {
  if (!openEvents.value.length) return null
  if (selectedFeaturedId.value) {
    const found = openEvents.value.find((e) => e.id === selectedFeaturedId.value)
    if (found) return found
  }
  return openEvents.value[0] || null
})

const heroImageUrl = computed(() => eventImageUrl(featuredGame.value))

function setFeatured(ev: EventRow) {
  selectedFeaturedId.value = ev.id
  if (!avatarsByEvent[ev.id] || !avatarsByEvent[ev.id].length) {
    refreshParticipantAvatars(ev.id)
  }
}

/** NEW: when hero is clicked, go to mini-games page focused on this event id */
function goFeaturedMiniGame() {
  const fg = featuredGame.value
  if (!fg) return
  router.push({
    path: '/admin/mini-games',
    query: { focus: fg.id },
  })
}

async function loadEvents() {
  eventsLoading.value = true
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('event')
      .select('id, title, player_count, player_cap, product_id, status')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('loadEvents error:', error.message)
      events.value = []
      return
    }
    events.value = (data ?? []) as EventRow[]

    // Preload avatars for open events (lightweight)
    const open = events.value.filter((e) => e.status === 'open')
    await Promise.all(open.map((e) => refreshParticipantAvatars(e.id)))
  } finally {
    eventsLoading.value = false
  }
}

/** If featured game changes (e.g., new openEvents snapshot), refresh its avatars */
watch(
  featuredGame,
  (fg) => {
    if (fg && (!avatarsByEvent[fg.id] || !avatarsByEvent[fg.id].length)) {
      refreshParticipantAvatars(fg.id)
    }
  },
  { immediate: false },
)

/** Fill percentage for progress bar */
function fillPercent(ev: EventRow): number {
  const cap = ev.player_cap || defaultCap
  if (!cap || cap <= 0) return 0
  const ratio = Math.min(ev.player_count / cap, 1)
  return Math.round(ratio * 100)
}

/** Friendly label based on fill percentage */
function capacityLabel(ev: EventRow): string {
  const p = fillPercent(ev)
  if (p >= 90) return 'Almost full'
  if (p >= 60) return 'Filling up'
  if (p > 0) return 'Getting started'
  return 'Just opened'
}

/** ===================== RECENT ORDERS (KEY LIST) ===================== */

/** Status constants (align with purchase_status enum) */
const STATUS = {
  TO_PAY: 'to pay',
  TO_SHIP: 'to ship',
  TO_RECEIVE: 'to receive',
  COMPLETED: 'completed',
  RETURN_REFUND: 'return/refund',
  CANCELLED: 'cancelled',
} as const

type PurchaseRow = {
  id: string
  user_id: string
  product_id: string
  reference_number: string
  status: string
  created_at: string
  updated_at: string
  modeofpayment: string | null
  qty: number
  discounted_price: number | string | null
  shipping_fee: number | string | null
  tracking_link: string | null
  is_free_shipping: boolean
}

type Product = {
  id: string
  name: string
  description: string | null
  price: number | string
  product_url: string[] | null
}

type Buyer = {
  id: string
  full_name: string | null
  phone_number: string | null
  address: string | null
  membership_id: string | null
}

type RecentOrderRow = {
  reference_number: string
  created_at: string
  status: string
  payment_method: string | null
  total_amount: number
  buyerName: string | null
  itemLabel: string
}

const ordersLoading = ref(true)
const recentOrders = ref<RecentOrderRow[]>([])

const number = (n: number | string | null | undefined) =>
  Number(n ?? 0).toFixed(2)

function prettyStatus(s?: string | null) {
  const k = String(s || '').toLowerCase()
  if (k === 'pending') return 'Pending'
  if (k === STATUS.TO_PAY) return 'To Pay'
  if (k === STATUS.TO_SHIP) return 'To Ship'
  if (k === STATUS.TO_RECEIVE) return 'To Receive'
  if (k === STATUS.COMPLETED) return 'Completed'
  if (k === STATUS.RETURN_REFUND) return 'Return/Refund'
  if (k === STATUS.CANCELLED) return 'Cancelled'
  return s || '—'
}

function statusClass(s?: string | null) {
  const k = String(s || '').toLowerCase()
  if (k === 'pending') return 'text-bg-light border'
  if (k === STATUS.CANCELLED) return 'text-bg-danger-subtle border'
  if (k === STATUS.RETURN_REFUND) return 'text-bg-warning-subtle border'
  if (k === STATUS.COMPLETED) return 'text-bg-success-subtle border'
  if (k === STATUS.TO_SHIP || k === STATUS.TO_RECEIVE)
    return 'text-bg-info-subtle border'
  if (k === STATUS.TO_PAY) return 'text-bg-light border'
  return 'text-bg-light border'
}

function formatDateShort(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const month = d.toLocaleString('en-US', { month: 'short' })
  const day = d.getDate()
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${month} ${day} • ${time}`
}

async function loadRecentOrders() {
  ordersLoading.value = true
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('purchases')
      .select(
        'id,user_id,product_id,reference_number,status,created_at,updated_at,modeofpayment,qty,discounted_price',
      )
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[dashboard] loadRecentOrders error:', error.message)
      recentOrders.value = []
      return
    }

    const rows = (data || []) as PurchaseRow[]
    if (!rows.length) {
      recentOrders.value = []
      return
    }

    const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)))
    const productIds = Array.from(
      new Set(rows.map((r) => r.product_id).filter(Boolean)),
    )

    const buyersMap: Record<string, Buyer> = {}
    const productsMapLocal: Record<string, Product> = {}

    if (userIds.length) {
      const { data: urows } = await supabase
        .from('users')
        .select('id,full_name')
        .in('id', userIds)
      if (Array.isArray(urows)) {
        for (const u of urows as Buyer[]) {
          buyersMap[u.id] = u
        }
      }
    }

    if (productIds.length) {
      const { data: prows } = await supabase
        .schema('games')
        .from('products')
        .select('id,name,price')
        .in('id', productIds)
      if (Array.isArray(prows)) {
        for (const p of prows as Product[]) {
          productsMapLocal[p.id] = p
        }
      }
    }

    // group by reference_number
    const byRef: Record<string, PurchaseRow[]> = {}
    for (const r of rows) {
      const key = r.reference_number || r.id
      if (!byRef[key]) byRef[key] = []
      byRef[key].push(r)
    }

    const groups: RecentOrderRow[] = []
    for (const [ref, list] of Object.entries(byRef)) {
      const sorted = list
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
      const latest = sorted[0]
      const created_at = latest.created_at
      const user = buyersMap[latest.user_id]
      const buyerName = user?.full_name ?? null

      const items: { name: string; total: number }[] = []
      for (const p of list) {
        const prod = productsMapLocal[p.product_id]
        const each =
          p.discounted_price != null && p.discounted_price !== ''
            ? Number(p.discounted_price)
            : Number(prod?.price ?? 0)
        const qty = Number(p.qty ?? 1) || 1
        const lineTotal = Number((each * qty).toFixed(2))
        items.push({ name: prod?.name || 'Item', total: lineTotal })
      }

      const total_amount = items.reduce((s, it) => s + it.total, 0)
      const firstName = items[0]?.name || 'Order items'
      const itemLabel =
        items.length > 1 ? `${firstName} + ${items.length - 1} more` : firstName

      groups.push({
        reference_number: ref,
        created_at,
        status: latest.status,
        payment_method: latest.modeofpayment,
        total_amount,
        buyerName,
        itemLabel,
      })
    }

    groups.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    recentOrders.value = groups.slice(0, 4)
  } finally {
    ordersLoading.value = false
  }
}

/** NEW: when order row is clicked, go to orders page focused on this reference */
function goOrderFromDashboard(row: RecentOrderRow) {
  if (!row?.reference_number) return
  router.push({
    path: '/admin/orders',
    query: { focus: row.reference_number },
  })
}

/** ===================== NOTES: LATEST TRANSACTIONS (ewallet.transactions) ===================== */

type NotesTxStatus = 'pending' | 'disbursed' | 'rejected'

type NotesTxRow = {
  id: string
  user_id: string
  reference_number: string
  amount: number
  status: NotesTxStatus | string
  created_at: string
  updated_at: string
  user_name: string | null
  user_email: string | null
  profile_url: string | null
}

const notesTxLoading = ref(true)
const notesTxError = ref<string>('')
const notesTxList = ref<NotesTxRow[]>([])

/** Small avatar cache for notes widget */
const notesAvatarSignedMap = reactive<Record<string, string>>({})
const notesAvatarBusy = reactive<Record<string, boolean>>({})

function notesUserAvatar(tx: NotesTxRow): string {
  const raw = tx.profile_url
  const key = tx.user_id
  if (!raw) return ''
  const path = normalizeToPath(raw)
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (notesAvatarSignedMap[key]) return notesAvatarSignedMap[key]

  if (!notesAvatarBusy[key]) {
    notesAvatarBusy[key] = true
    signUserProfileUrl(path)
      .then((url) => {
        if (url) notesAvatarSignedMap[key] = url
      })
      .finally(() => {
        notesAvatarBusy[key] = false
      })
  }
  return ''
}

function capitalizeStatus(s?: string | null): string {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function notesStatusClass(s?: string | null): string {
  const k = String(s || '').toLowerCase()
  if (k === 'pending') return 'text-bg-warning-subtle border'
  if (k === 'disbursed') return 'text-bg-success-subtle border'
  if (k === 'rejected') return 'text-bg-danger-subtle border'
  return 'text-bg-light border'
}

async function loadNotesTransactions() {
  notesTxLoading.value = true
  notesTxError.value = ''
  try {
    const { data, error } = await supabase
      .schema('ewallet')
      .from('transactions')
      .select(
        `
        id,
        user_id,
        reference_number,
        amount,
        status,
        created_at,
        updated_at
      `,
      )
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) throw error

    let rows = (data || []) as any[]

    if (rows.length) {
      const ids = Array.from(new Set(rows.map((r) => r.user_id)))
      const { data: userRows, error: uerr } = await supabase
        .from('users')
        .select('id, full_name, email, profile_url')
        .in('id', ids)

      if (!uerr && userRows) {
        const map = new Map<
          string,
          { full_name: string | null; email: string | null; profile_url: string | null }
        >(userRows.map((u: any) => [
          u.id,
          {
            full_name: u.full_name ?? null,
            email: u.email ?? null,
            profile_url: u.profile_url ?? null,
          },
        ]))
        rows = rows.map((r) => ({ ...r, users: map.get(r.user_id) || null }))
      } else if (uerr) {
        console.warn('[dashboard] notes users hydrate error:', uerr.message)
      }
    }

    notesTxList.value = rows.map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      reference_number: r.reference_number,
      amount: Number(r.amount ?? 0),
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      user_name: r.users?.full_name ?? null,
      user_email: r.users?.email ?? null,
      profile_url: r.users?.profile_url ?? null,
    }))
  } catch (e: any) {
    console.error('[dashboard] loadNotesTransactions error:', e?.message || e)
    notesTxError.value = e?.message || 'Failed to load transactions.'
    notesTxList.value = []
  } finally {
    notesTxLoading.value = false
  }
}

/** NEW: when a wallet transaction is clicked, go to transactions page focused on it */
function goTransactionFromNotes(tx: NotesTxRow) {
  if (!tx) return
  const ref = tx.reference_number || tx.id
  if (!ref) return
  router.push({
    path: '/admin/transactions',
    query: { focus: ref },
  })
}

/** ===================== AUTH + INIT ===================== */
onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return router.push({ name: 'login' })
  }
  await Promise.all([
    loadAdminProfile(),
    loadDashboardMetrics(),
    loadEvents(),
    loadProducts(),
    loadRecentOrders(),
    loadNotesTransactions(),
  ])
})
</script>

<style scoped>
.admin-dashboard {
  background: #f5f6f8;
  color: #1f2933;
  font-size: 0.95rem;
}

/* Tokens */
:root,
:host {
  --brand-green: #20a44c;
  --brand-azure: #20647c;
  --border-soft: rgba(15, 23, 42, 0.08);
  --shadow-soft: 0 10px 30px rgba(15, 23, 42, 0.08);
}

/* Simple "breath in" entrance animation for sections */
.breath-in-section {
  animation: breathIn 0.55s ease-out;
  animation-fill-mode: both;
}

@keyframes breathIn {
  0% {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ===== Topbar ===== */
.admin-topbar {
  height: 64px;
  border-bottom: 1px solid var(--border-soft);
  background: #ffffff;
}

.topbar-eyebrow {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(135deg, #20a44c, #20647c);
  box-shadow: 0 4px 12px rgba(32, 100, 124, 0.5);
}

.profile-name {
  font-size: 0.86rem;
  font-weight: 600;
}

.profile-role {
  font-size: 0.78rem;
}

/* ===== Content ===== */
.admin-content {
  padding-top: 1rem;
}

.section-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #374151;
}

.extra-small {
  font-size: 0.75rem;
}

/* ===== Cards & stats ===== */
.stat-card {
  background: #ffffff;
  box-shadow: var(--shadow-soft);
}

.stat-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

/* Skeletons */
.skel {
  display: inline-block;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    #e5e7eb 0%,
    #f3f4f6 30%,
    #e5e7eb 60%
  );
  background-size: 200% 100%;
  animation: skelPulse 1.4s ease-in-out infinite;
}

.skel-line {
  height: 8px;
}

.skel-value {
  height: 18px;
}

.skel-pill {
  width: 40px;
  height: 16px;
  border-radius: 999px;
}

.skel-pill-inline {
  width: 60px;
  height: 18px;
}

.skel-hero-img {
  width: 100%;
  height: 150px;
  border-radius: 16px;
}

@keyframes skelPulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ===== Mini Games Hero ===== */
.mg-hero {
  background: radial-gradient(circle at top left, #f0fdf4 0%, #ffffff 45%, #ecfdf5 100%);
  box-shadow: var(--shadow-soft);
  padding: 0.9rem 1.1rem;
}

.mg-hero-inner {
  display: flex;
  gap: 1.25rem;
  align-items: stretch;
}

/* NEW: clickable hero */
.mg-hero-click {
  cursor: pointer;
}

.mg-hero-click:focus-visible {
  outline: 2px solid #20647c;
  outline-offset: 2px;
}

.mg-hero-content {
  flex: 1 1 0;
  min-width: 0;
}

.mg-hero-image-wrap {
  flex: 0 0 230px;
  max-width: 230px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mg-hero-img {
  width: 100%;
  height: 160px;
  border-radius: 18px;
  object-fit: cover;
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: 0 10px 28px rgba(22, 163, 74, 0.25);
  background: #f9fafb;
}

.mg-hero-placeholder {
  width: 100%;
  height: 160px;
  border-radius: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: #9ca3af;
  font-size: 0.8rem;
}

.mg-hero-placeholder i {
  font-size: 1.3rem;
}

.mg-hero-badge-row {
  font-size: 0.78rem;
}

.mg-hero-pill {
  padding: 0.1rem 0.6rem;
  border-radius: 999px;
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.mg-hero-status {
  color: #4b5563;
}

.mg-hero-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #022c22;
}

.mg-hero-sub {
  font-size: 0.9rem;
  color: #065f46;
}

.mg-hero-progress {
  position: relative;
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: rgba(31, 41, 55, 0.06);
  overflow: hidden;
}

.mg-hero-progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--brand-green), var(--brand-azure));
  transition: width 0.25s ease;
}

.mg-hero-meta {
  font-size: 0.78rem;
}

/* Hero avatars */
.mg-hero-avatars {
  margin-top: 0.4rem;
}

.avatar-stack {
  display: flex;
  align-items: center;
}

.avatar-pill-small {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  overflow: hidden;
  border: 2px solid #ecfdf5;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #4b5563;
  margin-right: -8px;
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.2);
}

.avatar-pill-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-more {
  margin-left: 0.85rem;
  font-size: 0.78rem;
  color: #4b5563;
}

/* 🔹 Mini games inline icons under hero */
.mg-inline-strip {
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(148, 163, 184, 0.4);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mg-inline-icon {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: #f3f4f6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.14s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.15);
}

.mg-inline-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mg-inline-icon-letter {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
}

.mg-inline-icon-active {
  border-color: var(--brand-azure);
  background: #eff6ff;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
}

/* ===== Mini games dashboard cards (kept styles, even though cards were removed here) ===== */
.mg-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 0.9rem 0.9rem 0.8rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition:
    transform 0.14s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
  cursor: pointer;
}

.mg-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
  border-color: rgba(32, 100, 124, 0.45);
  background: radial-gradient(circle at top left, #f1fdf7, #ffffff 45%);
}

.mg-card-active {
  border-color: var(--brand-azure);
  box-shadow: 0 16px 40px rgba(37, 99, 235, 0.25);
}

.mg-card-skeleton {
  box-shadow: none;
  cursor: default;
}

.mg-card-header {
  margin-bottom: 0.4rem;
}

.mg-title-wrap {
  min-width: 0;
}

.mg-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mg-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  background: rgba(148, 163, 184, 0.12);
  margin-bottom: 0.25rem;
}

.mg-players {
  font-size: 0.8rem;
  color: #4b5563;
}

/* Thumbnail */
.mg-thumbnail-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  overflow: hidden;
  background: #f3f4f6;
  border: 1px solid rgba(148, 163, 184, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mg-thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mg-thumbnail-placeholder i {
  font-size: 1.1rem;
  color: #9ca3af;
}

.mg-progress {
  position: relative;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(31, 41, 55, 0.06);
  overflow: hidden;
}

.mg-progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--brand-green), var(--brand-azure));
  transition: width 0.25s ease;
}

.mg-meta-row {
  margin-top: 0.3rem;
}

.mg-capacity-label {
  font-size: 0.78rem;
  color: #374151;
}

.mg-percent {
  font-size: 0.76rem;
}

/* Status pill */
.status-pill {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-weight: 600;
  border: 1px solid transparent;
}

.status-pill-open {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
  border-color: rgba(34, 197, 94, 0.35);
}

/* Placeholder pill */
.status-pill-placeholder {
  width: 44px;
  height: 18px;
  border-radius: 999px;
  background: #e5e7eb;
}

/* Overview footer separator */
.overview-footer {
  padding-top: 0.4rem;
  border-top: 1px dashed rgba(148, 163, 184, 0.5);
}

/* Icon ghost button (3 dots) */
.btn-icon-ghost {
  border: 0;
  border-radius: 999px;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #4b5563;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.btn-icon-ghost:hover {
  background: #e5e7eb;
  color: #111827;
}

/* ===== Table ===== */
.minimalist-table table {
  border: 0;
}

.minimalist-table thead th {
  font-size: 0.75rem;
  border: 0;
  color: #9ca3af;
}

.minimalist-table tbody td {
  border-top: 1px solid #f3f4f6;
}

/* NEW: clickable table rows */
.table-row-clickable {
  cursor: pointer;
}

.table-row-clickable:hover {
  background-color: #f9fafb;
}

/* Brand button */
.btn-brand {
  background: linear-gradient(135deg, var(--brand-azure), var(--brand-green));
  border: none;
  color: #ffffff;
  box-shadow: 0 6px 18px rgba(32, 100, 124, 0.35);
}

.btn-brand:hover {
  opacity: 0.95;
}

/* ===== Notes transactions widget ===== */
.notes-tx-widget {
  border-top: 1px dashed rgba(148, 163, 184, 0.5);
  padding-top: 0.5rem;
}

.notes-tx-skel-row {
  margin-bottom: 0.4rem;
}

.notes-tx-list {
  max-height: 220px;
  overflow-y: auto;
}

.notes-tx-item {
  padding: 0.2rem 0;
}

.notes-tx-item[role='button'] {
  cursor: pointer;
}

.notes-tx-item[role='button']:hover {
  background-color: #f9fafb;
  border-radius: 0.4rem;
}

.notes-tx-avatar {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 600;
  color: #4b5563;
}

.notes-tx-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notes-status-pill {
  font-size: 0.65rem;
}

/* ===== Responsive tweaks ===== */
@media (max-width: 992px) {
  .mg-hero-inner {
    flex-direction: column;
  }
  .mg-hero-image-wrap {
    flex: 0 0 auto;
    max-width: 100%;
  }
  .mg-hero-img,
  .mg-hero-placeholder {
    height: 180px;
  }
}

@media (max-width: 768px) {
  .admin-topbar {
    height: auto;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }

  .admin-content {
    padding-top: 0.75rem;
  }
}

/* ===== Mobile tweaks: overview metrics & quick actions ===== */
@media (max-width: 576px) {
  /* Keep three metrics lined up and compact */
  .stat-card .card-body {
    padding: 0.5rem 0.55rem;
  }

  .stat-label {
    display: none; /* hide text labels, leave icon + number */
  }

  .stat-value {
    font-size: 1.15rem;
  }

  .stat-card i {
    font-size: 1.1rem;
  }

  /* Quick actions: icon-only to save space */
  .quick-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-inline: 0.5rem;
  }

  .quick-action-btn .qa-label {
    display: none;
  }

  .quick-action-btn i {
    margin-right: 0 !important;
    font-size: 1.2rem;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  /* Make inline icons slightly smaller on very small screens */
  .mg-inline-icon {
    width: 34px;
    height: 34px;
  }
}

/* Mini games at a glance – compact mobile look (kept for mg-card reuse) */
.mg-card {
  padding: 0.45rem 0.55rem 0.5rem;
  border-radius: 14px;
}

.mg-card-header {
  /* can be hidden where needed */
}

.mg-thumbnail-wrap {
  width: 32px;
  height: 32px;
  border-radius: 999px;
}

.mg-players {
  font-size: 0.78rem;
  margin-bottom: 0.1rem !important;
}

.mg-progress {
  height: 5px;
  margin-bottom: 0.15rem;
}

.mg-meta-row {
  /* can be hidden where needed */
}

/* Force status badge text to always be black */
.badge.rounded-pill.px-2.py-1 {
  color: #000 !important;
}
</style>
