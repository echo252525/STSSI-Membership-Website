<template>
  <div class="dash container-xxl">
    <!-- ===== Hero / Quick Access ===== -->
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

    <!-- ===== MAIN: Games (OPEN only) + Orders ===== -->
    <section class="grid grid-main mb-4">
      <!-- ===== Games Panel (OPEN ONLY) ===== -->
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
            <div class="gsk gsk-side" v-for="i in 3" :key="i"></div>
            <div class="gsk gsk-tile" v-for="i in 6" :key="'t'+i"></div>
          </div>

          <div v-else-if="openGames.length === 0" class="empty-state text-light py-4">
            <i class="bi bi-emoji-neutral"></i>
            <div>No open games right now.</div>
          </div>

          <!-- ===== Banner + Side rail + Tiles ===== -->
          <div v-else class="games-layout">
            <!-- Left: FEATURE BANNER (selected or first open game) -->
            <div
              class="game-banner"
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

            <!-- Right: SIDE LIST (next open games). Clicking promotes to Feature -->
            <div class="side-list">
              <button
                v-for="g in sideListGames"
                :key="g.id"
                type="button"
                class="side-item"
                :class="{ active: isSelected(g.id) }"
                @click="selectFeature(g.id)"
                :aria-selected="isSelected(g.id)"
              >
                <div class="icon-slot">
                  <img v-if="g.imageUrl" :src="g.imageUrl" alt="Prize" />
                  <i v-else class="bi bi-controller"></i>
                </div>
                <div class="body">
                  <div class="title text-truncate">{{ g.title }}</div>
                  <div class="tiny">
                    <i class="bi bi-people me-1"></i>{{ number(g.player_count) }}/{{ number(g.player_cap) }}
                    <span class="sep">•</span>
                    <i class="bi bi-trophy me-1"></i>{{ peso(g.winner_price) }}
                  </div>
                </div>
                <i class="bi bi-chevron-right caret"></i>
              </button>
            </div>

            <!-- Bottom: TILES (rest of open games) -->
            <div class="tiles-row">
              <div class="tiles-rail" ref="tilesEl" @scroll="updateTilesNav">
                <a
                  v-for="g in tileGames"
                  :key="g.id"
                  href="#"
                  class="tile"
                  v-tilt
                  @click.prevent="selectFeature(g.id)"
                  :title="'Preview ' + g.title"
                >
                  <div class="tile-art" v-if="g.imageUrl">
                    <img :src="g.imageUrl" alt="Prize" />
                  </div>
                  <div class="tile-bg"></div>
                  <div class="tile-top">
                    <span class="status" :class="statusClass(g.status)">{{ (g.status || '').toUpperCase() }}</span>
                    <span class="cap"><i class="bi bi-people me-1"></i>{{ number(g.player_count) }}/{{ number(g.player_cap) }}</span>
                  </div>
                  <div class="tile-title text-truncate">{{ g.title }}</div>
                  <div class="tile-meta">
                    <span class="chip"><i class="bi bi-trophy me-1"></i>{{ peso(g.winner_price) }}</span>
                    <span class="chip"><i class="bi bi-clock me-1"></i>{{ dateShort(g.created_at) }}</span>
                  </div>
                </a>
              </div>

              <button class="rail-btn left" v-if="tilesCanPrev" @click="scrollTiles(-1)">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button class="rail-btn right" v-if="tilesCanNext" @click="scrollTiles(1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Orders Timeline ===== -->
      <div class="panel card border-0 shadow-sm rounded-4" v-reveal style="--i:1">
        <div class="card-body">
          <div class="panel-head">
            <h3 class="h6 m-0 d-flex align-items-center gap-2">
              <i class="bi bi-bell"></i> Order Updates
            </h3>
            <router-link to="/app/purchases" class="btn btn-outline-secondary btn-sm">All orders</router-link>
          </div>

          <div v-if="ordersLoading" class="skeleton-timeline">
            <div class="skeleton-line" v-for="i in 6" :key="'osk'+i"></div>
          </div>

          <div v-else-if="orderUpdates.length === 0" class="empty-state">
            <i class="bi bi-inbox"></i>
            <div>No recent updates.</div>
          </div>

          <ol v-else class="timeline">
            <li v-for="o in orderUpdates" :key="o.id" class="tl-item">
              <div class="dot" :class="orderStatusClass(o.status)"></div>
              <div class="tl-body">
                <div class="tl-row">
                  <strong class="me-auto">Order {{ shortId(o) }}</strong>
                  <span class="small text-muted">{{ dateShort(o.updated_at || o.created_at) }}</span>
                </div>
                <div class="text-muted small">
                  Status:
                  <span :class="['badge','bg-light','text-dark']">{{ (o.status || '').toUpperCase() }}</span>
                  <span v-if="o.total_amount != null" class="ms-2">• {{ peso(o.total_amount) }}</span>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- ===== Big Discounts ===== -->
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

const ICON_BASE = '/img/tiers/' // adjust path
const iconFor = (key: TierKey) => ({
  regular: ICON_BASE + 'regular.png',
  silver: ICON_BASE + 'silver.png',
  gold: ICON_BASE + 'gold.png',
  platinum: ICON_BASE + 'platinum.png',
  diamond: ICON_BASE + 'diamond.png'
} as Record<TierKey,string>)[key] || ''

const memberTier = ref<TierKey>('regular')
const currentTier = computed(() => tiers.find(t => t.key === memberTier.value) ?? tiers[0])
const badgeIcon = computed(() => iconFor(currentTier.value.key as TierKey))

/* ------- Member stats / balances -------- */
const memberStats = ref({ lifetimePurchases: 0, referrals: 0 })
const ewallet = ref({ balance: 0 })
const credits = ref({ balance: 0 })

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

/* selection: which game should appear in Feature */
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

/* Side list shows next few open games excluding the featured one */
const sideListGames = computed(() => {
  const fid = featureGame.value?.id
  return openGames.value.filter(g => g.id !== fid).slice(0, 3)
})

const tileGames = computed(() => {
  const ids = new Set([featureGame.value?.id, ...sideListGames.value.map(g => g.id)])
  return openGames.value.filter(g => !ids.has(g.id))
})

function isSelected(id: string) {
  return (selectedGameId.value ? selectedGameId.value : openGames.value[0]?.id) === id
}

/* ------- Orders updates -------- */
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

/* ------- Big Discounts (Products) -------- */
type ProdRow = {
  id: string
  name: string
  price_now: number
  price_was: number | null
  thumbnail_url?: string | null
  _discount_pct: number
}
const bigDiscounts = ref<ProdRow[]>([])
const productsLoading = ref(true)

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

/* ================= IMAGE FETCHING PIPELINE (Prize images) ================= */
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
      .limit(30)

    if (error) {
      const fb = await supabase
        .from('event')
        .select('id,title,player_count,player_cap,status,winner_refund_amount,product_id,created_at')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(30)
      if (!fb.error) data = fb.data
    }

    allGames.value = (data ?? []).map(mapEventRow)
    await attachPrizeImages(allGames.value)

    // default selection = first open game if none
    if (!selectedGameId.value) selectedGameId.value = openGames.value[0]?.id ?? null
  } catch {
    allGames.value = []
  } finally {
    gamesLoading.value = false
  }
}
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
      .schema('shop')
      .from('product')
      .select('id,name,price,original_price,discount_pct,thumbnail_url,is_active')
      .eq('is_active', true)
      .limit(60)

    if (error) {
      const fb = await supabase
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
        _discount_pct: pct
      } as ProdRow
    })
    bigDiscounts.value = rows.filter(r => r._discount_pct >= 30)
                             .sort((a,b) => b._discount_pct - a._discount_pct)
                             .slice(0, 14)
  } catch {
    bigDiscounts.value = []
  } finally {
    productsLoading.value = false
  }
}

/* ------- Realtime ------- */
let chGames: any = null
let chOrders: any = null
let chProducts: any = null

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
          const affected = allGames.value.filter(e => e.product_id === prodId)
          await attachPrizeImages(affected)
        }
      )
      .subscribe()
  } catch {}

  try {
    if (user.value?.id) {
      chOrders = supabase
        .channel(`rt:purchases:${user.value.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'purchases', filter: `user_id=eq.${user.value.id}` }, () => fetchOrderUpdates())
        .subscribe()
    }
  } catch {}
}

/* ------- Feature selection / UI helpers ------- */
const gamesPanelEl = ref<HTMLElement | null>(null)

function selectFeature(id: string) {
  selectedGameId.value = id
  // snap the panel into view to emphasize the change
  gamesPanelEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(openGames, () => {
  // If currently selected game disappears, fallback to first open game
  if (!openGames.value.find(g => g.id === selectedGameId.value)) {
    selectedGameId.value = openGames.value[0]?.id ?? null
  }
})

/* ------- Tiles rail controls ------- */
const tilesEl = ref<HTMLElement | null>(null)
const tilesCanPrev = ref(false)
const tilesCanNext = ref(false)
function updateTilesNav() {
  const el = tilesEl.value
  if (!el) { tilesCanPrev.value = tilesCanNext.value = false; return }
  tilesCanPrev.value = el.scrollLeft > 6
  tilesCanNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 6
}
function scrollTiles(dir: number) {
  const el = tilesEl.value; if (!el) return
  const step = Math.max(280, Math.floor(el.clientWidth * 0.85))
  el.scrollBy({ left: dir * step, behavior: 'smooth' })
}
let ro: ResizeObserver | null = null

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
    fetchOpenGames(),        // OPEN ONLY + attachPrizeImages
    fetchOrderUpdates(),
    fetchBigDiscounts()
  ])
  startRealtime()

  await nextTick()
  updateTilesNav()
  if (tilesEl.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(() => updateTilesNav())
    ro.observe(tilesEl.value)
  }
})
onBeforeUnmount(() => {
  if (chGames) supabase.removeChannel(chGames)
  if (chOrders) supabase.removeChannel(chOrders)
  if (chProducts) supabase.removeChannel(chProducts)
  ro?.disconnect?.()
})
</script>

<style scoped>
/* ===== Global ===== */
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

/* Side list */
.side-list{ display:flex; flex-direction:column; gap:10px; }
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
.side-item .title{ font-weight:800; }
.side-item .tiny{ font-size:.85rem; opacity:.9; }
.side-item .sep{ opacity:.6; margin:0 .35rem; }
.side-item .caret{ opacity:.8; }

/* Tiles row */
.tiles-row{ position:relative; }
.tiles-rail{
  overflow-x:auto; overflow-y:hidden; display:grid; gap:10px; grid-auto-flow:column; grid-auto-columns:minmax(220px, 280px);
  padding: 4px 2px 10px; scroll-snap-type:x mandatory;
  mask-image: linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%);
}
.tile{
  position:relative; scroll-snap-align:start; border-radius:18px; padding:14px; color:#fff; text-decoration:none;
  background: var(--gp-card); border:1px solid #ffffff22; min-height:160px;
  box-shadow: 0 12px 28px rgba(0,0,0,.18); display:flex; flex-direction:column; gap:8px;
}
.tile-art{ position:absolute; inset:0; border-radius:inherit; overflow:hidden; opacity:.55; }
.tile-art img{ width:100%; height:100%; object-fit:cover; filter:saturate(1.05) contrast(1.05) blur(.2px); transform: scale(1.02); }
.tile-bg{
  position:absolute; inset:0; border-radius:inherit; pointer-events:none; mix-blend-mode:screen; opacity:.45;
  background: radial-gradient(160px 120px at 80% 0%, #ff9f9f55, transparent 60%),
              radial-gradient(160px 120px at 0% 100%, #60a5fa55, transparent 60%),
              linear-gradient(180deg, rgba(0,0,0,.35), transparent 40%, rgba(0,0,0,.5));
}
.tile-top{ display:flex; justify-content:space-between; align-items:center; position:relative; z-index:1; }
.status{ font-size:.68rem; font-weight:800; padding:.22rem .5rem; border-radius:999px; border:1px solid #ffffff33; }
.st-open{ background:#22c55e33; } .st-locked{ background:#f59e0b33; } .st-spun{ background:#6366f133; }
.st-settled{ background:#0ea5e933; } .st-cancelled{ background:#ef444433; } .st-draft{ background:#ffffff22; }
.tile-title{ position:relative; z-index:1; font-weight:900; letter-spacing:.2px; text-shadow:0 2px 8px rgba(0,0,0,.35); }
.tile-meta{ position:relative; z-index:1; display:flex; gap:.4rem; flex-wrap:wrap; }
.tile .chip{ background:#ffffff14; border:1px solid #ffffff2e; padding:.2rem .6rem; border-radius:999px; font-weight:700; font-size:.9rem; }
.rail-btn{
  position:absolute; top:50%; transform:translateY(-50%); width:34px; height:34px; border-radius:999px; border:1px solid #ffffff33;
  background:#ffffff22; color:#fff; display:grid; place-items:center; box-shadow:0 10px 24px rgba(0,0,0,.25);
}
.rail-btn.left{ left:6px; } .rail-btn.right{ right:6px; }

/* ===== Orders timeline ===== */
.timeline{ list-style:none; padding:6px 0 0 0; margin:0; }
.tl-item{ display:grid; grid-template-columns:18px 1fr; gap:10px; padding:10px 0; position:relative; }
.tl-item::before{ content:''; position:absolute; left:8px; top:0; bottom:-4px; width:2px; background:#eef2f7; }
.tl-item:last-child::before{ bottom:8px; }
.dot{ width:14px; height:14px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 0 2px #e9eef3; margin-top:4px; }
.dot-default{ background:#94a3b8;} .dot-pending{ background:#f59e0b;} .dot-paid{ background:#10b981;}
.dot-shipped{ background:#3b82f6;} .dot-completed{ background:#16a34a;} .dot-cancelled{ background:#ef4444;}
.tl-body{ padding-bottom:4px;} .tl-row{ display:flex; align-items:center; gap:8px; }

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
.games-skeleton .gsk-tile{ height:160px; margin-top:10px; }
@keyframes sk{ 0%{background-position:0% 0} 100%{background-position:200% 0} }

.reveal-init{ opacity:0; transform: translateY(10px) scale(.98); }
.reveal-in{ opacity:1; transform: translateY(0) scale(1); transition: opacity .45s ease, transform .45s ease; }
</style>
