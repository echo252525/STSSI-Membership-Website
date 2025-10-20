<template>
  <div class="container py-4">
    <!-- ===== Tabs (New) ===== -->
    <ul class="nav nav-pills mb-3">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="activeTab === 'wallet' ? 'active' : ''"
          @click="activeTab = 'wallet'"
        >
          E-Wallet
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="activeTab === 'discount' ? 'active' : ''"
          @click="activeTab = 'discount'"
        >
          Discount Credits
        </button>
      </li>
    </ul>

    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h4 m-0">
        {{ activeTab === 'wallet' ? 'E-Wallet' : 'Discount Credits' }}
      </h1>
      <button
        v-if="activeTab === 'wallet'"
        class="btn btn-primary"
        @click="openTopUp"
      >
        <i class="bi bi-plus-circle"></i>
        <span class="ms-2">Top Up</span>
      </button>
      <!-- No top up button for Discount Credits -->
    </div>

    <!-- ===== WALLET VIEW ===== -->
    <template v-if="activeTab === 'wallet'">
      <!-- Balance Card -->
      <div class="card shadow-sm mb-4">
        <div class="card-body d-flex align-items-center justify-content-between">
          <div>
            <div class="text-muted small">Current Balance</div>
            <!-- 🔹 uses usersBalance if available; falls back to previous local balance -->
            <div class="fs-3 fw-semibold">₱ {{ formattedBalance }}</div>
          </div>
          <div class="text-end">
            <div class="text-muted small">Last Updated (Disbursed)</div>
            <!-- 🔹 now shows the latest updated_at among disbursed rows -->
            <div class="fw-medium">{{ lastDisbursedText }}</div>
          </div>
        </div>
      </div>

      <!-- Transactions -->
      <div class="card shadow-sm">
        <div class="card-header bg-white d-flex align-items-center justify-content-between">
          <strong>Recent Transactions</strong>

          <!-- 🔹 Filter controls -->
          <div class="btn-group btn-group-sm" role="group" aria-label="Filter by status">
            <button
              type="button"
              class="btn"
              :class="filter === 'all' ? 'btn-primary' : 'btn-outline-primary'"
              @click="setFilter('all')"
              aria-label="Show all transactions"
            >
              All
            </button>
            <button
              type="button"
              class="btn"
              :class="filter === 'pending' ? 'btn-warning text-dark border-warning' : 'btn-outline-warning'"
              @click="setFilter('pending')"
              aria-label="Show pending"
            >
              Pending
            </button>
            <button
              type="button"
              class="btn"
              :class="filter === 'disbursed' ? 'btn-success' : 'btn-outline-success'"
              @click="setFilter('disbursed')"
              aria-label="Show disbursed"
            >
              Disbursed
            </button>
            <button
              type="button"
              class="btn"
              :class="filter === 'rejected' ? 'btn-danger' : 'btn-outline-danger'"
              @click="setFilter('rejected')"
              aria-label="Show rejected"
            >
              Rejected
            </button>
          </div>
        </div>

        <div class="card-body p-0">
          <div v-if="transactions.length === 0" class="p-4 text-center text-muted">
            No transactions yet.
          </div>

          <ul v-else class="list-group list-group-flush">
            <li
              v-for="tx in filteredTransactions"
              :key="tx.id"
              class="list-group-item d-flex align-items-center justify-content-between tx-row"
              role="button"
              tabindex="0"
              :aria-label="`Open details for Ref ${tx.reference_number}`"
              @click="openTxDetails(tx)"
              @keydown.enter.prevent="openTxDetails(tx)"
              @keydown.space.prevent="openTxDetails(tx)"
            >
              <div class="d-flex align-items-center gap-3">
                <div>
                  <div class="fw-medium d-flex align-items-center gap-2">
                    <!-- 🔹 status icon to the left of label -->
                    <i :class="statusIconClass(tx)" aria-hidden="true"></i>

                    <span>Top Up – {{ prettyBank(tx.bank_name) }}</span>
                    <span
                      class="badge"
                      :class="tx.status === 'pending'
                        ? 'text-bg-warning'
                        : tx.status === 'disbursed'
                          ? 'text-bg-success'
                          : 'text-bg-danger'"
                    >
                      {{ capitalize(tx.status) }}
                    </span>

                    <!-- 🔹 Icon-only action (edit ref) for rejected -->
                    <button
                      v-if="tx.status === 'rejected'"
                      type="button"
                      class="icon-btn"
                      @click.stop="openEditRef(tx)"
                      :title="`Edit reference number for ${tx.reference_number}`"
                      aria-label="Edit reference number"
                    >
                      <i class="bi bi-pencil-square"></i>
                    </button>
                  </div>

                  <!-- 🔹 Ref + created time -->
                  <div class="text-muted small d-flex align-items-center gap-2">
                    <span>
                      Ref: <span class="font-monospace">{{ tx.reference_number }}</span> •
                      {{ formatDate(tx.created_at) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 🔹 Amount display depends on status (NO icon here) -->
              <div
                class="fw-semibold d-flex align-items-center gap-2"
                :class="amountStyle(tx).cls"
                :title="amountStyle(tx).title"
              >
                <span>{{ amountStyle(tx).text }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <!-- ===== DISCOUNT CREDITS VIEW ===== -->
    <template v-else>
      <!-- Balance Card for Discount Credits -->
      <div class="card shadow-sm mb-4">
        <div class="card-body d-flex align-items-center justify-content-between">
          <div>
            <div class="text-muted small">Current Discount Credits</div>
            <div class="fs-3 fw-semibold">₱ {{ formattedDiscountCredits }}</div>
          </div>
          <div class="text-end">
            <div class="text-muted small">Last Updated</div>
            <div class="fw-medium">{{ lastUpdatedText }}</div>
          </div>
        </div>
      </div>

      <!-- Helper card -->
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex align-items-start gap-3">
            <i class="bi bi-info-circle fs-4"></i>
            <div>
              <div class="fw-semibold mb-1">How Discount Credits Work</div>
              <p class="mb-0 text-muted">
                These credits are part of your membership benefits and can be applied to eligible purchases
                at checkout. Your available balance updates automatically when you earn or use credits.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ Discount Credits Activity (rows from ewallet.discount_credits_receipt) -->
      <div class="card shadow-sm mt-4">
        <div class="card-header bg-white d-flex align-items-center justify-content-between">
          <strong>Discount Credits Activity</strong>
          <button class="btn btn-outline-secondary btn-sm" :disabled="busyDcr" @click="loadMyDiscountReceipts">
            <span v-if="busyDcr" class="spinner-border spinner-border-sm me-2"></span>
            Refresh
          </button>
        </div>
        <div class="card-body p-0">
          <div v-if="dcrError" class="alert alert-danger m-3">{{ dcrError }}</div>

          <div v-else-if="busyDcr" class="p-4 text-center text-muted">
            <div class="spinner-border mb-2"></div>
            <div>Loading discount credits…</div>
          </div>

          <div v-else-if="dcrList.length === 0" class="p-4 text-center text-muted">
            No discount credits yet.
          </div>

          <ul v-else class="list-group list-group-flush">
            <li
              v-for="row in dcrList"
              :key="row.id"
              class="list-group-item d-flex align-items-center justify-content-between tx-row"
              role="button"
              tabindex="0"
              :aria-label="`Open details for Discount Credits Ref ${row.reference_number}`"
              @click="openDcrDetails(row)"
              @keydown.enter.prevent="openDcrDetails(row)"
              @keydown.space.prevent="openDcrDetails(row)"
            >
              <div>
                <div class="fw-medium d-flex align-items-center gap-2">
                  <i class="bi bi-ticket-perforated text-primary" aria-hidden="true"></i>
                  <span>Discount Applied</span>
                  <span class="badge text-bg-secondary">Receipt</span>
                </div>
                <div class="text-muted small">
                  Ref: <span class="font-monospace">{{ row.reference_number }}</span> •
                  {{ formatDate(row.created_at) }}
                </div>
              </div>

              <div
                class="fw-semibold text-danger"
                :title="`Applied to purchase ${row.purchase_id}`"
              >
                –₱ {{ formatAmount(row.amount_discounted) }}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- /Discount Credits Activity -->
    </template>

    <!-- Top Up Modal -->
    <div
      class="modal fade"
      id="topUpModal"
      tabindex="-1"
      aria-labelledby="topUpLabel"
      aria-hidden="true"
      ref="topUpModalEl"
      data-bs-backdrop="true"
      data-bs-keyboard="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form @submit.prevent="confirmTopUp">
            <div class="modal-header">
              <h5 class="modal-title" id="topUpLabel">Top Up Wallet</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                ref="closeBtn"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Bank / Wallet</label>
                <select v-model="topUpBank" class="form-select" required>
                  <option value="gcash">GCash</option>
                  <option value="maya">Maya</option>
                  <option value="gotyme">GoTyme</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Amount (PHP)</label>
                <input
                  v-model.number="topUpAmount"
                  type="number"
                  min="200"
                  step="1"
                  class="form-control"
                  placeholder="Minimum is 200"
                  required
                />
              </div>

              <div class="mb-1">
                <label class="form-label">Reference Number</label>
                <input
                  v-model.trim="topUpRef"
                  type="text"
                  class="form-control font-monospace"
                  placeholder="e.g. TXN-20250926-0001"
                  required
                />
              </div>

              <div class="form-text mt-2">
                Your top-up will be saved as <strong>pending</strong>. Admins can mark it as
                disbursed after verification.
              </div>
              <div v-if="errorMsg" class="alert alert-danger mt-3 py-2 mb-0">
                {{ errorMsg }}
              </div>
              <div v-if="okMsg" class="alert alert-success mt-3 py-2 mb-0">
                {{ okMsg }}
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span
                  v-if="submitting"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                <i v-else class="bi bi-check2-circle me-1"></i>
                Confirm Top Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 🔹 Edit Reference Modal (for rejected transactions) -->
    <div
      class="modal fade"
      id="editRefModal"
      tabindex="-1"
      aria-labelledby="editRefLabel"
      aria-hidden="true"
      ref="editRefModalEl"
      data-bs-backdrop="true"
      data-bs-keyboard="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form @submit.prevent="confirmEditRef">
            <div class="modal-header">
              <h5 class="modal-title" id="editRefLabel">Edit Reference Number</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Reference Number</label>
                <input
                  v-model.trim="editRef"
                  type="text"
                  class="form-control font-monospace"
                  :placeholder="currentEdit?.reference_number || 'Enter new reference number'"
                  required
                />
                <div class="form-text">
                  Only the reference number can be changed. Submitting will set status to
                  <strong>pending</strong> again for re-verification.
                </div>
              </div>

              <div v-if="editErrorMsg" class="alert alert-danger py-2 mb-0">
                {{ editErrorMsg }}
              </div>
              <div v-if="editOkMsg" class="alert alert-success py-2 mb-0">
                {{ editOkMsg }}
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="editSubmitting">
                <span
                  v-if="editSubmitting"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                <i v-else class="bi bi-arrow-clockwise me-1"></i>
                Save & Re-submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- /Edit Reference Modal -->

    <!-- ✅ Transaction Details Modal (click any row to open) -->
    <div
      class="modal fade"
      id="txDetailsModal"
      tabindex="-1"
      aria-labelledby="txDetailsLabel"
      aria-hidden="true"
      ref="txDetailsModalEl"
      data-bs-backdrop="true"
      data-bs-keyboard="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" v-if="selectedTx">
          <div class="modal-header">
            <h5 class="modal-title d-flex align-items-center gap-2" id="txDetailsLabel">
              <i :class="statusIconClass(selectedTx)" aria-hidden="true"></i>
              Transaction Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <dl class="row mb-0">
              <dt class="col-sm-4">Reference</dt>
              <dd class="col-sm-8 font-monospace d-flex align-items-center gap-2">
                {{ selectedTx.reference_number }}
                <button class="btn btn-sm btn-outline-secondary" @click="copyRef">
                  <i class="bi bi-clipboard"></i> Copy
                </button>
              </dd>

              <dt class="col-sm-4">Status</dt>
              <dd class="col-sm-8">
                <span
                  class="badge"
                  :class="selectedTx.status === 'pending'
                    ? 'text-bg-warning'
                    : selectedTx.status === 'disbursed'
                      ? 'text-bg-success'
                      : 'text-bg-danger'"
                >
                  {{ capitalize(selectedTx.status) }}
                </span>
              </dd>

              <dt class="col-sm-4">Bank / Wallet</dt>
              <dd class="col-sm-8">{{ prettyBank(selectedTx.bank_name) }}</dd>

              <dt class="col-sm-4">Amount</dt>
              <dd class="col-sm-8 fw-semibold" :class="amountStyle(selectedTx).cls">
                {{ amountStyle(selectedTx).text }}
              </dd>

              <dt class="col-sm-4">Created</dt>
              <dd class="col-sm-8">{{ formatDate(selectedTx.created_at) }}</dd>

              <dt class="col-sm-4">Last Update</dt>
              <dd class="col-sm-8">{{ formatDate(selectedTx.updated_at) }}</dd>
            </dl>
          </div>

          <div class="modal-footer">
            <!-- Show Edit Ref button if rejected -->
            <button
              v-if="selectedTx.status === 'rejected'"
              type="button"
              class="btn btn-warning text-dark"
              @click="() => { openEditRef(selectedTx!); }"
            >
              <i class="bi bi-pencil-square me-1"></i>
              Edit Reference
            </button>
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <!-- /Transaction Details Modal -->

    <!-- ✅ NEW: Discount Credits Receipt Details Modal -->
    <div
      class="modal fade"
      id="dcrDetailsModal"
      tabindex="-1"
      aria-labelledby="dcrDetailsLabel"
      aria-hidden="true"
      ref="dcrDetailsModalEl"
      data-bs-backdrop="true"
      data-bs-keyboard="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" v-if="selectedDcr">
          <div class="modal-header">
            <h5 class="modal-title d-flex align-items-center gap-2" id="dcrDetailsLabel">
              <i class="bi bi-ticket-perforated text-primary" aria-hidden="true"></i>
              Discount Credits Receipt
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <dl class="row mb-0">
              <dt class="col-sm-4">Reference</dt>
              <dd class="col-sm-8 font-monospace d-flex align-items-center gap-2">
                {{ selectedDcr.reference_number }}
                <button class="btn btn-sm btn-outline-secondary" @click="copyDcrRef">
                  <i class="bi bi-clipboard"></i> Copy
                </button>
              </dd>

              <dt class="col-sm-4">Amount Applied</dt>
              <dd class="col-sm-8 fw-semibold text-danger">
                –₱ {{ formatAmount(selectedDcr.amount_discounted) }}
              </dd>

              <dt class="col-sm-4">Purchase ID</dt>
              <dd class="col-sm-8 font-monospace">{{ selectedDcr.purchase_id }}</dd>

              <dt class="col-sm-4">Created</dt>
              <dd class="col-sm-8">{{ formatDate(selectedDcr.created_at) }}</dd>

              <dt class="col-sm-4">Last Update</dt>
              <dd class="col-sm-8">{{ formatDate(selectedDcr.updated_at) }}</dd>
            </dl>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <!-- /Discount Credits Receipt Details Modal -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useRoute } from 'vue-router' // 🔗 URL ref: import useRoute
import { currentUser } from '@/lib/authState'

const router = useRouter()
const route = useRoute() // 🔗 URL ref: current route
const user = computed(() => currentUser.value)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return router.push({ name: 'login' })
  }
})

type BankName = 'gcash' | 'maya' | 'gotyme'
type Status = 'pending' | 'disbursed' | 'rejected'
type Tx = {
  id: number
  reference_number: string
  user_id: string
  amount: number
  created_at: string
  updated_at: string
  status: Status
  bank_name: BankName
}

/** ✅ Discount Credits Receipt type */
type Dcr = {
  id: string
  created_at: string
  updated_at: string
  purchase_id: string
  amount_discounted: number
  reference_number: string
}

// ===== New: Tab State =====
const activeTab = ref<'wallet' | 'discount'>('wallet')

// State
const balance = ref<number>(0)
const usersBalance = ref<number | null>(null)
const lastUpdated = ref<Date | null>(null)
const transactions = ref<Tx[]>([])
const currentUserId = ref<string | null>(null)

// New: Discount Credits Balance
const discountCredits = ref<number>(0)

/** ✅ NEW: Discount Credits Receipts list + flags */
const dcrList = ref<Dcr[]>([])
const busyDcr = ref(false)
const dcrError = ref<string>('')

/** Track latest disbursed update time */
const lastDisbursedAt = ref<Date | null>(null)

// Filter state
const filter = ref<'all' | Status>('all')
const setFilter = (f: 'all' | Status) => { filter.value = f }
const filteredTransactions = computed(() => {
  if (filter.value === 'all') return transactions.value
  return transactions.value.filter(t => t.status === filter.value)
})

// Modal state (Top Up)
const topUpAmount = ref<number | null>(null)
const topUpBank = ref<BankName>('gcash')
const topUpRef = ref<string>('')
const topUpModalEl = ref<HTMLDivElement | null>(null)
let bsModal: any = null
let usersChannel: ReturnType<typeof supabase.channel> | null = null
let txChannel: ReturnType<typeof supabase.channel> | null = null

const submitting = ref(false)
const errorMsg = ref<string>('')
const okMsg = ref<string>('')

// Edit Ref state
const editRefModalEl = ref<HTMLDivElement | null>(null)
let bsEditModal: any = null
const currentEdit = ref<Tx | null>(null)
const editRef = ref<string>('')
const editSubmitting = ref(false)
const editErrorMsg = ref<string>('')
const editOkMsg = ref<string>('')

// ✅ Transaction Details modal state
const txDetailsModalEl = ref<HTMLDivElement | null>(null)
let bsTxModal: any = null
const selectedTx = ref<Tx | null>(null)
const copyOk = ref(false)

// ✅ NEW: DCR Details modal state
const dcrDetailsModalEl = ref<HTMLDivElement | null>(null)
let bsDcrModal: any = null
const selectedDcr = ref<Dcr | null>(null)
const copyDcrOk = ref(false)

// 🔹 Shared date-time options (no seconds)
const dtOpts: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}

// Formatters
const formatAmount = (n: number) =>
  n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formattedBalance = computed(() => {
  const val = usersBalance.value ?? balance.value
  return formatAmount(val)
})
const formattedDiscountCredits = computed(() => formatAmount(discountCredits.value))
const lastUpdatedText = computed(() =>
  lastUpdated.value ? lastUpdated.value.toLocaleString(undefined, dtOpts) : '—',
)
const lastDisbursedText = computed(() =>
  lastDisbursedAt.value ? lastDisbursedAt.value.toLocaleString(undefined, dtOpts) : '—',
)
const formatDate = (iso: string) => new Date(iso).toLocaleString(undefined, dtOpts)
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const prettyBank = (b: BankName) => (b === 'gcash' ? 'GCash' : b === 'maya' ? 'Maya' : 'GoTyme')

// 🔹 Amount style helper based on status (icons removed for amount)
const amountStyle = (tx: Tx) => {
  const amt = `₱ ${formatAmount(Math.abs(tx.amount))}`
  if (tx.status === 'disbursed') {
    return {
      text: `+${amt}`,
      cls: 'text-success',
      icon: null,
      title: 'Disbursed'
    }
  }
  if (tx.status === 'pending') {
    return {
      text: `(${amt})`,
      cls: 'text-secondary',
      icon: null,
      title: 'Pending verification'
    }
  }
  // rejected
  return {
    text: `–${amt}`,
    cls: 'text-danger',
    icon: null,
    title: 'Rejected'
  }
}

// 🔹 status icon class for the label row (left of "Top Up – …")
const statusIconClass = (tx: Tx) => {
  if (tx.status === 'disbursed') return 'bi bi-check-circle text-success'
  if (tx.status === 'pending') return 'bi bi-hourglass-split text-warning'
  return 'bi bi-x-circle text-danger'
}

// 🔹 Helpers to avoid duplicates in the list
const findTxIndex = (id: number) => transactions.value.findIndex(t => t.id === id)
const addTxIfMissingToTop = (tx: Tx) => {
  if (findTxIndex(tx.id) === -1) {
    transactions.value.unshift(tx)
  }
}
const removeTxIfPresent = (id: number) => {
  const idx = findTxIndex(id)
  if (idx !== -1) transactions.value.splice(idx, 1)
}

// 🔹 Local balance fallback recompute
const recalcLocalBalance = () => {
  balance.value = transactions.value.reduce((s, t) => s + (t.amount || 0), 0)
}

// Recompute latest disbursed updated_at
const recomputeLastDisbursed = () => {
  const disbursed = transactions.value.filter(t => t.status === 'disbursed')
  if (disbursed.length === 0) {
    lastDisbursedAt.value = null
    return
  }
  const maxIso = disbursed
    .map(t => t.updated_at)
    .reduce((max, cur) => (new Date(cur).getTime() > new Date(max).getTime() ? cur : max))
  lastDisbursedAt.value = new Date(maxIso)
}

// 🔹 Friendly duplicate-ref detector
const isDuplicateRefError = (err: any) => {
  const msg = (err?.message || '').toLowerCase()
  const code = err?.code || err?.details || ''
  return (
    code === '23505' || // Postgres unique_violation
    msg.includes('duplicate key') ||
    msg.includes('unique constraint') ||
    (msg.includes('unique') && msg.includes('reference')) ||
    msg.includes('reference_number')
  )
}

// Open Top Up
const openTopUp = () => {
  errorMsg.value = ''
  okMsg.value = ''
  const w = window as any
  if (w?.bootstrap && topUpModalEl.value) {
    // ensure backdrop dim
    bsModal = w.bootstrap.Modal.getOrCreateInstance(topUpModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    bsModal.show()
  } else {
    const vAmt = window.prompt('Enter top-up amount (PHP):', '') // 🔹 no default
    const vRef = vAmt ? window.prompt('Enter reference number:') : null
    const vBank = vRef
      ? window.prompt("Enter bank name ('gcash'|'maya'|'gotyme'):", topUpBank.value)
      : null
    if (vAmt && vRef && vBank) {
      const amt = Number(vAmt)
      const bank = vBank.toLowerCase() as BankName
      if (!isNaN(amt) && amt > 0 && ['gcash', 'maya', 'gotyme'].includes(bank)) {
        confirmTopUpFallback(amt, vRef.trim(), bank)
      } else {
        alert('Invalid inputs.')
      }
    }
  }
}

const confirmTopUpFallback = async (amount: number, refno: string, bank: BankName) => {
  topUpAmount.value = amount
  topUpRef.value = refno
  topUpBank.value = bank
  await confirmTopUp()
}

// Insert top-up
const confirmTopUp = async () => {
  errorMsg.value = ''
  okMsg.value = ''
  // 🔹 Enforce minimum top up (and ensure value exists)
  if (!topUpAmount.value || topUpAmount.value < 200) {
    errorMsg.value = 'Minimum top-up is ₱200.'
    return
  }
  if (!topUpRef.value) {
    errorMsg.value = 'Reference number is required.'
    return
  }
  if (!['gcash', 'maya', 'gotyme'].includes(topUpBank.value)) {
    errorMsg.value = 'Bank name must be GCash, Maya, or GoTyme.'
    return
  }

  submitting.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) {
      errorMsg.value = 'Not authenticated.'
      return
    }

    const insertPayload = {
      reference_number: topUpRef.value,
      user_id: user.id,
      amount: topUpAmount.value,
      bank_name: topUpBank.value,
    }

    const { data, error } = await supabase
      .schema('ewallet')
      .from('transactions')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error) {
      // 🔹 Show friendly message for duplicate reference number
      if (isDuplicateRefError(error)) {
        errorMsg.value = 'That reference number is already used. Please enter a different one.'
      } else {
        errorMsg.value = 'We couldn’t save your top-up. Please try again.'
      }
      return
    }

    if (data) {
      const tx = data as Tx
      // 🔹 Avoid duplicate row if realtime INSERT also fires:
      addTxIfMissingToTop(tx)
      lastUpdated.value = new Date()
      okMsg.value = 'Top-up recorded successfully (pending).'
      topUpAmount.value = null // 🔹 clear to remove any default value
      topUpRef.value = ''
      if (bsModal) bsModal.hide()
      // Keep UI derived values fresh
      recalcLocalBalance()
      recomputeLastDisbursed()
    }
  } catch (e: any) {
    if (isDuplicateRefError(e)) {
      errorMsg.value = 'That reference number is already used. Please enter a different one.'
    } else {
      errorMsg.value = 'Something went wrong. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}

// Open edit modal
const openEditRef = (tx: Tx) => {
  if (tx.status !== 'rejected') return
  currentEdit.value = tx
  editRef.value = tx.reference_number || ''
  editErrorMsg.value = ''
  editOkMsg.value = ''
  const w = window as any
  if (w?.bootstrap && editRefModalEl.value) {
    bsEditModal = w.bootstrap.Modal.getOrCreateInstance(editRefModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    bsEditModal.show()
  } else {
    const newRef = window.prompt('Enter new reference number:', editRef.value)
    if (newRef !== null) {
      editRef.value = newRef.trim()
      confirmEditRef()
    }
  }
}

// Save edit -> set to pending
const confirmEditRef = async () => {
  editErrorMsg.value = ''
  editOkMsg.value = ''

  const row = currentEdit.value
  if (!row) {
    editErrorMsg.value = 'No transaction selected.'
    return
  }
  if (!editRef.value) {
    editErrorMsg.value = 'Reference number is required.'
    return
  }

  editSubmitting.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) {
      editErrorMsg.value = 'Not authenticated.'
      return
    }

    const { data, error } = await supabase
      .schema('ewallet')
      .from('transactions')
      .update({
        reference_number: editRef.value,
        status: 'pending' as Status,
      })
      .eq('id', row.id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      if (isDuplicateRefError(error)) {
        editErrorMsg.value = 'That reference number is already used. Please enter a different one.'
      } else {
        editErrorMsg.value = 'We couldn’t update this reference number. Please try again.'
      }
      return
    }

    if (data) {
      const updated = data as Tx
      const i = transactions.value.findIndex(t => t.id === updated.id)
      if (i !== -1) transactions.value[i] = updated
      lastUpdated.value = new Date()
      editOkMsg.value = 'Reference updated. Status set to pending.'
      // 🔗 URL ref: if the details modal is on this tx, refresh URL ref to new value
      if (selectedTx.value && selectedTx.value.id === updated.id) {
        selectedTx.value = updated
        setRefInUrl(updated.reference_number)
      }
      setTimeout(() => {
        if (bsEditModal) bsEditModal.hide()
      }, 250)
      recalcLocalBalance()
      recomputeLastDisbursed()
    }
  } catch (e: any) {
    if (isDuplicateRefError(e)) {
      editErrorMsg.value = 'That reference number is already used. Please enter a different one.'
    } else {
      editErrorMsg.value = 'Something went wrong. Please try again.'
    }
  } finally {
    editSubmitting.value = false
  }
}

// Load balance from public.users
const loadMyUsersBalance = async () => {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return
  currentUserId.value = user.id

  const { data, error } = await supabase
    .from('users')
    .select('balance, discount_credits')
    .eq('id', user.id)
    .single()

  if (!error && data) {
    usersBalance.value = Number((data as any).balance ?? 0)
    discountCredits.value = Number((data as any).discount_credits ?? 0)
  }
}

// Load existing rows
const loadMyTransactions = async () => {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return

  const { data, error } = await supabase
    .schema('ewallet')
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!error && data) {
    transactions.value = data as Tx[]
    recalcLocalBalance()
    lastUpdated.value = transactions.value[0] ? new Date(transactions.value[0].created_at) : null
    recomputeLastDisbursed()
  }
}

/** ✅ Load discount credits receipts */
const loadMyDiscountReceipts = async () => {
  dcrError.value = ''
  busyDcr.value = true
  try {
    // RLS should scope to current user's receipts via your policies
    const { data, error } = await supabase
      .schema('ewallet')
      .from('discount_credits_receipt')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    dcrList.value = (data || []).map((r: any) => ({
      ...r,
      amount_discounted: Number(r.amount_discounted ?? 0),
    })) as Dcr[]
    if (dcrList.value.length > 0) {
      // reflect freshness on the Discount Credits tab's "Last Updated"
      lastUpdated.value = new Date(dcrList.value[0].created_at)
    }
  } catch (e) {
    dcrError.value = 'Could not load discount credit receipts.'
  } finally {
    busyDcr.value = false
  }
}

// Realtime subs
const subscribeUsersBalance = async () => {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return

  usersChannel = supabase
    .channel('users-balance-self')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
      (payload) => {
        const newBal = (payload.new as any)?.balance
        if (typeof newBal === 'number') usersBalance.value = newBal
        const newCredits = (payload.new as any)?.discount_credits
        if (typeof newCredits === 'number') discountCredits.value = newCredits
        lastUpdated.value = new Date()
      }
    )
    .subscribe()
}

const subscribeMyTransactions = async () => {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return

  txChannel = supabase
    .channel('my-transactions')
    // 🔹 Listen to ALL changes (INSERT, UPDATE, DELETE) on my rows
    .on(
      'postgres_changes',
      { event: '*', schema: 'ewallet', table: 'transactions', filter: `user_id=eq.${user.id}` },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          addTxIfMissingToTop(payload.new as Tx)
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Tx
          const i = transactions.value.findIndex(t => t.id === updated.id)
          if (i !== -1) transactions.value[i] = updated
          // 🔗 URL ref: keep modal selection fresh if it's the same tx
          if (selectedTx.value && selectedTx.value.id === updated.id) {
            selectedTx.value = updated
          }
        } else if (payload.eventType === 'DELETE') {
          const removed = payload.old as Tx
          removeTxIfPresent(removed.id)
          // 🔗 URL ref: if we were viewing this, clear ref
          if (selectedTx.value && selectedTx.value.id === removed.id) {
            selectedTx.value = null
            setRefInUrl(null)
          }
        }
        // Keep derived UI bits fresh on *every* change
        lastUpdated.value = new Date()
        recalcLocalBalance()
        recomputeLastDisbursed()
      }
    )
    .subscribe()
}

/* ========= Details: open/close (with dim backdrop) ========= */

// 🔗 URL ref: helper to set/clear ?ref= in the URL (no history spam)
const setRefInUrl = (refno: string | null) => {
  const q: Record<string, any> = { ...route.query }
  if (refno) q.ref = refno
  else delete q.ref
  router.replace({ query: q })
}

const openTxDetails = (tx: Tx) => {
  selectedTx.value = tx
  selectedDcr.value = null // ensure only one modal type is active
  setRefInUrl(tx.reference_number) // 🔗 URL ref
  const w = window as any
  if (w?.bootstrap && txDetailsModalEl.value) {
    bsTxModal = w.bootstrap.Modal.getOrCreateInstance(txDetailsModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    bsTxModal.show()
  }
}

const closeTxDetails = () => {
  setRefInUrl(null)
  if (bsTxModal) bsTxModal.hide()
}

const copyRef = async () => {
  if (!selectedTx.value) return
  try {
    await navigator.clipboard.writeText(selectedTx.value.reference_number)
    copyOk.value = true
    setTimeout(() => (copyOk.value = false), 1200)
  } catch {}
}

// ✅ NEW: DCR open/close/copy
const openDcrDetails = (row: Dcr) => {
  selectedDcr.value = row
  selectedTx.value = null // ensure only one modal type is active
  setRefInUrl(row.reference_number)
  const w = window as any
  if (w?.bootstrap && dcrDetailsModalEl.value) {
    bsDcrModal = w.bootstrap.Modal.getOrCreateInstance(dcrDetailsModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    bsDcrModal.show()
  }
}

const closeDcrDetails = () => {
  setRefInUrl(null)
  if (bsDcrModal) bsDcrModal.hide()
}

const copyDcrRef = async () => {
  if (!selectedDcr.value) return
  try {
    await navigator.clipboard.writeText(selectedDcr.value.reference_number)
    copyDcrOk.value = true
    setTimeout(() => (copyDcrOk.value = false), 1200)
  } catch {}
}

// 🔗 URL ref: try open by reference number (will check TX first, then DCR)
const openByRef = (refStr: string) => {
  if (!refStr) return
  const tx = transactions.value.find(t => t.reference_number === refStr)
  if (tx) {
    // open transaction modal
    openTxDetails(tx)
    return
  }
  const dcr = dcrList.value.find(r => r.reference_number === refStr)
  if (dcr) openDcrDetails(dcr)
}

onMounted(async () => {
  const w = window as any
  if (w?.bootstrap && topUpModalEl.value) {
    bsModal = w.bootstrap.Modal.getOrCreateInstance(topUpModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
  }
  if (w?.bootstrap && editRefModalEl.value) {
    bsEditModal = w.bootstrap.Modal.getOrCreateInstance(editRefModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
  }
  if (w?.bootstrap && txDetailsModalEl.value) {
    bsTxModal = w.bootstrap.Modal.getOrCreateInstance(txDetailsModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    txDetailsModalEl.value.addEventListener('hidden.bs.modal', () => {
      selectedTx.value = null
      setRefInUrl(null)
    })
  }
  if (w?.bootstrap && dcrDetailsModalEl.value) {
    bsDcrModal = w.bootstrap.Modal.getOrCreateInstance(dcrDetailsModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    dcrDetailsModalEl.value.addEventListener('hidden.bs.modal', () => {
      selectedDcr.value = null
      setRefInUrl(null)
    })
  }

  await Promise.all([
    loadMyUsersBalance(),
    loadMyTransactions(),
    loadMyDiscountReceipts(), // ✅ ensure DCRs are available for deep link
  ])
  await subscribeUsersBalance()
  await subscribeMyTransactions()

  // 🔗 URL ref: if arriving with ?ref=..., open it (TX first, else DCR)
  const initialRef = (route.query?.ref ?? '') as string
  if (initialRef) {
    setTimeout(() => openByRef(initialRef), 0)
  }
})

// 🔗 URL ref: if query changes, reflect it (prefer TX, else DCR)
watch(
  () => route.query.ref,
  (newRef) => {
    const nextRef = (newRef ?? '') as string
    if (!nextRef) return
    // If already showing that exact ref in any modal, ignore
    if (selectedTx.value?.reference_number === nextRef) return
    if (selectedDcr.value?.reference_number === nextRef) return
    openByRef(nextRef)
  }
)

onBeforeUnmount(() => {
  if (usersChannel) supabase.removeChannel(usersChannel)
  if (txChannel) supabase.removeChannel(txChannel)
})
</script>

<style scoped>
.container {
  max-width: 880px;
}
.card {
  border-radius: 14px;
}
.list-group-item {
  padding: 0.8rem 1rem;
}
.font-monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
}

/* 🔹 Minimalist icon-only button */
.icon-btn {
  border: 1px solid var(--line, #e7edf3);
  background: #fff;
  border-radius: 10px;
  padding: 4px 8px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.06);
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.icon-btn i {
  font-size: 0.95rem;
}
.icon-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.10);
  border-color: #d5dde6;
}

/* ✅ Make rows feel clickable (used for both TX and DCR lists) */
.tx-row { cursor: pointer; }
.tx-row:hover { background: rgba(0,0,0,.02); }
</style>

<!-- 🔸 Global (non-scoped) CSS to guarantee a dim backdrop -->
<style>
/* Make sure the Bootstrap modal backdrop actually dims the page */
.modal-backdrop { background-color: #000; }
.modal-backdrop.show { opacity: 0.5; } /* tweak intensity as you like (0.3–0.7) */
</style>
