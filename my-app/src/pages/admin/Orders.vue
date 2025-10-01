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
    <ul class="nav nav-pills mb-3 flex-wrap gap-2">
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
              placeholder="Search address, phone, order ID…"
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
                <span class="text-muted">Order</span>
                <span class="ms-1">{{ shortId(o.id) }}</span>
              </div>
              <div class="small text-muted">
                {{ formatDate(o.created_at) }}
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <span class="badge" :class="statusClass(o.status)">
                {{ prettyStatus(o.status) }}
              </span>
              <span class="badge text-bg-light border">{{ o.payment_method || '—' }}</span>
            </div>
          </div>

          <!-- Row 2: Items -->
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

          <!-- Row 4: actions -->
          <div class="mt-3 d-flex flex-wrap gap-2 justify-content-end">
            <!-- To Ship: seller can mark as shipped -->
            <button
              v-if="o.status === STATUS.TO_SHIP"
              class="btn btn-primary btn-sm"
              :disabled="busy.action[o.id]"
              @click="markAsShipped(o.id)"
            >
              <span v-if="busy.action[o.id]" class="spinner-border spinner-border-sm me-1"></span>
              Mark as Shipped
            </button>

            <!-- To Receive: seller can complete -->
            <button
              v-if="o.status === STATUS.TO_RECEIVE"
              class="btn btn-success btn-sm"
              :disabled="busy.action[o.id]"
              @click="markAsCompleted(o.id)"
            >
              <span v-if="busy.action[o.id]" class="spinner-border spinner-border-sm me-1"></span>
              Complete
            </button>

            <!-- Any active state: allow cancel (except already cancelled/completed/return/refund) -->
            <button
              v-if="o.status !== STATUS.CANCELLED && o.status !== STATUS.COMPLETED && o.status !== STATUS.RETURN_REFUND"
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

/** Status constants (align with your purchase/order ecosystem) */
const STATUS = {
  TO_PAY: 'to pay',
  TO_SHIP: 'to ship',
  TO_RECEIVE: 'to recieve',   // kept spelling from your schema
  COMPLETED: 'completed',
  RETURN_REFUND: 'return/refund',
  CANCELLED: 'cancelled',
} as const

/** Tabs */
const tabs = [
  { label: 'All',            value: 'all' },
  { label: 'To Ship',        value: STATUS.TO_SHIP },
  { label: 'To Receive',     value: STATUS.TO_RECEIVE },
  { label: 'Completed',      value: STATUS.COMPLETED },
  { label: 'Return/Refund',  value: STATUS.RETURN_REFUND },
  { label: 'Cancelled',      value: STATUS.CANCELLED },
] as const

type Order = {
  id: string
  user_id: string
  total_amount: number | string | null
  payment_method: string | null
  shipping_address: string | null
  phone_number: string | null
  status: string | null
  created_at: string
}
type OrderItem = {
  order_id: string
  product_id: string
  qty: number
  price_each: number | string
  line_total: number | string
}
type Product = {
  id: string
  name: string
  description: string | null
  price: number | string
  product_url: string[] | null
}

type ViewOrder = Order & {
  items: Array<OrderItem & { product?: Product }>
}

/* ---------- UI state ---------- */
const busy = ref<{ load: boolean; action: Record<string, boolean> }>({ load: false, action: {} })
const statusFilter = ref<typeof tabs[number]['value']>('all')
const search = ref('')
const payment = ref<string>('')        // '', COD, Prepaid
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
const signedUrlMap: Record<string, string> = reactive({})
const signingBusy: Record<string, boolean> = reactive({})

/* ---------- Helpers ---------- */
const number = (n: number | string | null | undefined) => Number(n ?? 0).toFixed(2)
const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return iso as string }
}
const shortId = (s: string) => (s ? `${s.slice(0, 6)}…${s.slice(-4)}` : '—')
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

/* ---------- Fetch ---------- */
async function loadOrders(resetPage = false) {
  if (resetPage) page.value = 1
  busy.value.load = true
  try {
    const from = (page.value - 1) * pageSize.value
    const to = from + pageSize.value - 1

    let q = supabase
      .schema('games')
      .from('orders')
      .select('id,user_id,total_amount,payment_method,shipping_address,phone_number,status,created_at', { count: 'exact' })

    // Status filter
    if (statusFilter.value !== 'all') q = q.eq('status', statusFilter.value)

    // Payment filter
    if (payment.value) q = q.eq('payment_method', payment.value)

    // Date range
    if (dateFrom.value) q = q.gte('created_at', new Date(dateFrom.value).toISOString())
    if (dateTo.value) {
      const end = new Date(dateTo.value)
      end.setDate(end.getDate() + 1) // inclusive to end of day
      q = q.lt('created_at', end.toISOString())
    }

    // Search (address / phone / order id)
    if (search.value) {
      const term = search.value.trim()
      q = q.or(`shipping_address.ilike.%${term}%,phone_number.ilike.%${term}%,id.ilike.%${term}%`)
    }

    q = q.order('created_at', { ascending: false }).range(from, to)

    const { data: orderRows, error, count } = await q
    if (error) {
      orders.value = []
      total.value = 0
      return
    }

    total.value = count ?? 0
    const ids = (orderRows || []).map(r => r.id)
    const view: ViewOrder[] = (orderRows || []).map(r => ({ ...r, items: [] }))

    if (ids.length > 0) {
      // items
      const { data: itemRows } = await supabase
        .schema('games')
        .from('order_items')
        .select('order_id,product_id,qty,price_each,line_total')
        .in('order_id', ids)

      // products
      const prodIds = Array.from(new Set((itemRows || []).map(i => i.product_id)))
      if (prodIds.length > 0) {
        const { data: prows } = await supabase
          .schema('games')
          .from('products')
          .select('id,name,description,price,product_url')
          .in('id', prodIds)

        if (Array.isArray(prows)) {
          for (const p of prows as Product[]) productsMap[p.id] = p
        }
      }

      const itemsByOrder = new Map<string, (OrderItem & { product?: Product })[]>()
      for (const it of (itemRows || []) as OrderItem[]) {
        const arr = itemsByOrder.get(it.order_id) || []
        arr.push({ ...it, product: productsMap[it.product_id] })
        itemsByOrder.set(it.order_id, arr)
      }

      for (const v of view) {
        v.items = itemsByOrder.get(v.id) || []
      }
    }

    orders.value = view
  } finally {
    busy.value.load = false
  }
}

/* ---------- Actions ---------- */
async function updateStatus(orderId: string, status: string) {
  busy.value.action[orderId] = true
  try {
    const { error } = await supabase
      .schema('games')
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      alert(error.message)
      return
    }
    // Reflect locally
    const row = orders.value.find(o => o.id === orderId)
    if (row) row.status = status
  } finally {
    busy.value.action[orderId] = false
  }
}
async function markAsShipped(orderId: string) {
  await updateStatus(orderId, STATUS.TO_RECEIVE)
}
async function markAsCompleted(orderId: string) {
  await updateStatus(orderId, STATUS.COMPLETED)
}
async function cancelOrder(orderId: string) {
  if (!confirm('Cancel this order?')) return
  await updateStatus(orderId, STATUS.CANCELLED)
}

/* ---------- Filters & pagination handlers ---------- */
function setStatus(v: typeof tabs[number]['value']) {
  if (statusFilter.value !== v) {
    statusFilter.value = v
    loadOrders(true)
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
