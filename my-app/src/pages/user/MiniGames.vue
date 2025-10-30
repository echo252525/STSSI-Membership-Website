<template>
  <!-- (UNCHANGED TEMPLATE, includes the avatar row I added earlier) -->
  <div class="container-fluid game-surface">
    <div class="card border-0 padding-0 margin-0 shadow-sm rounded-4 game-card">
      <div class="card-body game-card__body">
        <!-- ⭐ NEW BG: decorative, non-interactive animated background -->
        <div class="game-bg-anim" aria-hidden="true"></div>

        <h2 class="h4 mb-1 game-title">
          <span class="game-title__glow"></span>
          Mini Games
        </h2>
        <p class="text-secondary mb-1">Join events, spin the wheel, and win purchase discounts.</p>
        <RouterLink
          :to="{ name: 'user.minigames.tutorial' }"
          class="text-secondary mb-1 d-inline-block text-decoration-underline"
          aria-label="Open tutorial: How to Play"
        >
          How to Play?
        </RouterLink>

        <div class="d-flex align-items-center justify-content-between">
          <h3 class="h6 mb-0 game-sub mb-3">Open Events</h3>
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

        <!-- Slider (replaces grid; keeps card markup intact) -->
        <div
          v-else
          class="slider"
          @keydown.left.prevent="prev"
          @keydown.right.prevent="next"
          tabindex="0"
          aria-roledescription="carousel"
        >
          <div
            class="slider__holder"
            ref="holderRef"
            @pointerdown.passive="onPointerDown"
            @pointermove.passive="onPointerMove"
            @pointerup.passive="onPointerUp"
            @pointercancel.passive="onPointerCancel"
          >
            <!-- one “slide” per event -->
            <div
              v-for="(ev, i) in openEvents"
              :key="ev.id"
              class="slider__item"
              :class="{ 'is-active': i === activeIndex }"
              :style="slideStyle(i)"
              @click="goTo(i)"
            >
              <!-- ORIGINAL CARD CONTENT STARTS (unchanged except small attributes added) -->
              <div
                class="spin-card h-100 border rounded-4"
                :class="{ 'spin-card--locked': ev.status !== 'open' }"
                tabindex="0"
                :data-joined="joinOk[ev.id] ? 'true' : null"
                :style="cardStyle(ev, i)"
                @mousemove="onCardMove($event, i)"
                @mouseleave="onCardLeave(i)"
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
                    <!-- progress HUD ring (driven by CSS var set on card) -->
                    <div class="spin-wheel__ring"></div>

                    <!-- CLICKABLE MASK (replaces join button action) -->
                    <div
                      class="spin-wheel__mask"
                      :class="{
                        'is-clickable': i === activeIndex && (canJoin(ev) || alreadyJoined(ev.id)),
                      }"
                      :title="maskTitle(ev, i)"
                      :aria-label="maskTitle(ev, i)"
                      :aria-disabled="!(i === activeIndex && (canJoin(ev) || alreadyJoined(ev.id)))"
                      :tabindex="
                        i === activeIndex && (canJoin(ev) || alreadyJoined(ev.id)) ? 0 : -1
                      "
                      @click.stop="onWheelClick(ev, i)"
                      @keydown.enter.prevent.stop="onWheelClick(ev, i)"
                      @keydown.space.prevent.stop="onWheelClick(ev, i)"
                    >
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

                  <!-- Stats -->
                  <div class="spin-stats mb-3">
                    <div class="spin-stat">
                      <div class="spin-stat__label">Entry Fee</div>
                      <div class="spin-stat__value">₱ {{ money(ev.entry_fee) }}</div>
                    </div>

                    <div class="spin-stat">
                      <div class="spin-stat__label">Joined</div>
                      <div class="spin-stat__value">{{ joinedCount(ev) }}/{{ ev.player_cap }}</div>
                    </div>

                    <div v-if="hasProductPrice(ev)" class="spin-stat">
                      <div class="spin-stat__label">Price</div>
                      <div class="spin-stat__value d-flex align-items-center gap-1 flex-wrap">
                        <span class="text-muted text-decoration-line-through">
                          ₱ {{ money(ev.product_price) }}
                        </span>
                        <span>→</span>
                        <strong>₱ {{ money(discounted(ev)) }}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Participants Avatars -->
                  <div class="avatar-row mb-3" v-if="(avatarsByEvent[ev.id]?.length || 0) > 0">
                    <div class="avatars">
                      <template v-for="p in avatarsByEvent[ev.id]" :key="p.user_id">
                        <img
                          v-if="p.avatarUrl"
                          class="avatar-img"
                          :src="p.avatarUrl"
                          :alt="p.name || 'Player'"
                          :title="p.name || 'Player'"
                        />
                        <div
                          v-else
                          class="avatar-fallback"
                          :title="p.name || 'Player'"
                          aria-label="No profile photo"
                        >
                          <i class="bi bi-person"></i>
                        </div>
                      </template>
                    </div>
                    <div
                      v-if="joinedCount(ev) > (avatarsByEvent[ev.id]?.length || 0)"
                      class="avatar-more"
                      :title="`${joinedCount(ev) - (avatarsByEvent[ev.id]?.length || 0)} more`"
                    >
                      +{{ joinedCount(ev) - (avatarsByEvent[ev.id]?.length || 0) }}
                    </div>
                  </div>
                  <!-- /Participants Avatars -->

                  <!-- Bottom row -->
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="small text-muted d-inline-flex align-items-center gap-1 slots-hud">
                      <span class="dot-pulse" aria-hidden="true"></span>
                      {{ slotsLeft(ev) }} slots left
                    </span>

                    <!-- Join button removed; keep 'Joined' badge if applicable -->
                    <span
                      v-if="alreadyJoined(ev.id)"
                      class="badge text-bg-secondary"
                      title="You already joined this event"
                    >
                      Joined
                    </span>
                  </div>

                  <!-- Inline hint if funds are insufficient -->
                  <div v-if="!hasEnoughBalance(ev)" class="text-danger small mt-2">
                    Insufficient balance (Need ₱
                    {{ money(Number(ev.entry_fee) - Number(userBalance ?? 0)) }} more)
                  </div>

                  <!-- Messages -->
                  <div v-if="joinErr[ev.id]" class="text-danger small mt-2">
                    {{ joinErr[ev.id] }}
                  </div>
                  <div v-if="joinOk[ev.id]" class="text-success small mt-2">Joined! 🎉</div>
                </div>
              </div>
              <!-- ORIGINAL CARD CONTENT ENDS -->
            </div>
          </div>

          <!-- Bullets -->
          <div class="bullets" aria-label="Slides navigation">
            <button
              v-for="(ev, i) in openEvents"
              :key="'b-' + ev.id"
              class="bullets__item"
              :class="{ 'is-active': i === activeIndex }"
              @click="goTo(i)"
              :aria-label="`Go to slide ${i + 1}`"
            ></button>
          </div>

          <!-- Optional nav (hidden on small if you want) -->
          <div class="slider__nav">
            <button class="slider__btn" @click="prev" aria-label="Previous">‹</button>
            <button class="slider__btn" @click="next" aria-label="Next">›</button>
          </div>
        </div>
        <!-- END SLIDER -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, computed, nextTick } from 'vue' // ⭐ changed: add nextTick
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { currentUser } from '@/lib/authState'
import type { CSSProperties } from 'vue'

const routers = useRouter()
const user = computed(() => currentUser.value)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return routers.push({ name: 'login' })
  }
})

/* ==================== TYPES (UPDATED TO MATCH SCHEMA) ==================== */
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
  /** GENERATED STORED COLUMNS FROM SCHEMA */
  interest_per_player: number | string | null
  winner_refund_amount: number | string | null
  loser_refund_amount: number | string | null
  /** UI helper */
  imageUrl?: string | null
  /** NEW: resolved product price (from games.products.price) */
  product_price?: number | string | null
}

type EntryRow = {
  id: string
  event_id: string
  user_id: string
  status: string
  joined_at: string
}

type AvatarInfo = {
  user_id: string
  name: string | null
  avatarUrl: string | null
}

const router = useRouter()

/* ==================== STATE (UNCHANGED) ==================== */
const busy = reactive({ load: false })
const events = ref<EventRow[]>([])
const myEntries = ref<Record<string, boolean>>({})
const joinBusy: Record<string, boolean> = reactive({})
const joinErr: Record<string, string> = reactive({})
const joinOk: Record<string, boolean> = reactive({})

// NEW: current user's wallet balance
const userBalance = ref<number | null>(null)

// live counts per event
const entryCounts: Record<string, number> = reactive({})
// live avatars per event
const avatarsByEvent: Record<string, AvatarInfo[]> = reactive({})

/* ==================== NEW: Slider state ==================== */
const activeIndex = ref(0)

/* ==================== NEW: Viewport-aware sizing for better mobile layout ==================== */
const viewportW = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
function handleResize() {
  viewportW.value = typeof window !== 'undefined' ? window.innerWidth : viewportW.value
}

/* ==================== NEW: Mobile swipe state (adds swipable on phones) ==================== */
const holderRef = ref<HTMLElement | null>(null)
const swipe = reactive({
  dragging: false,
  startX: 0,
  dx: 0,
  pointerId: -1,
  preventClick: false,
})

function onPointerDown(e: PointerEvent) {
  if (viewportW.value > 600) return // mobile-only
  swipe.dragging = true
  swipe.startX = e.clientX
  swipe.dx = 0
  swipe.pointerId = e.pointerId
  try {
    holderRef.value?.setPointerCapture?.(e.pointerId)
  } catch {}
}

function onPointerMove(e: PointerEvent) {
  if (!swipe.dragging || viewportW.value > 600) return
  swipe.dx = e.clientX - swipe.startX
  if (Math.abs(swipe.dx) > 6) swipe.preventClick = true
}

function finishSwipe() {
  swipe.dragging = false
  swipe.startX = 0
  swipe.dx = 0
  swipe.pointerId = -1
  // allow clicks again shortly after swipe ends
  setTimeout(() => {
    swipe.preventClick = false
  }, 120)
}

function onPointerUp(e: PointerEvent) {
  if (!swipe.dragging || viewportW.value > 600) return
  const w = holderRef.value?.clientWidth ?? window.innerWidth ?? 360
  const threshold = Math.max(40, w * 0.12) // ~12% of width feels natural
  const dx = swipe.dx
  if (Math.abs(dx) > threshold) {
    if (dx < 0) next()
    else prev()
  }
  finishSwipe()
}

function onPointerCancel(_: PointerEvent) {
  if (!swipe.dragging) return
  finishSwipe()
}

/** Centered, stacked layout similar to the screenshot */
function slideStyle(i: number): CSSProperties {
  const current = activeIndex.value
  const diff = i - current
  const distance = Math.abs(diff)

  // responsive tuning
  const isPhone = viewportW.value <= 480
  const isTablet = viewportW.value > 480 && viewportW.value <= 768

  // ⭐ Tweaked for mobile readability: keep the active card full-size
  const step = isPhone ? 18 : isTablet ? 20 : 22
  const x = diff * step

  const base = isPhone ? 1.0 : 0.84
  const perStep = isPhone ? 0.05 : 0.08
  const minScale = isPhone ? 0.94 : 0.72
  const scale = Math.max(base - distance * perStep, minScale)

  // Use % of the holder so it never exceeds the clipped area
const width = isPhone ? 'min(96%, 520px)' : isTablet ? '92%' : 'clamp(320px, 70%, 620px)'


  // Softer dimming on small screens to avoid “washed out” side cards
  const dimFactor = isPhone ? 0.12 : 0.2
  const dimMax = isPhone ? 0.45 : 0.6
  const dim = Math.min(distance * dimFactor, dimMax)
  const brightness = 1 - dim
  const z = 100 - distance

  // ⭐ Mobile swipe drag offset (adds pixel translation while user drags)
  const dragPx = viewportW.value <= 600 && swipe.dragging ? swipe.dx : 0

  return {
    left: '50%',
    width,
    transform: `translateX(calc(-50% + ${x}% + ${dragPx}px)) scale(${scale})`,
    zIndex: String(z),
    pointerEvents: 'auto',
    filter: `brightness(${brightness})`,
    transition: swipe.dragging
      ? 'transform .03s linear, filter .2s ease, opacity .2s ease'
      : 'transform .3s ease, filter .3s ease, opacity .3s ease',
  }
}

function goTo(i: number) {
  // prevent accidental click after swipe
  if (swipe.preventClick) return
  if (i < 0 || i >= openEvents.value.length) return
  activeIndex.value = i
}
function prev() {
  activeIndex.value = (activeIndex.value - 1 + openEvents.value.length) % openEvents.value.length
}
function next() {
  activeIndex.value = (activeIndex.value + 1) % openEvents.value.length
}

const isAlive = ref(true)
const sessionId = Math.random().toString(36).slice(2, 9) // unique channel suffix per mount

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
function joinedCount(ev: EventRow) {
  const c = entryCounts[ev.id]
  return typeof c === 'number' ? c : Number(ev.player_count || 0)
}
function slotsLeft(ev: EventRow) {
  const left = Number(ev.player_cap) - joinedCount(ev)
  return Math.max(0, left)
}

/* ========= NEW: load current user's balance from public.users ========= */
async function loadUserBalance() {
  try {
    const { data: ures, error: uerr } = await supabase.auth.getUser()
    if (uerr) throw uerr
    const uid = ures.user?.id
    if (!uid) return
    const { data, error } = await supabase
      .from('users') // public schema by default
      .select('balance')
      .eq('id', uid)
      .single()
    if (error) throw error
    if (!isAlive.value) return
    userBalance.value = Number(data?.balance ?? 0)
  } catch (e: any) {
    console.warn('[BALANCE] loadUserBalance failed:', e?.message || e)
    if (isAlive.value) userBalance.value = null
  }
}

/* ========= NEW: product prices for discount display ========= */
async function attachProductPrices(list: EventRow[]) {
  try {
    const ids = Array.from(new Set(list.map((e) => e.product_id).filter(Boolean)))
    if (ids.length === 0) return
    const { data, error } = await supabase
      .schema('games')
      .from('products')
      .select('id, price')
      .in('id', ids)
    if (error) throw error
    const priceMap = new Map<string, number | string>()
    for (const row of (data ?? []) as Array<{ id: string; price: number | string }>) {
      priceMap.set(row.id, row.price)
    }
    for (const ev of list) {
      ev.product_price = priceMap.get(ev.product_id) ?? null
    }
  } catch (e: any) {
    console.warn('[PRICE] attachProductPrices failed:', e?.message || e)
    for (const ev of list) ev.product_price = ev.product_price ?? null
  }
}

function hasProductPrice(ev: EventRow) {
  const p = Number(ev.product_price)
  return Number.isFinite(p) && p > 0
}
function discounted(ev: EventRow) {
  const original = Number(ev.product_price ?? 0)
  const off = Number(ev.interest_per_player ?? 0)
  const d = original - off
  return d > 0 ? d : 0
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
    if (!isAlive.value) return
    events.value = (data ?? []) as EventRow[]
    console.log('[LOAD] Open events loaded:', events.value.length)

    await attachPrizeImages(events.value)
    await attachProductPrices(events.value) // NEW: load product prices for discount display
    await loadMyEntriesFor(events.value.map((e) => e.id))

    // initialize counts & avatars
    await Promise.all(
      events.value.map(async (e) => {
        await refreshEntryCount(e.id)
        await refreshParticipantAvatars(e.id)
      }),
    )
    if (!isAlive.value) return
    console.log('[INIT] counts & avatars ready.')

    // clamp activeIndex if list shorter than before
    if (activeIndex.value > events.value.length - 1) activeIndex.value = 0
  } catch (e: any) {
    console.error('loadOpenEvents error:', e?.message || e)
  } finally {
    if (isAlive.value) busy.load = false
  }
}

const openEvents = computed(() => events.value)

async function loadMyEntriesFor(eventIds: string[]) {
  if (!isAlive.value) return
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
    if (!isAlive.value) return
    for (const row of (data ?? []) as Pick<EntryRow, 'event_id'>[]) {
      myEntries.value[row.event_id] = true
    }
    console.log('[LOAD] My joined map for', Object.keys(myEntries.value).length, 'events')
  } catch (e: any) {
    console.error('loadMyEntriesFor error:', e?.message || e)
  }
}

function alreadyJoined(eventId: string) {
  return !!myEntries.value[eventId]
}

/* ======== UPDATED: join eligibility now checks balance ======== */
function hasEnoughBalance(ev: EventRow) {
  const fee = Number(ev.entry_fee ?? 0)
  const bal = Number(userBalance.value ?? 0)
  return bal >= fee
}

function canJoin(ev: EventRow) {
  return ev.status === 'open' && slotsLeft(ev) > 0 && !alreadyJoined(ev.id) && hasEnoughBalance(ev)
}

function humanizeError(e: any): string {
  const raw = e?.message || ''
  if (raw.includes('duplicate key')) return 'You already joined this event.'
  if (raw.includes('capacity')) return 'Event is full.'
  if (raw.includes('violates row-level security'))
    return 'You do not have permission to join this event.'
  return raw || 'Failed to join.'
}

/* ========= Tiny SFX (no external files) ========= */
const audioCtx = ref<AudioContext | null>(null)
function ensureAudio() {
  if (audioCtx.value) return
  const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
  if (Ctx) audioCtx.value = new Ctx()
}
function playBeep(freq = 880, duration = 0.08, type: OscillatorType = 'triangle') {
  try {
    ensureAudio()
    const ctx = audioCtx.value!
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.value = freq
    o.connect(g)
    g.connect(ctx.destination)
    const now = ctx.currentTime
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.2, now + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    o.start(now)
    o.stop(now + duration + 0.02)
  } catch {}
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

    // Hard guard: block if insufficient balance
    if (!hasEnoughBalance(ev)) {
      throw new Error('Insufficient balance to join this event.')
    }

    if (alreadyJoined(ev.id)) {
      console.log('[JOIN] Already joined; navigating to waiting…')
      joinOk[ev.id] = true
      playBeep(1320, 0.12, 'sine')
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

    const nextCount = Number(ev.player_count) + 1
    const { error: updErr } = await supabase
      .schema('games')
      .from('event')
      .update({ player_count: nextCount })
      .eq('id', ev.id)

    if (updErr) console.warn('[JOIN] player_count update failed; realtime will fix.')

    joinOk[ev.id] = true
    playBeep(1320, 0.12, 'sine')
    myEntries.value[ev.id] = true

    await loadOpenEvents()
    await refreshEntryCount(ev.id)
    await refreshParticipantAvatars(ev.id)

    router.push({ name: 'user.waiting', query: { eventId: ev.id } })
  } catch (e: any) {
    joinErr[ev.id] = humanizeError(e)
    console.error('join error:', e)
  } finally {
    joinBusy[ev.id] = false
  }
}

/* ======== NEW: Click handler for the wheel mask (now guards active slide) ======== */
function maskTitle(ev: EventRow, i?: number): string {
  if (typeof i === 'number' && i !== activeIndex.value) return 'Bring this card to front to join'
  if (alreadyJoined(ev.id)) return 'Enter waiting area'
  if (ev.status !== 'open') return 'Event is not open'
  if (slotsLeft(ev) <= 0) return 'Event is full'
  if (!hasEnoughBalance(ev)) return 'Insufficient balance'
  return 'Click to join'
}
function onWheelClick(ev: EventRow, i?: number) {
  // Only allow if this is the active/front card
  if (typeof i === 'number' && i !== activeIndex.value) return

  // If user already joined, go to waiting area
  if (alreadyJoined(ev.id)) {
    playBeep(1100, 0.08, 'square')
    router.push({ name: 'user.waiting', query: { eventId: ev.id } })
    return
  }
  // If not eligible, surface a friendly error (keeps messages section working)
  if (ev.status !== 'open') {
    joinErr[ev.id] = 'Event is not open.'
    return
  }
  if (slotsLeft(ev) <= 0) {
    joinErr[ev.id] = 'Event is full.'
    return
  }
  if (!hasEnoughBalance(ev)) {
    joinErr[ev.id] = 'Insufficient balance to join this event.'
    return
  }
  // Eligible → tiny feedback + proceed to join
  playBeep(900, 0.06, 'triangle')
  join(ev)
}

function clearPerJoinMessages() {
  for (const k of Object.keys(joinErr)) delete joinErr[k]
  for (const k of Object.keys(joinOk)) delete joinOk[k]
}

async function reload() {
  console.log('[UI] Manual reload triggered.')
  await loadOpenEvents()
}

/** ===================== UPDATED: Resolve product images from the "prize product" bucket ===================== */
const PRIZE_BUCKET = 'prize_product'
const PRIZE_ROOT = 'products'

function isImageByName(name: string | undefined | null) {
  if (!name) return false
  return /\.(png|jpe?g|webp|gif|bmp|heic|avif)$/i.test(name)
}

async function firstImagePathForProduct(productId: string): Promise<string | null> {
  try {
    const dir = `${PRIZE_ROOT}/${productId}`
    const { data: files, error: listErr } = await supabase.storage
      .from(PRIZE_BUCKET)
      .list(dir, { limit: 10 })
    if (listErr) {
      console.warn('[IMG] list error for', dir, listErr.message)
      return null
    }
    if (!files || files.length === 0) return null
    const candidate =
      files.find((f: any) => (f?.metadata?.mimetype || '').startsWith('image/')) ||
      files.find((f: any) => isImageByName(f?.name)) ||
      files[0]
    if (!candidate?.name) return null
    return `${dir}/${candidate.name}`
  } catch (e: any) {
    console.warn('[IMG] firstImagePathForProduct failed:', e?.message || e)
    return null
  }
}

async function signedUrlWithCB(
  bucket: string,
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) {
    console.warn('[IMG] createSignedUrl error:', error.message)
    return null
  }
  const url = data?.signedUrl ?? null
  return url ? `${url}&cb=${Date.now()}` : null
}

async function attachPrizeImages(list: EventRow[]) {
  try {
    if (!list || list.length === 0) return
    await Promise.all(
      list.map(async (ev) => {
        if (!ev?.product_id) {
          ev.imageUrl = null
          return
        }
        const path = await firstImagePathForProduct(ev.product_id)
        if (!path) {
          ev.imageUrl = null
          return
        }
        ev.imageUrl = await signedUrlWithCB(PRIZE_BUCKET, path)
      }),
    )
    console.log('[IMG] Attached signed URLs for', list.length, 'events')
  } catch (e: any) {
    console.error('attachPrizeImages error:', e?.message || e)
    list.forEach((e) => (e.imageUrl = null))
  }
}

/* ---------------- Avatars helpers ---------------- */

function normalizeToPath(maybePath: string | null | undefined): string | null {
  if (!maybePath) return null
  if (/^https?:\/\//i.test(maybePath)) return maybePath
  return maybePath.replace(/^\/+/, '')
}

async function signUserProfileUrl(path: string): Promise<string | null> {
  if (/^https?:\/\//i.test(path)) return path
  const { data, error } = await supabase.storage.from('user_profile').createSignedUrl(path, 60 * 60)
  if (error) {
    console.warn('[AVATAR] sign error:', error.message)
    return null
  }
  const url = data?.signedUrl ?? null
  return url ? `${url}&cb=${Date.now()}` : null
}

const AVATAR_LIMIT = 12
async function refreshParticipantAvatars(eventId: string) {
  try {
    const { data: entries, error: entryErr } = await supabase
      .schema('games')
      .from('entry')
      .select('user_id, joined_at')
      .eq('event_id', eventId)
      .order('joined_at', { ascending: false })
      .limit(AVATAR_LIMIT)

    if (entryErr) throw entryErr
    const userIds = Array.from(new Set((entries ?? []).map((r) => r.user_id))).filter(Boolean)
    if (userIds.length === 0) {
      if (!isAlive.value) return
      avatarsByEvent[eventId] = []
      return
    }

    const { data: users, error: usersErr } = await supabase
      .schema('public')
      .from('users')
      .select('id, full_name, profile_url')
      .in('id', userIds)

    if (usersErr) throw usersErr
    if (!isAlive.value) return

    const map = new Map<string, { full_name: string | null; profile_url: string | null }>()
    for (const u of (users ?? []) as Array<{
      id: string
      full_name: string | null
      profile_url: string | null
    }>) {
      map.set(u.id, { full_name: u.full_name ?? null, profile_url: u.profile_url ?? null })
    }

    const list: AvatarInfo[] = []
    for (const e of entries ?? []) {
      const user = map.get(e.user_id)
      if (!user) continue
      const path = normalizeToPath(user.profile_url)
      let url: string | null = null
      if (path) url = await signUserProfileUrl(path)
      list.push({
        user_id: e.user_id,
        name: user.full_name,
        avatarUrl: url,
      })
    }
    if (!isAlive.value) return
    avatarsByEvent[eventId] = list
    console.log('[AVATAR] Updated', eventId, '->', list.length)
  } catch (e: any) {
    console.warn('[AVATAR] refreshParticipantAvatars failed for', eventId, e?.message || e)
  }
}

/* ---------------- Realtime wiring ---------------- */
let eventsChannel: ReturnType<typeof supabase.channel> | null = null
let entriesChannel: ReturnType<typeof supabase.channel> | null = null
let productsChannel: ReturnType<typeof supabase.channel> | null = null
let usersChannel: ReturnType<typeof supabase.channel> | null = null

function subscribeRealtime() {
  console.log('[RT] Subscribing to games.event, games.entry, games.products, public.users…')

  const guard = <T extends any[]>(fn: (...args: T) => any) => {
    return (...args: T) => {
      if (!isAlive.value) return
      return fn(...args)
    }
  }

  // EVENTS
  eventsChannel = supabase
    .channel(`rt-games-event-${sessionId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'event' },
      guard(async (payload: any) => {
        const type = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        console.log('[RT:event]', type, { new: payload.new, old: payload.old })
        if (!isAlive.value) return

        if (type === 'INSERT') {
          const row = payload.new as EventRow
          if (row.status === 'open') {
            if (!idxById.value.has(row.id)) {
              const clone = { ...row }
              await attachPrizeImages([clone])
              await attachProductPrices([clone])
              if (!isAlive.value) return
              events.value = [clone, ...events.value]
              console.log('[RT:event] INSERT added ->', row.id)
              await loadMyEntriesFor([row.id])
              await refreshEntryCount(row.id)
              await refreshParticipantAvatars(row.id)
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
              delete entryCounts[row.id]
              delete avatarsByEvent[row.id]
            } else {
              const merged = { ...events.value[i], ...row }
              if (merged.product_id !== events.value[i].product_id) {
                await attachPrizeImages([merged])
                await attachProductPrices([merged])
                console.log('[RT:event] UPDATE product changed -> refreshed image/price', row.id)
              }
              if (!isAlive.value) return
              events.value.splice(i, 1, merged)
              console.log('[RT:event] UPDATE merged ->', row.id)
              await refreshEntryCount(row.id)
              await refreshParticipantAvatars(row.id)
            }
          } else if (isOpen && !wasOpen) {
            const clone = { ...row }
            await attachPrizeImages([clone])
            await attachProductPrices([clone])
            if (!isAlive.value) return
            events.value = [clone, ...events.value]
            await loadMyEntriesFor([row.id])
            await refreshEntryCount(row.id)
            await refreshParticipantAvatars(row.id)
            console.log('[RT:event] UPDATE became open -> added', row.id)
          }
        } else if (type === 'DELETE') {
          const oldId = payload.old?.id as string | undefined
          if (oldId && idxById.value.has(oldId)) {
            const i = idxById.value.get(oldId)!
            events.value.splice(i, 1)
            console.log('[RT:event] DELETE removed ->', oldId)
            delete entryCounts[oldId]
            delete avatarsByEvent[oldId]
          }
        }

        // keep active index in bounds
        if (activeIndex.value > events.value.length - 1) activeIndex.value = 0
      }),
    )
    .subscribe(
      guard((status) => {
        console.log('[RT:event] subscription status:', status)
      }),
    )

  // ENTRIES
  entriesChannel = supabase
    .channel(`rt-games-entry-${sessionId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'entry' },
      guard(async (payload: any) => {
        const type = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        console.log('[RT:entry]', type, { new: payload.new, old: payload.old })
        if (!isAlive.value) return

        const affectedEventId: string | undefined =
          (type === 'DELETE' ? payload.old?.event_id : payload.new?.event_id) || undefined
        if (!affectedEventId) return

        await refreshEntryCount(affectedEventId)
        await refreshParticipantAvatars(affectedEventId)
        if (!isAlive.value) return

        if (idxById.value.has(affectedEventId)) {
          const latest = await fetchEventById(affectedEventId)
          if (latest && isAlive.value) {
            const i = idxById.value.get(affectedEventId)!
            const merged = { ...events.value[i], ...latest }
            events.value.splice(i, 1, merged)
            console.log('[RT:entry] refreshed event snapshot ->', affectedEventId)

            if (merged.status !== 'open') {
              events.value.splice(i, 1)
              console.log('[RT:entry] event left open -> removed', affectedEventId)
              delete avatarsByEvent[affectedEventId]
            }
          } else {
            console.log('[RT:entry] event not found (maybe deleted) ->', affectedEventId)
          }
          await loadMyEntriesFor([affectedEventId])
        }

        if (activeIndex.value > events.value.length - 1) activeIndex.value = 0
      }),
    )
    .subscribe(
      guard((status) => {
        console.log('[RT:entry] subscription status:', status)
      }),
    )

  // PRODUCTS
  productsChannel = supabase
    .channel(`rt-games-products-${sessionId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'games', table: 'products' },
      guard(async (payload: any) => {
        console.log('[RT:product] UPDATE', { new: payload.new, old: payload.old })
        const prodId = payload.new?.id as string | undefined
        if (!prodId || !isAlive.value) return
        const affected: EventRow[] = events.value.filter((e) => e.product_id === prodId)
        if (affected.length > 0) {
          await attachPrizeImages(affected)
          const newPrice = payload.new?.price
          if (typeof newPrice !== 'undefined') {
            for (const e of affected) e.product_price = newPrice
          } else {
            await attachProductPrices(affected)
          }
          if (!isAlive.value) return
          for (const e of affected) {
            const i = idxById.value.get(e.id)
            if (i != null) {
              events.value.splice(i, 1, { ...events.value[i] })
            }
          }
          console.log('[RT:product] refreshed prize images/prices for', affected.length, 'event(s)')
        }
      }),
    )
    .subscribe(
      guard((status) => {
        console.log('[RT:product] subscription status:', status)
      }),
    )

  // USERS — update avatars & balance
  usersChannel = supabase
    .channel(`rt-public-users-${sessionId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'users' },
      guard(async (payload: any) => {
        const uid = payload.new?.id as string | undefined
        if (!uid) return

        try {
          const { data: a } = await supabase.auth.getUser()
          const me = a?.user?.id
          if (me && uid === me && typeof payload.new?.balance !== 'undefined') {
            userBalance.value = Number(payload.new.balance ?? 0)
            console.log('[RT:users] balance updated ->', userBalance.value)
          }
        } catch {}

        const profileChanged =
          payload.new?.profile_url !== payload.old?.profile_url ||
          payload.new?.full_name !== payload.old?.full_name

        if (!profileChanged || !isAlive.value) return

        const impactedEventIds: string[] = []
        for (const [eventId, list] of Object.entries(avatarsByEvent)) {
          if (list?.some((p) => p.user_id === uid)) impactedEventIds.push(eventId)
        }

        if (impactedEventIds.length === 0) return

        console.log(
          '[RT:users] profile update for',
          uid,
          'impacts',
          impactedEventIds.length,
          'event(s)',
        )
        await Promise.all(impactedEventIds.map((eid) => refreshParticipantAvatars(eid)))
      }),
    )
    .subscribe(
      guard((status) => {
        console.log('[RT:users] subscription status:', status)
      }),
    )
}

async function fetchEventById(id: string): Promise<EventRow | null> {
  const { data, error } = await supabase
    .schema('games')
    .from('event')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    console.warn('[FETCH] Event not found:', id, error?.message)
    return null
  }
  const row = data as EventRow
  if (row.product_id) {
    await attachPrizeImages([row])
    await attachProductPrices([row])
  } else {
    row.imageUrl = null
  }
  return row
}

async function refreshEntryCount(eventId: string) {
  try {
    const { count, error } = await supabase
      .schema('games')
      .from('entry')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    if (error) throw error
    const c = typeof count === 'number' ? count : 0
    if (!isAlive.value) return
    entryCounts[eventId] = c

    const i = idxById.value.get(eventId)
    if (i != null && isAlive.value) {
      const patched = { ...events.value[i], player_count: c }
      events.value.splice(i, 1, patched)
    }
    console.log('[COUNT] event', eventId, 'joined =', c)
  } catch (e: any) {
    console.warn('[COUNT] refreshEntryCount failed for', eventId, e?.message || e)
  }
}

/* ---------------- Game HUD vars & 3D tilt ---------------- */
function hudVars(ev: EventRow) {
  const cap = Math.max(1, Number(ev.player_cap || 1))
  const ratio = Math.min(1, Math.max(0, joinedCount(ev) / cap))
  return {
    '--hud-deg': `${(ratio * 360).toFixed(1)}deg`,
    '--hud-ratio': String(ratio),
  } as CSSProperties
}
const tilt = reactive<{ rx: string; ry: string }>({ rx: '0deg', ry: '0deg' })
function cardStyle(ev: EventRow, i: number) {
  if (i === activeIndex.value) {
    return { ...hudVars(ev), '--rx': tilt.rx, '--ry': tilt.ry } as CSSProperties
  }
  return hudVars(ev)
}
function onCardMove(e: MouseEvent, i: number) {
  if (i !== activeIndex.value) return
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width - 0.5
  const py = (e.clientY - r.top) / r.height - 0.5
  tilt.ry = `${(px * 8).toFixed(2)}deg`
  tilt.rx = `${(-py * 8).toFixed(2)}deg`
}
function onCardLeave(i: number) {
  if (i !== activeIndex.value) return
  tilt.rx = '0deg'
  tilt.ry = '0deg'
}

/* ---------------- lifecycle ---------------- */
function safeLogUnmountStatus(_: any, tag: string) {
  try {
    console.log(`[RT:${tag}] tearing down`)
  } catch {}
}
function safeUnsubscribe(ch: ReturnType<typeof supabase.channel> | null) {
  if (!ch) return
  try {
    ch.unsubscribe().catch(() => {})
  } catch {}
  try {
    supabase.removeChannel(ch)
  } catch {}
}
let teardownStarted = false

onMounted(() => {
  console.log('[LIFECYCLE] Mounted -> loading + subscribing')
  isAlive.value = true
  // viewport listener for mobile-friendly layout
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize, { passive: true })
  }
  loadUserBalance()
  loadOpenEvents()
  subscribeRealtime()
})

onUnmounted(() => {
  if (teardownStarted) return
  teardownStarted = true

  console.log('[LIFECYCLE] Unmounting -> removing channels')
  isAlive.value = false

  // remove viewport listener
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }

  nextTick(() => {
    safeLogUnmountStatus(eventsChannel, 'event')
    safeUnsubscribe(eventsChannel)
    eventsChannel = null

    safeLogUnmountStatus(entriesChannel, 'entry')
    safeUnsubscribe(entriesChannel)
    entriesChannel = null

    safeLogUnmountStatus(productsChannel, 'product')
    safeUnsubscribe(productsChannel)
    productsChannel = null

    safeLogUnmountStatus(usersChannel, 'users')
    safeUnsubscribe(usersChannel)
    usersChannel = null

    try {
      events.value = []
      Object.keys(entryCounts).forEach((k) => delete entryCounts[k])
      Object.keys(avatarsByEvent).forEach((k) => delete avatarsByEvent[k])
    } catch {}
  })
})
</script>

<style scoped>
/* (UNCHANGED STYLES + the avatar styles) */

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
  .spin-card__halo,
  .slider__item {
    animation: none !important;
    transition: none !important;
  }
}

/* ===================== SLIDER (inspired by your SCSS snippet) ===================== */
.slider {
  position: relative;
  user-select: none;
  outline: none;
}
.slider__holder {
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  min-height: 740px; /* space for stacked cards */
  overflow: hidden; /* keeps it inside the bg */
  /* ⭐ Enable vertical scroll on page while tracking horizontal drags on mobile */
  touch-action: pan-y;
}
@media (max-width: 1200px) {
  .slider__holder {
    max-width: 980px;
  }
}
@media (max-width: 992px) {
  .slider__holder {
    max-width: 760px;
    min-height: 680px;
  }
}
@media (max-width: 600px) {
  .slider__holder {
    max-width: 96%;
    /* ⭐ Give more vertical room on phones so nothing feels cramped */
    min-height: 640px; /* was 480px */
  }
}

.slider__item {
  position: absolute;
  top: 0;
  left: 50%;
  display: block;
  width: min(860px, 92%);
  cursor: pointer;
  transition:
    transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1),
    opacity 0.35s ease,
    filter 0.35s ease;
  will-change: transform, opacity, filter;
  filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.08));
}
/* ⭐ Slight grab affordance on phones */
@media (max-width: 600px) {
  .slider__item {
    cursor: grab;
  }
  .slider__item:active {
    cursor: grabbing;
  }
}
.slider__item.is-active .spin-card {
  box-shadow:
    0 14px 40px rgba(67, 97, 238, 0.18),
    0 0 0 1px rgba(67, 97, 238, 0.12);
}

/* Bullets */
.bullets {
  z-index: 5;
  display: block;
  width: auto;
  height: 10px;
  margin: 24px auto 0;
  text-align: center;
}
.bullets__item {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0 4px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  border: 0;
  transition: transform 0.15s ease;
}
.bullets__item:hover {
  background: #fff;
}
.bullets__item.is-active {
  background: #4361ee;
  transform: scale(1.2);
}

/* Optional nav buttons */
.slider__nav {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}
.slider__btn {
  pointer-events: all;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 0;
  background: rgba(0, 0, 0, 0.08);
  display: grid;
  place-items: center;
  font-size: 22px;
  line-height: 1;
  margin: 0 8px;
  transition:
    background 0.2s ease,
    transform 0.15s ease;
}
.slider__btn:hover {
  background: rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}
/* ⭐ Hide arrows on phones (bullets + swipe/keys are enough) */
@media (max-width: 600px) {
  .slider__nav {
    display: none;
  }
}

/* ===================== CARD / WHEEL (unchanged except clickable mask micro-interactions) ===================== */
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
/* ⭐ On touch devices avoid hover lift to keep layout steady */
@media (hover: none) {
  .spin-card:hover {
    transform: none;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
  }
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

/* ⭐ Slightly tighter padding on small screens for more breathing room overall */
@media (max-width: 600px) {
  .spin-card__body {
    padding: 0.85rem !important;
  }
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
/* Progress ring HUD (driven by --hud-deg) */
.spin-wheel::after {
  content: '';
  position: absolute;
  width: 94%;
  height: 94%;
  border-radius: 50%;
  background: conic-gradient(#7c3aed var(--hud-deg, 0deg), rgba(0, 0, 0, 0.06) 0);
  -webkit-mask: radial-gradient(circle 46% at 50% 50%, transparent 96%, #000 98%);
  mask: radial-gradient(circle 46% at 50% 50%, transparent 96%, #000 98%);
  filter: drop-shadow(0 2px 8px rgba(124, 58, 237, 0.25));
  z-index: 0;
}
.spin-wheel--paused .spin-wheel__ring {
  animation-play-state: paused;
}
.spin-wheel__ring {
  position: absolute;
  width: 84%;
  height: 84%;
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
  z-index: 1;
}
.spin-card:hover .spin-wheel__ring {
  filter: saturate(1.1) brightness(1.02);
}
@keyframes ringSpin {
  to {
    transform: rotate(360deg);
  }
}

/* CLICKABLE MASK micro-interactions */
.spin-wheel__mask {
  position: relative;
  width: 62%;
  height: 62%;
  border-radius: 50%;
  overflow: hidden;
  background: #f6f7fb;
  border: 8px solid #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  z-index: 2;
}
.spin-wheel__mask.is-clickable {
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.2s ease;
}
.spin-wheel__mask.is-clickable:hover {
  transform: scale(1.025);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.12);
}
.spin-wheel__mask.is-clickable:active {
  transform: scale(0.995);
}
.spin-wheel__mask.is-clickable:focus {
  outline: 0;
  box-shadow:
    0 0 0 3px rgba(67, 97, 238, 0.2),
    0 8px 20px rgba(0, 0, 0, 0.1);
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
  z-index: 3;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08));
}

/* --- Stats Row --- */
.spin-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
@media (max-width: 480px) {
  .spin-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
}
/* ⭐ Ultra-small phones: stack stats for zero squeeze */
@media (max-width: 420px) {
  .spin-stats {
    grid-template-columns: 1fr;
    gap: 0.45rem;
  }
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

/* --- Avatars --- */
.avatar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.avatars {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  max-height: 44px;
  overflow: hidden;
}
.avatar-img,
.avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  overflow: hidden;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
}
.avatar-img {
  object-fit: cover;
}
.avatar-img:hover {
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.25);
}
.avatar-fallback {
  color: #94a3b8;
  font-size: 1rem;
  background: #f1f5f9;
}
.avatar-more {
  font-size: 0.8rem;
  color: #6c757d;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 999px;
  padding: 0.2rem 0.5rem;
}
@media (max-width: 600px) {
  .avatar-img,
  .avatar-fallback {
    width: 28px;
    height: 28px;
  }
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

/* --- Join button micro-interactions (kept for compatibility; button removed) --- */
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

/* ===================== NEW — GAME SURFACE & ARCADE ACCENTS ===================== */
/* Neon gradient canvas */
.game-surface {
  background:
    radial-gradient(1200px 600px at 10% -10%, rgba(67, 97, 238, 0.12), transparent 60%),
    radial-gradient(800px 500px at 110% 0%, rgba(124, 58, 237, 0.12), transparent 60%),
    linear-gradient(180deg, #f6f7fb 0%, #eef1f7 100%);
  padding: 24px 12px;
}
.game-card {
  overflow: hidden;
  position: relative;
  border-radius: 24px;
}
.game-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(67, 97, 238, 0.35),
    rgba(124, 58, 237, 0.28),
    rgba(16, 185, 129, 0.28)
  );
  opacity: 0.12;
  pointer-events: none;
}
.game-card__body {
  position: relative;
  z-index: 1;
  /* Helps keep background animation isolated behind content */
  isolation: isolate;
}

/* ⭐ NEW BG: CSS-only animated background (no JS, no mouse) */
.game-bg-anim {
  position: absolute;
  inset: 0;
  z-index: 0; /* sit behind the content */
  pointer-events: none; /* never block clicks */
  opacity: 0.45;
  background:
    radial-gradient(1200px 800px at 10% -10%, rgba(67, 97, 238, 0.2), transparent 60%),
    radial-gradient(900px 600px at 110% 0%, rgba(124, 58, 237, 0.18), transparent 60%),
    conic-gradient(
      from 0deg,
      rgba(16, 185, 129, 0.12),
      rgba(67, 97, 238, 0.12),
      rgba(124, 58, 237, 0.12),
      rgba(16, 185, 129, 0.12)
    );
  animation: bgSlowSpin 24s linear infinite;
  /* soft vignette to avoid clashing with text */
  -webkit-mask-image: radial-gradient(85% 85% at 50% 40%, #000 70%, transparent 100%);
  mask-image: radial-gradient(85% 85% at 50% 40%, #000 70%, transparent 100%);
}
@keyframes bgSlowSpin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .game-bg-anim {
    animation: none;
  }
}

/* Glossy title w/ glow underline */
.game-title {
  position: relative;
  display: inline-block;
  padding-bottom: 4px;
}
.game-title__glow {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -3px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #4361ee, #7c3aed, #10b981);
  filter: blur(0.6px);
}

/* Subheader accent */
.game-sub {
  position: relative;
  padding-left: 10px;
}
.game-sub::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(180deg, #7c3aed, #4361ee);
}

/* Gradient border accent around spin-card (non-destructive) */
.spin-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(67, 97, 238, 0.32),
    rgba(124, 58, 237, 0.28),
    rgba(16, 185, 129, 0.28)
  );

  /* WebKit + standard (fixes css(vendorPrefix) warning) */
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);

  /* Safari uses xor; standard equivalent is exclude */
  -webkit-mask-composite: xor;
  mask-composite: exclude;

  pointer-events: none;
}


/* Success sparkle burst (triggered via data-joined) */
.spin-card[data-joined='true']::after {
  --c: rgba(255, 215, 97, 0.95);
  content: '';
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(10px 10px at 30% 45%, var(--c), transparent 60%),
    radial-gradient(8px 8px at 70% 30%, var(--c), transparent 60%),
    radial-gradient(6px 6px at 55% 75%, var(--c), transparent 60%),
    radial-gradient(7px 7px at 80% 60%, var(--c), transparent 60%),
    radial-gradient(5px 5px at 20% 70%, var(--c), transparent 60%);
  animation: popSpark 0.65s ease-out forwards;
  pointer-events: none;
}
@keyframes popSpark {
  from {
    opacity: 0;
    transform: scale(0.85);
    filter: blur(2px);
  }
  30% {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: scale(1.25);
    filter: blur(6px);
  }
}

/* HUD: slot progress underline */
.slots-hud {
  position: relative;
}
.slots-hud::after {
  content: '';
  height: 2px;
  width: 64px;
  margin-left: 8px;
  background: repeating-linear-gradient(90deg, #10b981 0 6px, rgba(16, 185, 129, 0.3) 6px 12px);
  display: inline-block;
  border-radius: 999px;
  opacity: 0.6;
}

/* 3D tilt override (keeps original hover lift intact) */
.spin-card {
  transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(0);
}
.spin-card:hover {
  transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(-2px);
}

/* Extra emphasis for active card */
.slider__item.is-active .spin-wheel__mask.is-clickable {
  box-shadow: 0 8px 26px rgba(67, 97, 238, 0.22);
}

/* ===================== END NEW ===================== */
</style>
