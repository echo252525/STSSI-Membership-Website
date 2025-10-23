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
                          {{ exceededUserLimit(d) ? 'Used' : 'Use' }}
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

      <!-- ================= NEW: Referees & This Month Purchases ================= -->
      <div class="flex-grow-1 col-12 col-lg-6">
        <div class="card ref-list-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div
            class="ref-hero d-flex align-items-center justify-content-between gap-3 px-3 px-md-4 py-3"
          >
            <div>
              <div class="eyebrow text-uppercase fw-semibold small mb-1">Your Network</div>
              <h3 class="h6 m-0">Referees & Purchases This Month</h3>
            </div>
            <span class="badge bg-white border text-muted">{{ referees.length }} total</span>
          </div>

          <div class="card-body p-3 p-md-4">
            <div v-if="busyReferees" class="text-center text-muted py-4">
              <div class="spinner-border mb-2"></div>
              <div>Loading referees…</div>
            </div>

            <div v-else-if="referees.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-person-plus" style="font-size: 1.6rem"></i>
              <div class="mt-2">No referees yet.</div>
              <small class="text-muted">Share your link to start building your network.</small>
            </div>

            <ul v-else class="list-group list-group-flush">
              <li
                v-for="r in referees"
                :key="r.id"
                class="list-group-item d-flex align-items-center justify-content-between py-3"
              >
                <div class="d-flex align-items-center gap-3">
                  <img
                    :src="r.avatar_url || defaultAvatar"
                    class="avatar-40 rounded-circle border"
                    alt=""
                    referrerpolicy="no-referrer"
                  />
                  <div>
                    <div class="fw-semibold">{{ r.full_name || 'Unnamed User' }}</div>
                    <div class="small text-muted">Joined via your link</div>
                    <!-- Progress toward goal -->
                    <div v-if="goalPerRef != null" class="mt-2" style="min-width:220px;">
                      <div class="d-flex justify-content-between small mb-1">
                        <span class="text-muted">Progress</span>
                        <span class="fw-semibold">₱
                          {{ r.purchasesThisMonth.count }} / ₱ {{ goalPerRef }}
                        </span>
                      </div>
                      <div class="progress progress-thin" style="height:8px;">
                        <div
                          class="progress-bar"
                          role="progressbar"
                          :style="{ width: progressPct(r) }"
                          :aria-valuenow="pctNumber(r)"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="text-end">
                  <div class="fw-semibold">
                    ₱ {{ r.purchasesThisMonth.count }}
                  </div>
                  <div class="small text-muted" v-if="r.purchasesThisMonth.totalAmount != null">
                    ₱ {{ money(r.purchasesThisMonth.totalAmount) }} total
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- =============== /NEW: Referees & This Month Purchases ================= -->
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
const gcs = ref<GiftCert[]>([])
const affiliateUrl = ref<string | null>(null)
const referralStats = ref({ total: 0, converted: 0, commission: 0 })
const userRedemptions = ref<Record<string, number>>({})

/** NEW: goal per referee from membership.tiers.purchases_per_referrals */
const goalPerRef = ref<number | null>(null)

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
   ========================= */
type ReferralStatsView = {
  referrer_id: string
  referral_code: string | null
  referrals_count: number | null
}

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
/* =======================
   === REFERRALS END ===
   ======================= */

/* =========================
   === DISCOUNTS (NEW) ===
   ========================= */
async function loadActiveDiscounts() {
  const nowIso = new Date().toISOString()
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

function userUseCount(discountId: string) {
  return userRedemptions.value[discountId] ?? 0
}
function exceededUserLimit(d: Discount) {
  if (d.max_uses_per_user == null) return false
  const used = userUseCount(d.id)
  return used >= d.max_uses_per_user
}
function valueBadge(d: Discount) {
  if (d.type === 'percent') return `${Number(d.percent_off ?? 0)}% OFF`
  if (d.type === 'fixed_amount') return `₱${money(d.amount_off ?? 0)} OFF`
  if (d.type === 'free_shipping') return 'Free Shipping'
  if (d.label) return d.label
  return 'Discount'
}
function goToShop(d: Discount) {
  if (d.code) router.push({ name: 'user.shop', query: { code: d.code } })
  else router.push({ name: 'user.shop' })
}

/* =========================
   === NEW: REFEREES LOAD ===
   Uses users.profile_url (storage path) and users.purchases_per_month
   Goal comes from membership.tiers.purchases_per_referrals using current user's membership_id
   ========================= */
type RefereeRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  purchasesThisMonth: { count: number; totalAmount: number | null }
}

const PROFILE_BUCKET = 'user_profile' // change if your bucket has a different name
const referees = ref<RefereeRow[]>([])
const busyReferees = ref(false)
const defaultAvatar = '/default-avatar.png'

function startOfMonthISO(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
  return x.toISOString()
}
function endOfMonthISO(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
  return x.toISOString()
}

/** NEW: Signed URL helper with a tiny in-memory cache (per page load). */
const signedUrlCache = new Map<string, string>()
const SIGNED_URL_EXPIRES_IN = 60 * 60 // 1 hour (seconds)

async function buildProfileSignedUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null
  if (signedUrlCache.has(path)) return signedUrlCache.get(path) as string

  try {
    const { data, error } = await supabase.storage
      .from(PROFILE_BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRES_IN)

    if (error) {
      console.warn('createSignedUrl error:', error)
      // Fallback to public URL if bucket/object is public or dev default
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

/** NEW: load goal per referee for the current user (from membership.tiers) */
async function loadGoalPerRef(uid: string) {
  // 1) find current user's membership_id
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

  // 2) load purchases_per_referrals from membership.tiers
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
    // 1) Get referee IDs
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

    // 2) Load users with profile_url and purchases_per_month
    const { data: usersData, error: usersErr } = await supabase
      .from('users')
      .select('id, full_name, profile_url, purchases_per_month')
      .in('id', ids)

    if (usersErr) {
      console.warn('loadReferees users error:', usersErr)
      referees.value = []
      return
    }

    // 3) Resolve signed URLs concurrently
    const rows = (usersData || []) as Array<{
      id: string
      full_name: string | null
      profile_url: string | null
      purchases_per_month: number | null
    }>

    const avatarUrls = await Promise.all(
      rows.map(u => buildProfileSignedUrl(u.profile_url)),
    )

    referees.value = rows.map((u, i) => {
      const purchases_per_month = Number(u.purchases_per_month ?? 0) || 0
      return {
        id: u.id,
        full_name: u.full_name ?? null,
        avatar_url: avatarUrls[i] || null, // signed URL (or fallback public)
        purchasesThisMonth: {
          count: purchases_per_month,
          totalAmount: null, // no purchases table
        },
      } as RefereeRow
    })
  } finally {
    busyReferees.value = false
  }
}

/** Progress helpers (UI only) */
function pctNumber(r: RefereeRow): number {
  if (goalPerRef.value == null || goalPerRef.value <= 0) return 0
  const pct = (r.purchasesThisMonth.count / goalPerRef.value) * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
}
function progressPct(r: RefereeRow): string {
  return `${pctNumber(r)}%`
}

/* =========================
   === LOAD ALL (kept) ===
   ========================= */
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
        loadGoalPerRef(uid),  // NEW: fetch goal per referee for current user
        loadReferees(uid),    // NEW: build referee list with purchases_per_month + signed avatars
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
.ticket-side::before, .ticket-side::after {
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

/* Avatars */
.avatar-40 {
  width: 40px;
  height: 40px;
  object-fit: cover;
}

/* Progress */
.progress-thin {
  background-color: #eef3f6;
}
.progress-thin .progress-bar {
  background-color: #20647c;
}

/* Secondary card bg match */
.ref-list-card {
  background: #fff;
}
</style>
