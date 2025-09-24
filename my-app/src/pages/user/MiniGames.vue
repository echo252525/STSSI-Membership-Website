<template>
  <div class="container-fluid">
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <h2 class="h4 mb-3">Mini Games</h2>
        <p class="text-secondary">Join events, spin the wheel, and win purchase discounts.</p>

        <div class="d-flex align-items-center justify-content-between mb-2">
          <h3 class="h6 mb-0">Open Events</h3>
        </div>

        <!-- Loading -->
        <div v-if="busy.load" class="text-center text-muted py-4">
          <div class="spinner-border mb-2"></div>
          <div>Loading events…</div>
        </div>

        <!-- Empty -->
        <div v-else-if="openEvents.length === 0" class="text-center text-muted py-4">
          <i class="bi bi-joystick" style="font-size: 1.6rem"></i>
          <div class="mt-2">No open events right now.</div>
        </div>

        <!-- Grid -->
        <div v-else class="row g-3">
          <div class="col-12 col-md-6 col-lg-4" v-for="ev in openEvents" :key="ev.id">
            <div
              class="spin-card h-100 border rounded-4"
              :class="{ 'spin-card--locked': ev.status !== 'open' }"
              tabindex="0"
            >
              <!-- Subtle animated halo -->
              <div class="spin-card__halo" aria-hidden="true"></div>

              <div class="spin-card__body p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h4 class="h6 mb-1 text-truncate spin-card__title" :title="ev.title">
                    {{ ev.title }}
                  </h4>
                  <span
                    class="badge bg-success-subtle text-success border-success-subtle text-capitalize spin-card__status"
                  >
                    {{ ev.status }}
                  </span>
                </div>

                <!-- Wheel block -->
                <div
                  class="spin-wheel mb-3"
                  :class="{ 'spin-wheel--paused': ev.status !== 'open' }"
                >
                  <div class="spin-wheel__ring"></div>
                  <div class="spin-wheel__mask">
                    <img
                      v-if="ev.imageUrl"
                      :src="ev.imageUrl"
                      alt="Event Prize"
                      class="spin-wheel__img"
                    />
                    <div v-else class="spin-wheel__placeholder">
                      <i class="bi bi-gift"></i>
                    </div>
                  </div>
                  <!-- pointer notch -->
                  <div class="spin-wheel__pointer" aria-hidden="true"></div>
                </div>

                <!-- Stats (minimal) -->
                <div class="spin-stats mb-3">
                  <div class="spin-stat">
                    <div class="spin-stat__label">Entry Fee</div>
                    <div class="spin-stat__value">₱ {{ money(ev.entry_fee) }}</div>
                  </div>
                  <div class="spin-stat">
                    <div class="spin-stat__label">Cap</div>
                    <div class="spin-stat__value">{{ ev.player_cap }}</div>
                  </div>
                  <div class="spin-stat">
                    <div class="spin-stat__label">Joined</div>
                    <div class="spin-stat__value">{{ ev.player_count }}</div>
                  </div>
                  <div class="spin-stat">
                    <div class="spin-stat__label">Loser Interest</div>
                    <div class="spin-stat__value">₱ {{ money(ev.interest_per_loser) }}</div>
                  </div>
                </div>

                <!-- Bottom row -->
                <div class="d-flex justify-content-between align-items-center">
                  <span class="small text-muted d-inline-flex align-items-center gap-1">
                    <span class="dot-pulse" aria-hidden="true"></span>
                    {{ slotsLeft(ev) }} slots left
                  </span>

                  <button
                    v-if="!alreadyJoined(ev.id)"
                    class="btn btn-sm btn-primary join-btn"
                    :class="{ 'join-btn--disabled': !canJoin(ev) }"
                    :disabled="!canJoin(ev) || !!joinBusy[ev.id]"
                    @click="join(ev)"
                  >
                    <span
                      v-if="joinBusy[ev.id]"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    Join
                  </button>

                  <span
                    v-else
                    class="badge text-bg-secondary"
                    title="You already joined this event"
                  >
                    Joined
                  </span>
                </div>

                <!-- Messages -->
                <div v-if="joinErr[ev.id]" class="text-danger small mt-2">
                  {{ joinErr[ev.id] }}
                </div>
                <div v-if="joinOk[ev.id]" class="text-success small mt-2">Joined! 🎉</div>
              </div>
            </div>
          </div>
        </div>
        <!-- END GRID -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

type EventRow = {
  id: string
  title: string
  item_supplier_cost: number | string
  entry_fee: number | string
  player_count: number
  interest_pool: number | string
  status: 'draft' | 'open' | 'locked' | 'spun' | 'settled' | 'cancelled'
  created_by: string | null
  created_at: string
  updated_at: string
  product_id: string
  player_cap: number
  user_id_winner: string | null
  interest_per_loser: number | string
  winner_price: number | string
  loser_refund_amount: number | string
  imageUrl?: string | null
}

type EntryRow = {
  id: string
  event_id: string
  user_id: string
  status: string
  joined_at: string
}

const router = useRouter()

const busy = reactive({ load: false })
const events = ref<EventRow[]>([])
const myEntries = ref<Record<string, boolean>>({})
const joinBusy: Record<string, boolean> = reactive({})
const joinErr: Record<string, string> = reactive({})
const joinOk: Record<string, boolean> = reactive({})

// NEW: keep live, authoritative counts per event (synced from entry table)
const entryCounts: Record<string, number> = reactive({})

// quick index helpers to keep updates O(1)
const idxById = computed<Map<string, number>>(() => {
  const m = new Map<string, number>()
  events.value.forEach((e, i) => m.set(e.id, i))
  return m
})

function money(v: number | string | null | undefined) {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}
function fmt(x: string | null | undefined) {
  if (!x) return '—'
  const d = new Date((x as string).replace(' ', 'T'))
  return isNaN(d.getTime()) ? '—' : d.toLocaleString()
}
// Use the freshest count we have (entryCounts fallback to ev.player_count)
function joinedCount(ev: EventRow) {
  const c = entryCounts[ev.id]
  return typeof c === 'number' ? c : Number(ev.player_count || 0)
}
function slotsLeft(ev: EventRow) {
  const left = Number(ev.player_cap) - joinedCount(ev)
  return Math.max(0, left)
}

async function loadOpenEvents() {
  busy.load = true
  clearPerJoinMessages()
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('event')
      .select(`*`)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (error) throw error
    events.value = (data ?? []) as EventRow[]
    console.log('[LOAD] Open events loaded:', events.value.length)

    await attachPrizeImages(events.value)
    await loadMyEntriesFor(events.value.map((e) => e.id))

    // NEW: initialize joined counts for all visible events
    await Promise.all(events.value.map((e) => refreshEntryCount(e.id)))
    console.log('[COUNT] Initialized counts for all open events.')
  } catch (e: any) {
    console.error('loadOpenEvents error:', e?.message || e)
  } finally {
    busy.load = false
  }
}

const openEvents = computed(() => events.value)

async function loadMyEntriesFor(eventIds: string[]) {
  myEntries.value = {}
  try {
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr) throw userErr
    const userId = userRes.user?.id
    if (!userId || eventIds.length === 0) {
      console.log('[LOAD] Skipping my entries (no user or no events).')
      return
    }

    const { data, error } = await supabase
      .schema('games')
      .from('entry')
      .select('event_id')
      .eq('user_id', userId)
      .in('event_id', eventIds)

    if (error) throw error
    for (const row of (data ?? []) as Pick<EntryRow, 'event_id'>[]) {
      myEntries.value[row.event_id] = true
    }
    console.log('[LOAD] My joined map prepared for', Object.keys(myEntries.value).length, 'events')
  } catch (e: any) {
    console.error('loadMyEntriesFor error:', e?.message || e)
  }
}

function alreadyJoined(eventId: string) {
  return !!myEntries.value[eventId]
}

function canJoin(ev: EventRow) {
  return ev.status === 'open' && slotsLeft(ev) > 0 && !alreadyJoined(ev.id)
}

function humanizeError(e: any): string {
  const raw = e?.message || ''
  if (raw.includes('duplicate key')) return 'You already joined this event.'
  if (raw.includes('capacity')) return 'Event is full.'
  if (raw.includes('violates row-level security'))
    return 'You do not have permission to join this event.'
  return raw || 'Failed to join.'
}

async function join(ev: EventRow) {
  joinErr[ev.id] = ''
  joinOk[ev.id] = false
  joinBusy[ev.id] = true
  console.log('[JOIN] Attempting join for', ev.id, ev.title)
  try {
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr) throw userErr
    const userId = userRes.user?.id
    if (!userId) throw new Error('You must be signed in to join.')

    if (alreadyJoined(ev.id)) {
      console.log('[JOIN] Already joined; navigating to waiting…')
      joinOk[ev.id] = true
      router.push({ name: 'user.waiting', query: { eventId: ev.id } })
      return
    }

    const payload = {
      event_id: ev.id,
      user_id: userId,
      status: 'joined',
      joined_at: new Date().toISOString(),
    }

    const { error: insErr } = await supabase.schema('games').from('entry').insert([payload])
    if (insErr) throw insErr
    console.log('[JOIN] Entry inserted.')

    // We keep your optimistic update, but the realtime + refreshEntryCount will correct any drift.
    const nextCount = Number(ev.player_count) + 1
    const { error: updErr } = await supabase
      .schema('games')
      .from('event')
      .update({ player_count: nextCount })
      .eq('id', ev.id)

    if (updErr) console.warn('[JOIN] player_count update failed (will rely on realtime):', updErr)

    joinOk[ev.id] = true
    myEntries.value[ev.id] = true

    // Hard refresh + ensure count is accurate for this event
    await loadOpenEvents()
    await refreshEntryCount(ev.id)

    router.push({ name: 'user.waiting', query: { eventId: ev.id } })
  } catch (e: any) {
    joinErr[ev.id] = humanizeError(e)
    console.error('join error:', e)
  } finally {
    joinBusy[ev.id] = false
  }
}

function clearPerJoinMessages() {
  for (const k of Object.keys(joinErr)) delete joinErr[k]
  for (const k of Object.keys(joinOk)) delete joinOk[k]
}

async function reload() {
  console.log('[UI] Manual reload triggered.')
  await loadOpenEvents()
}

/** Resolve product images to signed URLs */
async function attachPrizeImages(list: EventRow[]) {
  try {
    const productIds = Array.from(
      new Set(list.map((e) => e.product_id).filter(Boolean)),
    ) as string[]
    if (productIds.length === 0) {
      list.forEach((e) => (e.imageUrl = null))
      console.log('[IMG] No products to resolve.')
      return
    }

    const { data: products, error: prodErr } = await supabase
      .schema('games')
      .from('products')
      .select('id, product_url')
      .in('id', productIds)

    if (prodErr) throw prodErr

    const urlByProductId = new Map<string, string>()
    for (const row of (products ?? []) as { id: string; product_url: string }[]) {
      if (row.product_url) urlByProductId.set(row.id, row.product_url)
    }

    for (const ev of list) {
      const path = ev.product_id ? urlByProductId.get(ev.product_id) : undefined
      if (!path) {
        ev.imageUrl = null
        continue
      }

      const { data: signed, error: signErr } = await supabase.storage
        .from('prize_product')
        .createSignedUrl(path, 60 * 60)

      if (signErr) {
        console.error('[IMG] signedUrl error:', signErr)
        ev.imageUrl = null
      } else {
        ev.imageUrl = signed?.signedUrl ?? null
      }
    }
    console.log('[IMG] Signed URLs attached for', list.length, 'events')
  } catch (e: any) {
    console.error('attachPrizeImages error:', e?.message || e)
    list.forEach((e) => (e.imageUrl = null))
  }
}

/* ---------------- Realtime wiring ---------------- */

let eventsChannel: ReturnType<typeof supabase.channel> | null = null
let entriesChannel: ReturnType<typeof supabase.channel> | null = null
let productsChannel: ReturnType<typeof supabase.channel> | null = null

function subscribeRealtime() {
  console.log('[RT] Subscribing to games.event, games.entry, games.products…')

  // EVENTS
  eventsChannel = supabase
    .channel('rt-games-event')
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'event' },
      async (payload: any) => {
        const type = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        console.log('[RT:event]', type, { new: payload.new, old: payload.old })

        if (type === 'INSERT') {
          const row = payload.new as EventRow
          if (row.status === 'open') {
            if (!idxById.value.has(row.id)) {
              const clone = { ...row }
              await attachPrizeImages([clone])
              events.value = [clone, ...events.value]
              console.log('[RT:event] INSERT added ->', row.id)
              await loadMyEntriesFor([row.id])
              await refreshEntryCount(row.id) // NEW: ensure fresh count
            }
          }
        } else if (type === 'UPDATE') {
          const row = payload.new as EventRow
          const i = idxById.value.get(row.id)
          const wasOpen = (payload.old?.status ?? '') === 'open'
          const isOpen = row.status === 'open'

          if (i != null) {
            if (!isOpen) {
              events.value.splice(i, 1)
              console.log('[RT:event] UPDATE removed (no longer open) ->', row.id)
            } else {
              const merged = { ...events.value[i], ...row }
              if (merged.product_id !== events.value[i].product_id) {
                await attachPrizeImages([merged])
                console.log('[RT:event] UPDATE product changed -> refreshed image', row.id)
              }
              events.value.splice(i, 1, merged)
              console.log('[RT:event] UPDATE merged ->', row.id)
              await refreshEntryCount(row.id) // NEW: keep counts consistent even if only cap/status changed
            }
          } else if (isOpen && !wasOpen) {
            const clone = { ...row }
            await attachPrizeImages([clone])
            events.value = [clone, ...events.value]
            await loadMyEntriesFor([row.id])
            await refreshEntryCount(row.id) // NEW
            console.log('[RT:event] UPDATE became open -> added', row.id)
          }
        } else if (type === 'DELETE') {
          const oldId = payload.old?.id as string | undefined
          if (oldId && idxById.value.has(oldId)) {
            const i = idxById.value.get(oldId)!
            events.value.splice(i, 1)
            console.log('[RT:event] DELETE removed ->', oldId)
            delete entryCounts[oldId]
          }
        }
      }
    )
    .subscribe((status) => {
      console.log('[RT:event] subscription status:', status)
    })

  // ENTRIES
  entriesChannel = supabase
    .channel('rt-games-entry')
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'entry' },
      async (payload: any) => {
        const type = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        console.log('[RT:entry]', type, { new: payload.new, old: payload.old })

        const affectedEventId: string | undefined =
          (type === 'DELETE' ? payload.old?.event_id : payload.new?.event_id) || undefined
        if (!affectedEventId) return

        // NEW: Always refresh count from server for the affected event
        await refreshEntryCount(affectedEventId)

        // Keep your previous snapshot refresh + status handling
        if (idxById.value.has(affectedEventId)) {
          const latest = await fetchEventById(affectedEventId)
          if (latest) {
            const i = idxById.value.get(affectedEventId)!
            const merged = { ...events.value[i], ...latest }
            events.value.splice(i, 1, merged)
            console.log('[RT:entry] refreshed event snapshot ->', affectedEventId)

            if (merged.status !== 'open') {
              events.value.splice(i, 1)
              console.log('[RT:entry] event left open -> removed', affectedEventId)
            }
          } else {
            console.log('[RT:entry] event not found (maybe deleted) ->', affectedEventId)
          }
          await loadMyEntriesFor([affectedEventId])
        }
      }
    )
    .subscribe((status) => {
      console.log('[RT:entry] subscription status:', status)
    })

  // PRODUCTS
  productsChannel = supabase
    .channel('rt-games-products')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'games', table: 'products' },
      async (payload: any) => {
        console.log('[RT:product] UPDATE', { new: payload.new, old: payload.old })
        const prodId = payload.new?.id as string | undefined
        if (!prodId) return
        const affected: EventRow[] = events.value.filter((e) => e.product_id === prodId)
        if (affected.length > 0) {
          await attachPrizeImages(affected)
          for (const e of affected) {
            const i = idxById.value.get(e.id)
            if (i != null) {
              events.value.splice(i, 1, { ...events.value[i] })
            }
          }
          console.log('[RT:product] refreshed prize images for', affected.length, 'event(s)')
        }
      }
    )
    .subscribe((status) => {
      console.log('[RT:product] subscription status:', status)
    })
}

async function fetchEventById(id: string): Promise<EventRow | null> {
  const { data, error } = await supabase.schema('games').from('event').select('*').eq('id', id).single()
  if (error) {
    console.warn('[FETCH] Event not found:', id, error?.message)
    return null
  }
  const row = data as EventRow
  if (row.product_id) {
    await attachPrizeImages([row])
  } else {
    row.imageUrl = null
  }
  return row
}

/** NEW: refresh a single event's live joined count, patch in-memory row too */
async function refreshEntryCount(eventId: string) {
  try {
    const { count, error } = await supabase
      .schema('games')
      .from('entry')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    if (error) throw error
    const c = typeof count === 'number' ? count : 0
    entryCounts[eventId] = c

    const i = idxById.value.get(eventId)
    if (i != null) {
      const patched = { ...events.value[i], player_count: c }
      events.value.splice(i, 1, patched)
    }
    console.log('[COUNT] event', eventId, 'joined =', c)
  } catch (e: any) {
    console.warn('[COUNT] refreshEntryCount failed for', eventId, e?.message || e)
  }
}

/* ---------------- lifecycle ---------------- */

onMounted(() => {
  console.log('[LIFECYCLE] Mounted -> loading + subscribing')
  loadOpenEvents()
  subscribeRealtime()
})

onUnmounted(() => {
  console.log('[LIFECYCLE] Unmounting -> removing channels')
  if (eventsChannel) {
    supabase.removeChannel(eventsChannel)
    eventsChannel = null
  }
  if (entriesChannel) {
    supabase.removeChannel(entriesChannel)
    entriesChannel = null
  }
  if (productsChannel) {
    supabase.removeChannel(productsChannel)
    productsChannel = null
  }
})
</script>

<style scoped>
/* --- Minimal palette helpers (kept) --- */
.bg-success-subtle {
  background-color: rgba(25, 135, 84, 0.08) !important;
}
.text-success {
  color: #198754 !important;
}
.border-success-subtle {
  border-color: rgba(25, 135, 84, 0.25) !important;
}

/* --- Motion safety --- */
@media (prefers-reduced-motion: reduce) {
  .spin-card,
  .spin-wheel__ring,
  .join-btn,
  .spin-card__halo {
    animation: none !important;
    transition: none !important;
  }
}

/* --- Spin Card --- */
.spin-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff, #fbfbfd);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  border: 1px solid rgba(0, 0, 0, 0.06);
  will-change: transform;
}
.spin-card:focus-within,
.spin-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.1);
}
.spin-card--locked {
  opacity: 0.9;
}

/* Subtle ambient halo */
.spin-card__halo {
  position: absolute;
  inset: -40%;
  background:
    radial-gradient(60% 60% at 50% 40%, rgba(25, 135, 84, 0.08), transparent 60%),
    radial-gradient(60% 60% at 70% 80%, rgba(56, 102, 255, 0.06), transparent 60%);
  filter: blur(20px);
  transform: translateZ(0);
  pointer-events: none;
  animation: haloFloat 7s ease-in-out infinite;
}
@keyframes haloFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.spin-card__title {
  letter-spacing: 0.2px;
}

.spin-card__status {
  backdrop-filter: saturate(1.2);
}

/* --- Wheel --- */
.spin-wheel {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  isolation: isolate;
}
.spin-wheel--paused .spin-wheel__ring {
  animation-play-state: paused;
}

.spin-wheel__ring {
  position: absolute;
  width: 92%;
  height: 92%;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(25, 135, 84, 0.16) 0 25%,
    rgba(56, 102, 255, 0.14) 25% 50%,
    rgba(255, 193, 7, 0.16) 50% 75%,
    rgba(111, 66, 193, 0.14) 75% 100%
  );
  box-shadow:
    inset 0 0 0 10px #fff,
    0 2px 10px rgba(0, 0, 0, 0.04);
  animation: ringSpin 18s linear infinite;
  transition: filter 0.25s ease;
}
.spin-card:hover .spin-wheel__ring {
  filter: saturate(1.1) brightness(1.02);
}

@keyframes ringSpin {
  to {
    transform: rotate(360deg);
  }
}

.spin-wheel__mask {
  position: relative;
  width: 72%;
  height: 72%;
  border-radius: 50%;
  overflow: hidden;
  background: #f6f7fb;
  border: 8px solid #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  z-index: 1;
}

.spin-wheel__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.spin-wheel__placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #94a3b8;
  font-size: 2rem;
}

/* pointer notch */
.spin-wheel__pointer {
  position: absolute;
  top: 2%;
  left: 50%;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 10px solid rgba(0, 0, 0, 0.15);
  z-index: 2;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08));
}

/* --- Stats Row --- */
.spin-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}
.spin-stat {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 0.75rem;
  padding: 0.5rem 0.6rem;
  text-align: center;
}
.spin-stat__label {
  font-size: 0.72rem;
  color: #6c757d;
}
.spin-stat__value {
  font-size: 0.9rem;
  font-weight: 600;
}

/* --- Slots left indicator --- */
.dot-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #20c997;
  box-shadow: 0 0 0 0 rgba(32, 201, 151, 0.6);
  animation: pulse 1.8s infinite;
}
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(32, 201, 151, 0.6);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(32, 201, 151, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(32, 201, 151, 0);
  }
}

/* --- Join button micro-interactions --- */
.join-btn {
  position: relative;
  overflow: hidden;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease;
}
.join-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(13, 110, 253, 0.25);
}
.join-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2);
}

.join-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: translateX(-120%);
  transition: transform 0.6s ease;
}
.join-btn:hover::after {
  transform: translateX(120%);
}

.join-btn--disabled,
.join-btn:disabled {
  opacity: 0.7;
  box-shadow: none;
  cursor: not-allowed;
}
</style>
