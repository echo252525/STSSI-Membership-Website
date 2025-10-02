<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h1 class="h4 m-0">My Purchases</h1>
        <p class="text-muted small mb-0">Track your orders and delivery status.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button
          class="btn btn-outline-secondary btn-sm"
          :disabled="busy.load"
          @click="loadPurchases"
        >
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
    <div v-else-if="groupedFiltered.length === 0" class="text-center text-muted py-5">
      <i class="bi bi-bag-x" style="font-size: 1.6rem"></i>
      <div class="mt-2">
        No purchases found for “{{ tabLabel(activeTab) }}”<span
          v-if="activeTab === STATUS.RETURN_REFUND"
        >
          · {{ rrTabLabel(activeRR) }}</span
        >.
      </div>
      <RouterLink :to="{ name: 'user.shop' }" class="btn btn-primary btn-sm mt-3">
        Go to Shop
      </RouterLink>
    </div>

    <!-- ====== NEW: Grouped Purchases list (default) ====== -->
    <div v-else-if="showGrouped" class="row g-3">
      <div v-for="g in groupedFiltered" :key="g.ref" class="col-12">
        <div class="card shadow-sm rounded-4">
          <div class="card-body">
            <!-- Group header -->
            <div class="d-flex flex-wrap align-items-center justify-content-between">
              <div class="d-flex flex-column">
                <div class="fw-semibold">
                  <span class="text-muted">Ref#</span>
                  <span class="ms-1">{{ g.ref }}</span>
                </div>
                <div class="small text-muted">
                  {{ formatDate(g.created_at) }}
                </div>
              </div>

              <div class="d-flex align-items-center gap-2">
                <span class="badge" :class="statusClass(g.status)">
                  {{ prettyStatus(g.status) }}
                </span>
                <!-- Show RR status chip when on Return/Refund tab -->
                <span
                  v-if="activeTab === STATUS.RETURN_REFUND && g.rrBadge"
                  class="badge text-bg-light border"
                  :title="'RR status: ' + rrTabLabel(g.rrBadge)"
                >
                  {{ rrTabLabel(g.rrBadge) }}
                </span>
              </div>
            </div>

            <!-- Items inside group -->
            <div class="mt-3 vstack gap-2">
              <div
                v-for="it in g.items"
                :key="it.id"
                class="d-flex align-items-center gap-3 border rounded p-2 bg-light-subtle"
              >
                <div class="purchase-thumb ratio ratio-1x1 bg-white rounded">
                  <img
                    v-if="productThumb(it)"
                    :src="productThumb(it)"
                    :alt="productName(it)"
                    class="w-100 h-100 object-fit-cover rounded"
                  />
                  <div
                    v-else
                    class="w-100 h-100 d-flex align-items-center justify-content-center text-muted"
                  >
                    <i class="bi bi-image"></i>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-semibold text-truncate" :title="productName(it)">
                    {{ productName(it) }}
                  </div>
                  <div class="text-muted small text-truncate" v-if="productDesc(it)">
                    {{ productDesc(it) }}
                  </div>
                </div>
                <div class="text-end">
                  <div class="fw-semibold">₱ {{ number(productPrice(it)) }}</div>
                  <div class="small text-muted">Qty: {{ Number(it.qty ?? 1) }}</div>
                  <div class="small">
                    Line: ₱ {{ number(Number(it.qty ?? 1) * Number(productPrice(it) || 0)) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Group totals -->
            <div class="mt-3 d-flex align-items-center justify-content-end">
              <div class="text-end">
                <div class="small text-muted">Subtotal</div>
                <div class="fs-5 fw-bold">₱ {{ number(groupTotal(g)) }}</div>
              </div>
            </div>

            <!-- Group actions -->
            <div class="mt-3 d-flex align-items-center justify-content-end">
              <div class="d-flex gap-2 flex-wrap">
                <!-- to pay: Cancel group -->
                <button
                  v-if="g.status === STATUS.TO_PAY"
                  class="btn btn-outline-danger btn-sm"
                  :disabled="groupBusy.cancel[g.ref]"
                  @click="cancelGroup(g)"
                >
                  <span
                    v-if="groupBusy.cancel[g.ref]"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  Cancel
                </button>

                <!-- to ship: NO BUTTONS -->
                <template v-else-if="g.status === STATUS.TO_SHIP">
                  <!-- intentionally empty -->
                </template>

                <!-- to recieve: Return/Refund group & Order Received group -->
                <template v-else-if="g.status === STATUS.TO_RECEIVE">
                  <button class="btn btn-outline-warning btn-sm" @click="openReturnRefundGroup(g)">
                    Return/Refund
                  </button>
                  <button
                    class="btn btn-success btn-sm"
                    :disabled="groupBusy.received[g.ref]"
                    @click="orderReceivedGroup(g)"
                    title="Mark all as received"
                  >
                    <span
                      v-if="groupBusy.received[g.ref]"
                      class="spinner-border spinner-border-sm me-1"
                    ></span>
                    Order Received
                  </button>
                </template>

                <!-- completed: NO BUTTONS -->
                <template v-else-if="g.status === STATUS.COMPLETED">
                  <!-- intentionally empty -->
                </template>

                <!-- return/refund: Pending => Cancel RR group -->
                <button
                  v-else-if="g.status === STATUS.RETURN_REFUND && g.rrBadge === 'pending'"
                  class="btn btn-outline-danger btn-sm"
                  :disabled="groupBusy.rrCancel[g.ref]"
                  @click="cancelReturnRefundGroup(g)"
                >
                  <span
                    v-if="groupBusy.rrCancel[g.ref]"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  Cancel
                </button>

                <!-- return/refund: Approved/Completed/Rejected => NO BUTTON -->
                <template v-else-if="g.status === STATUS.RETURN_REFUND">
                  <!-- intentionally empty -->
                </template>

                <!-- cancelled: NO BUTTON -->
                <template v-else-if="g.status === STATUS.CANCELLED">
                  <!-- intentionally empty -->
                </template>
              </div>
            </div>

            <!-- Footer (timestamps) -->
            <div class="mt-3 small text-muted d-flex flex-wrap gap-3">
              <span>Created: {{ formatDate(g.created_at) }}</span>
              <span>Updated: {{ formatDate(g.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- /group cards -->
    </div>

    <!-- ====== Original Purchases list (kept, fallback) ====== -->
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
                    <div
                      v-else
                      class="w-100 h-100 d-flex align-items-center justify-content-center text-muted"
                    >
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
                    <div class="small text-muted">Qty: {{ Number(p.qty ?? 1) }}</div>
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
                    <span
                      v-if="busy.cancel[p.id]"
                      class="spinner-border spinner-border-sm me-1"
                    ></span>
                    Cancel
                  </button>

                  <!-- to ship: NO BUTTONS -->
                  <template v-else-if="p.status === STATUS.TO_SHIP">
                    <!-- intentionally empty -->
                  </template>

                  <!-- to recieve: show BOTH Return/Refund and Order Received -->
                  <template v-else-if="p.status === STATUS.TO_RECEIVE">
                    <button class="btn btn-outline-warning btn-sm" @click="openReturnRefund(p)">
                      Return/Refund
                    </button>
                    <button
                      class="btn btn-success btn-sm"
                      :disabled="busy.received[p.id]"
                      @click="orderReceived(p.id)"
                      title="Mark as received"
                    >
                      <span
                        v-if="busy.received[p.id]"
                        class="spinner-border spinner-border-sm me-1"
                      ></span>
                      Order Received
                    </button>
                  </template>

                  <!-- completed: NO BUTTONS -->
                  <template v-else-if="p.status === STATUS.COMPLETED">
                    <!-- intentionally empty -->
                  </template>

                  <!-- return/refund: Pending => Cancel RR -->
                  <button
                    v-else-if="p.status === STATUS.RETURN_REFUND && rrStatus(p.id) === 'pending'"
                    class="btn btn-outline-danger btn-sm"
                    :disabled="busy.rrCancel[p.id]"
                    @click="cancelReturnRefund(p)"
                  >
                    <span
                      v-if="busy.rrCancel[p.id]"
                      class="spinner-border spinner-border-sm me-1"
                    ></span>
                    Cancel
                  </button>

                  <!-- return/refund: Approved/Completed/Rejected => NO BUTTON -->
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
          <!-- Group/Purchase preview -->
          <div v-if="rrGroup" class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="fw-semibold">Ref# {{ rrGroup.ref }}</div>
              <div class="small text-muted">
                {{ formatDate(rrGroup.created_at) }}
              </div>
            </div>
            <!-- Select items inside this group -->
            <div class="mt-2 border rounded p-2">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="fw-semibold">Select item(s) to return/refund</div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="rrSelAll"
                    v-model="rrSelectAll"
                    @change="toggleRRSelectAll"
                  />
                  <label for="rrSelAll" class="form-check-label small">Select All</label>
                </div>
              </div>
              <div class="vstack gap-2">
                <label
                  v-for="it in rrGroup.items"
                  :key="'rr-' + it.id"
                  class="d-flex align-items-center gap-3 border rounded p-2 bg-light-subtle"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="it.id"
                    v-model="rrForm.purchase_ids"
                    @change="syncRRSelectAll"
                  />
                  <div class="purchase-thumb ratio ratio-1x1 bg-white rounded">
                    <img
                      v-if="productThumb(it)"
                      :src="productThumb(it)"
                      :alt="productName(it)"
                      class="w-100 h-100 object-fit-cover rounded"
                    />
                    <div
                      v-else
                      class="w-100 h-100 d-flex align-items-center justify-content-center text-muted"
                    >
                      <i class="bi bi-image"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <div class="fw-semibold text-truncate" :title="productName(it)">
                      {{ productName(it) }}
                    </div>
                    <div class="text-muted small">Qty: {{ Number(it.qty ?? 1) }}</div>
                  </div>
                  <div class="text-end">
                    <div class="small">₱ {{ number(productPrice(it)) }}</div>
                    <div class="small text-muted">
                      Line: ₱ {{ number(Number(it.qty ?? 1) * Number(productPrice(it) || 0)) }}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- (Kept) Purchase + Product preview (single) -->
          <div v-else-if="rrPurchase" class="d-flex align-items-center gap-3 mb-3">
            <div class="purchase-thumb ratio ratio-1x1 bg-light rounded">
              <img
                v-if="productThumb(rrPurchase)"
                :src="productThumb(rrPurchase)"
                :alt="productName(rrPurchase)"
                class="w-100 h-100 object-fit-cover rounded"
              />
              <div
                v-else
                class="w-100 h-100 d-flex align-items-center justify-content-center text-muted"
              >
                <i class="bi bi-image"></i>
              </div>
            </div>
            <div class="flex-grow-1">
              <div class="fw-semibold text-truncate">{{ productName(rrPurchase) }}</div>
              <div class="text-muted small">
                Ref# {{ rrPurchase.reference_number || shortId(rrPurchase.id) }}
              </div>
            </div>
            <div class="text-end">
              <div class="fw-semibold">₱ {{ number(productPrice(rrPurchase)) }}</div>
              <div class="small text-muted">Qty: {{ Number(rrPurchase.qty ?? 1) }}</div>
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
                <textarea
                  v-model.trim="rrForm.details"
                  class="form-control"
                  rows="4"
                  placeholder="Describe the issue (e.g., defective on arrival, wrong color/size, missing parts)."
                ></textarea>
              </div>

              <!-- Pickup / Return Date -->
              <div class="col-12">
                <label class="form-label">Pickup Date</label>
                <div class="d-flex gap-2 flex-wrap">
                  <select
                    v-model="rrQuickDate"
                    class="form-select"
                    style="max-width: 220px"
                    @change="applyQuickDate"
                  >
                    <option value="">Choose a quick date…</option>
                    <option :value="quickDates.tomorrow">
                      {{ labelFor(quickDates.tomorrow) }} (Tomorrow)
                    </option>
                    <option :value="quickDates.plus2">
                      {{ labelFor(quickDates.plus2) }} (+2 days)
                    </option>
                    <option :value="quickDates.plus3">
                      {{ labelFor(quickDates.plus3) }} (+3 days)
                    </option>
                  </select>
                  <input
                    v-model="rrForm.pickup_date"
                    type="date"
                    class="form-control"
                    style="max-width: 180px"
                    :min="todayYMD"
                    required
                  />
                </div>
                <div class="form-text">Select a quick option or pick an exact date.</div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeReturnRefund">
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-warning"
                :disabled="Boolean(
  rrBusy ||
  !rrForm.reason ||
  !rrForm.pickup_date ||
  (!!rrGroup && rrForm.purchase_ids.length === 0)
)"

              >
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
  TO_RECEIVE: 'to receive',
  COMPLETED: 'completed',
  RETURN_REFUND: 'return/refund',
  CANCELLED: 'cancelled',
} as const

/** Strong union type derived from STATUS */
type Status = (typeof STATUS)[keyof typeof STATUS]

/** Tabs (Shopee-like) */
const tabs = [
  { label: 'To Pay', value: STATUS.TO_PAY },
  { label: 'To Ship', value: STATUS.TO_SHIP },
  { label: 'To Receive', value: STATUS.TO_RECEIVE },
  { label: 'Completed', value: STATUS.COMPLETED },
  { label: 'Return/Refund', value: STATUS.RETURN_REFUND },
  { label: 'Cancelled', value: STATUS.CANCELLED },
] as const

const activeTab = ref<(typeof tabs)[number]['value']>(STATUS.TO_SHIP) // default for COD shops

/** Return/Refund Subtabs */
type RRState = 'pending' | 'approved' | 'completed' | 'rejected'
const rrSubtabs: Array<{ label: string; value: RRState }> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
]
const activeRR = ref<RRState>('pending')

/** Show grouped mode (kept original list as fallback) */
const showGrouped = true

/** UI state */
const busy = ref<{
  load: boolean
  cancel: Record<string, boolean>
  rrCancel: Record<string, boolean>
  received: Record<string, boolean>
}>({
  load: false,
  cancel: {},
  rrCancel: {},
  received: {},
})
/** NEW: group-level busy flags */
const groupBusy = reactive<{
  cancel: Record<string, boolean>
  rrCancel: Record<string, boolean>
  received: Record<string, boolean>
}>({
  cancel: {},
  rrCancel: {},
  received: {},
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
  const m: Record<RRState, string> = {
    pending: 'Pending',
    approved: 'Approved',
    completed: 'Completed',
    rejected: 'Rejected',
  }
  return m[v] || v
}

/* ---------------- Auto-complete "to receive" after 7 days ---------------- */
async function autocloseOverdue(uid: string) {
  const now = new Date()
  const threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: updatedRows, error } = await supabase
    .schema('games')
    .from('purchases')
    .update({ status: STATUS.COMPLETED })
    .eq('user_id', uid)
    .eq('status', STATUS.TO_RECEIVE)
    .lt('created_at', threshold)
    .select('id')

  if (error) return

  if (Array.isArray(updatedRows) && updatedRows.length) {
    const updatedIds = new Set(updatedRows.map((r: AnyRec) => r.id))
    for (const row of purchases.value) {
      if (updatedIds.has(row.id)) row.status = STATUS.COMPLETED
    }
  }
}

/** Load all purchases for the signed-in user + related products + RR rows */
async function loadPurchases() {
  busy.value.load = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth?.user?.id
    if (!uid) {
      purchases.value = []
      Object.keys(rrByPurchase).forEach((k) => delete rrByPurchase[k])
      return
    }

    // Purchases (include qty!)
    const { data, error } = await supabase
      .schema('games')
      .from('purchases')
      .select('id, user_id, product_id, reference_number, status, qty, created_at, updated_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    if (error) {
      purchases.value = []
      Object.keys(rrByPurchase).forEach((k) => delete rrByPurchase[k])
      return
    }
    purchases.value = Array.isArray(data) ? data : []

    // Auto-complete any overdue "to receive" -> "completed"
    await autocloseOverdue(uid)

    // Products for visible purchases
    const ids = Array.from(new Set(purchases.value.map((r) => r.product_id).filter(Boolean)))
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
            product_url: Array.isArray(pr.product_url) ? pr.product_url : null,
          }
        }
      }
    }

    // RR rows for this user, limited to purchases currently on list
    const purchaseIds = purchases.value.map((r) => r.id)
    Object.keys(rrByPurchase).forEach((k) => delete rrByPurchase[k])
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
    Object.keys(rrByPurchase).forEach((k) => delete rrByPurchase[k])
  } finally {
    busy.value.load = false
  }
}

/** ================= Grouping ================= */
type Group = {
  ref: string
  items: AnyRec[]
  created_at: string
  updated_at: string
  status: Status           // <- union type
  rrBadge?: RRState
}

/** Priority list typed as Status[] */
const statusPriority: Status[] = [
  STATUS.RETURN_REFUND,
  STATUS.TO_PAY,
  STATUS.TO_SHIP,
  STATUS.TO_RECEIVE,
  STATUS.COMPLETED,
  STATUS.CANCELLED,
]

function buildGroups(rows: AnyRec[]): Group[] {
  const map = new Map<string, Group>()
  for (const r of rows) {
    const ref = r.reference_number || r.id
    if (!map.has(ref)) {
      map.set(ref, {
        ref,
        items: [],
        created_at: r.created_at,
        updated_at: r.updated_at,
        status: r.status as Status,
      })
    }
    const g = map.get(ref)!
    g.items.push(r)
    // timestamps
    if (new Date(r.created_at).getTime() < new Date(g.created_at).getTime())
      g.created_at = r.created_at
    if (new Date(r.updated_at).getTime() > new Date(g.updated_at).getTime())
      g.updated_at = r.updated_at
  }

  // compute dominant status and rrBadge
  for (const g of map.values()) {
    const statuses = new Set<Status>(g.items.map((i) => i.status as Status))
    let dom: Status = STATUS.COMPLETED
    for (const s of statusPriority) {
      if (statuses.has(s)) {
        dom = s
        break
      }
    }
    g.status = dom

    if (dom === STATUS.RETURN_REFUND) {
      // if RR, show a chip representing the most "dominant" RR state in group
      // priority: pending > approved > completed > rejected
      const rrPriority: RRState[] = ['pending', 'approved', 'completed', 'rejected']
      let badge: RRState | undefined
      for (const st of rrPriority) {
        if (g.items.some((it) => rrStatus(it.id) === st)) {
          badge = st
          break
        }
      }
      g.rrBadge = badge
    }
  }

  // sort by created_at desc (same as purchases)
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

/** Counts per tab — now based on groups (simple Record<string, number> to avoid over-typing) */
const counts = computed<Record<string, number>>(() => {
  const out: Record<string, number> = {}
  for (const t of tabs) out[t.value] = 0
  const groups = buildGroups(purchases.value)
  for (const g of groups) {
    const k = g.status
    if (k in out) out[k]++
  }
  return out
})

/** RR Counts (within Return/Refund tab) — based on groups */
const rrCounts = computed<Record<RRState, number>>(() => {
  const init: Record<RRState, number> = { pending: 0, approved: 0, completed: 0, rejected: 0 }
  const groups = buildGroups(purchases.value).filter((g) => g.status === STATUS.RETURN_REFUND)
  for (const g of groups) {
    const badge = g.rrBadge
    if (badge) init[badge]++
  }
  return init
})

/** Original per-row filtered (kept for fallback block) */
const filtered = computed(() => {
  const base = purchases.value.filter((r) => (r.status as Status) === activeTab.value)
  if (activeTab.value !== STATUS.RETURN_REFUND) return base
  return base.filter((r) => rrStatus(r.id) === activeRR.value)
})

/** NEW: Grouped filtered for main view */
const groupedFiltered = computed<Group[]>(() => {
  let groups = buildGroups(purchases.value).filter((g) => g.status === activeTab.value)
  if (activeTab.value === STATUS.RETURN_REFUND) {
    groups = groups.filter((g) => g.rrBadge === activeRR.value)
  }
  return groups
})

/** Helpers */
const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}
const shortId = (s: string) => (s ? `${s.slice(0, 6)}…${s.slice(-4)}` : '—')

function tabLabel(value: string) {
  return tabs.find((t) => t.value === value)?.label ?? value
}

/** Status label class + pretty label */
function prettyStatus(s?: string) {
  const k = (s || '') as Status
  if (k === STATUS.TO_PAY) return 'To Pay'
  if (k === STATUS.TO_SHIP) return 'To Ship'
  if (k === STATUS.TO_RECEIVE) return 'To Receive'
  if (k === STATUS.COMPLETED) return 'Completed'
  if (k === STATUS.RETURN_REFUND) return 'Return/Refund'
  if (k === STATUS.CANCELLED) return 'Cancelled'
  return s || '—'
}
function statusClass(s?: string) {
  const k = (s || '') as Status
  if (k === STATUS.CANCELLED) return 'text-bg-danger-subtle border'
  if (k === STATUS.RETURN_REFUND) return 'text-bg-warning-subtle border'
  if (k === STATUS.COMPLETED) return 'text-bg-success-subtle border'
  if (k === STATUS.TO_SHIP || k === STATUS.TO_RECEIVE) return 'text-bg-info-subtle border'
  if (k === STATUS.TO_PAY) return 'text-bg-light border'
  return 'text-bg-light border'
}

/** Actions (kept) */
function goToShop() {
  router.push({ name: 'user.shop' })
}

/** Totals per group */
function groupTotal(g: Group): number {
  return g.items.reduce((sum, it) => {
    const q = Number(it.qty ?? 1)
    const pr = productPrice(it)
    return sum + q * pr
  }, 0)
}

/* ---------------- Return/Refund modal + submit ---------------- */
const showRR = ref(false)
const rrBusy = ref(false)
const rrPurchase = ref<AnyRec | null>(null)
const rrGroup = ref<Group | null>(null)

const rrForm = reactive<{
  purchase_ids: string[]
  purchase_id: string
  product_id: string
  reason: string
  details: string
  pickup_date: string
}>({
  purchase_ids: [],
  purchase_id: '',
  product_id: '',
  reason: '',
  details: '',
  pickup_date: '',
})

const rrReasons = [
  'Defective / Damaged',
  'Item Not as Described',
  'Wrong Item Received',
  'Missing Parts / Accessories',
  'Arrived Late',
  'Changed Mind',
]

/* Quick date options */
const RR_DATE_COL = 'return/refund date'
const todayYMD = new Date().toISOString().slice(0, 10)
function addDaysYMD(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
const quickDates = {
  tomorrow: addDaysYMD(1),
  plus2: addDaysYMD(2),
  plus3: addDaysYMD(3),
}
const rrQuickDate = ref<string>('') // select value
function applyQuickDate() {
  if (rrQuickDate.value) rrForm.pickup_date = rrQuickDate.value
}
function labelFor(ymd: string) {
  try {
    const d = new Date(ymd + 'T00:00:00')
    return d.toLocaleDateString()
  } catch {
    return ymd
  }
}

/** NEW: group modal open */
function openReturnRefundGroup(g: Group) {
  rrGroup.value = g
  rrPurchase.value = null
  rrForm.purchase_ids = []
  rrForm.purchase_id = ''
  rrForm.product_id = ''
  rrForm.reason = ''
  rrForm.details = ''
  rrForm.pickup_date = ''
  rrQuickDate.value = ''
  rrSelectAll.value = false
  showRR.value = true
}

/** (Kept) single-item RR open */
function openReturnRefund(purchase: AnyRec) {
  rrGroup.value = null
  rrPurchase.value = purchase
  rrForm.purchase_ids = []
  rrForm.purchase_id = purchase?.id || ''
  rrForm.product_id = purchase?.product_id || ''
  rrForm.reason = ''
  rrForm.details = ''
  rrForm.pickup_date = ''
  rrQuickDate.value = ''
  rrSelectAll.value = false
  showRR.value = true
}
function closeReturnRefund() {
  showRR.value = false
}

/** NEW: select all toggle in group modal */
const rrSelectAll = ref(false)
function toggleRRSelectAll() {
  if (!rrGroup.value) return
  if (rrSelectAll.value) {
    rrForm.purchase_ids = rrGroup.value.items.map((it) => it.id)
  } else {
    rrForm.purchase_ids = []
  }
}
function syncRRSelectAll() {
  if (!rrGroup.value) return
  rrSelectAll.value = rrForm.purchase_ids.length === rrGroup.value.items.length
}

/** Submit RR (supports group w/ multi-select and single) */
async function submitReturnRefund() {
  if (!rrForm.reason || !rrForm.pickup_date) return
  rrBusy.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth?.user?.id
    if (!uid) {
      alert('Please log in to submit a return/refund request.')
      return
    }

    // Build insert payload(s)
    const payloads: Record<string, any>[] = []
    const purchaseIdsToMark: string[] = []

    if (rrGroup.value) {
      // Group mode: use selected purchase_ids
      if (rrForm.purchase_ids.length === 0) {
        alert('Please select at least one item to return/refund.')
        return
      }
      for (const pid of rrForm.purchase_ids) {
        const row = rrGroup.value.items.find((x) => x.id === pid)
        if (!row) continue
        const p: Record<string, any> = {
          user_id: uid,
          purchase_id: pid,
          product_id: row.product_id,
          reason: rrForm.reason,
          details: rrForm.details || null,
          status: 'pending' as RRState,
        }
        p[RR_DATE_COL] = rrForm.pickup_date
        payloads.push(p)
        purchaseIdsToMark.push(pid)
      }
    } else if (rrPurchase.value) {
      // Single mode (kept)
      const basePayload: Record<string, any> = {
        user_id: uid,
        purchase_id: rrForm.purchase_id,
        product_id: rrForm.product_id,
        reason: rrForm.reason,
        details: rrForm.details || null,
        status: 'pending' as RRState,
      }
      basePayload[RR_DATE_COL] = rrForm.pickup_date
      payloads.push(basePayload)
      purchaseIdsToMark.push(rrForm.purchase_id)
    } else {
      return
    }

    // Insert rows (batch)
    const { error: insErr } = await supabase.schema('games').from('return_refunds').insert(payloads)

    if (insErr) {
      alert(insErr.message)
      return
    }

    // Move affected purchases to "return/refund"
    const { error: upErr } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.RETURN_REFUND })
      .in('id', purchaseIdsToMark)
      .eq('user_id', uid)

    if (upErr) {
      alert(upErr.message)
      return
    }

    // Local updates
    for (const row of purchases.value) {
      if (purchaseIdsToMark.includes(row.id)) {
        row.status = STATUS.RETURN_REFUND
        rrByPurchase[row.id] = { id: 'local', purchase_id: row.id, status: 'pending' }
      }
    }

    closeReturnRefund()
    alert('Return/Refund request submitted.')
  } finally {
    rrBusy.value = false
  }
}

/** --------- Original per-row actions (kept) --------- */
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
    const row = purchases.value.find((r) => r.id === purchaseId)
    if (row) row.status = STATUS.CANCELLED
  } finally {
    busy.value.cancel[purchaseId] = false
  }
}

async function orderReceived(purchaseId: string) {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth?.user?.id
  if (!uid) return
  busy.value.received[purchaseId] = true
  try {
    const { error } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.COMPLETED })
      .eq('id', purchaseId)
      .eq('user_id', uid)

    if (error) {
      alert(error.message)
      return
    }

    const row = purchases.value.find((r) => r.id === purchaseId)
    if (row) row.status = STATUS.COMPLETED
    alert('Thanks! Your order has been marked as received.')
  } finally {
    busy.value.received[purchaseId] = false
  }
}

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

    delete rrByPurchase[purchase.id]
    const row = purchases.value.find((r) => r.id === purchase.id)
    if (row) row.status = STATUS.COMPLETED
  } finally {
    busy.value.rrCancel[purchase.id] = false
  }
}

/** --------- NEW: Helper to create ONE order_receipt row for a group --------- */
// Assumes ewallet.order_receipt has columns: amount (not null), reference_number (text), purchase_id (uuid, nullable/exists).
async function createOrderReceiptForGroup(g: Group) {
  try {
    // pick any one purchase id from the group (first item)
    const onePurchaseId = g.items?.[0]?.id
    if (!onePurchaseId) return

    // compute total amount for the whole group
    const amount = groupTotal(g)

    // Insert exactly ONE receipt row for the entire group using the group's reference number
    const { error: recErr } = await supabase
      .schema('ewallet') // <-- adjust only if your table lives in a different schema
      .from('order_receipt')
      .insert([
        {
          amount, // numeric(12,2) not null
          reference_number: g.ref, // group's reference number
          purchase_id: onePurchaseId, // any one purchase id from the group
        },
      ])

    if (recErr) {
      // Non-blocking: show error but do not revert completion
      alert(`Order was completed, but creating receipt failed: ${recErr.message}`)
    }
  } catch (e) {
    console.error(e)
  }
}

/** --------- NEW: Group-level actions --------- */
async function cancelGroup(g: Group) {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth?.user?.id
  if (!uid) return
  groupBusy.cancel[g.ref] = true
  try {
    const ids = g.items.map((it) => it.id)
    const { error } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.CANCELLED })
      .in('id', ids)
      .eq('user_id', uid)

    if (error) {
      alert(error.message)
      return
    }
    for (const r of purchases.value) {
      if (ids.includes(r.id)) r.status = STATUS.CANCELLED
    }
  } finally {
    groupBusy.cancel[g.ref] = false
  }
}

async function orderReceivedGroup(g: Group) {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth?.user?.id
  if (!uid) return
  groupBusy.received[g.ref] = true
  try {
    const ids = g.items.map((it) => it.id)
    const { error } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.COMPLETED })
      .in('id', ids)
      .eq('user_id', uid)

    if (error) {
      alert(error.message)
      return
    }
    for (const r of purchases.value) {
      if (ids.includes(r.id)) r.status = STATUS.COMPLETED
    }

    // NEW: create a single order_receipt row for the whole group
    await createOrderReceiptForGroup(g)

    alert('Thanks! Your order has been marked as received.')
  } finally {
    groupBusy.received[g.ref] = false
  }
}

async function cancelReturnRefundGroup(g: Group) {
  // only pending RR should be cancellable
  if (g.status !== STATUS.RETURN_REFUND || g.rrBadge !== 'pending') {
    alert('No pending return/refund to cancel for this group.')
    return
  }
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth?.user?.id
  if (!uid) return
  groupBusy.rrCancel[g.ref] = true
  try {
    // Find all purchases in group that have a pending RR row
    const pendingIds = g.items.filter((it) => rrStatus(it.id) === 'pending').map((it) => it.id)

    if (pendingIds.length === 0) {
      alert('No pending return/refund found to cancel.')
      return
    }

    // Delete RR rows for these purchases
    const rrIdsToDelete = Object.values(rrByPurchase)
      .filter((rr) => pendingIds.includes(rr.purchase_id) && rr.status === 'pending')
      .map((rr) => rr.id)

    if (rrIdsToDelete.length > 0) {
      const { error: delErr } = await supabase
        .schema('games')
        .from('return_refunds')
        .delete()
        .in('id', rrIdsToDelete)
        .eq('user_id', uid)

      if (delErr) {
        alert(delErr.message)
        return
      }
    }

    // Revert those purchases to completed
    const { error: upErr } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.COMPLETED })
      .in('id', pendingIds)
      .eq('user_id', uid)

    if (upErr) {
      alert(upErr.message)
      return
    }

    // Local updates
    for (const pid of pendingIds) {
      delete rrByPurchase[pid]
      const row = purchases.value.find((r) => r.id === pid)
      if (row) row.status = STATUS.COMPLETED
    }
  } finally {
    groupBusy.rrCancel[g.ref] = false
  }
}

onMounted(() => {
  loadPurchases()
})
</script>

<style scoped>
/* Card & subtle bg */
.card {
  border: 1px solid #edf0f3;
}
.bg-light-subtle {
  background: #f8f9fa;
}

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
.text-monospace {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}

/* Purchase product thumb */
.purchase-thumb {
  width: 64px;
  min-width: 64px;
  border-radius: 10px;
  overflow: hidden;
}
.object-fit-cover {
  object-fit: cover;
}

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
