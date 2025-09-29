<template>
  <div class="loser-page container py-5">
    <div class="card shadow-sm mx-auto max-w">
      <div class="card-body p-4">
        <div class="text-center">
          <div class="emoji">😅</div>
          <h1 class="title mb-2">Maybe Next Time</h1>
          <p class="lead text-muted mb-3">
            You didn’t win this round. Your entry was refunded.
          </p>
        </div>

        <!-- Balances -->
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
              <div class="label">Amount to Refund</div>
              <div class="value">
                <span>₱ {{ fmtMoney(refundAmount) }}</span>
              </div>
            </div>
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
  status?: string
  player_cap?: number
  product_id?: string | null
  user_id_winner?: string | null
  loser_refund_amount?: number | null
}

const route = useRoute()
const router = useRouter()

const myUserId = ref<string | null>(null)
const eventId = ref<string | null>((route.query.eventId as string) || null)

const balance = ref<number | null>(null)
const eventInfo = ref<EventRow | null>(null)
const receipts = ref<ReceiptRow[]>([])
const err = ref('')
const busy = ref(false)

/** Helpers */
function fmtMoney(n: number | null | undefined) {
  const v = Number(n ?? 0)
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}
function shortId(id: string) { return id.slice(0, 6) + '…' + id.slice(-6) }

/** Refund amount: ONLY from event.loser_refund_amount */
const refundAmount = computed<number>(() => {
  const e = eventInfo.value
  return Number(e?.loser_refund_amount ?? 0)
})

async function fetchMe() {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    myUserId.value = data.user?.id ?? null
  } catch {
    myUserId.value = null
  }
}

/** If no ?eventId=, infer from latest receipt for this user */
async function ensureEventIdFromLatestReceipt() {
  if (eventId.value || !myUserId.value) return
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('receipt')
      .select('event_id')
      .eq('user_id', myUserId.value)
      .order('created_at', { ascending: false })
      .limit(1)
    if (error) throw error
    if (data && data.length) eventId.value = data[0].event_id
  } catch (e: any) {
    err.value = err.value || e?.message || 'Failed to infer event'
  }
}

async function fetchUserBalance() {
  if (!myUserId.value) return
  try {
    // 🔧 If your wallet lives elsewhere, change this query.
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

async function fetchEvent() {
  if (!eventId.value) return
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('event')
      .select('id, status, player_cap, product_id, user_id_winner, loser_refund_amount')
      .eq('id', eventId.value)
      .single()
    if (error) throw error
    eventInfo.value = data as EventRow
  } catch (e: any) {
    err.value = err.value || e?.message || 'Failed to load event'
    eventInfo.value = null
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
  await ensureEventIdFromLatestReceipt()
  await Promise.all([
    fetchEvent(),
    fetchUserBalance(),
  ])
  await fetchReceipts()
}

/** CONFIRM REFUND:
 *  - Adds refundAmount to users.balance
 *  - Navigates back to Mini Games
 */
async function confirmRefund() {
  if (!myUserId.value) { err.value = 'No user found.'; return }
  if (refundAmount.value <= 0) { err.value = 'Nothing to refund.'; return }
  busy.value = true
  try {
    // Reload to reduce race conditions
    await fetchUserBalance()
    const current = Number(balance.value ?? 0)
    const next = current + Number(refundAmount.value)

    // 🔧 If your wallet is stored elsewhere, change this update target.
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
</script>

<style scoped>
.max-w { width: min(720px, 92vw); }

.emoji { font-size: 56px; line-height: 1; }
.title {
  font-weight: 900;
  letter-spacing: 0.3px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.12);
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
.list-group-item { border-color: rgba(0,0,0,0.08); }
</style>
