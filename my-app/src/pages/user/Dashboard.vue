<template>
  <div class="dash container-xxl">
    <!-- ===== HERO ===== -->
    <section class="hero card border-0 shadow-sm rounded-4 mb-3" v-reveal>
      <div class="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="tier-icon neon">
            <img v-if="badgeIcon" :src="badgeIcon" :alt="currentTier.name + ' badge'" />
            <div v-else class="tier-fallback"><i class="bi bi-person-badge"></i></div>
          </div>
          <div>
            <div class="text-muted small text-uppercase">Welcome back</div>
            <h1 class="h4 fw-bold m-0">{{ currentTier.name }}</h1>
          </div>
        </div>
        <div class="quick-actions">
          <router-link to="/app/minigames" class="qchip" v-reveal>
            <i class="bi bi-controller"></i> Mini Games
          </router-link>
          <router-link to="/app/wallet" class="qchip" v-reveal style="--i:1">
            <i class="bi bi-wallet2"></i> Wallet
          </router-link>
          <router-link to="/app/deals" class="qchip" v-reveal style="--i:2">
            <i class="bi bi-ticket-perforated"></i> Deals
          </router-link>
          <router-link to="/app/purchases" class="qchip" v-reveal style="--i:3">
            <i class="bi bi-receipt"></i> Orders
          </router-link>
        </div>
      </div>
      <div class="hero-grid" aria-hidden="true"></div>
    </section>

    <!-- ===== KPIs ===== -->
    <section class="grid grid-quick mb-4">
      <div class="kpi-card glass" v-reveal v-tilt>
        <div class="kpi-head">
          <span class="label"><i class="bi bi-wallet2 me-1"></i> E-Wallet</span>
          <router-link to="/app/wallet" class="btn btn-outline-secondary btn-xs">Manage</router-link>
        </div>
        <div class="kpi-value">{{ peso(ewallet.balance) }}</div>
        <div class="kpi-subtext text-muted small">Available balance</div>
      </div>

      <div class="kpi-card glass" v-reveal v-tilt style="--i:1">
        <div class="kpi-head">
          <span class="label"><i class="bi bi-ticket-perforated me-1"></i> Discount Credits</span>
          <router-link to="/app/deals" class="btn btn-outline-secondary btn-xs">Use</router-link>
        </div>
        <div class="kpi-value">{{ peso(credits.balance) }}</div>
        <div class="kpi-subtext text-muted small">Credit balance</div>
      </div>

      <div class="kpi-card glass" v-reveal v-tilt style="--i:2">
        <div class="kpi-head">
          <span class="label"><i class="bi bi-bag-check me-1"></i> Purchases</span>
          <router-link to="/app/purchases" class="btn btn-outline-secondary btn-xs">History</router-link>
        </div>
        <div class="kpi-value">{{ peso(memberStats.lifetimePurchases) }}</div>
        <div class="kpi-subtext text-muted small">Lifetime total</div>
        <div class="kpi-subtext text-muted small">This month: {{ peso(purchasesPerMonth) }}</div>
      </div>

      <div class="kpi-card glass" v-reveal v-tilt style="--i:3">
        <div class="kpi-head">
          <span class="label"><i class="bi bi-people me-1"></i> Referrals</span>
          <router-link to="/app/referrals" class="btn btn-outline-secondary btn-xs">Details</router-link>
        </div>
        <div class="kpi-value">{{ number(memberStats.referrals) }}</div>
        <div class="kpi-subtext text-muted small">Successful sign-ups</div>
      </div>
    </section>

    <!-- ===== MAIN: GAMES (OPEN ONLY) + PRODUCT PREVIEW ===== -->
    <section class="grid grid-main mb-4">
      <!-- ===== Games Panel ===== -->
      <div ref="gamesPanelEl" class="panel card border-0 shadow-sm rounded-4 games-panel" v-reveal>
        <div class="card-body p-0">
          <div class="games-head d-flex align-items-center justify-content-between px-3 px-sm-4 pt-3">
            <h3 class="h6 m-0 d-flex align-items-center gap-2 text-light">
              <i class="bi bi-joystick"></i> Open Mini Games
            </h3>
            <router-link to="/app/minigames" class="btn btn-light btn-sm">See all</router-link>
          </div>

          <!-- Loading / Empty -->
          <div v-if="gamesLoading" class="games-skeleton">
            <div class="gsk gsk-banner"></div>
            <div class="gsk gsk-side" v-for="i in 4" :key="i"></div>
          </div>

          <div v-else-if="openGames.length === 0" class="empty-state text-light py-4">
            <i class="bi bi-emoji-neutral"></i>
            <div>No open games right now.</div>
          </div>

          <!-- ===== Two-column: Feature + Scrollable Side List ===== -->
          <div v-else class="games-layout">
            <!-- FEATURE BANNER -->
            <div
              class="game-banner"
              ref="bannerEl"
              v-tilt
              v-reveal
              v-if="featureGame"
              :key="featureGame?.id"
            >
              <div class="decor"></div>

              <div v-if="featureGame?.imageUrl" class="banner-art">
                <img :src="featureGame.imageUrl" alt="Prize" />
              </div>

              <div class="banner-top">
                <span class="pill"><i class="bi bi-star-fill me-1"></i> Featured</span>
                <span class="cap"><i class="bi bi-people me-1"></i>{{ number(featureGame.player_count) }}/{{ number(featureGame.player_cap) }}</span>
              </div>

              <h4 class="title text-truncate" :title="featureGame.title">
                {{ featureGame.title }}
              </h4>
              <p class="muted">Spin the wheel, grab rewards, and top the board.</p>

              <div class="meta">
                <span class="chip"><i class="bi bi-trophy me-1"></i>{{ peso(featureGame.winner_price) }}</span>
                <span class="chip"><i class="bi bi-clock me-1"></i>{{ dateShort(featureGame.created_at) }}</span>
              </div>

              <div class="progress">
                <span class="bar"><b class="fill" :style="{width: joinPct(featureGame)+'%'}"></b></span>
                <span class="pct">{{ Math.round(joinPct(featureGame)) }}%</span>
              </div>

              <router-link
                :to="{ path: '/app/minigames', query: { focus: featureGame.id } }"
                class="btn btn-play"
              >
                <i class="bi bi-play-fill me-1"></i> View
              </router-link>
            </div>

            <!-- SCROLLABLE SIDE LIST: ALL OTHER OPEN GAMES -->
            <div class="side-wrap">
              <div class="side-list scrollable" ref="sideListEl" :style="{ maxHeight: sideListH + 'px' }">
                <button
                  v-for="g in sideListGames"
                  :key="g.id"
                  type="button"
                  class="side-item"
                  :class="{ active: isSelected(g.id) }"
                  @click="selectFeature(g.id)"
                  :aria-selected="isSelected(g.id)"
                  title="Preview"
                >
                  <div class="icon-slot">
                    <img v-if="g.imageUrl" :src="g.imageUrl" alt="Prize" />
                    <i v-else class="bi bi-controller"></i>
                  </div>
                  <div class="body">
                    <div class="title text-truncate" :title="g.title">{{ g.title }}</div>
                    <div class="tiny">
                      <i class="bi bi-people me-1"></i>{{ number(g.player_count) }}/{{ number(g.player_cap) }}
                      <span class="sep">•</span>
                      <i class="bi bi-trophy me-1"></i>{{ peso(g.winner_price) }}
                    </div>
                  </div>
                  <i class="bi bi-chevron-right caret"></i>
                </button>
              </div>

              <!-- ↓ Floating scroll hints -->
              <div class="side-hint floating" v-if="sideScrollHintVisible" aria-hidden="true">
                <i class="bi bi-arrow-down-short"></i>
              </div>
              <!-- ↑ Floating UP arrow -->
              <div class="side-hint floating up" v-if="sideScrollHintUpVisible" aria-hidden="true">
                <i class="bi bi-arrow-up-short"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Product Preview (Aesthetic slideshow w/ hover, arrows, membership discount) ===== -->
      <div class="panel card border-0 shadow-sm rounded-4" v-reveal style="--i:1">
        <div class="card-body">
          <div class="panel-head">
            <h3 class="h6 m-0 d-flex align-items-center gap-2">
              <i class="bi bi-eye"></i> Product Preview
            </h3>
            <router-link to="/app/shop" class="btn btn-outline-secondary btn-sm">Go to Shop</router-link>
          </div>

          <!-- Skeleton state -->
          <div v-if="productsLoading" class="pp-skeleton">
            <div class="pp-skel-card"></div>
            <div class="pp-skel-dots">
              <span v-for="i in 7" :key="'dsk'+i" class="pp-skel-dot"></span>
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="previewProducts.length === 0" class="empty-state">
            <i class="bi bi-emoji-smile"></i>
            <div>No products to preview right now.</div>
          </div>

          <!-- Preview content -->
          <div
            v-else
            class="pp-wrap"
            @mouseenter="onPPHover"
            @mouseleave="onPPLeave"
          >
            <!-- arrows -->
            <button
              type="button"
              class="pp-nav pp-nav-left"
              @click="prevPreview"
              aria-label="Previous product"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
            <button
              type="button"
              class="pp-nav pp-nav-right"
              @click="nextPreview"
              aria-label="Next product"
            >
              <i class="bi bi-chevron-right"></i>
            </button>

            <!-- Animated card -->
            <transition name="pp-slide-fade" mode="out-in">
              <div
                v-if="currentPreview"
                :key="currentPreview.id"
                class="pp-card glass bg-mode"
              >
                <!-- Background image layer + scrim -->
                <div class="pp-bg" :style="ppBgStyle"></div>
                <div class="pp-scrim"></div>

                <!-- Floating badges (top-left) -->
                <div class="pp-badges">
                  <span class="pp-chip deal" v-if="currentPreview._discount_pct && currentPreview._discount_pct > 0">
                    -{{ number(currentPreview._discount_pct) }}%
                  </span>
                  <span v-if="isAffordable(currentPreview)" class="pp-chip best">Affordable</span>
                </div>

                <!-- Bottom-left overlay (title + prices + view) -->
                <div
                  class="pp-floating"
                  :class="{ 'pp-floating-up': hoverActive }"
                >
                  <h4 class="pp-title-overlay text-truncate" :title="currentPreview?.name">
                    {{ currentPreview?.name }}
                  </h4>
                  <div class="pp-price-overlay">
                    <!-- base price line -->
                    <span class="pp-now">{{ peso(currentPreview?.price_now || 0) }}</span>
                    <span v-if="hasWas(currentPreview)" class="pp-was">{{ peso(currentPreview?.price_was || 0) }}</span>
                    <span v-if="currentPreview?._discount_pct" class="pp-h-off">-{{ number(currentPreview?._discount_pct) }}%</span>
                  </div>
                  <!-- membership discount (always show if any) -->
                  <div
                    v-if="membershipDiscountPct > 0 && currentPreview"
                    class="pp-member-inline"
                  >
                    <span class="pp-h-member-price">{{ peso(memberPrice(currentPreview)) }}</span>
                    <span class="pp-h-member-tag">member {{ membershipDiscountPct }}% off</span>
                  </div>
                  <router-link
                    v-if="currentPreview"
                    :to="{ path: '/app/shop', query: { focus: currentPreview.id } }"
                    class="btn btn-sm btn-primary mt-2 floating-view"
                  >
                    View
                  </router-link>
                </div>

                <!-- Hover overlay (dim, not solid) -->
                <div class="pp-hover" :class="{ 'show': hoverActive }">
                  <!-- FLOATING PRICES (top-right) -->
                  <div class="pp-h-prices">
                    <div class="pp-h-price-line">
                      <span class="pp-now">{{ peso(currentPreview?.price_now || 0) }}</span>
                      <span v-if="hasWas(currentPreview)" class="pp-was">{{ peso(currentPreview?.price_was || 0) }}</span>
                      <span v-if="currentPreview?._discount_pct" class="pp-h-off">-{{ number(currentPreview?._discount_pct) }}%</span>
                    </div>

                    <!-- membership price (optional) -->
                    <div
                      v-if="membershipDiscountPct > 0 && currentPreview"
                      class="pp-h-member-inline"
                    >
                      <span class="pp-h-member-price">{{ peso(memberPrice(currentPreview)) }}</span>
                      <span class="pp-h-member-tag">member {{ membershipDiscountPct }}% off</span>
                    </div>
                  </div>

                  <div class="pp-h-content">
                    <div class="pp-h-title">{{ currentPreview?.name }}</div>
                    <div v-if="currentPreview?.description" class="pp-h-desc">
                      {{ currentPreview?.description }}
                    </div>
                  </div>

                  <!-- View button at bottom when hovered -->
                  <div class="pp-h-actions">
                    <router-link
                      v-if="currentPreview"
                      :to="{ path: '/app/shop', query: { focus: currentPreview.id } }"
                      class="btn btn-primary btn-sm"
                    >
                      View
                    </router-link>
                  </div>
                </div>
              </div>
            </transition>

            <!-- Dot indicators (kept) -->
            <div class="pp-dots">
              <button
                v-for="(p, i) in previewProducts"
                :key="p.id"
                type="button"
                class="pp-dot"
                :class="{ active: i === previewIndex }"
                @click="goToPreview(i)"
                :aria-label="'Preview ' + p.name"
              >
                <div v-if="hoveredDot === i" class="pp-bubble">
                  <div class="pp-b-thumb">
                    <img v-if="p.thumbnail_url" :src="p.thumbnail_url" :alt="p.name" />
                    <div v-else class="pp-b-fallback"><i class="bi bi-image"></i></div>
                  </div>
                  <div class="pp-b-body">
                    <div class="pp-b-title text-truncate" :title="p.name">{{ p.name }}</div>
                    <div class="pp-b-price">
                      <span class="pp-b-now">{{ peso(p.price_now) }}</span>
                      <span v-if="p.price_was && p.price_was > p.price_now" class="pp-b-was">{{ peso(p.price_was) }}</span>
                      <span class="pp-b-off" v-if="p._discount_pct">-{{ number(p._discount_pct) }}%</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== BIG DISCOUNTS ===== -->
    <section class="card border-0 shadow-sm rounded-4" v-reveal>
      <div class="card-body">
        <div class="panel-head">
          <h3 class="h6 m-0 d-flex align-items-center gap-2">
            <i class="bi bi-fire"></i> Big Discounts
          </h3>
          <router-link to="/app/shop" class="btn btn-outline-secondary btn-sm">Go to Shop</router-link>
        </div>

        <div v-if="productsLoading" class="skeleton-scroll">
          <div class="skeleton-prod" v-for="i in 7" :key="'psk'+i"></div>
        </div>

        <div v-else-if="bigDiscounts.length === 0" class="empty-state">
          <i class="bi bi-emoji-smile"></i>
          <div>No big discounts right now.</div>
        </div>

        <div v-else class="products-scroll">
          <div v-for="p in bigDiscounts" :key="p.id" class="prod-card glass" v-tilt>
            <div class="thumb">
              <img v-if="p.thumbnail_url" :src="p.thumbnail_url" :alt="p.name" />
              <div v-else class="thumb-fallback"><i class="bi bi-image"></i></div>
              <div class="off-pill">-{{ number(p._discount_pct) }}%</div>
            </div>
            <div class="pname text-truncate" :title="p.name">{{ p.name }}</div>
            <div class="prices">
              <span class="now">{{ peso(p.price_now) }}</span>
              <span class="was" v-if="p.price_was && p.price_was > p.price_now">{{ peso(p.price_was) }}</span>
            </div>
            <router-link
              :to="{ path: '/app/shop', query: { focus: p.id } }"
              class="btn btn-sm btn-outline-secondary w-100 mt-2"
            >
              View
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { currentUser } from '@/lib/authState'

/* ------- Auth / Router -------- */
const router = useRouter()
const user = computed(() => currentUser.value)

/* ------- Tier Icons -------- */
type TierKey = 'regular' | 'silver' | 'gold' | 'platinum' | 'diamond'
const tiers = [
  { key: 'regular', name: 'Regular Member' },
  { key: 'silver', name: 'Silver Member' },
  { key: 'gold', name: 'Gold Member' },
  { key: 'platinum', name: 'Platinum Member' },
  { key: 'diamond', name: 'Diamond Member' },
] as const

const ICON_BASE = '/img/tiers/'
const iconFor = (key: TierKey) => ({
  regular: ICON_BASE + 'regular.png',
  silver: ICON_BASE + 'silver.png',
  gold: ICON_BASE + 'gold.png',
  platinum: ICON_BASE + 'platinum.png',
  diamond: ICON_BASE + 'diamond.png'
} as Record<TierKey,string>)[key] || ''

const memberTier = ref<TierKey>('regular')
const currentTier = computed(() => tiers.find(t => t.key === memberTier.value) ?? tiers[0])

/** dynamic signed icon if available; fallback to static asset */
const badgeIconSigned = ref<string | null>(null)
const badgeIcon = computed(() => badgeIconSigned.value || iconFor(currentTier.value.key as TierKey))

/* ------- Member stats / balances -------- */
const memberStats = ref({ lifetimePurchases: 0, referrals: 0 })
const ewallet = ref({ balance: 0 })
const credits = ref({ balance: 0 })
/** From public.users.purchases_per_month */
const purchasesPerMonth = ref(0)

/* ====== Membership discount per purchase (from membership.tiers) ====== */
const membershipDiscountPct = ref(0)

/* ------- Games (OPEN ONLY) -------- */
type GameRow = {
  id: string
  title: string
  player_count: number
  player_cap: number
  status: string
  winner_price: number
  product_id?: string | null
  imageUrl?: string | null
  created_at?: string
}
const allGames = ref<GameRow[]>([])
const gamesLoading = ref(true)
const selectedGameId = ref<string | null>(null)

const openGames = computed(() =>
  allGames.value.filter(g => (g.status || '').toLowerCase() === 'open')
)
const featureGame = computed<GameRow | null>(() => {
  const fromSel = selectedGameId.value
    ? openGames.value.find(g => g.id === selectedGameId.value)
    : null
  return fromSel || openGames.value[0] || null
})
const sideListGames = computed(() => {
  const fid = featureGame.value?.id
  return openGames.value.filter(g => g.id !== fid)
})
function isSelected(id: string) {
  return (selectedGameId.value ? selectedGameId.value : openGames.value[0]?.id) === id
}

/* ------- Orders updates (kept) -------- */
type OrderRow = {
  id: string
  status: string
  total_amount?: number | null
  created_at?: string
  updated_at?: string
  order_no?: string | null
  ref_code?: string | null
}
const orderUpdates = ref<OrderRow[]>([])
const ordersLoading = ref(true)

/* ------- Product cards (shared shape for preview + discounts) -------- */
type ProdRow = {
  id: string
  name: string
  price_now: number
  price_was: number | null
  thumbnail_url?: string | null
  _discount_pct: number
  description?: string | null
}

/* ------ Big Discounts ------ */
const bigDiscounts = ref<ProdRow[]>([])
const productsLoading = ref(true)

/* ------ Published Products for Preview ------ */
const publishedPreview = ref<ProdRow[]>([])

/* ------- Product Preview state -------- */
const previewIndex = ref(0)
const hoveredDot = ref<number | null>(null)
/** Prefer published products; fallback to bigDiscounts */
const previewProducts = computed<ProdRow[]>(() => {
  return (publishedPreview.value.length ? publishedPreview.value : bigDiscounts.value).slice(0, 12)
})
const currentPreview = computed<ProdRow | null>(() => previewProducts.value[previewIndex.value] || null)
watch(previewProducts, () => { previewIndex.value = 0 })

/* ===== Hover / Autoplay for product preview ===== */
const hoverActive = ref(false)
let hoverTimer: number | null = null

function clearHoverTimer() {
  if (hoverTimer) {
    window.clearTimeout(hoverTimer)
    hoverTimer = null
  }
}
function scheduleNext() {
  clearHoverTimer()
  hoverTimer = window.setTimeout(() => {
    nextPreview()
    scheduleNext()
  }, 5000) // 5 seconds
}
function onPPHover() {
  hoverActive.value = true
  scheduleNext()
}
function onPPLeave() {
  hoverActive.value = false
  clearHoverTimer()
}

function goToPreview(i: number) {
  previewIndex.value = i
}
function nextPreview() {
  if (previewProducts.value.length === 0) return
  previewIndex.value = (previewIndex.value + 1) % previewProducts.value.length
}
function prevPreview() {
  if (previewProducts.value.length === 0) return
  previewIndex.value =
    (previewIndex.value - 1 + previewProducts.value.length) % previewProducts.value.length
}

/* ------- Utils -------- */
const peso = (n: number | null | undefined) =>
  `₱${Number(n ?? 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`
const number = (n: number | string | null | undefined) =>
  Number(n ?? 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })
const dateShort = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}
const shortId = (o: OrderRow) => o.order_no || o.ref_code || (o.id ? ('#' + String(o.id).slice(0, 6)) : '#—')

const statusClass = (s: string) => {
  switch ((s || '').toLowerCase()) {
    case 'open': return 'st-open'
    case 'locked': return 'st-locked'
    case 'spun': return 'st-spun'
    case 'settled': return 'st-settled'
    case 'cancelled': return 'st-cancelled'
    default: return 'st-draft'
  }
}
const orderStatusClass = (s: string) => {
  switch ((s || '').toLowerCase()) {
    case 'pending': return 'dot-pending'
    case 'approved':
    case 'paid': return 'dot-paid'
    case 'shipped': return 'dot-shipped'
    case 'completed':
    case 'delivered': return 'dot-completed'
    case 'cancelled':
    case 'refunded': return 'dot-cancelled'
    default: return 'dot-default'
  }
}
function joinPct(g: GameRow) {
  const cap = Math.max(1, Number(g.player_cap || 0))
  const cnt = Math.min(cap, Number(g.player_count || 0))
  return (cnt / cap) * 100
}

/* ======== helpers for Product Preview ======== */
function hasWas(p?: ProdRow | null) {
  if (!p) return false
  return !!p.price_was && p.price_was > p.price_now
}
function savings(p?: ProdRow | null) {
  if (!p) return 0
  return p.price_was && p.price_was > p.price_now ? (p.price_was - p.price_now) : 0
}
/** Simple "affordable" heuristic */
function isAffordable(p?: ProdRow | null) {
  if (!p) return false
  return (p._discount_pct >= 40) || (p.price_now <= 500)
}

/* membership-based discounted price */
function memberPrice(p: ProdRow): number {
  const base = Number(p.price_now ?? 0)
  const pct = Number(membershipDiscountPct.value ?? 0)
  if (!pct || pct <= 0) return base
  const disc = base * (pct / 100)
  return Math.max(0, Math.round((base - disc) * 100) / 100)
}

/* ================= IMAGE FETCHING PIPELINE ================= */
const PRIZE_BUCKET = 'prize_product'
const PRIZE_ROOT   = 'products'

function isImageByName(name: string | undefined | null) {
  if (!name) return false
  return /\.(png|jpe?g|webp|gif|bmp|heic|avif)$/i.test(name)
}
async function firstImagePathForProduct(productId: string): Promise<string | null> {
  try {
    const dir = `${PRIZE_ROOT}/${productId}`
    const { data: files, error: listErr } = await supabase
      .storage.from(PRIZE_BUCKET)
      .list(dir, { limit: 10 })

    if (listErr || !files || files.length === 0) return null

    const candidate =
      files.find((f: any) => (f?.metadata?.mimetype || '').startsWith('image/')) ||
      files.find((f: any) => isImageByName(f?.name)) ||
      files[0]

    if (!candidate?.name) return null
    return `${dir}/${candidate.name}`
  } catch {
    return null
  }
}
async function signedUrlWithCB(bucket: string, path: string, expiresIn = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) return null
  const url = data?.signedUrl ?? null
  return url ? `${url}&cb=${Date.now()}` : null
}
async function attachProductImages(list: ProdRow[]) {
  if (!list || !list.length) return
  await Promise.all(
    list.map(async (p) => {
      const path = await firstImagePathForProduct(p.id)
      const signed = path ? await signedUrlWithCB(PRIZE_BUCKET, path) : null
      p.thumbnail_url = signed || p.thumbnail_url || null
    })
  )
}
async function attachPrizeImages(list: GameRow[]) {
  if (!list || list.length === 0) return
  await Promise.all(
    list.map(async (ev) => {
      if (!ev?.product_id) {
        ev.imageUrl = null
        return
      }
      const path = await firstImagePathForProduct(ev.product_id)
      ev.imageUrl = path ? await signedUrlWithCB(PRIZE_BUCKET, path) : null
    })
  )
}

/* ---------------- Fetchers ---------------- */
async function ensureAuthed() {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      await router.push({ name: 'login' })
      return false
    }
  }
  return true
}

/** Existing profile/tier fetch (kept) */
async function fetchProfileAndTier() {
  try {
    const uid = user.value?.id
    if (!uid) return

    let { data, error } = await supabase
      .from('profiles')
      .select('tier_key, ewallet_balance, discount_credit_balance, referrals, lifetime_purchases')
      .eq('id', uid)
      .single()

    if (error) {
      const fb = await supabase
        .from('member')
        .select('tier_key, ewallet_balance, discount_credit_balance, referral_count, lifetime_purchases')
        .eq('user_id', uid)
        .single()
      if (!fb.error) {
        data = {
          tier_key: fb.data?.tier_key,
          ewallet_balance: fb.data?.ewallet_balance,
          discount_credit_balance: fb.data?.discount_credit_balance,
          referrals: fb.data?.referral_count,
          lifetime_purchases: fb.data?.lifetime_purchases
        } as any
      }
    }

    const tk = (data as any)?.tier_key as TierKey | undefined
    if (tk && ['regular','silver','gold','platinum','diamond'].includes(tk)) {
      memberTier.value = tk
    }

    ewallet.value.balance = Number((data as any)?.ewallet_balance ?? 0)
    credits.value.balance = Number((data as any)?.discount_credit_balance ?? 0)
    memberStats.value = {
      lifetimePurchases: Number((data as any)?.lifetime_purchases ?? 0),
      referrals: Number((data as any)?.referrals ?? 0)
    }
  } catch (e) {
    console.warn('[profile/tier] fallback', e)
  }
}

/** Pull balances & purchases_per_month from public.users */
async function fetchUserWalletAndPurchases() {
  try {
    let uid = user.value?.id
    if (!uid) {
      const { data } = await supabase.auth.getUser()
      uid = data.user?.id
      if (!uid) return
    }

    const { data, error } = await supabase
      .from('users')
      .select('balance, discount_credits, purchases_per_month')
      .eq('id', uid)
      .maybeSingle()

    if (!error && data) {
      ewallet.value.balance = Number(data.balance ?? 0)
      credits.value.balance = Number(data.discount_credits ?? 0)
      purchasesPerMonth.value = Number(data.purchases_per_month ?? 0)
    }
  } catch {}
}

/** referral count via referral_stats view */
async function fetchReferralCount() {
  try {
    let uid = user.value?.id
    if (!uid) {
      const { data } = await supabase.auth.getUser()
      uid = data.user?.id
      if (!uid) return
    }

    const { data: refRow, error } = await supabase
      .from('referral_stats')
      .select('referrals_count')
      .eq('referrer_id', uid)
      .maybeSingle()

    if (!error) {
      memberStats.value.referrals = Number(refRow?.referrals_count ?? 0)
    }
  } catch {}
}

function mapEventRow(row: any): GameRow {
  return {
    id: row.id,
    title: String(row.title ?? 'Untitled'),
    player_count: Number(row.player_count ?? 0),
    player_cap: Number(row.player_cap ?? 0),
    status: String(row.status ?? 'draft'),
    winner_price: Number(row.winner_refund_amount ?? row.winner_price ?? 0),
    product_id: row.product_id ?? null,
    imageUrl: null,
    created_at: row.created_at
  }
}
async function fetchOpenGames() {
  gamesLoading.value = true
  try {
    let { data, error } = await supabase
      .schema('games')
      .from('event')
      .select('id,title,player_count,player_cap,status,winner_refund_amount,product_id,created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(60)

    if (error) {
      const fb = await supabase
        .from('event')
        .select('id,title,player_count,player_cap,status,winner_refund_amount,product_id,created_at')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(60)
      if (!fb.error) data = fb.data
    }

    allGames.value = (data ?? []).map(mapEventRow)
    await attachPrizeImages(allGames.value)

    if (!selectedGameId.value) selectedGameId.value = openGames.value[0]?.id ?? null
  } catch {
    allGames.value = []
  } finally {
    gamesLoading.value = false
  }
}
/** kept (no UI) */
async function fetchOrderUpdates() {
  ordersLoading.value = true
  try {
    const uid = user.value?.id
    if (!uid) { orderUpdates.value = []; return }

    let { data, error } = await supabase
      .from('purchases')
      .select('id,status,total_amount,created_at,updated_at,order_no,ref_code,user_id')
      .eq('user_id', uid)
      .order('updated_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) {
      const fb = await supabase
        .from('orders')
        .select('id,status,total_amount,created_at,updated_at,order_no,ref_code,user_id')
        .eq('user_id', uid)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(8)
      if (!fb.error) data = fb.data
    }

    orderUpdates.value = (data ?? []) as OrderRow[]
  } catch {
    orderUpdates.value = []
  } finally {
    ordersLoading.value = false
  }
}
function computeDiscountPct(now: number, was?: number | null, pct?: number | null) {
  if (pct != null) return Math.round(Number(pct))
  if (!was || was <= 0) return 0
  return Math.max(0, Math.round(100 - (Number(now) / Number(was)) * 100))
}
async function fetchBigDiscounts() {
  productsLoading.value = true
  try {
    let { data, error } = await supabase
      .schema('games')
      .from('products')
      .select('id,name,price,original_price,discount_pct,thumbnail_url,is_active')
      .eq('is_active', true)
      .limit(60)

    if (error) {
      const fb = await supabase
        .schema('games')
        .from('products')
        .select('id,name,price_now,price_was,discount_pct,thumbnail_url,is_active')
        .eq('is_active', true)
        .limit(60)
      if (!fb.error) data = fb.data as any[]
    }

    const rows = (data ?? []).map((r: any) => {
      const price_now = Number(r.price_now ?? r.price ?? 0)
      const price_was = r.price_was ?? r.original_price ?? null
      const pct = computeDiscountPct(price_now, price_was, r.discount_pct)
      return {
        id: r.id,
        name: String(r.name ?? 'Unnamed'),
        price_now,
        price_was: price_was ? Number(price_was) : null,
        thumbnail_url: r.thumbnail_url ?? null,
        _discount_pct: pct,
        description: null
      } as ProdRow
    })

    await attachProductImages(rows)

    bigDiscounts.value = rows.filter(r => r._discount_pct >= 30)
                             .sort((a,b) => b._discount_pct - a._discount_pct)
                             .slice(0, 14)
  } catch {
    bigDiscounts.value = []
  } finally {
    productsLoading.value = false
  }
}

/* ---------- PUBLISHED PRODUCTS PREVIEW ---------- */
async function fetchPublishedProductsForPreview() {
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('products')
      .select('id,name,description,price,product_url,ispublish,stock,created_at')
      .eq('ispublish', true)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) throw error

    const mapped: ProdRow[] = (data || []).map((r: any) => {
      const priceNum = typeof r.price === 'string' ? parseFloat(r.price) : Number(r.price ?? 0)
      let thumb: string | null = null
      if (Array.isArray(r.product_url)) thumb = r.product_url[0] ?? null
      else if (typeof r.product_url === 'string' && r.product_url.trim() !== '') thumb = r.product_url
      return {
        id: r.id,
        name: String(r.name ?? 'Unnamed Product'),
        price_now: Number.isFinite(priceNum) ? priceNum : 0,
        price_was: null,
        thumbnail_url: thumb,
        _discount_pct: 0,
        description: typeof r.description === 'string' ? r.description : null
      }
    })

    await attachProductImages(mapped)

    publishedPreview.value = mapped
  } catch (err) {
    console.error('[preview products] load failed:', err)
    publishedPreview.value = []
  }
}

/* --------- Dynamic Tier: load user's membership + signed icon + discount --------- */
function nameToKey(name: string): TierKey {
  const k = (name || '').toLowerCase()
  if (k.includes('silver')) return 'silver'
  if (k.includes('gold')) return 'gold'
  if (k.includes('platinum')) return 'platinum'
  if (k.includes('diamond')) return 'diamond'
  return 'regular'
}

const TIER_ICON_BUCKET = 'tier_icons'
async function signedUrlOrNullTierIcon(path: string | null | undefined): Promise<string | null> {
  try {
    const p = (path || '').replace(/^\/+/, '')
    if (!p) return null
    const { data, error } = await supabase.storage.from(TIER_ICON_BUCKET).createSignedUrl(p, 3600)
    if (error) return null
    return data?.signedUrl || null
  } catch {
    return null
  }
}

async function loadLiveTiersAndUser() {
  try {
    const { data: tiersData } = await supabase
      .schema('membership')
      .from('tiers')
      .select('id,membership_name,icon_url,discount_per_purchase')

    const byId: Record<string, any> = {}
    for (const r of (tiersData ?? [])) byId[r.id] = r

    let uid = user.value?.id
    if (!uid) {
      const { data } = await supabase.auth.getUser()
      uid = data.user?.id
      if (!uid) return
    }

    const { data: urow } = await supabase
      .from('users')
      .select('membership_id')
      .eq('id', uid)
      .maybeSingle()

    const memId = urow?.membership_id
    if (!memId || !byId[memId]) {
      badgeIconSigned.value = null
      membershipDiscountPct.value = 0
      return
    }

    const tierRow = byId[memId]
    memberTier.value = nameToKey(tierRow.membership_name || 'regular')
    badgeIconSigned.value = await signedUrlOrNullTierIcon(tierRow.icon_url)
    membershipDiscountPct.value = Number(tierRow.discount_per_purchase ?? 0)
  } catch {}
}

/* ------- Realtime ------- */
let chGames: any = null
let chOrders: any = null
let chProducts: any = null
let chUser: any = null
let chReferrals: any = null
let chPubProducts: any = null

function startRealtime() {
  try {
    chGames = supabase
      .channel('rt:games.event:open-only')
      .on(
        'postgres_changes',
        { event: '*', schema: 'games', table: 'event', filter: 'status=eq.open' },
        async () => { await fetchOpenGames() }
      )
      .subscribe()

    chProducts = supabase
      .channel('rt:games.products')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'games', table: 'products' },
        async (payload: any) => {
          const prodId = payload?.new?.id as string | undefined
          if (!prodId) return
          const affectedEvents = allGames.value.filter(e => e.product_id === prodId)
          await attachPrizeImages(affectedEvents)

          const affectedPreview = publishedPreview.value.filter(p => p.id === prodId)
          await attachProductImages(affectedPreview)
        }
      )
      .subscribe()

    chPubProducts = supabase
      .channel('rt:games.products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'games', table: 'products' },
        () => fetchPublishedProductsForPreview()
      )
      .subscribe()
  } catch {}

  try {
    if (user.value?.id) {
      chOrders = supabase
        .channel(`rt:purchases:${user.value.id}`)
        .on('postgres_changes', { event: '*', schema: 'games', table: 'purchases', filter: `user_id=eq.${user.value.id}` }, () => fetchOrderUpdates())
        .subscribe()

      chUser = supabase
        .channel(`rt:users:${user.value.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${user.value.id}` }, () => fetchUserWalletAndPurchases())
        .subscribe()

      chReferrals = supabase
        .channel(`rt:referrals:${user.value.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `referred_by=eq.${user.value.id}` }, () => fetchReferralCount())
        .subscribe()
    }
  } catch {}
}

/* ------- Feature selection / UI helpers ------- */
const gamesPanelEl = ref<HTMLElement | null>(null)
function selectFeature(id: string) {
  selectedGameId.value = id
  gamesPanelEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
watch(openGames, () => {
  if (!openGames.value.find(g => g.id === selectedGameId.value)) {
    selectedGameId.value = openGames.value[0]?.id ?? null
  }
})

/* ------- Side list height sync to banner ------- */
const bannerEl = ref<HTMLElement | null>(null)
const sideListH = ref(320)
let roBanner: ResizeObserver | null = null
function syncSideListHeight() {
  const h = bannerEl.value?.offsetHeight || 320
  sideListH.value = Math.max(240, Math.round(h))
  updateSideScrollHint()
}

/* ------- Scroll hint state for side list ------- */
const sideListEl = ref<HTMLElement | null>(null)
const sideScrollHintVisible = ref(false)
const sideScrollHintUpVisible = ref(false)

function updateSideScrollHint() {
  const el = sideListEl.value
  if (!el) { 
    sideScrollHintVisible.value = false
    sideScrollHintUpVisible.value = false
    return
  }
  const canScroll = el.scrollHeight - el.clientHeight > 4
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
  const atTop = el.scrollTop <= 4

  sideScrollHintVisible.value = canScroll && !atBottom
  sideScrollHintUpVisible.value = canScroll && atBottom && !atTop
}

/* ------- Simple animation directives ------- */
const vReveal = {
  mounted(el: HTMLElement) {
    el.classList.add('reveal-init')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          el.style.transitionDelay = `${(Number(getComputedStyle(el).getPropertyValue('--i') || 0) * 60)}ms`
          el.classList.add('reveal-in')
          io.unobserve(el)
        }
      })
    }, { threshold: 0.12 })
    io.observe(el)
    ;(el as any)._io = io
  },
  unmounted(el: HTMLElement) { (el as any)._io?.disconnect?.() }
}
const vTilt = {
  mounted(el: HTMLElement) {
    el.style.transformStyle = 'preserve-3d'
    el.style.perspective = '900px'
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const rx = ((y / rect.height) - 0.5) * -6
      const ry = ((x / rect.width) - 0.5) * 6
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`
    }
    const onLeave = () => {
      el.style.transition = 'transform .25s ease'
      el.style.transform = 'rotateX(0) rotateY(0)'
      setTimeout(() => (el.style.transition = ''), 260)
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    ;(el as any)._tiltMove = onMove
    ;(el as any)._tiltLeave = onLeave
  },
  unmounted(el: HTMLElement) {
    el.removeEventListener('mousemove', (el as any)._tiltMove)
    el.removeEventListener('mouseleave', (el as any)._tiltLeave)
  }
}

/* ------- Lifecycle ------- */
onMounted(async () => {
  const ok = await ensureAuthed()
  if (!ok) return

  await Promise.all([
    fetchProfileAndTier(),
    fetchOpenGames(),
    fetchOrderUpdates(),
    fetchBigDiscounts(),
    fetchPublishedProductsForPreview()
  ])

  await Promise.all([
    fetchUserWalletAndPurchases(),
    fetchReferralCount()
  ])

  await loadLiveTiersAndUser()
  startRealtime()

  await nextTick()
  syncSideListHeight()
  if ('ResizeObserver' in window && bannerEl.value) {
    roBanner = new ResizeObserver(syncSideListHeight)
    roBanner.observe(bannerEl.value)
  }
  window.addEventListener('resize', syncSideListHeight)

  if (sideListEl.value) {
    sideListEl.value.addEventListener('scroll', updateSideScrollHint)
    updateSideScrollHint()
  }
})

watch([openGames, selectedGameId], async () => {
  await nextTick()
  updateSideScrollHint()
})

onBeforeUnmount(() => {
  clearHoverTimer()
  if (chGames) supabase.removeChannel(chGames)
  if (chOrders) supabase.removeChannel(chOrders)
  if (chProducts) supabase.removeChannel(chProducts)
  if (chUser) supabase.removeChannel(chUser)
  if (chReferrals) supabase.removeChannel(chReferrals)
  if (chPubProducts) supabase.removeChannel(chPubProducts)
  roBanner?.disconnect?.()
  window.removeEventListener('resize', syncSideListHeight)
  if (sideListEl.value) sideListEl.value.removeEventListener('scroll', updateSideScrollHint)
})

/* ===== New: reactive style for background image ===== */
const ppBgStyle = computed(() => {
  const url = currentPreview.value?.thumbnail_url
  return url ? { backgroundImage: `url('${url}')` } : {}
})
</script>

<style scoped>
/* ===== Base ===== */
.dash { padding: 1.25rem 0 2rem; }

/* ===== Glass & Neon helpers ===== */
.glass { background: rgba(255,255,255,0.78); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); border: 1px solid rgba(230,236,245,0.9); }
.neon { position: relative; }
.neon::after{
  content:""; position:absolute; inset:-1px; border-radius:inherit; pointer-events:none;
  background: radial-gradient(120px 60px at 15% -10%, rgba(34,197,94,.22), transparent 60%),
              radial-gradient(140px 70px at 110% 110%, rgba(59,130,246,.22), transparent 60%);
  filter: saturate(0.9); opacity:.7;
}

/* ===== Hero ===== */
.hero { overflow: hidden; position: relative; }
.tier-icon{ width:60px; height:60px; border-radius:16px; overflow:hidden; background:linear-gradient(180deg,#f7fafc,#eef2f7); display:grid; place-items:center; border:1px solid #e9eef3; box-shadow:0 8px 30px rgba(0,0,0,.06);}
.tier-icon img{ width:100%; height:100%; object-fit:contain; }
.tier-fallback i{ font-size:1.4rem; color:#64748b; }
.quick-actions{ display:flex; gap:8px; flex-wrap:wrap; }
.qchip{ display:inline-flex; align-items:center; gap:.5rem; padding:.5rem .8rem; border-radius:999px; border:1px solid #e9eef3; background:#fff; font-weight:600; text-decoration:none; color:#0f172a; transition: transform .1s ease, box-shadow .1s ease, background-color .15s ease; }
.qchip:hover{ transform: translateY(-1px); box-shadow:0 6px 18px rgba(0,0,0,.06); background:#f9fafb; }
.hero-grid{ position:absolute; inset:0; pointer-events:none; opacity:.8; background:
  radial-gradient(120% 70% at 15% -10%, rgba(34,197,94,.12), transparent 60%),
  radial-gradient(120% 70% at 110% 110%, rgba(59,130,246,.12), transparent 60%),
  linear-gradient(transparent 29px, rgba(15,23,42,.06) 30px),
  linear-gradient(90deg, transparent 29px, rgba(15,23,42,.06) 30px);
  background-size:auto,auto,30px 30px,30px 30px; animation:grid-pan 10s linear infinite;}
@keyframes grid-pan{0%{background-position:0 0,0 0,0 0,0 0;}100%{background-position:0 0,0 0,120px 120px,-120px -120px;}}

/* ===== KPIs ===== */
.grid-quick{ display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
@media (max-width: 992px){ .grid-quick{ grid-template-columns:repeat(2,1fr);} }
@media (max-width: 576px){ .grid-quick{ grid-template-columns:1fr;} }
.kpi-card{ border-radius:16px; padding:16px; box-shadow:0 8px 30px rgba(0,0,0,.04); }
.kpi-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.kpi-head .label{ font-weight:700; color:#0f172a; letter-spacing:.2px; }
.kpi-value{ font-size:1.55rem; font-weight:800; letter-spacing:.2px; }
.kpi-subtext{ margin-top:-2px; }

/* ===== Main Split ===== */
.grid-main{ display:grid; gap:14px; grid-template-columns: 1.35fr .65fr; }
@media (max-width: 992px){ .grid-main{ grid-template-columns:1fr; } }
.panel .card-body{ padding:16px; }
.panel-head{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-bottom:.75rem; }

/* =================================================================== */
/* =======================  GAMES: PICTURE STYLE  ===================== */
/* =================================================================== */
.games-panel{
  --gp-bg:#3b1f1f; --gp-card:#4a2626; --gp-edge:#5a2e2e; --gp-ink:#fff; --gp-muted:#e9d6d6;
  background: radial-gradient(120% 100% at 10% 0%, #5a2e2e, #3b1f1f 60%) !important;
  color: var(--gp-ink);
}
.games-head .btn{ --bs-btn-bg:#ffffff22; --bs-btn-border-color:#ffffff33; color:#fff; }
.games-layout{
  display:grid; grid-template-columns: 1.4fr .8fr; gap: 14px; padding: 10px 12px 14px 12px;
}
@media (max-width: 992px){ .games-layout{ grid-template-columns:1fr; } }

/* Banner */
.game-banner{
  position:relative; border-radius:20px; padding:18px; min-height:240px;
  background: linear-gradient(135deg,#ff6b6b33,#ffb86c33), radial-gradient(120% 120% at 20% 10%, #ff8f8f55, transparent 60%);
  border:1px solid #ffffff22; box-shadow: 0 18px 40px rgba(0,0,0,.25) inset, 0 10px 30px rgba(0,0,0,.2);
  overflow:hidden; color:#fff;
}
.game-banner .decor{
  position:absolute; inset:-4px; background:
    radial-gradient(220px 120px at 80% 10%, #7c4dff55, transparent 60%),
    radial-gradient(220px 120px at 0% 100%, #22d3ee55, transparent 60%);
  pointer-events:none;
}
.banner-art{
  position:absolute; right:0; bottom:0; top:0; width:48%; mix-blend-mode:normal;
  mask-image: linear-gradient(to left, rgba(0,0,0,.9), rgba(0,0,0,.2));
}
.banner-art img{ width:100%; height:100%; object-fit:cover; filter:saturate(1.05) contrast(1.05); }
.banner-top{ display:flex; justify-content:space-between; align-items:center; position:relative; z-index:1; }
.pill{ background:#ffffff1f; border:1px solid #ffffff33; padding:.25rem .6rem; border-radius:999px; font-weight:800; font-size:.8rem; }
.cap{ font-weight:800; }
.game-banner .title{ position:relative; z-index:1; font-size:1.6rem; font-weight:900; margin:.5rem 0 0; letter-spacing:.3px; text-shadow:0 2px 12px rgba(0,0,0,.35); }
.game-banner .muted{ position:relative; z-index:1; margin:.25rem 0 .5rem; opacity:.9; }
.game-banner .meta{ position:relative; z-index:1; display:flex; gap:.5rem; flex-wrap:wrap; }
.game-banner .chip{
  background:#ffffff14; border:1px solid #ffffff2e; color:#fff; padding:.2rem .6rem; border-radius:999px; font-weight:700; font-size:.9rem;
}
.game-banner .progress{ position:relative; z-index:1; display:flex; align-items:center; gap:8px; margin-top:.5rem; }
.game-banner .bar{ flex:1; height:10px; border-radius:999px; background:#ffffff1a; border:1px solid #ffffff2e; overflow:hidden; }
.game-banner .fill{ display:block; height:100%; background: linear-gradient(90deg, #34d399, #10b981); }
.game-banner .pct{ font-weight:900; position:relative; z-index:1; }
.btn-play{
  position:relative; z-index:1; margin-top:.7rem; font-weight:900; letter-spacing:.2px; color:#3b1f1f; background:#fff; border:0; border-radius:999px; padding:.5rem 1rem;
  box-shadow: 0 10px 24px rgba(255,255,255,.2), 0 6px 16px rgba(0,0,0,.25);
}

/* Side list wrapper so hint can float below/above */
.side-wrap{ position: relative; overflow: visible; }

.side-list{
  display:flex; flex-direction:column; gap:10px;
  overflow-y:auto; overscroll-behavior:contain;
  padding-right:2px;
  -ms-overflow-style: none; scrollbar-width: none;
}
.side-list::-webkit-scrollbar{ width:0; height:0; }

.side-item{
  appearance:none; border:0; background: var(--gp-card); color:#fff; text-align:left; width:100%;
  display:grid; grid-template-columns: 42px 1fr 20px; align-items:center; gap:10px;
  border-radius:16px; padding:10px; box-shadow: 0 12px 28px rgba(0,0,0,.18);
  border:1px solid #ffffff22; cursor:pointer; transition: transform .08s ease, box-shadow .12s ease, border-color .12s ease;
}
.side-item:hover{ transform: translateY(-1px); box-shadow: 0 14px 32px rgba(0,0,0,.22); }
.side-item.active{ border-color:#ffffff66; box-shadow: 0 16px 36px rgba(0,0,0,.25); }
.icon-slot{
  width:42px; height:42px; border-radius:12px; display:grid; place-items:center; overflow:hidden;
  background: linear-gradient(135deg,#ff9f9f33,#c084fc33); border:1px solid #ffffff22;
}
.icon-slot img{ width:100%; height:100%; object-fit:cover; }
.icon-slot i{ font-size:1.1rem; color:#fff; }

.side-item .body{ min-width:0; }
.side-item .title{
  font-weight:800; white-space: nowrap; overflow:hidden; text-overflow: ellipsis;
}
.side-item .tiny{ font-size:.85rem; opacity:.9; }
.side-item .sep{ opacity:.6; margin:0 .35rem; }
.side-item .caret{ opacity:.8; }

.side-hint{ display:grid; place-items:center; opacity:.9; pointer-events:none; }
.side-hint i{ font-size:1.25rem; animation: bob 1.2s infinite; text-shadow: 0 2px 8px rgba(0,0,0,.35); }
.side-hint.floating{ position:absolute; left:50%; transform: translateX(-50%); bottom:-12px; z-index:2; }
.side-hint.floating.up{ top:-12px; bottom:auto; }
.side-hint.up i{ animation: bob-up 1.2s infinite; }
@keyframes bob{ 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(3px); } }
@keyframes bob-up{ 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-3px); } }

/* ===== Product Preview ===== */
.pp-skeleton{ display:grid; gap:12px; }
.pp-skel-card{ height:210px; border-radius:16px; background:linear-gradient(90deg,#f1f5f9,#e2e8f0,#f1f5f9); background-size:200% 100%; animation: sk 1.2s linear infinite; }
.pp-skel-dots{ display:flex; gap:10px; justify-content:center; }
.pp-skel-dot{ width:10px; height:10px; border-radius:999px; background:#e2e8f0; }
@keyframes sk{ 0%{background-position:0% 0} 100%{background-position:200% 0} }

.pp-wrap{ position:relative; display:block; min-height: 320px; }

/* nav arrows */
.pp-nav{
  position:absolute;
  top:50%;
  transform: translateY(-50%);
  width:30px; height:30px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.45);
  background:rgba(15,23,42,.1);
  backdrop-filter: blur(6px);
  display:grid; place-items:center;
  z-index:30;
  color:#fff;
  cursor:pointer;
  transition: opacity .2s ease, transform .2s ease;
  opacity:.6;
}
.pp-nav:hover{ opacity:1; transform: translateY(-50%) scale(1.02); }
.pp-nav-left{ left:8px; }
.pp-nav-right{ right:8px; }

/* Base card layout kept */
.pp-card{
  position: relative;
  display:block;
  padding:0;
  border-radius:16px;
  border:1px solid rgba(233,238,243,.35);
  background:rgba(255,255,255,.9);
  transition: transform .15s ease, box-shadow .15s ease;
  min-height: 320px;
  overflow:hidden;
}
.pp-card.glass:hover{ transform: translateY(-2px) scale(1.01); box-shadow: 0 12px 28px rgba(0,0,0,.08); }

.pp-card.bg-mode .pp-bg{
  position:absolute; inset:0; background-size:cover; background-position:center;
  background-repeat:no-repeat;
  z-index:0;
}
.pp-card.bg-mode .pp-scrim{
  position:absolute; inset:0; z-index:1;
  background: linear-gradient(to top,
    rgba(0,0,0,.62) 0%,
    rgba(0,0,0,.45) 35%,
    rgba(0,0,0,.22) 60%,
    rgba(0,0,0,0) 100%);
}
.pp-card.bg-mode .pp-badges{
  position:absolute; top:12px; left:12px; z-index:3; display:flex; gap:6px;
}
.pp-card.bg-mode .pp-floating{
  position:absolute; left:12px; right:12px; bottom:12px; z-index:2;
  color:#fff; text-shadow:0 1px 8px rgba(0,0,0,.45);
  display:flex; flex-direction:column; gap:6px;
  transition: transform .35s ease, opacity .35s ease;
}
.pp-floating-up{
  transform: translateY(-24px);
}
.pp-title-overlay{ font-weight:900; font-size:1.15rem; letter-spacing:.2px; }
.pp-price-overlay{ display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.pp-card.bg-mode .pp-now{ color:#fff; font-weight:900; }
.pp-card.bg-mode .pp-was{ color:#e2e8f0; opacity:.95; text-decoration: line-through; }
.pp-card.bg-mode .pp-h-off{ color:#fde047; }

/* membership mini line (non-hover) */
.pp-member-inline{
  background: rgba(15,23,42,.3);
  border: 1px solid rgba(148,163,184,.45);
  border-radius: .6rem;
  padding: .25rem .65rem;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  width: fit-content;
}
.pp-h-member-price{ font-weight:700; color:#fef9c3; font-size:.7rem; }
.pp-h-member-tag{ font-size:.6rem; color:rgba(248,250,252,.7); }

/* Hide original inner layout when in bg-mode */
.pp-card.bg-mode .pp-thumb,
.pp-card.bg-mode .pp-body{ display:none !important; }

/* Hover overlay (dim) */
.pp-hover{
  position:absolute; inset:0; border-radius:16px;
  background: rgba(5,10,12,0.25);
  border:1px solid rgba(233,238,243,0.12);
  opacity:0; transform: translateY(6px) scale(.995);
  transition: opacity .25s ease, transform .25s ease;
  pointer-events:none;
  display:flex; flex-direction:column; justify-content:space-between;
  z-index:5;
  backdrop-filter: blur(4px);
}
.pp-hover.show{ opacity:1; transform: translateY(0) scale(1); pointer-events:auto; }

/* floating prices (hover) */
.pp-h-prices {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  z-index: 9;
}
.pp-h-price-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 23, 42, .25);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 999px;
  padding: .25rem .6rem;
}
.pp-h-price-line .pp-now {
  color: #fff;
  font-weight: 800;
  font-size: .95rem;
}
.pp-h-price-line .pp-was {
  color: rgba(248, 250, 252, .7);
  text-decoration: line-through;
  font-size: .7rem;
}
.pp-h-member-inline {
  background: rgba(7, 16, 26, .35);
  border: 1px solid rgba(148, 163, 184, .25);
  border-radius: .6rem;
  padding: .15rem .5rem .25rem .6rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.pp-h-member-price {
  font-weight: 700;
  font-size: .72rem;
  color: #fef9c3;
}
.pp-h-member-tag {
  font-size: .6rem;
  color: rgba(248, 250, 252, .6);
}

/* hover content */
.pp-h-content{
  padding: 14px 14px 0 14px;
  max-height: 65%;
  overflow: auto;
  padding-right: 90px; /* so text doesn't go under floating prices */
}
.pp-h-title{ font-weight:900; font-size:1.1rem; margin-bottom:.25rem; color:#fff; }
.pp-h-desc{ color:#e2e8f0; margin-bottom:.5rem; font-size:.85rem; }

/* hover actions bottom */
.pp-h-actions{
  padding: 0 14px 14px 14px;
  display:flex;
  justify-content:flex-end;
  gap:8px;
}

/* dot indicators */
.pp-dots{
  position:absolute; left:50%; transform: translateX(-50%);
  bottom:8px; display:flex; gap:10px; justify-content:center; z-index:20;
}
.pp-dot{
  position:relative; width:10px; height:10px; border-radius:999px;
  background:#e2e8f0; border:1px solid #cbd5e1;
}
.pp-dot.active{ background:#0ea5e9; border-color:#0284c7; box-shadow:0 4px 10px rgba(2,132,199,.25); }
.pp-bubble{ display:none !important; }

/* slide animation for product switching */
.pp-slide-fade-enter-active,
.pp-slide-fade-leave-active{
  transition: all .35s ease;
}
.pp-slide-fade-enter-from{
  opacity:0;
  transform: translateX(12px);
}
.pp-slide-fade-leave-to{
  opacity:0;
  transform: translateX(-12px);
}

/* ===== Products ===== */
.products-scroll{ display:grid; gap:10px; grid-auto-flow:column; grid-auto-columns:minmax(210px,260px); overflow-x:auto; padding-bottom:6px; scroll-snap-type:x mandatory; }
.prod-card{ border-radius:14px; padding:10px; border:1px solid #e9eef3; background:rgba(255,255,255,.9); scroll-snap-align:start; min-height:220px; transition: transform .12s ease, box-shadow .12s ease; }
.prod-card:hover{ transform: translateY(-2px); box-shadow:0 12px 28px rgba(0,0,0,.08); }
.thumb{ position:relative; border-radius:10px; overflow:hidden; border:1px solid #eef2f7; aspect-ratio:4/3; background:#f8fafc; display:grid; place-items:center; }
.thumb img{ width:100%; height:100%; object-fit:cover; }
.thumb-fallback i{ font-size:1.4rem; color:#94a3b8; }
.off-pill{ position:absolute; top:8px; left:8px; background:#ef4444; color:#fff; font-weight:800; font-size:.8rem; padding:.1rem .4rem; border-radius:999px; }
.pname{ font-weight:800; margin-top:8px; letter-spacing:.2px; }
.prices{ display:flex; align-items:baseline; gap:8px; }
.now{ font-weight:800; } .was{ color:#94a3b8; text-decoration: line-through; }

/* ===== Skeleton / Reveal ===== */
.empty-state{ display:grid; place-items:center; row-gap:4px; padding:24px 8px; color:#94a3b8; }
.empty-state i{ font-size:1.2rem; }

.games-skeleton{ position:relative; padding:12px; display:grid; grid-template-columns:1.4fr .8fr; gap:14px; }
.games-skeleton .gsk{ background: linear-gradient(90deg,#5a2e2e,#6a3434,#5a2e2e); background-size:200% 100%; animation: sk 1.2s infinite linear; border-radius:18px; opacity:.6; }
.games-skeleton .gsk-banner{ height:260px; }
.games-skeleton .gsk-side{ height:80px; margin-bottom:10px; }

.reveal-init{ opacity:0; transform: translateY(10px) scale(.98); }
.reveal-in{ opacity:1; transform: translateY(0) scale(1); transition: opacity .45s ease, transform .45s ease; }

.skeleton-scroll{
  display:flex; gap:10px; overflow:hidden;
}
.skeleton-prod{
  width:200px; height:220px; border-radius:18px;
  background:linear-gradient(90deg,#f4f6f8,#e1e7ef,#f4f6f8);
  background-size:200% 100%; animation: sk 1.25s linear infinite;
}

/* floating view button (non-hover) */
.floating-view{
  align-self:flex-start;
  backdrop-filter: blur(4px);
  box-shadow: 0 10px 20px rgba(15,23,42,.25);
}

@media (max-width: 576px){
  .pp-nav{ display:none; }
  .pp-h-prices{ right: 6px; top: 6px; }
  .pp-h-content{ padding-right: 6px; }
}
</style>
