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
    <div v-else-if="orderGroups.length === 0" class="text-center text-muted py-5">
      <i class="bi bi-receipt" style="font-size: 1.6rem"></i>
      <div class="mt-2">No orders found.</div>
    </div>

    <!-- Orders list (GROUPED by reference_number) -->
    <div v-else class="vstack gap-3">
      <div v-for="g in orderGroups" :key="g.groupKey" class="card shadow-sm rounded-4">
        <div class="card-body">
          <!-- Row 1: Group meta -->
          <div class="d-flex flex-wrap align-items-center justify-content-between">
            <div class="d-flex flex-column">
              <div class="fw-semibold">
                <span class="text-muted">Ref#</span>
                <span class="ms-1">{{ g.reference_number || shortId(g.groupKey) }}</span>
              </div>
              <!-- UPDATED: clean date/time + updated_at -->
              <div class="small text-muted">
                Created: {{ formatClean(g.created_at) }}
              </div>
              <div class="small text-muted" v-if="g.updated_at">
                Updated: {{ formatClean(g.updated_at) }}
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <span class="badge" :class="statusClass(g.statusSummaryClassKey)">
                {{ g.statusSummaryLabel }}
              </span>
              <span class="badge text-bg-light border" :title="g.paymentSummaryTitle">
                {{ g.paymentSummaryLabel }}
              </span>
            </div>
          </div>

          <!-- Row 2: Items for the whole group -->
          <div class="mt-3">
            <div
              v-for="it in g.items"
              :key="g.groupKey + ':' + it.product_id + ':' + it.order_id"
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
                <!-- UPDATED: ellipsis title (no specs/desc) -->
                <div
                  class="fw-semibold title-ellipsis"
                  :title="it.product?.name || it.product_id"
                >
                  {{ it.product?.name || it.product_id }}
                </div>

                <!-- HIDDEN but kept (do not remove existing code) -->
                <div class="text-muted small text-truncate order-desc" v-if="it.product?.description">
                  {{ it.product?.description }}
                </div>

                <div class="text-muted small">₱ {{ number(it.price_each) }} × {{ it.qty }}</div>

                <!-- NEW: visible badges per item (status + payment) -->
                <div class="mt-1 d-flex flex-wrap gap-2">
                  <span
                    class="badge badge-tight"
                    :class="statusClass(purchaseStatusKey(g, it.order_id))"
                  >
                    {{ prettyStatus(purchaseStatusKey(g, it.order_id)) }}
                  </span>
                  <span class="badge text-bg-light border badge-tight">
                    {{ purchasePayment(g, it.order_id) || '—' }}
                  </span>
                </div>
              </div>

              <div class="text-end fw-semibold">₱ {{ number(it.line_total) }}</div>
            </div>
          </div>

          <!-- Row 3: shipping + totals -->
          <div class="mt-3 row g-3">
            <div class="col-12 col-md-7">
              <div class="small text-muted mb-1">Ship to</div>
              <div class="border rounded p-2 bg-body small">
                <div class="fw-semibold">{{ g.phone_number || '—' }}</div>
                <div>{{ g.shipping_address || '—' }}</div>
              </div>
            </div>
            <div class="col-12 col-md-5 d-flex align-items-end justify-content-md-end">
              <div class="text-end">
                <div class="text-muted small">Subtotal</div>
                <div class="fw-semibold fs-5">₱ {{ number(groupSubtotal(g)) }}</div>
                <div class="small text-muted">Recorded total: ₱ {{ number(g.total_amount) }}</div>
              </div>
            </div>
          </div>

          <!-- Row 3.5: Return/Refund info (per product rows) -->
          <div
            v-if="g.containsRR"
            class="mt-3"
          >
            <div class="small text-muted mb-1">Return/Refund</div>

            <div
              v-for="rr in groupRRs(g)"
              :key="rr.id"
              class="border rounded p-2 bg-body small mb-2"
            >
              <div class="d-flex flex-wrap align-items-center gap-2">
                <!-- existing RR status badge -->
                <span class="badge" :class="rrBadgeClass(rr.status)">
                  {{ prettyRRStatus(rr.status) }}
                </span>

                <!-- NEW: payment badge for this RR item -->
                <span class="badge text-bg-light border">
                  {{ purchasePayment(g, rr.purchase_id) || '—' }}
                </span>

                <span class="text-muted">•</span>
                <span class="fw-semibold">Product:</span>
                <span>{{ productsMap[rr.product_id]?.name || rr.product_id }}</span>
                <span class="text-muted">•</span>
                <span class="fw-semibold">Reason:</span>
                <span>{{ rr.reason }}</span>
              </div>

              <div v-if="rr.details" class="mt-1">
                <span class="fw-semibold">Details:</span>
                <span>{{ rr.details }}</span>
              </div>

              <div class="text-muted mt-1">
                <!-- UPDATED: clean date/time -->
                Created: {{ formatClean(rr.created_at) }}
              </div>

              <!-- Approve/Complete/Reject buttons per RR row (PER PRODUCT) -->
              <div class="mt-2 d-flex justify-content-end gap-2">
                <!-- Pending: Approve + Reject -->
                <template v-if="isRRPending(rr)">
                  <button
                    class="btn btn-success btn-sm"
                    :disabled="busy.action[rr.id]"
                    @click="approveRefund(rr)"
                    title="Approve refund request"
                  >
                    <span v-if="busy.action[rr.id]" class="spinner-border spinner-border-sm me-1"></span>
                    Approve refund
                  </button>

                  <button
                    class="btn btn-outline-danger btn-sm"
                    :disabled="busy.action[rr.id]"
                    @click="rejectRefund(rr)"
                    title="Reject refund request"
                  >
                    <span v-if="busy.action[rr.id]" class="spinner-border spinner-border-sm me-1"></span>
                    Reject refund
                  </button>
                </template>

                <!-- Approved: Mark as Completed -->
                <button
                  v-else-if="isRRApproved(rr)"
                  class="btn btn-primary btn-sm"
                  :disabled="busy.action[rr.id]"
                  @click="completeRefund(rr)"
                  title="Mark refund as completed"
                >
                  <span v-if="busy.action[rr.id]" class="spinner-border spinner-border-sm me-1"></span>
                  Mark as Completed
                </button>
              </div>
            </div>

            <div class="border rounded p-2 bg-body small" v-if="groupRRs(g).length === 0">
              No return/refund record found for this grouped order (filtered by "{{ rrStatusFilter }}").
            </div>
          </div>

          <!-- ===== NEW: In 'To Receive' tab, also show siblings (RR + Completed) ===== -->
          <div v-if="statusFilter === STATUS.TO_RECEIVE && (g.siblingRRItems.length || g.siblingCompletedItems.length)" class="mt-3">
            <div class="small text-muted mb-1">Other items in this reference</div>

            <!-- RR siblings -->
            <div
              v-for="s in g.siblingRRItems"
              :key="'rr-'+g.groupKey+':'+s.product_id+':'+s.order_id"
              class="d-flex align-items-center justify-content-between border rounded p-2 bg-body mb-2"
            >
              <div class="d-flex align-items-center gap-3">
                <div class="order-thumb ratio ratio-1x1 bg-white rounded">
                  <img
                    v-if="productThumb(s.product)"
                    :src="productThumb(s.product)"
                    :alt="s.product?.name || 'Product'"
                    class="w-100 h-100 object-fit-cover rounded"
                  />
                  <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                    <i class="bi bi-image"></i>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-semibold title-ellipsis text-danger" :title="s.product?.name || s.product_id">
                    {{ s.product?.name || s.product_id }} <span class="small">({{ s.qty }} × ₱ {{ number(s.price_each) }})</span>
                  </div>
                  <div class="text-danger small">
                    Return/Refund — {{ prettyRRStatus(s.rrStatus) }}
                  </div>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-outline-danger btn-sm" @click="viewReturnDetails()">
                  View return details
                </button>
              </div>
            </div>

            <!-- Completed siblings -->
            <div
              v-for="s in g.siblingCompletedItems"
              :key="'done-'+g.groupKey+':'+s.product_id+':'+s.order_id"
              class="d-flex align-items-center gap-3 border rounded p-2 bg-body mb-2"
            >
              <div class="order-thumb ratio ratio-1x1 bg-white rounded">
                <img
                  v-if="productThumb(s.product)"
                  :src="productThumb(s.product)"
                  :alt="s.product?.name || 'Product'"
                  class="w-100 h-100 object-fit-cover rounded"
                />
                <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                  <i class="bi bi-image"></i>
                </div>
              </div>
              <div class="flex-grow-1">
                <div class="fw-semibold title-ellipsis" :title="s.product?.name || s.product_id">
                  {{ s.product?.name || s.product_id }} <span class="small">({{ s.qty }} × ₱ {{ number(s.price_each) }})</span>
                </div>
                <div class="small text-muted">₱ {{ number(s.line_total) }}</div>
              </div>
              <span class="badge text-bg-success-subtle border">Completed</span>
            </div>
          </div>
          <!-- ===== /NEW ===== -->

          <!-- NEW: In 'Completed' tab, also show RR items that are completed -->
          <div v-if="statusFilter === STATUS.COMPLETED && g.completedRRItems.length" class="mt-3">
            <div class="small text-muted mb-1">Refunded items (completed)</div>

            <div
              v-for="s in g.completedRRItems"
              :key="'rrc-'+g.groupKey+':'+s.product_id+':'+s.order_id"
              class="d-flex align-items-center justify-content-between border rounded p-2 bg-body mb-2"
            >
              <div class="d-flex align-items-center gap-3">
                <div class="order-thumb ratio ratio-1x1 bg-white rounded">
                  <img
                    v-if="productThumb(s.product)"
                    :src="productThumb(s.product)"
                    :alt="s.product?.name || 'Product'"
                    class="w-100 h-100 object-fit-cover rounded"
                  />
                  <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                    <i class="bi bi-image"></i>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-semibold title-ellipsis" :title="s.product?.name || s.product_id">
                    {{ s.product?.name || s.product_id }}
                    <span class="small">({{ s.qty }} × ₱ {{ number(s.price_each) }})</span>
                  </div>
                  <div class="small text-success">
                    Refund Completed
                  </div>
                </div>
              </div>
              <span class="badge text-bg-success-subtle border">Refunded</span>
            </div>
          </div>
          <!-- /NEW -->

          <!-- Row 4: group actions -->
          <div class="mt-3 d-flex flex-wrap gap-2 justify-content-end">
            <!-- Group Approve (only when ALL are TO_PAY) -->
            <button
              v-if="g.allToPay"
              class="btn btn-primary btn-sm"
              :disabled="busy.anyGroup(g.groupKey)"
              @click="approveGroup(g)"
              title="Approve all purchases in this reference and move to To Ship (no deduction)"
            >
              <span v-if="busy.anyGroup(g.groupKey)" class="spinner-border spinner-border-sm me-1"></span>
              Approve (all)
            </button>

            <!-- Group Mark as Shipped (only when ALL are TO_SHIP) -->
            <button
              v-if="g.allToShip"
              class="btn btn-primary btn-sm"
              :disabled="busy.anyGroup(g.groupKey)"
              @click="markGroupAsShipped(g)"
            >
              <span v-if="busy.anyGroup(g.groupKey)" class="spinner-border spinner-border-sm me-1"></span>
              Mark as Shipped (all)
            </button>

            <!-- Group Cancel (allowed for TO_PAY and TO_SHIP per your rules; processes per order rules) -->
            <button
              v-if="g.canGroupCancel"
              class="btn btn-outline-danger btn-sm"
              :disabled="busy.anyGroup(g.groupKey)"
              @click="cancelGroup(g)"
            >
              <span v-if="busy.anyGroup(g.groupKey)" class="spinner-border spinner-border-sm me-1"></span>
              Cancel (all)
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
/** Status constants (align with your purchase_status enum) */
const STATUS = {
  TO_PAY: 'to pay',
  TO_SHIP: 'to ship',
  TO_RECEIVE: 'to receive',   // kept spelling per your schema
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
  qty: number
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
  updated_at: string
  items: Array<OrderItem>
}

/** Grouped view model */
type ViewGroup = {
  groupKey: string
  reference_number: string
  created_at: string
  updated_at: string | null
  statusSummaryLabel: string
  statusSummaryClassKey: string
  paymentSummaryLabel: string
  paymentSummaryTitle: string
  total_amount: number
  shipping_address: string | null
  phone_number: string | null
  items: Array<OrderItem>
  purchases: Array<ViewOrder>
  containsRR: boolean
  allToPay: boolean
  allToShip: boolean
  canGroupCancel: boolean
  /* NEW for To Receive sibling display */
  siblingRRItems: Array<OrderItem & { rrStatus: string | null }>
  siblingCompletedItems: Array<OrderItem>
  /* NEW for Completed tab display of refunded items */
  completedRRItems: Array<OrderItem & { rrStatus: string | null }>
}

/* ---------- UI state ---------- */
type BusyState = {
  load: boolean
  action: Record<string, boolean>
  anyGroup: (k: string) => boolean
}

const busy = ref<BusyState>({
  load: false,
  action: {},
  anyGroup: () => false
})

/**
 * IMPORTANT: Make groupIndex NON-REACTIVE.
 * We fill/clear it inside the `orderGroups` computed. If this were reactive,
 * those mutations would retrigger the computed and cause an infinite loop.
 */
let groupIndex: Record<string, string[]> = Object.create(null)

busy.value.anyGroup = (k: string): boolean => {
  const ids = groupIndex[k] || []
  return ids.some(id => !!busy.value.action[id])
}

const statusFilter = ref<typeof tabs[number]['value']>('all')
const search = ref('')
const payment = ref<string>('') // UI-only currently
const dateFrom = ref<string>('')
const dateTo = ref<string>('')

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

/* NEW: for sibling fetches keyed by reference_number (includes all purchases for that ref) */
const siblingsByRef = reactive<Record<string, PurchaseRow[]>>({})

/* ---------- Helpers ---------- */
const number = (n: number | string | null | undefined) => Number(n ?? 0).toFixed(2)

/* Clean formatter: "Dec 18, 2025 • 3 PM" */
function formatClean(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const month = d.toLocaleString('en-US', { month: 'short' })
  const day = d.getDate()
  const year = d.getFullYear()
  let hours = d.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${month} ${day}, ${year} • ${hours} ${ampm}`
}

const formatDate = (iso?: string) => { // kept (legacy)
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
  if (k === 'approved' || k === 'completed') return 'text-bg-success-subtle border'
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
/* replaced in group display: list all RRs per group */
function firstReturn(purchaseId: string): ReturnRefundRow | undefined {
  const list = rrByPurchase[purchaseId] || []
  return list[0]
}

/* Helper: pull purchase info for badges */
function purchaseFromGroup(g: ViewGroup, purchaseId: string): ViewOrder | undefined {
  return g.purchases.find(p => p.id === purchaseId)
}
function purchaseStatusKey(g: ViewGroup, purchaseId: string): string {
  return String(purchaseFromGroup(g, purchaseId)?.status || '')
}
function purchasePayment(g: ViewGroup, purchaseId: string): string | null {
  return purchaseFromGroup(g, purchaseId)?.payment_method || null
}

/* ---------- GROUPING (by reference_number) ---------- */
const orderGroups = computed<ViewGroup[]>(() => {
  const byRef: Record<string, ViewOrder[]> = {}
  for (const o of orders.value) {
    const key = o.reference_number || o.id
    if (!byRef[key]) byRef[key] = []
    byRef[key].push(o)
  }

  // Clear & rebuild NON-REACTIVE cache safely inside computed
  for (const k of Object.keys(groupIndex)) delete groupIndex[k]

  const groups: ViewGroup[] = []
  for (const [ref, arr] of Object.entries(byRef)) {
    groupIndex[ref] = arr.map(a => a.id)

    const created_at = arr
      .map(a => a.created_at)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]

    const updated_at = arr
      .map(a => a.updated_at)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null

    const statuses = Array.from(new Set(arr.map(a => String(a.status || '').toLowerCase())))
    const allToPay = statuses.length === 1 && statuses[0] === STATUS.TO_PAY
    const allToShip = statuses.length === 1 && statuses[0] === STATUS.TO_SHIP
    const canGroupCancel = statuses.every(s => s === STATUS.TO_PAY || s === STATUS.TO_SHIP)

    let statusSummaryLabel = 'Mixed'
    let statusSummaryClassKey = 'mixed'
    if (statuses.length === 1) {
      statusSummaryLabel = prettyStatus(statuses[0])
      statusSummaryClassKey = statuses[0]
    }

    const pays = Array.from(new Set(arr.map(a => (a.payment_method || '—').toString())))
    const paymentSummaryLabel = pays.length === 1 ? (pays[0] || '—') : 'Mixed'
    const paymentSummaryTitle = pays.join(', ')

    const shipping_address = arr[0]?.shipping_address ?? null
    const phone_number = arr[0]?.phone_number ?? null

    const items = arr.flatMap(a => a.items)
    const total_amount = items.reduce((s, it) => s + Number(it.line_total || 0), 0)

    const containsRR = arr.some(a => (rrByPurchase[a.id] || []).length > 0)

    /* NEW: build sibling display arrays for To Receive */
    const siblingRRItems: Array<OrderItem & { rrStatus: string | null }> = []
    const siblingCompletedItems: Array<OrderItem> = []

    /* NEW: for Completed tab — gather RR purchases with rr status = completed */
    const completedRRItems: Array<OrderItem & { rrStatus: string | null }> = []
    if (statusFilter.value === STATUS.COMPLETED) {
      const allForRef: PurchaseRow[] = (siblingsByRef[ref] || []).length
        ? siblingsByRef[ref]
        : arr.map(a => ({
            id: a.id,
            user_id: a.user_id,
            product_id: a.items[0]?.product_id || '',
            reference_number: ref,
            status: String(a.status || ''),
            created_at: a.created_at,
            updated_at: a.updated_at,
            modeofpayment: a.payment_method,
            qty: a.items[0]?.qty || 1
          } as PurchaseRow))

      for (const pr of allForRef) {
        const st = String(pr.status || '').toLowerCase()
        if (st === STATUS.RETURN_REFUND) {
          const rrList = rrByPurchase[pr.id] || []
          const hasCompletedRR = rrList.some(r => String(r.status).toLowerCase() === 'completed')
          if (hasCompletedRR) {
            const prod = productsMap[pr.product_id]
            const qty = Number(pr.qty ?? 1) || 1
            const price = Number(prod?.price ?? 0)
            completedRRItems.push({
              order_id: pr.id,
              product_id: pr.product_id,
              qty,
              price_each: price,
              line_total: Number((price * qty).toFixed(2)),
              product: prod,
              rrStatus: 'completed'
            })
          }
        }
      }
    }

    groups.push({
      groupKey: ref,
      reference_number: ref,
      created_at,
      updated_at,
      statusSummaryLabel,
      statusSummaryClassKey,
      paymentSummaryLabel,
      paymentSummaryTitle,
      total_amount,
      shipping_address,
      phone_number,
      items,
      purchases: arr,
      containsRR,
      allToPay,
      allToShip,
      canGroupCancel,
      siblingRRItems,
      siblingCompletedItems,
      completedRRItems
    })
  }

  let out = groups.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // NEW: Completed tab visibility filter based on whole reference state
  if (statusFilter.value === STATUS.COMPLETED) {
    out = out.filter(g => {
      const allPurchasesForRef = (siblingsByRef[g.reference_number] || [])
        // join with current visible ones (which are completed)
        .concat(g.purchases.map(p => ({
          id: p.id,
          user_id: p.user_id,
          product_id: p.items[0]?.product_id || '',
          reference_number: g.reference_number,
          status: String(p.status || ''),
          created_at: p.created_at,
          updated_at: p.updated_at,
          modeofpayment: p.payment_method,
          qty: p.items[0]?.qty || 1
        } as PurchaseRow)))

      // For a reference to show in Completed:
      // - every purchase must be either completed
      // - or return/refund with status approved/completed
      // - if any pending RR or any other status (to pay/ship/receive), hide
      for (const pr of allPurchasesForRef) {
        const st = String(pr.status || '').toLowerCase()
        if (st === STATUS.COMPLETED) continue
        if (st === STATUS.RETURN_REFUND) {
          const list = rrByPurchase[pr.id] || []
          // consider presence of any pending => hide
          const hasPending = list.some(r => String(r.status).toLowerCase() === 'pending')
          const okNonPending = list.length > 0 && list.every(r => {
            const rs = String(r.status).toLowerCase()
            return rs === 'approved' || rs === 'completed'
          })
          if (hasPending) return false
          if (!okNonPending) return false
          continue
        }
        // any other status blocks
        return false
      }
      return true
    })
  }

  return out
})

function groupSubtotal(g: ViewGroup) {
  return g.items.reduce((sum, it) => sum + Number(it.line_total || 0), 0)
}

function groupRRs(g: ViewGroup): ReturnRefundRow[] {
  const out: ReturnRefundRow[] = []
  for (const p of g.purchases) {
    const list = rrByPurchase[p.id] || []
    if (rrStatusFilter.value === 'all') {
      out.push(...list)
    } else {
      out.push(...list.filter(r => String(r.status).toLowerCase() === rrStatusFilter.value))
    }
  }
  return out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
      .select('id,user_id,product_id,reference_number,status,created_at,updated_at,modeofpayment,qty', { count: 'exact' })

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

    // collect primary id sets
    const productIds = new Set<string>()
    const userIds = new Set<string>()
    const purchaseIds = new Set<string>()
    const refSet = new Set<string>()

    for (const p of purchaseRows) {
      if (p.product_id) productIds.add(p.product_id)
      if (p.user_id) userIds.add(p.user_id)
      purchaseIds.add(p.id)
      if (p.reference_number) refSet.add(p.reference_number)
    }

    // === NEW: fetch siblings for To Receive & Completed tabs ===
    // for those references, we need all purchases in that reference (any status)
    let siblingRows: PurchaseRow[] = []
    if (refSet.size && (statusFilter.value === STATUS.TO_RECEIVE || statusFilter.value === STATUS.COMPLETED)) {
      const refs = Array.from(refSet)
      const { data: sib } = await supabase
        .schema('games')
        .from('purchases')
        .select('id,user_id,product_id,reference_number,status,created_at,updated_at,modeofpayment,qty')
        .in('reference_number', refs)

      siblingRows = Array.isArray(sib) ? (sib as PurchaseRow[]) : []
      for (const s of siblingRows) {
        if (s.product_id) productIds.add(s.product_id)
        if (s.user_id) userIds.add(s.user_id)
        // include siblings in RR fetch set
        purchaseIds.add(s.id)
      }

      // store siblings by reference (for display/filtering)
      for (const r of refs) siblingsByRef[r] = siblingRows.filter(s => s.reference_number === r)
    } else {
      // clear old cache to avoid leaking old state
      for (const k of Object.keys(siblingsByRef)) delete siblingsByRef[k]
    }

    // products
    if (productIds.size > 0) {
      const { data: prows } = await supabase
        .schema('games')
        .from('products')
        .select('id,name,description,price,product_url')
        .in('id', Array.from(productIds))
      if (Array.isArray(prows)) {
        for (const p of prows as Product[]) productsMap[p.id] = p
      }
    }

    // users
    if (userIds.size > 0) {
      const { data: urows } = await supabase
        .from('users')
        .select('id, phone_number, address')
        .in('id', Array.from(userIds))
      if (Array.isArray(urows)) {
        for (const u of urows as Buyer[]) buyersMap[u.id] = u
      }
    }

    // clear RR map before refill
    for (const key of Object.keys(rrByPurchase)) delete rrByPurchase[key]

    // We now ALSO need RR when statusFilter is TO_RECEIVE or COMPLETED (for sibling/visibility logic)
    const needRR = (
      statusFilter.value === STATUS.RETURN_REFUND ||
      statusFilter.value === 'all' ||
      statusFilter.value === STATUS.TO_RECEIVE ||
      statusFilter.value === STATUS.COMPLETED
    ) && purchaseIds.size > 0

    if (needRR) {
      let rrQ = supabase
        .schema('games')
        .from('return_refunds')
        .select('id,user_id,purchase_id,product_id,reason,details,status,created_at,updated_at')
        .in('purchase_id', Array.from(purchaseIds))

      if (statusFilter.value === STATUS.RETURN_REFUND && rrStatusFilter.value !== 'all') {
        rrQ = rrQ.eq('status', rrStatusFilter.value)
      }

      const { data: rrRows } = await rrQ
      if (Array.isArray(rrRows)) {
        for (const r of rrRows as ReturnRefundRow[]) {
          const arr = rrByPurchase[r.purchase_id] || []
          arr.push(r)
          rrByPurchase[r.purchase_id] = arr
        }
      }
    }

    // build view rows (only for the fetched set for this tab)
    let view: ViewOrder[] = purchaseRows.map(pr => {
      const prod = productsMap[pr.product_id]
      const buyer = buyersMap[pr.user_id]
      const price = Number(prod?.price ?? 0)
      const qty = Number(pr.qty ?? 1) || 1

      const item: OrderItem = {
        order_id: pr.id,
        product_id: pr.product_id,
        qty,
        price_each: price,
        line_total: Number((price * qty).toFixed(2)),
        product: prod,
      }

      return {
        id: pr.id,
        user_id: pr.user_id,
        reference_number: pr.reference_number,
        total_amount: item.line_total,
        payment_method: pr.modeofpayment || null,
        shipping_address: buyer?.address ?? null,
        phone_number: buyer?.phone_number ?? null,
        status: pr.status,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        items: [item],
      }
    })

    if (statusFilter.value === STATUS.RETURN_REFUND && rrStatusFilter.value !== 'all') {
      const keep = new Set<string>()
      for (const [pid, list] of Object.entries(rrByPurchase)) {
        if (list.some(r => String(r.status).toLowerCase() === rrStatusFilter.value)) keep.add(pid)
      }
      view = view.filter(v => keep.has(v.id))
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
/* NEW helper: detect COD */
function isCODPayment(method?: string | null) {
  return String(method || '').trim().toLowerCase() === 'cod'
}

/* UPDATED: supports bulk cancellation without per-item prompts when skipConfirm=true.
   E-WALLET + TO_SHIP: refund balance + insert into ewallet.cancelled_ewallet_receipt.
   COD + (TO_PAY or TO_SHIP): insert into ewallet.cancelled_receipt **with reference_number**. */
async function cancelOrder(purchaseId: string, skipConfirm = false) {
  if (!skipConfirm && !confirm('Cancel this order?')) return
  const order = orders.value.find(o => o.id === purchaseId)
  if (!order) {
    await updateStatus(purchaseId, STATUS.CANCELLED)
    return
  }

  const statusKey = String(order.status || '').toLowerCase()
  const isToShip = statusKey === STATUS.TO_SHIP
  const isToPay  = statusKey === STATUS.TO_PAY

  const isEwallet = isEwalletPayment(order.payment_method)
  const isCOD     = isCODPayment(order.payment_method)

  const shouldRefundEwallet = isEwallet && isToShip
  const shouldInsertCODReceipt = isCOD && (isToPay || isToShip)

  busy.value.action[purchaseId] = true
  try {
    if (shouldRefundEwallet) {
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

      const refundAmount = orderSubtotal(order)
      const userId = order.user_id

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
          console.error('[cancel ewallet refund] balance update failed]', balErr.message)
        }
      }

      // Insert into ewallet.cancelled_ewallet_receipt (bulk-friendly; includes reference_number)
      try {
        const { error: ewRecErr } = await supabase
          .schema('ewallet')
          .from('cancelled_ewallet_receipt')
          .insert({
            amount: Number(refundAmount.toFixed(2)),
            reference_number: order.reference_number || null,
            purchase_id: purchaseId,
          })

        if (ewRecErr) {
          console.error('[cancelled_ewallet_receipt insert failed]', ewRecErr.message)
        }
      } catch (e: any) {
        console.error('[cancelled_ewallet_receipt insert exception]', e?.message || e)
      }

      order.status = STATUS.CANCELLED
      return
    }

    if (shouldInsertCODReceipt) {
      const { error: upErr } = await supabase
        .schema('games')
        .from('purchases')
        .update({ status: STATUS.CANCELLED })
        .eq('id', purchaseId)
        .eq('status', order.status as string)

      if (upErr) {
        alert(upErr.message)
        return
      }

      // Insert COD cancelled receipt AND include reference_number (requested)
      try {
        const { error: recErr } = await supabase
          .schema('ewallet')
          .from('cancelled_receipt')
          .insert({
            purchase_id: purchaseId,
            reference_number: order.reference_number || null,
          })

        if (recErr) {
          console.error('[cancelled_receipt insert failed - COD]', recErr.message)
        }
      } catch (e: any) {
        console.error('[cancelled_receipt insert exception - COD]', e?.message || e)
      }

      order.status = STATUS.CANCELLED
      return
    }

    await updateStatus(purchaseId, STATUS.CANCELLED)
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

    const { error: upErr } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.TO_SHIP })
      .eq('id', purchaseId)

    if (upErr) {
      alert(upErr.message)
      return
    }

    const row = orders.value.find(o => o.id === purchaseId)
    if (row) row.status = STATUS.TO_SHIP

    const isCOD = String(order.payment_method || '').toLowerCase() === 'cod'
    if (isCOD) {
      const item = order.items[0]
      if (item) {
        const amount = Number(item.price_each || 0) * Number(item.qty || 1)

        const { error: recErr } = await supabase
          .schema('ewallet')
          .from('order_receipt')
          .insert({
            amount: Number(amount.toFixed(2)),
            reference_number: order.reference_number || null,
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

    const { error: rrUpdateErr } = await supabase
      .schema('games')
      .from('return_refunds')
      .update({ status: 'completed' })
      .eq('id', rrId)
      .eq('status', 'approved')
      .select('id')
      .single()

    if (rrUpdateErr) {
      alert(rrUpdateErr.message)
      return
    }

    const { data: urow, error: uErr } = await supabase
      .from('users')
      .select('id,balance')
      .eq('id', purchase.user_id)
      .single()

    if (uErr || !urow) {
      alert(uErr?.message || 'User not found for refund credit.')
      return
    }

    const currentBal = Number(urow.balance || 0)
    const newBal = Number((currentBal + refundAmount).toFixed(2))

    const { error: balErr } = await supabase
      .from('users')
      .update({ balance: newBal })
      .eq('id', purchase.user_id)

    if (balErr) {
      alert(balErr.message)
      return
    }

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

    rr.status = 'completed'
  } finally {
    busy.value.action[rrId] = false
  }
}
/* ---------- /NEW ---------- */

/* ---------- GROUP ACTION WRAPPERS (apply to all purchases with same reference_number) ---------- */
async function approveGroup(g: ViewGroup) {
  for (const o of g.purchases) {
    if (o.status === STATUS.TO_PAY) {
      await approveOrder(o)
    }
  }
}
async function markGroupAsShipped(g: ViewGroup) {
  for (const o of g.purchases) {
    if (o.status === STATUS.TO_SHIP) {
      await markAsShipped(o.id)
    }
  }
}
async function cancelGroup(g: ViewGroup) {
  if (!confirm('Cancel all purchases under this reference?')) return
  // Bulk cancel — no per-item confirmations:
  for (const o of g.purchases) {
    await cancelOrder(o.id, true /* skipConfirm */)
  }
}

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

/* NEW: jump to Return/Refund tab */
function viewReturnDetails() {
  statusFilter.value = STATUS.RETURN_REFUND
  rrStatusFilter.value = 'all'
  loadOrders(true)
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

/* Hide messy descriptions but keep original node intact */
.order-desc { display: none !important; }

/* Ellipsis for long titles in card body */
.title-ellipsis {
  display: block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tight badges for item metadata */
.badge-tight {
  font-weight: 500;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  line-height: 1;
}
</style>
