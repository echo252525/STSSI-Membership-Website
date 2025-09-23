<template>
  <div class="game-event container py-4">
    <h3 class="fw-bold mb-3">
      🎡 Event <small class="text-muted">#{{ shortId(eventId) }}</small>
    </h3>

    <!-- Spin button -->
    <div class="mb-3">
      <button
        class="btn btn-primary"
        :disabled="!canSpin || spinning || busy.commit"
        @click="startSpin"
      >
        <span v-if="spinning" class="spinner-border spinner-border-sm me-2"></span>
        {{ resolved ? 'Resolved' : 'Spin the Wheel' }}
      </button>
    </div>

    <!-- Wheel -->
    <div class="wheel-wrap mx-auto mb-4">
      <div class="pointer"></div>
      <div class="wheel" :style="wheelStyle" @transitionend="onSpinEnd">
        <template v-for="(p, i) in joinedEntries" :key="p.id">
          <div class="slice-label" :style="labelStyle(i)">
            {{ maskUser(p.user_id) }}
          </div>
        </template>
      </div>
    </div>

    <!-- ✅ Joined Tracker (added) -->
    <div class="mb-4">
      <h5 class="mb-2">Joined Tracker</h5>
      <div class="joined-summary d-flex flex-wrap align-items-center gap-2">
        <span class="badge bg-success">Joined · <strong>{{ joinedEntries.length }}</strong></span>
        <span class="badge bg-secondary">Total · <strong>{{ entries.length }}</strong></span>
      </div>
      <ul class="joined-feed mt-2">
        <li v-for="(j, idx) in joinFeed" :key="idx">
          <small>
            <code>{{ maskUser(j.user_id) }}</code>
            <span class="text-muted"> {{ j.type }} </span>
            <time :datetime="j.at.toISOString()">· {{ fmtTime(j.at) }}</time>
          </small>
        </li>
        <li v-if="joinFeed.length === 0" class="text-muted"><small>No join activity yet.</small></li>
      </ul>
    </div>

    <!-- Participants -->
    <h5>Participants</h5>
    <ul>
      <li v-for="e in entries" :key="e.id">
        <code>{{ maskUser(e.user_id) }}</code> – <strong>{{ e.status }}</strong>
      </li>
    </ul>

    <div v-if="winnerEntry" class="alert alert-success mt-3">
      Winner: <code>{{ maskUser(winnerEntry.user_id) }}</code>
    </div>

    <div v-if="err" class="text-danger mt-3">{{ err }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue' // ⬅️ added onBeforeUnmount, watch
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
const targetIndex = ref<number | null>(null)
const winnerEntry = ref<EntryRow | null>(null)

/* ─────────── ✅ Joined feed state (added) ─────────── */
type JoinFeedItem = { user_id: string; at: Date; type: 'joined' | 'rejoined' | 'existing' }
const joinFeed = ref<JoinFeedItem[]>([])
const FEED_LIMIT = 20

/* ─────────── Derived ─────────── */
const joinedEntries = computed(() => entries.value.filter(e => e.status === 'joined'))
const anyWinner = computed(() => entries.value.some(e => e.status === 'winner'))
const canSpin = computed(() => joinedEntries.value.length >= 2 && !anyWinner.value)

/* ─────────── Utils ─────────── */
function shortId(id?: string) {
  return id ? id.slice(0, 4) + '…' + id.slice(-4) : '—'
}
function maskUser(id: string) {
  return id.slice(0, 4) + '…' + id.slice(-4)
}
function fmtTime(d: Date) {
  // hh:mm:ss for compactness
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function pushJoinFeed(item: JoinFeedItem) {
  joinFeed.value.unshift(item)
  if (joinFeed.value.length > FEED_LIMIT) joinFeed.value.length = FEED_LIMIT
}

/* ─────────── Wheel style ─────────── */
const wheelStyle = computed(() => {
  const n = Math.max(1, joinedEntries.value.length)
  const stops = []
  for (let i = 0; i < n; i++) {
    const a0 = (360 / n) * i
    const a1 = (360 / n) * (i + 1)
    const color = i % 2 === 0 ? '#7c9cff' : '#52e3b6'
    stops.push(`${color} ${a0}deg ${a1}deg`)
  }
  return {
    background: `conic-gradient(${stops.join(',')})`,
    transform: `rotate(${rotateDeg.value}deg)`,
    transition: spinning.value ? 'transform 4s ease-out' : 'none'
  }
})
function labelStyle(i: number) {
  const n = Math.max(1, joinedEntries.value.length)
  const mid = (360 / n) * (i + 0.5)
  return { transform: `rotate(${mid}deg) translate(0, -40%) rotate(${-mid}deg)` }
}

/* ─────────── Data fetch ─────────── */
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

  // ✅ Seed feed on first load (existing joined)
  if (prev.length === 0 && entries.value.length > 0) {
    entries.value
      .filter(e => e.status === 'joined')
      .slice(0, FEED_LIMIT)
      .forEach(e => pushJoinFeed({ user_id: e.user_id, at: new Date(), type: 'existing' }))
  }
}

/* ─────────── Spin logic ─────────── */
function chooseRandomIndex(n: number) {
  return Math.floor(Math.random() * n)
}
async function startSpin() {
  targetIndex.value = chooseRandomIndex(joinedEntries.value.length)
  const slice = 360 / joinedEntries.value.length
  const targetAngle = slice * (targetIndex.value + 0.5)
  const spins = 5
  rotateDeg.value = 360 * spins + (360 - targetAngle)
  spinning.value = true
}
async function onSpinEnd() {
  if (!spinning.value) return
  spinning.value = false
  try {
    busy.value.commit = true
    const winner = joinedEntries.value[targetIndex.value!]
    winnerEntry.value = winner
    await supabase.schema('games').from('entry').update({ status: 'winner' }).eq('id', winner.id)
    const others = joinedEntries.value.filter(e => e.id !== winner.id).map(e => e.id)
    if (others.length) {
      await supabase.schema('games').from('entry').update({ status: 'refunded' }).in('id', others)
    }
    await fetchEntries()
  } catch (e: any) {
    err.value = e.message
  } finally {
    busy.value.commit = false
  }
}

/* ─────────── ✅ Realtime additions (entries) ─────────── */
let realtimeChannel: any | null = null
let refreshTimer: number | null = null
const POLL_MS = 10_000
let pollHandle: number | null = null

function scheduleRefresh(delayMs = 250) {
  if (refreshTimer) {
    window.clearTimeout(refreshTimer)
  }
  refreshTimer = window.setTimeout(async () => {
    refreshTimer = null
    await fetchEntries()
  }, delayMs)
}

function makeRealtimeChannel() {
  if (!eventId) return

  // Clean previous
  if (realtimeChannel) {
    try { supabase.removeChannel(realtimeChannel) } catch {}
    realtimeChannel = null
  }

  // Listen to all changes on games.entry for this event
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
        // ✅ Track live join events for the feed
        try {
          const { eventType, new: newRow, old: oldRow } = payload
          if (eventType === 'INSERT' && newRow?.status === 'joined') {
            pushJoinFeed({ user_id: newRow.user_id, at: new Date(), type: 'joined' })
          } else if (eventType === 'UPDATE') {
            const becameJoined =
              oldRow?.status !== 'joined' && newRow?.status === 'joined'
            if (becameJoined) {
              pushJoinFeed({ user_id: newRow.user_id, at: new Date(), type: 'rejoined' })
            }
          }
        } catch (_) { /* ignore */ }

        // Coalesce refreshes to avoid spamming fetch on burst updates
        scheduleRefresh(150)
      },
    )
    .subscribe((status: any, errSub?: any) => {
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        // Try re-subscribe if dropped
        setTimeout(() => makeRealtimeChannel(), 1000)
      }
    })
}

function startPoll() {
  stopPoll()
  pollHandle = window.setInterval(() => {
    fetchEntries()
  }, POLL_MS)
}
function stopPoll() {
  if (pollHandle) {
    window.clearInterval(pollHandle)
    pollHandle = null
  }
}
function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    scheduleRefresh(0)
  }
}

// Optional: reactively keep "resolved" up-to-date if entries array changes elsewhere
watch(entries, () => {
  resolved.value = entries.value.some(e => e.status === 'winner')
})

/* ─────────── Lifecycle ─────────── */
onMounted(async () => {
  await fetchEntries()
  makeRealtimeChannel()
  startPoll()
  document.addEventListener('visibilitychange', onVisibilityChange)
})
onBeforeUnmount(() => {
  if (realtimeChannel) {
    try { supabase.removeChannel(realtimeChannel) } catch {}
    realtimeChannel = null
  }
  if (refreshTimer) {
    window.clearTimeout(refreshTimer)
    refreshTimer = null
  }
  stopPoll()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style scoped>
.wheel-wrap {
  position: relative;
  width: 320px;
  aspect-ratio: 1/1;
}
.pointer {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 20px solid #ffc107;
  z-index: 2;
}
.wheel {
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 8px solid #222;
  position: relative;
}
.slice-label {
  position: absolute;
  left: 50%; top: 50%;
  transform-origin: 0 0;
  font-size: 12px;
  font-weight: bold;
}

/* ✅ Joined tracker styles (minimal) */
.joined-summary .badge {
  font-weight: 600;
  letter-spacing: .2px;
}
.joined-feed {
  list-style: none;
  padding-left: 0;
  margin: 0;
}
.joined-feed li {
  padding: 4px 0;
  border-bottom: 1px dashed rgba(0,0,0,.06);
}
.joined-feed li:last-child {
  border-bottom: 0;
}
</style>
