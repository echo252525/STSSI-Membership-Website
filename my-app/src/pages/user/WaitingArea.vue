<template>
  <div class="container py-4 waiting-area-root">
    <!-- Neon gradient lobby background -->
    <div class="wa-aurora"></div>
    <div class="wa-grid"></div>

    <div class="card border-0 shadow-sm rounded-4 wa-card">
      <div class="card-body p-4 text-center position-relative">
        <!-- Title / subtitle -->
        <div class="wa-title-wrap">
          <h2 class="h4 mb-2 fw-semibold wa-title">Waiting Area</h2>
          <p class="text-secondary mb-0 wa-subtext">
            You’ve joined <strong>{{ event?.title || 'the event' }}</strong>. Settle in—your game starts soon.
          </p>
        </div>

        <!-- Players pill + progress -->
        <div v-if="event" class="wa-lobby-top mt-3">
          <div class="wa-lobby-row">
            <span class="badge rounded-pill px-3 py-2 wa-pill">
              Players&nbsp;·&nbsp;<strong>{{ event.player_count }}</strong>/<span class="text-muted">{{ event.player_cap }}</span>
            </span>
            <span class="badge rounded-pill px-3 py-2 wa-pill-soft text-capitalize">{{ event.status }}</span>
          </div>

          <div class="wa-progress-wrap mt-3" role="progressbar" :aria-valuenow="progressPct" aria-valuemin="0" aria-valuemax="100">
            <div class="wa-progress-bar" :style="{ width: progressPct + '%' }"></div>
            <div class="wa-progress-label">{{ progressPct }}%</div>
          </div>
        </div>

        <!-- 🆕 Joined players grid -->
        <div v-if="event" class="mt-4">
          <div class="d-flex align-items-center justify-content-between mb-2 px-1">
            <div class="text-start">
              <div class="fw-semibold">Players in lobby</div>
              <div class="small text-secondary">
                Showing users with status <code class="text-light">joined</code>
              </div>
            </div>
            <div class="small text-secondary">
              {{ joinedUsers.length }} joined
            </div>
          </div>

          <div class="wa-users-grid">
            <!-- loading skeletons -->
            <template v-if="loadingJoined">
              <div v-for="n in 6" :key="'s'+n" class="wa-user-card">
                <div class="wa-avatar-skeleton"></div>
                <div class="wa-username-skeleton"></div>
              </div>
            </template>

            <!-- users -->
            <template v-else>
              <div
                v-for="u in joinedUsers"
                :key="u.id"
                class="wa-user-card"
                :title="u.full_name || '—'"
              >
                <img
                  v-if="u.avatar_url"
                  :src="u.avatar_url"
                  class="wa-avatar"
                  alt="avatar"
                  @error="e => (e.target as HTMLImageElement).style.display = 'none'"
                />
                <div v-else class="wa-avatar wa-avatar-fallback">
                  {{ initials(u.full_name) }}
                </div>
                <div class="wa-username text-truncate">
                  {{ u.full_name || '—' }}
                </div>
              </div>

              <div v-if="!joinedUsers.length" class="text-secondary small py-2">
                No one has joined yet. Share the lobby to fill it up!
              </div>
            </template>
          </div>
        </div>
        <!-- /Joined players grid -->

        <!-- Product image: centered round tile -->
        <div class="wa-image-frame mt-4">
          <div v-if="imageLoading" class="wa-img-skeleton-circle"></div>
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Event Prize"
            class="wa-image-circle"
            @load="imageLoading = false"
            @error="imageLoading = false"
          />
          <div class="wa-ring"></div>
        </div>

        <!-- Minimal spinner + dots -->
        <div class="mb-4 mt-3">
          <div class="wa-spinner-wrap" aria-hidden="true">
          </div>
          <div class="wa-dots mt-3" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <div v-if="isLoading" class="small text-muted mt-2">Loading event…</div>
        </div>

        <!-- Lobby stat chips (no IDs) -->
        <div v-if="!isLoading && event" class="wa-stats-grid mt-2">
          <div class="wa-stat">
            <div class="wa-stat-label">Entry Fee</div>
            <div class="wa-stat-value">{{ formatMoney(event.entry_fee) }}</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-label">Winner Prize</div>
            <div class="wa-stat-value">{{ formatMoney(event.winner_price) }}</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-label">Loser Refund</div>
            <div class="wa-stat-value">{{ formatMoney(event.loser_refund_amount) }}</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-label">Interest / Loser</div>
            <div class="wa-stat-value">{{ formatMoney(event.interest_per_loser) }}</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-label">Interest Pool</div>
            <div class="wa-stat-value">{{ formatMoney(event.interest_pool) }}</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-label">Item Cost</div>
            <div class="wa-stat-value">{{ formatMoney(event.item_supplier_cost) }}</div>
          </div>
        </div>

        <!-- Meta row (HIDDEN) -->
        <div v-if="!isLoading && event" class="wa-meta mt-3 d-none">
          <div class="wa-meta-item">
            <span class="wa-meta-k">Created</span>
            <span class="wa-meta-v">{{ formatDate(event.created_at) }}</span>
          </div>
          <div class="wa-meta-item">
            <span class="wa-meta-k">Updated</span>
            <span class="wa-meta-v">{{ formatDate(event.updated_at) }}</span>
          </div>
        </div>

        <!-- Tip marquee -->
        <div class="wa-tips mt-4" aria-live="polite">
          <div class="wa-tips-track">
            <span class="wa-tip">Tip: Don’t close the tab—your slot is reserved while you wait.</span>
            <span class="wa-dot">•</span>
            <span class="wa-tip">Your chance improves when the lobby fills. Invite a friend to speed it up.</span>
            <span class="wa-dot">•</span>
            <span class="wa-tip">Prizes are revealed at start. Good luck!</span>
          </div>
        </div>

        <!-- Back / confirm -->
        <div class="d-flex flex-column align-items-center gap-2 mt-4">
          <button
            class="btn btn-outline-secondary wa-leave-btn"
            :disabled="deleting || isLoading"
            @click="openConfirm"
          >
            <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
            ← Back
          </button>
          <div class="text-muted small">
            Going back will <strong>free your slot</strong>.
          </div>
        </div>

        <div v-if="err" class="text-danger small mt-3">{{ err }}</div>
      </div>
    </div>

    <!-- (Kept) Event card wrapper below if you want to place extra content later -->
    <div class="card border-0 shadow-sm rounded-4 mt-3 d-none">
      <div class="card-body p-4"></div>
    </div>

    <!-- Confirm modal -->
    <div v-if="showConfirm" class="wa-modal-backdrop" @click.self="closeConfirm">
      <div class="wa-modal card rounded-4 shadow-sm">
        <div class="card-body p-4">
          <h5 class="mb-2 fw-semibold">Leave waiting area?</h5>
          <p class="mb-4 text-secondary">
            If you go back now, your reserved slot for this event will be removed.
          </p>
          <div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-light" @click="closeConfirm">Stay</button>
            <button class="btn btn-danger" :disabled="deleting" @click="confirmLeave">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Leave & free my slot
            </button>
          </div>
        </div>
        <button class="wa-modal-close" @click="closeConfirm" aria-label="Close">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const route = useRoute()
const router = useRouter()

const eventId = route.query.eventId as string | undefined
const deleting = ref(false)
const err = ref<string>('')

// NEW: loading states
const isLoading = ref(true)
const imageLoading = ref(true)

// 🔒 NEW: suppress deletion when we intentionally navigate to the game event
const suppressDelete = ref(false)

// display state
type EventRow = {
  id: string
  title: string
  item_supplier_cost: number
  entry_fee: number
  player_count: number
  interest_pool: number
  status: string
  created_by: string | null
  created_at: string
  updated_at: string
  product_id: string
  player_cap: number
  user_id_winner: string | null
  interest_per_loser: number
  winner_price: number
  loser_refund_amount: number
}
const event = ref<EventRow | null>(null)
const imageUrl = ref<string | null>(null)

// 🆕 joined users state
type UserProfile = { id: string; full_name: string | null; avatar_url?: string | null }
const joinedUsers = ref<UserProfile[]>([])
const loadingJoined = ref<boolean>(true)

// Progress (players / cap) as %
const progressPct = computed<number>(() => {
  if (!event.value) return 0
  const cap = Number(event.value.player_cap || 0)
  const cnt = Number(event.value.player_count || 0)
  if (!cap) return 0
  const pct = Math.max(0, Math.min(100, Math.round((cnt / cap) * 100)))
  return pct
})

// ===== CONFIG per your setup =====
const PRODUCT_BUCKET = 'prize_product' // product images bucket
const AVATAR_BUCKET  = 'user_profile'  // 🆕 user avatars bucket
const READY_STATUS = 'ready'

function isHttpUrl(path?: string | null) {
  return !!path && /^https?:\/\//i.test(path)
}

/**
 * Create a SIGNED URL for a storage object path in the 'prize_product' bucket.
 * If the product_url is already http(s), it is returned as-is.
 */
async function toSignedUrl(path: string | null | undefined, expiresIn = 3600): Promise<string | null> {
  if (!path) return null
  if (isHttpUrl(path)) return path
  const { data, error } = await supabase
    .storage
    .from(PRODUCT_BUCKET)
    .createSignedUrl(path, expiresIn, { download: false })
  if (error) {
    console.error('createSignedUrl error:', error)
    return null
  }
  return data?.signedUrl || null
}

/**
 * 🆕 Create a SIGNED URL for a storage object path in the 'user_profile' bucket.
 * If the profile_url is already http(s), it is returned as-is.
 */
async function toSignedAvatar(path: string | null | undefined, expiresIn = 3600): Promise<string | null> {
  if (!path) return null
  if (isHttpUrl(path)) return path
  const { data, error } = await supabase
    .storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(path, expiresIn, { download: false })
  if (error) {
    console.error('avatar createSignedUrl error:', error)
    return null
  }
  return data?.signedUrl || null
}

/**
 * (Kept for compatibility; not used for the main image since we require signed URL)
 */
function toPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (isHttpUrl(path)) return path
  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path)
  return data?.publicUrl || null
}

// ===== Confirmation modal state =====
const showConfirm = ref(false)
function openConfirm() { showConfirm.value = true }
function closeConfirm() { if (!deleting.value) showConfirm.value = false }
async function confirmLeave() { await goBack() }

// ===== 🔵 Navigation to GamesEvent.vue when lobby locks =====
const redirected = ref(false)

// ✅ NEW: helper to detect if we're navigating to the games event route for THIS event
const EVENT_ROUTE_NAMES = ['user.minigames.event', 'user.games.event', 'games.event']
function isGamesEventRoute(to: any) {
  if (!to) return false
  const nameOk = to.name && EVENT_ROUTE_NAMES.includes(String(to.name))
  const pathOk = to.path && ['/app/mini-games/event', '/app/minigames/event', '/games/event'].includes(String(to.path))
  const qid = (to.query && to.query.eventId) ? String(to.query.eventId) : undefined
  const sameEvent = qid && eventId && qid === eventId
  return (nameOk || pathOk) && !!sameEvent
}

/* =========================================================================
   🆕 Charging logic: when marking ready, deduct entry_fee from users.balance
   ========================================================================= */
const chargedReady = ref(false) // session guard to avoid double-charging

/** Round the entry fee to an integer pesos amount for users.balance */
function normalizedFee(): number {
  const fee = Number(event.value?.entry_fee ?? 0)
  return Math.max(0, Math.round(fee))
}

async function chargeUserForEntry(userId: string): Promise<boolean> {
  try {
    const fee = normalizedFee()
    if (fee <= 0) return true // nothing to charge

    // 1) Get current balance
    const { data: urow, error: uerr } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()

    if (uerr) {
      err.value = 'Could not read your balance.'
      console.warn('[charge] read balance failed:', uerr)
      return false
    }

    const cur = Number(urow?.balance ?? 0)
    if (cur < fee) {
      err.value = 'Insufficient balance to join. Please top up.'
      console.warn('[charge] insufficient funds:', { cur, fee })
      return false
    }

    // 2) Deduct (note: two-step client-side update; acceptable here)
    const { error: updErr } = await supabase
      .from('users')
      .update({ balance: cur - fee })
      .eq('id', userId)

    if (updErr) {
      err.value = 'Could not deduct entry fee.'
      console.warn('[charge] update balance failed:', updErr)
      return false
    }

    console.log('[charge] deducted entry fee', { fee, newBalance: cur - fee })
    return true
  } catch (e) {
    console.warn('[charge] unexpected:', e)
    err.value = 'Payment failed unexpectedly.'
    return false
  }
}

/* 🆕 Set the user's entry.status='ready' and charge once */
async function markEntryReady() {
  try {
    if (!eventId) return
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr) {
      console.warn('[ready] auth.getUser failed:', userErr)
      return
    }
    const userId = userRes.user?.id
    if (!userId) return

    // Ensure we know the fee; fetch event if missing
    if (!event.value?.id) {
      await fetchEventAndImage()
      if (!event.value?.id) return
    }

    // Check current entry status to avoid double-deduct
    const { data: entryRow, error: entErr } = await supabase
      .schema('games')
      .from('entry')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle()

    if (entErr) {
      console.warn('[ready] entry lookup failed:', entErr)
      return
    }

    const alreadyReady = (entryRow?.status || '').toLowerCase() === READY_STATUS
    if (alreadyReady) {
      console.log('[ready] already ready, skipping charge/update')
      chargedReady.value = true
      return
    }

    // Charge first; if successful, move to ready
    if (!chargedReady.value) {
      const ok = await chargeUserForEntry(userId)
      if (!ok) return // stop; do not mark ready
      chargedReady.value = true
    }

    const { error: updErr } = await supabase
      .schema('games')
      .from('entry')
      .update({ status: READY_STATUS })
      .eq('event_id', eventId)
      .eq('user_id', userId)

    if (updErr) {
      console.warn('[ready] entry status update failed:', updErr)
    } else {
      console.log('[ready] entry marked as ready for', { eventId, userId, at: new Date().toISOString() })
    }
  } catch (e) {
    console.warn('[ready] unexpected error:', e)
  }
}

/* If backend flips our entry to ready via realtime, charge once as well */
async function ensureChargeOnRealtimeReady(payload: any) {
  try {
    const { data: userRes } = await supabase.auth.getUser()
    const uid = userRes.user?.id
    if (!uid) return
    const newStatus = String(payload?.new?.status || '').toLowerCase()
    const newUser = String(payload?.new?.user_id || '')
    if (newStatus === READY_STATUS && newUser === uid && !chargedReady.value) {
      // Make sure event is loaded for fee
      if (!event.value?.id) await fetchEventAndImage()
      const ok = await chargeUserForEntry(uid)
      if (ok) chargedReady.value = true
    }
  } catch (e) {
    console.warn('[realtime charge] error:', e)
  }
}

async function navigateToGamesEvent() {
  if (!eventId) return
  // prevent deletion on this programmatic navigation
  suppressDelete.value = true

  // 🆕 ensure our entry is marked ready (and charged) before redirect
  await markEntryReady()
  if (err.value) {
    // charging failed or balance insufficient; do not navigate
    suppressDelete.value = false
    return
  }

  // Try a few likely route names first; fall back to a path if needed.
  const candidates = [
    { name: 'user.minigames.event', query: { eventId } },
    { name: 'user.games.event', query: { eventId } },
    { name: 'games.event', query: { eventId } },
  ] as const

  for (const r of candidates) {
    try {
      await router.push(r as any)
      return
    } catch (_) { /* try next */ }
  }
  // Fallback: push by common path patterns; last resort set window.location
  const pathCandidates = [
    { path: '/app/mini-games/event', query: { eventId } },
    { path: '/app/minigames/event', query: { eventId } },
    { path: '/games/event', query: { eventId } },
  ]
  for (const r of pathCandidates) {
    try {
      await router.push(r as any)
      return
    } catch (_) { /* try next */ }
  }
  try {
    const url = `/app/mini-games/event?eventId=${encodeURIComponent(eventId)}`
    window.location.href = url
  } catch (_) {}
}

function isLockedStatus(s?: string | null) {
  return String(s || '').toLowerCase() === 'locked'
}

function maybeRedirect() {
  if (redirected.value) return
  const locked = isLockedStatus(event.value?.status)
  const cap = Number(event.value?.player_cap || 0)
  const cnt = Number(event.value?.player_count || 0)
  const full = cap > 0 && cnt >= cap
  if (locked || full) {
    redirected.value = true
    console.log('[redirect] Lobby locked/full → navigating to GamesEvent.vue')
    void navigateToGamesEvent()
  }
}

// ===== Load event + product image (uses games.products) =====
async function fetchEventAndImage() {
  isLoading.value = true
  imageLoading.value = true
  try {
    if (!eventId) {
      err.value = 'No event specified.'
      return
    }
    // 1) Get event
    const { data: ev, error: evErr } = await supabase
      .schema('games')
      .from('event')
      .select(`
        id, title, item_supplier_cost, entry_fee, player_count, interest_pool,
        status, created_by, created_at, updated_at, product_id, player_cap,
        user_id_winner, interest_per_loser, winner_price, loser_refund_amount
      `)
      .eq('id', eventId)
      .single()

    if (evErr) {
      console.error('Failed to load event:', evErr)
      err.value = 'Failed to load event details.'
      return
    }
    event.value = ev as EventRow
    console.log('[waiting-area] fetched event', {
      id: ev.id,
      player_count: ev.player_count,
      status: ev.status,
      at: new Date().toISOString(),
    })

    // redirect check
    maybeRedirect()

    // 2) If event has product_id, fetch products.product_url
    if (ev?.product_id) {
      const { data: prod, error: prodErr } = await supabase
        .schema('games')
        .from('products')
        .select('product_url')
        .eq('id', ev.product_id)
        .single()

      if (prodErr) {
        console.error('Failed to load product:', prodErr)
        imageLoading.value = false
      } else {
        const path = (prod as any)?.product_url as string | null
        imageUrl.value = await toSignedUrl(path)
      }
    } else {
      imageLoading.value = false
    }
  } catch (e: any) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

// 🆕 Fetch profiles for users in this event with status='joined'
async function fetchJoinedUsers() {
  if (!eventId) return
  loadingJoined.value = true
  try {
    const { data: entries, error: entErr } = await supabase
      .schema('games')
      .from('entry')
      .select('user_id')
      .eq('event_id', eventId)
      .eq('status', 'joined')

    if (entErr) {
      console.error('[joined] entry query failed:', entErr)
      joinedUsers.value = []
      return
    }

    const userIds = [...new Set((entries || []).map((e: any) => e.user_id))] as string[]
    if (userIds.length === 0) {
      joinedUsers.value = []
      return
    }

    const { data: users, error: usrErr } = await supabase
      .from('users')
      .select('id, full_name, profile_url')
      .in('id', userIds)

    if (usrErr) {
      console.error('[joined] users query failed:', usrErr)
      joinedUsers.value = []
      return
    }

    const normalized: UserProfile[] = await Promise.all(
      (users || []).map(async (u: any) => {
        const signed = await toSignedAvatar(u.profile_url ?? null)
        return {
          id: u.id,
          full_name: u.full_name ?? null,
          avatar_url: signed,
        }
      })
    )

    normalized.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
    joinedUsers.value = normalized
  } catch (e) {
    console.error('[joined] unexpected:', e)
    joinedUsers.value = []
  } finally {
    loadingJoined.value = false
  }
}

// ===== Your existing delete logic (unchanged) =====
let deleteRan = false
async function deleteEntryIfNeeded() {
  if (deleteRan) return
  deleteRan = true
  try {
    if (!eventId) return
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr) throw userErr
    const userId = userRes.user?.id
    if (!userId) return

    const { error: delErr } = await supabase
      .schema('games')
      .from('entry')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)

    if (delErr) {
      console.error('entry delete failed:', delErr)
      err.value = delErr.message || 'Failed to leave event.'
    }
  } catch (e: any) {
    console.error(e)
    err.value = e?.message || 'Something went wrong.'
  }
}

async function goBack() {
  err.value = ''
  deleting.value = true
  try {
    await deleteEntryIfNeeded()
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push({ name: 'user.minigames' })
    }
  } catch (e: any) {
    console.error(e)
    err.value = e?.message || 'Something went wrong.'
  } finally {
    deleting.value = false
    showConfirm.value = false
  }
}

// ✅ Only delete on generic/back navigations, NOT when going to the game event for same eventId
onBeforeRouteLeave((to: any) => {
  if (suppressDelete.value) return
  if (isGamesEventRoute(to)) return
  void deleteEntryIfNeeded()
})

// Optional native prompt on hard refresh/close only
function beforeUnload(e: BeforeUnloadEvent) {
  if (!deleteRan) {
    e.preventDefault()
    e.returnValue = ''
  }
}

// format helpers
function formatMoney(v: number | null | undefined) {
  if (v === null || v === undefined) return '—'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Number(v))
  } catch {
    return Number(v).toFixed(2)
  }
}
function formatDate(v: string | null | undefined) {
  if (!v) return '—'
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(v))
  } catch {
    return v
  }
}

// 🆕 initials helper for avatar fallback
function initials(name?: string | null) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map(p => p[0]?.toUpperCase() || '').join('') || 'U'
}

/* =========================== 🔴 Realtime additions =========================== */
let realtimeChannel: any | null = null
let realtimeEntryChannel: any | null = null  // 🆕 entry channel for instant reaction
let refreshTimer: number | null = null
const POLL_MS = 10_000
let pollHandle: number | null = null

function scheduleRefresh(delayMs = 250) {
  if (refreshTimer) {
    window.clearTimeout(refreshTimer)
  }
  refreshTimer = window.setTimeout(async () => {
    refreshTimer = null
    console.log('[realtime] scheduleRefresh → fetching event…', new Date().toISOString())
    await Promise.all([
      fetchEventAndImage(),
      fetchJoinedUsers(), // 🆕 also refresh joined users list
    ])
  }, delayMs)
}

function makeRealtimeChannel() {
  if (!eventId) return

  // clean previous
  if (realtimeChannel) {
    try { supabase.removeChannel(realtimeChannel) } catch {}
    realtimeChannel = null
  }

  realtimeChannel = supabase
    .channel(`wa-event-${eventId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: 'waiting-area' },
      },
    })
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'event', filter: `id=eq.${eventId}` },
      (payload: any) => {
        const type = String(payload.eventType || '').toUpperCase()
        console.log('[realtime] change received:', {
          type,
          at: new Date().toISOString(),
          new: payload?.new,
          old: payload?.old,
        })
        try {
          if (type === 'DELETE') {
            err.value = 'This event was removed.'
          } else if (payload.new) {
            // Merge for instant UI while also scheduling a fetch to sync computed fields
            const next = payload.new as Partial<EventRow>
            event.value = { ...(event.value || {} as any), ...next } as EventRow
            console.log('[realtime] merged update → player_count/status:', {
              player_count: event.value.player_count,
              status: event.value.status,
            })

            // ✅ Immediate redirect check using *payload.new* (no extra delay)
            const cap = Number(next.player_cap ?? event.value.player_cap ?? 0)
            const cnt = Number(next.player_count ?? event.value.player_count ?? 0)
            const locked = isLockedStatus(next.status ?? event.value.status)
            if (!redirected.value && ((cap > 0 && cnt >= cap) || locked)) {
              redirected.value = true
              console.log('[redirect] realtime(event) full/locked → navigate now')
              void navigateToGamesEvent()
              return
            }

            // 🔵 Also keep your existing logic
            maybeRedirect()
          }
        } catch (e) {
          console.warn('realtime merge failed', e)
        }
        // Coalesced refetch to keep signed URLs / computed columns fresh
        scheduleRefresh(250)
      },
    )
    .subscribe((status: any, errSub?: any) => {
      console.log('[realtime] channel status:', status, errSub || '')
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setTimeout(() => makeRealtimeChannel(), 1000)
      }
    })
}

/* 🆕 EXTRA realtime: entries table (react even before the event row hits local state) */
function makeRealtimeEntryChannel() {
  if (!eventId) return

  if (realtimeEntryChannel) {
    try { supabase.removeChannel(realtimeEntryChannel) } catch {}
    realtimeEntryChannel = null
  }

  realtimeEntryChannel = supabase
    .channel(`wa-entry-${eventId}`, {
      config: { broadcast: { self: false }, presence: { key: 'waiting-area' } },
    })
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'entry', filter: `event_id=eq.${eventId}` },
      async (payload: any) => {
        console.log('[realtime][entry] change:', payload.eventType, {
          id: payload?.new?.id || payload?.old?.id,
          status: payload?.new?.status,
          at: new Date().toISOString(),
        })

        /* 🆕 If my row just became ready via server, charge once */
        await ensureChargeOnRealtimeReady(payload)

        // Any entry insert/update can affect player_count via your triggers → refresh immediately
        await Promise.all([
          fetchEventAndImage(),
          fetchJoinedUsers(), // 🆕 refresh joined users immediately on entry changes
        ])
        // Safety: re-check after refresh
        maybeRedirect()
      }
    )
    .subscribe((status: any) => {
      console.log('[realtime][entry] status:', status)
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setTimeout(() => makeRealtimeEntryChannel(), 1000)
      }
    })
}

function startPoll() {
  stopPoll()
  pollHandle = window.setInterval(() => {
    console.log('[poll] safety fetch at', new Date().toISOString())
    fetchEventAndImage()
    fetchJoinedUsers() // 🆕 poll users too (cheap + robust)
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
    console.log('[visibility] tab active → refresh')
    scheduleRefresh(0)
  }
}

/* Extra visibility: log when these fields change locally (often due to realtime) */
watch(() => event.value?.player_count, (nv, ov) => {
  if (ov !== undefined && nv !== ov) {
    console.log('[watch] player_count changed:', ov, '→', nv, 'at', new Date().toISOString())
    // 🔵 Check redirect when player_count changes (cap reached)
    maybeRedirect()
  }
})
watch(() => event.value?.status, (nv, ov) => {
  if (ov !== undefined && nv !== ov) {
    console.log('[watch] status changed:', ov, '→', nv, 'at', new Date().toISOString())
    // 🔵 Check redirect when status flips to locked
    maybeRedirect()
  }
})
/* ======================= / Realtime additions (end) ======================== */

onMounted(() => {
  fetchEventAndImage()
  fetchJoinedUsers() // 🆕 initial load
  window.addEventListener('beforeunload', beforeUnload)

  /* Realtime init */
  makeRealtimeChannel()
  makeRealtimeEntryChannel()  // 🆕 NEW: listen on entries for ultra-fast reaction
  startPoll()
  document.addEventListener('visibilitychange', onVisibilityChange)
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnload)

  /* Realtime cleanup */
  if (realtimeChannel) {
    try { supabase.removeChannel(realtimeChannel) } catch {}
    realtimeChannel = null
  }
  if (realtimeEntryChannel) {
    try { supabase.removeChannel(realtimeEntryChannel) } catch {}
    realtimeEntryChannel = null
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
:root {
  --wa-bg: #0b1020;
  --wa-card: #0f1528;
  --wa-border: #212b43;
  --wa-muted: #a3acc2;
  --wa-accent: #7c9cff;
  --wa-accent-2: #52e3b6;
  --wa-danger: #dc3545;
  --wa-chip: #141b33;
  --wa-chip-border: #233054;
  --wa-chip-soft: #101a2e;
}

.waiting-area-root {
  position: relative;
  min-height: 70vh;
  color: #eaf1ff;
  overflow: hidden;
}

/* Neon gradient background + subtle grid */
.wa-aurora {
  position: absolute;
  inset: -20% -10%;
  background:
    radial-gradient(45% 55% at 20% 10%, rgba(124,156,255,0.25), transparent 60%),
    radial-gradient(60% 55% at 80% 30%, rgba(82,227,182,0.18), transparent 60%),
    radial-gradient(50% 60% at 50% 90%, rgba(143,119,255,0.18), transparent 60%);
  filter: blur(30px);
  z-index: 0;
}
.wa-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(80% 60% at 50% 40%, #000 60%, transparent 100%);
  z-index: 0;
}

.wa-card {
  position: relative;
  background: linear-gradient(180deg, rgba(18,26,49,0.9), rgba(15,21,40,0.95));
  border: 1px solid var(--wa-border);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.02);
  z-index: 1;
}
.wa-title { color: #f3f6ff; }
.wa-subtext { color: #f3f6ff; opacity:.8; }
.wa-title-wrap { display: grid; gap: 2px; }

/* Lobby top row */
.wa-lobby-top { display: grid; gap: 10px; }
.wa-lobby-row { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }

.wa-pill {
  background: var(--wa-chip);
  color: #dbe5ff;
  border: 1px solid var(--wa-chip-border);
}
.wa-pill-soft {
  background: var(--wa-chip-soft);
  color: #cdd9ff;
  border: 1px dashed var(--wa-chip-border);
}

/* Progress */
.wa-progress-wrap {
  position: relative;
  height: 12px;
  border-radius: 999px;
  background: #0c1224;
  border: 1px solid #1f2a49;
  overflow: hidden;
}
.wa-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #6e8dff, #52e3b6);
  box-shadow: 0 0 12px rgba(124,156,255,0.5);
  transition: width 420ms ease;
}
.wa-progress-label {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 11px;
  color: #c7d3ff;
  text-shadow: 0 1px 0 rgba(0,0,0,0.4);
}

/* 🆕 Users grid */
.wa-users-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  text-align: left;
}
@media (max-width: 1200px) { .wa-users-grid { grid-template-columns: repeat(5, 1fr); } }
@media (max-width: 992px)  { .wa-users-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 768px)  { .wa-users-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 576px)  { .wa-users-grid { grid-template-columns: repeat(2, 1fr); } }

.wa-user-card {
  background: var(--wa-chip);
  border: 1px solid var(--wa-chip-border);
  border-radius: 12px;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 40px 1fr;
  grid-template-rows: 40px auto;
  align-items: center;
  column-gap: 10px;
}
.wa-avatar {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  width: 40px; height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--wa-border);
  background: #0e1530;
}
.wa-avatar-fallback {
  display: grid;
  place-items: center;
  font-weight: 700;
  letter-spacing: .5px;
  color: #dbe5ff;
}
.wa-username {
  grid-row: 1 / 2;
  grid-column: 2 / 3;
  font-size: 13px;
  color: #eaf1ff;
}
.wa-avatar-skeleton {
  width: 40px; height: 40px; border-radius: 50%;
  border: 1px solid var(--wa-border);
  background: linear-gradient(90deg, #141c36 25%, #0f1a33 37%, #141c36 63%);
  background-size: 400% 100%;
  animation: wa-shimmer 1.4s ease-in-out infinite;
}
.wa-username-skeleton {
  height: 10px; width: 70%;
  border-radius: 6px;
  background: linear-gradient(90deg, #141c36 25%, #0f1a33 37%, #141c36 63%);
  background-size: 400% 100%;
  animation: wa-shimmer 1.4s ease-in-out infinite;
}

/* Circular prize image */
.wa-image-frame {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 180px;
}
.wa-image-circle {
  width: 164px;
  height: 164px;
  border-radius: 50%;
  border: 1px solid var(--wa-border);
  object-fit: cover;
  box-shadow: 0 10px 28px rgba(36, 62, 160, 0.25);
}
.wa-img-skeleton-circle {
  width: 164px;
  height: 164px;
  border-radius: 50%;
  border: 1px solid var(--wa-border);
  background: linear-gradient(90deg, #141c36 25%, #0f1a33 37%, #141c36 63%);
  background-size: 400% 100%;
  animation: wa-shimmer 1.4s ease-in-out infinite;
}
.wa-ring {
  position: absolute;
  width: 200px; height: 200px;
  border-radius: 50%;
  border: 1px dashed rgba(124,156,255,0.35);
  animation: wa-spin 10s linear infinite;
  pointer-events: none;
  z-index: 0;
}
@keyframes wa-spin {
  to { transform: rotate(360deg); }
}
@keyframes wa-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}

/* Spinner */
.wa-spinner-wrap {
  width: 54px; height: 54px; margin: 0 auto; display: grid; place-items: center;
}
.wa-spinner-wrap .spinner-border {
  width: 2.2rem; height: 2.2rem; border-width: 0.22rem;
  color: var(--wa-accent);
  animation: wa-pulse 1.8s ease-in-out infinite;
}
@keyframes wa-pulse {
  0%, 100% { opacity: .9; }
  50% { opacity: .6; }
}

/* Dots */
.wa-dots { display: inline-flex; gap: 6px; }
.wa-dots span {
  width: 6px; height: 6px; background: #7e8cc2; border-radius: 999px; display: inline-block;
  animation: wa-bounce 1.4s infinite;
}
.wa-dots span:nth-child(2) { animation-delay: .12s; }
.wa-dots span:nth-child(3) { animation-delay: .24s; }
@keyframes wa-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: .85; }
  40% { transform: translateY(-5px); opacity: 1; }
}

/* Stat chips grid */
.wa-stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}
@media (max-width: 992px) {
  .wa-stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 576px) {
  .wa-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.wa-stat {
  background: var(--wa-chip);
  border: 1px solid var(--wa-chip-border);
  border-radius: 12px;
  padding: 10px 12px;
  text-align: left;
}
.wa-stat-label {
  font-size: 11px;
  color: #9fb0d9;
  letter-spacing: .3px;
}
.wa-stat-value {
  font-weight: 600;
  color: #eaf1ff;
  margin-top: 2px;
}

/* Meta row */
.wa-meta {
  display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
}
.wa-meta-item {
  background: #0e162b;
  border: 1px dashed #233054;
  color: #c7d3ff;
  border-radius: 999px;
  font-size: 12px;
  padding: 6px 10px;
}
.wa-meta-k { opacity: .8; margin-right: 6px; }

/* Marquee tips */
.wa-tips {
  position: relative;
  height: 28px;
  overflow: hidden;
  border-radius: 999px;
  border: 1px solid #1f2a49;
  background: #0b1124;
}
.wa-tips-track {
  display: inline-flex;
  align-items: center;
  gap: 18px;
  white-space: nowrap;
  padding: 4px 12px;
  animation: wa-marquee 18s linear infinite;
  color: #b6c5ff;
  font-size: 12px;
}
.wa-dot { opacity: .5; padding: 0 8px; }
@keyframes wa-marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

/* Buttons */
.wa-leave-btn {
  border-width: 2px;
  color: #dbe5ff;
  border-color: #263459;
  background: #0d1530;
}
.wa-leave-btn:hover {
  border-color: #3b4e86;
  box-shadow: 0 8px 24px rgba(124, 156, 255, 0.15);
}

/* Modal */
.wa-modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(11,16,32,0.65);
  backdrop-filter: blur(4px);
  display: grid; place-items: center;
  z-index: 1040;
}
.wa-modal {
  position: relative;
  width: min(520px, 92vw);
  border: 1px solid var(--wa-border);
  background: linear-gradient(180deg, #0f172e, #0b1225);
  color: #eaf1ff;
}
.wa-modal-close {
  position: absolute; top: 8px; right: 10px;
  border: 0; background: transparent; color: #9aa6b2; cursor: pointer;
}
</style>
