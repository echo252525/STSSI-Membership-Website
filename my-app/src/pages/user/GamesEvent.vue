<template>
  <div class="game-event container py-4">
    <h3 class="fw-bold mb-3 title-glow">
      🎡 Event <small class="text-muted">#{{ shortId(eventId) }}</small>
    </h3>

    <!-- 🆕 Winner Hero -->
    <div v-if="revealWinner && displayWinnerEntry" class="winner-hero alert alert-success mb-3 p-4 text-center">
      <div class="fs-4 mb-1">🎉 Winner</div>
      <div class="fw-bold fs-3">
        <code>{{ maskUser(displayWinnerEntry.user_id) }}</code>
      </div>
    </div>

    <!-- Spin button -->
    <div class="mb-3 d-flex align-items-center gap-3">
      <button
        class="btn btn-primary btn-arcade"
        :disabled="!canSpinGate || spinning || busy.commit"  
        @click="startCountdownAndSpin()"
      >
        <span v-if="spinning" class="spinner-border spinner-border-sm me-2"></span>
        {{ resolved ? 'Resolved' : 'Spin the Wheel' }}
      </button>

      <!-- countdown badge -->
      <span v-if="countdown !== null" class="badge bg-warning text-dark fs-6 countdown-badge">
        Spinning in {{ countdown }}…
      </span>
    </div>

    <!-- Wheel -->
    <div class="wheel-stage">
      <div class="stage-glow"></div>
      <div class="wheel-wrap mx-auto mb-4" :class="{ spinning }">
        <div class="pointer"></div>
        <div class="wheel" :style="wheelStyle" @transitionend="onSpinEnd">
          <div class="hub"></div>
          <div class="hub-dot"></div>

          <!-- ✅ Player names on slices -->
          <template v-for="(p, i) in spinEntries" :key="p.id">
            <div
              class="slice-label"
              :style="[labelStyle(i), sliceLabelStyle(i)]"
              :title="maskUser(p.user_id)"
            >
              <span class="label-text">{{ maskUser(p.user_id) }}</span>
            </div>
          </template>
        </div>

        <!-- overlay while spinning -->
        <div v-if="spinning" class="spin-overlay">
          <div class="pulse-dot"></div>
          <div class="mt-2 fw-semibold">Spinning…</div>
        </div>
      </div>
    </div>

    <!-- Side Rosters (even split) -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-6">
        <div class="card h-100 shadow-sm float-card">
          <div class="card-body">
            <h6 class="card-title mb-2">Players (Left)</h6>
            <ul class="mb-0 small">
              <li v-for="e in leftSideEntries" :key="e.id" class="roster-item">
                <code>{{ maskUser(e.user_id) }}</code>
                <span class="text-muted"> – </span>
                <strong>{{ e.status }}</strong>
              </li>
              <li v-if="leftSideEntries.length === 0" class="text-muted">No players</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="card h-100 shadow-sm float-card">
          <div class="card-body">
            <h6 class="card-title mb-2">Players (Right)</h6>
            <ul class="mb-0 small">
              <li v-for="e in rightSideEntries" :key="e.id" class="roster-item">
                <code>{{ maskUser(e.user_id) }}</code>
                <span class="text-muted"> – </span>
                <strong>{{ e.status }}</strong>
              </li>
              <li v-if="rightSideEntries.length === 0" class="text-muted">No players</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Joined Tracker (kept) -->
    <div class="mb-4">
      <h5 class="mb-2">Joined Tracker</h5>
      <div class="joined-summary d-flex flex-wrap align-items-center gap-2">
        <span class="badge bg-success">Joined · <strong>{{ joinedEntries.length }}</strong></span>
        <span class="badge bg-secondary">Total · <strong>{{ entries.length }}</strong></span>
        <span v-if="eventInfo?.player_cap" class="badge bg-info">
          Cap · <strong>{{ eventInfo.player_cap }}</strong>
        </span>
      </div>
      <ul class="joined-feed mt-2">
        <li v-for="(j, idx) in joinFeed" :key="idx" class="feed-item">
          <small>
            <code>{{ maskUser(j.user_id) }}</code>
            <span class="text-muted"> {{ j.type }} </span>
            <time :datetime="j.at.toISOString()">· {{ fmtTime(j.at) }}</time>
          </small>
        </li>
        <li v-if="joinFeed.length === 0" class="text-muted"><small>No join activity yet.</small></li>
      </ul>
    </div>

    <!-- Participants (HIDDEN, not removed) -->
    <div class="participants-section" aria-hidden="true">
      <h5>Participants</h5>
      <ul>
        <li v-for="e in entries" :key="e.id">
          <code>{{ maskUser(e.user_id) }}</code> – <strong>{{ e.status }}</strong>
        </li>
      </ul>
    </div>

    <!-- Bottom winner alert (gated) -->
    <div v-if="revealWinner && winnerEntry" class="alert alert-success mt-3">
      Winner: <code>{{ maskUser(winnerEntry.user_id) }}</code>
    </div>

    <div v-if="err" class="text-danger mt-3">{{ err }}</div>

    <!-- Confetti overlay on reveal -->
    <div v-if="revealWinner" class="confetti-wrap" aria-hidden="true">
      <span v-for="n in 30" :key="n" class="confetti-piece"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const route = useRoute()
const eventId = route.query.eventId as string

type EntryRow = {
  id: string
  event_id: string
  user_id: string
  status: string
}

const entries = ref<EntryRow[]>([])
const busy = ref({ load: false, commit: false })
const spinning = ref(false)
const resolved = ref(false)
const err = ref('')
const rotateDeg = ref(0)
const spinDurationMs = ref(5200)
const targetIndex = ref<number | null>(null)
const winnerEntry = ref<EntryRow | null>(null)

/* Winner reveal gate */
const revealWinner = ref(false)

const eventInfo = ref<{ id: string; player_cap: number; status: string } | null>(null)
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
const readyEntries  = computed(() => entries.value.filter(e => e.status === 'ready'))
const spinEntries   = computed(() => readyEntries.value.length > 0 ? readyEntries.value : joinedEntries.value)
const anyWinner = computed(() => entries.value.some(e => e.status === 'winner'))

const allReady = computed(() =>
  spinEntries.value.length >= 2 &&
  spinEntries.value.every(e => e.status === 'ready')
)
const canSpinGate = computed(() => allReady.value && !anyWinner.value)

const leftSideEntries = computed(() => {
  const mid = Math.ceil(entries.value.length / 2)
  return entries.value.slice(0, mid)
})
const rightSideEntries = computed(() => {
  const mid = Math.ceil(entries.value.length / 2)
  return entries.value.slice(mid)
})

/* Winner hero resolver */
const displayWinnerEntry = computed<EntryRow | null>(() => {
  if (winnerEntry.value) return winnerEntry.value
  const wid = spinInfo.value?.winner_entry_id
  if (!wid) return null
  return entries.value.find(e => e.id === wid) || null
})

function shortId(id?: string) {
  return id ? id.slice(0, 4) + '…' + id.slice(-4) : '—'
}
function maskUser(id: string) {
  return id.slice(0, 4) + '…' + id.slice(-4)
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function pushJoinFeed(item: JoinFeedItem) {
  joinFeed.value.unshift(item)
  if (joinFeed.value.length > FEED_LIMIT) joinFeed.value.length = FEED_LIMIT
}

/* 🎨 Per-player color palette (stable by index) */
function sliceColor(i: number, n: number) {
  // Distribute hues evenly; use strong saturation for game feel
  const hue = Math.round((360 * i) / Math.max(1, n))
  return `hsl(${hue} 78% 55%)`
}

/* Wheel style using per-slice colors */
const wheelStyle = computed(() => {
  const n = Math.max(1, spinEntries.value.length)
  const stops: string[] = []
  for (let i = 0; i < n; i++) {
    const a0 = (360 / n) * i
    const a1 = (360 / n) * (i + 1)
    const color = sliceColor(i, n)             // 👈 unique color per player
    stops.push(`${color} ${a0}deg ${a1}deg`)
  }
  return {
    background: `conic-gradient(${stops.join(',')})`,
    transform: `rotate(${rotateDeg.value}deg)`,
    transition: spinning.value
      ? `transform ${spinDurationMs.value / 1000}s cubic-bezier(.08,.55,.24,1)`
      : 'none'
  }
})

/* Label placement on the wheel (keep upright, near rim) */
function labelStyle(i: number) {
  const n = Math.max(1, spinEntries.value.length)
  const mid = (360 / n) * (i + 0.5)
  // Translate farther to sit closer to outer rim; keep text upright
  return { transform: `rotate(${mid}deg) translate(0, -46%) rotate(${-mid}deg)` }
}

/* Label visual style: ensure contrast on any colored slice */
function sliceLabelStyle(i: number) {
  const n = Math.max(1, spinEntries.value.length)
  const bg = 'transparent' // no pill to keep it clean on slices
  return {
    color: '#fff',
    textShadow: '0 1px 2px rgba(0,0,0,.6), 0 0 4px rgba(0,0,0,.25)',
    background: bg,
  }
}

/* Data fetch */
async function fetchEntries() {
  if (!eventId) return
  const { data, error } = await supabase
    .schema('games')
    .from('entry')
    .select('id, event_id, user_id, status')
    .eq('event_id', eventId)
  if (error) {
    err.value = error.message
    return
  }
  const prev = entries.value
  entries.value = (data || []) as EntryRow[]
  resolved.value = entries.value.some(e => e.status === 'winner')

  if (prev.length === 0 && entries.value.length > 0) {
    entries.value
      .filter(e => e.status === 'joined')
      .slice(0, FEED_LIMIT)
      .forEach(e => pushJoinFeed({ user_id: e.user_id, at: new Date(), type: 'existing' }))
  }

  if (!spinning.value && resolved.value) {
    revealWinner.value = true
  }
}

async function fetchEvent() {
  if (!eventId) return
  const { data, error } = await supabase
    .schema('games')
    .from('event')
    .select('id, player_cap, status')
    .eq('id', eventId)
    .single()
  if (error) {
    err.value = error.message
    return
  }
  eventInfo.value = data as any
}

async function fetchSpin() {
  if (!eventId) return
  const { data, error } = await supabase
    .schema('games')
    .from('spin')
    .select('event_id, winner_entry_id')
    .eq('event_id', eventId)
    .maybeSingle()
  if (!error && data) {
    spinInfo.value = data as any
    if (!spinning.value) revealWinner.value = true
  }
}

/* Spin logic */
async function startSpin(forcedIndex: number) {
  targetIndex.value = forcedIndex
  const slice = 360 / spinEntries.value.length
  const targetAngle = slice * (targetIndex.value + 0.5)
  const spins = 12
  rotateDeg.value = 360 * spins + (360 - targetAngle)
  spinning.value = true
}

async function settleEntriesAfterSpin(winnerId: string) {
  try {
    await supabase.schema('games').from('entry').update({ status: 'winner' }).eq('id', winnerId)
    await supabase
      .schema('games')
      .from('entry')
      .update({ status: 'refunded' })
      .eq('event_id', eventId)
      .neq('id', winnerId)
      .in('status', ['joined', 'ready'])
  } catch (e: any) {
    err.value = e.message || 'Failed to settle entries'
  }
}

async function onSpinEnd() {
  if (!spinning.value) return
  spinning.value = false

  if (rpcWinnerId.value) {
    const idx = participantsSnapshot.findIndex(e => e.id === rpcWinnerId.value)
    if (idx >= 0) winnerEntry.value = participantsSnapshot[idx]
    await settleEntriesAfterSpin(rpcWinnerId.value)
    await Promise.all([fetchEntries(), fetchEvent(), fetchSpin()])
    resolved.value = true
    rpcWinnerId.value = null
  }

  busy.value.commit = false
  spinStarted.value = false
  revealWinner.value = true
}

async function triggerServerSpinAndAnimate() {
  if (!eventId || !canSpinGate.value || resolved.value || spinStarted.value) return

  participantsSnapshot = spinEntries.value.slice()
  spinStarted.value = true

  try {
    busy.value.commit = true
    revealWinner.value = false

    const { data, error } = await supabase.rpc('rpc_spin_event', { _event_id: eventId, _seed: null })
    if (error) {
      err.value = error.message
      busy.value.commit = false
      spinStarted.value = false
      return
    }

    const spinRow = Array.isArray(data) ? data[0] : data
    const winner_id: string | undefined = spinRow?.winner_entry_id
    if (!winner_id) {
      err.value = 'RPC did not return winner_entry_id'
      busy.value.commit = false
      spinStarted.value = false
      return
    }

    rpcWinnerId.value = winner_id
    let forcedIdx = participantsSnapshot.findIndex(e => e.id === winner_id)
    if (forcedIdx < 0) {
      await fetchEntries()
      participantsSnapshot = spinEntries.value.slice()
      forcedIdx = participantsSnapshot.findIndex(e => e.id === winner_id)
    }

    if (forcedIdx < 0) {
      await settleEntriesAfterSpin(winner_id)
      await Promise.all([fetchEntries(), fetchEvent(), fetchSpin()])
      resolved.value = true
      busy.value.commit = false
      spinStarted.value = false
      revealWinner.value = true
      return
    }

    await startSpin(forcedIdx)
  } catch (e: any) {
    err.value = e.message
    busy.value.commit = false
    spinStarted.value = false
  }
}

function actuallyStartCountdown() {
  autoSpinStarted.value = true
  countdown.value = 3
  if (countdownHandle) {
    clearInterval(countdownHandle)
    countdownHandle = null
  }
  countdownHandle = window.setInterval(async () => {
    if ((countdown.value as number) > 1) {
      countdown.value = (countdown.value as number) - 1
    } else {
      clearInterval(countdownHandle!)
      countdownHandle = null
      countdown.value = null
      await triggerServerSpinAndAnimate()
    }
  }, 1000)
}

function startCountdownAndSpin() {
  if (autoSpinStarted.value || resolved.value || spinning.value || spinStarted.value) return

  Promise.all([fetchEntries()]).then(() => {
    if (!canSpinGate.value) {
      const stop = watch(allReady, (ok) => {
        if (ok && !autoSpinStarted.value && !resolved.value && !spinning.value && !spinStarted.value) {
          stop()
          actuallyStartCountdown()
        }
      }, { immediate: false })
      return
    }
    actuallyStartCountdown()
  })
}

/* Realtime (entries + spin + event) */
let realtimeChannel: any | null = null
let realtimeChannelSpin: any | null = null
let realtimeChannelEvent: any | null = null
let refreshTimer: number | null = null
const POLL_MS = 10_000
let pollHandle: number | null = null

function scheduleRefresh(delayMs = 250) {
  if (refreshTimer) {
    window.clearTimeout(refreshTimer)
  }
  refreshTimer = window.setTimeout(async () => {
    refreshTimer = null
    await Promise.all([fetchEntries(), fetchSpin(), fetchEvent()])
  }, delayMs)
}

function makeRealtimeChannel() {
  if (!eventId) return

  if (realtimeChannel) {
    try { supabase.removeChannel(realtimeChannel) } catch {}
    realtimeChannel = null
  }

  realtimeChannel = supabase
    .channel(`ge-entry-${eventId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: 'games-event' },
      },
    })
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'entry', filter: `event_id=eq.${eventId}` },
      (payload: any) => {
        try {
          const { eventType, new: newRow, old: oldRow } = payload
          if (eventType === 'INSERT' && newRow?.status === 'joined') {
            pushJoinFeed({ user_id: newRow.user_id, at: new Date(), type: 'joined' })
          } else if (eventType === 'UPDATE') {
            const becameJoined = oldRow?.status !== 'joined' && newRow?.status === 'joined'
            if (becameJoined) {
              pushJoinFeed({ user_id: newRow.user_id, at: new Date(), type: 'rejoined' })
            }
          }
        } catch {}
        scheduleRefresh(150)
      },
    )
    .subscribe((status: any) => {
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setTimeout(() => makeRealtimeChannel(), 1000)
      }
    })
}

function makeRealtimeChannelSpin() {
  if (!eventId) return
  if (realtimeChannelSpin) {
    try { supabase.removeChannel(realtimeChannelSpin) } catch {}
    realtimeChannelSpin = null
  }

  realtimeChannelSpin = supabase
    .channel(`ge-spin-${eventId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'spin', filter: `event_id=eq.${eventId}` },
      async (payload: any) => {
        const winner_id = payload?.new?.winner_entry_id
        if (!winner_id) return

        if (spinStarted.value || spinning.value) return

        participantsSnapshot = spinEntries.value.slice()
        rpcWinnerId.value = winner_id
        spinStarted.value = true
        revealWinner.value = false

        let forcedIdx = participantsSnapshot.findIndex(e => e.id === winner_id)
        if (forcedIdx < 0) {
          await fetchEntries()
          participantsSnapshot = spinEntries.value.slice()
          forcedIdx = participantsSnapshot.findIndex(e => e.id === winner_id)
        }

        if (forcedIdx >= 0) {
          await startSpin(forcedIdx)
        } else {
          await settleEntriesAfterSpin(winner_id)
          await Promise.all([fetchEntries(), fetchEvent(), fetchSpin()])
          resolved.value = true
          rpcWinnerId.value = null
          busy.value.commit = false
          spinStarted.value = false
          revealWinner.value = true
        }
      }
    )
    .subscribe((status: any) => {
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setTimeout(() => makeRealtimeChannelSpin(), 1000)
      }
    })
}

function makeRealtimeChannelEvent() {
  if (!eventId) return
  if (realtimeChannelEvent) {
    try { supabase.removeChannel(realtimeChannelEvent) } catch {}
    realtimeChannelEvent = null
  }

  realtimeChannelEvent = supabase
    .channel(`ge-event-${eventId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'event', filter: `id=eq.${eventId}` },
      () => scheduleRefresh(50)
    )
    .subscribe((status: any) => {
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setTimeout(() => makeRealtimeChannelEvent(), 1000)
      }
    })
}

function startPoll() {
  stopPoll()
  pollHandle = window.setInterval(() => fetchEntries(), POLL_MS)
}
function stopPoll() {
  if (pollHandle) {
    window.clearInterval(pollHandle)
    pollHandle = null
  }
}
function onVisibilityChange() {
  if (document.visibilityState === 'visible') scheduleRefresh(0)
}

/* Keep resolved up to date */
watch(entries, () => {
  resolved.value = entries.value.some(e => e.status === 'winner')
})

watch(
  () => [allReady.value, eventInfo.value?.player_cap, resolved.value] as const,
  ([gateOk, cap, isResolved]) => {
    if (isResolved) return
    if (gateOk && !autoSpinStarted.value && !spinning.value && !spinStarted.value) {
      startCountdownAndSpin()
    }
  }
)

onMounted(async () => {
  await Promise.all([fetchEntries(), fetchEvent(), fetchSpin()])
  makeRealtimeChannel()
  makeRealtimeChannelSpin()
  makeRealtimeChannelEvent()
  startPoll()
  document.addEventListener('visibilitychange', onVisibilityChange)
  if (canSpinGate.value) startCountdownAndSpin()
})
onBeforeUnmount(() => {
  if (realtimeChannel) { try { supabase.removeChannel(realtimeChannel) } catch {} ; realtimeChannel = null }
  if (realtimeChannelSpin) { try { supabase.removeChannel(realtimeChannelSpin) } catch {} ; realtimeChannelSpin = null }
  if (realtimeChannelEvent) { try { supabase.removeChannel(realtimeChannelEvent) } catch {} ; realtimeChannelEvent = null }
  if (refreshTimer) { window.clearTimeout(refreshTimer); refreshTimer = null }
  if (countdownHandle) { clearInterval(countdownHandle); countdownHandle = null }
  stopPoll()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style scoped>
/* --- AESTHETIC LAYER ----------------------------------------------------- */
.title-glow { text-shadow: 0 2px 14px rgba(124,156,255,.35); }
.wheel-stage { position: relative; display: grid; place-items: center; margin-bottom: 0.75rem; }
.stage-glow {
  position: absolute; width: 360px; height: 360px; border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(124,156,255,.25), rgba(82,227,182,.15) 40%, transparent 70%);
  filter: blur(14px); z-index: 0;
}

/* --- WHEEL + POINTER ----------------------------------------------------- */
.wheel-wrap {
  position: relative; width: 340px; aspect-ratio: 1/1; padding: 10px; border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, rgba(255,255,255,.15), rgba(255,255,255,0) 60%),
    conic-gradient(from 0deg, rgba(255,255,255,.15), rgba(255,255,255,0) 50%, rgba(255,255,255,.15));
  box-shadow: 0 16px 40px rgba(0,0,0,.18), inset 0 2px 10px rgba(255,255,255,.2), inset 0 -6px 20px rgba(0,0,0,.15);
  z-index: 1; transition: transform .25s ease;
}
.wheel-wrap.spinning { transform: translateY(2px); }
.pointer {
  position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
  width: 0; height: 0; border-left: 14px solid transparent; border-right: 14px solid transparent; border-bottom: 22px solid #ffc107;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,.25)); z-index: 3; animation: pointerIdle 2s ease-in-out infinite;
}
.wheel-wrap.spinning .pointer { animation: pointerWiggle .25s ease-in-out infinite; }
@keyframes pointerIdle { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(1px); } }
@keyframes pointerWiggle { 0%,100% { transform: translateX(-50%) rotate(0deg); } 50% { transform: translateX(-50%) rotate(-2deg); } }

.wheel {
  width: 100%; height: 100%; border-radius: 50%; border: 10px solid #222; position: relative; overflow: hidden;
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.15), 0 10px 24px rgba(0,0,0,.25);
}
.wheel-wrap.spinning .wheel { filter: drop-shadow(0 0 18px rgba(124,156,255,.45)) contrast(1.05); }

.hub {
  position: absolute; inset: 50% auto auto 50%; transform: translate(-50%,-50%);
  width: 70px; height: 70px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fff, #e9eefc 40%, #b8c7ff 60%, #8396ff);
  box-shadow: inset 0 2px 8px rgba(0,0,0,.15), 0 6px 14px rgba(0,0,0,.25); z-index: 2;
}
.hub-dot { position: absolute; inset: 50% auto auto 50%; transform: translate(-50%,-50%); width: 10px; height: 10px; border-radius: 50%; background: #222; z-index: 3; }

/* --- LABELS ON SLICES ---------------------------------------------------- */
.slice-label {
  position: absolute; left: 50%; top: 50%; transform-origin: 0 0;
  font-size: 13px; font-weight: 900; letter-spacing: .2px; white-space: nowrap; pointer-events: none;
}
.slice-label .label-text {
  display: inline-block; max-width: 120px; text-overflow: ellipsis; overflow: hidden; vertical-align: middle;
}
@media (max-width: 420px) {
  .slice-label { font-size: 12px; }
  .slice-label .label-text { max-width: 96px; }
}

/* Spinning overlay */
.spin-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; font-weight: 700; color: #111; text-shadow: 0 1px 0 rgba(255,255,255,.6); }
.pulse-dot { width: 14px; height: 14px; border-radius: 50%; background: #198754; animation: pulse 1s infinite ease-in-out; }
@keyframes pulse { 0% { transform: scale(1); opacity: .7; } 50% { transform: scale(1.6); opacity: 1; } 100% { transform: scale(1); opacity: .7; } }

/* Button juice */
.btn-arcade { border-radius: 999px; padding: .6rem 1.1rem; box-shadow: 0 8px 18px rgba(82,227,182,.25), inset 0 1px 0 rgba(255,255,255,.6); transform: translateY(0); transition: transform .08s ease, box-shadow .2s ease, filter .2s ease; }
.btn-arcade:hover { box-shadow: 0 10px 24px rgba(124,156,255,.35), inset 0 1px 0 rgba(255,255,255,.7); filter: saturate(1.08); }
.btn-arcade:active { transform: translateY(1px) scale(.99); }

/* Countdown anim */
.countdown-badge { animation: popIn .25s ease, breathe 1.6s ease-in-out infinite .25s; }
@keyframes popIn { from { transform: scale(.9); opacity: .5; } to { transform: scale(1); opacity: 1; } }
@keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }

/* Cards float */
.float-card { animation: floaty 6s ease-in-out infinite; }
.float-card:nth-child(2) { animation-delay: 1.5s; }
@keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.roster-item { transition: transform .12s ease; }
.roster-item:hover { transform: translateX(2px); }

/* Winner hero */
.winner-hero { border-left: 6px solid #198754; border-right: 6px solid #198754; border-radius: 16px; animation: winnerPop .28s ease; }
@keyframes winnerPop { from { transform: scale(.98); opacity: .6; } to   { transform: scale(1); opacity: 1; } }

/* Joined tracker styles */
.joined-summary .badge { font-weight: 700; letter-spacing: .2px; }
.joined-feed { list-style: none; padding-left: 0; margin: 0; }
.joined-feed li { padding: 6px 0; border-bottom: 1px dashed rgba(0,0,0,.06); }
.joined-feed li:last-child { border-bottom: 0; }
.feed-item { animation: feedSlide .25s ease; }
@keyframes feedSlide { from { transform: translateY(2px); opacity: .6; } to { transform: translateY(0); opacity: 1; } }

/* Hide Participants display (not removed) */
.participants-section { display: none !important; }

/* Confetti */
.confetti-wrap { pointer-events: none; position: fixed; inset: 0; overflow: hidden; z-index: 50; }
.confetti-piece {
  position: absolute; top: -10vh; left: 50%; width: 8px; height: 14px; background: #7c9cff; opacity: .9;
  transform: translateX(-50%) rotate(0deg);
  animation: fall 2.8s linear forwards, sway 1s ease-in-out infinite; border-radius: 2px;
}
.confetti-piece:nth-child(3n) { background: #52e3b6; }
.confetti-piece:nth-child(5n) { background: #ffc107; width: 6px; height: 10px; }
.confetti-piece:nth-child(7n) { background: #ff7ab6; }
.confetti-piece:nth-child(n)   { left: 10%; animation-delay: .0s; }
.confetti-piece:nth-child(2n)  { left: 25%; animation-delay: .1s; }
.confetti-piece:nth-child(3n)  { left: 40%; animation-delay: .15s; }
.confetti-piece:nth-child(4n)  { left: 55%; animation-delay: .2s; }
.confetti-piece:nth-child(5n)  { left: 70%; animation-delay: .25s; }
.confetti-piece:nth-child(6n)  { left: 85%; animation-delay: .3s; }
@keyframes fall { to { transform: translateY(110vh) rotate(540deg); opacity: 1; } }
@keyframes sway { 0%,100% { margin-left: -6px; } 50% { margin-left: 6px; } }
</style>
