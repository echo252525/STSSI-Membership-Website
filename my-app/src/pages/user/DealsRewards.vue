<template>
  <div class="deals-shell">
    <!-- ===== PAGE SKELETON (initial) ===== -->
    <template v-if="isBooting">
      <!-- Hero skeleton -->
      <header class="deals-hero breath-in-once">
        <div class="w-100">
          <div class="skel-line w-40 mb-2"></div>
          <div class="skel-line w-25 mb-2"></div>
          <div class="skel-line w-60 sm"></div>
        </div>
        <div class="hero-stats">
          <div class="skel-pill"></div>
          <div class="skel-pill"></div>
          <div class="skel-pill"></div>
        </div>
      </header>

      <main class="deals-grid">
        <!-- LEFT skeleton -->
        <section class="deals-left">
          <div class="panel breath-in-once">
            <div class="panel-head">
              <div>
                <div class="skel-line w-30 mb-2"></div>
                <div class="skel-line w-50 sm"></div>
              </div>
              <div class="skel-btn"></div>
            </div>

            <div class="discount-list">
              <div class="discount-card">
                <div class="discount-main">
                  <div class="skel-square"></div>
                  <div>
                    <div class="skel-line w-35 mb-2"></div>
                    <div class="skel-line w-60 sm"></div>
                    <div class="skel-line w-30 xs mt-2"></div>
                  </div>
                </div>
                <div class="discount-side">
                  <div class="skel-chip mb-1"></div>
                  <div class="skel-line w-25 xs"></div>
                </div>
              </div>

              <div class="discount-card">
                <div class="discount-main">
                  <div class="skel-square"></div>
                  <div>
                    <div class="skel-line w-45 mb-2"></div>
                    <div class="skel-line w-50 sm"></div>
                    <div class="skel-line w-20 xs mt-2"></div>
                  </div>
                </div>
                <div class="discount-side">
                  <div class="skel-chip mb-1"></div>
                  <div class="skel-line w-25 xs"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel breath-in-once">
            <div class="panel-head">
              <div>
                <div class="skel-line w-36 mb-2"></div>
                <div class="skel-line w-56 sm"></div>
              </div>
            </div>
            <div class="product-discount-grid">
              <div class="product-discount-card">
                <div class="pd-top">
                  <div class="skel-chip"></div>
                  <div class="skel-chip"></div>
                </div>
                <div class="skel-line w-60 mb-2"></div>
                <div class="skel-line w-70 sm mb-2"></div>
                <div class="skel-line w-40 xs"></div>
                <div class="pd-footer mt-2">
                  <div class="skel-chip"></div>
                  <div class="skel-btn small"></div>
                </div>
              </div>

              <div class="product-discount-card">
                <div class="pd-top">
                  <div class="skel-chip"></div>
                  <div class="skel-chip"></div>
                </div>
                <div class="skel-line w-50 mb-2"></div>
                <div class="skel-line w-65 sm mb-2"></div>
                <div class="skel-line w-35 xs"></div>
                <div class="pd-footer mt-2">
                  <div class="skel-chip"></div>
                  <div class="skel-btn small"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- RIGHT skeleton -->
        <section class="deals-right">
          <div class="panel sticky-panel breath-in-once">
            <div class="panel-head">
              <div>
                <div class="skel-line w-40 mb-2"></div>
                <div class="skel-line w-55 sm"></div>
              </div>
            </div>

            <div class="affiliate-box">
              <div class="skel-line w-30 sm mb-2"></div>
              <div class="aff-input-wrap">
                <div class="skel-line w-100 sm"></div>
                <div class="skel-btn small"></div>
              </div>
              <div class="skel-line w-50 xs mt-2"></div>
            </div>

            <div class="aff-metrics">
              <div class="metric-card">
                <div class="skel-line w-40 xs mb-2"></div>
                <div class="skel-line w-30"></div>
              </div>
              <div class="metric-card">
                <div class="skel-line w-50 xs mb-2"></div>
                <div class="skel-line w-30"></div>
              </div>
              <div class="metric-card">
                <div class="skel-line w-45 xs mb-2"></div>
                <div class="skel-line w-35"></div>
              </div>
            </div>
          </div>

          <div class="panel breath-in-once">
            <div class="panel-head">
              <div>
                <div class="skel-line w-36 mb-2"></div>
                <div class="skel-line w-45 sm"></div>
              </div>
              <div class="skel-chip"></div>
            </div>

            <ul class="ref-list">
              <li class="ref-item">
                <div class="ref-left">
                  <div class="skel-avatar"></div>
                  <div>
                    <div class="skel-line w-40 mb-1"></div>
                    <div class="skel-line w-25 xs"></div>
                    <div class="ref-progress mt-2">
                      <div class="ref-progress-bar">
                        <div class="ref-progress-fill" style="width: 40%; opacity: .25"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="ref-right">
                  <div class="skel-line w-20 mb-1"></div>
                  <div class="skel-line w-30 xs"></div>
                </div>
              </li>

              <li class="ref-item">
                <div class="ref-left">
                  <div class="skel-avatar"></div>
                  <div>
                    <div class="skel-line w-50 mb-1"></div>
                    <div class="skel-line w-30 xs"></div>
                    <div class="ref-progress mt-2">
                      <div class="ref-progress-bar">
                        <div class="ref-progress-fill" style="width: 60%; opacity: .25"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="ref-right">
                  <div class="skel-line w-24 mb-1"></div>
                  <div class="skel-line w-34 xs"></div>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </template>

    <!-- ===== REAL PAGE ===== -->
    <template v-else>
      <!-- ===== Hero / Top bar ===== -->
      <header class="deals-hero breath-in-once">
        <div>
          <p class="hero-eyebrow">Rewards center</p>
          <h1 class="hero-title">Deals & Rewards</h1>
          <p class="hero-sub">
            Your active vouchers, product-specific promos, and referral earnings — all in one clean
            view.
          </p>
        </div>
        <div class="hero-stats">
          <div class="hero-pill">
            <span class="hero-pill-label">Active discounts</span>
            <span class="hero-pill-value">{{ discounts.length }}</span>
          </div>
          <div class="hero-pill">
            <span class="hero-pill-label">Product-only</span>
            <span class="hero-pill-value">{{ productDiscounts.length }}</span>
          </div>
          <div class="hero-pill">
            <span class="hero-pill-label">Referees</span>
            <span class="hero-pill-value">{{ referees.length }}</span>
          </div>
        </div>
      </header>

      <main class="deals-grid">
        <!-- ================= LEFT: Discounts ================= -->
        <section class="deals-left">
          <!-- ORDER-LEVEL DISCOUNTS -->
          <div class="panel breath-in-once">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">Order / Cart Discounts</h2>
                <p class="panel-sub">Auto or code-based promos that can apply to most orders.</p>
              </div>
              <button class="ghost-btn" @click="reload">
                <i class="bi bi-arrow-repeat me-1"></i>
                Refresh
              </button>
            </div>

            <div v-if="busy" class="empty-state">
              <div class="spinner-border mb-2"></div>
              <p class="empty-title">Loading discounts…</p>
              <p class="empty-text">Please wait while we pull your available rewards.</p>
            </div>

            <div v-else-if="discounts.length === 0" class="empty-state">
              <i class="bi bi-ticket-perforated empty-icon"></i>
              <p class="empty-title">No active order discounts right now.</p>
              <p class="empty-text">When we drop a store-wide promo, it’ll show up here.</p>
            </div>

            <div v-else class="discount-list">
              <article
                v-for="d in discounts"
                :key="d.id"
                class="discount-card"
                :data-type="d.type || 'percent'"
              >
                <div class="discount-main">
                  <div class="discount-badge" :class="d.type">
                    <i v-if="d.type === 'free_shipping'" class="bi bi-truck"></i>
                    <i v-else class="bi bi-percent"></i>
                  </div>
                  <div>
                    <h3 class="discount-title">{{ d.title }}</h3>
                    <p class="discount-desc">
                      <span v-if="d.min_spend != null">Min. spend ₱{{ d.min_spend }}</span>
                      <span v-else-if="d.description">{{ d.description }}</span>
                      <span v-else>Store-wide offer</span>
                    </p>
                    <p class="discount-exp">Valid {{ expiryLabel(d) }}</p>
                  </div>
                </div>

                <div class="discount-side">
                  <p v-if="d.code" class="discount-code">Code: {{ d.code }}</p>
                  <p
                    v-if="typeof d.max_uses_per_user === 'number'"
                    class="discount-usage"
                    :class="{ 'text-danger': exceededUserLimit(d) }"
                  >
                    Used {{ userUseCount(d.id) }} / {{ d.max_uses_per_user }}
                  </p>
                  <button
                    class="cta-btn"
                    @click="goToShop(d)"
                    :disabled="exceededUserLimit(d)"
                    :aria-disabled="exceededUserLimit(d)"
                  >
                    {{ exceededUserLimit(d) ? 'Used' : 'Use' }}
                  </button>
                </div>
              </article>
            </div>
          </div>

          <!-- PRODUCT-SPECIFIC DISCOUNTS -->
          <div class="panel breath-in-once" v-if="productDiscounts.length > 0">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">Product-Specific Discounts</h2>
                <p class="panel-sub">
                  Can only be applied to a certain product. Perfect for highlighting key items.
                </p>
              </div>
            </div>

            <div class="product-discount-grid">
              <article
                v-for="d in productDiscounts"
                :key="d.id"
                class="product-discount-card"
                :data-type="d.type || 'percent'"
              >
                <div class="pd-top">
                  <span class="pd-type" v-if="d.type === 'free_shipping'">Free Shipping</span>
                  <span class="pd-type" v-else-if="d.type === 'percent'">
                    {{ Number(d.percent_off ?? 0) }}% OFF
                  </span>
                  <span class="pd-type" v-else-if="d.type === 'fixed_amount'">
                    ₱{{ money(d.amount_off ?? 0) }} OFF
                  </span>
                  <span class="pd-pill">Product only</span>
                </div>
                <h3 class="pd-title">{{ d.title }}</h3>
                <p class="pd-product-label">
                  Applies to: <strong>{{ d.product_name || shortProductId(d.product_id) }}</strong>
                </p>
                <p class="pd-meta">Valid {{ expiryLabel(d) }}</p>

                <div class="pd-footer">
                  <p v-if="d.code" class="pd-code">Code: {{ d.code }}</p>
                  <p
                    v-if="typeof d.max_uses_per_user === 'number'"
                    class="pd-usage"
                    :class="{ 'text-danger': exceededUserLimit(d) }"
                  >
                    Used {{ userUseCount(d.id) }} / {{ d.max_uses_per_user }}
                  </p>
                  <button
                    class="mini-btn"
                    @click="goToShop(d)"
                    :disabled="exceededUserLimit(d)"
                    :aria-disabled="exceededUserLimit(d)"
                  >
                    {{ exceededUserLimit(d) ? 'Used' : 'Use' }}
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <!-- ================= RIGHT: Affiliate & Network ================= -->
        <section class="deals-right">
          <!-- Affiliate -->
          <div class="panel sticky-panel breath-in-once">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">Affiliate & Referrals</h2>
                <p class="panel-sub">Share your link and earn commission on converted sales.</p>
              </div>
            </div>

            <div class="affiliate-box">
              <label class="aff-label">Your referral link</label>
              <div class="aff-input-wrap">
                <input :value="affiliateUrl || 'Unavailable'" readonly class="aff-input" />
                <button class="mini-btn" @click="copyAffiliate" :disabled="!affiliateUrl">
                  <i class="bi bi-clipboard"></i>
                  Copy
                </button>
              </div>
              <p class="aff-hint">
                New signups through this link will appear in your network list below.
              </p>
            </div>

            <div class="aff-metrics">
              <div class="metric-card">
                <p class="metric-label">Total Referrals</p>
                <p class="metric-value">{{ referralStats.total }}</p>
              </div>
              <div class="metric-card">
                <p class="metric-label">Converted Sales</p>
                <p class="metric-value">{{ referralStats.converted }}</p>
              </div>
              <div class="metric-card">
                <p class="metric-label">Commission</p>
                <p class="metric-value">₱ {{ money(referralStats.commission) }}</p>
              </div>
            </div>
          </div>

          <!-- Referees list -->
          <div class="panel breath-in-once">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">Your Network</h2>
                <p class="panel-sub">People who joined using your link.</p>
              </div>
              <span class="tag">{{ referees.length }} total</span>
            </div>

            <div v-if="busyReferees" class="empty-state">
              <div class="spinner-border mb-2"></div>
              <p class="empty-title">Loading referees…</p>
              <p class="empty-text">Give us a second to fetch your network.</p>
            </div>

            <div v-else-if="referees.length === 0" class="empty-state">
              <i class="bi bi-person-plus empty-icon"></i>
              <p class="empty-title">No referees yet.</p>
              <p class="empty-text">Share your link to start building your downline.</p>
            </div>

            <ul v-else class="ref-list">
              <li v-for="r in referees" :key="r.id" class="ref-item">
                <div class="ref-left">
                  <img
                    :src="r.avatar_url || defaultAvatar"
                    class="ref-avatar"
                    alt=""
                    referrerpolicy="no-referrer"
                  />
                  <div>
                    <p class="ref-name">{{ r.full_name || 'Unnamed User' }}</p>
                    <p class="ref-sub">Joined via your link</p>
                    <div v-if="goalPerRef != null" class="ref-progress">
                      <div class="ref-progress-head">
                        <span>Progress</span>
                        <span class="ref-progress-val">
                          ₱{{ r.purchasesThisMonth.count }} / ₱{{ goalPerRef }}
                        </span>
                      </div>
                      <div class="ref-progress-bar">
                        <div class="ref-progress-fill" :style="{ width: progressPct(r) }"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="ref-right">
                  <p class="ref-amount">₱ {{ r.purchasesThisMonth.count }}</p>
                  <p
                    v-if="r.purchasesThisMonth.totalAmount != null"
                    class="ref-amount-sub"
                  >₱ {{ money(r.purchasesThisMonth.totalAmount) }} total</p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { currentUser } from '@/lib/authState'

const router = useRouter()
const user = computed(() => currentUser.value)

/** NEW: initial page skeleton flag */
const isBooting = ref(true)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return router.push({ name: 'login' })
  }
  await loadAll()
  // keep skeleton just a beat for nicer perception
  setTimeout(() => (isBooting.value = false), 350)
})

type Discount = {
  id: string
  label?: string | null
  amount_off?: number | null
  percent_off?: number | null
  product_name?: string | null
  product_id?: string | null
  expires_at?: string | null

  title?: string | null
  description?: string | null
  code?: string | null
  type?: 'percent' | 'fixed_amount' | 'free_shipping' | null
  starts_at?: string | null
  status?: 'draft' | 'active' | 'disabled' | null
  is_public?: boolean | null
  max_uses_per_user?: number | null

  /* UI-only */
  min_spend?: number | null
  brand_label?: string | null
  tag?: string | null
}

type GiftCert = {
  id: string
  code: string
  amount: number
  redeemed: boolean
}

const busy = ref(false)
const discounts = ref<Discount[]>([])
const productDiscounts = ref<Discount[]>([])
const gcs = ref<GiftCert[]>([])
const affiliateUrl = ref<string | null>(null)
const referralStats = ref({ total: 0, converted: 0, commission: 0 })
const userRedemptions = ref<Record<string, number>>({})

const goalPerRef = ref<number | null>(null)

function money(v: number | string | null | undefined) {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

function expiryLabel(d: Discount) {
  if (!d.expires_at) return 'No expiry'
  const end = new Date(d.expires_at).getTime()
  if (!isFinite(end)) return 'No expiry'
  const ms = end - Date.now()
  if (ms <= 0) return 'Expired'
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`
  const hours = Math.floor(ms / (1000 * 60 * 60))
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`
  const mins = Math.max(1, Math.floor(ms / (1000 * 60)))
  return `${mins} min left`
}

/* === REFERRALS === */
function buildAffiliateUrl(code: string | null | undefined) {
  if (!code) return null
  const origin = window?.location?.origin ?? ''
  return `${origin}/signup?ref=${encodeURIComponent(code)}`
}

async function loadReferralBits(uid: string) {
  const { data: me, error: meErr } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', uid)
    .maybeSingle()

  if (meErr) console.warn('users.referral_code load error:', meErr)
  const code = (me?.referral_code as string | null) ?? null
  affiliateUrl.value = buildAffiliateUrl(code)

  let total = 0
  const { data: vData, error: vErr } = await supabase
    .from('referral_stats')
    .select('referrals_count, referral_code')
    .eq('referrer_id', uid)
    .maybeSingle()

  if (!vErr && vData) {
    total = Number(vData.referrals_count ?? 0)
  } else {
    const { count, error: cErr } = await supabase
      .from('referrals')
      .select('referee_id', { count: 'exact', head: true })
      .eq('referrer_id', uid)
    if (cErr) console.warn('referrals count error:', cErr)
    total = Number(count ?? 0)
  }

  referralStats.value = { total, converted: 0, commission: 0 }
}

/* === DISCOUNTS === */
async function loadActiveDiscounts() {
  const nowIso = new Date().toISOString()
  const selectCols =
    'id,title,description,code,type,percent_off,amount_off,starts_at,expires_at,status,is_public,max_uses_per_user,product_id'

  const orderPromise = supabase
    .schema('rewards')
    .from('discounts')
    .select(selectCols)
    .eq('is_public', true)
    .eq('status', 'active')
    .is('product_id', null)
    .lte('starts_at', nowIso)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('starts_at', { ascending: false })

  const productPromise = supabase
    .schema('rewards')
    .from('discounts')
    .select(selectCols)
    .eq('is_public', true)
    .eq('status', 'active')
    .not('product_id', 'is', null)
    .lte('starts_at', nowIso)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('starts_at', { ascending: false })

  const [{ data: orderData, error: orderErr }, { data: prodData, error: prodErr }] =
    await Promise.all([orderPromise, productPromise])

  if (orderErr) {
    console.warn('loadActiveDiscounts (order-level) error:', orderErr)
    discounts.value = []
  } else {
    discounts.value = (orderData || []) as Discount[]
  }

  if (prodErr) {
    console.warn('loadActiveDiscounts (product-level) error:', prodErr)
    productDiscounts.value = []
  } else {
    productDiscounts.value = (prodData || []) as Discount[]
  }

  const ids = productDiscounts.value
    .map(d => d.product_id)
    .filter((x): x is string => !!x)

  if (ids.length > 0) {
    const { data: products, error: prodLoadErr } = await supabase
      .schema('games')
      .from('products')
      .select('id,name')
      .in('id', ids)

    if (prodLoadErr) {
      console.warn('games.products load error:', prodLoadErr)
    } else {
      const lookup: Record<string, string> = {}
      for (const p of products || []) {
        lookup[(p as { id: string }).id] = (p as { name: string }).name
      }
      for (const d of productDiscounts.value) {
        if (d.product_id && lookup[d.product_id]) {
          d.product_name = lookup[d.product_id]
        }
      }
    }
  }
}

/* === USER REDEMPTIONS === */
async function loadUserRedemptions(uid: string) {
  try {
    const { data, error } = await supabase
      .schema('rewards')
      .from('discount_redemptions')
      .select('discount_id')
      .eq('user_id', uid)

    if (error) {
      console.warn('loadUserRedemptions error:', error)
      userRedemptions.value = {}
      return
    }

    const counts: Record<string, number> = {}
    for (const row of data || []) {
      const did = (row as { discount_id: string }).discount_id
      counts[did] = (counts[did] ?? 0) + 1
    }
    userRedemptions.value = counts
  } catch (e) {
    console.warn('loadUserRedemptions exception:', e)
    userRedemptions.value = {}
  }
}

function userUseCount(discountId: string) {
  return userRedemptions.value[discountId] ?? 0
}
function exceededUserLimit(d: Discount) {
  if (d.max_uses_per_user == null) return false
  const used = userUseCount(d.id)
  return used >= d.max_uses_per_user
}
function goToShop(d: Discount) {
  if (d.code) router.push({ name: 'user.shop', query: { code: d.code } })
  else router.push({ name: 'user.shop' })
}
function shortProductId(id?: string | null) {
  if (!id) return 'Unknown Product'
  return id.slice(0, 8) + '…'
}

/* === REFEES === */
type RefereeRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  purchasesThisMonth: { count: number; totalAmount: number | null }
}
const PROFILE_BUCKET = 'user_profile'
const referees = ref<RefereeRow[]>([])
const busyReferees = ref(false)
const defaultAvatar = '/default-avatar.png'

const signedUrlCache = new Map<string, string>()
const SIGNED_URL_EXPIRES_IN = 60 * 60

async function buildProfileSignedUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null
  if (signedUrlCache.has(path)) return signedUrlCache.get(path) as string
  try {
    const { data, error } = await supabase.storage
      .from(PROFILE_BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRES_IN)

    if (error) {
      console.warn('createSignedUrl error:', error)
      const pub = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path)?.data?.publicUrl ?? null
      signedUrlCache.set(path, pub || '')
      return pub
    }
    const url = data?.signedUrl || null
    signedUrlCache.set(path, url || '')
    return url
  } catch (e) {
    console.warn('buildProfileSignedUrl exception:', e)
    const pub = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path)?.data?.publicUrl ?? null
    signedUrlCache.set(path, pub || '')
    return pub
  }
}

async function loadGoalPerRef(uid: string) {
  const { data: u, error: uErr } = await supabase
    .from('users')
    .select('membership_id')
    .eq('id', uid)
    .maybeSingle()

  if (uErr) {
    console.warn('users.membership_id load error:', uErr)
    goalPerRef.value = null
    return
  }

  const membershipId = (u?.membership_id as string | number | null) ?? null
  if (!membershipId) {
    goalPerRef.value = null
    return
  }

  const { data: tier, error: tErr } = await supabase
    .schema('membership')
    .from('tiers')
    .select('id, purchases_per_referrals')
    .eq('id', membershipId)
    .maybeSingle()

  if (tErr) {
    console.warn('membership.tiers load error:', tErr)
    goalPerRef.value = null
    return
  }

  const val = Number(tier?.purchases_per_referrals ?? 0)
  goalPerRef.value = Number.isFinite(val) && val > 0 ? val : 0
}

async function loadReferees(uid: string) {
  busyReferees.value = true
  try {
    const { data: refRows, error: refErr } = await supabase
      .from('referrals')
      .select('referee_id')
      .eq('referrer_id', uid)

    if (refErr) {
      console.warn('loadReferees referrals error:', refErr)
      referees.value = []
      return
    }

    const ids = (refRows || []).map(r => (r as { referee_id: string }).referee_id)
    if (ids.length === 0) {
      referees.value = []
      return
    }

    const { data: usersData, error: usersErr } = await supabase
      .from('users')
      .select('id, full_name, profile_url, purchases_per_month')
      .in('id', ids)

    if (usersErr) {
      console.warn('loadReferees users error:', usersErr)
      referees.value = []
      return
    }

    const rows = (usersData || []) as Array<{
      id: string
      full_name: string | null
      profile_url: string | null
      purchases_per_month: number | null
    }>

    const avatarUrls = await Promise.all(rows.map(u => buildProfileSignedUrl(u.profile_url)))

    referees.value = rows.map((u, i) => {
      const purchases_per_month = Number(u.purchases_per_month ?? 0) || 0
      return {
        id: u.id,
        full_name: u.full_name ?? null,
        avatar_url: avatarUrls[i] || null,
        purchasesThisMonth: {
          count: purchases_per_month,
          totalAmount: null,
        },
      } as RefereeRow
    })
  } finally {
    busyReferees.value = false
  }
}

function pctNumber(r: RefereeRow): number {
  if (goalPerRef.value == null || goalPerRef.value <= 0) return 0
  const pct = (r.purchasesThisMonth.count / goalPerRef.value) * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
}
function progressPct(r: RefereeRow): string {
  return `${pctNumber(r)}%`
}

async function loadAll() {
  busy.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()

    await loadActiveDiscounts()
    gcs.value = []

    const uid = auth?.user?.id
    if (uid) {
      await Promise.all([
        loadReferralBits(uid),
        loadUserRedemptions(uid),
        loadGoalPerRef(uid),
        loadReferees(uid),
      ])
    } else {
      affiliateUrl.value = null
      referralStats.value = { total: 0, converted: 0, commission: 0 }
      userRedemptions.value = {}
      referees.value = []
      goalPerRef.value = null
    }
  } finally {
    busy.value = false
  }
}

async function reload() {
  await loadAll()
}

async function copyAffiliate() {
  if (!affiliateUrl.value) return
  try {
    await navigator.clipboard.writeText(affiliateUrl.value)
    alert('Affiliate link copied!')
  } catch {
    prompt('Copy your affiliate link:', affiliateUrl.value)
  }
}
</script>

<style scoped>
:root {
  --fs-base: 1rem;
  --fs-sm: 0.875rem;
  --fs-xs: 0.75rem;
  --bg: #f5f6f7;
  --surface: #ffffff;
  --muted: #6b7280;
  --line: rgba(15, 23, 42, 0.04);
  --radius-lg: 1.25rem;
}
.deals-shell {
  min-height: 100vh;
  background: radial-gradient(circle at top, rgba(42, 144, 198, 0.08), transparent 35%), #f8fafc;
  padding: 1.6rem 1.25rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-size: var(--fs-base);
}
.deals-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #f3f7ff 100%);
  border: 1px solid rgba(32, 100, 124, 0.03);
  border-radius: 1.5rem;
  padding: 1.5rem 1.6rem;
  box-shadow: 0 12px 25px rgba(15, 23, 42, 0.02);
}
.hero-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: var(--fs-xs);
  color: rgba(32, 100, 124, 0.7);
  margin-bottom: 0.4rem;
  font-weight: 600;
}
.hero-title {
  font-size: 1.5rem; /* close to your old h4 */
  font-weight: 700;
  color: #122431;
  margin-bottom: 0.25rem;
}
.hero-sub {
  color: #828a96;
  font-size: var(--fs-sm);
  max-width: 32rem;
}
.hero-stats {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
}
.hero-pill {
  background: #ffffff;
  border: 1px solid rgba(12, 26, 36, 0.04);
  border-radius: 999px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 1.1rem;
  min-width: 7rem;
}
.hero-pill-label {
  font-size: var(--fs-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #7a8493;
}
.hero-pill-value {
  font-weight: 700;
  font-size: 1rem;
  color: #122431;
}

/* GRID LAYOUT */
.deals-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.9fr);
  gap: 1.5rem;
}
.deals-left,
.deals-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* PANEL */
.panel {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.03);
  border-radius: 1.25rem;
  padding: 1.1rem 1.15rem 1.15rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.02);
  font-size: var(--fs-base);
}
.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.25rem;
}
.panel-sub {
  font-size: var(--fs-sm);
  color: #94a3b8;
}
.ghost-btn {
  background: rgba(32, 100, 124, 0.04);
  border: 1px solid rgba(32, 100, 124, 0.08);
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
  font-size: var(--fs-xs);
  color: #1f3f4d;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 1.4rem 0.5rem 1.1rem;
  font-size: var(--fs-base);
}
.empty-icon {
  font-size: 1.8rem;
  color: rgba(32, 100, 124, 0.35);
  display: block;
  margin-bottom: 0.5rem;
}
.empty-title {
  font-weight: 600;
  margin-bottom: 0.2rem;
  color: #0f172a;
  font-size: var(--fs-base);
}
.empty-text {
  font-size: var(--fs-sm);
  color: #94a3b8;
}

/* DISCOUNT LIST */
.discount-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.discount-card {
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.02);
  border-radius: 1rem;
  padding: 0.75rem 0.8rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  font-size: var(--fs-base);
}
.discount-main {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}
.discount-badge {
  width: 42px;
  height: 42px;
  border-radius: 1rem;
  display: grid;
  place-items: center;
  color: white;
  background: linear-gradient(150deg, #0ea5e9 0%, #4f46e5 100%);
  font-size: 1.05rem;
}
.discount-badge.free_shipping {
  background: linear-gradient(150deg, #059669 0%, #10b981 100%);
}
.discount-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.1rem;
}
.discount-desc {
  font-size: var(--fs-sm);
  color: #6b7280;
}
.discount-exp {
  font-size: var(--fs-xs);
  color: #94a3b8;
  margin-top: 0.1rem;
}
.discount-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}
.discount-code {
  background: rgba(15, 23, 42, 0.04);
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
  font-size: var(--fs-xs);
  font-weight: 500;
}
.discount-usage {
  font-size: var(--fs-xs);
  color: #94a3b8;
}
.cta-btn {
  background: #0f172a;
  border: none;
  color: #fff;
  border-radius: 999px;
  font-size: var(--fs-xs);
  padding: 0.4rem 0.9rem;
  cursor: pointer;
}
.cta-btn[disabled] {
  opacity: 0.35;
  cursor: not-allowed;
}

/* PRODUCT DISCOUNTS */
.product-discount-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.85rem;
}
.product-discount-card {
  background: #f8fafc;
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.02);
  padding: 0.75rem 0.75rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: var(--fs-base);
}
.pd-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.35rem;
}
.pd-type {
  background: rgba(6, 95, 70, 0.055);
  color: #065f46;
  font-size: var(--fs-xs);
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-weight: 500;
}
.pd-pill {
  background: white;
  border: 1px solid rgba(12, 26, 36, 0.03);
  border-radius: 999px;
  font-size: var(--fs-xs);
  padding: 0.25rem 0.5rem;
  color: #94a3b8;
}
.pd-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
}
.pd-product-label {
  font-size: var(--fs-sm);
  color: #6b7280;
}
.pd-meta {
  font-size: var(--fs-xs);
  color: #94a3b8;
}
.pd-footer {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  justify-content: space-between;
}
.pd-code {
  font-size: var(--fs-xs);
  background: rgba(15, 23, 42, 0.04);
  border-radius: 999px;
  padding: 0.15rem 0.4rem;
}
.pd-usage {
  font-size: var(--fs-xs);
  color: #94a3b8;
}

.mini-btn {
  background: #0f172a;
  border: none;
  color: #fff;
  border-radius: 999px;
  font-size: var(--fs-xs);
  padding: 0.25rem 0.65rem;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;
}
.mini-btn[disabled] {
  opacity: 0.35;
  cursor: not-allowed;
}

/* RIGHT: affiliate */
.sticky-panel {
  position: sticky;
  top: 1.5rem;
  z-index: 10;
}
.affiliate-box {
  background: #f8fafc;
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.02);
  padding: 0.7rem 0.75rem 0.6rem;
  margin-bottom: 0.85rem;
}
.aff-label {
  font-size: var(--fs-sm);
  color: #94a3b8;
  display: block;
  margin-bottom: 0.35rem;
}
.aff-input-wrap {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}
.aff-input {
  flex: 1;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.03);
  border-radius: 0.65rem;
  padding: 0.45rem 0.6rem;
  font-size: var(--fs-sm);
}
.aff-hint {
  font-size: var(--fs-xs);
  margin-top: 0.35rem;
  color: #94a3b8;
}
.aff-metrics {
  display: flex;
  gap: 0.5rem;
}
.metric-card {
  flex: 1;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid rgba(15, 23, 42, 0.02);
  padding: 0.55rem 0.55rem 0.6rem;
}
.metric-label {
  font-size: var(--fs-xs);
  color: #94a3b8;
  margin-bottom: 0.25rem;
}
.metric-value {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

/* REFEES LIST */
.tag {
  background: #fff4e5;
  color: #ad5912;
  font-size: var(--fs-xs);
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
}
.ref-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.ref-item {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}
.ref-left {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}
.ref-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid rgba(15, 23, 42, 0.05);
}
.ref-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
}
.ref-sub {
  font-size: var(--fs-xs);
  color: #94a3b8;
}
.ref-progress {
  margin-top: 0.35rem;
}
.ref-progress-head {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-xs);
  color: #94a3b8;
  margin-bottom: 0.25rem;
}
.ref-progress-bar {
  height: 5px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.ref-progress-fill {
  height: 5px;
  background: #0f172a;
}
.ref-right {
  text-align: right;
}
.ref-amount {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9rem;
}
.ref-amount-sub {
  font-size: var(--fs-xs);
  color: #94a3b8;
}

/* ===== Breath-in intro ===== */
@keyframes breathInOnce {
  0% { opacity: 0; transform: scale(0.985); }
  100% { opacity: 1; transform: scale(1); }
}
.breath-in-once {
  animation: breathInOnce 1000ms cubic-bezier(.2,.7,.1,1) both;
}
@media (prefers-reduced-motion: reduce) {
  .breath-in-once { animation: none !important; opacity: 1 !important; transform: none !important; }
}

/* ===== Skeleton styles ===== */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skel-line {
  height: 12px;
  border-radius: 8px;
  background: linear-gradient(90deg, #eef2f7 0%, #e6ebf3 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}
.skel-line.sm { height: 10px; }
.skel-line.xs { height: 8px; }
.w-100 { width: 100%; }
.w-70 { width: 70%; }
.w-65 { width: 65%; }
.w-60 { width: 60%; }
.w-56 { width: 56%; }
.w-55 { width: 55%; }
.w-50 { width: 50%; }
.w-45 { width: 45%; }
.w-40 { width: 40%; }
.w-36 { width: 36%; }
.w-35 { width: 35%; }
.w-34 { width: 34%; }
.w-30 { width: 30%; }
.w-25 { width: 25%; }
.w-24 { width: 24%; }
.mt-2 { margin-top: .5rem; }
.mb-2 { margin-bottom: .5rem; }
.mb-1 { margin-bottom: .25rem; }

.skel-pill, .skel-chip {
  height: 28px;
  min-width: 110px;
  border-radius: 999px;
  background: linear-gradient(90deg, #eef2f7 0%, #e6ebf3 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}
.skel-chip { min-width: 70px; height: 22px; }

.skel-btn {
  width: 90px; height: 30px; border-radius: 999px;
  background: linear-gradient(90deg, #eef2f7 0%, #e6ebf3 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}
.skel-btn.small { width: 64px; height: 26px; }

.skel-square {
  width: 42px; height: 42px; border-radius: 12px;
  background: linear-gradient(90deg, #eef2f7 0%, #e6ebf3 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}
.skel-avatar {
  width: 40px; height: 40px; border-radius: 999px;
  background: linear-gradient(90deg, #eef2f7 0%, #e6ebf3 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}

/* RESPONSIVE */
@media (max-width: 1080px) {
  .deals-grid {
    grid-template-columns: 1fr;
  }
  .sticky-panel {
    position: static;
  }
  .hero-stats {
    justify-content: flex-start;
  }
}
@media (max-width: 640px) {
  .deals-shell {
    padding: 1.25rem 1rem 2.2rem;
  }
  .deals-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .hero-title {
    font-size: 1.35rem;
  }
  .panel {
    border-radius: 1rem;
  }
  .discount-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .discount-side {
    flex-direction: row;
    gap: 0.4rem;
  }
  .aff-metrics {
    flex-direction: column;
  }
  .product-discount-grid {
    grid-template-columns: 1fr;
  }
  .hero-stats {
    gap: 0.4rem;
  }
}
</style>
