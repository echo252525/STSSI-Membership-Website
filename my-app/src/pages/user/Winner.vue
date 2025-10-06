<template>
  <div class="winner-page container py-5">
    <div class="card shadow-sm mx-auto max-w">
      <div class="card-body p-4">
        <!-- ===== Header ===== -->
        <div class="text-center mb-3">
          <div class="trophy">🏆</div>
          <h1 class="title mb-1">Congratulations!</h1>
          <p class="lead text-muted mb-0">You’re the winner 🎉</p>
        </div>

        <!-- ===== Balance Breakdown (Current already includes refund) ===== -->
        <div class="row g-3 my-4">
          <div class="col-12">
            <div class="info-tile">
              <div class="label">Balance Update</div>
              <div class="value d-flex align-items-baseline gap-2 flex-wrap">
                <span class="fw-bold">₱ {{ fmtMoney(prevBalance) }}</span>
                <span class="mx-1">+</span>
                <span class="text-success fw-bold">₱ {{ fmtMoney(refundedAmount) }}</span>
                <span class="mx-1">=</span>
                <span class="fw-bold fs-4">₱ {{ fmtMoney(currentBalance) }}</span>
              </div>
              <div class="small text-muted mt-1">
                (Previous Balance + Winner Refund = Current Balance)
              </div>
            </div>
          </div>
        </div>

        <!-- ===== Product & Discount ===== -->
        <div class="row g-3">
          <div class="col-12">
            <h6 class="fw-bold mb-2">Your Prize Discount</h6>

            <div class="card border-0 shadow-sm">
              <div class="card-body d-flex flex-wrap align-items-center gap-3">
                <div class="prod-media">
                  <div class="prod-img-wrap">
                    <img
                      v-if="productImage"
                      :src="productImage"
                      :alt="productName"
                      class="prod-img"
                    />
                    <div v-else class="prod-placeholder">🎁</div>
                  </div>
                </div>

                <div class="flex-grow-1 d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div class="prod-name fw-bold">{{ productName }}</div>
                  <div class="prices text-end">
                    <div class="orig text-muted">
                      <s v-if="originalPrice !== null">₱ {{ fmtMoney(originalPrice) }}</s>
                      <span v-else class="text-muted">—</span>
                    </div>
                    <div class="disc fs-4 fw-bold">
                      ₱ {{ fmtMoney(discountedPrice) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!product && originalPrice === null" class="text-muted small mt-2">
              Product details not available.
            </div>
          </div>
        </div>

        <!-- ===== Error ===== -->
        <div v-if="err" class="text-danger mt-3">{{ err }}</div>

        <!-- ===== CTA ===== -->
        <div class="text-center mt-4">
          <button class="btn btn-success btn-lg px-4" @click="goToMyPurchases">
            View My Order
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { currentUser } from '@/lib/authState'

const routers = useRouter()
const user = computed(() => currentUser.value)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return routers.push({ name: 'login' })
  }
})
type EventRow = {
  id: string
  product_id: string
  /** amount credited to winner and already added to users.balance */
  winner_refund_amount: number | null
  /** per-player discount used to reduce price */
  interest_per_player: number | null
}

type ProductRow = {
  id: string
  name: string
  description: string | null
  price: number // numeric(12,2)
  /** Can be string or string[] of storage paths/URLs */
  product_url: string | string[] | null
  supplier_price?: number | null
}

const route = useRoute()
const router = useRouter()

const myUserId = ref<string | null>(null)
const eventId = ref<string | null>((route.query.eventId as string) || null)

const err = ref('')

/** Balances */
const currentBalance = ref<number>(0)         // users.balance (already includes refund)
const refundedAmount = ref<number>(0)         // event.winner_refund_amount
const prevBalance = computed(() => {
  const p = Number(currentBalance.value) - Number(refundedAmount.value)
  return Math.max(0, Math.round(p * 100) / 100)
})

/** Event / Product */
const eventInfo = ref<EventRow | null>(null)
const product = ref<ProductRow | null>(null)
const productImage = ref<string | null>(null)

/* ===== Helpers ===== */
function fmtMoney(n: number | null | undefined) {
  const v = Number(n ?? 0)
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function isHttpUrl(v?: string | null) {
  return !!v && /^(https?:)?\/\//i.test(v)
}
function firstProductPath(u: string | string[] | null): string | null {
  if (!u) return null
  if (Array.isArray(u)) return u.length ? u[0] : null
  return u
}
/** Sign from 'prize_product' bucket if path; pass through if already URL */
async function resolveProductImage(u: string | string[] | null): Promise<string | null> {
  const raw = firstProductPath(u)
  if (!raw) return null
  if (isHttpUrl(raw)) return raw
  try {
    const { data, error } = await supabase.storage.from('prize_product').createSignedUrl(raw, 3600)
    if (error || !data?.signedUrl) return null
    return data.signedUrl
  } catch {
    return null
  }
}

/* ===== Derived UI ===== */
const originalPrice = computed<number | null>(() => {
  const p = product.value?.price
  return typeof p === 'number' ? Number(p) : null
})
const discountedPrice = computed<number>(() => {
  const p = Number(product.value?.price ?? 0)
  const d = Number(eventInfo.value?.interest_per_player ?? 0)
  return Math.max(0, Math.round((p - d) * 100) / 100)
})
const productName = computed<string>(() => product.value?.name || 'Product')

/* ===== Loaders ===== */
async function fetchMe() {
  try {
    const { data } = await supabase.auth.getUser()
    myUserId.value = data.user?.id ?? null
  } catch {
    myUserId.value = null
  }
}

async function fetchUserBalance() {
  if (!myUserId.value) return
  try {
    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', myUserId.value)
      .single()
    if (error) throw error
    currentBalance.value = Number(data?.balance ?? 0)
  } catch (e: any) {
    err.value = err.value || e?.message || 'Failed to load current balance'
    currentBalance.value = 0
  }
}

/** If no ?eventId, infer from latest purchase reference_number (your code stores event id there) */
async function ensureEventIdFromPurchases() {
  if (eventId.value || !myUserId.value) return
  try {
    const { data } = await supabase
      .schema('games')
      .from('purchases')
      .select('reference_number')
      .eq('user_id', myUserId.value)
      .order('created_at', { ascending: false })
      .limit(1)
    if (data && data.length && data[0]?.reference_number) {
      eventId.value = data[0].reference_number as string
    }
  } catch {}
}

async function fetchEvent() {
  if (!eventId.value) return
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('event')
      .select('id, product_id, winner_refund_amount, interest_per_player')
      .eq('id', eventId.value)
      .single()
    if (error) throw error
    // Normalize numeric fields
    eventInfo.value = {
      id: data.id,
      product_id: data.product_id,
      winner_refund_amount: Number(data.winner_refund_amount ?? 0),
      interest_per_player: Number(data.interest_per_player ?? 0),
    }
    refundedAmount.value = Number(eventInfo.value.winner_refund_amount ?? 0)
  } catch (e: any) {
    err.value = err.value || e?.message || 'Failed to load event'
    eventInfo.value = null
  }
}

async function fetchProduct() {
  const pid = eventInfo.value?.product_id ?? null
  if (!pid) { product.value = null; productImage.value = null; return }
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('products')
      .select('id, name, description, price, product_url, supplier_price')
      .eq('id', pid)
      .single()
    if (error) throw error

    const normalized: ProductRow = {
      id: data.id,
      name: data.name,
      description: data.description ?? null,
      price: Number(data.price),
      product_url: data.product_url ?? null,
      supplier_price: data.supplier_price !== null && data.supplier_price !== undefined
        ? Number(data.supplier_price)
        : null,
    }
    product.value = normalized
    productImage.value = await resolveProductImage(normalized.product_url)
  } catch (e: any) {
    err.value = err.value || e?.message || 'Failed to load product'
    product.value = null
    productImage.value = null
  }
}

async function init() {
  await fetchMe()
  await ensureEventIdFromPurchases()
  await Promise.all([fetchUserBalance(), fetchEvent()])
  await fetchProduct()
}

/* ===== Navigation ===== */
function goToMyPurchases() {
  // Try the likely named routes first, then path fallbacks
  try { router.push({ name: 'user.purchases' }); return } catch {}
  try { router.push({ name: 'user.myPurchases' }); return } catch {}
  try { router.push('/app/purchases'); return } catch {}
  router.push('/app/my-purchases')
}

onMounted(init)
</script>

<style scoped>
.max-w { width: min(880px, 92vw); }
.trophy { font-size: 64px; line-height: 1; }
.title {
  font-weight: 900;
  letter-spacing: .3px;
  text-shadow: 0 2px 10px rgba(0,0,0,.15);
}

.info-tile {
  border: 1px solid rgba(0,0,0,0.075);
  border-radius: 12px;
  padding: 14px 16px;
  background: #fff;
}
.info-tile .label {
  font-size: .85rem;
  color: #6c757d;
  margin-bottom: 4px;
}
.info-tile .value {
  font-weight: 800;
  font-size: 1.15rem;
}

.prod-media { width: 110px; }
.prod-img-wrap {
  width: 110px; aspect-ratio: 1/1; border-radius: 12px; overflow: hidden;
  background: #0b1a26; display: grid; place-items: center;
  border: 1px solid rgba(0,0,0,0.06);
}
.prod-img { width: 100%; height: 100%; object-fit: contain; display: block; }
.prod-placeholder { font-size: 40px; }

.prod-name { font-size: 1.05rem; }

.orig s { opacity: .7; }
.disc { line-height: 1.1; }
</style>
