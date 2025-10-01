<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h1 class="h4 m-0">My Purchases</h1>
        <p class="text-muted small mb-0">Track your orders and delivery status.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm" :disabled="busy.load" @click="loadPurchases">
          <span v-if="busy.load" class="spinner-border spinner-border-sm me-2"></span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Tabs (Shopee-like) -->
    <ul class="nav nav-pills mb-3 flex-wrap gap-2">
      <li v-for="t in tabs" :key="t.value" class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: activeTab === t.value }"
          @click="activeTab = t.value"
        >
          <span>{{ t.label }}</span>
          <span class="badge text-bg-light border">{{ counts[t.value] || 0 }}</span>
        </button>
      </li>
    </ul>

    <!-- Return/Refund Subtabs -->
    <div v-if="activeTab === STATUS.RETURN_REFUND" class="mb-3">
      <ul class="nav nav-pills flex-wrap gap-2">
        <li v-for="st in rrSubtabs" :key="st.value" class="nav-item">
          <button
            class="nav-link d-flex align-items-center gap-2"
            :class="{ active: activeRR === st.value }"
            @click="activeRR = st.value"
          >
            <span>{{ st.label }}</span>
            <span class="badge text-bg-light border">{{ rrCounts[st.value] || 0 }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Loading -->
    <div v-if="busy.load" class="text-center text-muted py-5">
      <div class="spinner-border mb-3"></div>
      <div>Loading your purchases…</div>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="text-center text-muted py-5">
      <i class="bi bi-bag-x" style="font-size: 1.6rem"></i>
      <div class="mt-2">No purchases found for “{{ tabLabel(activeTab) }}”<span v-if="activeTab === STATUS.RETURN_REFUND"> · {{ rrTabLabel(activeRR) }}</span>.</div>
      <RouterLink :to="{ name: 'user.shop' }" class="btn btn-primary btn-sm mt-3">
        Go to Shop
      </RouterLink>
    </div>

    <!-- Purchases list -->
    <div v-else class="row g-3">
      <div v-for="p in filtered" :key="p.id" class="col-12">
        <div class="card shadow-sm rounded-4">
          <div class="card-body">
            <div class="d-flex flex-wrap align-items-center justify-content-between">
              <div class="d-flex flex-column">
                <div class="fw-semibold">
                  <span class="text-muted">Ref#</span>
                  <span class="ms-1">{{ p.reference_number || shortId(p.id) }}</span>
                </div>
                <div class="small text-muted">
                  {{ formatDate(p.created_at) }}
                </div>
              </div>

              <div class="d-flex align-items-center gap-2">
                <span class="badge" :class="statusClass(p.status)">
                  {{ prettyStatus(p.status) }}
                </span>
                <!-- Show RR status chip when on Return/Refund tab -->
                <span
                  v-if="activeTab === STATUS.RETURN_REFUND && rrStatus(p.id)"
                  class="badge text-bg-light border"
                  :title="'RR status: ' + rrTabLabel(rrStatus(p.id)!)"
                >
                  {{ rrTabLabel(rrStatus(p.id)!) }}
                </span>
              </div>
            </div>

            <div class="mt-3 row g-3">
              <!-- Product tile (Shopee-like) -->
              <div class="col-12">
                <div class="d-flex align-items-center gap-3 border rounded p-2 bg-light-subtle">
                  <div class="purchase-thumb ratio ratio-1x1 bg-white rounded">
                    <img
                      v-if="productThumb(p)"
                      :src="productThumb(p)"
                      :alt="productName(p)"
                      class="w-100 h-100 object-fit-cover rounded"
                    />
                    <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                      <i class="bi bi-image"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <div class="fw-semibold text-truncate" :title="productName(p)">
                      {{ productName(p) }}
                    </div>
                    <div class="text-muted small text-truncate" v-if="productDesc(p)">
                      {{ productDesc(p) }}
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="fw-semibold">₱ {{ number(productPrice(p)) }}</div>
                    <div class="small text-muted">Qty: 1</div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="col-12 d-flex align-items-center justify-content-end">
                <div class="d-flex gap-2 flex-wrap">
                  <!-- to pay: show Cancel -->
                  <button
                    v-if="p.status === STATUS.TO_PAY"
                    class="btn btn-outline-danger btn-sm"
                    :disabled="busy.cancel[p.id]"
                    @click="cancelPurchase(p.id)"
                  >
                    <span v-if="busy.cancel[p.id]" class="spinner-border spinner-border-sm me-1"></span>
                    Cancel
                  </button>

                  <!-- to ship: NO BUTTONS -->
                  <template v-else-if="p.status === STATUS.TO_SHIP">
                    <!-- intentionally empty -->
                  </template>

                  <!-- to recieve & completed: Return/Refund button -->
                  <button
                    v-else-if="p.status === STATUS.TO_RECEIVE || p.status === STATUS.COMPLETED"
                    class="btn btn-outline-warning btn-sm"
                    @click="openReturnRefund(p)"
                  >
                    Return/Refund
                  </button>

                  <!-- return/refund: Pending => Cancel RR -->
                  <button
                    v-else-if="p.status === STATUS.RETURN_REFUND && rrStatus(p.id) === 'pending'"
                    class="btn btn-outline-danger btn-sm"
                    :disabled="busy.rrCancel[p.id]"
                    @click="cancelReturnRefund(p)"
                  >
                    <span v-if="busy.rrCancel[p.id]" class="spinner-border spinner-border-sm me-1"></span>
                    Cancel
                  </button>

                  <!-- return/refund: Approved/Completed => NO BUTTON -->
                  <template v-else-if="p.status === STATUS.RETURN_REFUND">
                    <!-- intentionally empty -->
                  </template>

                  <!-- cancelled: NO BUTTON -->
                  <template v-else-if="p.status === STATUS.CANCELLED">
                    <!-- intentionally empty -->
                  </template>
                </div>
              </div>
            </div>

            <!-- Footer (timestamps) -->
            <div class="mt-3 small text-muted d-flex flex-wrap gap-3">
              <span>Created: {{ formatDate(p.created_at) }}</span>
              <span>Updated: {{ formatDate(p.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- (Optional pagination spot) -->
    </div>

    <!-- Return/Refund Modal -->
    <div v-if="showRR" class="modal-backdrop-custom2">
      <div class="modal-card2 card shadow-lg">
        <div class="card-header d-flex align-items-center justify-content-between">
          <strong>Return / Refund Request</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeReturnRefund">✕</button>
        </div>

        <div class="card-body">
          <!-- Purchase + Product preview -->
          <div v-if="rrPurchase" class="d-flex align-items-center gap-3 mb-3">
            <div class="purchase-thumb ratio ratio-1x1 bg-light rounded">
              <img v-if="productThumb(rrPurchase)" :src="productThumb(rrPurchase)" :alt="productName(rrPurchase)" class="w-100 h-100 object-fit-cover rounded" />
              <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                <i class="bi bi-image"></i>
              </div>
            </div>
            <div class="flex-grow-1">
              <div class="fw-semibold text-truncate">{{ productName(rrPurchase) }}</div>
              <div class="text-muted small">Ref# {{ rrPurchase.reference_number || shortId(rrPurchase.id) }}</div>
            </div>
            <div class="text-end">
              <div class="fw-semibold">₱ {{ number(productPrice(rrPurchase)) }}</div>
              <div class="small text-muted">Qty: 1</div>
            </div>
          </div>

          <form @submit.prevent="submitReturnRefund">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Reason</label>
                <select v-model.trim="rrForm.reason" class="form-select" required>
                  <option value="" disabled>Select a reason</option>
                  <option v-for="r in rrReasons" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label">Details (optional)</label>
                <textarea v-model.trim="rrForm.details" class="form-control" rows="4" placeholder="Describe the issue (e.g., defective on arrival, wrong color/size, missing parts)."></textarea>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeReturnRefund">Cancel</button>
              <button type="submit" class="btn btn-warning" :disabled="rrBusy || !rrForm.reason">
                <span v-if="rrBusy" class="spinner-border spinner-border-sm me-2"></span>
                Submit
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
    <!-- /Return/Refund Modal -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

type AnyRec = Record<string, any>

const router = useRouter()

/** Enum constants (match DB exactly) */
const STATUS = {
  TO_PAY: 'to pay',
  TO_SHIP: 'to ship',
  TO_RECEIVE: 'to recieve',      // DB spelling kept as provided
  COMPLETED: 'completed',
  RETURN_REFUND: 'return/refund',
  CANCELLED: 'cancelled',
} as const

/** Tabs (Shopee-like) */
const tabs = [
  { label: 'To Pay',         value: STATUS.TO_PAY },
  { label: 'To Ship',        value: STATUS.TO_SHIP },
  { label: 'To Receive',     value: STATUS.TO_RECEIVE },
  { label: 'Completed',      value: STATUS.COMPLETED },
  { label: 'Return/Refund',  value: STATUS.RETURN_REFUND },
  { label: 'Cancelled',      value: STATUS.CANCELLED },
]

const activeTab = ref<typeof tabs[number]['value']>(STATUS.TO_SHIP) // default for COD shops

/** Return/Refund Subtabs */
type RRState = 'pending' | 'approved' | 'completed'
const rrSubtabs: Array<{ label: string; value: RRState }> = [
  { label: 'Pending',   value: 'pending' },
  { label: 'Approved',  value: 'approved' },
  { label: 'Completed', value: 'completed' },
]
const activeRR = ref<RRState>('pending')

/** UI state */
const busy = ref<{ load: boolean; cancel: Record<string, boolean>; rrCancel: Record<string, boolean> }>({
  load: false,
  cancel: {},
  rrCancel: {},
})
const purchases = ref<Array<AnyRec>>([])

/* ---------- Product lookup + image signing (Shopee-style tile) ---------- */
type Product = {
  id: string
  name: string
  description: string | null
  price: number | string
  product_url: string[] | null
}

const productsMap = reactive<Record<string, Product>>({})
const signedUrlMap: Record<string, string> = reactive({})
const signingBusy: Record<string, boolean> = reactive({})

function toArray(u: any): string[] {
  if (!u) return []
  return Array.isArray(u) ? u.filter(Boolean) : [u]
}
function firstUrl(u: string[] | null): string {
  const arr = toArray(u)
  return arr[0] ?? ''
}
function isStoragePath(u: string) {
  return !!u && !/^https?:\/\//i.test(u)
}
function number(n: number | string | null | undefined) {
  return Number(n ?? 0).toFixed(2)
}
function productOf(purchase: AnyRec): Product | undefined {
  const id = purchase?.product_id
  return id ? productsMap[id] : undefined
}
function productName(purchase: AnyRec): string {
  return productOf(purchase)?.name ?? purchase?.product_id ?? '—'
}
function productDesc(purchase: AnyRec): string {
  return productOf(purchase)?.description ?? ''
}
function productPrice(purchase: AnyRec): number {
  const raw = productOf(purchase)?.price
  return Number(raw ?? 0)
}
function productThumb(purchase: AnyRec): string {
  const prod = productOf(purchase)
  if (!prod) return ''
  const raw = firstUrl(prod.product_url)
  if (!raw) return ''
  if (!isStoragePath(raw)) return raw
  if (signedUrlMap[prod.id]) return signedUrlMap[prod.id]
  if (!signingBusy[prod.id]) {
    signingBusy[prod.id] = true
    supabase.storage
      .from('prize_product')
      .createSignedUrl(raw, 3600)
      .then(({ data, error }) => {
        if (!error && data?.signedUrl) signedUrlMap[prod.id] = data.signedUrl
      })
      .finally(() => (signingBusy[prod.id] = false))
  }
  return ''
}

/* ---------------- Return/Refund store (per purchase) ---------------- */
type RRRow = { id: string; purchase_id: string; status: RRState; created_at?: string }
const rrByPurchase = reactive<Record<string, RRRow>>({})

function rrStatus(purchaseId: string): RRState | undefined {
  return rrByPurchase[purchaseId]?.status
}

function rrTabLabel(v: RRState) {
  const m: Record<RRState, string> = { pending: 'Pending', approved: 'Approved', completed: 'Completed' }
  return m[v] || v
}

/** Load all purchases for the signed-in user + related products + RR rows */
async function loadPurchases() {
  busy.value.load = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth?.user?.id
    if (!uid) {
      purchases.value = []
      Object.keys(rrByPurchase).forEach(k => delete rrByPurchase[k])
      return
    }

    // Purchases
    const { data, error } = await supabase
      .schema('games')
      .from('purchases')
      .select('id, user_id, product_id, reference_number, status, created_at, updated_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    if (error) {
      purchases.value = []
      Object.keys(rrByPurchase).forEach(k => delete rrByPurchase[k])
      return
    }
    purchases.value = Array.isArray(data) ? data : []

    // Products for visible purchases
    const ids = Array.from(new Set(purchases.value.map(r => r.product_id).filter(Boolean)))
    if (ids.length > 0) {
      const { data: prows, error: perr } = await supabase
        .schema('games')
        .from('products')
        .select('id, name, description, price, product_url')
        .in('id', ids)

      if (!perr && Array.isArray(prows)) {
        for (const pr of prows as Product[]) {
          productsMap[pr.id] = {
            id: pr.id,
            name: pr.name,
            description: pr.description ?? null,
            price: pr.price,
            product_url: (Array.isArray(pr.product_url) ? pr.product_url : null),
          }
        }
      }
    }

    // RR rows for this user, limited to purchases currently on list (perf + correctness)
    const purchaseIds = purchases.value.map(r => r.id)
    Object.keys(rrByPurchase).forEach(k => delete rrByPurchase[k])
    if (purchaseIds.length > 0) {
      const { data: rrRows, error: rrErr } = await supabase
        .schema('games')
        .from('return_refunds')
        .select('id, purchase_id, status, created_at')
        .eq('user_id', uid)
        .in('purchase_id', purchaseIds)
        .order('created_at', { ascending: false })

      if (!rrErr && Array.isArray(rrRows)) {
        for (const row of rrRows as RRRow[]) {
          // Keep the latest per purchase (query is ordered desc by created_at)
          if (!rrByPurchase[row.purchase_id]) {
            rrByPurchase[row.purchase_id] = {
              id: row.id,
              purchase_id: row.purchase_id,
              status: (row.status as RRState) || 'pending',
              created_at: row.created_at,
            }
          }
        }
      }
    }
  } catch {
    purchases.value = []
    Object.keys(rrByPurchase).forEach(k => delete rrByPurchase[k])
  } finally {
    busy.value.load = false
  }
}

/** Cancel a 'to pay' purchase */
async function cancelPurchase(purchaseId: string) {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth?.user?.id
  if (!uid) return
  busy.value.cancel[purchaseId] = true
  try {
    const { error } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.CANCELLED })
      .eq('id', purchaseId)
      .eq('user_id', uid)

    if (error) {
      alert(error.message)
      return
    }

    // Update local list without a full reload
    const row = purchases.value.find(r => r.id === purchaseId)
    if (row) row.status = STATUS.CANCELLED
  } finally {
    busy.value.cancel[purchaseId] = false
  }
}

/** Cancel an RR (Pending only): delete RR row and revert purchase to Completed */
async function cancelReturnRefund(purchase: AnyRec) {
  const rec = rrByPurchase[purchase.id]
  if (!rec || rec.status !== 'pending') {
    alert('This return/refund is no longer pending.')
    return
  }

  const { data: auth } = await supabase.auth.getUser()
  const uid = auth?.user?.id
  if (!uid) return

  busy.value.rrCancel[purchase.id] = true
  try {
    // 1) Delete RR row
    const { error: delErr } = await supabase
      .schema('games')
      .from('return_refunds')
      .delete()
      .eq('id', rec.id)
      .eq('user_id', uid)

    if (delErr) {
      alert(delErr.message)
      return
    }

    // 2) Revert purchase to completed
    const { error: upErr } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.COMPLETED })
      .eq('id', purchase.id)
      .eq('user_id', uid)

    if (upErr) {
      alert(upErr.message)
      return
    }

    // Local updates
    delete rrByPurchase[purchase.id]
    const row = purchases.value.find(r => r.id === purchase.id)
    if (row) row.status = STATUS.COMPLETED

    // Optional UX: jump to Completed tab so user sees it disappear from RR
    // activeTab.value = STATUS.COMPLETED
  } finally {
    busy.value.rrCancel[purchase.id] = false
  }
}

/** Counts per tab */
const counts = computed<Record<string, number>>(() => {
  const out: Record<string, number> = {}
  for (const t of tabs) out[t.value] = 0
  for (const row of purchases.value) {
    const k = (row.status || '').toLowerCase()
    if (k in out) out[k]++
  }
  return out
})

/** RR Counts (within Return/Refund tab) */
const rrCounts = computed<Record<RRState, number>>(() => {
  const init: Record<RRState, number> = { pending: 0, approved: 0, completed: 0 }
  for (const row of purchases.value) {
    const isRR = String(row.status).toLowerCase() === STATUS.RETURN_REFUND
    if (!isRR) continue
    const st = rrStatus(row.id)
    if (st && st in init) init[st]++
  }
  return init
})

/** Filtered rows for active tab (and RR subtab if applicable) */
const filtered = computed(() => {
  const base = purchases.value.filter(r => String(r.status).toLowerCase() === activeTab.value)
  if (activeTab.value !== STATUS.RETURN_REFUND) return base
  // Further filter by RR subtab status
  return base.filter(r => rrStatus(r.id) === activeRR.value)
})

/** Helpers */
const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch { return iso }
}
const shortId = (s: string) => (s ? `${s.slice(0, 6)}…${s.slice(-4)}` : '—')

function tabLabel(value: string) {
  return tabs.find(t => t.value === value)?.label ?? value
}

/** Status label class + pretty label */
function prettyStatus(s?: string) {
  const k = (s || '').toLowerCase()
  if (k === STATUS.TO_PAY) return 'To Pay'
  if (k === STATUS.TO_SHIP) return 'To Ship'
  if (k === STATUS.TO_RECEIVE) return 'To Receive'
  if (k === STATUS.COMPLETED) return 'Completed'
  if (k === STATUS.RETURN_REFUND) return 'Return/Refund'
  if (k === STATUS.CANCELLED) return 'Cancelled'
  return s || '—'
}
function statusClass(s?: string) {
  const k = (s || '').toLowerCase()
  if (k === STATUS.CANCELLED) return 'text-bg-danger-subtle border'
  if (k === STATUS.RETURN_REFUND) return 'text-bg-warning-subtle border'
  if (k === STATUS.COMPLETED) return 'text-bg-success-subtle border'
  if (k === STATUS.TO_SHIP || k === STATUS.TO_RECEIVE) return 'text-bg-info-subtle border'
  if (k === STATUS.TO_PAY) return 'text-bg-light border'
  return 'text-bg-light border'
}

/** Actions (wire as needed) */
function goToShop() {
  router.push({ name: 'user.shop' })
}

/* ---------------- Return/Refund modal + submit ---------------- */
const showRR = ref(false)
const rrBusy = ref(false)
const rrPurchase = ref<AnyRec | null>(null)
const rrForm = reactive<{ purchase_id: string; product_id: string; reason: string; details: string }>({
  purchase_id: '',
  product_id: '',
  reason: '',
  details: '',
})
const rrReasons = [
  'Defective / Damaged',
  'Item Not as Described',
  'Wrong Item Received',
  'Missing Parts / Accessories',
  'Arrived Late',
  'Changed Mind',
]

function openReturnRefund(purchase: AnyRec) {
  rrPurchase.value = purchase
  rrForm.purchase_id = purchase?.id || ''
  rrForm.product_id = purchase?.product_id || ''
  rrForm.reason = ''
  rrForm.details = ''
  showRR.value = true
}
function closeReturnRefund() {
  showRR.value = false
}

async function submitReturnRefund() {
  if (!rrForm.reason) return
  rrBusy.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth?.user?.id
    if (!uid) {
      alert('Please log in to submit a return/refund request.')
      return
    }

    const payload = {
      user_id: uid,
      purchase_id: rrForm.purchase_id,
      product_id: rrForm.product_id,
      reason: rrForm.reason,
      details: rrForm.details || null,
      status: 'pending' as RRState, // initial status
    }

    const { data: ins, error } = await supabase
      .schema('games')
      .from('return_refunds')
      .insert([payload])
      .select('id, purchase_id, status')
      .single()

    if (error) {
      alert(error.message)
      return
    }

    // Move purchase to "return/refund" status for visibility
    try {
      await supabase
        .schema('games')
        .from('purchases')
        .update({ status: STATUS.RETURN_REFUND })
        .eq('id', rrForm.purchase_id)
        .eq('user_id', uid)

      const row = purchases.value.find(r => r.id === rrForm.purchase_id)
      if (row) row.status = STATUS.RETURN_REFUND
    } catch (_) {}

    // Track RR locally (latest)
    if (ins) {
      rrByPurchase[ins.purchase_id] = {
        id: ins.id,
        purchase_id: ins.purchase_id,
        status: (ins.status as RRState) || 'pending',
      }
    }

    closeReturnRefund()
    alert('Return/Refund request submitted.')
  } finally {
    rrBusy.value = false
  }
}

onMounted(() => {
  loadPurchases()
})
</script>

<style scoped>
/* Card & subtle bg */
.card { border: 1px solid #edf0f3; }
.bg-light-subtle { background: #f8f9fa; }

/* Pills look */
.nav-pills .nav-link {
  border-radius: 999px;
}
.nav-pills .nav-link:not(.active) {
  background: #f8f9fa;
  color: #212529;
}
.nav-pills .nav-link .badge.border {
  border-color: #e9ecef !important;
}

/* Monospace snippet for product_id */
.text-monospace { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

/* Purchase product thumb */
.purchase-thumb {
  width: 64px;
  min-width: 64px;
  border-radius: 10px;
  overflow: hidden;
}
.object-fit-cover { object-fit: cover; }

/* Simple modal styles (separate class to avoid conflicts) */
.modal-backdrop-custom2 {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 1055;
}
.modal-card2 {
  width: min(640px, 95vw);
  max-height: 90vh;
  overflow: auto;
  border: 0;
  border-radius: 16px;
}
</style>
