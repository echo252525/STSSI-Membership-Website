<template>
  <div class="game-event container py-4">

    <!-- ===== HERO / TITLE ===== -->
    <header class="hero text-center mb-3">
      <h1 class="hero-title">SPIN &amp; WIN</h1>
      <div class="promo-pill">
        Join the event to buy the item at a discount
      </div>
    </header>

    <!-- ===== MAIN GRID (Left roster · Wheel · Prize panel) ===== -->
    <div class="event-grid mb-4">
      <!-- LEFT: Players list -->
      <aside class="players-panel card shadow-sm">
        <div class="card-body">
          <div class="panel-head d-flex align-items-center gap-2 mb-2">
            <div class="icon-ring"><i class="bi bi-people-fill"></i></div>
            <h6 class="m-0">Players</h6>
          </div>
          <ul class="players-list">
            <li v-for="(e, i) in entries" :key="e.id" class="player-row">
              <div class="avatar-wrap">
                <img
                  class="avatar"
                  :src="avatarUrl(e.user_id)"
                  :alt="displayName(e.user_id)"
                  @error="onImgError($event, e.user_id)"
                />
              </div>
              <div class="player-label">
                <span class="index">Player {{ i + 1 }}</span>
                <span class="name">{{ displayName(e.user_id) || maskUser(e.user_id) }}</span>
              </div>
            </li>
            <li v-if="entries.length === 0" class="player-empty text-muted">No players yet</li>
          </ul>
        </div>
      </aside>

      <!-- CENTER: Wheel + controls -->
      <section class="center-stage">
        <!-- winner hero (kept, but hidden when modal is shown) -->
        <div
          v-if="revealWinner && displayWinnerEntry && !showOutcomeModal"
          class="winner-hero alert alert-success p-3 text-center mb-3"
        >
          <div class="fw-bold">🎉 Winner · <code>{{ maskUser(displayWinnerEntry.user_id) }}</code></div>
        </div>

        <!-- Wheel -->
        <div class="wheel-stage">
          <div class="stage-glow"></div>
          <div class="wheel-wrap mx-auto mb-3" :class="{ spinning }">
            <div class="pointer"></div>
            <div class="wheel" :style="wheelStyle" @transitionend="onSpinEnd">
              <div class="hub"></div>
              <div class="hub-dot"></div>

              <!-- labels -->
              <template v-for="(p, i) in spinEntries" :key="p.id">
                <div class="slice-label" :style="[labelStyle(i), sliceLabelStyle(i)]" :title="maskUser(p.user_id)">
                  <span class="label-text">{{ maskUser(p.user_id) }}</span>
                </div>
              </template>
            </div>

            <!-- spinning overlay -->
            <div v-if="spinning" class="spin-overlay">
              <div class="pulse-dot"></div>
              <div class="mt-2 fw-semibold">Spinning…</div>
            </div>
          </div>

          <!-- Controls row -->
          <div class="controls d-flex align-items-center justify-content-center gap-3 mb-2">
            <button
              class="btn btn-primary btn-arcade"
              :disabled="!canSpinGate || spinning || busy.commit"
              @click="startCountdownAndSpin()"
            >
              <span v-if="spinning" class="spinner-border spinner-border-sm me-2"></span>
              {{ resolved ? 'Resolved' : 'SPIN' }}
            </button>
            <span v-if="countdown !== null" class="badge bg-warning text-dark fs-6 countdown-badge">
              Spinning in {{ countdown }}…
            </span>
          </div>

          <!-- Sub badges (joined/total/cap) -->
          <div class="joined-summary d-flex align-items-center justify-content-center gap-2">
            <span class="badge bg-success">Joined · <strong>{{ joinedEntries.length }}</strong></span>
            <span class="badge bg-secondary">Total · <strong>{{ entries.length }}</strong></span>
            <span v-if="eventInfo?.player_cap" class="badge bg-info">Cap · <strong>{{ eventInfo.player_cap }}</strong></span>
          </div>
        </div>
      </section>

      <!-- RIGHT: Prize / Info -->
      <aside class="prize-panel card shadow-sm">
        <div class="card-body">
          <h3 class="prize-title">{{ prizeTitle }}</h3>

          <div v-if="costToEnter !== null" class="price-card entry">
            <div class="label">COST TO ENTER</div>
            <div class="amount">₱ {{ costToEnter }}</div>
          </div>

          <div v-if="costToBuy !== null" class="price-card buy">
            <div class="label">COST TO BUY</div>
            <div class="amount">₱ {{ costToBuy }}</div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Bottom call-to-action buttons (kept in code but hidden as requested) -->
    <div class="cta-row d-flex align-items-center justify-content-center gap-3" v-if="false">
      <button type="button" class="btn cta-join">JOIN EVENT</button>
      <button type="button" class="btn cta-help">HOW TO PLAY</button>
    </div>

    <!-- (kept) bottom winner alert, hidden when modal is shown -->
    <div v-if="revealWinner && winnerEntry && !showOutcomeModal" class="alert alert-success mt-3 text-center">
      Winner: <code>{{ maskUser(winnerEntry.user_id) }}</code>
    </div>

    <div v-if="err" class="text-danger mt-3">{{ err }}</div>

    <!-- Confetti overlay on reveal -->
    <div v-if="revealWinner" class="confetti-wrap" aria-hidden="true">
      <span v-for="n in 30" :key="n" class="confetti-piece"></span>
    </div>

    <!-- ===================== Outcome Popup (Winner / Loser) ===================== -->
    <div
      v-if="showOutcomeModal"
      class="outcome-backdrop"
      @click.self="closeOutcomeModal"
    >
      <div
        class="outcome-modal card"
        :class="outcomeType === 'winner' ? 'outcome-winner' : 'outcome-loser'"
      >
        <div class="sparkle-1"></div>
        <div class="sparkle-2"></div>

        <div class="card-body p-4 text-center">
          <div class="pop-title" v-if="outcomeType === 'winner'">🎉 Congratulations!</div>
          <div class="pop-title" v-else>Better luck next time</div>

          <p class="mt-2 mb-3" v-if="outcomeType === 'winner'">
            You won this round! <br />
            <small class="text-muted">Winner · <code>{{ maskUser(displayWinnerEntry?.user_id || '') }}</code></small>
          </p>
          <p class="mt-2 mb-3" v-else>
            This time wasn’t yours—but your entry is safe. <br />
            <small class="text-muted">Winner · <code>{{ maskUser(displayWinnerEntry?.user_id || '') }}</code></small>
          </p>

          <!-- CHANGED: route to winner/loser destinations -->
          <button
            class="btn btn-lg w-100 mt-1 pop-btn"
            @click="handleOutcomeAction"
            :class="outcomeType === 'winner' ? 'btn-winner' : 'btn-loser'"
          >
            <span v-if="outcomeType === 'winner'">Get Discount</span>
            <span v-else>Refund</span>
          </button>
        </div>

        <button class="pop-close" @click="closeOutcomeModal" aria-label="Close">✕</button>
      </div>
    </div>
    <!-- ======================================================================== -->
  </div>
</template>

<script setup lang="ts">
/* ========= EVERYTHING YOU ALREADY HAD, with requested changes ========= */
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const route = useRoute()
const router = useRouter()
const eventId = route.query.eventId as string

type EntryRow = { id: string; event_id: string; user_id: string; status: string }

/* UI data */
const prizeTitle = ref('USB DRIVE')
const costToEnter = ref<number | null>(50)   // or null to hide
const costToBuy = ref<number | null>(48.5)   // or null to hide

/* Interest config */
const INTEREST_RATE = 0.02
const calcInterest = (base:number) => Math.round(base * INTEREST_RATE * 100) / 100

/* Avatars cache */
type UserMeta = { id: string; full_name?: string|null; profile_url?: string|null; avatar?: string; signed_exp?: number }
const userMeta = ref<Record<string, UserMeta>>({})
const AVATAR_TTL_SEC = 3600, REFRESH_AHEAD_SEC = 300
let avatarRefreshTimer: number | null = null

const entries = ref<EntryRow[]>([])
const busy = ref({ load: false, commit: false })
const spinning = ref(false)
const resolved = ref(false)
const err = ref('')
const rotateDeg = ref(0)
const spinDurationMs = ref(5200)
const targetIndex = ref<number | null>(null)
const winnerEntry = ref<EntryRow | null>(null)
const revealWinner = ref(false)

/* Popup state */
const showOutcomeModal = ref(false)
const outcomeType = ref<'winner' | 'loser' | null>(null)
const myUserId = ref<string | null>(null)

/* Track updates */
const eventWinnerUpdated = ref(false)
const receiptInserted = ref(false)   // game receipts per entry
const voucherInserted = ref(false)

const eventInfo = ref<{ id: string; player_cap: number; status: string; user_id_winner?: string | null; product_id?: string | null } | null>(null)
const spinInfo = ref<{ event_id: string; winner_entry_id: string } | null>(null)

type JoinFeedItem = { user_id: string; at: Date; type: 'joined' | 'rejoined' | 'existing' }
const joinFeed = ref<JoinFeedItem[]>([])
const FEED_LIMIT = 20

const countdown = ref<number | null>(null)
let countdownHandle: number | null = null
const autoSpinStarted = ref(false)
const rpcWinnerId = ref<string | null>(null)
let participantsSnapshot: EntryRow[] = []
const spinStarted = ref(false)

const joinedEntries = computed(() => entries.value.filter(e => e.status === 'joined'))
const readyEntries = computed(() => entries.value.filter(e => e.status === 'ready'))
const spinEntries = computed(() => readyEntries.value.length > 0 ? readyEntries.value : joinedEntries.value)
const anyWinner = computed(() => entries.value.some(e => e.status === 'winner'))
const allReady = computed(() => spinEntries.value.length >= 2 && spinEntries.value.every(e => e.status === 'ready'))
const canSpinGate = computed(() => allReady.value && !anyWinner.value)

const leftSideEntries = computed(() => { const mid = Math.ceil(entries.value.length / 2); return entries.value.slice(0, mid) })
const rightSideEntries = computed(() => { const mid = Math.ceil(entries.value.length / 2); return entries.value.slice(mid) })

const displayWinnerEntry = computed<EntryRow | null>(() => {
  if (winnerEntry.value) return winnerEntry.value
  const wid = spinInfo.value?.winner_entry_id
  if (!wid) return null
  return entries.value.find(e => e.id === wid) || null
})

/* Popup helper */
function openOutcomePopupIfMe() {
  if (!revealWinner.value || !displayWinnerEntry.value || !myUserId.value) return
  const winnerUserId = displayWinnerEntry.value.user_id
  const iParticipated = entries.value.some(e => e.user_id === myUserId.value)
  if (!iParticipated) return

  outcomeType.value = (myUserId.value === winnerUserId) ? 'winner' : 'loser'
  showOutcomeModal.value = true
}

function closeOutcomeModal() {
  showOutcomeModal.value = false
}

async function fetchMe() {
  try {
    const { data } = await supabase.auth.getUser()
    myUserId.value = data.user?.id ?? null
  } catch { myUserId.value = null }
}

function shortId(id?: string) { return id ? id.slice(0,4)+'…'+id.slice(-4) : '—' }
function maskUser(id: string) { return id.slice(0,4)+'…'+id.slice(-4) }
function fmtTime(d: Date) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
function pushJoinFeed(item: JoinFeedItem) { joinFeed.value.unshift(item); if (joinFeed.value.length > FEED_LIMIT) joinFeed.value.length = FEED_LIMIT }

/* Wheel style */
function sliceColor(i:number, n:number) { const hue = Math.round((360*i)/Math.max(1,n)); return `hsl(${hue} 78% 55%)` }
const wheelStyle = computed(() => {
  const n = Math.max(1, spinEntries.value.length)
  const stops: string[] = []
  for (let i=0;i<n;i++){ const a0=(360/n)*i, a1=(360/n)*(i+1); stops.push(`${sliceColor(i,n)} ${a0}deg ${a1}deg`) }
  return {
    background: `conic-gradient(${stops.join(',')})`,
    transform: `rotate(${rotateDeg.value}deg)`,
    transition: spinning.value ? `transform ${spinDurationMs.value/1000}s cubic-bezier(.08,.55,.24,1)` : 'none',
  }
})
function labelStyle(i:number) { const n=Math.max(1, spinEntries.value.length); const mid=(360/n)*(i+.5); return { transform:`rotate(${mid}deg) translate(0, -46%) rotate(${-mid}deg)` } }
function sliceLabelStyle(i:number){ return { color:'#fff', textShadow:'0 1px 2px rgba(0,0,0,.6), 0 0 4px rgba(0,0,0,.25)', background:'transparent' } }

/* Data fetch */
async function fetchEntries() {
  if (!eventId) return
  const { data, error } = await supabase.schema('games').from('entry').select('id, event_id, user_id, status').eq('event_id', eventId)
  if (error) { err.value = error.message; return }
  const prev = entries.value
  entries.value = (data || []) as EntryRow[]
  resolved.value = entries.value.some(e => e.status === 'winner')

  const ids = Array.from(new Set(entries.value.map(e => e.user_id)))
  await ensureUserMeta(ids)

  if (prev.length === 0 && entries.value.length > 0) {
    entries.value.filter(e => e.status === 'joined').slice(0, FEED_LIMIT).forEach(e => pushJoinFeed({ user_id: e.user_id, at: new Date(), type: 'existing' }))
  }
  if (!spinning.value && resolved.value) revealWinner.value = true
}
async function fetchEvent() {
  if (!eventId) return
  const { data, error } = await supabase.schema('games').from('event').select('id, player_cap, status, user_id_winner, product_id').eq('id', eventId).single()
  if (error) { err.value = error.message; return }
  eventInfo.value = data as any
}
async function fetchSpin() {
  if (!eventId) return
  const { data, error } = await supabase.schema('games').from('spin').select('event_id, winner_entry_id').eq('event_id', eventId).maybeSingle()
  if (!error && data) { spinInfo.value = data as any; if (!spinning.value) revealWinner.value = true }
}

/* Spin logic */
async function startSpin(forcedIndex:number){ const slice=360/spinEntries.value.length; const targetAngle = slice*(forcedIndex+.5); rotateDeg.value = 360*12 + (360 - targetAngle); spinning.value = true }
async function settleEntriesAfterSpin(winnerId:string){
  try{
    await supabase.schema('games').from('entry').update({ status:'winner' }).eq('id', winnerId)
    await supabase.schema('games').from('entry').update({ status:'refunded' }).eq('event_id', eventId).neq('id', winnerId).in('status', ['joined','ready'])
  }catch(e:any){ err.value = e.message || 'Failed to settle entries' }
}

/* Update event.winner */
async function updateEventWinnerUserId(winnerUserId: string | null | undefined){
  if (!eventId || !winnerUserId || eventWinnerUpdated.value) return
  try{
    await supabase.schema('games').from('event').update({ user_id_winner: winnerUserId }).eq('id', eventId)
    eventWinnerUpdated.value = true
  }catch(e:any){
    err.value = err.value || (e?.message ?? 'Failed to update event winner')
  }
}

/* Insert game receipts INTO ewallet.game_receipt */
async function insertReceiptsForParticipants(entriesList: EntryRow[]) {
  if (!eventId || receiptInserted.value || !entriesList?.length) return
  try {
    const payload = entriesList.map(e => ({
      event_id: eventId,
      user_id: e.user_id,
      entry_id: e.id,
    }))
    await supabase
      .schema('ewallet')
      .from('game_receipt')
      .upsert(payload, { onConflict: 'entry_id', ignoreDuplicates: true })
    receiptInserted.value = true
  } catch (e:any) {
    err.value = err.value || (e?.message ?? 'Failed to insert game receipts')
  }
}

/* Winner voucher */
async function ensureVoucherForWinner() {
  if (!eventId || voucherInserted.value || !displayWinnerEntry.value) return
  try {
    const winnerUserId = displayWinnerEntry.value.user_id
    if (!winnerUserId) return

    const productId = eventInfo.value?.product_id ?? null

    const { data: existing, error: qErr } = await supabase
      .schema('games')
      .from('voucher')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', winnerUserId)
      .limit(1)

    if (!qErr && existing && existing.length) {
      voucherInserted.value = true
      return
    }

    await supabase
      .schema('games')
      .from('voucher')
      .insert({ event_id: eventId, product_id: productId, user_id: winnerUserId })

    voucherInserted.value = true
  } catch (e:any) {
    err.value = err.value || (e?.message ?? 'Failed to create voucher')
  }
}

/* ===== CHANGED: Create a purchase for the winner
   - modeofpayment: 'ewallet'
   - status: 'to ship'
*/
async function createWinnerPurchaseIfNeeded() {
  try {
    const winnerUid = displayWinnerEntry.value?.user_id
    const productId = eventInfo.value?.product_id
    if (!winnerUid || !productId) return

    // avoid duplicates
    const { data: existing, error: qErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id')
      .eq('user_id', winnerUid)
      .eq('product_id', productId)
      .eq('reference_number', eventId)
      .limit(1)

    if (!qErr && existing && existing.length) return

    await supabase
      .schema('games')
      .from('purchases')
      .insert({
        user_id: winnerUid,
        product_id: productId,
        reference_number: eventId, // tie back to event
        status: 'to ship',         // <— requested
        qty: 1,
        modeofpayment: 'ewallet',  // <— requested
      })
  } catch (e:any) {
    err.value = err.value || (e?.message ?? 'Failed to create winner purchase')
  }
}

/* ===== CHANGED: Refunds immediately after game ends, directly into users.balance
   - Winner: refund ONLY the interest
   - Losers: refund entry fee + interest
*/
async function adjustUserBalance(userId: string, delta: number) {
  try {
    const { data, error } = await supabase.from('users').select('balance').eq('id', userId).single()
    if (error) throw error
    const current = Number(data?.balance ?? 0)
    const next = Math.round((current + delta) * 100) / 100
    const { error: uerr } = await supabase.from('users').update({ balance: next }).eq('id', userId)
    if (uerr) throw uerr
  } catch (e:any) {
    err.value = err.value || (e?.message ?? `Failed to update balance for ${userId}`)
  }
}

async function processRefunds() {
  try {
    if (!displayWinnerEntry.value) return
    const winnerUid = displayWinnerEntry.value.user_id
    const entryFee = Number(costToEnter.value ?? 0)
    const interest = calcInterest(entryFee)

    // Winner: interest-only refund
    await adjustUserBalance(winnerUid, interest)

    // Losers: entry fee + interest
    const loserAmount = entryFee + interest
    const losers = participantsSnapshot.filter(e => e.user_id !== winnerUid)
    for (const l of losers) {
      await adjustUserBalance(l.user_id, loserAmount)
    }
  } catch (e:any) {
    err.value = err.value || (e?.message ?? 'Refund processing failed')
  }
}

async function onSpinEnd(){
  if (!spinning.value) return
  spinning.value = false
  if (rpcWinnerId.value){
    const idx = participantsSnapshot.findIndex(e=>e.id===rpcWinnerId.value)
    if (idx>=0) winnerEntry.value = participantsSnapshot[idx]
    await settleEntriesAfterSpin(rpcWinnerId.value)
    await Promise.all([fetchEntries(), fetchEvent(), fetchSpin()])

    // Write event winner
    await updateEventWinnerUserId(displayWinnerEntry.value?.user_id)

    // Insert receipts (ewallet.game_receipt)
    await insertReceiptsForParticipants(participantsSnapshot)

    // Winner voucher (optional)
    await ensureVoucherForWinner()

    // Create winner purchase (ewallet, to ship)
    await createWinnerPurchaseIfNeeded()

    // REFUNDS: immediate
    await processRefunds()

    resolved.value = true; rpcWinnerId.value = null
  }
  busy.value.commit = false; spinStarted.value = false; revealWinner.value = true

  // Open popup for current user
  openOutcomePopupIfMe()
}
async function triggerServerSpinAndAnimate(){
  if (!eventId || !canSpinGate.value || resolved.value || spinStarted.value) return
  participantsSnapshot = spinEntries.value.slice(); spinStarted.value = true
  try{
    busy.value.commit = true; revealWinner.value = false
    const { data, error } = await supabase.rpc('rpc_spin_event', { _event_id: eventId, _seed: null })
    if (error){ err.value = error.message; busy.value.commit=false; spinStarted.value=false; return }
    const spinRow = Array.isArray(data) ? data[0] : data
    const winner_id: string | undefined = spinRow?.winner_entry_id
    if (!winner_id){ err.value='RPC did not return winner_entry_id'; busy.value.commit=false; spinStarted.value=false; return }
    rpcWinnerId.value = winner_id
    let forcedIdx = participantsSnapshot.findIndex(e=>e.id===winner_id)
    if (forcedIdx < 0){ await fetchEntries(); participantsSnapshot = spinEntries.value.slice(); forcedIdx = participantsSnapshot.findIndex(e=>e.id===winner_id) }
    if (forcedIdx < 0){
      await settleEntriesAfterSpin(winner_id); await Promise.all([fetchEntries(), fetchEvent(), fetchSpin()])
      await updateEventWinnerUserId(displayWinnerEntry.value?.user_id)

      await insertReceiptsForParticipants(participantsSnapshot)
      await ensureVoucherForWinner()
      await createWinnerPurchaseIfNeeded()
      await processRefunds()

      resolved.value = true; busy.value.commit = false; spinStarted.value=false; revealWinner.value=true; return
    }
    await startSpin(forcedIdx)
  }catch(e:any){ err.value = e.message; busy.value.commit=false; spinStarted.value=false }
}
function actuallyStartCountdown(){
  autoSpinStarted.value = true; countdown.value = 3
  if (countdownHandle){ clearInterval(countdownHandle); countdownHandle=null }
  countdownHandle = window.setInterval(async ()=>{
    if ((countdown.value as number) > 1){ countdown.value = (countdown.value as number) - 1 }
    else { clearInterval(countdownHandle!); countdownHandle = null; countdown.value = null; await triggerServerSpinAndAnimate() }
  }, 1000)
}
function startCountdownAndSpin(){
  if (autoSpinStarted.value || resolved.value || spinning.value || spinStarted.value) return
  Promise.all([fetchEntries()]).then(()=>{
    if (!canSpinGate.value){
      const stop = watch(allReady, (ok)=>{
        if (ok && !autoSpinStarted.value && !resolved.value && !spinning.value && !spinStarted.value){ stop(); actuallyStartCountdown() }
      })
      return
    }
    actuallyStartCountdown()
  })
}

/* Realtime */
let realtimeChannel:any|null=null, realtimeChannelSpin:any|null=null, realtimeChannelEvent:any|null=null
let refreshTimer:number|null=null; const POLL_MS=10_000; let pollHandle:number|null=null
function scheduleRefresh(delayMs=250){ if (refreshTimer) window.clearTimeout(refreshTimer); refreshTimer = window.setTimeout(async()=>{ refreshTimer=null; await Promise.all([fetchEntries(), fetchSpin(), fetchEvent()]) }, delayMs) }
function makeRealtimeChannel(){
  if (!eventId) return
  if (realtimeChannel){ try{ supabase.removeChannel(realtimeChannel) }catch{}; realtimeChannel=null }
  realtimeChannel = supabase.channel(`ge-entry-${eventId}`, { config:{ broadcast:{ self:false }, presence:{ key:'games-event' } } })
    .on('postgres_changes', { event:'*', schema:'games', table:'entry', filter:`event_id=eq.${eventId}` }, (payload:any)=>{
      try{
        const { eventType, new:n, old:o } = payload
        if (eventType==='INSERT' && n?.status==='joined') pushJoinFeed({ user_id:n.user_id, at:new Date(), type:'joined' })
        else if (eventType==='UPDATE'){ const becameJoined = o?.status!=='joined' && n?.status==='joined'; if (becameJoined) pushJoinFeed({ user_id:n.user_id, at:new Date(), type:'rejoined' }) }
      }catch{}
      scheduleRefresh(150)
    })
    .subscribe((s:any)=>{ if (s==='CLOSED'||s==='CHANNEL_ERROR') setTimeout(()=>makeRealtimeChannel(),1000) })
}
function makeRealtimeChannelSpin(){
  if (!eventId) return
  if (realtimeChannelSpin){ try{ supabase.removeChannel(realtimeChannelSpin) }catch{}; realtimeChannelSpin=null }
  realtimeChannelSpin = supabase.channel(`ge-spin-${eventId}`)
    .on('postgres_changes',{ event:'*', schema:'games', table:'spin', filter:`event_id=eq.${eventId}` }, async (payload:any)=>{
      const winner_id = payload?.new?.winner_entry_id; if (!winner_id) return
      if (spinStarted.value || spinning.value) return
      participantsSnapshot = spinEntries.value.slice(); rpcWinnerId.value = winner_id; spinStarted.value = true; revealWinner.value = false
      let forcedIdx = participantsSnapshot.findIndex(e=>e.id===winner_id)
      if (forcedIdx < 0){ await fetchEntries(); participantsSnapshot = spinEntries.value.slice(); forcedIdx = participantsSnapshot.findIndex(e=>e.id===winner_id) }
      if (forcedIdx >= 0){ await startSpin(forcedIdx) }
      else {
        await settleEntriesAfterSpin(winner_id); await Promise.all([fetchEntries(), fetchEvent(), fetchSpin()])

        await updateEventWinnerUserId(displayWinnerEntry.value?.user_id)
        await insertReceiptsForParticipants(participantsSnapshot)
        await ensureVoucherForWinner()
        await createWinnerPurchaseIfNeeded()
        await processRefunds()

        resolved.value=true; rpcWinnerId.value=null; busy.value.commit=false; spinStarted.value=false; revealWinner.value=true
      }
      await updateEventWinnerUserId(displayWinnerEntry.value?.user_id)
      openOutcomePopupIfMe()
    })
    .subscribe((s:any)=>{ if (s==='CLOSED'||s==='CHANNEL_ERROR') setTimeout(()=>makeRealtimeChannelSpin(),1000) })
}
function makeRealtimeChannelEvent(){
  if (!eventId) return
  if (realtimeChannelEvent){ try{ supabase.removeChannel(realtimeChannelEvent) }catch{}; realtimeChannelEvent=null }
  realtimeChannelEvent = supabase.channel(`ge-event-${eventId}`)
    .on('postgres_changes', { event:'*', schema:'games', table:'event', filter:`id=eq.${eventId}` }, ()=>scheduleRefresh(50))
    .subscribe((s:any)=>{ if (s==='CLOSED'||s==='CHANNEL_ERROR') setTimeout(()=>makeRealtimeChannelEvent(),1000) })
}
function startPoll(){ stopPoll(); pollHandle = window.setInterval(()=>fetchEntries(), POLL_MS) }
function stopPoll(){ if (pollHandle){ window.clearInterval(pollHandle); pollHandle=null } }
function onVisibilityChange(){ if (document.visibilityState==='visible') scheduleRefresh(0) }

/* Watches */
watch(entries, ()=>{ resolved.value = entries.value.some(e=>e.status==='winner') })
watch(()=>[revealWinner.value, displayWinnerEntry.value, myUserId.value] as const, async ()=>{
  await updateEventWinnerUserId(displayWinnerEntry.value?.user_id)
  await ensureVoucherForWinner()
  openOutcomePopupIfMe()
})
watch(()=>[allReady.value, eventInfo.value?.player_cap, resolved.value] as const, ([gateOk,,isResolved])=>{
  if (isResolved) return
  if (gateOk && !autoSpinStarted.value && !spinning.value && !spinStarted.value) startCountdownAndSpin()
})

/* Signed avatar helpers */
function isHttpUrl(v?:string|null){ return !!v && /^(https?:)?\/\//i.test(v) }
async function signAvatarPath(path:string):Promise<{url:string;exp:number}|null>{
  try{
    const { data, error } = await supabase.storage.from('user_profile').createSignedUrl(path, AVATAR_TTL_SEC)
    if (error || !data?.signedUrl) return null
    return { url: data.signedUrl, exp: Math.floor(Date.now()/1000)+AVATAR_TTL_SEC }
  }catch{ return null }
}
async function ensureUserMeta(userIds:string[]){
  const missing = userIds.filter(id => !userMeta.value[id])
  if (missing.length){
    const { data, error } = await supabase.from('users').select('id, full_name, profile_url').in('id', missing)
    if (!error && data){
      for (const row of data as any[]){
        let url = DEFAULT_AVATAR, exp = 0
        if (row?.profile_url){
          if (isHttpUrl(row.profile_url)) url = row.profile_url
          else { const signed = await signAvatarPath(row.profile_url); if (signed){ url = signed.url; exp = signed.exp } }
        }
        userMeta.value[row.id] = { id: row.id, full_name: row.full_name, profile_url: row.profile_url, avatar: url, signed_exp: exp }
      }
    }
  }
  await refreshExpiringAvatars(userIds)
}
async function refreshExpiringAvatars(userIds?:string[]){
  const now = Math.floor(Date.now()/1000)
  const ids = userIds ?? Object.keys(userMeta.value)
  for (const id of ids){
    const meta = userMeta.value[id]; if (!meta) continue
    if (!meta.profile_url || isHttpUrl(meta.profile_url)) continue
    if (!meta.signed_exp || meta.signed_exp - now <= REFRESH_AHEAD_SEC){
      const signed = await signAvatarPath(meta.profile_url)
      if (signed){ meta.avatar = signed.url; meta.signed_exp = signed.exp }
    }
  }
}
function displayName(uid:string){ return userMeta.value[uid]?.full_name || '' }
function avatarUrl(uid:string){ return userMeta.value[uid]?.avatar || DEFAULT_AVATAR }
async function onImgError(e:Event, uid:string){
  const el = e.target as HTMLImageElement
  const meta = userMeta.value[uid]
  if (!meta){ el.src = DEFAULT_AVATAR; return }
  if (meta.profile_url && !isHttpUrl(meta.profile_url)){
    const signed = await signAvatarPath(meta.profile_url)
    if (signed){ meta.avatar = signed.url; meta.signed_exp = signed.exp; el.src = signed.url; return }
  }
  el.src = DEFAULT_AVATAR
}
const DEFAULT_AVATAR='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><defs><linearGradient id="g" x1="0" y="0" x2="1" y2="1"><stop offset="0" stop-color="%2320647c"/><stop offset="1" stop-color="%2352e3b6"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="32" cy="26" r="12" fill="%23fff" fill-opacity="0.9"/><rect x="14" y="42" width="36" height="12" rx="6" fill="%23fff" fill-opacity="0.85"/></svg>'
function startAvatarRefreshTimer(){ stopAvatarRefreshTimer(); avatarRefreshTimer = window.setInterval(()=>refreshExpiringAvatars(), 300000) }
function stopAvatarRefreshTimer(){ if (avatarRefreshTimer){ clearInterval(avatarRefreshTimer); avatarRefreshTimer=null } }

/* Mount / unmount */
onMounted(async ()=>{
  await fetchMe()
  await Promise.all([fetchEntries(), fetchEvent(), fetchSpin()])
  makeRealtimeChannel(); makeRealtimeChannelSpin(); makeRealtimeChannelEvent()
  startPoll(); startAvatarRefreshTimer()
  document.addEventListener('visibilitychange', onVisibilityChange)
  if (canSpinGate.value) startCountdownAndSpin()
})
onBeforeUnmount(()=>{
  if (realtimeChannel){ try{ supabase.removeChannel(realtimeChannel) }catch{}; realtimeChannel=null }
  if (realtimeChannelSpin){ try{ supabase.removeChannel(realtimeChannelSpin) }catch{}; realtimeChannelSpin=null }
  if (realtimeChannelEvent){ try{ supabase.removeChannel(realtimeChannelEvent) }catch{}; realtimeChannelEvent=null }
  if (refreshTimer){ window.clearTimeout(refreshTimer); refreshTimer=null }
  if (countdownHandle){ clearInterval(countdownHandle); countdownHandle=null }
  stopPoll(); stopAvatarRefreshTimer()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

/* Winner/Loser action routing */
function handleOutcomeAction() {
  if (outcomeType.value === 'winner') {
    try { router.push({ name: 'user.winner' }); return } catch {}
    try { router.push('/winner'); return } catch {}
    router.push({ name: 'user.minigames' })
  } else {
    try { router.push({ name: 'user.loser' }); return } catch {}
    try { router.push('/loser'); return } catch {}
    router.push({ name: 'user.minigames' })
  }
}

/* Redirect helper (kept) */
function goToMinigames() {
  try {
    router.push({ name: 'user.minigames' })
  } catch {
    router.push('/app/mini-games')
  }
}
</script>

<style scoped>
/* ===== Global vibe to match mock ===== */
.hero-title{
  font-weight: 800; letter-spacing: .5px;
  font-size: clamp(32px, 5.4vw, 64px);
  color: #ffd43b; text-shadow: 0 6px 0 rgba(0,0,0,.25), 0 0 30px rgba(255,230,0,.25);
  margin-bottom: .35rem;
}
.promo-pill{
  display:inline-block; padding:.6rem 1rem; border-radius:12px;
  background: rgba(32,100,124,.18); color:#e7f6ff; border:1px solid rgba(255,255,255,.2);
  backdrop-filter: blur(4px);
}

/* ===== Main grid ===== */
.event-grid{
  display:grid; gap:18px;
  grid-template-columns: 280px minmax(340px, 1fr) 280px;
  align-items: start;
}
@media (max-width: 992px){
  .event-grid{ grid-template-columns: 1fr; }
}

/* ===== Left panel ===== */
.players-panel{ border:0; border-radius:18px; background: #0b2a3a; color:#e8fbff }
.players-panel .card-body{ padding:16px 16px; }
.panel-head .icon-ring{
  width:28px;height:28px;border-radius:50%;display:grid;place-items:center;
  background:#0fd2a0;color:#083143;font-weight:900
}
.players-list{ list-style:none; padding:0; margin:0; }
.player-row{
  display:flex; align-items:center; gap:10px; padding:10px 6px;
  border-radius:12px; transition: background .15s ease;
}
.player-row:hover{ background: rgba(255,255,255,.04); }
.avatar-wrap{ width:32px; height:32px; border-radius:50%; overflow:hidden; box-shadow:0 0 0 2px rgba(255,255,255,.8) }
.avatar{ width:100%; height:100%; object-fit:cover; display:block; }
.player-label{ display:flex; flex-direction:column; line-height:1.1; }
.player-label .index{ font-size:.8rem; color:#9bd2e6; }
.player-label .name{ font-weight:700; font-size:.95rem; }

/* ===== Center (wheel) ===== */
.center-stage{ display:flex; flex-direction:column; align-items:center; }
.wheel-stage{ position:relative; display:grid; place-items:center; margin-bottom: .25rem; }
.stage-glow{
  position:absolute; width:360px; height:360px; border-radius:50%;
  background: radial-gradient(ellipse at center, rgba(124,156,255,.25), rgba(82,227,182,.15) 40%, transparent 70%);
  filter: blur(14px); z-index:0;
}
.wheel-wrap{ position:relative; width:340px; aspect-ratio:1/1; padding:10px; border-radius:50%;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,.15), rgba(255,255,255,0) 60%),
              conic-gradient(from 0deg, rgba(255,255,255,.15), rgba(255,255,255,0) 50%, rgba(255,255,255,.15));
  box-shadow: 0 16px 40px rgba(0,0,0,.18), inset 0 2px 10px rgba(255,255,255,.2), inset 0 -6px 20px rgba(0,0,0,.15);
  z-index:1; transition: transform .25s ease;
}
.wheel-wrap.spinning{ transform: translateY(2px); }
.pointer{
  position:absolute; top:-14px; left:50%; transform: translateX(-50%);
  width:0; height:0; border-left:14px solid transparent; border-right:14px solid transparent; border-bottom:22px solid #ffc107;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,.25)); z-index:3; animation: pointerIdle 2s ease-in-out infinite;
}
.wheel-wrap.spinning .pointer{ animation: pointerWiggle .25s ease-in-out infinite; }
@keyframes pointerIdle{ 0%,100% { transform: translateX(-50%) translateY(0) } 50% { transform: translateX(-50%) translateY(1px) } }
@keyframes pointerWiggle{ 0%,100%{ transform: translateX(-50%) rotate(0) } 50% { transform: translateX(-50%) rotate(-2deg) } }

.wheel{ width:100%; height:100%; border-radius:50%; border:10px solid #222; position:relative; overflow:hidden;
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.15), 0 10px 24px rgba(0,0,0,.25);
}
.wheel-wrap.spinning .wheel{ filter: drop-shadow(0 0 18px rgba(124,156,255,.45)) contrast(1.05); }
.hub{ position:absolute; inset:50% auto auto 50%; transform: translate(-50%,-50%); width:70px;height:70px;border-radius:50%;
  background: radial-gradient(circle at 30% 30%, #fff, #e9eefc 40%, #b8c7ff 60%, #8396ff);
  box-shadow: inset 0 2px 8px rgba(0,0,0,.15), 0 6px 14px rgba(0,0,0,.25); z-index:2;
}
.hub-dot{ position:absolute; inset:50% auto auto 50%; transform: translate(-50%,-50%); width:10px;height:10px;border-radius:50%; background:#222; z-index:3; }

/* labels */
.slice-label{ position:absolute; left:50%; top:50%; transform-origin:0 0; font-size:13px; font-weight:900; letter-spacing:.2px; white-space:nowrap; pointer-events:none; }
.slice-label .label-text{ display:inline-block; max-width:120px; text-overflow:ellipsis; overflow:hidden; vertical-align:middle; }
@media (max-width:420px){ .slice-label{ font-size:12px } .slice-label .label-text{ max-width:96px } }

/* spin overlay & controls */
.spin-overlay{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; font-weight:700; color:#111; text-shadow:0 1px 0 rgba(255,255,255,.6); }
.pulse-dot{ width:14px;height:14px;border-radius:50%;background:#198754; animation:pulse 1s infinite ease-in-out; }
@keyframes pulse{ 0%{ transform:scale(1); opacity:.7 } 50%{ transform:scale(1.6); opacity:1 } 100%{ transform:scale(1); opacity:.7 } }

.btn-arcade{ border-radius:999px; padding:.6rem 1.1rem;
  box-shadow: 0 8px 18px rgba(82,227,182,.25), inset 0 1px 0 rgba(255,255,255,.6);
  transform: translateY(0); transition: transform .08s ease, box-shadow .2s ease, filter .2s ease;
}
.btn-arcade:hover{ box-shadow: 0 10px 24px rgba(124,156,255,.35), inset 0 1px 0 rgba(255,255,255,.7); filter:saturate(1.08) }
.btn-arcade:active{ transform: translateY(1px) scale(.99) }
.countdown-badge{ animation: popIn .25s ease, breathe 1.6s ease-in-out infinite .25s; }
@keyframes popIn{ from{ transform:scale(.9); opacity:.5 } to{ transform:scale(1); opacity:1 } }
@keyframes breathe{ 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.03) } }

/* ===== Right prize panel ===== */
.prize-panel{ border:0; border-radius:18px; background:#0b2a3a; color:#c9f6ff }
.prize-panel .card-body{ padding:18px }
.prize-title{
  color:#36e3b3; font-weight:800; letter-spacing:.5px; font-size: clamp(18px, 3vw, 32px);
  text-transform: uppercase; margin-bottom: 16px;
}
.price-card{
  border-radius:14px; padding:14px 16px; margin-bottom:12px; color:#1c0d33; font-weight:800;
  box-shadow:0 10px 22px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.35);
}
.price-card .label{ font-size:.85rem; letter-spacing:.3px; opacity:.9 }
.price-card .amount{ font-size: clamp(18px, 3.2vw, 36px) }
.price-card.entry{ background:#ffc5c5 }
.price-card.buy{ background:#cdd1ff }

/* ===== CTA buttons (kept styles) ===== */
.cta-row .btn{
  min-width:180px; font-weight:800; letter-spacing:.4px; padding:.7rem 1.2rem; border-radius:14px; text-transform:uppercase;
  box-shadow: 0 10px 24px rgba(0,0,0,.18);
}
.cta-join{ background:#0fd2a0; color:#083143; }
.cta-help{ background:#2cd3ff; color:#083143; }

/* ===== Existing helper styles kept ===== */
.joined-summary .badge{ font-weight:700; letter-spacing:.2px }

/* Confetti (kept) */
.confetti-wrap{ pointer-events:none; position:fixed; inset:0; overflow:hidden; z-index:50 }
.confetti-piece{ position:absolute; top:-10vh; left:50%; width:8px; height:14px; background:#7c9cff; opacity:.9; transform:translateX(-50%) rotate(0deg); animation: fall 2.8s linear forwards, sway 1s ease-in-out infinite; border-radius:2px }
.confetti-piece:nth-child(3n){ background:#52e3b6 }
.confetti-piece:nth-child(5n){ background:#ffc107; width:6px; height:10px }
.confetti-piece:nth-child(7n){ background:#ff7ab6 }
.confetti-piece:nth-child(n){ left:10%; animation-delay:0s }
.confetti-piece:nth-child(2n){ left:25%; animation-delay:.1s }
.confetti-piece:nth-child(3n){ left:40%; animation-delay:.15s }
.confetti-piece:nth-child(4n){ left:55%; animation-delay:.2s }
.confetti-piece:nth-child(5n){ left:70%; animation-delay:.25s }
.confetti-piece:nth-child(6n){ left:85%; animation-delay:.3s }
@keyframes fall{ to{ transform: translateY(110vh) rotate(540deg); opacity:1 } }
@keyframes sway{ 0%,100%{ margin-left:-6px } 50%{ margin-left:6px } }

/* ===== Popup styles ===== */
.outcome-backdrop{
  position: fixed; inset: 0; z-index: 60;
  background: rgba(6, 10, 24, 0.65);
  backdrop-filter: blur(4px);
  display: grid; place-items: center;
  animation: fadeIn .18s ease;
}
@keyframes fadeIn { from { opacity: .6 } to { opacity: 1 } }

.outcome-modal{
  width: min(520px, 92vw);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,.12);
  overflow: hidden;
  position: relative;
  background: radial-gradient(120% 120% at 30% 10%, rgba(124,156,255,.18), transparent 50%),
              radial-gradient(120% 120% at 80% 90%, rgba(82,227,182,.18), transparent 50%),
              #0e1430;
  box-shadow: 0 20px 60px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.04);
  transform: translateY(6px) scale(.98);
  animation: popInModal .22s ease forwards;
}
@keyframes popInModal {
  to { transform: translateY(0) scale(1); }
}
.outcome-winner { box-shadow: 0 24px 70px rgba(80, 227, 182, .35); }
.outcome-loser  { box-shadow: 0 24px 70px rgba(124, 156, 255, .28); }

.pop-title{
  font-weight: 900; letter-spacing: .4px;
  font-size: clamp(22px, 4vw, 32px);
  color: #fff;
  text-shadow: 0 2px 10px rgba(0,0,0,.35);
}

.pop-btn{
  border-radius: 12px; font-weight: 800; letter-spacing: .4px;
  text-transform: uppercase;
  box-shadow: 0 12px 26px rgba(0,0,0,.25);
}
.btn-winner{ background:#0fd2a0; color:#0a2a26; }
.btn-loser { background:#7c9cff; color:#0b1630; }

.pop-close{
  position:absolute; top:10px; right:12px;
  background:transparent; border:0; color:#cfe3ff; cursor:pointer; font-size:18px;
}

/* subtle sparkles */
.sparkle-1, .sparkle-2{
  position:absolute; inset:auto;
  width:160px; height:160px; filter: blur(28px); opacity:.35; z-index:0;
  border-radius: 50%;
}
.sparkle-1{ left:-40px; top:-40px; background:#7c9cff; }
.sparkle-2{ right:-40px; bottom:-40px; background:#52e3b6; }
</style>
