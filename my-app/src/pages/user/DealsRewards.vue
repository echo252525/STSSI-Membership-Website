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
      <!-- ===================== Active Discounts (NOW SHOWS VOUCHER TABLE) ===================== -->
      <div class="col-12">
        <div class="card shadow-sm rounded-4">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h2 class="h6 m-0">Active Discounts</h2>
              <!-- show count based on vouchers since the table shown here is the voucher table -->
              <span class="badge text-bg-light">{{ vouchers.length }} total</span>
            </div>

            <!-- Reused voucher UI placed inside Active Discounts section -->
            <div v-if="busy" class="text-center text-muted py-4">
              <div class="spinner-border mb-2"></div>
              <div>Loading your vouchers…</div>
            </div>

            <div v-else-if="vouchers.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-ticket-perforated" style="font-size:1.6rem"></i>
              <div class="mt-2">No active discounts right now.</div>
              <small class="text-muted">Join events to earn vouchers and discounts.</small>
            </div>

            <ul v-else class="list-group list-group-flush">
              <li
                v-for="v in vouchers"
                :key="v.id"
                class="list-group-item d-flex align-items-center justify-content-between flex-wrap gap-3"
              >
                <!-- Left: product image + name -->
                <div class="d-flex align-items-center gap-3">
                  <img
                    v-if="v.product?.signed_url"
                    :src="v.product.signed_url"
                    alt="Product image"
                    class="voucher-thumb"
                  />
                  <div>
                    <div class="fw-semibold">{{ v.product?.name || 'Product' }}</div>
                  </div>
                </div>

                <!-- Middle: price (orig / discounted) -->
                <div class="text-end ms-auto">
                  <div class="small text-muted">Price</div>
                  <div class="d-flex align-items-baseline gap-2 justify-content-end">
                    <s v-if="v.product?.price && v.winner_price && Number(v.winner_price) > 0" class="text-muted">
                      ₱ {{ money(v.product?.price) }}
                    </s>
                    <span class="fs-5 fw-bold">
                      ₱ {{
                        (v.winner_price && Number(v.winner_price) > 0)
                          ? money(v.winner_price)
                          : money(v.product?.price)
                      }}
                    </span>
                  </div>
                </div>

                <!-- Right: expiry + Use button -->
                <div class="text-end">
                  <div class="badge rounded-pill"
                       :class="isVoucherExpired(v) ? 'text-bg-secondary' : 'text-bg-warning'">
                    <i class="bi bi-hourglass-split me-1"></i>
                    {{ voucherExpiryLabel(v) }}
                  </div>
                  <div class="mt-2">
                    <a
                      v-if="v.product?.product_url"
                      class="btn btn-primary btn-sm"
                      :href="v.product.product_url"
                      target="_blank"
                      rel="noopener"
                    >
                      Use
                    </a>
                    <button
                      v-else
                      class="btn btn-secondary btn-sm"
                      disabled
                      title="No product URL available"
                    >
                      Use
                    </button>
                  </div>
                </div>
              </li>
            </ul>

            <div v-if="vouchers.length" class="mt-3 small text-muted">
              * Discounts shown here are from your vouchers. Expired ones won’t be usable.
            </div>
          </div>
        </div>
      </div>
      <!-- =================== /Active Discounts (Voucher Table) ====================== -->

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

      <!-- Affiliate Link & Referral Summary (UI retained; no real data) -->
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

type VoucherRow = {
  id: string
  event_id: string
  product_id: string | null
  user_id: string
  created_at: string
  updated_at: string
  expires_at: string
}

type EventRow = {
  id: string
  product_id: string | null
  winner_price: number | null
}

type ProductRow = {
  id: string
  name: string
  price: number
  product_url: string | null  // stored path in storage, not direct public URL
}

type VoucherView = {
  id: string
  event_id: string
  expires_at: string
  winner_price: number | null
  product: (ProductRow & { signed_url?: string | null }) | null
}

const busy = ref(false)
const discounts = ref<Discount[]>([])         // kept, but not used (no real data)
const gcs = ref<GiftCert[]>([])               // kept, but no real data
const affiliateUrl = ref<string | null>(null) // kept, but no real data
const referralStats = ref({ total: 0, converted: 0, commission: 0 }) // zeros only

// Vouchers state (RETAINED and used)
const vouchers = ref<VoucherView[]>([])

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

// Voucher expiry helpers
function isVoucherExpired(v: VoucherView) {
  const t = new Date(v.expires_at).getTime()
  return isFinite(t) && t < Date.now()
}
function voucherExpiryLabel(v: VoucherView) {
  const end = new Date(v.expires_at).getTime()
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

// Signed URL generator for the 'prize_product' bucket
async function getSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null
  try {
    const { data, error } = await supabase
      .storage
      .from('prize_product')
      .createSignedUrl(path, 60 * 60) // valid 1 hour
    if (error) throw error
    return data.signedUrl
  } catch {
    return null
  }
}

// Load vouchers ONLY from Supabase
async function loadVouchers(uid: string | null) {
  if (!uid) { vouchers.value = []; return }
  try {
    // 1) get vouchers for this user
    const { data: vchs, error: vErr } = await supabase
      .schema('games')
      .from('voucher')
      .select('id,event_id,product_id,user_id,created_at,updated_at,expires_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (vErr) throw vErr

    const voucherRows = (vchs ?? []) as VoucherRow[]
    if (voucherRows.length === 0) { vouchers.value = []; return }

    // 2) collect event ids
    const eventIds = Array.from(new Set(voucherRows.map(v => v.event_id).filter(Boolean)))
    let eventsById = new Map<string, EventRow>()

    if (eventIds.length) {
      const { data: evts, error: eErr } = await supabase
        .schema('games')
        .from('event')
        .select('id, product_id, winner_price')
        .in('id', eventIds)
      if (eErr) throw eErr
      for (const e of (evts ?? []) as EventRow[]) {
        eventsById.set(e.id, {
          id: e.id,
          product_id: e.product_id,
          winner_price: e.winner_price != null ? Number(e.winner_price) : null,
        })
      }
    }

    // 3) decide which products we need (prefer voucher.product_id; else event.product_id)
    const productIds = Array.from(new Set(
      voucherRows.map(v => (v.product_id || eventsById.get(v.event_id)?.product_id) as string | null)
                 .filter((x): x is string => !!x)
    ))

    let productsById = new Map<string, ProductRow>()
    if (productIds.length) {
      const { data: prods, error: pErr } = await supabase
        .schema('games')
        .from('products')
        .select('id,name,price,product_url')
        .in('id', productIds)
      if (pErr) throw pErr
      for (const p of (prods ?? []) as any[]) {
        productsById.set(p.id, {
          id: p.id,
          name: p.name,
          price: Number(p.price),
          product_url: p.product_url ?? null,
        })
      }
    }

    // 4) build view models with signed URLs for the product picture
    const enriched: VoucherView[] = []
    for (const v of voucherRows) {
      const ev = eventsById.get(v.event_id) || null
      const prodId = v.product_id || ev?.product_id || null
      let prod: VoucherView['product'] = null
      if (prodId) {
        const p = productsById.get(prodId) ?? null
        if (p) {
          prod = {
            ...p,
            signed_url: await getSignedUrl(p.product_url),
          }
        }
      }
      enriched.push({
        id: v.id,
        event_id: v.event_id,
        expires_at: v.expires_at,
        winner_price: ev?.winner_price ?? null,
        product: prod,
      })
    }
    vouchers.value = enriched
  } catch {
    vouchers.value = []
  }
}

// Load all: ONLY vouchers from Supabase; everything else is placeholder/sanitized
async function loadAll() {
  busy.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth?.user?.id || null

    // Vouchers (allowed)
    await loadVouchers(uid)

    // No real loads for the rest
    discounts.value = []
    gcs.value = []
    affiliateUrl.value = null
    referralStats.value = { total: 0, converted: 0, commission: 0 }
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

/* Voucher thumbnail */
.voucher-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.08);
}
</style>
