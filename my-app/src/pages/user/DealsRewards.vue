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

            <div v-else class="text-center text-muted py-4">
              <i class="bi bi-ticket-perforated" style="font-size:1.6rem"></i>
              <div class="mt-2">No active discounts right now.</div>
              <small class="text-muted">Discounts will appear here when available.</small>
            </div>
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
              <i class="bi bi-card-text" style="font-size:1.6rem"></i>
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
                <button class="btn btn-outline-primary btn-sm" @click="copyAffiliate" :disabled="!affiliateUrl">
                  <i class="bi bi-clipboard"></i>
                  <span class="ms-2">Copy link</span>
                </button>
                <a v-if="affiliateUrl" class="btn btn-outline-secondary btn-sm" :href="affiliateUrl" target="_blank" rel="noopener">
                  <i class="bi bi-box-arrow-up-right"></i>
                  <span class="ms-2">Open</span>
                </a>
              </div>
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="bi bi-link-45deg"></i></span>
              <input type="text" class="form-control" :value="affiliateUrl || 'Unavailable'" readonly />
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
              Share your link to earn commissions on sales. Commissions are credited to your E-Wallet.
            </div>
          </div>
        </div>
      </div>
    </div> <!-- /row -->
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
}

type GiftCert = {
  id: string
  code: string
  amount: number
  redeemed: boolean
}

const busy = ref(false)
const discounts = ref<Discount[]>([])         // kept (no real data wired)
const gcs = ref<GiftCert[]>([])               // kept (no real data)
const affiliateUrl = ref<string | null>(null) // now wired
const referralStats = ref({ total: 0, converted: 0, commission: 0 }) // total now wired

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
  return `${origin}/?ref=${encodeURIComponent(code)}`
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
    converted: 0,   // keep zero unless you wire conversions
    commission: 0,  // keep zero unless you compute commissions
  }
}
/* =======================
   === REFERRALS END ===
   ======================= */

// Load all: (voucher logic removed)
async function loadAll() {
  busy.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    // You can use auth?.user?.id later for gated loads if needed

    // No real loads for these (sanitized placeholders)
    discounts.value = []
    gcs.value = []

    // === ADDED: wire referrals ===
    const uid = auth?.user?.id
    if (uid) {
      await loadReferralBits(uid)
    } else {
      affiliateUrl.value = null
      referralStats.value = { total: 0, converted: 0, commission: 0 }
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
.list-group-item:first-child { border-top: 0; }
.list-group-item:last-child { border-bottom: 0; }

/* Voucher thumbnail (left in case you reintroduce images elsewhere) */
.voucher-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.08);
}
</style>
