<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h1 class="h4 m-0">Orders</h1>
        <p class="text-muted small mb-0">Manage customer orders, shipping, and fulfillment.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm" :disabled="busy.load" @click="loadOrders(true)">
          <span v-if="busy.load" class="spinner-border spinner-border-sm me-2"></span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Tabs (statuses) -->
    <ul class="nav nav-pills mb-2 flex-wrap gap-2">
      <li v-for="t in tabs" :key="t.value" class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: statusFilter === t.value }"
          @click="setStatus(t.value)"
        >
          <span>{{ t.label }}</span>
        </button>
      </li>
    </ul>

    <!-- SUB-TABS (visible only for Return/Refund) -->
    <ul
      v-if="statusFilter === STATUS.RETURN_REFUND"
      class="nav nav-pills mb-3 flex-wrap gap-2"
    >
      <li class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: rrStatusFilter === 'all' }"
          @click="setRRStatus('all')"
        >
          All
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: rrStatusFilter === 'pending' }"
          @click="setRRStatus('pending')"
        >
          Pending
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: rrStatusFilter === 'approved' }"
          @click="setRRStatus('approved')"
        >
          Approved
        </button>
      </li>
      <!-- NEW: Completed sub-tab -->
      <li class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: rrStatusFilter === 'completed' }"
          @click="setRRStatus('completed')"
        >
          Completed
        </button>
      </li>
      <!-- /NEW -->
    </ul>

    <!-- Filters -->
    <div class="card shadow-sm mb-3">
      <div class="card-body d-flex flex-wrap g-2 align-items-end gap-2">
        <div class="flex-grow-1" style="min-width: 240px;">
          <label class="form-label small text-muted mb-1">Search</label>
          <div class="input-group">
            <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
            <input
              v-model.trim="search"
              type="search"
              class="form-control"
              placeholder="Search address, phone, order/ref no…"
              @keyup.enter="applyFilters"
            />
            <button class="btn btn-outline-secondary" :disabled="busy.load" @click="applyFilters">Search</button>
          </div>
        </div>

        <div>
          <label class="form-label small text-muted mb-1">Payment</label>
          <select v-model="payment" class="form-select">
            <option value="">All</option>
            <option value="COD">Cash on Delivery</option>
            <option value="Prepaid">Prepaid</option>
          </select>
        </div>

        <div>
          <label class="form-label small text-muted mb-1">From</label>
          <input v-model="dateFrom" type="date" class="form-control" />
        </div>
        <div>
          <label class="form-label small text-muted mb-1">To</label>
          <input v-model="dateTo" type="date" class="form-control" />
        </div>

        <div class="ms-auto d-flex align-items-end gap-2">
          <button class="btn btn-outline-secondary" @click="clearFilters" :disabled="busy.load">Clear</button>
          <button class="btn btn-primary" @click="applyFilters" :disabled="busy.load">
            <span v-if="busy.load" class="spinner-border spinner-border-sm me-2"></span>
            Apply
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="busy.load" class="text-center text-muted py-5">
      <div class="spinner-border mb-3"></div>
      <div>Loading orders…</div>
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="text-center text-muted py-5">
      <i class="bi bi-receipt" style="font-size: 1.6rem"></i>
      <div class="mt-2">No orders found.</div>
    </div>

    <!-- Orders list -->
    <div v-else class="vstack gap-3">
      <div v-for="o in orders" :key="o.id" class="card shadow-sm rounded-4">
        <div class="card-body">
          <!-- Row 1: Order meta -->
          <div class="d-flex flex-wrap align-items-center justify-content-between">
            <div class="d-flex flex-column">
              <div class="fw-semibold">
                <span class="text-muted">Ref#</span>
                <span class="ms-1">{{ o.reference_number || shortId(o.id) }}</span>
              </div>
              <div class="small text-muted">
                {{ formatDate(o.created_at) }}
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <span class="badge" :class="statusClass(o.status)">
                {{ prettyStatus(o.status) }}
              </span>
              <!-- Shows modeofpayment pulled from purchases -->
              <span class="badge text-bg-light border">{{ o.payment_method || '—' }}</span>
            </div>
          </div>

          <!-- Row 2: Items (one product per purchase) -->
          <div class="mt-3">
            <div
              v-for="it in o.items"
              :key="o.id + ':' + it.product_id"
              class="d-flex align-items-center gap-3 border rounded p-2 bg-light-subtle mb-2"
            >
              <div class="order-thumb ratio ratio-1x1 bg-white rounded">
                <img
                  v-if="productThumb(it.product)"
                  :src="productThumb(it.product)"
                  :alt="it.product?.name || 'Product'"
                  class="w-100 h-100 object-fit-cover rounded"
                />
                <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                  <i class="bi bi-image"></i>
                </div>
              </div>

              <div class="flex-grow-1">
                <div class="fw-semibold text-truncate" :title="it.product?.name || it.product_id">
                  {{ it.product?.name || it.product_id }}
                </div>
                <div class="text-muted small text-truncate" v-if="it.product?.description">
                  {{ it.product?.description }}
                </div>
                <div class="text-muted small">₱ {{ number(it.price_each) }} × {{ it.qty }}</div>
              </div>

              <div class="text-end fw-semibold">₱ {{ number(it.line_total) }}</div>
            </div>
          </div>

          <!-- Row 3: shipping + totals -->
          <div class="mt-3 row g-3">
            <div class="col-12 col-md-7">
              <div class="small text-muted mb-1">Ship to</div>
              <div class="border rounded p-2 bg-body small">
                <div class="fw-semibold">{{ o.phone_number || '—' }}</div>
                <div>{{ o.shipping_address || '—' }}</div>
              </div>
            </div>
            <div class="col-12 col-md-5 d-flex align-items-end justify-content-md-end">
              <div class="text-end">
                <div class="text-muted small">Subtotal</div>
                <div class="fw-semibold fs-5">₱ {{ number(orderSubtotal(o)) }}</div>
                <div class="small text-muted">Recorded total: ₱ {{ number(o.total_amount) }}</div>
              </div>
            </div>
          </div>

          <!-- Row 3.5: Return/Refund info (only when in that status) -->
          <div
            v-if="o.status === STATUS.RETURN_REFUND"
            class="mt-3"
          >
            <div class="small text-muted mb-1">Return/Refund</div>

            <div class="border rounded p-2 bg-body small" v-if="firstReturn(o.id)">
              <div class="d-flex flex-wrap align-items-center gap-2">
                <span class="badge" :class="rrBadgeClass(firstReturn(o.id)?.status)">
                  {{ prettyRRStatus(firstReturn(o.id)?.status) }}
                </span>
                <span class="text-muted">•</span>
                <span class="fw-semibold">Reason:</span>
                <span>{{ firstReturn(o.id)?.reason }}</span>
              </div>

              <div v-if="firstReturn(o.id)?.details" class="mt-1">
                <span class="fw-semibold">Details:</span>
                <span>{{ firstReturn(o.id)?.details }}</span>
              </div>

              <div class="text-muted mt-1">
                Created: {{ formatDate(firstReturn(o.id)?.created_at) }}
              </div>

              <!-- Approve/Complete/Reject buttons per RR sub-status -->
              <div class="mt-2 d-flex justify-content-end gap-2">
                <!-- Pending: Approve + Reject -->
                <template v-if="isRRPending(firstReturn(o.id))">
                  <button
                    class="btn btn-success btn-sm"
                    :disabled="busy.action[firstReturn(o.id)!.id]"
                    @click="approveRefund(firstReturn(o.id)!)"
                    title="Approve refund request"
                  >
                    <span v-if="busy.action[firstReturn(o.id)!.id]" class="spinner-border spinner-border-sm me-1"></span>
                    Approve refund
                  </button>

                  <!-- NEW: Reject refund -->
                  <button
                    class="btn btn-outline-danger btn-sm"
                    :disabled="busy.action[firstReturn(o.id)!.id]"
                    @click="rejectRefund(firstReturn(o.id)!)"
                    title="Reject refund request"
                  >
                    <span v-if="busy.action[firstReturn(o.id)!.id]" class="spinner-border spinner-border-sm me-1"></span>
                    Reject refund
                  </button>
                </template>

                <!-- Approved: Mark as Completed -->
                <button
                  v-else-if="isRRApproved(firstReturn(o.id))"
                  class="btn btn-primary btn-sm"
                  :disabled="busy.action[firstReturn(o.id)!.id]"
                  @click="completeRefund(firstReturn(o.id)!)"
                  title="Mark refund as completed"
                >
                  <span v-if="busy.action[firstReturn(o.id)!.id]" class="spinner-border spinner-border-sm me-1"></span>
                  Mark as Completed
                </button>

                <!-- Rejected / Completed: no buttons (renders nothing) -->
              </div>
            </div>

            <div class="border rounded p-2 bg-body small" v-else>
              No return/refund record found for this purchase (filtered by "{{ rrStatusFilter }}").
            </div>
          </div>

          <!-- Row 4: actions -->
          <div class="mt-3 d-flex flex-wrap gap-2 justify-content-end">
            <!-- To Pay: approve or cancel -->
            <button
              v-if="o.status === STATUS.TO_PAY"
              class="btn btn-primary btn-sm"
              :disabled="busy.action[o.id]"
              @click="approveOrder(o)"
              title="Approve order and move to To Ship (no deduction)"
            >
              <span v-if="busy.action[o.id]" class="spinner-border spinner-border-sm me-1"></span>
              Approve
            </button>

            <button
              v-if="o.status === STATUS.TO_PAY"
              class="btn btn-outline-danger btn-sm"
              :disabled="busy.action[o.id]"
              @click="cancelOrder(o.id)"
            >
              <span v-if="busy.action[o.id]" class="spinner-border spinner-border-sm me-1"></span>
              Cancel
            </button>

            <!-- To Ship: Mark as Shipped -->
            <button
              v-if="o.status === STATUS.TO_SHIP"
              class="btn btn-primary btn-sm"
              :disabled="busy.action[o.id]"
              @click="markAsShipped(o.id)"
            >
              <span v-if="busy.action[o.id]" class="spinner-border spinner-border-sm me-1"></span>
              Mark as Shipped
            </button>

            <!-- To Ship: Cancel (still allowed as per your rule) -->
            <button
              v-if="o.status === STATUS.TO_SHIP"
              class="btn btn-outline-danger btn-sm"
              :disabled="busy.action[o.id]"
              @click="cancelOrder(o.id)"
            >
              <span v-if="busy.action[o.id]" class="spinner-border spinner-border-sm me-1"></span>
              Cancel
            </button>

            <!-- To Receive: none (keep code but disable rendering) -->
            <button
              v-if="o.status === STATUS.TO_RECEIVE && false"
              class="btn btn-success btn-sm"
              :disabled="busy.action[o.id]"
              @click="markAsCompleted(o.id)"
            >
              <span v-if="busy.action[o.id]" class="spinner-border spinner-border-sm me-1"></span>
              Complete
            </button>

            <!-- Generic cancel for other active states (EXCLUDED for TO_PAY/RETURN_REFUND/COMPLETED already) -->
            <button
              v-if="o.status !== STATUS.CANCELLED && o.status !== STATUS.COMPLETED && o.status !== STATUS.RETURN_REFUND && o.status !== STATUS.TO_PAY && o.status !== STATUS.TO_SHIP && o.status !== STATUS.TO_RECEIVE"
              class="btn btn-outline-danger btn-sm"
              :disabled="busy.action[o.id]"
              @click="cancelOrder(o.id)"
            >
              <span v-if="busy.action[o.id]" class="spinner-border spinner-border-sm me-1"></span>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="total > pageSize" class="d-flex align-items-center justify-content-center gap-2 mt-3">
      <button class="btn btn-outline-secondary btn-sm" :disabled="page === 1 || busy.load" @click="goTo(page - 1)">
        <i class="bi bi-chevron-left"></i>
      </button>
      <span class="small text-muted">
        Page <strong>{{ page }}</strong> of <strong>{{ totalPages }}</strong>
      </span>
      <button class="btn btn-outline-secondary btn-sm" :disabled="page >= totalPages || busy.load" @click="goTo(page + 1)">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

/** Status constants (align with your purchase_status enum) */
const STATUS = {
  TO_PAY: 'to pay',
  TO_SHIP: 'to ship',
  TO_RECEIVE: 'to recieve',   // kept spelling per your schema
  COMPLETED: 'completed',
  RETURN_REFUND: 'return/refund',
  CANCELLED: 'cancelled',
} as const

/** Tabs */
const tabs = [
  { label: 'All',            value: 'all' },
  { label: 'To Pay',         value: STATUS.TO_PAY },
  { label: 'To Ship',        value: STATUS.TO_SHIP },
  { label: 'To Receive',     value: STATUS.TO_RECEIVE },
  { label: 'Completed',      value: STATUS.COMPLETED },
  { label: 'Return/Refund',  value: STATUS.RETURN_REFUND },
  { label: 'Cancelled',      value: STATUS.CANCELLED },
] as const

/** Return/Refund sub-filter (only used when statusFilter === RETURN_REFUND) */
type RRFilter = 'all' | 'pending' | 'approved' | 'completed'
const rrStatusFilter = ref<RRFilter>('all')

/** Purchases & view models */
type PurchaseRow = {
  id: string
  user_id: string
  product_id: string
  reference_number: string
  status: string
  created_at: string
  updated_at: string
  modeofpayment: string | null
}
type Product = {
  id: string
  name: string
  description: string | null
  price: number | string
  product_url: string[] | null
}
type Buyer = {
  id: string
  phone_number: string | null
  address: string | null
}
type ReturnRefundRow = {
  id: string
  user_id: string
  purchase_id: string
  product_id: string
  reason: string
  details: string | null
  status: string
  created_at: string
  updated_at: string
}

type OrderItem = {
  order_id: string
  product_id: string
  qty: number
  price_each: number | string
  line_total: number | string
  product?: Product
}

/** View model */
type ViewOrder = {
  id: string
  user_id: string
  reference_number: string
  total_amount: number | string | null
  payment_method: string | null
  shipping_address: string | null
  phone_number: string | null
  status: string | null
  created_at: string
  items: Array<OrderItem>
}

/* ---------- UI state ---------- */
const busy = ref<{ load: boolean; action: Record<string, boolean> }>({ load: false, action: {} })
const statusFilter = ref<typeof tabs[number]['value']>('all')
const search = ref('')
const payment = ref<string>('')        // kept for UI; not used by purchases table
const dateFrom = ref<string>('')       // YYYY-MM-DD
const dateTo = ref<string>('')         // YYYY-MM-DD

/* pagination */
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

/* data */
const orders = ref<ViewOrder[]>([])
const productsMap = reactive<Record<string, Product>>({})
const buyersMap = reactive<Record<string, Buyer>>({})
const rrByPurchase = reactive<Record<string, ReturnRefundRow[]>>({})
const signedUrlMap: Record<string, string> = reactive({})
const signingBusy: Record<string, boolean> = reactive({})

/* ---------- Helpers ---------- */
const number = (n: number | string | null | undefined) => Number(n ?? 0).toFixed(2)
const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return iso as string }
}
const shortId = (s: string) => (s ? `${s.slice(0, 6)}…${s.slice(-4)}` : '—')

/* Kept utility */
function genReference(prefix = 'TXN'): string {
  const ts = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
  const rnd = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `${prefix}-${ts}-${rnd}`
}

function prettyStatus(s?: string | null) {
  const k = String(s || '').toLowerCase()
  if (k === STATUS.TO_PAY) return 'To Pay'
  if (k === STATUS.TO_SHIP) return 'To Ship'
  if (k === STATUS.TO_RECEIVE) return 'To Receive'
  if (k === STATUS.COMPLETED) return 'Completed'
  if (k === STATUS.RETURN_REFUND) return 'Return/Refund'
  if (k === STATUS.CANCELLED) return 'Cancelled'
  return s || '—'
}
function statusClass(s?: string | null) {
  const k = String(s || '').toLowerCase()
  if (k === STATUS.CANCELLED) return 'text-bg-danger-subtle border'
  if (k === STATUS.RETURN_REFUND) return 'text-bg-warning-subtle border'
  if (k === STATUS.COMPLETED) return 'text-bg-success-subtle border'
  if (k === STATUS.TO_SHIP || k === STATUS.TO_RECEIVE) return 'text-bg-info-subtle border'
  if (k === STATUS.TO_PAY) return 'text-bg-light border'
  return 'text-bg-light border'
}
/* Return/refund helpers */
function prettyRRStatus(s?: string | null) {
  const k = String(s || '').toLowerCase()
  if (k === 'pending') return 'Pending'
  if (k === 'approved') return 'Approved'
  if (k === 'completed') return 'Completed'
  if (k === 'rejected') return 'Rejected'
  return s || '—'
}
function rrBadgeClass(s?: string | null) {
  const k = String(s || '').toLowerCase()
  if (k === 'approved') return 'text-bg-success-subtle border'
  if (k === 'completed') return 'text-bg-success-subtle border'
  if (k === 'pending') return 'text-bg-warning-subtle border'
  if (k === 'rejected') return 'text-bg-danger-subtle border'
  return 'text-bg-light border'
}
function isRRPending(rr?: ReturnRefundRow) {
  if (!rr) return false
  return String(rr.status || '').toLowerCase() === 'pending'
}
function isRRApproved(rr?: ReturnRefundRow) {
  if (!rr) return false
  return String(rr.status || '').toLowerCase() === 'approved'
}

function toArray(u: any): string[] {
  if (!u) return []
  return Array.isArray(u) ? u.filter(Boolean) : [u]
}
function firstUrl(arr: string[] | null): string {
  const a = toArray(arr)
  return a[0] ?? ''
}
function isStoragePath(u: string) {
  return !!u && !/^https?:\/\//i.test(u)
}
function productThumb(prod?: Product): string {
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

function orderSubtotal(o: ViewOrder) {
  return o.items.reduce((sum, it) => sum + Number(it.line_total || 0), 0)
}
function firstReturn(purchaseId: string): ReturnRefundRow | undefined {
  const list = rrByPurchase[purchaseId] || []
  return list[0]
}

/* ---------- Fetch from games.purchases + join products & users (+ returns) ---------- */
async function loadOrders(resetPage = false) {
  if (resetPage) page.value = 1
  busy.value.load = true
  try {
    const from = (page.value - 1) * pageSize.value
    const to = from + pageSize.value - 1

    let q = supabase
      .schema('games')
      .from('purchases')
      .select('id,user_id,product_id,reference_number,status,created_at,updated_at,modeofpayment', { count: 'exact' })

    if (statusFilter.value !== 'all') q = q.eq('status', statusFilter.value)

    if (dateFrom.value) q = q.gte('created_at', new Date(dateFrom.value).toISOString())
    if (dateTo.value) {
      const end = new Date(dateTo.value)
      end.setDate(end.getDate() + 1)
      q = q.lt('created_at', end.toISOString())
    }

    if (search.value) {
      const term = search.value.trim()
      q = q.or(`reference_number.ilike.%${term}%,id.ilike.%${term}%`)
    }

    q = q.order('created_at', { ascending: false }).range(from, to)

    const { data: rows, error, count } = await q
    if (error) {
      orders.value = []
      total.value = 0
      return
    }

    total.value = count ?? 0
    const purchaseRows = (rows || []) as PurchaseRow[]

    const productIds = Array.from(new Set(purchaseRows.map(p => p.product_id).filter(Boolean)))
    const userIds = Array.from(new Set(purchaseRows.map(p => p.user_id).filter(Boolean)))
    const purchaseIds = Array.from(new Set(purchaseRows.map(p => p.id)))

    if (productIds.length > 0) {
      const { data: prows } = await supabase
        .schema('games')
        .from('products')
        .select('id,name,description,price,product_url')
        .in('id', productIds)
      if (Array.isArray(prows)) {
        for (const p of prows as Product[]) productsMap[p.id] = p
      }
    }

    if (userIds.length > 0) {
      const { data: urows } = await supabase
        .from('users')
        .select('id, phone_number, address')
        .in('id', userIds)
      if (Array.isArray(urows)) {
        for (const u of urows as Buyer[]) buyersMap[u.id] = u
      }
    }

    let rrPurchaseSet: Set<string> | null = null
    for (const key of Object.keys(rrByPurchase)) delete rrByPurchase[key]

    const shouldLoadRR =
      (statusFilter.value === STATUS.RETURN_REFUND || statusFilter.value === 'all') &&
      purchaseIds.length > 0

    if (shouldLoadRR) {
      let rrQ = supabase
        .schema('games')
        .from('return_refunds')
        .select('id,user_id,purchase_id,product_id,reason,details,status,created_at,updated_at')
        .in('purchase_id', purchaseIds)

      if (statusFilter.value === STATUS.RETURN_REFUND && rrStatusFilter.value !== 'all') {
        rrQ = rrQ.eq('status', rrStatusFilter.value)
      }

      const { data: rrRows } = await rrQ
      if (Array.isArray(rrRows)) {
        rrPurchaseSet = new Set(rrRows.map(r => r.purchase_id))
        for (const r of rrRows as ReturnRefundRow[]) {
          const arr = rrByPurchase[r.purchase_id] || []
          arr.push(r)
          rrByPurchase[r.purchase_id] = arr
        }
      } else {
        rrPurchaseSet = new Set()
      }
    }

    let view: ViewOrder[] = purchaseRows.map(pr => {
      const prod = productsMap[pr.product_id]
      const buyer = buyersMap[pr.user_id]
      const price = Number(prod?.price ?? 0)

    const item: OrderItem = {
        order_id: pr.id,
        product_id: pr.product_id,
        qty: 1,
        price_each: price,
        line_total: price,
        product: prod,
      }

      return {
        id: pr.id,
        user_id: pr.user_id,
        reference_number: pr.reference_number,
        total_amount: price,
        payment_method: pr.modeofpayment || null,
        shipping_address: buyer?.address ?? null,
        phone_number: buyer?.phone_number ?? null,
        status: pr.status,
        created_at: pr.created_at,
        items: [item],
      }
    })

    if (statusFilter.value === STATUS.RETURN_REFUND && rrStatusFilter.value !== 'all' && rrPurchaseSet) {
      view = view.filter(v => rrPurchaseSet!.has(v.id))
      total.value = view.length
    }

    if (search.value) {
      const term = search.value.trim().toLowerCase()
      view = view.filter(v =>
        (v.reference_number || '').toLowerCase().includes(term) ||
        (v.id || '').toLowerCase().includes(term) ||
        (v.shipping_address || '').toLowerCase().includes(term) ||
        (v.phone_number || '').toLowerCase().includes(term) ||
        v.items.some(it =>
          (it.product?.name || '').toLowerCase().includes(term) ||
          (it.product?.description || '').toLowerCase().includes(term)
        )
      )
      total.value = view.length
    }

    orders.value = view
  } finally {
    busy.value.load = false
  }
}

/* ---------- Actions => update games.purchases.status ---------- */
async function updateStatus(purchaseId: string, status: string) {
  busy.value.action[purchaseId] = true
  try {
    const { error } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status })
      .eq('id', purchaseId)

    if (error) {
      alert(error.message)
      return
    }
    const row = orders.value.find(o => o.id === purchaseId)
    if (row) row.status = status
  } finally {
    busy.value.action[purchaseId] = false
  }
}

async function markAsShipped(purchaseId: string) {
  await updateStatus(purchaseId, STATUS.TO_RECEIVE)
}
async function markAsCompleted(purchaseId: string) {
  await updateStatus(purchaseId, STATUS.COMPLETED)
}

/* helper: detect e-wallet */
function isEwalletPayment(method?: string | null) {
  const k = String(method || '').trim().toLowerCase()
  return k === 'ewallet' || k === 'e-wallet' || k === 'e wallet'
}

/* UPDATED: Cancel with e-wallet refund when status is TO_SHIP */
async function cancelOrder(purchaseId: string) {
  if (!confirm('Cancel this order?')) return
  const order = orders.value.find(o => o.id === purchaseId)
  // Standard fallback if we somehow don't have the row
  if (!order) {
    await updateStatus(purchaseId, STATUS.CANCELLED)
    return
  }

  const shouldRefund =
    String(order.status || '').toLowerCase() === STATUS.TO_SHIP &&
    isEwalletPayment(order.payment_method)

  busy.value.action[purchaseId] = true
  try {
    if (!shouldRefund) {
      // Normal cancel
      await updateStatus(purchaseId, STATUS.CANCELLED)
      return
    }

    // 1) Update purchase to CANCELLED, guarded to only succeed if it is currently TO_SHIP
    const { error: upErr } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.CANCELLED })
      .eq('id', purchaseId)
      .eq('status', STATUS.TO_SHIP)

    if (upErr) {
      alert(upErr.message)
      return
    }

    // 2) Compute refund amount (sum of line totals from the view model)
    const refundAmount = orderSubtotal(order)
    const userId = order.user_id

    // 3) Fetch current balance
    const { data: urow, error: uErr } = await supabase
      .from('users')
      .select('id,balance')
      .eq('id', userId)
      .single()

    if (uErr || !urow) {
      console.error('[cancel ewallet refund] user fetch failed:', uErr?.message)
    } else {
      const newBal = Number(Number(urow.balance || 0) + Number(refundAmount)).toFixed(2)
      const { error: balErr } = await supabase
        .from('users')
        .update({ balance: Number(newBal) })
        .eq('id', userId)

      if (balErr) {
        console.error('[cancel ewallet refund] balance update failed:', balErr.message)
      }
    }

    // 4) Insert cancelled receipt (id auto, unique by purchase)
    try {
      const { error: recErr } = await supabase
        .schema('ewallet')
        .from('cancelled_receipt')
        .insert({ purchase_id: purchaseId })

      if (recErr) {
        console.error('[cancelled_receipt insert failed]', recErr.message)
      }
    } catch (e: any) {
      console.error('[cancelled_receipt insert exception]', e?.message || e)
    }

    // 5) Reflect locally
    order.status = STATUS.CANCELLED
  } finally {
    busy.value.action[purchaseId] = false
  }
}

/**
 * Approve order:
 * - NO wallet deduction
 * - NO stock reservation
 * - If update to "to ship" succeeds and modeofpayment is COD, insert into ewallet.order_receipt
 */
async function approveOrder(order: ViewOrder) {
  const purchaseId = order.id
  busy.value.action[purchaseId] = true
  try {
    if (order.status !== STATUS.TO_PAY) {
      alert('Only "To Pay" orders can be approved.')
      return
    }

    // Move purchase to "to ship"
    const { error: upErr } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.TO_SHIP })
      .eq('id', purchaseId)

    if (upErr) {
      alert(upErr.message)
      return
    }

    // Local reflect
    const row = orders.value.find(o => o.id === purchaseId)
    if (row) row.status = STATUS.TO_SHIP

    // If COD, insert into ewallet.order_receipt after approval
    const isCOD = String(order.payment_method || '').toLowerCase() === 'cod'
    if (isCOD) {
      const item = order.items[0]
      if (item) {
        const productId = item.product_id
        const amount = Number(item.price_each || 0) * Number(item.qty || 1)

        const { error: recErr } = await supabase
          .schema('ewallet')
          .from('order_receipt')
          .insert({
            product_id: productId,
            amount: Number(amount.toFixed(2)),
            purchase_id: purchaseId,
          })

        if (recErr) {
          console.error('[order_receipt insert failed]', recErr.message)
        }
      }
    }
  } finally {
    busy.value.action[purchaseId] = false
  }
}

/* ---------- Approve Return/Refund ---------- */
async function approveRefund(rr: ReturnRefundRow) {
  if (!rr) return
  const rrId = rr.id
  busy.value.action[rrId] = true
  try {
    const { error } = await supabase
      .schema('games')
      .from('return_refunds')
      .update({ status: 'approved' })
      .eq('id', rrId)

    if (error) {
      alert(error.message)
      return
    }

    rr.status = 'approved'
  } finally {
    busy.value.action[rrId] = false
  }
}

/* ---------- NEW: Reject Return/Refund (for pending) ---------- */
async function rejectRefund(rr: ReturnRefundRow) {
  if (!rr) return
  if (!confirm('Reject this refund request?')) return
  const rrId = rr.id
  busy.value.action[rrId] = true
  try {
    const { error } = await supabase
      .schema('games')
      .from('return_refunds')
      .update({ status: 'rejected' })
      .eq('id', rrId)

    if (error) {
      alert(error.message)
      return
    }

    rr.status = 'rejected'
  } finally {
    busy.value.action[rrId] = false
  }
}
/* ---------- /NEW ---------- */

/* ---------- Complete Return/Refund (approved -> completed) + REFUND BALANCE + INSERT refund_receipt ---------- */
async function completeRefund(rr: ReturnRefundRow) {
  if (!rr) return
  if (!isRRApproved(rr)) {
    alert('Only "Approved" refunds can be completed.')
    return
  }

  const rrId = rr.id
  busy.value.action[rrId] = true
  try {
    // 1) Load the related purchase (user_id, product_id)
    const { data: purchase, error: pErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id,user_id,product_id')
      .eq('id', rr.purchase_id)
      .single()

    if (pErr || !purchase) {
      alert(pErr?.message || 'Purchase not found for this refund.')
      return
    }

    // 2) Load the product price (assume qty = 1 per your current model)
    const productId = rr.product_id || purchase.product_id
    const { data: product, error: prodErr } = await supabase
      .schema('games')
      .from('products')
      .select('id,price')
      .eq('id', productId)
      .single()

    if (prodErr || !product) {
      alert(prodErr?.message || 'Product not found for this refund.')
      return
    }

    const refundAmount = Number(product.price || 0)
    if (!isFinite(refundAmount) || refundAmount <= 0) {
      alert('Invalid refund amount computed.')
      return
    }

    // 3) Guarded status update: only update if current status is 'approved'
    const { error: rrUpdateErr } = await supabase
      .schema('games')
      .from('return_refunds')
      .update({ status: 'completed' })
      .eq('id', rrId)
      .eq('status', 'approved') // prevent double-complete
      .select('id')             // force postgrest to return something if changed
      .single()

    if (rrUpdateErr) {
      alert(rrUpdateErr.message)
      return
    }

    // 4) Fetch current user balance
    const { data: urow, error: uErr } = await supabase
      .from('users') // public schema
      .select('id,balance')
      .eq('id', purchase.user_id)
      .single()

    if (uErr || !urow) {
      alert(uErr?.message || 'User not found for refund credit.')
      return
    }

    const currentBal = Number(urow.balance || 0)
    const newBal = Number((currentBal + refundAmount).toFixed(2))

    // 5) Update user balance
    const { error: balErr } = await supabase
      .from('users')
      .update({ balance: newBal })
      .eq('id', purchase.user_id)

    if (balErr) {
      alert(balErr.message)
      return
    }

    /* 6) NEW: Record the refund in ewallet.refund_receipt */
    try {
      const { error: rrRecErr } = await supabase
        .schema('ewallet')
        .from('refund_receipt')
        .insert({
          return_refund_id: rrId,
          amount_refunded: Number(refundAmount.toFixed(2)),
        })

      if (rrRecErr) {
        console.error('[refund_receipt insert failed]', rrRecErr.message)
      }
    } catch (e: any) {
      console.error('[refund_receipt insert exception]', e?.message || e)
    }
    /* /NEW */

    // 7) Reflect locally
    rr.status = 'completed'
  } finally {
    busy.value.action[rrId] = false
  }
}
/* ---------- /NEW ---------- */

/* ---------- Filters & pagination handlers ---------- */
function setStatus(v: typeof tabs[number]['value']) {
  if (statusFilter.value !== v) {
    statusFilter.value = v
    if (statusFilter.value !== STATUS.RETURN_REFUND) rrStatusFilter.value = 'all'
    loadOrders(true)
  }
}
function setRRStatus(v: RRFilter) {
  if (rrStatusFilter.value !== v) {
    rrStatusFilter.value = v
    if (statusFilter.value === STATUS.RETURN_REFUND) {
      loadOrders(true)
    }
  }
}
function applyFilters() { loadOrders(true) }
function clearFilters() {
  search.value = ''
  payment.value = ''
  // FIX: set the ref values instead of reassigning the refs
  dateFrom.value = ''
  dateTo.value = ''
  loadOrders(true)
}
function goTo(p: number) {
  const max = totalPages.value
  const next = Math.min(Math.max(1, p), max)
  if (next !== page.value) {
    page.value = next
    loadOrders()
  }
}

/* ---------- Init ---------- */
onMounted(() => {
  loadOrders(true)
})
</script>

<style scoped>
/* Subtle card styling */
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

/* Thumbs */
.order-thumb {
  width: 64px;
  min-width: 64px;
  border-radius: 10px;
  overflow: hidden;
}
.object-fit-cover { object-fit: cover; }
</style>
