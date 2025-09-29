<template>
  <div class="winner-page container py-5">
    <div class="card shadow-sm mx-auto max-w">
      <div class="card-body p-4">
        <div class="text-center">
          <div class="trophy">🏆</div>
          <h1 class="title mb-2">You Win!</h1>
          <p class="lead text-muted mb-4">
            Congrats! You unlocked the special discount.
          </p>
        </div>

        <!-- Balance & Refund -->
        <div class="row g-3 my-3">
          <div class="col-12 col-md-6">
            <div class="info-tile">
              <div class="label">Your Current Balance</div>
              <div class="value">
                <span v-if="balance !== null">₱ {{ fmtMoney(balance) }}</span>
                <span v-else class="text-muted">—</span>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="info-tile">
              <div class="label">Entry Fee (to refund)</div>
              <div class="value">₱ {{ fmtMoney(refundAmount) }}</div>
            </div>
          </div>
        </div>

        <!-- Voucher & Product -->
        <div class="row g-3 mt-2">
          <div class="col-12">
            <h6 class="fw-bold mb-2">Your Voucher</h6>
            <div v-if="voucher" class="voucher card border-0 shadow-sm">
              <div class="card-body d-flex flex-wrap align-items-center justify-content-between">
                <div class="mb-2 mb-sm-0">
                  <div class="small text-muted">Voucher ID</div>
                  <code class="fw-bold">{{ shortId(voucher.id) }}</code>
                </div>
                <div class="mb-2 mb-sm-0" v-if="voucher.expiration_date">
                  <div class="small text-muted">Expires</div>
                  <div class="fw-semibold">{{ fmtDate(voucher.expiration_date) }}</div>
                </div>
                <div class="text-end ms-sm-auto">
                  <div class="small text-muted">Created</div>
                  <div class="fw-semibold">{{ fmtDate(voucher.created_at) }}</div>
                </div>
              </div>
            </div>
            <div v-else class="text-muted small">No voucher found for this event.</div>
          </div>

          <div class="col-12">
            <h6 class="fw-bold mb-2">Product & Discount</h6>
            <div class="card border-0 shadow-sm" v-if="product || winnerPrice > 0">
              <div class="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div class="prod-name fw-bold">
                  {{ productName }}
                </div>
                <div class="prices text-end">
                  <div class="orig text-muted">
                    <s v-if="originalPrice !== null">₱ {{ fmtMoney(originalPrice) }}</s>
                    <span v-else class="text-muted">—</span>
                  </div>
                  <div class="disc fs-4 fw-bold">
                    ₱ {{ fmtMoney(winnerPrice) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-muted small">Discount details not available.</div>
          </div>
        </div>

        <!-- Receipts -->
        <div class="mt-4">
          <h6 class="fw-bold mb-2">Your Receipt(s) for this Event</h6>
          <div v-if="receipts.length" class="list-group">
            <div
              v-for="r in receipts"
              :key="r.id"
              class="list-group-item d-flex flex-wrap justify-content-between align-items-center"
            >
              <div>
                <div class="small text-muted">Receipt ID</div>
                <code class="fw-bold">{{ shortId(r.id) }}</code>
              </div>
              <div class="text-end">
                <div class="small text-muted">Created</div>
                <div class="fw-semibold">{{ fmtDate(r.created_at) }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-muted small">No receipts found for this event.</div>
        </div>

        <!-- Error -->
        <div v-if="err" class="text-danger mt-3">{{ err }}</div>

        <!-- Confirm refund -->
        <div class="text-center mt-4">
          <button
            class="btn btn-success btn-lg px-4"
            :disabled="busy || refundAmount <= 0 || balance === null"
            @click="confirmRefund"
          >
            <span v-if="busy" class="spinner-border spinner-border-sm me-2"></span>
            Confirm Refund
          </button>
          <div class="small text-muted mt-2" v-if="refundAmount <= 0">
            Refund amount is zero — nothing to credit.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

type ReceiptRow = {
  id: string
  event_id: string
  user_id: string
  entry_id: string | null
  created_at: string
}
type EventRow = {
  id: string
  product_id?: string | null
  entry_fee?: number | null
  winner_price?: number | null
}
type VoucherRow = {
  id: string
  event_id: string
  user_id?: string | null
  product_id?: string | null
  created_at: string
  updated_at?: string | null
  expires_at?: string | null
  /** kept for UI compatibility; we populate from expires_at */
  expiration_date?: string | null
}
type ProductRow = {
  id: string
  name: string
  description: string | null
  price: number // numeric(12,2)
  product_url: string
  supplier_price: number
}

const route = useRoute()
const router = useRouter()

const myUserId = ref<string | null>(null)
const eventId = ref<string | null>((route.query.eventId as string) || null)

const balance = ref<number | null>(null)
const eventInfo = ref<EventRow | null>(null)
const receipts = ref<ReceiptRow[]>([])
const voucher = ref<VoucherRow | null>(null)
const product = ref<ProductRow | null>(null)

const err = ref('')
const busy = ref(false)

/* Helpers */
function fmtMoney(n: number | null | undefined) {
  const v = Number(n ?? 0)
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return iso }
}
function shortId(id: string) { return id.slice(0, 6) + '…' + id.slice(-6) }

/* Name/price helpers aligned to schema */
function getProductName(): string {
  return product.value?.name || 'Product'
}
function getProductPrice(): number | null {
  return product.value ? Number(product.value.price) : null
}

/* Derived UI values */
const refundAmount = computed<number>(() => Number(eventInfo.value?.entry_fee ?? 0))
const winnerPrice = computed<number>(() => Number(eventInfo.value?.winner_price ?? 0))
const originalPrice = computed<number | null>(() => getProductPrice())
const productNameComputed = computed<string>(() => getProductName())

/* Loaders */
async function fetchMe() {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    myUserId.value = data.user?.id ?? null
  } catch {
    myUserId.value = null
  }
}

/** If no ?eventId, try to infer from latest voucher then receipt */
async function ensureEventIdFromLatestData() {
  if (eventId.value || !myUserId.value) return
  try {
    const { data: v } = await supabase
      .schema('games')
      .from('voucher')
      .select('event_id')
      .eq('user_id', myUserId.value)
      .order('created_at', { ascending: false })
      .limit(1)
    if (v && v.length) { eventId.value = v[0].event_id; return }
  } catch {}
  try {
    const { data: r } = await supabase
      .schema('games')
      .from('receipt')
      .select('event_id')
      .eq('user_id', myUserId.value)
      .order('created_at', { ascending: false })
      .limit(1)
    if (r && r.length) { eventId.value = r[0].event_id }
  } catch {}
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
    balance.value = Number(data?.balance ?? 0)
  } catch (e: any) {
    err.value = err.value || e?.message || 'Failed to load balance'
    balance.value = null
  }
}

/** Load the event (with product_id) */
async function fetchEvent() {
  if (!eventId.value) return
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('event')
      .select('id, product_id, entry_fee, winner_price')
      .eq('id', eventId.value)
      .single()
    if (error) throw error
    eventInfo.value = data as EventRow

    // Load product using the event's product_id
    await fetchProduct()
  } catch (e: any) {
    err.value = err.value || e?.message || 'Failed to load event'
    eventInfo.value = null
  }
}

async function fetchVoucher() {
  if (!eventId.value || !myUserId.value) return
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('voucher')
      .select('id, event_id, user_id, product_id, created_at, updated_at, expires_at')
      .eq('event_id', eventId.value)
      .eq('user_id', myUserId.value)
      .order('created_at', { ascending: false })
      .limit(1)
    if (error) throw error

    const row = (data && data.length ? data[0] : null) as VoucherRow | null

    // Normalize for UI: keep original fields and also provide `expiration_date` for the template
    voucher.value = row
      ? {
          ...row,
          expiration_date: row.expires_at ?? null,
        }
      : null

    // Fallback: if event.product_id is missing (unlikely), try voucher.product_id
    if (!eventInfo.value?.product_id && voucher.value?.product_id) {
      await fetchProduct(voucher.value.product_id)
    }
  } catch (e: any) {
    err.value = err.value || e?.message || 'Failed to load voucher'
    voucher.value = null
  }
}

/**
 * Fetch product by id. If no id is provided, it uses eventInfo.product_id.
 * Matches schema: id, name, description, price, product_url, supplier_price
 */
async function fetchProduct(forceProductId?: string | null) {
  const prodId = forceProductId ?? eventInfo.value?.product_id ?? null
  if (!prodId) { product.value = null; return }
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('products')
      .select('id, name, description, price, product_url, supplier_price')
      .eq('id', prodId)
      .single()
    if (error) throw error

    // Normalize numeric fields to numbers to keep UI math robust
    const normalized: ProductRow = {
      id: data.id,
      name: data.name,
      description: data.description ?? null,
      price: Number(data.price),
      product_url: data.product_url,
      supplier_price: Number(data.supplier_price ?? 0),
    }
    product.value = normalized
  } catch (e: any) {
    err.value = err.value || e?.message || 'Failed to load product'
    product.value = null
  }
}

async function fetchReceipts() {
  if (!eventId.value || !myUserId.value) return
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('receipt')
      .select('id, event_id, user_id, entry_id, created_at')
      .eq('event_id', eventId.value)
      .eq('user_id', myUserId.value)
      .order('created_at', { ascending: false })
    if (error) throw error
    receipts.value = (data || []) as ReceiptRow[]
  } catch (e: any) {
    err.value = err.value || e?.message || 'Failed to load receipts'
    receipts.value = []
  }
}

async function init() {
  await fetchMe()
  await ensureEventIdFromLatestData()
  await Promise.all([
    fetchEvent(),          // loads event and, inside, the product via event.product_id
    fetchUserBalance(),
  ])
  await Promise.all([
    fetchVoucher(),        // voucher still displayed; only fallback for product if needed
    fetchReceipts(),
  ])
}

/** Confirm refund:
 *  - adds entry_fee to users.balance
 *  - navigates back to Mini Games
 */
async function confirmRefund() {
  if (!myUserId.value) { err.value = 'No user found.'; return }
  if (refundAmount.value <= 0) { err.value = 'Nothing to refund.'; return }
  busy.value = true
  try {
    await fetchUserBalance()
    const current = Number(balance.value ?? 0)
    const next = current + Number(refundAmount.value)

    const { error } = await supabase
      .from('users')
      .update({ balance: next })
      .eq('id', myUserId.value)
    if (error) throw error

    balance.value = next

    setTimeout(() => {
      try { router.push({ name: 'user.minigames' }) }
      catch { router.push('/app/minigames') }
    }, 50)
  } catch (e: any) {
    err.value = e?.message || 'Refund failed.'
  } finally {
    busy.value = false
  }
}

onMounted(init)

/* Expose for template */
const productName = productNameComputed
</script>

<style scoped>
.max-w { width: min(860px, 92vw); }
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
  margin-bottom: 2px;
}
.info-tile .value {
  font-weight: 800;
  font-size: 1.15rem;
}

.voucher { border-radius: 12px; }
.list-group-item { border-color: rgba(0,0,0,0.08); }

.orig s { opacity: .7; }
.disc { line-height: 1.1; }
</style>
