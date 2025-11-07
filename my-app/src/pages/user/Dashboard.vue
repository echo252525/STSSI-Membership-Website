<template>
  <div class="dash container-xxl">
    <!-- ===== HERO ===== -->
    <section class="hero card border-0 shadow-sm rounded-4 mb-3 breath-in-500" v-reveal>
      <div class="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="tier-icon neon">
            <img v-if="badgeIcon" :src="badgeIcon" :alt="currentTier.name + ' badge'" />
            <div v-else class="tier-fallback"><i class="bi bi-person-badge"></i></div>
          </div>
          <div>
            <!-- CHANGED: Welcome back -> Welcome, {{ name }} -->
            <div class="text-muted small">Welcome, {{ welcomeName }}</div>
            <h1 class="h4 fw-bold m-0">{{ currentTier.name }}</h1>
          </div>
        </div>

        <!-- ===== REPLACED QUICK ACTIONS: show balances with actions ===== -->
        <div class="quick-actions">
          <!-- E-Wallet balance + Top-up -->
          <div class="qchip balance" v-reveal>
            <i class="bi bi-wallet2"></i>
            <span class="label">E-Wallet</span>
            <!-- animated value -->
            <span class="value">{{ peso(displayEwallet) }}</span>
            <!-- CHANGED: add ?isTopUpOpen=yes -->
            <router-link
              :to="{ path: '/app/ewallet', query: { isTopUpOpen: 'yes' } }"
              class="icon-btn"
              aria-label="Top up e-wallet"
              title="Top up"
            >
              <i class="bi bi-plus-lg"></i>
            </router-link>
          </div>

          <!-- Credits balance + View in e-wallet -->
          <div class="qchip balance" v-reveal style="--i: 1">
            <i class="bi bi-ticket-perforated"></i>
            <span class="label">Credits</span>
            <!-- animated value -->
            <span class="value">{{ peso(displayCredits) }}</span>
            <!-- CHANGED: add ?isCreditsOpen=yes -->
            <router-link
              :to="{ path: '/app/ewallet', query: { isCreditsOpen: 'yes' } }"
              class="icon-btn"
              aria-label="View credits in wallet"
              title="View Credits"
            >
              <i class="bi bi-eye"></i>
            </router-link>
          </div>
        </div>
      </div>
      <div class="hero-grid" aria-hidden="true"></div>
    </section>

    <!-- ===== (REMOVED KPI CARDS SECTION) ===== -->

    <!-- ===== MAIN: GAMES (OPEN ONLY) + PRODUCT PREVIEW ===== -->
    <section class="grid grid-main mb-4">
      <!-- ===== Games Panel ===== -->
      <div ref="gamesPanelEl" class="panel card border-0 shadow-sm rounded-4 games-panel breath-in-500" v-reveal>
        <div class="card-body p-0">
          <div
            class="games-head d-flex align-items-center justify-content-between px-3 px-sm-4 pt-3"
          >
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
                <img :src="featureGame?.imageUrl || undefined" alt="Prize" />
              </div>

              <div class="banner-top">
                <span class="pill"><i class="bi bi-star-fill me-1"></i> Featured</span>
                <span class="cap"
                  ><i class="bi bi-people me-1"></i>{{ number(featureGame.player_count) }}/{{
                    number(featureGame.player_cap)
                  }}</span
                >
              </div>

              <h4 class="title text-truncate" :title="featureGame.title">
                {{ featureGame.title }}
              </h4>
              <p class="muted">Spin the wheel, grab rewards, and top the board.</p>

              <div class="meta">
                <span class="chip"
                  ><i class="bi bi-trophy me-1"></i>{{ peso(featureGame.winner_price) }}</span
                >
                <span class="chip"
                  ><i class="bi bi-clock me-1"></i>{{ dateShort(featureGame.created_at) }}</span
                >
              </div>

              <div class="progress">
                <span class="bar"
                  ><b class="fill" :style="{ width: joinPct(featureGame) + '%' }"></b
                ></span>
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
              <!-- optional top/bottom arrows; click nudges while preserving loop -->

              <div
                class="side-list scrollable"
                ref="sideListEl"
                :style="{ maxHeight: sideListH + 'px' }"
                @mouseenter="hoverSide = true"
                @mouseleave="hoverSide = false"
                @scroll.passive="onManualSideScroll"
              >
                <!-- 🔁 Looping list: render 3 segments (A|B|C) for endless wrap -->
                <button
                  v-for="g in sideListLooped"
                  :key="g._key"
                  type="button"
                  class="side-item"
                  :class="{ active: isSelected(g.id) }"
                  @click="selectFeature(g.id)"
                  :aria-selected="isSelected(g.id)"
                  :title="g.title"
                >
                  <div class="icon-slot">
                    <img v-if="g.imageUrl" :src="g.imageUrl || undefined" alt="Prize" />
                    <i v-else class="bi bi-controller"></i>
                  </div>
                  <div class="body">
                    <div class="title text-truncate" :title="g.title">{{ g.title }}</div>
                    <div class="tiny">
                      <i class="bi bi-people me-1"></i>{{ number(g.player_count) }}/{{
                        number(g.player_cap)
                      }}
                      <span class="sep">•</span>
                      <i class="bi bi-trophy me-1"></i>{{ peso(g.winner_price) }}
                    </div>
                  </div>
                  <i class="bi bi-chevron-right caret"></i>
                </button>
              </div>  
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Product Preview (REBUILT & SORTED BY LATEST) ===== -->
      <div class="panel card border-0 shadow-sm rounded-4 breath-in-500" v-reveal style="--i: 1">
        <div class="card-body">
          <div class="panel-head">
            <h3 class="h6 m-0 d-flex align-items-center gap-2">
              <i class="bi bi-eye"></i> See Latest Products
            </h3>
            <router-link to="/app/shop" class="btn btn-outline-secondary btn-sm"
              >Go to Shop</router-link
            >
          </div>

          <!-- Skeleton state -->
          <div v-if="productsLoading" class="pp-skeleton">
            <div class="pp-skel-card"></div>
            <div class="pp-skel-dots">
              <span v-for="i in 7" :key="'dsk' + i" class="pp-skel-dot"></span>
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="previewProducts.length === 0" class="empty-state">
            <i class="bi bi-emoji-smile"></i>
            <div>No products to preview right now.</div>
          </div>

          <!-- Super-aesthetic story-style preview -->
          <div
            v-else
            class="pp-hero"
            @mouseenter="onPPHover"
            @mouseleave="onPPLeave"
            @mousedown="onPPHoldStart"
            @mouseup="onPPHoldEnd"
            @mouseleave.capture="onPPHoldEnd"
            @touchstart.passive="onPPHoldStart"
            @touchend.passive="onPPHoldEnd"
            @click="openCurrentPreview"
            role="link"
            tabindex="0"
            :style="ppBgStyle"
          >
            <!-- Ambient layers -->
            <div class="pp-ambient"></div>
            <div class="pp-vignette"></div>

            <!-- Navigation (arrows) -->
            <button
              type="button"
              class="pp-nav pp-nav-left"
              @click.stop="prevPreviewAndReset"
              aria-label="Previous product"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
            <button
              type="button"
              class="pp-nav pp-nav-right"
              @click.stop="nextPreviewAndReset"
              aria-label="Next product"
            >
              <i class="bi bi-chevron-right"></i>
            </button>

            <!-- Progress line (5s) -->
            <div class="pp-progress">
              <div
                class="pp-progress__bar"
                :style="{ width: Math.round(progressPct * 100) + '%' }"
              ></div>
            </div>

            <!-- Animated content card -->
            <transition name="pp-zoom-pan" mode="out-in">
              <div
                v-if="currentPreview"
                :key="currentPreview.id + '-' + previewIndex"
                class="pp-hero__content glass"
              >
                <div class="pp-hero__badges">
                  <span
                    class="pp-chip pp-chip--deal"
                    v-if="currentPreview._discount_pct && currentPreview._discount_pct > 0"
                  >
                    -{{ number(currentPreview._discount_pct) }}%
                  </span>
                </div>

                <!-- Title / Price block -->
                <div class="pp-hero__text">
                  <h4 class="pp-hero__title text-truncate" :title="currentPreview?.name">
                    {{ currentPreview?.name }}
                  </h4>

                  <div class="pp-hero__prices">
                    <span class="pp-now">{{ peso(currentPreview?.price_now || 0) }}</span>
                    <span v-if="hasWas(currentPreview)" class="pp-was">{{
                      peso(currentPreview?.price_was || 0)
                    }}</span>
                    <span v-if="currentPreview?._discount_pct" class="pp-h-off">
                      -{{ number(currentPreview?._discount_pct) }}%
                    </span>
                  </div>

                  <!-- membership discount -->
                  <div v-if="membershipDiscountPct > 0 && currentPreview" class="pp-member-inline">
                    <span class="pp-h-member-price">{{ peso(memberPrice(currentPreview)) }}</span>
                    <span class="pp-h-member-tag">member {{ membershipDiscountPct }}% off</span>
                  </div>

                  <!-- Bullet list out of description (max 3) -->
                  <ul v-if="previewDescItems.length" class="pp-hero__desclist">
                    <li v-for="(d, i) in previewDescItems" :key="i">{{ d }}</li>
                  </ul>
                </div>

                <!-- CTA (disabled but preserved) -->
                <div class="pp-hero__actions">
                  <router-link
                    v-if="false"
                    :to="{ path: '/app/shop', query: { focus: currentPreview?.id } }"
                    class="btn btn-secondary btn-sm"
                  >
                    View
                  </router-link>
                </div>
              </div>
            </transition>

            <!-- Dot indicators (hover bubble disabled) -->
            <div class="pp-dots">
              <button
                v-for="(p, i) in previewProducts"
                :key="p.id"
                type="button"
                class="pp-dot"
                :class="{ active: i === previewIndex }"
                @click.stop="goToPreviewAndReset(i)"
                :aria-label="'Preview ' + p.name"
                @mouseenter="/* disabled */ null"
                @mouseleave="/* disabled */ null"
              >
                <div v-if="false && hoveredDot === i" class="pp-bubble">
                  <div class="pp-b-thumb">
                    <img v-if="p.thumbnail_url" :src="p.thumbnail_url || undefined" :alt="p.name" />
                    <div v-else class="pp-b-fallback"><i class="bi bi-image"></i></div>
                  </div>
                  <div class="pp-b-body">
                    <div class="pp-b-title text-truncate" :title="p.name">{{ p.name }}</div>
                    <div class="pp-b-price">
                      <span class="pp-b-now">{{ peso(p.price_now) }}</span>
                      <span v-if="(p.price_was ?? 0) > p.price_now" class="pp-b-was">
                        {{ peso(p.price_was ?? 0) }}
                      </span>

                      <span class="pp-b-off" v-if="p._discount_pct"
                        >-{{ number(p._discount_pct) }}%</span
                      >
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <!-- /pp-hero -->
        </div>
      </div>
    </section>

    <!-- ===== UPCOMING DISCOUNTS (kept) ===== -->
    <section class="card border-0 shadow-sm rounded-4 breath-in-500" v-reveal>
      <div class="card-body p-0 discounts-panel">
        <div class="panel-head px-3 px-sm-4 pt-3 pb-2">
          <h3 class="h6 m-0 d-flex align-items-center gap-2">
            <i class="bi bi-fire"></i> Upcoming Discounts
          </h3>
          <router-link to="/app/deals" class="btn btn-outline-secondary btn-sm"
            >See all</router-link
          >
        </div>

        <!-- Skeleton -->
        <div v-if="discountsLoading" class="discounts-skeleton">
          <div class="dsk dsk-banner"></div>
          <div class="dsk dsk-side" v-for="i in 4" :key="'dsk' + i"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="rankedScheduled.length === 0" class="empty-state">
          <i class="bi bi-emoji-smile"></i>
          <div>No scheduled discounts yet.</div>
        </div>

        <!-- Layout: Feature + side list -->
        <div v-else class="disc-layout">
          <!-- FEATURED UPCOMING DISCOUNT -->
          <div
            class="disc-banner"
            ref="discBannerEl"
            v-tilt
            v-reveal
            v-if="featureDiscount"
            :key="featureDiscount.id"
          >
            <div class="disc-art" v-if="featureDiscount.imageUrl">
              <img :src="featureDiscount.imageUrl || undefined" alt="Discount" />
            </div>

            <div class="disc-top">
              <span class="pill alt"><i class="bi bi-calendar-event me-1"></i> Upcoming</span>
              <span class="pill"
                ><i class="bi bi-cash-stack me-1"></i>{{ featureDiscount.estLabel }}</span
              >
            </div>

            <h4 class="disc-title text-truncate" :title="featureDiscount.title">
              {{ featureDiscount.title }}
            </h4>
            <p class="disc-muted" v-if="featureDiscount.shortDesc">
              {{ featureDiscount.shortDesc }}
            </p>

            <div class="disc-meta">
              <span class="chip">
                <i class="bi bi-clock me-1"></i>{{ startsInLabel(featureDiscount.starts_at) }}
              </span>
              <span class="chip" v-if="featureDiscount.scope === 'product'">
                <i class="bi bi-bag me-1"></i
                >{{ featureDiscount.productName || 'Specific product' }}
              </span>
            </div>

            <router-link
              :to="{ path: '/app/deals', query: { focus: featureDiscount.id } }"
              class="btn btn-play btn-white mt-2"
            >
              <i class="bi bi-eye-fill me-1"></i> View Details
            </router-link>
          </div>

          <!-- SIDE LIST -->
          <div class="side-wrap">
            <div
              class="side-list side-list-discounts scrollable"
              ref="discSideListEl"
              :style="{ maxHeight: discSideListH + 'px' }"
            >
              <button
                v-for="d in sideDiscounts"
                :key="d.id"
                type="button"
                class="side-item side-item-discount"
                :class="{ active: isDiscSelected(d.id) }"
                @click="selectFeatureDiscount(d.id)"
                :aria-selected="isDiscSelected(d.id)"
                :title="d.title"
              >
                <div class="icon-slot">
                  <img v-if="d.imageUrl" :src="d.imageUrl || undefined" alt="Product" />
                  <i v-else class="bi bi-ticket-perforated"></i>
                </div>
                <div class="body">
                  <div class="title text-truncate">{{ d.title }}</div>
                  <div class="tiny">
                    <i class="bi bi-cash-coin me-1"></i>{{ d.estLabel }}
                    <span class="sep">•</span>
                    <i class="bi bi-clock me-1"></i>{{ startsAtShort(d.starts_at) }}
                  </div>
                </div>
                <i class="bi bi-chevron-right caret"></i>
              </button>
            </div>
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

/* NEW: prefer full_name from public.users over auth metadata */
const fullNameFromDB = ref<string | null>(null)
const welcomeName = computed(() => {
  if (fullNameFromDB.value && fullNameFromDB.value.trim()) return fullNameFromDB.value
  const u: any = user.value || {}
  const meta = u?.user_metadata || {}
  return (
    meta.first_name ||
    meta.full_name ||
    (u?.email && String(u.email).split('@')[0]) ||
    'Member'
  )
})

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
const iconFor = (key: TierKey) =>
  (
    ({
      regular: ICON_BASE + 'regular.png',
      silver: ICON_BASE + 'silver.png',
      gold: ICON_BASE + 'gold.png',
      platinum: ICON_BASE + 'platinum.png',
      diamond: ICON_BASE + 'diamond.png',
    }) as Record<TierKey, string>
  )[key] || ''

const memberTier = ref<TierKey>('regular')
const currentTier = computed(() => tiers.find((t) => t.key === memberTier.value) ?? tiers[0])

/** dynamic signed icon if available; fallback to static asset */
const badgeIconSigned = ref<string | null>(null)
/* ✅ Ensure no null leaks to :src */
const badgeIcon = computed<string | undefined>(() => {
  const fallback = iconFor(currentTier.value.key as TierKey)
  return (badgeIconSigned.value ?? fallback) || undefined
})

/* ------- Member stats / balances -------- */
const memberStats = ref({ lifetimePurchases: 0, referrals: 0 })
const ewallet = ref({ balance: 0 })
const credits = ref({ balance: 0 })
/** From public.users.purchases_per_month */
const purchasesPerMonth = ref(0)

/* ====== Membership discount per purchase (from membership.tiers) ====== */
const membershipDiscountPct = ref(0)

/* ====== Animated counters for wallet displays ====== */
const displayEwallet = ref(0)
const displayCredits = ref(0)

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}
function animateCount(from: number, to: number, setter: (n: number) => void, ms = 900) {
  const start = performance.now()
  const diff = to - from
  let raf = 0
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms)
    const v = from + diff * easeOutCubic(t)
    setter(v)
    if (t < 1) raf = requestAnimationFrame(step)
  }
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(step)
}

watch(
  () => ewallet.value.balance,
  (newVal, oldVal) => {
    animateCount(Number(oldVal ?? 0), Number(newVal ?? 0), (v) => (displayEwallet.value = v))
  },
  { immediate: true },
)
watch(
  () => credits.value.balance,
  (newVal, oldVal) => {
    animateCount(Number(oldVal ?? 0), Number(newVal ?? 0), (v) => (displayCredits.value = v))
  },
  { immediate: true },
)

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
  allGames.value.filter((g) => (g.status || '').toLowerCase() === 'open'),
)
const featureGame = computed<GameRow | null>(() => {
  const fromSel = selectedGameId.value
    ? openGames.value.find((g) => g.id === selectedGameId.value)
    : null
  return fromSel || openGames.value[0] || null
})
const sideListGames = computed(() => {
  const fid = featureGame.value?.id
  return openGames.value.filter((g) => g.id !== fid)
})
function isSelected(id: string) {
  return (selectedGameId.value ? selectedGameId.value : openGames.value[0]?.id) === id
}

/* 🔁 Looping: render 3 segments (A|B|C) of sideListGames for seamless wrap */
const SEGMENTS = 3 as const
const sideListLooped = computed(() => {
  const base = sideListGames.value
  const out: Array<GameRow & { _key: string; _rep: number }> = []
  for (let rep = 0; rep < SEGMENTS; rep++) {
    for (const g of base) {
      out.push({ ...g, _key: `${g.id}::${rep}`, _rep: rep })
    }
  }
  return out
})

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
  created_at?: string | null
}

/* ------ Big Discounts (kept for other uses / preview fallback) ------ */
const bigDiscounts = ref<ProdRow[]>([])
const productsLoading = ref(true)

/* ------ Published Products for Preview ------ */
const publishedPreview = ref<ProdRow[]>([])

/* ------- Product Preview state -------- */
const previewIndex = ref(0)
const hoveredDot = ref<number | null>(null)

/** SORT: Strictly show latest first (by created_at desc) */
const publishedSorted = computed<ProdRow[]>(() => {
  const list = [...publishedPreview.value]
  return list.sort((a, b) => {
    const at = new Date(a.created_at || 0).getTime()
    const bt = new Date(b.created_at || 0).getTime()
    return bt - at
  })
})

/** Prefer published products (sorted latest), fallback to bigDiscounts */
const previewProducts = computed<ProdRow[]>(() => {
  const base = publishedSorted.value.length ? publishedSorted.value : bigDiscounts.value
  return base.slice(0, 12)
})
const currentPreview = computed<ProdRow | null>(
  () => previewProducts.value[previewIndex.value] || null,
)
watch(previewProducts, () => {
  previewIndex.value = 0
  resetAutoplay()
})

/* ====== SHOW ONLY 3 SPEC ITEMS ====== */
const previewDescItems = computed(() => {
  const raw = currentPreview.value?.description || ''
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3) // limit to three
})

/* ===== Autoplay for product preview (with progress bar) ===== */
/* ✅ ALWAYS advance every 5s even if not hovered; hover pauses temporarily */
const hoverActive = ref(false)
const autoplayMs = 5000
const progressPct = ref(0)
let progressTimer: number | null = null
let lastTickTs = 0
let carryMs = 0

function clearProgressTimer() {
  if (progressTimer) {
    window.clearInterval(progressTimer)
    progressTimer = null
  }
}
function tickProgress() {
  const now = Date.now()
  if (!lastTickTs) lastTickTs = now
  const delta = now - lastTickTs
  lastTickTs = now
  carryMs += delta
  progressPct.value = Math.min(1, carryMs / autoplayMs)
  if (progressPct.value >= 1) {
    nextPreview()
    carryMs = 0
    progressPct.value = 0
  }
}
function startAutoplay() {
  clearProgressTimer()
  lastTickTs = 0
  progressTimer = window.setInterval(tickProgress, 50)
}
function stopAutoplay() {
  clearProgressTimer()
}
function resetAutoplay() {
  carryMs = 0
  progressPct.value = 0
  if (!hoverActive.value) startAutoplay()
}
function onPPHover() {
  hoverActive.value = true
  stopAutoplay() // pause while hovered
}
function onPPLeave() {
  hoverActive.value = false
  startAutoplay() // resume after hover
}

/* === Hold-to-pause / release-to-continue === */
function onPPHoldStart() {
  stopAutoplay()
}
function onPPHoldEnd() {
  if (!hoverActive.value) startAutoplay()
}

/* === Click anywhere to open (replaces View button) === */
function openCurrentPreview() {
  const id = currentPreview.value?.id
  if (!id) return
  router.push({ path: '/app/shop', query: { focus: id } })
}

function goToPreview(i: number) {
  previewIndex.value = i
}
function goToPreviewAndReset(i: number) {
  goToPreview(i)
  resetAutoplay()
}
function nextPreview() {
  if (previewProducts.value.length === 0) return
  previewIndex.value = (previewIndex.value + 1) % previewProducts.value.length
}
function nextPreviewAndReset() {
  nextPreview()
  resetAutoplay()
}
function prevPreview() {
  if (previewProducts.value.length === 0) return
  previewIndex.value =
    (previewIndex.value - 1 + previewProducts.value.length) % previewProducts.value.length
}
function prevPreviewAndReset() {
  prevPreview()
  resetAutoplay()
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
const shortId = (o: OrderRow) =>
  o.order_no || o.ref_code || (o.id ? '#' + String(o.id).slice(0, 6) : '#—')

const statusClass = (s: string) => {
  switch ((s || '').toLowerCase()) {
    case 'open':
      return 'st-open'
    case 'locked':
      return 'st-locked'
    case 'spun':
      return 'st-spun'
    case 'settled':
      return 'st-settled'
    case 'cancelled':
      return 'st-cancelled'
    default:
      return 'st-draft'
  }
}
const orderStatusClass = (s: string) => {
  switch ((s || '').toLowerCase()) {
    case 'pending':
      return 'dot-pending'
    case 'approved':
    case 'paid':
      return 'dot-paid'
    case 'shipped':
      return 'dot-shipped'
    case 'completed':
    case 'delivered':
      return 'dot-completed'
    case 'cancelled':
    case 'refunded':
      return 'dot-cancelled'
    default:
      return 'dot-default'
  }
}
function joinPct(g: GameRow) {
  const cap = Math.max(1, Number(g.player_cap || 0))
  const cnt = Math.min(cap, Number(g.player_count || 0))
  return (cnt / cap) * 100
}

/* ======== helpers for Product Preview ======== */
function hasWas(p: ProdRow | null | undefined): p is ProdRow & { price_was: number } {
  return !!p && typeof p.price_was === 'number' && p.price_was > p.price_now
}

function savings(p?: ProdRow | null) {
  if (!hasWas(p)) return 0
  return p.price_was - p.price_now
}

/** Simple "affordable" heuristic */
function isAffordable(p?: ProdRow | null) {
  if (!p) return false
  return p._discount_pct >= 40 || p.price_now <= 500
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
const PRIZE_ROOT = 'products'

function isImageByName(name: string | undefined | null) {
  if (!name) return false
  return /\.(png|jpe?g|webp|gif|bmp|heic|avif)$/i.test(name)
}
async function firstImagePathForProduct(productId: string): Promise<string | null> {
  try {
    const dir = `${PRIZE_ROOT}/${productId}`
    const { data: files, error: listErr } = await supabase.storage
      .from(PRIZE_BUCKET)
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
async function signedUrlWithCB(
  bucket: string,
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
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
    }),
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
    }),
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
        .select(
          'tier_key, ewallet_balance, discount_credit_balance, referral_count, lifetime_purchases',
        )
        .eq('user_id', uid)
        .single()
      if (!fb.error) {
        data = {
          tier_key: fb.data?.tier_key,
          ewallet_balance: fb.data?.ewallet_balance,
          discount_credit_balance: fb.data?.discount_credit_balance,
          referrals: fb.data?.referral_count,
          lifetime_purchases: fb.data?.lifetime_purchases,
        } as any
      }
    }

    const tk = (data as any)?.tier_key as TierKey | undefined
    if (tk && ['regular', 'silver', 'gold', 'platinum', 'diamond'].includes(tk)) {
      memberTier.value = tk
    }

    ewallet.value.balance = Number((data as any)?.ewallet_balance ?? 0)
    credits.value.balance = Number((data as any)?.discount_credit_balance ?? 0)
    memberStats.value = {
      lifetimePurchases: Number((data as any)?.lifetime_purchases ?? 0),
      referrals: Number((data as any)?.referrals ?? 0),
    }
  } catch (e) {
    console.warn('[profile/tier] fallback', e)
  }
}

/** Pull balances & purchases_per_month & full_name from public.users */
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
      .select('balance, discount_credits, purchases_per_month, full_name')
      .eq('id', uid)
      .maybeSingle()

    if (!error && data) {
      ewallet.value.balance = Number(data.balance ?? 0)
      credits.value.balance = Number(data.discount_credits ?? 0)
      purchasesPerMonth.value = Number(data.purchases_per_month ?? 0)
      // ✅ Prefer full_name from DB for "Welcome, ..."`
      if (typeof data.full_name === 'string' && data.full_name.trim()) {
        fullNameFromDB.value = data.full_name.trim()
      }
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
    created_at: row.created_at,
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
        .select(
          'id,title,player_count,player_cap,status,winner_refund_amount,product_id,created_at',
        )
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
    if (!uid) {
      orderUpdates.value = []
      return
    }

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
        description: null,
        created_at: null,
      } as ProdRow
    })

    await attachProductImages(rows)

    bigDiscounts.value = rows
      .filter((r) => r._discount_pct >= 30)
      .sort((a, b) => b._discount_pct - a._discount_pct)
      .slice(0, 14)
  } catch {
    bigDiscounts.value = []
  } finally {
    productsLoading.value = false
  }
}

/* ---------- PUBLISHED PRODUCTS PREVIEW (with created_at) ---------- */
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
      else if (typeof r.product_url === 'string' && r.product_url.trim() !== '')
        thumb = r.product_url
      return {
        id: r.id,
        name: String(r.name ?? 'Unnamed Product'),
        price_now: Number.isFinite(priceNum) ? priceNum : 0,
        price_was: null,
        thumbnail_url: thumb,
        _discount_pct: 0,
        description: typeof r.description === 'string' ? r.description : null,
        created_at: r.created_at || null,
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
    for (const r of tiersData ?? []) byId[r.id] = r

    let uid = user.value?.id
    if (!uid) {
      const { data } = await supabase.auth.getUser()
      uid = data.user?.id
      if (!uid) return
    }

    const { data: urow } = await supabase
      .from('users')
      .select('membership_id, full_name')
      .eq('id', uid)
      .maybeSingle()

    // keep full name fresh too
    if (typeof urow?.full_name === 'string' && urow.full_name.trim()) {
      fullNameFromDB.value = urow.full_name.trim()
    }

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

/* =================== UPCOMING (SCHEDULED) DISCOUNTS =================== */

type DiscountScope = 'order' | 'product'
type DiscountType = 'percent' | 'fixed_amount' | 'free_shipping'

type RawDiscount = {
  id: string
  title: string
  description: string | null
  code: string | null
  is_public: boolean
  type: DiscountType
  scope: DiscountScope
  percent_off: number | null
  amount_off: number | null
  currency: string
  min_subtotal: number
  stack: string
  max_uses_global: number | null
  max_uses_per_user: number | null
  redemptions_count: number
  status: string
  starts_at: string
  expires_at: string | null
  product_id: string | null
  max_discount_amount: number | null
}

type DiscountCard = {
  id: string
  title: string
  shortDesc: string | null
  type: DiscountType
  scope: DiscountScope
  percent_off: number | null
  amount_off: number | null
  max_discount_amount: number | null
  min_subtotal: number
  starts_at: string
  expires_at: string | null
  product_id: string | null
  productName?: string | null
  imageUrl?: string | null
  estSavings: number
  estLabel: string
}

const discountsLoading = ref(true)
const scheduledRaw = ref<RawDiscount[]>([])
const upcomingDiscounts = ref<DiscountCard[]>([])
const selectedDiscountId = ref<string | null>(null)

const rankedScheduled = computed<DiscountCard[]>(() => {
  return [...upcomingDiscounts.value].sort((a, b) => {
    if (b.estSavings !== a.estSavings) return b.estSavings - a.estSavings
    // Tie-breaker: earlier start first
    return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  })
})

const featureDiscount = computed<DiscountCard | null>(() => {
  if (!rankedScheduled.value.length) return null
  const fromSel = selectedDiscountId.value
    ? rankedScheduled.value.find((d) => d.id === selectedDiscountId.value)
    : null
  return fromSel || rankedScheduled.value[0]
})

const sideDiscounts = computed<DiscountCard[]>(() => {
  const fid = featureDiscount.value?.id
  return rankedScheduled.value.filter((d) => d.id !== fid)
})

function isDiscSelected(id: string) {
  return (selectedDiscountId.value ?? rankedScheduled.value[0]?.id) === id
}
function selectFeatureDiscount(id: string) {
  selectedDiscountId.value = id
  discBannerEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* --- Savings estimation & labels --- */
function round2(n: number) {
  return Math.round(n * 100) / 100
}

function estSavingsFor(r: RawDiscount, productPrice?: number | null): number {
  const t = r.type
  if (t === 'free_shipping') return 0
  if (t === 'fixed_amount') return Math.max(0, Number(r.amount_off || 0))

  // percent
  const pct = Math.max(0, Number(r.percent_off || 0)) / 100
  const cap = r.max_discount_amount == null ? Infinity : Math.max(0, Number(r.max_discount_amount))
  if (r.scope === 'product') {
    const base = Math.max(0, Number(productPrice ?? 0))
    if (!base) return 0
    return round2(Math.min(base * pct, cap))
  } else {
    const base = Math.max(0, Number(r.min_subtotal || 0))
    if (!base && cap < Infinity) return round2(cap) // if no min, show cap as potential
    return round2(Math.min(base * pct, cap))
  }
}
function labelFor(r: RawDiscount, est: number, productPrice?: number | null): string {
  if (r.type === 'free_shipping') return 'Free shipping'
  if (r.type === 'fixed_amount') return `${peso(r.amount_off || 0)} off`

  const pct = Number(r.percent_off || 0)
  const cap = r.max_discount_amount
  if (r.scope === 'product' && productPrice) {
    if (cap != null) return `Up to ${peso(Math.min(est, cap))} (${pct}% off)`
    return `${pct}% off (~${peso(est)})`
  } else {
    if (cap != null && cap > 0) return `Up to ${peso(cap)} (${pct}% off)`
    if (r.min_subtotal) return `${pct}% off (min spend ${peso(r.min_subtotal)})`
    return `${pct}% off`
  }
}

/* --- Fetch scheduled discounts + related product info --- */
async function fetchScheduledDiscounts() {
  discountsLoading.value = true
  try {
    // Pull scheduled discounts
    const { data: drows, error } = await supabase
      .schema('rewards')
      .from('discounts')
      .select(
        'id,title,description,code,is_public,type,scope,percent_off,amount_off,currency,min_subtotal,stack,max_uses_global,max_uses_per_user,redemptions_count,status,starts_at,expires_at,product_id,max_discount_amount',
      )
      .eq('status', 'scheduled')
      .order('starts_at', { ascending: true })
      .limit(100)

    if (error) throw error
    scheduledRaw.value = (drows || []) as RawDiscount[]

    // Gather product ids
    const productIds = Array.from(
      new Set(
        (scheduledRaw.value || [])
          .map((r) => r.product_id)
          .filter((x): x is string => typeof x === 'string' && x.length > 0),
      ),
    )

    const productMap: Record<string, ProdRow> = {}
    if (productIds.length) {
      const { data: prows } = await supabase
        .schema('games')
        .from('products')
        .select('id,name,price,price_now,original_price,price_was,product_url,thumbnail_url')
        .in('id', productIds)

      const mapped: ProdRow[] = (prows || []).map((r: any) => {
        const price_now = Number(r.price_now ?? r.price ?? 0)
        const price_was = r.price_was ?? r.original_price ?? null
        const p: ProdRow = {
          id: r.id,
          name: String(r.name ?? 'Unnamed'),
          price_now,
          price_was: price_was ? Number(price_was) : null,
          thumbnail_url:
            r.thumbnail_url ??
            (Array.isArray(r.product_url) ? r.product_url[0] : r.product_url) ??
            null,
          _discount_pct: 0,
          description: null,
          created_at: null,
        }
        return p
      })

      // Attach storage images if any
      await attachProductImages(mapped)
      for (const p of mapped) productMap[p.id] = p
    }

    // Map to cards with estimated savings
    upcomingDiscounts.value = scheduledRaw.value.map((r) => {
      const prod = r.product_id ? productMap[r.product_id] : undefined
      const prodPrice = prod ? prod.price_now : null
      const est = estSavingsFor(r, prodPrice)
      const label = labelFor(r, est, prodPrice)
      return {
        id: r.id,
        title: r.title,
        shortDesc:
          (r.description || '')?.length > 120
            ? (r.description || '').slice(0, 118) + '…'
            : r.description || '',
        type: r.type,
        scope: r.scope,
        percent_off: r.percent_off,
        amount_off: r.amount_off,
        max_discount_amount: r.max_discount_amount,
        min_subtotal: r.min_subtotal,
        starts_at: r.starts_at,
        expires_at: r.expires_at,
        product_id: r.product_id,
        productName: prod?.name ?? null,
        imageUrl: prod?.thumbnail_url ?? null,
        estSavings: est,
        estLabel: label,
      } as DiscountCard
    })
  } catch (e) {
    console.warn('[scheduled discounts] load failed:', e)
    upcomingDiscounts.value = []
  } finally {
    discountsLoading.value = false
  }
}

/* ------- Realtime ------- */
let chGames: any = null
let chOrders: any = null
let chProducts: any = null
let chUser: any = null
let chReferrals: any = null
let chPubProducts: any = null
let chDiscounts: any = null

function startRealtime() {
  try {
    chGames = supabase
      .channel('rt:games.event:open-only')
      .on(
        'postgres_changes',
        { event: '*', schema: 'games', table: 'event', filter: 'status=eq.open' },
        async () => {
          await fetchOpenGames()
        },
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
          const affectedEvents = allGames.value.filter((e) => e.product_id === prodId)
          await attachPrizeImages(affectedEvents)

          const affectedPreview = publishedPreview.value.filter((p) => p.id === prodId)
          await attachProductImages(affectedPreview)
        },
      )
      .subscribe()

    chPubProducts = supabase
      .channel('rt:games.products')
      .on('postgres_changes', { event: '*', schema: 'games', table: 'products' }, () =>
        fetchPublishedProductsForPreview(),
      )
      .subscribe()
  } catch {}

  try {
    if (user.value?.id) {
      chOrders = supabase
        .channel(`rt:purchases:${user.value.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'games',
            table: 'purchases',
            filter: `user_id=eq.${user.value.id}`,
          },
          () => fetchOrderUpdates(),
        )
        .subscribe()

      chUser = supabase
        .channel(`rt:users:${user.value.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users', filter: `id=eq.${user.value.id}` },
          () => fetchUserWalletAndPurchases(),
        )
        .subscribe()

      chReferrals = supabase
        .channel(`rt:referrals:${user.value.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users',
            filter: `referred_by=eq.${user.value.id}`,
          },
          () => fetchReferralCount(),
        )
        .subscribe()
    }

    // Realtime for scheduled discounts
    chDiscounts = supabase
      .channel('rt:rewards.discounts:scheduled')
      .on(
        'postgres_changes',
        { event: '*', schema: 'rewards', table: 'discounts', filter: 'status=eq.scheduled' },
        async () => {
          await fetchScheduledDiscounts()
        },
      )
      .subscribe()
  } catch {}
}

/* ------- Feature selection / UI helpers for games ------- */
const gamesPanelEl = ref<HTMLElement | null>(null)
function selectFeature(id: string) {
  selectedGameId.value = id
  gamesPanelEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
watch(openGames, () => {
  if (!openGames.value.find((g) => g.id === selectedGameId.value)) {
    selectedGameId.value = openGames.value[0]?.id ?? null
  }
})

/* ------- Side list height sync to banner (games) ------- */
const bannerEl = ref<HTMLElement | null>(null)
const sideListH = ref(320)
let roBanner: ResizeObserver | null = null
function syncSideListHeight() {
  const h = bannerEl.value?.offsetHeight || 320
  sideListH.value = Math.max(240, Math.round(h))
  updateSideScrollHint()
}

/* ------- Scroll hint (games) ------- */
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

/* ==== Endless up & down slow-motion autoscroll for games side list ==== */
let sideLoopRaf = 0
let lastSideTs = 0
const sideSpeedPxPerSec = 16 /* slow motion */
const hoverSide = ref(false)
let manualScrollCooldown = 0
const sideDir = ref<1 | -1>(1) /* 1 = down, -1 = up */

/* ➕ Looping math (center segment & wrap) */
const segmentH = ref(0)      // height of ONE segment (original list)
const viewportH = ref(0)     // visible height
function centerSideLoop() {
  const el = sideListEl.value
  if (!el) return
  viewportH.value = el.clientHeight
  // if we rendered 3 segments, one segment height is total/3
  segmentH.value = el.scrollHeight / SEGMENTS
  // center on the middle segment (B)
  el.scrollTop = segmentH.value
}
async function recalcAndCenter() {
  await nextTick()
  const el = sideListEl.value
  if (!el) return
  if (sideListGames.value.length === 0) {
    segmentH.value = 0
    return
  }
  centerSideLoop()
  updateSideScrollHint()
}

/* Wrap helper: keep scrollTop inside the middle segment window */
function wrapSideScroll() {
  const el = sideListEl.value
  if (!el || segmentH.value <= 0) return
  const top = el.scrollTop
  const total = segmentH.value * SEGMENTS
  // If we've scrolled into segment C (bottom third), pull back by one segment
  if (top >= segmentH.value * 2 - viewportH.value * 0.5) {
    el.scrollTop = top - segmentH.value
    lastSideTs = performance.now()
  }
  // If we've scrolled into segment A (top third), push forward by one segment
  else if (top <= viewportH.value * 0.5) {
    el.scrollTop = top + segmentH.value
    lastSideTs = performance.now()
  }
}

function sideLoop(now: number) {
  const el = sideListEl.value

  sideLoopRaf = requestAnimationFrame(sideLoop)

  if (!el) {
    lastSideTs = now
    return
  }

  const canScroll = el.scrollHeight - el.clientHeight > 4
  if (!canScroll) {
    lastSideTs = now
    updateSideScrollHint()
    return
  }

  if (!lastSideTs) lastSideTs = now
  const dt = (now - lastSideTs) / 1000
  lastSideTs = now

  // pause while hovering or shortly after manual scroll
  if (hoverSide.value || manualScrollCooldown > 0) {
    manualScrollCooldown = Math.max(0, manualScrollCooldown - dt)
    updateSideScrollHint()
    return
  }

  // slow motion drift + wrap
  const dy = sideDir.value * sideSpeedPxPerSec * dt
  el.scrollTop += dy
  wrapSideScroll()

  // subtle ping-pong within middle segment
  const posInMiddle = el.scrollTop - segmentH.value
  if (segmentH.value > 0) {
    const nearTop = posInMiddle <= 6
    const nearBottom = posInMiddle + el.clientHeight >= segmentH.value - 6
    if (nearBottom) sideDir.value = -1
    else if (nearTop) sideDir.value = 1
  }

  updateSideScrollHint()
}

function nudgeSide(dir: 1 | -1) {
  const el = sideListEl.value
  if (!el) return
  el.scrollBy({ top: dir * 80, behavior: 'smooth' })
  manualScrollCooldown = 1.2 /* seconds pause after manual input */
  setTimeout(() => wrapSideScroll(), 250)
}
function onManualSideScroll() {
  manualScrollCooldown = 1.2
  wrapSideScroll()
}

/* ------- Side list height sync to banner (discounts) ------- */
const discBannerEl = ref<HTMLElement | null>(null)
const discSideListEl = ref<HTMLElement | null>(null)
const discSideListH = ref(320)
let roDiscBanner: ResizeObserver | null = null

function syncDiscSideListHeight() {
  const h = discBannerEl.value?.offsetHeight || 320
  discSideListH.value = Math.max(240, Math.round(h))
  updateDiscSideScrollHint()
}

/* ------- Scroll hint (discounts) ------- */
const discSideScrollHintVisible = ref(false)
const discSideScrollHintUpVisible = ref(false)
function updateDiscSideScrollHint() {
  const el = discSideListEl.value
  if (!el) {
    discSideScrollHintVisible.value = false
    discSideScrollHintUpVisible.value = false
    return
  }
  const canScroll = el.scrollHeight - el.clientHeight > 4
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
  const atTop = el.scrollTop <= 4

  discSideScrollHintVisible.value = canScroll && !atBottom
  discSideScrollHintUpVisible.value = canScroll && atBottom && !atTop
}

/* ------- Lifecycle ------- */
onMounted(async () => {
  const ok = await ensureAuthed()
  if (!ok) return

  await Promise.all([
    fetchProfileAndTier(),
    fetchOpenGames(),
    fetchOrderUpdates(),
    fetchBigDiscounts(), // kept (used by preview fallback)
    fetchPublishedProductsForPreview(),
  ])

  await Promise.all([fetchUserWalletAndPurchases(), fetchReferralCount()])

  // Load membership visuals/discount (also refreshes full_name)
  await loadLiveTiersAndUser()

  // Load scheduled discounts
  await fetchScheduledDiscounts()

  startRealtime()

  await nextTick()
  // Games sync
  syncSideListHeight()
  if ('ResizeObserver' in window && bannerEl.value) {
    roBanner = new ResizeObserver(syncSideListHeight)
    roBanner.observe(bannerEl.value)
  }
  window.addEventListener('resize', syncSideListHeight)
  if (sideListEl.value) {
    sideListEl.value.addEventListener('scroll', onManualSideScroll)
    updateSideScrollHint()
  }

  // 🔁 Compute segment height and center into the middle segment for seamless looping
  await recalcAndCenter()

  // Start endless side loop
  lastSideTs = 0
  sideLoopRaf = requestAnimationFrame(sideLoop)

  // Discounts sync
  syncDiscSideListHeight()
  if ('ResizeObserver' in window && discBannerEl.value) {
    roDiscBanner = new ResizeObserver(syncDiscSideListHeight)
    roDiscBanner.observe(discBannerEl.value)
  }
  window.addEventListener('resize', syncDiscSideListHeight)
  if (discSideListEl.value) {
    discSideListEl.value.addEventListener('scroll', updateDiscSideScrollHint)
    updateDiscSideScrollHint()
  }

  // ✅ Start autoplay immediately (even without hover)
  startAutoplay()
})

watch([openGames, selectedGameId], async () => {
  await nextTick()
  updateSideScrollHint()
  // when the set of sideListGames changes, recompute loop measurements
  await recalcAndCenter()
})

watch(rankedScheduled, async () => {
  await nextTick()
  updateDiscSideScrollHint()
})

onBeforeUnmount(() => {
  stopAutoplay()
  if (chGames) supabase.removeChannel(chGames)
  if (chOrders) supabase.removeChannel(chOrders)
  if (chProducts) supabase.removeChannel(chProducts)
  if (chUser) supabase.removeChannel(chUser)
  if (chReferrals) supabase.removeChannel(chReferrals)
  if (chPubProducts) supabase.removeChannel(chPubProducts)
  if (chDiscounts) supabase.removeChannel(chDiscounts)
  roBanner?.disconnect?.()
  roDiscBanner?.disconnect?.()
  window.removeEventListener('resize', syncSideListHeight)
  window.removeEventListener('resize', syncDiscSideListHeight)
  if (sideListEl.value) {
    sideListEl.value.removeEventListener('scroll', onManualSideScroll)
  }
  if (discSideListEl.value)
    discSideListEl.value.removeEventListener('scroll', updateDiscSideScrollHint)
  cancelAnimationFrame(sideLoopRaf)
})

/* ===== New: reactive style for background image (blurred whole picture via overlays) ===== */
const ppBgStyle = computed(() => {
  const url = currentPreview.value?.thumbnail_url || undefined
  return url ? { backgroundImage: `url('${url}')` } : {}
})

/* ===== Date helpers for Upcoming Discounts ===== */
function startsAtShort(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
function startsInLabel(iso: string) {
  const now = Date.now()
  const t = new Date(iso).getTime()
  const diffMs = t - now
  if (diffMs <= 0) return 'Starting soon'
  const mins = Math.round(diffMs / 60000)
  if (mins < 60) return `Starts in ${mins}m`
  const hrs = Math.round(mins / 60)
  if (hrs < 48) return `Starts in ${hrs}h`
  const days = Math.round(hrs / 24)
  return `Starts in ${days}d`
}
</script>

<style scoped>
/* ===== Base ===== */
.dash {
  padding: 1.25rem 0 2rem;
}

/* ===== Breath-in animation (500ms) ===== */
@keyframes breathIn {
  0% { opacity: 0; transform: translateY(8px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.breath-in-500 {
  animation: breathIn 0.5s ease both;
}

/* ===== Glass & Neon helpers ===== */
.glass {
  background: rgba(255, 255, 255, 0.78);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(230, 236, 245, 0.9);
}
.neon {
  position: relative;
}
.neon::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(120px 60px at 15% -10%, rgba(34, 197, 94, 0.22), transparent 60%),
    radial-gradient(140px 70px at 110% 110%, rgba(59, 130, 246, 0.22), transparent 60%);
  filter: saturate(0.9);
  opacity: 0.7;
}

/* ===== Hero ===== */
.hero {
  overflow: hidden;
  position: relative;
}
.tier-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #f7fafc, #eef2f7);
  display: grid;
  place-items: center;
  border: 1px solid #e9eef3;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}
.tier-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.tier-fallback i {
  font-size: 1.4rem;
  color: #64748b;
}
.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Original qchip base (kept) */
.qchip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  border: 1px solid #e9eef3;
  background: #fff;
  font-weight: 600;
  text-decoration: none;
  color: #0f172a;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease;
}
.qchip:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  background: #f9fafb;
}

/* === Balance chips variant === */
.qchip.balance {
  border-radius: 14px;
  padding: 0.55rem 0.7rem 0.55rem 0.65rem;
  gap: 0.55rem;
  cursor: default;
}
.qchip.balance .label {
  font-weight: 700;
  color: #64748b;
  font-size: 0.85rem;
}
.qchip.balance .value {
  font-weight: 900;
  letter-spacing: 0.2px;
}
.qchip.balance .icon-btn {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid #e9eef3;
  background: #fff;
  color: #0f172a;
  text-decoration: none;
  margin-left: 4px;
}
.qchip.balance .icon-btn:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

/* Aesthetic background grid */
.hero-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.8;
  background:
    radial-gradient(120% 70% at 15% -10%, rgba(34, 197, 94, 0.12), transparent 60%),
    radial-gradient(120% 70% at 110% 110%, rgba(59, 130, 246, 0.12), transparent 60%),
    linear-gradient(transparent 29px, rgba(15, 23, 42, 0.06) 30px),
    linear-gradient(90deg, transparent 29px, rgba(15, 23, 42, 0.06) 30px);
  background-size:
    auto,
    auto,
    30px 30px,
    30px 30px;
  animation: grid-pan 10s linear infinite;
}
@keyframes grid-pan {
  0% {
    background-position:
      0 0,
      0 0,
      0 0,
      0 0;
  }
  100% {
    background-position:
      0 0,
      0 0,
      120px 120px,
      -120px -120px;
  }
}

/* ===== Main Split ===== */
.grid-main {
  display: grid;
  gap: 14px;
  grid-template-columns: 1.35fr 0.65fr;
}
@media (max-width: 992px) {
  .grid-main {
    grid-template-columns: 1fr;
  }
}
.panel .card-body {
  padding: 16px;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

/* =================================================================== */
/* =======================  GAMES: PICTURE STYLE  ===================== */
/* =================================================================== */
.games-panel {
  --gp-green: #20a44c;
  --gp-azure: #20647c;
  --gp-bg: #20647c;
  --gp-card: rgba(32, 164, 76, 0.12);
  --gp-edge: rgba(32, 164, 76, 0.35);
  --gp-ink: #ffffff;
  --gp-muted: rgba(255, 255, 255, 0.65);

  background: radial-gradient(
    120% 100% at 10% 0%,
    #20a44c 0%,
    #20647c 55%,
    #123746 100%
  ) !important;
  color: var(--gp-ink);
}

.games-head .btn {
  --bs-btn-bg: #ffffff22;
  --bs-btn-border-color: #ffffff33;
  color: #fff;
}
.games-layout {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 14px;
  padding: 10px 12px 14px 12px;
}
@media (max-width: 992px) {
  .games-layout {
    grid-template-columns: 1fr;
  }
}

/* Banner */
.game-banner {
  position: relative;
  border-radius: 20px;
  padding: 18px;
  min-height: 240px;
  background:
    /* azure wash */
    linear-gradient(135deg, #20647c33, #20a44c33),
    /* green glow on the corner */ radial-gradient(120% 120% at 20% 10%, #20a44c55, transparent 60%);
  border: 1px solid #ffffff22;
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.25) inset,
    0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  color: #fff;
}

.game-banner .decor {
  position: absolute;
  inset: -4px;
  background:
    radial-gradient(220px 120px at 80% 10%, #7c4dff55, transparent 60%),
    radial-gradient(220px 120px at 0% 100%, #22d3ee55, transparent 60%);
  pointer-events: none;
}
.banner-art {
  position: absolute;
  inset: 0;
  right: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  mask-image: linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
}

.banner-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.banner-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}
.pill {
  background: #ffffff1f;
  border: 1px solid #ffffff33;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.8rem;
}
.cap {
  font-weight: 800;
}
.game-banner .title {
  position: relative;
  z-index: 1;
  font-size: 1.6rem;
  font-weight: 900;
  margin: 0.5rem 0 0;
  letter-spacing: 0.3px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}
.game-banner .muted {
  position: relative;
  z-index: 1;
  margin: 0.25rem 0 0.5rem;
  opacity: 0.9;
}
.game-banner .meta {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.game-banner .chip {
  background: #ffffff14;
  border: 1px solid #ffffff2e;
  color: #fff;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.9rem;
}
.game-banner .progress {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.game-banner .bar {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background: #ffffff1a;
  border: 1px solid #ffffff2e;
  overflow: hidden;
}
.game-banner .fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #34d399, #10b981);
}
.game-banner .pct {
  font-weight: 900;
  position: relative;
  z-index: 1;
}
.btn-play {
  position: relative;
  z-index: 1;
  margin-top: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: #3b1f1f;
  background: #fff;
  border: 0;
  border-radius: 999px;
  padding: 0.5rem 1rem;
  box-shadow:
    0 10px 24px rgba(255, 255, 255, 0.2),
    0 6px 16px rgba(0, 0, 0, 0.25);
}

/* Side list wrapper so hint can float below/above */
.side-wrap {
  position: relative;
  overflow: visible;
}

.side-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 2px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.side-list::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.side-item {
  appearance: none;
  border: 0;
  background: var(--gp-card);
  color: #fff;
  text-align: left;
  width: 100%;
  display: grid;
  grid-template-columns: 42px 1fr 20px;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  border: 1px solid #ffffff22;
  cursor: pointer;
  transition:
    transform 0.08s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;
}
.side-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
}
.side-item.active {
  border-color: #ffffff66;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
}
.icon-slot {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, #ff9f9f33, #c084fc33);
  border: 1px solid #ffffff22;
}
.icon-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.icon-slot i {
  font-size: 1.1rem;
  color: #fff;
}

.side-item .body {
  min-width: 0;
}
.side-item .title {
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.side-item .tiny {
  font-size: 0.85rem;
  opacity: 0.9;
}
.side-item .sep {
  opacity: 0.6;
  margin: 0 0.35rem;
}
.side-item .caret {
  opacity: 0.8;
}

.side-hint {
  display: grid;
  place-items: center;
  opacity: 0.9;
  pointer-events: none;
}
.side-hint i {
  font-size: 1.25rem;
  animation: bob 1.2s infinite;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}
.side-hint.floating {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -12px;
  z-index: 2;
}
.side-hint.floating.up {
  top: -12px;
  bottom: auto;
}
.side-hint.up i {
  animation: bob-up 1.2s infinite;
}
@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(3px);
  }
}
@keyframes bob-up {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* NEW: always-visible top/bottom arrows for side list */
.side-arrow {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(15, 23, 42, 0.25);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  color: #fff;
  z-index: 3;
}
.side-arrow.up {
  top: -8px;
}
.side-arrow.down {
  bottom: -8px;
}

/* ===== Product Preview (skeleton kept) ===== */
.pp-skeleton {
  display: grid;
  gap: 12px;
}
.pp-skel-card {
  height: 210px;
  border-radius: 16px;
  background: linear-gradient(90deg, #f1f5f9, #e2e8f0, #f1f5f9);
  background-size: 200% 100%;
  animation: sk 1.2s linear infinite;
}

.pp-skel-dots {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.pp-skel-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #e2e8f0;
}
@keyframes sk {
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* =================================================================== */
/* ================= SUPER AESTHETIC STORY-STYLE PREVIEW ============== */
/* =================================================================== */
.pp-hero {
  position: relative;
  min-height: 340px;
  border-radius: 18px;
  overflow: hidden;
  background-color: #0b1220;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(233, 238, 243, 0.35);
  cursor: pointer; /* whole area clickable */
}
.pp-ambient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(40% 60% at 15% 85%, rgba(14, 165, 233, 0.25), transparent 60%),
    radial-gradient(40% 60% at 85% 15%, rgba(34, 197, 94, 0.25), transparent 60%);
  filter: saturate(1.1);
  mix-blend-mode: screen;
  pointer-events: none;
}
.pp-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 120% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.45) 100%);
  pointer-events: none;
}

/* Card content floating on top */
.pp-hero__content {
  position: relative;
  z-index: 4;
  margin: 14px;
  border-radius: 16px;
  padding: 16px;
  min-height: 240px;
  color: #fff;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  background: rgba(11, 18, 32, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.pp-hero__badges {
  display: flex;
  gap: 6px;
}
.pp-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
}
.pp-chip--deal {
  background: rgba(34, 197, 94, 0.18);
  color: #eafff2;
  border-color: rgba(34, 197, 94, 0.35);
}

.pp-hero__text {
  margin-top: 6px;
}
.pp-hero__title {
  font-weight: 900;
  font-size: 1.15rem;
  letter-spacing: 0.2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}
.pp-hero__prices {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.pp-hero__desclist {
  margin: 0.5rem 0 0;
  padding-left: 1.2rem;
  color: #e2e8f0;
  font-size: 0.9rem;
  line-height: 1.25;
  max-height: 120px;
  overflow: hidden; /* prevent scrollbar noise */
}

.pp-hero__actions {
  margin-top: 0.6rem;
  display: flex;
  justify-content: flex-end;
}

/* Progress line (5s story bar) */
.pp-progress {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 8px;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
  z-index: 6;
}
.pp-progress__bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #22d3ee, #38bdf8, #0ea5e9);
  border-radius: 999px;
  transition: width 0.05s linear;
}

/* Zoom/Pan transition */
.pp-zoom-pan-enter-active,
.pp-zoom-pan-leave-active {
  transition: all 0.45s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.pp-zoom-pan-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.985);
  filter: saturate(0.9);
}
.pp-zoom-pan-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(1.01);
  filter: saturate(0.9);
}

/* nav arrows (reuse from earlier, slightly elevated) */
.pp-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(15, 23, 42, 0.15);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  z-index: 7;
  color: #fff;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  opacity: 0.85;
}
.pp-nav:hover {
  opacity: 1;
  transform: translateY(-50%);
}
.pp-nav-left {
  left: 10px;
}
.pp-nav-right {
  right: 10px;
}

/* price colors on dark */
.pp-now {
  color: #fff;
  font-weight: 900;
}
.pp-was {
  color: #e2e8f0;
  opacity: 0.95;
  text-decoration: line-through;
}
.pp-h-off {
  color: #fde047;
}

/* membership inline carries over (dark-tuned) */
.pp-member-inline {
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 0.6rem;
  padding: 0.25rem 0.65rem;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  width: fit-content;
  margin-top: 6px;
}
.pp-h-member-price {
  font-weight: 700;
  color: #fef9c3;
  font-size: 0.8rem;
}
.pp-h-member-tag {
  font-size: 0.7rem;
  color: rgba(248, 250, 252, 0.8);
}

/* Dots — bubble preview DISABLED */
.pp-dots {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 14px;
  display: flex;
  gap: 6px;
  justify-content: center;
  z-index: 8;
}
.pp-dot {
  position: relative;
  width: 14px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.75);
  transition: transform 0.15s ease;
}
.pp-dot.active {
  background: #0ea5e9;
  border-color: #0284c7;
  transform: none;
}
.pp-bubble {
  display: none !important;
}

@media (max-width: 576px) {
  .pp-nav {
    display: none;
  }
}

/* ===== Products scroll (kept styles that may be reused elsewhere) ===== */
.products-scroll {
  display: grid;
  gap: 10px;
  grid-auto-flow: column;
  grid-auto-columns: minmax(210px, 260px);
  overflow-x: auto;
  padding-bottom: 6px;
  scroll-snap-type: x mandatory;
}
.prod-card {
  border-radius: 14px;
  padding: 10px;
  border: 1px solid #e9eef3;
  background: rgba(255, 255, 255, 0.9);
  scroll-snap-align: start;
  min-height: 220px;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}
.prod-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}
.thumb {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #eef2f7;
  aspect-ratio: 4/3;
  background: #f8fafc;
  display: grid;
  place-items: center;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-fallback i {
  font-size: 1.4rem;
  color: #94a3b8;
}
.off-pill {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #ef4444;
  color: #fff;
  font-weight: 800;
  font-size: 0.8rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
}
.pname {
  font-weight: 800;
  margin-top: 8px;
  letter-spacing: 0.2px;
}
.prices {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.now {
  font-weight: 800;
}
.was {
  color: #94a3b8;
  text-decoration: line-through;
}

/* ===== Skeleton / Reveal ===== */
.empty-state {
  display: grid;
  place-items: center;
  row-gap: 4px;
  padding: 24px 8px;
  color: #94a3b8;
}
.empty-state i {
  font-size: 1.2rem;
}

.games-skeleton {
  position: relative;
  padding: 12px;
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 14px;
}
.games-skeleton .gsk {
  background: linear-gradient(90deg, #5a2e2e, #6a3434, #5a2e2e);
  background-size: 200% 100%;
  animation: sk 1.2s infinite linear;
  border-radius: 18px;
  opacity: 0.6;
}
.games-skeleton .gsk-banner {
  height: 260px;
}
.games-skeleton .gsk-side {
  height: 80px;
  margin-bottom: 10px;
}

.reveal-init {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
.reveal-in {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition:
    opacity 0.45s ease,
    transform 0.45s ease;
}

.skeleton-scroll {
  display: flex;
  gap: 10px;
  overflow: hidden;
}
.skeleton-prod {
  width: 200px;
  height: 220px;
  border-radius: 18px;
  background: linear-gradient(90deg, #f4f6f8, #e1e7ef, #f4f6f8);
  background-size: 200% 100%;
  animation: sk 1.25s linear infinite;
}

/* =================================================================== */
/* ====================  UPCOMING DISCOUNTS PANEL  ==================== */
/* =================================================================== */
.discounts-panel {
  --dk-ink: #0f172a;
  --dk-muted: #64748b;
  --dk-card: rgba(255, 255, 255, 0.9);
  --dk-edge: #e9eef3;
  --dk-acc: #0ea5e9; /* accent for pills */
  padding: 0;
}

.discounts-skeleton {
  position: relative;
  padding: 12px;
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 14px;
}
.discounts-skeleton .dsk {
  background: linear-gradient(90deg, #eef2f7, #e2e8f0, #eef2f7);
  background-size: 200% 100%;
  animation: sk 1.2s infinite linear;
  border-radius: 18px;
  opacity: 0.7;
}
.discounts-skeleton .dsk-banner {
  height: 240px;
}
.discounts-skeleton .dsk-side {
  height: 78px;
  margin-bottom: 10px;
}

.disc-layout {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 14px;
  padding: 10px 12px 14px 12px;
}
@media (max-width: 992px) {
  .disc-layout {
    grid-template-columns: 1fr;
  }
}

.disc-banner {
  position: relative;
  border-radius: 20px;
  padding: 18px;
  min-height: 240px;
  color: var(--dk-ink);
  background:
    linear-gradient(135deg, #f8fafc, #ffffff),
    radial-gradient(120% 120% at 20% 10%, rgba(14, 165, 233, 0.12), transparent 60%);
  border: 1px solid var(--dk-edge);
  box-shadow:
    0 8px 24px rgba(2, 6, 23, 0.06) inset,
    0 10px 24px rgba(2, 6, 23, 0.04);
  overflow: hidden;
}
.disc-art {
  position: absolute;
  inset: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  mask-image: linear-gradient(to left, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
}
.disc-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.14;
}

.disc-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}
.pill.alt {
  background: #0ea5e91a;
  color: #0ea5e9;
  border-color: #0ea5e933;
}
.btn-white {
  background: #fff;
  color: #0f172a;
}

.disc-title {
  position: relative;
  z-index: 1;
  font-size: 1.45rem;
  font-weight: 900;
  margin: 0.45rem 0 0.25rem;
  letter-spacing: 0.2px;
}
.disc-muted {
  position: relative;
  z-index: 1;
  margin: 0.25rem 0 0.6rem;
  color: var(--dk-muted);
}

.disc-meta .chip {
  background: rgba(2, 6, 23, 0.04);
  border: 1px solid #e5e7eb;
  color: #0f172a;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.9rem;
}

/* Side list for discounts */
.side-list-discounts .side-item-discount {
  background: var(--dk-card);
  color: var(--dk-ink);
  border: 1px solid var(--dk-edge);
}
.side-list-discounts .side-item-discount .icon-slot i {
  color: #0ea5e9;
}
.side-list-discounts .side-item-discount.active {
  border-color: #bae6fd;
  box-shadow: 0 10px 28px rgba(2, 132, 199, 0.12);
}

/* Tweak tiny text in discount side items */
.side-list-discounts .tiny {
  color: var(--dk-muted);
}
</style>
