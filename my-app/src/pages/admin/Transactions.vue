<template>
  <div class="container py-4">
    <!-- Page Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h4 m-0">Transactions</h1>

      <div class="d-flex align-items-center gap-3">
        

        <div class="btn-group" role="group" aria-label="Filter by status">
          <button
            type="button"
            class="btn"
            :class="filter === 'all' ? 'btn-primary' : 'btn-outline-primary'"
            @click="setFilter('all')"
          >
            All
          </button>
          <button
            type="button"
            class="btn"
            :class="filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'"
            @click="setFilter('pending')"
          >
            Pending
          </button>
          <button
            type="button"
            class="btn"
            :class="filter === 'disbursed' ? 'btn-success' : 'btn-outline-success'"
            @click="setFilter('disbursed')"
          >
            Disbursed
          </button>
        </div>
      </div>
    </div>

    <!-- Summary pills -->
    <div class="d-flex flex-wrap gap-2 mb-3">
      <span class="badge text-bg-secondary">
        Total: {{ filtered.length }}
      </span>
      <span class="badge text-bg-warning">
        Pending: {{ pendingCount }}
      </span>
      <span class="badge text-bg-success">
        Disbursed: {{ disbursedCount }}
      </span>
    </div>

    <!-- Table -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div v-if="filtered.length === 0" class="p-4 text-center text-muted">
          No transactions found for this filter.
        </div>

        <div v-else class="table-responsive">
          <table class="table align-middle mb-0 table-center-equal">
            <thead class="table-light">
              <tr>
                <th style="min-width: 180px;">User</th>
                <th style="min-width: 160px;">Reference #</th>
                <th class="text-end" style="min-width: 120px;">Amount</th>
                <th style="min-width: 130px;">Status</th>
                <th style="min-width: 150px;">Date</th>
                <th style="min-width: 110px;">Time</th>
                <th class="text-end" style="min-width: 120px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in filtered" :key="tx.id">
                <td>
                  <div class="fw-semibold text-truncate">{{ tx.user_name }}</div>
                  <div class="text-muted small text-truncate">{{ tx.user_email }}</div>
                </td>
                <td class="font-monospace">{{ tx.reference_number }}</td>
                <td class="text-end">₱ {{ formatAmount(tx.amount) }}</td>
                <td>
                  <span
                    class="badge"
                    :class="tx.status === 'pending' ? 'text-bg-warning' : (tx.status === 'disbursed' ? 'text-bg-success' : 'text-bg-danger')"
                  >
                    {{ capitalize(tx.status) }}
                  </span>
                </td>
                <td>{{ formatDate(tx.created_at) }}</td>
                <td>{{ formatTime(tx.created_at) }}</td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <!-- Always visible -->
                    <button class="btn btn-outline-secondary" title="View" @click="openView(tx)">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-secondary" title="Copy Ref #" @click="copyRef(tx.reference_number)">
                      <i class="bi bi-clipboard-check"></i>
                    </button>

                    <!-- Keep the original buttons but hide them; actions are moved to the modal -->
                    <button
                      v-if="tx.status==='pending'"
                      class="btn btn-outline-success d-none"
                      title="Mark Disbursed"
                      :disabled="updating.has(tx.id)"
                      @click="markDisbursed(tx)"
                    >
                      <span v-if="updating.has(tx.id)" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      <i v-else class="bi bi-check2-circle"></i>
                    </button>

                    <!-- 🔴 Reject (hidden here; moved to modal) -->
                    <button
                      v-if="tx.status==='pending'"
                      class="btn btn-outline-danger d-none"
                      :class="isRejectLocked(tx) ? 'btn-disabled-like' : ''"
                      :aria-disabled="isRejectLocked(tx) ? 'true' : 'false'"
                      :title="rejectTitle(tx)"
                      @click="handleRejectClick(tx)"
                    >
                      <span v-if="rejecting.has(tx.id)" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      <i v-else class="bi bi-x-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <!-- 🔹 View Modal (teleported to body) -->
    <teleport to="body">
      <div
        class="modal fade"
        id="txViewModal"
        tabindex="-1"
        aria-labelledby="txViewLabel"
        aria-hidden="true"
        ref="viewModalEl"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="txViewLabel">Transaction Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" v-if="selectedTx">
              <dl class="row mb-0">
                <dt class="col-4">Reference #</dt>
                <dd class="col-8 font-monospace">{{ selectedTx.reference_number }}</dd>

                <dt class="col-4">User</dt>
                <dd class="col-8">
                  <div class="fw-semibold">{{ selectedTx.user_name }}</div>
                  <div class="text-muted small">{{ selectedTx.user_email }}</div>
                </dd>

                <dt class="col-4">Amount</dt>
                <dd class="col-8">₱ {{ formatAmount(selectedTx.amount) }}</dd>

                <dt class="col-4">Status</dt>
                <dd class="col-8">
                  <span
                    class="badge"
                    :class="selectedTx.status === 'pending' ? 'text-bg-warning' : (selectedTx.status === 'disbursed' ? 'text-bg-success' : 'text-bg-danger')"
                  >
                    {{ capitalize(selectedTx.status) }}
                  </span>
                </dd>

                <dt class="col-4">Bank</dt>
                <dd class="col-8">{{ prettyBank(selectedTx.bank_name) }}</dd>

                <dt class="col-4">Created</dt>
                <dd class="col-8">{{ formatDate(selectedTx.created_at) }} · {{ formatTime(selectedTx.created_at) }}</dd>

                <dt class="col-4">Updated</dt>
                <dd class="col-8">{{ formatDate(selectedTx.updated_at) }} · {{ formatTime(selectedTx.updated_at) }}</dd>
              </dl>
            </div>
            <div class="modal-footer gap-2">
              <!-- Actions relocated here, right beside Close -->
              <button
                v-if="selectedTx && selectedTx.status==='pending'"
                class="btn btn-outline-danger order-1"
                :class="rejecting.has(selectedTx.id) ? 'btn-disabled-like' : ''"
                :aria-disabled="rejecting.has(selectedTx.id) ? 'true' : 'false'"
                :title="rejectTitle(selectedTx)"
                @click="handleRejectClick(selectedTx)"
              >
                <span v-if="rejecting.has(selectedTx.id)" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-x-circle me-1"></i>
                Reject
              </button>

              <button
                v-if="selectedTx && selectedTx.status==='pending'"
                class="btn btn-outline-success order-2"
                title="Mark Disbursed"
                :disabled="updating.has(selectedTx.id)"
                @click="markDisbursed(selectedTx)"
              >
                <span v-if="updating.has(selectedTx.id)" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-check2-circle me-1"></i>
                Disburse
              </button>

              <button class="btn btn-light ms-auto order-3" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 🔹 Copy / Info Toast (small, bottom-right, auto-hide) -->
      <div class="toast-container position-fixed bottom-0 end-0 p-3 copy-toast-layer">
        <div
          ref="copyToastEl"
          class="toast align-items-center text-bg-dark border-0 shadow-sm small"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-bs-delay="1500"
        >
          <div class="d-flex">
            <div class="toast-body py-2 px-3">
              {{ copyToastMsg }}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'

type Status = 'pending' | 'disbursed' | 'rejected'
type BankName = 'gcash' | 'maya' | 'gotyme'
type Tx = {
  id: number
  user_id: string
  user_name: string
  user_email: string
  reference_number: string
  amount: number
  status: Status
  bank_name: BankName
  created_at: string
  updated_at: string
}

const transactions = ref<Tx[]>([])
const loading = ref(false)
const errorMsg = ref<string>('')

const filter = ref<'all' | Status>('all')
const setFilter = (f: 'all' | Status) => {
  console.log('[UI] setFilter ->', f)
  filter.value = f
}

const filtered = computed(() => {
  return filter.value === 'all' ? transactions.value : transactions.value.filter(t => t.status === filter.value)
})

const pendingCount = computed(() => transactions.value.filter(t => t.status === 'pending').length)
const disbursedCount = computed(() => transactions.value.filter(t => t.status === 'disbursed').length)

/** ===== Live indicator state ===== */
const isRtConnected = ref(false)
const lastRtAt = ref<Date | null>(null)
const blinkLive = ref(false)
let blinkTimer: any = null
const triggerBlink = () => {
  blinkLive.value = true
  clearTimeout(blinkTimer)
  blinkTimer = setTimeout(() => (blinkLive.value = false), 1200)
}
const timeSince = (d: Date) => {
  const sec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000))
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  return `${h}h`
}

watch(transactions, (val) => {
  console.log('[State] transactions changed. Total:', val.length, {
    pending: pendingCount.value,
    disbursed: disbursedCount.value
  })
})

const formatAmount = (n: number) =>
  Number(n ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* Date-only (no time) */
const formatDate = (iso: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString()
}

/* Hours & minutes only (no seconds) */
const formatTime = (iso: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
const prettyBank = (b?: BankName) => (b === 'gcash' ? 'GCash' : b === 'maya' ? 'Maya' : b === 'gotyme' ? 'GoTyme' : '—')

/** ---------- Load data from ewallet.transactions with user info ---------- */
const loadTransactions = async () => {
  loading.value = true
  errorMsg.value = ''
  console.log('[Load] Fetching transactions…')
  try {
    const { data, error } = await supabase
      .schema('ewallet')
      .from('transactions')
      .select(`
        id,
        user_id,
        reference_number,
        amount,
        status,
        bank_name,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    console.log('[Load] Raw rows:', data?.length ?? 0)

    let rows = (data || []) as any[]

    // Fallback: hydrate user fields from public.users for display
    const missingUserInfo = rows.some(r => !r.users)
    if (missingUserInfo && rows.length) {
      const ids = Array.from(new Set(rows.map(r => r.user_id)))
      const { data: userRows, error: uerr } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', ids)
      if (!uerr && userRows) {
        const map = new Map(userRows.map(u => [u.id, u]))
        rows = rows.map(r => ({ ...r, users: map.get(r.user_id) || null }))
        console.log('[Load] Hydrated user info for', userRows.length, 'users')
      } else {
        console.warn('[Load] Could not hydrate user info. error:', uerr?.message)
      }
    }

    transactions.value = rows.map(enrichRowToTx)
    console.log('[Load] transactions set:', transactions.value.length)
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to load transactions.'
    console.error('[Load] Error:', e)
  } finally {
    loading.value = false
  }
}

/** ---------- Row -> Tx mapper (centralized for realtime too) ---------- */
function enrichRowToTx(r: any): Tx {
  return {
    id: r.id,
    user_id: r.user_id,
    user_name: r.users?.full_name || '(No name)',
    user_email: r.users?.email || '',
    reference_number: r.reference_number,
    amount: Number(r.amount ?? 0),
    status: r.status,
    bank_name: r.bank_name,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }
}

/** ---------- View modal handling ---------- */
const selectedTx = ref<Tx | null>(null)
const viewModalEl = ref<HTMLDivElement | null>(null)
let viewModal: any = null

const openView = (tx: Tx) => {
  selectedTx.value = tx
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  if (w?.bootstrap && viewModalEl.value) {
    viewModal = w.bootstrap.Modal.getOrCreateInstance(viewModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    viewModal.show()
  }
}

/** Small helper to close the modal safely */
const hideViewModal = () => {
  try {
    const w = window as any
    if (viewModal?.hide) {
      viewModal.hide()
    } else if (w?.bootstrap && viewModalEl.value) {
      const inst = w.bootstrap.Modal.getOrCreateInstance(viewModalEl.value)
      inst?.hide?.()
    }
  } catch (e) {
    console.warn('[Modal] hide error:', e)
  }
}

/** ---------- Copy / Info Toast ---------- */
const copyToastEl = ref<HTMLElement | null>(null)
let copyToast: any = null
const copyToastMsg = ref('Copied!')

const showInfo = (msg: string) => {
  copyToastMsg.value = msg
  const w = window as any
  if (w?.bootstrap && copyToastEl.value) {
    copyToast = w.bootstrap.Toast.getOrCreateInstance(copyToastEl.value, { delay: 1500, autohide: true })
    copyToast.show()
  } else {
    alert(msg)
  }
}

const copyRef = async (refno: string) => {
  try {
    await navigator.clipboard.writeText(refno)
    showInfo('Copied to clipboard!')
  } catch (e) {
    console.error('Clipboard copy failed', e)
    showInfo('Failed to copy')
  }
}

/** ---------- Mark as Disbursed ---------- */
const updating = ref<Set<number>>(new Set())

const markDisbursed = async (tx: Tx) => {
  if (!tx || tx.status === 'disbursed' || updating.value.has(tx.id)) return
  console.log('[Action] markDisbursed ->', tx.id, tx.reference_number)
  try {
    updating.value.add(tx.id)

    const { data, error } = await supabase
      .schema('ewallet')
      .from('transactions')
      .update({ status: 'disbursed' })
      .eq('id', tx.id)
      .select('id, updated_at, status')
      .single()

    if (error) throw error
    console.log('[Action] markDisbursed OK ->', data)

    // Optimistic update (realtime will also arrive)
    const idx = transactions.value.findIndex(t => t.id === tx.id)
    if (idx !== -1) {
      transactions.value[idx] = {
        ...transactions.value[idx],
        status: 'disbursed',
        updated_at: data?.updated_at ?? transactions.value[idx].updated_at,
      }
      transactions.value = [...transactions.value]
    }

    if (selectedTx.value?.id === tx.id) {
      selectedTx.value = {
        ...selectedTx.value,
        status: 'disbursed',
        updated_at: data?.updated_at ?? selectedTx.value.updated_at,
      }
      // ✅ Auto-close modal when action was from the modal's selected tx
      hideViewModal()
      selectedTx.value = null
    }
  } catch (e: any) {
    console.error('Failed to mark disbursed:', e?.message || e)
    showInfo(e?.message || 'Failed to mark as disbursed.')
  } finally {
    updating.value.delete(tx.id)
    updating.value = new Set(updating.value) // force reactivity
  }
}

/** ---------- Reject helpers ---------- */
const rejecting = ref<Set<number>>(new Set())

const isRejectLocked = (tx: Tx) =>
  // Button only renders for 'pending', so just lock on in-flight
  rejecting.value.has(tx.id)

const rejectTitle = (tx: Tx) => {
  if (rejecting.value.has(tx.id)) return 'Reject in progress…'
  if (tx.status === 'disbursed') return 'Cannot reject a disbursed transaction'
  if (tx.status === 'rejected') return 'Already rejected'
  return 'Reject'
}

const handleRejectClick = (tx: Tx) => {
  if (rejecting.value.has(tx.id)) return showInfo('Reject in progress…')
  if (tx.status === 'disbursed') return showInfo('Cannot reject a disbursed transaction.')
  if (tx.status === 'rejected') return showInfo('This transaction is already rejected.')
  // otherwise proceed
  return markRejected(tx)
}

/** ---------- Mark as Rejected ---------- */
const markRejected = async (tx: Tx) => {
  if (!tx || tx.status === 'rejected' || rejecting.value.has(tx.id)) return
  console.log('[Action] markRejected ->', tx.id, tx.reference_number)
  try {
    rejecting.value.add(tx.id)

    const { data, error } = await supabase
      .schema('ewallet')
      .from('transactions')
      .update({ status: 'rejected' })
      .eq('id', tx.id)
      .select('id, updated_at, status')
      .single()

    if (error) throw error
    console.log('[Action] markRejected OK ->', data)

    // Optimistic update
    const idx = transactions.value.findIndex(t => t.id === tx.id)
    if (idx !== -1) {
      transactions.value[idx] = {
        ...transactions.value[idx],
        status: 'rejected',
        updated_at: data?.updated_at ?? transactions.value[idx].updated_at,
      }
      transactions.value = [...transactions.value]
    }

    if (selectedTx.value?.id === tx.id) {
      selectedTx.value = {
        ...selectedTx.value,
        status: 'rejected',
        updated_at: data?.updated_at ?? selectedTx.value.updated_at,
      }
      // ✅ Auto-close modal when action was from the modal's selected tx
      hideViewModal()
      selectedTx.value = null
    }
  } catch (e: any) {
    console.error('Failed to reject:', e?.message || e)
    showInfo(e?.message || 'Failed to mark as rejected.')
  } finally {
    rejecting.value.delete(tx.id)
    rejecting.value = new Set(rejecting.value) // force reactivity
  }
}

/** ---------- Realtime subscription ---------- */
let rtChannel: ReturnType<typeof supabase.channel> | null = null
let pollTimer: any = null

const onRtEvent = async (payload: any) => {
  try {
    console.log('[RT] Payload ->', payload?.eventType, payload)
    lastRtAt.value = new Date()
    triggerBlink()

    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      await upsertOne(payload.new)
    } else if (payload.eventType === 'DELETE') {
      removeOne(payload.old?.id)
    }
  } catch (e) {
    console.error('[RT] Handler error:', e)
  }
}

const upsertOne = async (row: any) => {
  console.log('[RT] upsertOne raw row ->', row)
  // Enrich with user details if we don't have them
  if (!row.users) {
    try {
      const { data: udata, error: uerr } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('id', row.user_id)
        .maybeSingle()
      if (uerr) {
        console.warn('[RT] user hydrate error:', uerr.message)
      }
      row = { ...row, users: udata || null }
    } catch (err) {
      console.warn('[RT] user hydrate exception:', err)
    }
  }
  const tx = enrichRowToTx(row)
  const idx = transactions.value.findIndex(t => t.id === tx.id)
  if (idx === -1) {
    transactions.value = [tx, ...transactions.value] // newest first
    console.log('[RT] Inserted tx ->', tx.id)
  } else {
    transactions.value[idx] = { ...transactions.value[idx], ...tx }
    transactions.value = [...transactions.value] // force reactivity
    console.log('[RT] Updated tx ->', tx.id)
  }

  if (selectedTx.value?.id === tx.id) {
    selectedTx.value = { ...selectedTx.value, ...tx }
    console.log('[RT] Refreshed selectedTx in modal ->', tx.id)
  }
}

const removeOne = (id: number) => {
  console.log('[RT] removeOne id ->', id)
  const idx = transactions.value.findIndex(t => t.id === id)
  if (idx !== -1) {
    transactions.value.splice(idx, 1)
    transactions.value = [...transactions.value]
    console.log('[RT] Removed tx ->', id)
  }
  if (selectedTx.value?.id === id) {
    selectedTx.value = null
    console.log('[RT] Cleared selectedTx (was removed) ->', id)
  }
}

const startPollingFallback = () => {
  clearInterval(pollTimer)
  // Light polling every 20s only if not connected
  pollTimer = setInterval(() => {
    if (!isRtConnected.value) {
      console.log('[Poll] Realtime not connected. Refreshing list…')
      loadTransactions()
    }
  }, 20000)
}

onMounted(async () => {
  // init modal instance if Bootstrap JS is present
  const w = window as any
  if (w?.bootstrap && viewModalEl.value) {
    viewModal = w.bootstrap.Modal.getOrCreateInstance(viewModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
  }
  // init toast instance if present
  if (w?.bootstrap && copyToastEl.value) {
    copyToast = w.bootstrap.Toast.getOrCreateInstance(copyToastEl.value, { delay: 1500, autohide: true })
  }

  await loadTransactions()

  console.log('[RT] Subscribing to ewallet.transactions…')
  rtChannel = supabase
    .channel('ewallet-transactions')
    .on('postgres_changes', { event: '*', schema: 'ewallet', table: 'transactions' }, onRtEvent)
    .subscribe((status: any) => {
      // status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR'
      console.log('[RT] Channel status ->', status)
      if (status === 'SUBSCRIBED') {
        isRtConnected.value = true
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        isRtConnected.value = false
      }
    })

  startPollingFallback()
})

onBeforeUnmount(() => {
  if (viewModal?.dispose) viewModal.dispose()
  if (copyToast?.dispose) copyToast.dispose?.()
  if (rtChannel) {
    console.log('[RT] Removing channel…')
    supabase.removeChannel(rtChannel)
    rtChannel = null
  }
  clearInterval(pollTimer)
  clearTimeout(blinkTimer)
})
</script>

<style scoped>
.container { max-width: 1100px; }
.card { border-radius: 14px; }
.table thead th { white-space: nowrap; }
.font-monospace { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

/* 🔹 Disabled-like visual without blocking clicks (so we can show the message) */
.btn-disabled-like {
  opacity: 0.55;
  cursor: not-allowed;
  /* keep pointer events so we can catch clicks and show an explanation */
  pointer-events: auto;
}

/* ====== Clean, equal, centered table columns ====== */
.table-center-equal {
  table-layout: fixed;               /* equalize column widths */
  width: 100%;
}
.table-center-equal thead th,
.table-center-equal tbody td {
  text-align: center;                /* center everything */
  vertical-align: middle;
  min-width: auto !important;        /* ignore inlined min-width hints for uniform columns */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 12px;
  padding-right: 12px;
}
/* Override the existing right-align on Amount column and Actions column to center */
.table-center-equal thead th:nth-child(3),
.table-center-equal tbody td:nth-child(3),
.table-center-equal thead th:nth-child(7),
.table-center-equal tbody td:nth-child(7) {
  text-align: center !important;
}

/* Live badge */
.live-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(255,255,255,.25);
}
.blink {
  animation: blink 0.6s ease-in-out 0s 2;
}
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: .25; }
  100% { opacity: 1; }
}
</style>

<!-- Overlay layers (unscoped) -->
<style>
/* Keep modal/backdrop above most overlays */
.modal-backdrop { z-index: 19990 !important; }
.modal { z-index: 20000 !important; }
.modal .modal-content { opacity: 1 !important; }

/* Toast layer slightly above modal so it's always visible */
.copy-toast-layer { z-index: 20500 !important; }
</style>
