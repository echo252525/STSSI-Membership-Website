<template>
  <div class="container py-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h4 m-0">Deals & Rewards</h1>
    </div>

    <div class="row g-3">
      <!-- ===================== Active Discounts ===================== -->
      <div class="col-12">
        <div class="card disc-card shadow-sm rounded-4 overflow-hidden">
          <!-- Hero header -->
          <div
            class="disc-hero d-flex align-items-center justify-content-between px-3 px-md-4 py-3"
          >
            <h2 class="h6 m-0">Active Discounts</h2>
            <span class="badge text-bg-light border">{{ discounts.length }} total</span>
          </div>

          <div class="card-body p-3 p-md-4">
            <div v-if="busy" class="text-center text-muted py-4">
              <div class="spinner-border mb-2"></div>
              <div>Loading…</div>
            </div>

            <div v-else-if="discounts.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-ticket-perforated" style="font-size: 1.6rem"></i>
              <div class="mt-2">No active discounts right now.</div>
              <small class="text-muted">Discounts will appear here when available.</small>
            </div>

            <!-- Horizontal voucher rail -->
            <div v-else class="voucher-rail">
              <div
                v-for="d in discounts"
                :key="d.id"
                class="ticket card border-0 shadow-sm"
                :style="{ '--ticket-accent': d.type === 'free_shipping' ? '#16a085' : '#e74c3c' }"
              >
                <div class="ticket-inner d-flex align-items-stretch">
                  <!-- LEFT colored side -->
                  <div
                    class="ticket-side text-white d-flex flex-column align-items-center justify-content-center"
                  >
                    <i
                      :class="
                        d.type === 'free_shipping' ? 'bi bi-truck fs-1' : 'bi bi-percent fs-1'
                      "
                    ></i>
                    <div class="fw-semibold text-center small mt-1">
                      {{ d.type === 'free_shipping' ? 'FREE' : d.brand_label || 'Mega Discount' }}
                    </div>
                  </div>

                  <!-- RIGHT content -->
                  <div class="ticket-body flex-grow-1 position-relative">
                    <div class="d-flex align-items-start justify-content-between gap-3">
                      <div class="me-auto">
                        <div class="h6 fw-bold mb-1">{{ d.title }}</div>

                        <span
                          v-if="d.tag"
                          class="badge rounded-pill border text-danger bg-white mb-2"
                          >{{ d.tag }}</span
                        >

                        <div class="text-muted">
                          <span v-if="d.min_spend != null">Min. Spend ₱{{ d.min_spend }}</span>
                          <span v-else-if="d.description">{{ d.description }}</span>
                        </div>

                        <div class="small text-muted mt-2">
                          Valid {{ expiryLabel(d) }} <a href="#" class="fw-semibold ms-2">T&C</a>
                        </div>
                      </div>

                      <div class="d-flex align-items-center">
                        <button
                          class="btn btn-claim px-4"
                          @click="goToShop(d)"
                          :disabled="exceededUserLimit(d)"
                          :aria-disabled="exceededUserLimit(d)"
                          :title="
                            exceededUserLimit(d)
                              ? 'You have reached the allowed uses for this discount'
                              : 'Use this discount'
                          "
                        >
                          {{ exceededUserLimit(d) ? 'Used' : 'Claim' }}
                        </button>
                      </div>
                    </div>

                    <!-- Code + usage -->
                    <div class="small mt-2">
                      <span v-if="d.code"
                        >Code: <code>{{ d.code }}</code></span
                      >
                      <span
                        v-if="typeof d.max_uses_per_user === 'number'"
                        class="ms-2"
                        :class="exceededUserLimit(d) ? 'text-danger' : 'text-muted'"
                      >
                        Used {{ userUseCount(d.id) }} / {{ d.max_uses_per_user }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- /rail -->
          </div>
        </div>
      </div>
      <!-- =================== /Active Discounts ====================== -->

      <!-- Affiliate Link & Referral Summary (redesigned) -->
      <div class="flex-grow-1 col-12 col-lg-6">
        <div class="card ref-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <!-- Hero header -->
          <div
            class="ref-hero d-flex align-items-center justify-content-between gap-3 px-3 px-md-4 py-3"
          >
            <div>
              <div class="eyebrow text-uppercase fw-semibold small mb-1">Invite & Earn</div>
              <h3 class="h6 m-0">Affiliate & Referrals</h3>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button
                class="btn btn-light btn-sm ref-btn"
                @click="copyAffiliate"
                :disabled="!affiliateUrl"
                title="Copy your referral link"
              >
                <i class="bi bi-clipboard"></i> <span class="ms-1 d-none d-sm-inline">Copy</span>
              </button>
              <a
                v-if="affiliateUrl"
                class="btn btn-light btn-sm ref-btn"
                :href="affiliateUrl"
                target="_blank"
                rel="noopener"
                title="Open your referral link"
              >
                <i class="bi bi-box-arrow-up-right"></i>
                <span class="ms-1 d-none d-sm-inline">Open</span>
              </a>
            </div>
          </div>

          <div class="card-body p-3 p-md-4">
            <!-- Pretty link field -->
            <div class="ref-link input-group mb-3 rounded-3 overflow-hidden">
              <span class="input-group-text bg-white"><i class="bi bi-link-45deg"></i></span>
              <input
                type="text"
                class="form-control ref-input"
                :value="affiliateUrl || 'Unavailable'"
                readonly
              />
              <button class="btn btn-primary" @click="copyAffiliate" :disabled="!affiliateUrl">
                Copy
              </button>
            </div>

            <!-- Metrics -->
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <div class="metric d-flex align-items-center gap-3 p-3 rounded-3">
                  <div class="icon-wrap"><i class="bi bi-people"></i></div>
                  <div>
                    <div class="label small text-muted">Total Referrals</div>
                    <div class="value fs-4 fw-semibold">{{ referralStats.total }}</div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="metric d-flex align-items-center gap-3 p-3 rounded-3">
                  <div class="icon-wrap"><i class="bi bi-bag-check"></i></div>
                  <div>
                    <div class="label small text-muted">Converted Sales</div>
                    <div class="value fs-4 fw-semibold">{{ referralStats.converted }}</div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="metric d-flex align-items-center gap-3 p-3 rounded-3">
                  <div class="icon-wrap"><i class="bi bi-wallet2"></i></div>
                  <div>
                    <div class="label small text-muted">Earned Commission</div>
                    <div class="value fs-4 fw-semibold">
                      ₱ {{ money(referralStats.commission) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-3 small text-muted">
              Share your link to earn commissions on sales. Commissions are credited to your
              E-Wallet.
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- /row -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { currentUser } from '@/lib/authState'

const router = useRouter()
const user = computed(() => currentUser.value)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return router.push({ name: 'login' })
  }
})

type Discount = {
  id: string
  label?: string | null
  amount_off?: number | null
  percent_off?: number | null
  product_name?: string | null
  expires_at?: string | null

  title?: string | null
  description?: string | null
  code?: string | null
  type?: 'percent' | 'fixed_amount' | 'free_shipping' | null
  starts_at?: string | null
  status?: 'draft' | 'active' | 'disabled' | null
  is_public?: boolean | null
  // NEW: to enforce per-user limits
  max_uses_per_user?: number | null

  /* 👉 new (UI only) */
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
const discounts = ref<Discount[]>([]) // now wired to rewards.discounts
const gcs = ref<GiftCert[]>([]) // kept (no real data)
const affiliateUrl = ref<string | null>(null) // now wired
const referralStats = ref({ total: 0, converted: 0, commission: 0 }) // total now wired

// NEW: track user's redemption counts per discount_id
const userRedemptions = ref<Record<string, number>>({})

function money(v: number | string | null | undefined) {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

function isExpired(d: Discount) {
  if (!d.expires_at) return false
  const t = new Date(d.expires_at).getTime()
  return isFinite(t) && t < Date.now()
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

/* =========================
   === REFERRALS START ===
   Pulls referral_code from public.users,
   builds share link, and counts referrals.
   Tries the referral_stats view first; if missing,
   falls back to counting public.referrals.
   ========================= */
type ReferralStatsView = {
  referrer_id: string
  referral_code: string | null
  referrals_count: number | null
}

// Build a shareable link given a referral code
function buildAffiliateUrl(code: string | null | undefined) {
  if (!code) return null
  const origin = window?.location?.origin ?? ''
  return `${origin}/signup?ref=${encodeURIComponent(code)}`
}

async function loadReferralBits(uid: string) {
  // 1) get referral_code from public.users
  const { data: me, error: meErr } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', uid)
    .maybeSingle()

  if (meErr) {
    console.warn('users.referral_code load error:', meErr)
  }
  const code = (me?.referral_code as string | null) ?? null
  affiliateUrl.value = buildAffiliateUrl(code)

  // 2) count referrals (prefer view, fallback to table count)
  let total = 0

  // Try referral_stats view (if you created it)
  const { data: vData, error: vErr } = await supabase
    .from('referral_stats')
    .select('referrals_count, referral_code')
    .eq('referrer_id', uid)
    .maybeSingle()

  if (!vErr && vData) {
    total = Number(vData.referrals_count ?? 0)
  } else {
    // Fallback: count from public.referrals
    const { count, error: cErr } = await supabase
      .from('referrals')
      .select('referee_id', { count: 'exact', head: true })
      .eq('referrer_id', uid)

    if (cErr) {
      console.warn('referrals count error:', cErr)
    }
    total = Number(count ?? 0)
  }

  // Update the UI
  referralStats.value = {
    total,
    converted: 0, // keep zero unless you wire conversions
    commission: 0, // keep zero unless you compute commissions
  }
}
/* =======================
   === REFERRALS END ===
   ======================= */

/* =========================
   === DISCOUNTS (NEW) ===
   Load active, public discounts from rewards.discounts
   ========================= */
async function loadActiveDiscounts() {
  const nowIso = new Date().toISOString()

  // Requires: rewards schema exposed to API, RLS select policy
  // filtering: public + active + time window
  const { data, error } = await supabase
    .schema('rewards')
    .from('discounts')
    .select(
      'id,title,description,code,type,percent_off,amount_off,starts_at,expires_at,status,is_public,max_uses_per_user',
    )
    .eq('is_public', true)
    .eq('status', 'active')
    .lte('starts_at', nowIso)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('starts_at', { ascending: false })

  if (error) {
    console.warn('loadActiveDiscounts error:', error)
    discounts.value = []
    return
  }

  discounts.value = (data || []) as Discount[]
}

/* ================================
   === USER REDEMPTION COUNTS ===
   Reads the user's redemption rows and tallies per discount_id
   Table assumed: rewards.discount_redemptions(user_id, discount_id, ...)
   If missing, this silently keeps counts at 0.
   ================================ */
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

// helpers for template
function userUseCount(discountId: string) {
  return userRedemptions.value[discountId] ?? 0
}

function exceededUserLimit(d: Discount) {
  if (d.max_uses_per_user == null) return false
  const used = userUseCount(d.id)
  return used >= d.max_uses_per_user
}

function valueBadge(d: Discount) {
  if (d.type === 'percent') {
    return `${Number(d.percent_off ?? 0)}% OFF`
  }
  if (d.type === 'fixed_amount') {
    return `₱${money(d.amount_off ?? 0)} OFF`
  }
  if (d.type === 'free_shipping') {
    return 'Free Shipping'
  }
  // fallback to old label if present
  if (d.label) return d.label
  return 'Discount'
}

function goToShop(d: Discount) {
  // Pass the discount code to Shop (adjust route name/path if yours differs)
  if (d.code) {
    router.push({ name: 'user.shop', query: { code: d.code } })
  } else {
    router.push({ name: 'user.shop' })
  }
}

/* =========================
   === LOAD ALL (kept) ===
   ========================= */
async function loadAll() {
  busy.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    // You can use auth?.user?.id later for gated loads if needed

    // === ADDED: load active discounts ===
    await loadActiveDiscounts()

    // kept (placeholders)
    gcs.value = []

    // === ADDED: wire referrals + redemption counts ===
    const uid = auth?.user?.id
    if (uid) {
      await Promise.all([
        loadReferralBits(uid),
        loadUserRedemptions(uid), // NEW: get per-user counts
      ])
    } else {
      affiliateUrl.value = null
      referralStats.value = { total: 0, converted: 0, commission: 0 }
      userRedemptions.value = {}
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

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.list-group-item {
  border-left: 0;
  border-right: 0;
}
.list-group-item:first-child {
  border-top: 0;
}
.list-group-item:last-child {
  border-bottom: 0;
}

/* Active Discounts — hero + horizontal rail */
.disc-card {
  border: 0;
}
.disc-hero {
  background:
    radial-gradient(1200px 70px at -10% 0%, rgba(32, 100, 124, 0.12), transparent 60%),
    linear-gradient(135deg, #f6fafc 0%, #f3fbf6 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.disc-hero .badge {
  background: #fff;
}

/* Rail: one line, scrollable */
.voucher-rail {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 2px 2px 6px;
  scroll-snap-type: x proximity;
}
.voucher-rail .ticket {
  min-width: 560px;
  border-radius: 14px;
  scroll-snap-align: start;
}
@media (max-width: 576px) {
  .voucher-rail .ticket {
    min-width: 92vw;
  }
}

/* Ticket internals */
.ticket-inner {
  border-radius: 14px;
  overflow: hidden;
}

/* Left colored block with perforations */
.ticket-side {
  width: 160px;
  background-color: #20a44c;
  position: relative;
  padding: 18px 14px;
  text-align: center;
}
.ticket-side::before,
.ticket-side::after {
  content: '';
  position: absolute;
  top: -12px;
  bottom: -12px;
  width: 12px;
  background: radial-gradient(circle at 6px 12px, #fff 6px, transparent 7px) repeat-y;
  background-size: 12px 24px;
  pointer-events: none;
}
.ticket-side::before {
  left: -6px;
} /* outer perforation */
.ticket-side::after {
  right: -6px;
} /* inner perforation */

.ticket-body {
  background: #fff;
  padding: 16px 18px;
}

/* Claim button */
.btn-claim {
  background-color: #20647c;
  border: none;
  color: #fff;
  border-radius: 0.6rem;
}
.btn-claim[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Affiliate & Referrals — refreshed */
.ref-card {
  background: #fff;
}

/* Gradient hero with subtle pattern */
.ref-hero {
  background:
    radial-gradient(1200px 70px at -10% 0%, rgba(32, 100, 124, 0.14), transparent 60%),
    linear-gradient(135deg, #f6fafc 0%, #f3fbf6 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.ref-hero .eyebrow {
  color: #20647c;
  letter-spacing: 0.6px;
  opacity: 0.8;
}
.ref-btn {
  border-radius: 0.65rem;
}

/* Link input */
.ref-link .ref-input {
  background: #fff;
  border-left: 0;
}
.ref-link .input-group-text {
  border-right: 0;
  color: #20647c;
}

/* Metrics */
.metric {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
}
.metric .icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #20647c;
  background: linear-gradient(135deg, rgba(32, 100, 124, 0.12), rgba(32, 164, 76, 0.12));
}
.metric .icon-wrap .bi {
  font-size: 1.15rem;
}

/* Small polish */
.ref-link .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
