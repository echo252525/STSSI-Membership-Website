<template>
  <div class="loser-page container py-5">
    <div class="card shadow-sm mx-auto max-w">
      <div class="card-body p-4">
        <!-- Header -->
        <div class="text-center">
          <div class="emoji">😅</div>
          <h1 class="title mb-2">Better luck next time</h1>
          <p class="lead text-muted mb-3">
            You didn’t win this round. Your refund has already been credited.
          </p>
        </div>

        <!-- Balance breakdown -->
        <div class="row g-3 my-3">
          <div class="col-12">
            <div class="info-tile">
              <div class="label mb-1">Balance Update</div>

              <div v-if="balance !== null" class="balance-grid">
                <div class="balance-row">
                  <div class="balance-key text-muted">Previous balance</div>
                  <div class="balance-val">₱ {{ fmtMoney(previousBalance) }}</div>
                </div>
                <div class="balance-row">
                  <div class="balance-key text-muted">Refunded</div>
                  <div class="balance-val text-success fw-bold">+ ₱ {{ fmtMoney(refundedAmount) }}</div>
                </div>
                <hr class="my-2"/>
                <div class="balance-row total">
                  <div class="balance-key fw-semibold">New balance</div>
                  <div class="balance-val fw-bold">₱ {{ fmtMoney(balance) }}</div>
                </div>
              </div>

              <div v-else class="text-muted">—</div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-if="err" class="text-danger mt-3">{{ err }}</div>

        <!-- Back -->
        <div class="text-center mt-4">
          <button class="btn btn-primary btn-lg px-4" @click="goBackToMiniGames">
            Back to Mini Games
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
  status?: string
  player_cap?: number
  product_id?: string | null
  user_id_winner?: string | null
  loser_refund_amount?: number | null // column name in DB
}

const route = useRoute()
const router = useRouter()

const myUserId = ref<string | null>(null)
const eventId = ref<string | null>((route.query.eventId as string) || null)

const balance = ref<number | null>(null)
const eventInfo = ref<EventRow | null>(null)
const err = ref('')

/** Helpers */
function fmtMoney(n: number | null | undefined) {
  const v = Number(n ?? 0)
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}
function shortId(id: string) { return id.slice(0, 6) + '…' + id.slice(-6) }

/** Refunded amount from event (DB column: loser_refund_amount) */
const refundedAmount = computed<number>(() => Number(eventInfo.value?.loser_refund_amount ?? 0))

/** Previous balance = current balance - refunded (not below 0)
 * DB already has: current balance = previous + refund.
 * We subtract refund here to *show* the before/after breakdown.
 */
const previousBalance = computed<number>(() => {
  const cur = Number(balance.value ?? 0)
  const refAmt = refundedAmount.value
  const prev = cur - refAmt
  return prev >= 0 ? prev : 0
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
      .schema('ewallet')
      .from('game_receipt')
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

async function init() {
  await fetchMe()
  await ensureEventIdFromLatestReceipt()
  await Promise.all([fetchEvent(), fetchUserBalance()])
}

function goBackToMiniGames() {
  try {
    router.push({ name: 'user.minigames' })
  } catch {
    router.push('/app/minigames')
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
  margin-bottom: 6px;
}

.balance-grid {
  display: grid;
  gap: 6px;
}
.balance-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 1rem;
}
.balance-row .balance-key { color: #6c757d; }
.balance-row .balance-val { font-weight: 700; }
.balance-row.total { font-size: 1.15rem; }

.list-group-item { border-color: rgba(0,0,0,0.08); }
</style>
