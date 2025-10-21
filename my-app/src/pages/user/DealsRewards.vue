<template>
  <div class="container py-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h4 m-0">Deals & Rewards</h1>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="reload" :disabled="busy">
          <span v-if="busy" class="spinner-border spinner-border-sm me-2"></span>
          Refresh
        </button>
      </div>
    </div>

    <div class="row g-3">
      <!-- ===================== Active Discounts (voucher table removed) ===================== -->
      <div class="col-12">
        <div class="card shadow-sm rounded-4">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h2 class="h6 m-0">Active Discounts</h2>
              <span class="badge text-bg-light">{{ discounts.length }} total</span>
            </div>

            <div v-if="busy" class="text-center text-muted py-4">
              <div class="spinner-border mb-2"></div>
              <div>Loading…</div>
            </div>

            <div v-else-if="discounts.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-ticket-perforated" style="font-size: 1.6rem"></i>
              <div class="mt-2">No active discounts right now.</div>
              <small class="text-muted">Discounts will appear here when available.</small>
            </div>

            <!-- ✅ Show discounts when present -->
            <ul v-else class="list-group list-group-flush">
              <li
                v-for="d in discounts"
                :key="d.id"
                class="list-group-item d-flex align-items-center justify-content-between"
              >
                <div class="me-3">
                  <div class="fw-semibold">
                    {{ d.title }}
                    <span class="badge bg-secondary ms-2">{{ valueBadge(d) }}</span>
                    <!-- NEW: small status pill when user exceeded limit -->
                    <span
                      v-if="exceededUserLimit(d)"
                      class="badge text-bg-warning ms-2"
                      title="You have reached the maximum number of uses for this discount"
                    >
                      Limit reached
                    </span>
                  </div>
                  <div class="small text-muted" v-if="d.description">{{ d.description }}</div>
                  <div class="small mt-1">
                    <span v-if="d.code"
                      >Code: <code>{{ d.code }}</code></span
                    >
                    <span class="text-muted ms-2">• {{ expiryLabel(d) }}</span>
                  </div>

                  <!-- NEW: usage note -->
                  <div
                    v-if="typeof d.max_uses_per_user === 'number'"
                    class="small mt-1"
                    :class="exceededUserLimit(d) ? 'text-danger' : 'text-muted'"
                  >
                    Used {{ userUseCount(d.id) }} / {{ d.max_uses_per_user }} times
                    <span v-if="exceededUserLimit(d)">• You’ve exceeded your allowed uses.</span>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-2">
                  <button
                    class="btn btn-primary btn-sm"
                    @click="goToShop(d)"
                    :disabled="exceededUserLimit(d)"
                    :title="
                      exceededUserLimit(d)
                        ? 'You have reached the allowed uses for this discount'
                        : 'Use this discount'
                    "
                    :aria-disabled="exceededUserLimit(d)"
                  >
                    {{ exceededUserLimit(d) ? 'Use (limit reached)' : 'Use' }}
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- =================== /Active Discounts ====================== -->

      <!-- Gift Certificates (UI retained, real data removed) -->
      <div class="col-12 col-lg-6">
        <div class="card shadow-sm rounded-4 h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h2 class="h6 m-0">Gift Certificates</h2>
              <span class="badge text-bg-light">{{ gcs.length }} available</span>
            </div>

            <div v-if="busy" class="text-center text-muted py-4">
              <div class="spinner-border mb-2"></div>
              <div>Loading…</div>
            </div>

            <div v-else-if="gcs.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-card-text" style="font-size: 1.6rem"></i>
              <div class="mt-2">No gift certificates to show.</div>
              <small class="text-muted">Earn gift certificates via referrals.</small>
            </div>

            <ul v-else class="list-group list-group-flush">
              <!-- intentionally empty to avoid real Supabase data -->
            </ul>

            <div v-if="gcs.length" class="mt-3 small text-muted">
              * Gift certificates can be applied at checkout.
            </div>
          </div>
        </div>
      </div>

      <!-- Affiliate Link & Referral Summary (UI retained; now wired) -->
      <div class="col-12 col-lg-6">
        <div class="card shadow-sm rounded-4 h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <h2 class="h6 m-0">Affiliate & Referrals</h2>
              <div class="d-flex align-items-center gap-2">
                <button
                  class="btn btn-outline-primary btn-sm"
                  @click="copyAffiliate"
                  :disabled="!affiliateUrl"
                >
                  <i class="bi bi-clipboard"></i>
                  <span class="ms-2">Copy link</span>
                </button>
                <a
                  v-if="affiliateUrl"
                  class="btn btn-outline-secondary btn-sm"
                  :href="affiliateUrl"
                  target="_blank"
                  rel="noopener"
                >
                  <i class="bi bi-box-arrow-up-right"></i>
                  <span class="ms-2">Open</span>
                </a>
              </div>
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="bi bi-link-45deg"></i></span>
              <input
                type="text"
                class="form-control"
                :value="affiliateUrl || 'Unavailable'"
                readonly
              />
            </div>

            <div class="row g-3">
              <div class="col-12 col-md-4">
                <div class="p-3 rounded-3 border">
                  <div class="small text-muted">Total Referrals</div>
                  <div class="fs-4 fw-semibold">{{ referralStats.total }}</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="p-3 rounded-3 border">
                  <div class="small text-muted">Converted Sales</div>
                  <div class="fs-4 fw-semibold">{{ referralStats.converted }}</div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="p-3 rounded-3 border">
                  <div class="small text-muted">Earned Commission</div>
                  <div class="fs-4 fw-semibold">₱ {{ money(referralStats.commission) }}</div>
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
  // original props kept
  label?: string | null
  amount_off?: number | null
  percent_off?: number | null
  product_name?: string | null
  expires_at?: string | null

  // ✅ added to match rewards.discounts for display
  title?: string | null
  description?: string | null
  code?: string | null
  type?: 'percent' | 'fixed_amount' | 'free_shipping' | null
  starts_at?: string | null
  status?: 'draft' | 'active' | 'disabled' | null
  is_public?: boolean | null
  // NEW: to enforce per-user limits
  max_uses_per_user?: number | null
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

/* Voucher thumbnail (left in case you reintroduce images elsewhere) */
.voucher-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
